'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ArrowUpDown, Check, AlertCircle, X } from 'lucide-react'
import { MedicineCard } from '@/components/customer/MedicineCard'

interface Category {
  id: number
  name: string
  nameHindi?: string | null
  icon?: string | null
  color?: string | null
}

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
  categoryId?: number | null
  category?: Category | null
  batches: { currentQuantity: number; expiryDate: Date }[]
  reviews: { rating: number }[]
}

interface Props {
  initialMedicines: Medicine[]
  categories: Category[]
  initialSearch?: string
  initialCategory?: string
  initialSchedule?: string
}

export default function MedicinesClient({
  initialMedicines,
  categories,
  initialSearch = '',
  initialCategory = '',
  initialSchedule = '',
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    initialCategory ? parseInt(initialCategory) : null
  )
  const [selectedSchedule, setSelectedSchedule] = useState<string>(initialSchedule)
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'discount'>('popular')
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)

  // Filter and sort medicines
  const filteredMedicines = useMemo(() => {
    return initialMedicines
      .filter((med) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase()
          const nameMatch = med.name.toLowerCase().includes(q)
          const genericMatch = med.genericName?.toLowerCase().includes(q)
          const brandMatch = med.brand?.toLowerCase().includes(q)
          const hindiMatch = med.nameHindi?.includes(q)
          if (!nameMatch && !genericMatch && !brandMatch && !hindiMatch) return false
        }

        // Category filter
        if (selectedCategory && med.categoryId !== selectedCategory) {
          return false
        }

        // Schedule filter
        if (selectedSchedule === 'OTC' && med.drugSchedule !== 'OTC') return false
        if (selectedSchedule === 'rx' && !med.requiresPrescription) return false

        // Stock filter
        if (inStockOnly) {
          const totalStock = med.batches.reduce((sum, b) => sum + b.currentQuantity, 0)
          if (totalStock <= 0) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.sellingPrice - b.sellingPrice
        if (sortBy === 'price_desc') return b.sellingPrice - a.sellingPrice
        if (sortBy === 'discount') return b.discountPercent - a.discountPercent
        return 0 // Default popularity/insertion order
      })
  }, [initialMedicines, search, selectedCategory, selectedSchedule, sortBy, inStockOnly])

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory(null)
    setSelectedSchedule('')
    setSortBy('popular')
    setInStockOnly(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl md:text-3xl text-gray-900">
          All Medicines <span className="text-teal-600 font-hindi font-normal text-lg">दवाईयाँ</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse authentic medicines with instant availability status & discount up to 15%
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-8 space-y-4">
        {/* Top search & sort row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine name, generic salt (e.g. Paracetamol), or brand..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none text-sm font-medium cursor-pointer"
              >
                <option value="popular">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>

            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                inStockOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${inStockOnly ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              In Stock Only
            </button>
          </div>
        </div>

        {/* Category horizontal badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon || '💊'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Schedule Filter Tags */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Filter Type:</span>
            <button
              onClick={() => setSelectedSchedule('')}
              className={`px-2.5 py-1 rounded-lg ${selectedSchedule === '' ? 'bg-teal-100 text-teal-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedSchedule('OTC')}
              className={`px-2.5 py-1 rounded-lg ${selectedSchedule === 'OTC' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              OTC (No Rx Needed)
            </button>
            <button
              onClick={() => setSelectedSchedule('rx')}
              className={`px-2.5 py-1 rounded-lg ${selectedSchedule === 'rx' ? 'bg-orange-100 text-orange-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Prescription (Rx Required)
            </button>
          </div>

          {(search || selectedCategory || selectedSchedule || inStockOnly) && (
            <button
              onClick={clearFilters}
              className="text-teal-600 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-700">
          Showing <span className="font-bold text-gray-900">{filteredMedicines.length}</span> medicines
        </p>
      </div>

      {/* Medicines Grid with subtle AWS-like ambient glow */}
      {filteredMedicines.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedicines.map((med, index) => (
            <MedicineCard key={med.id} medicine={med as any} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            💊
          </div>
          <h3 className="font-poppins font-bold text-lg text-gray-900 mb-1">No medicines found</h3>
          <p className="text-sm text-gray-500 mb-6">
            Try adjusting your search term, clearing category filters, or calling our pharmacy directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              Clear All Filters
            </button>
            <a
              href="tel:7827558443"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              📞 7827558443
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
