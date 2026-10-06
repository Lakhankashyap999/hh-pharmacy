import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import {
  CatalogMedicine,
  findCandidates,
  confidenceOf,
  suggestQuantity,
} from '@/lib/rxMatch'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_BYTES = 6 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

// Best-effort per-instance rate limit (protects the AI quota from abuse)
const hits = new Map<string, number[]>()
function rateLimited(ip: string, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > max
}

const PROMPT = `You are an expert pharmacist reading an Indian doctor's prescription (printed or handwritten, English/Hindi).

TASK: Extract EVERY medicine the doctor prescribed. Return ONLY JSON.

STRICT RULES:
- Transcribe each medicine name exactly as written. NEVER invent or "correct" to a different drug. If a word is unreadable, set "legible": false and put your best reading in "written_name" (or "" if nothing).
- Ignore non-medicine lines (diagnosis, lab tests, advice, clinic details, signatures).
- "strength": e.g. "650mg", "500mg/5ml" (empty string if not written).
- "form": tablet | capsule | syrup | injection | ointment | gel | drops | other | "" .
- "dosage": exactly as written, e.g. "1-0-1", "BD", "1 tab twice daily" ("" if none).
- "duration_days": integer if written (e.g. "x 5 days" => 5, "1 week" => 7), else null.
- "total_units": integer number of tablets/capsules ONLY if both dosage frequency per day and duration are clearly written (e.g. 1-0-1 for 5 days => 10). Otherwise null. For syrups/gels/injections use null.
- "generic_hint": the generic salt ONLY if you are certain for that brand, else "".
- "confidence": 0..1 how sure you are of the transcription of that line.

JSON shape:
{
  "is_prescription": boolean,
  "doctor_name": string,
  "patient_name": string,
  "date": string,
  "medicines": [
    { "written_name": string, "strength": string, "form": string, "dosage": string,
      "duration_days": number|null, "total_units": number|null, "generic_hint": string,
      "legible": boolean, "confidence": number }
  ]
}`

interface ExtractedLine {
  written_name?: string
  strength?: string
  form?: string
  dosage?: string
  duration_days?: number | null
  total_units?: number | null
  generic_hint?: string
  legible?: boolean
  confidence?: number
}

function parseJson(text: string): any {
  const cleaned = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1))
    throw new Error('Unparseable AI response')
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.startsWith('your-')) {
      return NextResponse.json(
        {
          error:
            'Prescription scanner is not configured yet. Please call the pharmacist or add medicines manually.',
          code: 'SCANNER_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many scans. Please wait a few minutes and try again.' },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => null)
    const dataUrl: string | undefined = body?.image
    const m = dataUrl?.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/)
    if (!m) return NextResponse.json({ error: 'No prescription image received.' }, { status: 400 })

    const mimeType = m[1]
    const base64 = m[2]
    if (!ALLOWED.includes(mimeType)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP or PDF accepted.' }, { status: 400 })
    }
    if ((base64.length * 3) / 4 > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large. Please upload a smaller photo.' }, { status: 413 })
    }

    // --- 1. AI reads the prescription ---
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    })

    let parsed: any
    try {
      const result = await model.generateContent([
        { inlineData: { mimeType, data: base64 } },
        { text: PROMPT },
      ])
      parsed = parseJson(result.response.text())
    } catch (err: any) {
      console.error('Gemini scan failed:', err?.message || err)
      return NextResponse.json(
        { error: 'Could not read this prescription right now. Please try a clearer photo.' },
        { status: 502 }
      )
    }

    if (parsed?.is_prescription === false) {
      return NextResponse.json(
        {
          error:
            'This does not look like a prescription. Please upload a clear photo of the doctor’s prescription.',
          code: 'NOT_A_PRESCRIPTION',
        },
        { status: 422 }
      )
    }

    const lines: ExtractedLine[] = Array.isArray(parsed?.medicines) ? parsed.medicines : []

    // --- 2. Match each line against the real catalog ---
    const rows = await prisma.medicine.findMany({
      where: { isActive: true },
      include: { batches: { where: { expiryDate: { gt: new Date() } }, select: { currentQuantity: true } } },
    })
    const catalog: CatalogMedicine[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      nameHindi: r.nameHindi,
      genericName: r.genericName,
      brand: r.brand,
      sellingPrice: r.sellingPrice,
      mrp: r.mrp,
      unitType: r.unitType,
      unitsPerPack: r.unitsPerPack,
      requiresPrescription: r.requiresPrescription,
      drugSchedule: r.drugSchedule,
      imageUrl: r.imageUrl,
      stock: r.batches.reduce((s, b) => s + b.currentQuantity, 0),
    }))

    const items = lines
      .filter((l) => (l.written_name || '').trim().length > 1)
      .map((l, idx) => {
        const written = {
          name: (l.written_name || '').trim(),
          strength: l.strength || '',
          genericHint: l.generic_hint || '',
        }
        const candidates = findCandidates(written, catalog, 3)
        const top = candidates[0]
        const aiConf = typeof l.confidence === 'number' ? l.confidence : 0.7
        const legible = l.legible !== false
        let confidence = top ? confidenceOf(top.score) : 'none'
        // never auto-trust an unreadable or low-confidence transcription
        if (top && (!legible || aiConf < 0.5) && confidence === 'high') confidence = 'medium'

        return {
          lineId: idx + 1,
          written: {
            name: written.name,
            strength: written.strength,
            form: l.form || '',
            dosage: l.dosage || '',
            durationDays: l.duration_days ?? null,
            totalUnits: l.total_units ?? null,
            legible,
            aiConfidence: aiConf,
          },
          confidence,
          match: top
            ? {
                ...top.medicine,
                score: Number(top.score.toFixed(2)),
                suggested: suggestQuantity(top.medicine, l.total_units),
              }
            : null,
          alternatives: candidates.slice(1).map((c) => ({
            ...c.medicine,
            score: Number(c.score.toFixed(2)),
            suggested: suggestQuantity(c.medicine, l.total_units),
          })),
        }
      })

    return NextResponse.json({
      doctorName: parsed?.doctor_name || '',
      patientName: parsed?.patient_name || '',
      date: parsed?.date || '',
      items,
    })
  } catch (error) {
    console.error('Prescription scan error:', error)
    return NextResponse.json({ error: 'Scan failed. Please try again.' }, { status: 500 })
  }
}
