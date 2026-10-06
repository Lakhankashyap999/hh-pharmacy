'use client'

import { useState, useEffect } from 'react'
import { Search, Package, Plus, Minus, AlertTriangle, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

import { useAdminCacheStore } from '@/store/adminCacheStore'
import { AdminFastRefreshBar } from '@/components/admin/AdminFastRefreshBar'

export default function AdminStockPage() {
  const {
    stock,
    stockTimestamp,
    loading,
    refreshing,
    loadStock,
    invalidate,
  } = useAdminCacheStore()

  const [search, setSearch] = useState('')
  const [expandedMedicine, setExpandedMedicine] = useState<number | null>(null)

  // Adjust modal state
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [adjustChange, setAdjustChange] = useState<number>(10)
  const [adjustReason, setAdjustReason] = useState('Manual physical recount')
  const [adjusting, setAdjusting] = useState(false)

  useEffect(() => {
    loadStock()
  }, [loadStock])

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatch) return

    setAdjusting(true)
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: selectedBatch.medicineId,
          batchId: selectedBatch.id,
          change: adjustChange,
          reason: adjustReason,
        }),
      })

      if (res.ok) {
        toast.success('Stock adjusted & logged in audit trail! 📊')
        setSelectedBatch(null)
        invalidate('stock')
        invalidate('stats')
        loadStock(true)
      } else {
        toast.error('Failed to adjust stock')
      }
    } catch {
      toast.error('Error occurred')
    } finally {
      setAdjusting(false)
    }
  }

  const filtered = stock.filter((item: any) => {
    if (!search.trim()) return true
    return item.medicine?.name?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-gray-900">Real-Time Stock Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit batch quantities, manage loose tablets, and review stock adjustments
          </p>
        </div>

        <div>
          <AdminFastRefreshBar
            lastUpdated={stockTimestamp}
            isRefreshing={refreshing.stock}
            onRefresh={() => loadStock(true)}
          />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine stock by name..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading.stock && stock.length === 0 ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 skeleton rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No stock records found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => {
              const isExpanded = expandedMedicine === item.medicineId
              const unitsPerPack = item.medicine.unitsPerPack || 10
              const fullStrips = Math.floor(item.totalUnits / unitsPerPack)
              const looseUnits = item.totalUnits % unitsPerPack

              return (
                <div key={item.medicineId} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div
                    onClick={() => setExpandedMedicine(isExpanded ? null : item.medicineId)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                        💊
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{item.medicine.name}</p>
                        <p className="text-[10px] text-gray-400">
                          Packaging: {unitsPerPack} units per {item.medicine.unitType} • {item.batches.length} batch(es)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span
                          className={`font-poppins font-bold text-sm ${
                            item.totalUnits === 0
                              ? 'text-red-600'
                              : item.totalUnits < 10
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.totalUnits} Units Total
                        </span>
                        <p className="text-[10px] text-gray-500">
                          ({fullStrips} full strips + {looseUnits} loose tablets)
                        </p>
                      </div>

                      <button className="text-gray-400 hover:text-gray-700">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Batches Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/60 rounded-2xl p-4 space-y-3">
                      <p className="text-xs font-bold text-gray-700">Batch Breakdown (FIFO Order):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {item.batches.map((b: any) => (
                          <div
                            key={b.id}
                            className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2 text-xs"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-gray-900">Batch: {b.batchNumber}</p>
                                <p className="text-[10px] text-gray-400">
                                  Exp: {new Date(b.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <span className="font-bold text-teal-700 text-sm">{b.currentQuantity} units</span>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedBatch({ ...b, medicineName: item.medicine.name, medicineId: item.medicineId })
                              }}
                              className="w-full py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[10px] font-bold hover:bg-teal-100 transition-colors"
                            >
                              Adjust Stock (±)
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-poppins font-bold text-lg text-gray-900">
              Adjust Stock: {selectedBatch.medicineName}
            </h3>
            <p className="text-xs text-gray-500">
              Batch: <span className="font-mono font-bold">{selectedBatch.batchNumber}</span> • Current: {selectedBatch.currentQuantity} units
            </p>

            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Stock Change (+ to add, - to reduce)
                </label>
                <input
                  type="number"
                  value={adjustChange}
                  onChange={(e) => setAdjustChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 font-bold"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  New resulting stock: {Math.max(0, selectedBatch.currentQuantity + adjustChange)} units
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Physical recount / damaged tablet disposal"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBatch(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50"
                >
                  {adjusting ? 'Updating...' : 'Confirm Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
