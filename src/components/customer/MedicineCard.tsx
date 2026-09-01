'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Star, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react'
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
  const validBatches = batches.filter((b) => b.expiryDate > now)
  const totalUnits = validBatches.reduce((a, b) => a + b.currentQuantity, 0)
  return totalUnits
}

function getAvgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0
  return reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
}

export function MedicineCard({ medicine, index = 0 }: { medicine: Medicine; index?: number }) {
  const addToCart = useCartStore((s) => s.addItem)
  const totalUnits = getStockInfo(medicine.batches)
  const avgRating = getAvgRating(medicine.reviews)
  const isOutOfStock = totalUnits === 0
  const isLowStock = totalUnits > 0 && totalUnits < 10

  const scheduleColor: Record<string, string> = {
    OTC: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    G: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    H: 'bg-orange-50 text-orange-700 border-orange-200',
    H1: 'bg-red-50 text-red-700 border-red-200',
    X: 'bg-red-50 text-red-700 border-red-200',
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) return
    if (medicine.drugSchedule === 'X') {
      toast.error('This medicine requires in-person visit with prescription')
      return
    }
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
      quantityType: 'full_pack',
      imageUrl: medicine.imageUrl,
    })
    toast.success(`${medicine.name} added to cart!`, {
      icon: '🛒',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glow-card glow-card-ambient"
    >
      <Link href={`/medicines/${medicine.id}`} className="block">
        <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
          {/* Discount badge */}
          {medicine.discountPercent > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {medicine.discountPercent}% OFF
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
              <span className="bg-white border border-red-200 text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Image area */}
          <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
            {medicine.imageUrl ? (
              <img
                src={medicine.imageUrl}
                alt={medicine.name}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 opacity-30">
                <span className="text-4xl">💊</span>
              </div>
            )}
            {/* Category label */}
            {medicine.category && (
              <span
                className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium text-white"
                style={{ backgroundColor: medicine.category.color || '#6b7280' }}
              >
                {medicine.category.name}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-3 flex flex-col gap-2">
            {/* Name */}
            <div>
              <h3 className="font-poppins font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                {medicine.name}
              </h3>
              {medicine.genericName && (
                <p className="text-gray-400 text-xs mt-0.5 truncate">{medicine.genericName}</p>
              )}
              {medicine.brand && (
                <p className="text-gray-500 text-xs">{medicine.brand}</p>
              )}
            </div>

            {/* Rating */}
            {medicine.reviews.length > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({medicine.reviews.length})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-poppins font-bold text-gray-900 text-base">
                ₹{medicine.sellingPrice.toFixed(0)}
              </span>
              {medicine.discountPercent > 0 && (
                <span className="text-gray-400 text-xs line-through">₹{medicine.mrp.toFixed(0)}</span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-1">
              {isOutOfStock ? (
                <><XCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-xs text-red-600 font-medium">Out of Stock</span></>
              ) : isLowStock ? (
                <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs text-amber-600 font-medium">Only {totalUnits} left</span></>
              ) : (
                <><CheckCircle className="w-3.5 h-3.5 text-emerald-500 pulse-green" /><span className="text-xs text-emerald-600 font-medium">In Stock</span></>
              )}
            </div>

            {/* Schedule badge */}
            {medicine.drugSchedule !== 'OTC' && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium w-fit flex items-center gap-1 ${scheduleColor[medicine.drugSchedule] || scheduleColor.H}`}>
                <FileText className="w-3 h-3" />
                {medicine.drugSchedule === 'X' ? 'Visit Shop Only' : 'Prescription Required'}
              </span>
            )}

            {/* Add to cart button */}
            {medicine.drugSchedule === 'X' ? (
              <a
                href="tel:7827558443"
                onClick={(e) => e.stopPropagation()}
                className="w-full mt-auto bg-red-50 border border-red-200 text-red-700 text-xs font-semibold py-2 rounded-xl text-center hover:bg-red-100 transition-colors"
              >
                📞 Call to Order
              </a>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full mt-auto flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md active:scale-95'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {medicine.requiresPrescription ? 'Add + Upload Rx' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
