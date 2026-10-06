/**
 * Matches a medicine name read from a prescription against the pharmacy catalog.
 * Pure functions, no I/O.
 */

export interface CatalogMedicine {
  id: number
  name: string
  nameHindi?: string | null
  genericName?: string | null
  brand?: string | null
  sellingPrice: number
  mrp: number
  unitType: string
  unitsPerPack: number
  requiresPrescription: boolean
  drugSchedule: string
  imageUrl?: string | null
  stock: number
}

export interface MatchCandidate {
  medicine: CatalogMedicine
  score: number // 0..1
}

const NOISE_WORDS = new Set([
  'tab', 'tablet', 'tablets', 'cap', 'capsule', 'capsules', 'syp', 'syrup', 'susp', 'suspension',
  'inj', 'injection', 'oint', 'ointment', 'gel', 'cream', 'drop', 'drops', 'strip', 'bottle',
  'ml', 'mg', 'gm', 'g', 'mcg', 'iu', 'tabs', 'caps', 'pack', 'of', 'the', 'w', 'v', 'sr', 'xr', 'er',
])

export function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(' ')
    .filter((t) => t && !NOISE_WORDS.has(t))
}

function nameTokens(s: string): string[] {
  return tokens(s).filter((t) => !/^\d+(\.\d+)?$/.test(t))
}

function numbers(s: string): string[] {
  return (normalize(s).match(/\d+(\.\d+)?/g) || []).map((n) => String(parseFloat(n)))
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const prev = new Array(b.length + 1)
  const cur = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j]
  }
  return prev[b.length]
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0
  const maxLen = Math.max(a.length, b.length)
  return 1 - levenshtein(a, b) / maxLen
}

/** Best similarity between any token of `query` and any token of `target`, averaged over query tokens. */
function tokenSetScore(queryTokens: string[], targetTokens: string[]): number {
  if (!queryTokens.length || !targetTokens.length) return 0
  let total = 0
  for (const q of queryTokens) {
    let best = 0
    for (const t of targetTokens) {
      let s = similarity(q, t)
      // prefix match (e.g. "dolo" vs "dolo650" / "paracetamol" vs "paracetamo")
      if (q.length >= 4 && (t.startsWith(q) || q.startsWith(t))) s = Math.max(s, 0.9)
      if (s > best) best = s
    }
    total += best
  }
  return total / queryTokens.length
}

export function scoreMatch(
  written: { name: string; strength?: string | null; genericHint?: string | null },
  med: CatalogMedicine
): number {
  const qName = nameTokens(written.name)
  const qGeneric = written.genericHint ? nameTokens(written.genericHint) : []
  const qNums = numbers(`${written.name} ${written.strength || ''}`)

  const medNameTokens = nameTokens(med.name)
  const medBrandTokens = nameTokens(med.brand || '')
  const medGenericTokens = nameTokens(med.genericName || '')

  const byName = tokenSetScore(qName, medNameTokens)
  const byBrand = tokenSetScore(qName, medBrandTokens)
  const byGenericWritten = tokenSetScore(qName, medGenericTokens)
  const byGenericHint = qGeneric.length ? tokenSetScore(qGeneric, medGenericTokens) : 0

  let score = Math.max(byName, byBrand, byGenericWritten * 0.95, byGenericHint * 0.85)

  // Strength agreement (e.g. 500 vs 650). Penalise when both sides state a different strength.
  const medNums = numbers(`${med.name} ${med.genericName || ''}`)
  if (qNums.length && medNums.length) {
    const agree = qNums.some((n) => medNums.includes(n))
    score = agree ? Math.min(1, score + 0.05) : Math.min(score * 0.8, 0.69)
  }

  return Math.max(0, Math.min(1, score))
}

export function findCandidates(
  written: { name: string; strength?: string | null; genericHint?: string | null },
  catalog: CatalogMedicine[],
  limit = 3
): MatchCandidate[] {
  return catalog
    .map((medicine) => ({ medicine, score: scoreMatch(written, medicine) }))
    .filter((c) => c.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export type Confidence = 'high' | 'medium' | 'low' | 'none'

export function confidenceOf(score: number): Confidence {
  if (score >= 0.85) return 'high'
  if (score >= 0.7) return 'medium'
  if (score >= 0.5) return 'low'
  return 'none'
}

/** Turn a prescribed unit count into a cart-friendly quantity. */
export function suggestQuantity(
  med: Pick<CatalogMedicine, 'unitType' | 'unitsPerPack'>,
  totalUnits: number | null | undefined
): { quantityType: 'full_pack' | 'loose_units'; quantity: number; looseUnitCount?: number } {
  const isStrip = med.unitType === 'strip' && med.unitsPerPack > 1
  if (!totalUnits || totalUnits < 1) return { quantityType: 'full_pack', quantity: 1 }
  if (!isStrip) return { quantityType: 'full_pack', quantity: 1 }
  if (totalUnits >= med.unitsPerPack) {
    return { quantityType: 'full_pack', quantity: Math.ceil(totalUnits / med.unitsPerPack) }
  }
  return { quantityType: 'loose_units', quantity: 1, looseUnitCount: Math.max(1, Math.round(totalUnits)) }
}
