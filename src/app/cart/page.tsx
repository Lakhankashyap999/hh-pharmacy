'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Building,
  Upload,
  FileText,
  CreditCard,
  QrCode,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  AlertTriangle,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useSession } from 'next-auth/react'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, removeItem, updateQuantity, updateLooseUnits, clearCart, total, hasPrescriptionRequired } =
    useCartStore()

  // Checkout form state
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery')
  const [customerName, setCustomerName] = useState(session?.user?.name || '')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMode, setPaymentMode] = useState<'COD' | 'UPI'>('COD')
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null)
  const [isUploadingRx, setIsUploadingRx] = useState(false)
  const [orderNotes, setOrderNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cartTotal = total()
  const deliveryFee = deliveryType === 'delivery' ? (cartTotal > 500 ? 0 : 40) : 0
  const finalPayable = cartTotal + deliveryFee
  const hasRxItems = hasPrescriptionRequired()

  // Simulated prescription upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingRx(true)
    setTimeout(() => {
      // In real production, this uploads to Supabase storage / S3
      setPrescriptionUrl(URL.createObjectURL(file))
      setIsUploadingRx(false)
      toast.success('Prescription uploaded successfully! 📋')
    }, 1200)
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Your cart is empty!')
      return
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Please enter your name and phone number')
      return
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Please enter your delivery address')
      return
    }

    if (hasRxItems && !prescriptionUrl) {
      toast.error('Please upload a doctor prescription for prescription medicines in your cart.')
      return
    }

    setIsSubmitting(true)
    try {
      const orderPayload = {
        userId: (session?.user as any)?.id || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : 'Pickup from H&H Shop, Ghookna Mode',
        totalAmount: finalPayable,
        discountAmount: 0,
        paymentMode,
        prescriptionImageUrl: prescriptionUrl,
        hasPrescriptionItems: hasRxItems,
        notes: orderNotes,
        items: items.map((i) => ({
          medicineId: i.id,
          quantity: i.quantity,
          quantityType: i.quantityType,
          looseUnitCount: i.looseUnitCount || null,
          unitsPerPack: i.unitsPerPack,
          unitPrice: i.quantityType === 'loose_units' ? i.price / i.unitsPerPack : i.price,
          totalPrice:
            i.quantityType === 'loose_units'
              ? (i.price / i.unitsPerPack) * (i.looseUnitCount || 1)
              : i.price * i.quantity,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      if (res.ok) {
        const orderData = await res.json()
        clearCart()
        toast.success('Order placed successfully! 🚀', { duration: 5000 })
        router.push(`/order/${orderData.id}`)
      } else {
        toast.error('Failed to place order. Please try again.')
      }
    } catch (err) {
      toast.error('Network error. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-gray-900 flex items-center gap-2">
            <span>Your Cart</span>
            <span className="text-teal-600 text-lg font-normal">({items.length} items)</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review medicines, adjust loose tablet quantities, and choose delivery or pickup
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              🛒
            </div>
            <h2 className="font-poppins font-bold text-xl text-gray-900 mb-1">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-6">
              Browse our medicine catalog to find OTC, Ayurvedic, and prescription medicines.
            </p>
            <Link
              href="/medicines"
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
            >
              Browse Medicines Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Cart Items list (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Prescription Warning Banner if any */}
              {hasRxItems && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-orange-900 leading-relaxed">
                    <p className="font-bold">Doctor Prescription Required (Schedule H Medicine):</p>
                    <p className="mt-0.5 text-orange-800">
                      Your cart includes medicines that legally require a doctor's prescription. Please upload your prescription photo below before completing the order.
                    </p>
                  </div>
                </div>
              )}

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-poppins font-bold text-base text-gray-900">Items in Cart</h3>
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const isLoose = item.quantityType === 'loose_units'
                    const unitPrice = isLoose ? item.price / item.unitsPerPack : item.price
                    const itemTotal = isLoose
                      ? unitPrice * (item.looseUnitCount || 1)
                      : item.price * item.quantity

                    return (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Medicine info */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                            ) : (
                              '💊'
                            )}
                          </div>
                          <div>
                            <Link href={`/medicines/${item.id}`} className="font-semibold text-sm text-gray-900 hover:text-teal-600 transition-colors">
                              {item.name}
                            </Link>
                            <p className="text-xs text-gray-400">{item.brand}</p>
                            {item.requiresPrescription && (
                              <span className="inline-block mt-1 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                📋 Rx Required
                              </span>
                            )}
                            {/* Loose unit badge */}
                            {isLoose && (
                              <p className="text-xs text-teal-700 font-medium mt-1">
                                Loose Purchase: {item.looseUnitCount} tablets @ ₹{unitPrice.toFixed(1)}/each
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity controls & Price */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          {!isLoose ? (
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-gray-600 hover:bg-gray-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-gray-900 w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-gray-600 hover:bg-gray-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-xl px-2 py-1">
                              <span className="text-xs text-teal-800 font-semibold">
                                {item.looseUnitCount} Tablets
                              </span>
                            </div>
                          )}

                          <div className="text-right min-w-[70px]">
                            <p className="font-poppins font-bold text-sm text-gray-900">
                              ₹{itemTotal.toFixed(0)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {isLoose ? `₹${unitPrice.toFixed(1)}/unit` : `₹${item.price}/pack`}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Prescription Upload Card if required */}
              {hasRxItems && (
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
                  <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    Upload Doctor's Prescription
                  </h3>
                  <p className="text-xs text-gray-500">
                    Upload a clear photo of your prescription showing Doctor's name, patient name, and medicines.
                  </p>

                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-teal-400 transition-colors">
                    {prescriptionUrl ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="text-xs font-bold text-gray-800">Prescription Attached ✅</p>
                        <button
                          type="button"
                          onClick={() => setPrescriptionUrl(null)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove / Re-upload
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-xs font-semibold text-teal-600 hover:underline">
                            {isUploadingRx ? 'Uploading...' : 'Click to Upload Prescription Photo'}
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG, or PDF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Checkout & Delivery Form (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <form onSubmit={handlePlaceOrder} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-5">
                <h3 className="font-poppins font-bold text-lg text-gray-900">Delivery & Payment</h3>

                {/* Delivery Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      deliveryType === 'delivery'
                        ? 'bg-white text-teal-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Truck className="w-4 h-4" /> Home Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      deliveryType === 'pickup'
                        ? 'bg-white text-teal-700 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Building className="w-4 h-4" /> Shop Pickup
                  </button>
                </div>

                {/* Customer Details Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (WhatsApp) *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {deliveryType === 'delivery' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address *</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <textarea
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Flat/House No, Street, Landmark, Ghaziabad..."
                          rows={2}
                          required
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Order Notes (Optional)</label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Please ring the doorbell twice"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Payment Option */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700">Select Payment Mode:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('COD')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMode === 'COD'
                          ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold text-xs text-gray-900">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Pay when order arrives</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('UPI')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMode === 'UPI'
                          ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-semibold text-xs text-gray-900">UPI / QR Code</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Pay via GPay / PhonePe</p>
                    </button>
                  </div>

                  {paymentMode === 'UPI' && (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-center space-y-1">
                      <p className="text-xs font-bold text-gray-800">Scan UPI QR on Delivery or Pay to:</p>
                      <p className="text-xs text-teal-700 font-mono font-semibold">7827558443@upi</p>
                      <p className="text-[10px] text-gray-400">Owner: Nishant Choudhary (H&H Pharmacy)</p>
                    </div>
                  )}
                </div>

                {/* Order Summary Breakdown */}
                <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span>₹{cartTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `₹${deliveryFee}`}</span>
                  </div>
                  {deliveryType === 'delivery' && cartTotal < 500 && (
                    <p className="text-[10px] text-teal-700">Add ₹{(500 - cartTotal).toFixed(0)} more for FREE Delivery!</p>
                  )}
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total Payable</span>
                    <span className="text-teal-700">₹{finalPayable.toFixed(0)}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-teal-700 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Processing Order...'
                  ) : (
                    <>
                      <span>Confirm Order • ₹{finalPayable.toFixed(0)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
