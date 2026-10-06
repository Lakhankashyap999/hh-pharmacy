'use client'

import { useState, useEffect } from 'react'
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
  Zap,
  X,
  AlertCircle,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useSession } from 'next-auth/react'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import toast from 'react-hot-toast'
import { fileToCompressedDataUrl } from '@/lib/imageCompress'

// Serviceable Ghaziabad delivery pincodes & keywords
const SERVICEABLE_PINCODES = ['201001', '201002', '201003', '201004', '201005', '201009', '201017']
const SERVICEABLE_KEYWORDS = [
  'ghaziabad',
  'ghookna',
  'ghookna mode',
  'sanjay nagar',
  'raj nagar',
  'patel nagar',
  'nandgram',
  'meerut road',
  'kavi nagar',
  'govindpuram',
  'shastri nagar',
  'gali no-3',
  'gali 3',
  'kh no-606',
]

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const {
    items,
    removeItem,
    updateQuantity,
    updateLooseUnits,
    clearCart,
    total,
    hasPrescriptionRequired,
    prescriptionFile,
    setPrescription,
  } = useCartStore()

  // Checkout form state
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery')
  const [customerName, setCustomerName] = useState(session?.user?.name || '')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [pincode, setPincode] = useState('201003')
  const [paymentMode, setPaymentMode] = useState<'COD' | 'UPI'>('COD')
  const prescriptionUrl = prescriptionFile
  const setPrescriptionUrl = setPrescription
  const [isUploadingRx, setIsUploadingRx] = useState(false)
  const [orderNotes, setOrderNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Unserviceable Location Modal
  const [showUnserviceableModal, setShowUnserviceableModal] = useState(false)

  const cartTotal = total()
  const deliveryFee = deliveryType === 'delivery' ? (cartTotal > 500 ? 0 : 40) : 0
  const finalPayable = cartTotal + deliveryFee
  const hasRxItems = hasPrescriptionRequired()

  const [queueStatus, setQueueStatus] = useState<any>(null)

  useEffect(() => {
    fetch('/api/orders?queue=true')
      .then((res) => res.json())
      .then((data) => setQueueStatus(data))
      .catch(() => {})
  }, [])

  // Verify delivery location serviceable
  const checkServiceableLocation = (addr: string, pin: string) => {
    const cleanPin = pin.trim()
    const cleanAddr = addr.toLowerCase()

    // If matching pincode or local keyword
    if (SERVICEABLE_PINCODES.includes(cleanPin)) return true
    for (const kw of SERVICEABLE_KEYWORDS) {
      if (cleanAddr.includes(kw)) return true
    }
    return false
  }

  // Prescription upload: compressed in the browser and stored with the order
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setIsUploadingRx(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      setPrescriptionUrl(dataUrl)
      toast.success('Prescription attached! 📋')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to attach prescription')
    } finally {
      setIsUploadingRx(false)
    }
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

    if (deliveryType === 'delivery') {
      if (!deliveryAddress.trim()) {
        toast.error('Please enter your complete delivery address')
        return
      }

      // Check distance & serviceable radius
      const isServiceable = checkServiceableLocation(deliveryAddress, pincode)
      if (!isServiceable) {
        setShowUnserviceableModal(true)
        return
      }
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
        customerEmail: session?.user?.email || null,
        deliveryType,
        deliveryAddress:
          deliveryType === 'delivery'
            ? `${deliveryAddress.trim()} (Pincode: ${pincode.trim()})`
            : 'Pickup from H&H Shop, Ghookna Mode, Gali No-03',
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
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      const orderData = await res.json()

      if (res.ok) {
        if (orderData.whatsappDispatchUrl && typeof window !== 'undefined') {
          sessionStorage.setItem('lastOrderWhatsapp', orderData.whatsappDispatchUrl)
        }
        clearCart()
        toast.success('Order placed successfully! 🚀', { duration: 5000 })
        router.push(`/order/${orderData.id}`)
      } else {
        toast.error(orderData.error || 'Failed to place order. Please try again.')
      }
    } catch {
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-poppins font-extrabold text-2xl md:text-3xl text-gray-900 flex items-center gap-2">
              <span>Your Medicine Cart</span>
              <span className="text-teal-600 text-base font-bold">({items.length} items)</span>
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              Review medicines, loose tablet quantities, 60-min Ghaziabad delivery &amp; upload doctor prescription
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-2xl w-fit">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{queueStatus?.message || '60 Min Delivery in Ghaziabad'}</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              🛒
            </div>
            <h2 className="font-poppins font-bold text-xl text-gray-900 mb-1">Your cart is empty</h2>
            <p className="text-xs text-gray-500 mb-6">
              Browse our medicine catalog to find OTC, Ayurvedic, and prescription medicines.
            </p>
            <Link
              href="/medicines"
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-colors shadow-sm text-xs cursor-pointer"
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
                <div className="bg-orange-50 border border-orange-200 rounded-3xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-orange-950 leading-relaxed">
                    <p className="font-bold">Doctor Prescription Required (Schedule H / H1):</p>
                    <p className="mt-0.5 text-orange-800">
                      Your cart includes medicines that legally require a doctor's prescription. Please attach your prescription photo below.
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
                    className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
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
                          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-xl shrink-0 overflow-hidden">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                            ) : (
                              '💊'
                            )}
                          </div>
                          <div>
                            <Link href={`/medicines/${item.id}`} className="font-bold text-xs sm:text-sm text-gray-900 hover:text-teal-600 transition-colors">
                              {item.name}
                            </Link>
                            <p className="text-[10px] text-gray-400">{item.brand}</p>
                            {item.requiresPrescription && (
                              <span className="inline-block mt-1 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                📋 Rx Required
                              </span>
                            )}
                            {/* Loose unit badge */}
                            {isLoose && (
                              <p className="text-[11px] text-teal-800 font-bold mt-1">
                                Loose Purchase: {item.looseUnitCount} tablets @ ₹{unitPrice.toFixed(1)}/each
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity controls & Price */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          {!isLoose ? (
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-gray-900 w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-2xl px-2.5 py-1">
                              <span className="text-xs text-teal-800 font-bold">
                                {item.looseUnitCount} Tablets
                              </span>
                            </div>
                          )}

                          <div className="text-right min-w-[70px]">
                            <p className="font-poppins font-extrabold text-sm text-gray-900">
                              ₹{itemTotal.toFixed(0)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {isLoose ? `₹${unitPrice.toFixed(1)}/unit` : `₹${item.price}/pack`}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Scan prescription CTA (when no prescription is attached and no Rx item forces it) */}
              {!hasRxItems && !prescriptionUrl && (
                <Link
                  href="/prescription"
                  className="flex items-center justify-between gap-3 bg-teal-50 border border-teal-200 rounded-2xl p-3 hover:bg-teal-100 transition-colors"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold text-teal-900">
                    <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                    Have a prescription? Scan it &amp; add medicines automatically
                  </span>
                  <ArrowRight className="w-4 h-4 text-teal-700 shrink-0" />
                </Link>
              )}

              {/* Prescription Upload / Attached Card */}
              {(hasRxItems || !!prescriptionUrl) && (
                <div className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-xs space-y-4">
                  <h3 className="font-poppins font-bold text-base text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    {hasRxItems ? "Doctor's Prescription (Required)" : "Doctor's Prescription (Attached)"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Upload a clear photo of your prescription showing Doctor's name, patient name, and medicines.{' '}
                    <Link href="/prescription" className="text-teal-600 font-bold hover:underline">
                      Scan &amp; auto-add medicines →
                    </Link>
                  </p>

                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-teal-400 transition-colors">
                    {prescriptionUrl ? (
                      <div className="space-y-2">
                        {prescriptionUrl.startsWith('data:image') ? (
                          <img
                            src={prescriptionUrl}
                            alt="Attached prescription"
                            className="w-24 h-28 object-cover rounded-xl border border-gray-200 mx-auto"
                          />
                        ) : (
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        )}
                        <p className="text-xs font-bold text-gray-800">Prescription Attached ✅</p>
                        <button
                          type="button"
                          onClick={() => setPrescriptionUrl(null)}
                          className="text-xs text-red-500 hover:underline cursor-pointer"
                        >
                          Remove / Re-upload
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-xs font-bold text-teal-600 hover:underline">
                            {isUploadingRx ? 'Uploading...' : 'Click to Upload Prescription Photo'}
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-gray-400 mt-1">Photo (JPG/PNG) up to 8MB, or PDF up to 3MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Checkout & Delivery Form (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <form onSubmit={handlePlaceOrder} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-base text-gray-900">Delivery &amp; Payment</h3>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    ⚡ 60 MINS
                  </span>
                </div>

                {/* Delivery Mode Toggle */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Truck className="w-4 h-4" /> Home Delivery (60 Min)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'bg-white text-teal-800 shadow-xs'
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
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
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
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {deliveryType === 'delivery' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Ghaziabad Delivery Area *</label>
                          <input
                            type="text"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="e.g. House No, Gali No-3, Ghookna Mode"
                            required
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
                          <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="201003"
                            required
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-400">
                        📍 60-min delivery available across Ghaziabad (Pincodes 201001 to 201017, Ghookna Mode, Sanjay Nagar, Raj Nagar).
                      </p>
                    </div>
                  )}

                  {deliveryType === 'pickup' && (
                    <div className="bg-teal-50 p-3 rounded-2xl border border-teal-100 text-xs text-teal-950 space-y-1">
                      <p className="font-bold">🏬 Shop Pickup Address:</p>
                      <p className="text-teal-800">
                        Plot No-7, Kh No-606, Shop No-01, Ghookna Mode, Gali No-03, Ghaziabad
                      </p>
                      <p className="text-[10px] text-teal-700">Call on arrival: 7827558443 / 8171093455</p>
                    </div>
                  )}
                </div>

                {/* Payment Option */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700">Select Payment Mode:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('COD')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMode === 'COD'
                          ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-bold text-xs text-gray-900">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Pay when order arrives</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('UPI')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMode === 'UPI'
                          ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-bold text-xs text-gray-900">UPI / QR Code</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Pay via GPay / PhonePe</p>
                    </button>
                  </div>

                  {paymentMode === 'UPI' && (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-center space-y-1">
                      <p className="text-xs font-bold text-gray-800">Pay to Pharmacy UPI ID:</p>
                      <p className="text-xs text-teal-700 font-mono font-bold">7827558443@upi</p>
                      <p className="text-[10px] text-gray-400">Owners: Nishant Choudhary &amp; Harsh Kashyap</p>
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
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE (Orders &gt; ₹500)</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total Payable</span>
                    <span className="text-teal-700 font-extrabold">₹{finalPayable.toFixed(0)}</span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal-600 text-white font-extrabold py-3.5 px-6 rounded-2xl hover:bg-teal-700 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

                {/* UP Govt FDA Trust & Licence Badge */}
                <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200/80 text-[11px] text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>UP Govt. FDA Retail Licences</span>
                  </div>
                  <p className="text-emerald-800">
                    DL Form 20: <strong className="font-mono">RLF20UP2025007813</strong> • Form 21: <strong className="font-mono">RLF21UP2025007766</strong>
                  </p>
                  <p className="text-emerald-800">
                    Dispensed strictly by Qualified Pharmacist: <strong>Mr. Ashwani Kumar (B.Pharma, Reg #20257554956)</strong>
                  </p>
                  <Link href="/licenses" className="text-teal-700 font-bold hover:underline inline-block pt-0.5">
                    View Original Certificates &rarr;
                  </Link>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Unserviceable Location Alert Modal */}
      {showUnserviceableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4"
          >
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-poppins font-bold text-lg text-gray-900">
                Delivery Unavailable at this Location
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Aapka address hamare <strong>60-minute Ghaziabad delivery zone</strong> se bahar hai. Hamari instant delivery Ghookna Mode aur Ghaziabad radius mein uplabdh hai.
              </p>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Solution:</p>
              <p>1. Aap <strong>Shop Pickup</strong> select karke dukan se davai le sakte hain.</p>
              <p>2. Ya Ghaziabad ka delivery address enter karein.</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeliveryType('pickup')
                  setShowUnserviceableModal(false)
                  toast.success('Switched to Shop Pickup! You can now place order.')
                }}
                className="w-full py-3 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 cursor-pointer"
              >
                🏪 Switch to Shop Pickup (Ghookna Mode)
              </button>

              <button
                type="button"
                onClick={() => setShowUnserviceableModal(false)}
                className="w-full py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-200 cursor-pointer"
              >
                Change Delivery Address / Pincode
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  )
}
