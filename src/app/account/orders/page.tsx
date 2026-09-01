'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import { Package, Clock, RotateCcw, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface OrderItem {
  id: number
  medicineId: number
  quantity: number
  quantityType: string
  looseUnitCount?: number
  unitPrice: number
  totalPrice: number
  medicine: {
    name: string
    brand?: string | null
    imageUrl?: string | null
    unitType: string
  }
}

interface Order {
  id: number
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  deliveryType: string
  paymentMode: string
  items: OrderItem[]
}

export default function CustomerOrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const addToCart = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, session])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${(session?.user as any)?.id || session?.user?.email}`)
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

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        id: item.medicineId,
        name: item.medicine.name,
        brand: item.medicine.brand || '',
        price: item.unitPrice,
        mrp: item.unitPrice,
        unitType: item.medicine.unitType,
        unitsPerPack: 10,
        requiresPrescription: false,
        quantity: item.quantity,
        quantityType: item.quantityType as any,
        looseUnitCount: item.looseUnitCount,
        imageUrl: item.medicine.imageUrl,
      })
    })
    toast.success(`Items from #${order.orderNumber} added to cart! 🛒`)
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Header />
        <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-xs">
          <Package className="w-12 h-12 text-teal-600 mx-auto mb-3" />
          <h2 className="font-poppins font-bold text-xl text-gray-900 mb-2">Sign in to View Orders</h2>
          <p className="text-xs text-gray-500 mb-6">
            Sign in with your Google account to check your complete medicine order history and reorder in 1-click.
          </p>
          <button
            onClick={() => signIn('google')}
            className="w-full bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl text-sm hover:bg-teal-700 transition-colors"
          >
            Sign In with Google
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <h1 className="font-poppins font-bold text-2xl text-gray-900">My Medicine Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Check your previous purchases and easily order them again
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl skeleton border border-gray-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-poppins font-bold text-base text-gray-900">No past orders yet</p>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              When you place medicine delivery or pickup orders, they will appear here.
            </p>
            <Link
              href="/medicines"
              className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-teal-700"
            >
              Browse Medicines
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs hover:border-gray-200 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-gray-900">#{order.orderNumber}</span>
                      <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-poppins font-bold text-base text-gray-900">
                      ₹{order.totalAmount.toFixed(0)}
                    </span>
                    <button
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold py-1.5 px-3 rounded-xl hover:bg-teal-100 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reorder All
                    </button>
                    <Link
                      href={`/order/${order.id}`}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/70 text-xs">
                      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                        💊
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.medicine.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {item.quantityType === 'loose_units' ? `${item.looseUnitCount} Tablets` : `${item.quantity} Strip(s)`} • ₹{item.totalPrice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
