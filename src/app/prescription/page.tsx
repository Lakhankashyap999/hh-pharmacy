'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Upload,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Phone,
  MessageCircle,
  ShoppingCart,
  Plus,
  Minus,
  RefreshCw,
  FileText,
  ShieldCheck,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import { useCartStore } from '@/store/cartStore'
import { fileToCompressedDataUrl } from '@/lib/imageCompress'
import { MedicinePackshot } from '@/components/customer/MedicinePackshot'

type Suggested = { quantityType: 'full_pack' | 'loose_units'; quantity: number; looseUnitCount?: number }

interface CatalogHit {
  id: number
  name: string
  brand?: string | null
  genericName?: string | null
  sellingPrice: number
  mrp: number
  unitType: string
  unitsPerPack: number
  requiresPrescription: boolean
  drugSchedule: string
  imageUrl?: string | null
  stock: number
  score: number
  suggested: Suggested
}

interface ScanItem {
  lineId: number
  written: {
    name: string
    strength: string
    form: string
    dosage: string
    durationDays: number | null
    totalUnits: number | null
    legible: boolean
    aiConfidence: number
  }
  confidence: 'high' | 'medium' | 'low' | 'none'
  match: CatalogHit | null
  alternatives: CatalogHit[]
}

interface LineState {
  selectedId: number | null
  checked: boolean
  quantity: number // packs, or loose tablets when loose
  loose: boolean
}

const CONF_STYLE: Record<ScanItem['confidence'], { label: string; cls: string }> = {
  high: { label: 'Exact match', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  medium: { label: 'Likely match', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  low: { label: 'Please verify', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  none: { label: 'Not in catalog', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
}

export default function PrescriptionPage() {
  const router = useRouter()
  const { items: cartItems, addItem, removeItem, updateLooseUnits, setPrescription } = useCartStore()

  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    doctorName: string
    patientName: string
    date: string
    items: ScanItem[]
  } | null>(null)
  const [lines, setLines] = useState<Record<number, LineState>>({})

  const reset = () => {
    setPreview(null)
    setResult(null)
    setError(null)
    setLines({})
    setIsPdf(false)
  }

  const hitFor = (item: ScanItem, id: number | null): CatalogHit | null => {
    if (id === null) return null
    if (item.match?.id === id) return item.match
    return item.alternatives.find((a) => a.id === id) || null
  }

  const handleFile = async (file?: File | null) => {
    if (!file) return
    setError(null)
    setResult(null)
    setScanning(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      setPreview(dataUrl)
      setIsPdf(dataUrl.startsWith('data:application/pdf'))

      const res = await fetch('/api/prescription/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not scan this prescription.')
        return
      }

      const scanned = data.items as ScanItem[]
      const initial: Record<number, LineState> = {}
      for (const it of scanned) {
        const m = it.match
        const sug = m?.suggested
        initial[it.lineId] = {
          selectedId: m ? m.id : null,
          checked: !!m && m.stock > 0 && (it.confidence === 'high' || it.confidence === 'medium'),
          quantity: sug ? (sug.quantityType === 'loose_units' ? sug.looseUnitCount || 1 : sug.quantity) : 1,
          loose: sug?.quantityType === 'loose_units',
        }
      }
      setLines(initial)
      setResult(data)
      if (scanned.length === 0) {
        setError('No medicines could be read from this image. Try a clearer, well-lit photo.')
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  const updateLine = (lineId: number, patch: Partial<LineState>) =>
    setLines((prev) => ({ ...prev, [lineId]: { ...prev[lineId], ...patch } }))

  const selectMedicine = (item: ScanItem, id: number | null) => {
    const hit = hitFor(item, id)
    const sug = hit?.suggested
    updateLine(item.lineId, {
      selectedId: id,
      checked: !!hit && hit.stock > 0,
      quantity: sug ? (sug.quantityType === 'loose_units' ? sug.looseUnitCount || 1 : sug.quantity) : 1,
      loose: sug?.quantityType === 'loose_units',
    })
  }

  const selectedCount = result
    ? result.items.filter((it) => {
        const st = lines[it.lineId]
        const hit = st ? hitFor(it, st.selectedId) : null
        return st?.checked && hit && hit.stock > 0
      }).length
    : 0

  const addSelectedToCart = () => {
    if (!result || !preview) return
    let added = 0
    for (const it of result.items) {
      const st = lines[it.lineId]
      const hit = st ? hitFor(it, st.selectedId) : null
      if (!st?.checked || !hit || hit.stock <= 0) continue
      if (hit.drugSchedule === 'X') {
        toast.error(`${hit.name} is Schedule X – available only in the shop.`)
        continue
      }

      // replace any existing entry so quantities are exactly what the prescription says
      if (cartItems.some((c) => c.id === hit.id)) removeItem(hit.id)

      addItem({
        id: hit.id,
        name: hit.name,
        brand: hit.brand || '',
        price: hit.sellingPrice,
        mrp: hit.mrp,
        unitType: hit.unitType,
        unitsPerPack: hit.unitsPerPack,
        requiresPrescription: hit.requiresPrescription,
        quantity: st.loose ? 1 : st.quantity,
        quantityType: st.loose ? 'loose_units' : 'full_pack',
        looseUnitCount: st.loose ? st.quantity : undefined,
        imageUrl: hit.imageUrl,
      })
      added++
    }

    if (added === 0) {
      toast.error('Select at least one in-stock medicine to add.')
      return
    }
    setPrescription(preview)
    toast.success(`${added} medicine${added > 1 ? 's' : ''} added & prescription attached ✅`)
    router.push('/cart')
  }

  const waText = (it: ScanItem) =>
    encodeURIComponent(
      `Hello H&H Pharmacy, I need this medicine from my prescription: ${it.written.name} ${it.written.strength}`.trim()
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-4">
        {/* Title */}
        <div>
          <h1 className="font-poppins font-extrabold text-xl sm:text-3xl text-gray-900 flex items-center gap-2">
            <ScanLine className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" />
            Upload Prescription
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Photo upload karo — hum dawaiyan padh ke aapke cart mein daal denge. Aap confirm karke hi order hoga.
          </p>
        </div>

        {/* Upload card */}
        {!preview && !scanning && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-teal-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 cursor-pointer"
              >
                <Camera className="w-7 h-7" />
                Take Photo
              </button>
              <button
                onClick={() => galleryRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl bg-white border-2 border-dashed border-teal-300 text-teal-700 font-bold text-xs sm:text-sm active:scale-95 cursor-pointer"
              >
                <Upload className="w-7 h-7" />
                Choose from Gallery
              </button>
            </div>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />

            <ul className="text-[11px] sm:text-xs text-gray-500 space-y-1">
              <li>✔ Poora prescription frame mein rakho, achhi roshni mein</li>
              <li>✔ Photo seedhi (tedhi nahi) aur blur-free ho</li>
              <li>✔ JPG / PNG / PDF supported</li>
            </ul>

            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-900">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
              <span>
                Aapka prescription sirf order verify karne ke liye use hota hai. Registered Pharmacist
                Mr. Ashwani Kumar har prescription check karte hain.
              </span>
            </div>
          </div>
        )}

        {/* Scanning state */}
        {scanning && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-6 text-center space-y-4">
            {preview && !isPdf && (
              <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-gray-200">
                <img src={preview} alt="Prescription" className="w-full max-h-64 object-contain bg-gray-50" />
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-teal-500 shadow-[0_0_12px_2px_rgba(20,184,166,0.8)]"
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-teal-700">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Prescription padhi ja rahi hai...
            </div>
            <p className="text-[11px] text-gray-500">10–20 seconds lag sakte hain</p>
          </div>
        )}

        {/* Error */}
        {error && !scanning && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-red-800 flex items-start gap-2">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={reset}
                className="px-3 py-2 bg-white border border-red-200 text-red-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Try another photo
              </button>
              {preview && (
                <button
                  onClick={() => {
                    setPrescription(preview)
                    toast.success('Prescription cart mein attach ho gayi! Pharmacist verify karenge.')
                    router.push('/cart')
                  }}
                  className="px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-teal-700 shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Cart mein attach karein &rarr;
                </button>
              )}
              <a
                href="https://wa.me/917827558443?text=Hello%20H%26H%20Pharmacy%2C%20I%20want%20to%20send%20my%20prescription"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Send on WhatsApp
              </a>
              <a
                href="tel:7827558443"
                className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Call Pharmacist
              </a>
            </div>
          </div>
        )}

        {/* Results */}
        {result && result.items.length > 0 && !scanning && (
          <div className="space-y-3 pb-28">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3 sm:p-4 flex items-start gap-3">
              {preview && !isPdf ? (
                <img src={preview} alt="" className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl border border-gray-200 shrink-0" />
              ) : (
                <div className="w-16 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="min-w-0 flex-1 text-xs space-y-0.5">
                <p className="font-bold text-sm text-gray-900">
                  {result.items.length} medicine{result.items.length > 1 ? 's' : ''} mili
                </p>
                {result.doctorName && <p className="text-gray-600 truncate">Doctor: {result.doctorName}</p>}
                {result.patientName && <p className="text-gray-600 truncate">Patient: {result.patientName}</p>}
                {result.date && <p className="text-gray-500">Date: {result.date}</p>}
                <button
                  onClick={reset}
                  className="mt-1 text-teal-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Scan another
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] sm:text-xs text-amber-900 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Handwriting padhne mein galti ho sakti hai. Cart mein daalne se pehle har dawai{' '}
                <b>apne prescription se milakar</b> check kar lo. Order ke baad pharmacist bhi verify karega.
              </span>
            </div>

            <AnimatePresence>
              {result.items.map((it, i) => {
                const st = lines[it.lineId]
                const hit = st ? hitFor(it, st.selectedId) : null
                const conf = CONF_STYLE[hit ? it.confidence : 'none']
                const outOfStock = !!hit && hit.stock <= 0
                const options = [it.match, ...it.alternatives].filter(Boolean) as CatalogHit[]

                return (
                  <motion.div
                    key={it.lineId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl border shadow-xs p-3 sm:p-4 space-y-3 ${
                      st?.checked ? 'border-teal-300 ring-1 ring-teal-100' : 'border-gray-100'
                    }`}
                  >
                    {/* Written line */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Prescription mein likha</p>
                        <p className="font-bold text-sm text-gray-900 break-words">
                          {it.written.name}
                          {it.written.strength ? ` ${it.written.strength}` : ''}
                          {!it.written.legible && (
                            <span className="ml-1.5 text-[10px] font-bold text-orange-600">(⚠ unclear)</span>
                          )}
                        </p>
                        {(it.written.dosage || it.written.durationDays) && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {it.written.dosage}
                            {it.written.durationDays ? ` • ${it.written.durationDays} days` : ''}
                            {it.written.totalUnits ? ` • ≈${it.written.totalUnits} units` : ''}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${conf.cls}`}>
                        {conf.label}
                      </span>
                    </div>

                    {/* Matched medicine */}
                    {options.length > 0 ? (
                      <div className="space-y-2">
                        <div className="space-y-1.5">
                          {options.map((opt) => {
                            const active = st?.selectedId === opt.id
                            return (
                              <button
                                key={opt.id}
                                onClick={() => selectMedicine(it, opt.id)}
                                className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors cursor-pointer ${
                                  active ? 'border-teal-500 bg-teal-50/60' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                                    active ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                                  }`}
                                />
                                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                                  <MedicinePackshot
                                    name={opt.name}
                                    brand={opt.brand}
                                    genericName={opt.genericName}
                                    unitType={opt.unitType}
                                    unitsPerPack={opt.unitsPerPack}
                                    imageUrl={opt.imageUrl}
                                    size="xs"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-gray-900 leading-tight">{opt.name}</p>
                                  <p className="text-[10px] text-gray-400 truncate">
                                    {opt.genericName || opt.brand}
                                    {opt.stock <= 0 && <span className="text-red-500 font-bold"> • Out of stock</span>}
                                  </p>
                                </div>
                                <p className="text-xs font-extrabold text-teal-700 shrink-0">₹{opt.sellingPrice}</p>
                              </button>
                            )
                          })}
                          <button
                            onClick={() => selectMedicine(it, null)}
                            className={`w-full text-left p-2 rounded-xl border text-[11px] font-semibold cursor-pointer ${
                              st?.selectedId === null
                                ? 'border-gray-400 bg-gray-100 text-gray-800'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            ✖ Ye wali dawai nahi chahiye / galat match
                          </button>
                        </div>

                        {hit && !outOfStock && (
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!st?.checked}
                                onChange={(e) => updateLine(it.lineId, { checked: e.target.checked })}
                                className="w-4 h-4 accent-teal-600"
                              />
                              Cart mein daalo
                            </label>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-500 font-semibold">
                                {st?.loose ? 'Tablets' : hit.unitType === 'strip' ? 'Strips' : 'Qty'}
                              </span>
                              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-1.5 py-1">
                                <button
                                  onClick={() => updateLine(it.lineId, { quantity: Math.max(1, (st?.quantity || 1) - 1) })}
                                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold w-6 text-center">{st?.quantity}</span>
                                <button
                                  onClick={() =>
                                    updateLine(it.lineId, {
                                      quantity: Math.min(
                                        st?.loose ? hit.unitsPerPack : 20,
                                        (st?.quantity || 1) + 1
                                      ),
                                    })
                                  }
                                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {hit?.requiresPrescription && (
                          <p className="text-[10px] text-orange-700 font-semibold">
                            📋 Rx medicine — aapka prescription order ke saath attach hoga
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                        <p className="text-xs text-gray-700 font-semibold">
                          Ye dawai hamare online catalog mein nahi mili. Shop mein ho sakti hai — pharmacist se pooch lo.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`https://wa.me/917827558443?text=${waText(it)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3 h-3" /> WhatsApp pe poocho
                          </a>
                          <Link
                            href={`/medicines?search=${encodeURIComponent(it.written.name)}`}
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5"
                          >
                            <Search className="w-3 h-3" /> Khud dhoondho
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Sticky action bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:p-4">
              <div className="max-w-3xl mx-auto flex items-center gap-3">
                <div className="text-xs min-w-0">
                  <p className="font-bold text-gray-900">{selectedCount} selected</p>
                  <p className="text-[10px] text-gray-500">Cart mein review ke baad hi order hoga</p>
                </div>
                <button
                  onClick={addSelectedToCart}
                  disabled={selectedCount === 0}
                  className="ml-auto flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 text-white font-bold text-xs sm:text-sm shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
