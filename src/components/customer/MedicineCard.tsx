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
  const isLowStock = totalUnits > 0 && totalUnits < 10

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="glow-card glow-card-ambient h-full"
    >
      <Link href={`/medicines/${medicine.id}`} className="block h-full">
        <div className="relative bg-white rounded-3xl border border-gray-100/90 overflow-hidden hover:border-teal-300/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full group p-3">
          {/* Top Row: Delivery Time & Discount Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              60 MINS
            </span>

            {medicine.discountPercent > 0 ? (
              <span className="bg-teal-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                {medicine.discountPercent}% OFF
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                BEST PRICE
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-3xs z-20 flex items-center justify-center rounded-3xl p-4">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Out of Stock
              </span>
            </div>
          )}

          {/* Image Canvas */}
          <div className="h-32 bg-gradient-to-b from-gray-50/80 to-white rounded-2xl flex items-center justify-center relative overflow-hidden mb-2 group-hover:scale-102 transition-transform">
            {medicine.imageUrl ? (
              <img
                src={medicine.imageUrl}
                alt={medicine.name}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <div className="text-center">
                <span className="text-4xl block mb-1">💊</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {medicine.unitType}
                </span>
              </div>
            )}

            {/* Category tag */}
            {medicine.category && (
              <span
                className="absolute bottom-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white shadow-3xs"
                style={{ backgroundColor: medicine.category.color || '#0d9488' }}
              >
                {medicine.category.name}
              </span>
            )}
          </div>

          {/* Title & Clinical Info */}
          <div className="space-y-1.5 flex-1">
            <h3 className="font-poppins font-bold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-teal-700 transition-colors">
              {medicine.name}
            </h3>

            {medicine.genericName ? (
              <p className="text-gray-400 text-[10px] truncate">{medicine.genericName}</p>
            ) : medicine.brand ? (
              <p className="text-gray-400 text-[10px]">{medicine.brand}</p>
            ) : null}

            {/* Unit count & Loose indicator */}
            <p className="text-[10px] text-gray-500 font-medium">
              {medicine.unitsPerPack} {medicine.unitType === 'strip' ? 'Tablets' : medicine.unitType} / pack
            </p>

            {/* Rating Stars */}
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[10px] font-bold text-gray-800">{avgRating.toFixed(1)}</span>
            </div>

            {/* Schedule Type */}
            <div>
              {medicine.drugSchedule === 'OTC' ? (
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-block">
                  OTC (No Rx)
                </span>
              ) : medicine.drugSchedule === 'X' ? (
                <span className="text-[9px] text-red-700 font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md inline-block">
                  Schedule X
                </span>
              ) : (
                <span className="text-[9px] text-orange-700 font-bold bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                  <FileText className="w-2.5 h-2.5" /> Rx Required
                </span>
              )}
            </div>
          </div>

          {/* Price & Action Row */}
          <div className="pt-2 border-t border-gray-100/80 mt-2 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-poppins font-extrabold text-gray-900 text-sm sm:text-base">
                  ₹{medicine.sellingPrice.toFixed(0)}
                </span>
                {savings > 0 && (
                  <span className="text-gray-400 text-[10px] line-through">₹{medicine.mrp.toFixed(0)}</span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-[9px] text-emerald-600 font-bold block">Save ₹{savings.toFixed(0)}</span>
              )}
            </div>

            {/* Interactive Add / Counter Button */}
            {medicine.drugSchedule === 'X' ? (
              <a
                href="tel:7827558443"
                onClick={(e) => e.stopPropagation()}
                className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2 py-1.5 rounded-xl hover:bg-red-100"
              >
                In-Shop
              </a>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center gap-1.5 bg-teal-600 text-white rounded-xl px-1.5 py-1 shadow-xs">
                <button
                  onClick={handleDecrement}
                  className="w-5 h-5 rounded-lg bg-teal-700 flex items-center justify-center hover:bg-teal-800 cursor-pointer"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="text-xs font-bold w-4 text-center">{cartQuantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-5 h-5 rounded-lg bg-teal-700 flex items-center justify-center hover:bg-teal-800 cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddDirect}
                disabled={isOutOfStock}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
