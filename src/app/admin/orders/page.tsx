'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  FileText,
  Phone,
  MapPin,
  Eye,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRx, setSelectedRx] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?admin=true')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Order #${orderId} marked as ${newStatus}!`)
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const approvePrescription = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionStatus: 'approved' }),
      })
      if (res.ok) {
        toast.success('Doctor Prescription Approved! ✅')
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, prescriptionStatus: 'approved' } : o
          )
        )
        setSelectedRx(null)
      }
    } catch {
      toast.error('Failed to approve Rx')
    }
  }

  const filtered = orders.filter((o) => {
    if (statusFilter === 'all') return true
    return o.status === statusFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-poppins font-bold text-2xl text-gray-900">
          Customer Orders Management
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Process delivery/pickup requests, inspect doctor prescriptions, and manage order fulfillment
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending Approval' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'preparing', label: 'Packing / Preparing' },
          { id: 'out_for_delivery', label: 'Out for Delivery' },
          { id: 'delivered', label: 'Delivered' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 skeleton rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No orders found in this status.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((order) => (
              <div key={order.id} className="p-5 hover:bg-gray-50/50 transition-colors space-y-3">
                {/* Top Row: Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-gray-900">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {order.deliveryType.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-poppins font-bold text-base text-gray-900">
                      ₹{order.totalAmount.toFixed(0)} ({order.paymentMode})
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-xs font-semibold border border-gray-300 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing / Packing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="font-medium text-gray-900">Customer: {order.customerName}</span>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex items-center gap-1 text-teal-600 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> {order.customerPhone}
                  </a>
                  <a
                    href={`https://wa.me/91${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Namaste ${order.customerName}! Your H&H Pharmacy order #${order.orderNumber} is currently: ${order.status.toUpperCase()}. Total: ₹${order.totalAmount}. Call/reply if you need assistance!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    💬 WhatsApp Customer
                  </a>
                  <span>Address: {order.deliveryAddress}</span>
                </div>

                {/* Prescription Check button if attached */}
                {order.prescriptionImageUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedRx(order.prescriptionImageUrl)}
                      className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold px-3 py-1 rounded-xl hover:bg-orange-100"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Doctor's Prescription 📸
                    </button>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.prescriptionStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Rx Status: {order.prescriptionStatus}
                    </span>

                    {order.prescriptionStatus !== 'approved' && (
                      <button
                        onClick={() => approvePrescription(order.id)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700"
                      >
                        Approve Rx
                      </button>
                    )}
                  </div>
                )}

                {/* Order Items Pills */}
                <div className="bg-gray-50/70 p-3 rounded-2xl flex flex-wrap gap-2 text-xs">
                  {order.items.map((item: any) => (
                    <span
                      key={item.id}
                      className={`px-3 py-1.5 rounded-xl border text-xs ${
                        item.quantityType === 'loose_units'
                          ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-3xs'
                          : 'bg-white border-gray-200 text-gray-800'
                      }`}
                    >
                      <strong>{item.medicine.name}</strong> •{' '}
                      {item.quantityType === 'loose_units' ? (
                        <span className="text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded font-black">
                          ✂️ CUT STRIP: {item.looseUnitCount} TABLETS ONLY
                        </span>
                      ) : (
                        `${item.quantity} Strip(s)`
                      )}{' '}
                      (₹{item.totalPrice})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Inspection Modal */}
      {selectedRx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-poppins font-bold text-lg text-gray-900">Doctor Prescription Inspection</h3>
            <img src={selectedRx} alt="Prescription" className="max-h-96 mx-auto rounded-xl object-contain" />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedRx(null)}
                className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-semibold text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
