'use client'

import { useState, useEffect } from 'react'
import { Calendar, AlertTriangle, CheckCircle, Trash2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

interface ExpiryItem {
  id: number
  batchNumber: string
  expiryDate: string
  currentQuantity: number
  daysLeft: number
  status: 'expired' | 'critical' | 'warning'
  medicine: {
    id: number
    name: string
    brand?: string | null
    unitType: string
  }
}

import { useAdminCacheStore } from '@/store/adminCacheStore'
import { AdminFastRefreshBar } from '@/components/admin/AdminFastRefreshBar'

export default function AdminExpiryPage() {
  const {
    expiry,
    expiryTimestamp,
    loading,
    refreshing,
    loadExpiry,
    invalidate,
  } = useAdminCacheStore()

  const [activeTab, setActiveTab] = useState<'all' | 'expired' | 'critical' | 'warning'>('all')

  useEffect(() => {
    loadExpiry()
  }, [loadExpiry])

  const handleDisposal = async (batchId: number, medicineId: number, qty: number) => {
    if (!confirm('Are you sure you want to remove and dispose of this expired batch from inventory?')) return

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId,
          batchId,
          change: -qty,
          reason: 'Expired batch removed for legal disposal',
        }),
      })

      if (res.ok) {
        toast.success('Expired batch removed from stock and logged in disposal record! 🗑️')
        invalidate('expiry')
        invalidate('stock')
        invalidate('stats')
        loadExpiry(true)
      }
    } catch {
      toast.error('Failed to dispose batch')
    }
  }

  const filtered = expiry.filter((item: any) => {
    if (activeTab === 'all') return true
    return item.status === activeTab
  })

  const expiredCount = expiry.filter((i: any) => i.status === 'expired').length
  const criticalCount = expiry.filter((i: any) => i.status === 'critical').length
  const warningCount = expiry.filter((i: any) => i.status === 'warning').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-gray-900">Medicine Expiry Tracking</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Automatic early warning system for upcoming and expired medicine batches (FIFO priority)
          </p>
        </div>

        <div>
          <AdminFastRefreshBar
            lastUpdated={expiryTimestamp}
            isRefreshing={refreshing.expiry}
            onRefresh={() => loadExpiry(true)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Monitored ({expiry.length})
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'expired'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
          }`}
        >
          <span>⛔ Expired ({expiredCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('critical')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'critical'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
          }`}
        >
          <span>🔴 &lt; 30 Days Left ({criticalCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('warning')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'warning'
              ? 'bg-yellow-600 text-white shadow-xs'
              : 'bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100'
          }`}
        >
          <span>🟡 30-90 Days Left ({warningCount})</span>
        </button>
      </div>

      {/* Expiry Items List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading.expiry && expiry.length === 0 ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 skeleton rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            ✅ No medicines in this category. Inventory is fresh and compliant!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.status === 'expired'
                        ? 'bg-red-100 text-red-700'
                        : item.status === 'critical'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>

                  <div>
                    <p className="font-bold text-sm text-gray-900">{item.medicine.name}</p>
                    <p className="text-xs text-gray-400">
                      Batch #{item.batchNumber} • Stock Remaining: <strong className="text-gray-700">{item.currentQuantity} units</strong>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Expiry Date:{' '}
                      <span className="font-semibold text-gray-800">
                        {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      item.status === 'expired'
                        ? 'bg-red-100 text-red-800'
                        : item.status === 'critical'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.daysLeft <= 0 ? 'EXPIRED' : `${item.daysLeft} days left`}
                  </span>

                  {item.status === 'expired' ? (
                    <button
                      onClick={() => handleDisposal(item.id, item.medicine.id, item.currentQuantity)}
                      className="px-3 py-1.5 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Dispose
                    </button>
                  ) : (
                    <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
                      Priority for Next Sale
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
