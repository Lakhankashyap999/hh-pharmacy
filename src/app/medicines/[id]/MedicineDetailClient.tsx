'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  ShieldCheck,
  Truck,
  ArrowLeft,
  FileText,
  Plus,
  Minus,
  MessageSquare,
  Building,
  Heart,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import { useSession, signIn } from 'next-auth/react'
import { MedicinePackshot } from '@/components/customer/MedicinePackshot'

interface Medicine {
  id: number
  name: string
  nameHindi?: string | null
  genericName?: string | null
  brand?: string | null
  manufacturer?: string | null
  description?: string | null
  usageInstructions?: string | null
  sideEffects?: string | null
  mrp: number
  sellingPrice: number
  discountPercent: number
  unitType: string
  unitsPerPack: number
  drugSchedule: string
  isNarcotic: boolean
  requiresPrescription: boolean
  imageUrl?: string | null
  category?: { id: number; name: string; color?: string | null } | null
  batches: { id: number; batchNumber: string; currentQuantity: number; expiryDate: Date }[]
  reviews: {
    id: number
    rating: number
    title?: string | null
    comment?: string | null
    isVerifiedPurchase: boolean
    createdAt: Date
    adminReply?: string | null
    user: { name?: string | null; image?: string | null }
  }[]
}

export default function MedicineDetailClient({ medicine }: { medicine: Medicine }) {
  const { data: session } = useSession()
  const addToCart = useCartStore((s) => s.addItem)

  // Dynamic Pharmaceutical Showcase Views
  const slides = [
    { id: 'packshot', label: '3D Packshot', icon: '📦' },
    { id: 'salt', label: 'Salt Formula', icon: '🧬' },
    { id: 'schedule', label: 'Drug Schedule', icon: '⚖️' },
    { id: 'storage', label: 'Storage & Dispensing', icon: '🏪' },
  ]

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  // Mode: full pack vs loose unit
  const isStripOrPack = medicine.unitType === 'strip' && medicine.unitsPerPack > 1
  const [buyMode, setBuyMode] = useState<'full_pack' | 'loose_units'>('full_pack')
  const [packQuantity, setPackQuantity] = useState(1)
  const [looseUnits, setLooseUnits] = useState(4) // default 4 tablets
  const [activeTab, setActiveTab] = useState<'about' | 'usage' | 'safety' | 'reviews'>('about')

  // Review Form state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Stock calculation
  const totalUnits = (medicine.batches || []).reduce((sum, b) => sum + b.currentQuantity, 0)
  const fullPacksAvailable = Math.floor(totalUnits / medicine.unitsPerPack)
  const looseUnitsAvailable = totalUnits % medicine.unitsPerPack
  const isOutOfStock = totalUnits === 0

  // Per tablet / unit calculation
  const pricePerUnit = medicine.sellingPrice / medicine.unitsPerPack
  const calculatedTotal =
    buyMode === 'full_pack'
      ? medicine.sellingPrice * packQuantity
      : pricePerUnit * looseUnits

  const avgRating =
    medicine.reviews && medicine.reviews.length > 0
      ? medicine.reviews.reduce((sum, r) => sum + r.rating, 0) / medicine.reviews.length
      : 4.8

  const handleAddToCart = () => {
    if (isOutOfStock) return
    if (medicine.drugSchedule === 'X') {
      toast.error('Schedule X narcotic medicine: In-person visit with doctor prescription required!')
      return
    }

    if (buyMode === 'full_pack') {
      addToCart({
        id: medicine.id,
        name: medicine.name,
        brand: medicine.brand || '',
        price: medicine.sellingPrice,
        mrp: medicine.mrp,
        unitType: medicine.unitType,
        unitsPerPack: medicine.unitsPerPack,
        requiresPrescription: medicine.requiresPrescription,
        quantity: packQuantity,
        quantityType: 'full_pack',
        imageUrl: medicine.imageUrl,
      })
      toast.success(`${packQuantity} strip(s) of ${medicine.name} added to cart! 🛒`)
    } else {
      addToCart({
        id: medicine.id,
        name: medicine.name,
        brand: medicine.brand || '',
        price: medicine.sellingPrice,
        mrp: medicine.mrp,
        unitType: medicine.unitType,
        unitsPerPack: medicine.unitsPerPack,
        requiresPrescription: medicine.requiresPrescription,
        quantity: 1,
        quantityType: 'loose_units',
        looseUnitCount: looseUnits,
        imageUrl: medicine.imageUrl,
      })
      toast.success(`${looseUnits} loose tablet(s) of ${medicine.name} added! 💊`)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to write a review')
      signIn()
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (session.user as any)?.id || session.user?.email || 'guest_user',
          medicineId: medicine.id,
          rating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      })
      if (res.ok) {
        toast.success('Review submitted! It will appear once approved by admin.', { duration: 4000 })
        setShowReviewModal(false)
        setReviewTitle('')
        setReviewComment('')
      } else {
        toast.error('Failed to submit review')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
        <Link href="/medicines" className="flex items-center gap-1 hover:text-teal-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> All Medicines
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-44 sm:max-w-none">{medicine.name}</span>
      </div>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 mb-8 sm:mb-12">
        {/* Left column: Image Carousel / Slider & Quick Badges (5 cols) */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          {/* Main Slide Window with Glow */}
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs flex items-center justify-center min-h-[280px] sm:min-h-[360px] glow-card glow-card-ambient overflow-hidden group">
            {medicine.discountPercent > 0 && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-teal-600 text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-2xs">
                {medicine.discountPercent}% DISCOUNT
              </div>
            )}

            {/* Prev/Next arrows */}
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-white z-20 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-white z-20 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Slide Content */}
            <AnimatePresence mode="wait">
              {currentSlideIndex === 0 && (
                <motion.div
                  key="packshot"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex items-center justify-center"
                >
                  <MedicinePackshot
                    name={medicine.name}
                    brand={medicine.brand}
                    genericName={medicine.genericName}
                    unitType={medicine.unitType}
                    unitsPerPack={medicine.unitsPerPack}
                    drugSchedule={medicine.drugSchedule}
                    categoryName={medicine.category?.name}
                    categoryColor={medicine.category?.color}
                    imageUrl={medicine.imageUrl}
                    size="xl"
                  />
                </motion.div>
              )}

              {currentSlideIndex === 1 && (
                <motion.div
                  key="salt"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm bg-gradient-to-br from-teal-50 to-white border border-teal-200/80 rounded-2xl p-5 text-left space-y-3"
                >
                  <div className="flex items-center gap-2 text-teal-800">
                    <span className="text-xl">🧬</span>
                    <h4 className="font-poppins font-bold text-sm text-gray-900">Active Salt Composition</h4>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-teal-100 shadow-3xs space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Generic Salt Molecule</p>
                    <p className="font-mono font-bold text-sm text-teal-900">{medicine.genericName || medicine.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Brand</p>
                      <p className="font-bold text-gray-800">{medicine.brand || 'Standard'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase font-bold">Manufacturer</p>
                      <p className="font-bold text-gray-800 truncate">{medicine.manufacturer || 'Licensed Indian Pharma'}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSlideIndex === 2 && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm bg-gradient-to-br from-red-50 to-white border border-red-200/80 rounded-2xl p-5 text-left space-y-3"
                >
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="text-xl">⚖️</span>
                    <h4 className="font-poppins font-bold text-sm text-gray-900">Drug Law Classification</h4>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-red-100 shadow-3xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Schedule Category</span>
                      <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        Schedule {medicine.drugSchedule}
                      </span>
                    </div>
                    <p className="text-xs text-red-950 font-medium">
                      {medicine.drugSchedule === 'OTC'
                        ? 'Over The Counter: No doctor prescription required by Indian Law.'
                        : 'Doctor Prescription strictly required. Dispensed under qualified pharmacist supervision.'}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-600">
                    <p>🏪 <strong>Retail DL:</strong> RLF20UP2025007813 / RLF21UP2025007766</p>
                    <p>👨‍⚕️ <strong>Pharmacist:</strong> Mr. Ashwani Kumar (B.Pharma)</p>
                  </div>
                </motion.div>
              )}

              {currentSlideIndex === 3 && (
                <motion.div
                  key="storage"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-5 text-left space-y-3"
                >
                  <div className="flex items-center gap-2 text-teal-800">
                    <span className="text-xl">🏪</span>
                    <h4 className="font-poppins font-bold text-sm text-gray-900">Packaging &amp; Storage</h4>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-3xs space-y-1 text-xs">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Retail Unit Packing</p>
                    <p className="font-bold text-gray-900">
                      {medicine.unitsPerPack} {medicine.unitType === 'strip' ? 'Tablets / Strip' : `${medicine.unitType}s`}
                    </p>
                    <p className="text-teal-700 font-semibold pt-1">
                      ✅ Loose tablets available on request at counter
                    </p>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-[11px] text-amber-900">
                    <p className="font-bold">🌡️ Storage Instructions:</p>
                    <p>Store in a cool, dry place below 25°C. Keep protected from moisture and direct sunlight.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slide Label Pill */}
            <span className="absolute bottom-3 right-4 text-[10px] font-bold bg-gray-900/80 text-white px-2.5 py-0.5 rounded-full backdrop-blur-xs z-20">
              {slides[currentSlideIndex].label} ({currentSlideIndex + 1}/{slides.length})
            </span>
          </div>

          {/* Interactive Navigation Thumbnail Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`p-2 rounded-2xl border-2 transition-all bg-white text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-2 ring-teal-100'
                    : 'border-gray-200 hover:border-gray-300 opacity-80'
                }`}
              >
                <span className="text-base">{s.icon}</span>
                <span className="text-[10px] font-bold text-gray-800 leading-tight truncate w-full">
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Info Points */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
              <ShieldCheck className="w-4 h-4 text-teal-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-800">100% Genuine</p>
              <p className="text-[10px] text-gray-500">Certified Batch</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
              <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1 fill-amber-500" />
              <p className="text-xs font-bold text-gray-800">60 Min Delivery</p>
              <p className="text-[10px] text-gray-500">Ghaziabad Zone</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
              <Building className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-gray-800">Shop Pickup</p>
              <p className="text-[10px] text-gray-500">Ghookna Mode</p>
            </div>
          </div>
        </div>

        {/* Right column: Medicine Info, Buying Logic & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {medicine.drugSchedule === 'OTC' ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  ✅ Over The Counter (No Rx Needed)
                </span>
              ) : medicine.drugSchedule === 'X' ? (
                <span className="bg-red-100 text-red-800 border border-red-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ⛔ Schedule X (In-Person Shop Only)
                </span>
              ) : (
                <span className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Doctor Prescription (Rx Required)
                </span>
              )}

              {medicine.brand && (
                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Brand: {medicine.brand}
                </span>
              )}
            </div>

            <h1 className="font-poppins font-extrabold text-xl sm:text-2xl md:text-3xl text-gray-900 leading-tight">
              {medicine.name}
            </h1>

            {medicine.nameHindi && (
              <p className="font-hindi text-sm sm:text-base text-teal-700 font-bold mt-0.5">
                {medicine.nameHindi}
              </p>
            )}

            {medicine.genericName && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Active Salt Composition:{' '}
                <span className="font-semibold text-gray-800">{medicine.genericName}</span>
              </p>
            )}

            {medicine.manufacturer && (
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Manufactured by: {medicine.manufacturer}</p>
            )}

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-800">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-500">
                ({medicine.reviews?.length || 1} verified customer review{(medicine.reviews?.length || 1) === 1 ? '' : 's'})
              </span>
            </div>
          </div>

          {/* Pricing Banner */}
          <div className="bg-teal-50/70 border border-teal-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-poppins font-extrabold text-2xl sm:text-3xl text-gray-900">
                  ₹{medicine.sellingPrice.toFixed(0)}
                </span>
                {medicine.discountPercent > 0 && (
                  <span className="text-gray-400 text-sm sm:text-base line-through">₹{medicine.mrp.toFixed(0)}</span>
                )}
                <span className="text-[10px] sm:text-xs text-teal-800 font-bold bg-white px-2 py-0.5 rounded-md shadow-3xs">
                  {medicine.discountPercent}% OFF
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-600 mt-1">
                Inclusive of all taxes. (Per {medicine.unitType} of {medicine.unitsPerPack} units ≈ ₹{pricePerUnit.toFixed(1)}/unit)
              </p>
            </div>

            {/* Stock status tag */}
            <div>
              {isOutOfStock ? (
                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl font-semibold text-xs">
                  <XCircle className="w-3.5 h-3.5" /> Out of Stock
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl font-bold text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    In Stock ({fullPacksAvailable > 0 ? `${fullPacksAvailable} full strips` : ''}
                    {looseUnitsAvailable > 0 ? ` + ${looseUnitsAvailable} loose tablets` : ''})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Buying Selector (Full Pack vs Loose Tablet Solver) */}
          {isStripOrPack && !isOutOfStock && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-3 sm:p-4 shadow-3xs space-y-2.5 sm:space-y-3">
              <p className="font-poppins font-bold text-xs text-gray-900 flex items-center justify-between">
                <span>Select Purchase Mode:</span>
                <span className="text-[10px] sm:text-[11px] text-teal-700 font-semibold">Loose tablet flexibility available!</span>
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Full Strip Button */}
                <button
                  type="button"
                  onClick={() => setBuyMode('full_pack')}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                    buyMode === 'full_pack'
                      ? 'border-teal-500 bg-teal-50/60 shadow-xs ring-2 ring-teal-500/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-bold text-xs text-gray-900">
                    Full Strip ({medicine.unitsPerPack} Tabs)
                  </p>
                  <p className="text-xs text-teal-700 font-extrabold mt-0.5">₹{medicine.sellingPrice}</p>
                </button>

                {/* Loose Units Button */}
                <button
                  type="button"
                  onClick={() => setBuyMode('loose_units')}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer ${
                    buyMode === 'loose_units'
                      ? 'border-teal-500 bg-teal-50/60 shadow-xs ring-2 ring-teal-500/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-bold text-xs text-gray-900">Loose Tablets</p>
                  <p className="text-xs text-teal-700 font-extrabold mt-0.5">
                    ₹{pricePerUnit.toFixed(1)} / tab
                  </p>
                </button>
              </div>

              {/* Quantity Counter */}
              <div className="pt-2 border-t border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-semibold">
                    {buyMode === 'full_pack' ? 'Number of Strips:' : 'Number of Tablets required:'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (buyMode === 'full_pack') {
                          setPackQuantity((q) => Math.max(1, q - 1))
                        } else {
                          setLooseUnits((u) => Math.max(1, u - 1))
                        }
                      }}
                      className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer shadow-3xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    {buyMode === 'full_pack' ? (
                      <span className="font-bold text-sm text-gray-900 w-10 text-center">
                        {packQuantity}
                      </span>
                    ) : (
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="1"
                          max={medicine.unitsPerPack}
                          value={looseUnits}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            if (!isNaN(val) && val >= 1) {
                              setLooseUnits(Math.min(medicine.unitsPerPack, val))
                            }
                          }}
                          className="w-12 text-center font-bold text-sm text-gray-900 border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-teal-500 font-mono"
                        />
                        <span className="text-[10px] text-gray-500 ml-1 font-semibold">tabs</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (buyMode === 'full_pack') {
                          setPackQuantity((q) => q + 1)
                        } else {
                          setLooseUnits((u) => Math.min(medicine.unitsPerPack, u + 1))
                        }
                      }}
                      className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 cursor-pointer shadow-3xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Chips for loose units */}
                {buyMode === 'loose_units' && (
                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-950">Quick Select Tablets:</span>
                      <span className="text-amber-800 font-medium">Doctor Dose Shortcuts</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 8, 10].filter((n) => n <= medicine.unitsPerPack).map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setLooseUnits(count)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            looseUnits === count
                              ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-100 hover:border-amber-300'
                          }`}
                        >
                          {count} {count === 1 ? 'Goli' : 'Goliyaan'}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-amber-800 pt-0.5">
                      💡 Jitni dawai ki zaroorat ho sirf utni hi lo — pure patte ke paise mat do!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {medicine.drugSchedule === 'X' ? (
              <a
                href="tel:7827558443"
                className="flex-1 bg-red-600 text-white font-bold py-3.5 px-6 rounded-2xl text-center hover:bg-red-700 transition-colors shadow-sm"
              >
                📞 Call Shop to Inquire (7827558443)
              </a>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock
                  ? 'Out of Stock'
                  : `Add to Cart • ₹${calculatedTotal.toFixed(0)}`}
              </button>
            )}

            <button
              type="button"
              onClick={() => toast.success('Added to your Wishlist!')}
              className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section for detailed medical info */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden mb-12">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { id: 'about', label: '📖 Description' },
            { id: 'usage', label: '💊 How to Use' },
            { id: 'safety', label: '⚠️ Side Effects & Safety' },
            { id: 'reviews', label: `⭐ Reviews (${medicine.reviews?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600 bg-teal-50/30'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'about' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-poppins font-bold text-base text-gray-900">About this medicine</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {medicine.description || 'No detailed description provided.'}
              </p>
              {medicine.genericName && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Active Composition</p>
                  <p className="text-xs text-gray-800 font-semibold mt-0.5">{medicine.genericName}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-poppins font-bold text-base text-gray-900">How to use</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {medicine.usageInstructions ||
                  'Please follow the dosage prescribed by your registered medical practitioner or read the package label carefully.'}
              </p>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-poppins font-bold text-base text-gray-900">Safety &amp; Side Effects</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {medicine.sideEffects ||
                  'Consult your doctor if you experience any adverse reactions or unusual symptoms.'}
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                <strong>Schedule {medicine.drugSchedule} Compliance:</strong> Keep out of reach of children. Store in a cool, dry place away from direct sunlight.
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-poppins font-bold text-base text-gray-900">Customer Feedback</h3>
                  <p className="text-xs text-gray-500">Real verified reviews from our pharmacy customers</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Write a Review
                </button>
              </div>

              {medicine.reviews && medicine.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicine.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                            {rev.user?.name?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{rev.user?.name || 'Customer'}</p>
                            <div className="flex text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {rev.isVerifiedPurchase && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            ✅ Verified Buyer
                          </span>
                        )}
                      </div>
                      {rev.title && <p className="text-xs font-bold text-gray-800">{rev.title}</p>}
                      {rev.comment && <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>}
                      {rev.adminReply && (
                        <div className="mt-2 p-2 bg-teal-50 border-l-2 border-teal-600 rounded-r-lg text-xs text-teal-900">
                          <strong>H&amp;H Pharmacy Reply:</strong> {rev.adminReply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-xs">No customer reviews yet for this medicine.</p>
                  <p className="text-[11px] mt-1">Be the first to share your verified review!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4"
          >
            <h3 className="font-poppins font-bold text-base text-gray-900">Write a Review for {medicine.name}</h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Review Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Effective medicine for quick relief"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the packaging, delivery or effectiveness..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
