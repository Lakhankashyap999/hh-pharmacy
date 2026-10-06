'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, AlertCircle, CheckCircle, XCircle, FileText, Plus, Minus, Zap } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface Medicine {
  id: number
  name: string
  nameHindi?: string | null
  genericName?: string | null
  brand?: string | null
  mrp: number
  sellingPrice: number
  discountPercent: number
  unitType: string
  unitsPerPack: number
  drugSchedule: string
  requiresPrescription: boolean
  imageUrl?: string | null
  isActive: boolean
  category?: { name: string; color?: string | null } | null
  batches: { currentQuantity: number; expiryDate: Date }[]
  reviews: { rating: number }[]
}

function getStockInfo(batches: { currentQuantity: number; expiryDate: Date }[]) {
  const now = new Date()
  const validBatches = batches.filter((b) => new Date(b.expiryDate) > now)
  return validBatches.reduce((a, b) => a + b.currentQuantity, 0)
}

function getAvgRating(reviews: { rating: number }[]) {
  if (!reviews || !reviews.length) return 4.5
  return reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
}

export function MedicineCard({ medicine, index = 0 }: { medicine: Medicine; index?: number }) {
  const { items, addItem, updateQuantity } = useCartStore()

  const totalUnits = getStockInfo(medicine.batches || [])
  const avgRating = getAvgRating(medicine.reviews || [])
  const isOutOfStock = totalUnits === 0

  // Check if item is already in cart
  const cartItem = items.find((i) => i.id === medicine.id && i.quantityType === 'full_pack')
  const cartQuantity = cartItem ? cartItem.quantity : 0

  const handleAddDirect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) return
    if (medicine.drugSchedule === 'X') {
      toast.error('Schedule X narcotic: In-person visit required!')
      return
    }

    addItem({
      id: medicine.id,
      name: medicine.name,
      brand: medicine.brand || '',
      price: medicine.sellingPrice,
      mrp: medicine.mrp,
      unitType: medicine.unitType,
      unitsPerPack: medicine.unitsPerPack,
      requiresPrescription: medicine.requiresPrescription,
      quantity: 1,
      quantityType: 'full_pack',
      imageUrl: medicine.imageUrl,
    })
    toast.success(`${medicine.name} added! 🛒`)
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(medicine.id, cartQuantity + 1)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(medicine.id, cartQuantity - 1)
  }

  const savings = Math.max(0, medicine.mrp - medicine.sellingPrice)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
      className="glow-card glow-card-ambient h-full w-full"
    >
      <Link href={`/medicines/${medicine.id}`} className="block h-full">
        <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-teal-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group p-2 sm:p-3">
          {/* Top Row: Delivery Badge & Discount Badge */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">
              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />
              60M
            </span>

            {medicine.discountPercent > 0 ? (
              <span className="bg-teal-600 text-white text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-2xs">
                {medicine.discountPercent}% OFF
              </span>
            ) : (
              <span className="text-[8px] sm:text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                BEST
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-3xs z-20 flex items-center justify-center rounded-2xl sm:rounded-3xl p-2">
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                Out of Stock
              </span>
            </div>
          )}

          {/* Image Canvas - compact on mobile, sleek on desktop */}
          <div className="h-24 sm:h-32 bg-gradient-to-b from-gray-50/80 to-white rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden mb-1.5 sm:mb-2 group-hover:scale-102 transition-transform">
            {medicine.imageUrl ? (
              <img
                src={medicine.imageUrl}
                alt={medicine.name}
                className="h-full w-full object-contain p-1.5 sm:p-2"
                loading="lazy"
              />
            ) : (
              <div className="text-center">
                <span className="text-3xl sm:text-4xl block mb-0.5">💊</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  {medicine.unitType}
                </span>
              </div>
            )}

            {/* Category tag */}
            {medicine.category && (
              <span
                className="absolute bottom-1 left-1 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white shadow-3xs max-w-[85%] truncate"
                style={{ backgroundColor: medicine.category.color || '#0d9488' }}
              >
                {medicine.category.name}
              </span>
            )}
          </div>

          {/* Title & Clinical Info */}
          <div className="space-y-1 flex-1">
            <h3 className="font-poppins font-bold text-gray-900 text-[11px] sm:text-sm leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors min-h-[1.75rem] sm:min-h-[2.25rem]">
              {medicine.name}
            </h3>

            {medicine.genericName ? (
              <p className="text-gray-400 text-[9px] sm:text-[10px] truncate leading-none">
                {medicine.genericName}
              </p>
            ) : medicine.brand ? (
              <p className="text-gray-400 text-[9px] sm:text-[10px] truncate leading-none">
                {medicine.brand}
              </p>
            ) : null}

            {/* Unit count & Rating */}
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-500 pt-0.5">
              <span>
                {medicine.unitsPerPack} {medicine.unitType === 'strip' ? 'tabs' : medicine.unitType}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>{avgRating.toFixed(1)}</span>
              </div>
            </div>

            {/* Schedule Type */}
            <div className="pt-0.5">
              {medicine.drugSchedule === 'OTC' ? (
                <span className="text-[8px] sm:text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded inline-block leading-tight">
                  OTC (No Rx)
                </span>
              ) : medicine.drugSchedule === 'X' ? (
                <span className="text-[8px] sm:text-[9px] text-red-700 font-bold bg-red-50 border border-red-200 px-1 py-0.2 rounded inline-block leading-tight">
                  Schedule X
                </span>
              ) : (
                <span className="text-[8px] sm:text-[9px] text-orange-700 font-bold bg-orange-50 border border-orange-200 px-1 py-0.2 rounded inline-flex items-center gap-0.5 leading-tight">
                  <FileText className="w-2 h-2 shrink-0" /> Rx Req
                </span>
              )}
            </div>
          </div>

          {/* Price & Action Row */}
          <div className="pt-1.5 sm:pt-2 border-t border-gray-100 mt-1.5 sm:mt-2 flex items-center justify-between gap-1">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-extrabold text-gray-900 text-xs sm:text-base leading-tight">
                  ₹{medicine.sellingPrice.toFixed(0)}
                </span>
                {savings > 0 && (
                  <span className="text-gray-400 text-[8px] sm:text-[10px] line-through leading-tight">
                    ₹{medicine.mrp.toFixed(0)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-[8px] sm:text-[9px] text-emerald-600 font-bold block leading-none truncate">
                  Save ₹{savings.toFixed(0)}
                </span>
              )}
            </div>

            {/* Interactive Add / Counter Button */}
            {medicine.drugSchedule === 'X' ? (
              <a
                href="tel:7827558443"
                onClick={(e) => e.stopPropagation()}
                className="bg-red-50 border border-red-200 text-red-700 text-[9px] sm:text-[10px] font-bold px-1.5 py-1 rounded-lg hover:bg-red-100 shrink-0"
              >
                In-Shop
              </a>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center gap-1 bg-teal-600 text-white rounded-lg sm:rounded-xl px-1 py-0.5 sm:px-1.5 sm:py-1 shadow-2xs shrink-0">
                <button
                  onClick={handleDecrement}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-teal-700 flex items-center justify-center hover:bg-teal-800 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="text-[10px] sm:text-xs font-bold w-3.5 sm:w-4 text-center">
                  {cartQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-teal-700 flex items-center justify-center hover:bg-teal-800 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddDirect}
                disabled={isOutOfStock}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-0.5 shadow-2xs active:scale-95 cursor-pointer shrink-0 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
