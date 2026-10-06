import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Building,
  Phone,
  ArrowLeft,
  FileText,
  MapPin,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getOrder(id: number) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { medicine: true },
      },
      address: true,
    },
  })
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orderId = parseInt(id)
  if (isNaN(orderId)) notFound()

  const order = await getOrder(orderId)
  if (!order) notFound()

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'preparing', label: 'Packing Medicine', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ]

  const currentStepIndex =
    order.status === 'cancelled'
      ? -1
      : statusSteps.findIndex((s) => s.key === order.status)

  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.medicine.name} (${
          item.quantityType === 'loose_units'
            ? `${item.looseUnitCount} Loose Tablets`
            : `${item.quantity} Strip(s)`
        }) - ₹${item.totalPrice.toFixed(0)}`
    )
    .join('\n')

  const rxNote = order.prescriptionImageUrl
    ? order.prescriptionImageUrl.startsWith('http')
      ? `\n\n*Prescription:* ${order.prescriptionImageUrl}`
      : '\n\n*Prescription:* Attached with order (Saved in Pharmacy portal)'
    : ''

  const fullWhatsappText = `*🔔 Order Confirmation - H&H Pharmacy*\n\n*Order:* #${order.orderNumber}\n*Customer:* ${order.customerName} (${order.customerPhone})\n*Total:* ₹${order.totalAmount.toFixed(0)} (${order.paymentMode})\n*Delivery:* ${order.deliveryType.toUpperCase()}\n*Address:* ${order.deliveryAddress || 'Shop Pickup'}\n\n*Items:*\n${itemsList}${rxNote}\n\nPlease confirm my order!`

  const whatsappMessage = encodeURIComponent(fullWhatsappText)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-10 w-full">
        {/* Success Header */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-xs mb-8">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-gray-900">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Order Number: <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-4 py-1.5 rounded-full">
            Payment Mode: {order.paymentMode} • Status: {order.status.toUpperCase()}
          </div>

          {/* Statutory Pharmacy & Licence Stamp */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-left text-xs bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/60">
            <div>
              <p className="font-bold text-gray-900">H &amp; H PHARMACY (Govt. Licensed Retailer)</p>
              <p className="text-[11px] text-gray-500">
                DL Form 20: <strong className="font-mono text-gray-800">RLF20UP2025007813</strong> • Form 21: <strong className="font-mono text-gray-800">RLF21UP2025007766</strong>
              </p>
              <p className="text-[11px] text-gray-500">
                Dispensed by: <strong>Mr. Ashwani Kumar (B.Pharma, Reg ID: 20257554956)</strong>
              </p>
            </div>
            <Link
              href="/licenses"
              className="text-[11px] text-teal-700 font-bold hover:underline bg-white px-2.5 py-1 rounded-lg border border-teal-200"
            >
              Verify Drug Licences &rarr;
            </Link>
          </div>
        </div>

        {/* Live Status Tracker */}
        {order.status !== 'cancelled' ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-xs mb-8">
            <h2 className="font-poppins font-bold text-base text-gray-900 mb-6">Live Order Status</h2>

            <div className="grid grid-cols-5 gap-2 relative">
              {statusSteps.map((step, index) => {
                const isPassed = index <= (currentStepIndex >= 0 ? currentStepIndex : 0)
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors mb-2 z-10 ${
                        isCurrent
                          ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-md'
                          : isPassed
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isPassed ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center text-red-800 text-sm font-semibold mb-8">
            This order was cancelled. {order.rejectionReason && `Reason: ${order.rejectionReason}`}
          </div>
        )}

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Order Items */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h3 className="font-poppins font-bold text-base text-gray-900">Medicines Ordered</h3>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{item.medicine.name}</p>
                    <p className="text-gray-500">
                      {item.quantityType === 'loose_units'
                        ? `${item.looseUnitCount} Loose Tablets`
                        : `${item.quantity} Strip(s)`}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">₹{item.totalPrice.toFixed(0)}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-sm text-gray-900">
              <span>Total Amount:</span>
              <span className="text-teal-700">₹{order.totalAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h3 className="font-poppins font-bold text-base text-gray-900">Delivery Information</h3>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                  <p className="text-gray-500 mt-0.5">{order.deliveryAddress}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Customer Contact: {order.customerPhone}</span>
              </div>

              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Pharmacy: H&H Pharmacy, Ghookna Mode (7827558443)</span>
              </div>
            </div>

            {/* Direct WhatsApp Contact Button */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <a
                href={`https://wa.me/917827558443?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                💬 Track via WhatsApp (Owner: Nishant)
              </a>
            </div>
          </div>
        </div>

        {/* Uploaded Prescription Section (if attached) */}
        {order.prescriptionImageUrl && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-3 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-poppins font-bold text-base text-gray-900">
                  Attached Doctor Prescription
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  order.prescriptionStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.prescriptionStatus === 'approved' ? '✅ Pharmacist Approved' : '⏳ Pending Pharmacist Review'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Our registered pharmacist (Mr. Ashwani Kumar) verifies your doctor prescription before dispatching your medicines.
            </p>
            <div className="mt-2 bg-gray-50 p-2 rounded-2xl border border-gray-200/70 inline-block">
              <img
                src={order.prescriptionImageUrl}
                alt="Doctor Prescription"
                className="max-h-72 rounded-xl object-contain"
              />
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/medicines"
            className="inline-flex items-center gap-2 text-teal-600 text-sm font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
