'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Pill,
  Package,
  AlertTriangle,
  Calendar,
  ShoppingCart,
  IndianRupee,
  Plus,
  Receipt,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  totalMedicines: number
  activeMedicines: number
  totalOrders: number
  todayOrders: number
  todayRevenue: number
  pendingOrders: number
  lowStockCount: number
  outOfStockCount: number
  expiringBatches: number
  expiredBatches: number
  recentOrders: any[]
  expiringSoon: any[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      toast.error('Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-3xl skeleton border border-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-gray-900">
            Pharmacy Control Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time stock monitor, expiring medicines alert, and customer order management
          </p>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/medicines/add"
            className="inline-flex items-center gap-1.5 bg-teal-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Medicine
          </Link>
          <Link
            href="/admin/receipts"
            className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
          >
            <Receipt className="w-4 h-4 text-teal-600" /> Scan Bill (OCR)
          </Link>
        </div>
      </div>

      {/* Critical Alert Bar if expired or low stock items exist */}
      {stats && (stats.expiredBatches > 0 || stats.lowStockCount > 0 || stats.pendingOrders > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.pendingOrders > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-amber-900">{stats.pendingOrders} Orders Pending</p>
                  <p className="text-[10px] text-amber-700">Need confirmation & packing</p>
                </div>
              </div>
              <Link href="/admin/orders" className="text-xs font-bold text-amber-800 hover:underline">
                Process →
              </Link>
            </div>
          )}

          {stats.lowStockCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-red-900">{stats.lowStockCount} Medicines Low Stock</p>
                  <p className="text-[10px] text-red-700">Less than 10 units left</p>
                </div>
              </div>
              <Link href="/admin/stock" className="text-xs font-bold text-red-800 hover:underline">
                Restock →
              </Link>
            </div>
          )}

          {stats.expiringBatches > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-orange-900">{stats.expiringBatches} Batches Expiring</p>
                  <p className="text-[10px] text-orange-700">Expiring in next 30 days</p>
                </div>
              </div>
              <Link href="/admin/expiry" className="text-xs font-bold text-orange-800 hover:underline">
                Review →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Medicines</p>
            <p className="font-poppins font-bold text-2xl text-gray-900 mt-1">
              {stats?.totalMedicines || 0}
            </p>
            <p className="text-[10px] text-teal-600 font-semibold mt-0.5">
              {stats?.activeMedicines || 0} active in catalog
            </p>
          </div>
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Today's Revenue</p>
            <p className="font-poppins font-bold text-2xl text-gray-900 mt-1">
              ₹{stats?.todayRevenue.toFixed(0) || 0}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              {stats?.todayOrders || 0} orders today
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Orders</p>
            <p className="font-poppins font-bold text-2xl text-gray-900 mt-1">
              {stats?.totalOrders || 0}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Lifetime customer orders</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Out of Stock</p>
            <p className="font-poppins font-bold text-2xl text-red-600 mt-1">
              {stats?.outOfStockCount || 0}
            </p>
            <p className="text-[10px] text-red-500 font-medium mt-0.5">Items currently zero</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Dashboard 2-column Grid: Recent Orders & Expiring Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-poppins font-bold text-base text-gray-900">Recent Customer Orders</h2>
              <p className="text-xs text-gray-400">Live order fulfillment stream</p>
            </div>
            <Link href="/admin/orders" className="text-xs text-teal-600 font-bold hover:underline">
              View All Orders →
            </Link>
          </div>

          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">#{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-0.5">
                      {order.customerName} • {order.items.length} item(s) • {order.deliveryType}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{order.totalAmount.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-400">{order.paymentMode}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">No orders received yet.</div>
          )}
        </div>

        {/* Expiring Soon Action List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-poppins font-bold text-base text-gray-900">Expiring in 30 Days</h2>
              <p className="text-xs text-gray-400">FIFO priority action list</p>
            </div>
            <Link href="/admin/expiry" className="text-xs text-orange-600 font-bold hover:underline">
              Expiry Hub →
            </Link>
          </div>

          {stats?.expiringSoon && stats.expiringSoon.length > 0 ? (
            <div className="space-y-3">
              {stats.expiringSoon.map((b) => (
                <div key={b.id} className="p-3 bg-orange-50/60 border border-orange-100 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{b.medicine.name}</p>
                    <p className="text-[10px] text-gray-500">
                      Batch: <span className="font-mono">{b.batchNumber}</span> • {b.currentQuantity} units left
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                      {new Date(b.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-emerald-700 bg-emerald-50 rounded-2xl">
              ✅ All current stock is safely within expiry dates!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
