'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, FileText, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface Medicine {
  id: number
  name: string
  nameHindi?: string | null
  brand?: string | null
  genericName?: string | null
  mrp: number
  sellingPrice: number
  discountPercent: number
  drugSchedule: string
  unitType: string
  unitsPerPack: number
  isActive: boolean
  category?: { name: string } | null
  batches: { currentQuantity: number }[]
}

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/medicines?limit=200')
      if (res.ok) {
        const data = await res.json()
        setMedicines(data.medicines)
      }
    } catch {
      toast.error('Failed to load medicines')
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/medicines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (res.ok) {
        setMedicines((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isActive: !currentStatus } : m))
        )
        toast.success(`Medicine ${!currentStatus ? 'Activated' : 'Deactivated'}`)
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = medicines.filter((m) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.brand?.toLowerCase().includes(q) ||
      m.genericName?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-gray-900">Medicine Catalog & Inventory</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Total {medicines.length} medicines in pharmacy catalog
          </p>
        </div>

        <Link
          href="/admin/medicines/add"
          className="inline-flex items-center gap-1.5 bg-teal-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by medicine name, salt composition, or manufacturer brand..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 skeleton rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">No medicines match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 border-b border-gray-100 font-semibold text-gray-600 uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Medicine Name</th>
                  <th className="py-3.5 px-3">Category / Schedule</th>
                  <th className="py-3.5 px-3">MRP / Sell Price</th>
                  <th className="py-3.5 px-3">Unit Packaging</th>
                  <th className="py-3.5 px-3">Live Stock</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => {
                  const stock = m.batches.reduce((sum, b) => sum + b.currentQuantity, 0)

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{m.name}</p>
                        {m.nameHindi && <p className="text-[10px] text-teal-700 font-hindi">{m.nameHindi}</p>}
                        {m.genericName && <p className="text-[10px] text-gray-400 truncate max-w-xs">{m.genericName}</p>}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {m.category?.name || 'General'}
                        </span>
                        <span
                          className={`ml-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            m.drugSchedule === 'OTC'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.drugSchedule === 'X'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {m.drugSchedule}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900">₹{m.sellingPrice}</span>
                        {m.discountPercent > 0 && (
                          <span className="text-gray-400 text-[10px] line-through ml-1.5">₹{m.mrp}</span>
                        )}
                        <span className="block text-[10px] text-teal-600 font-semibold">{m.discountPercent}% off</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-gray-800 uppercase text-[10px]">
                          {m.unitType} ({m.unitsPerPack} units)
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`font-bold text-xs ${
                            stock === 0 ? 'text-red-600' : stock < 10 ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {stock} units
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {Math.floor(stock / m.unitsPerPack)} strips + {stock % m.unitsPerPack} loose
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleActive(m.id, m.isActive)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                            m.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {m.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/admin/medicines/${m.id}`}
                          className="inline-block p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit Medicine & Add Batches"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/medicines/${m.id}`}
                          target="_blank"
                          className="inline-block p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview Public Page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
