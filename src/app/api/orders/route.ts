import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const adminView = searchParams.get('admin') === 'true'
    const queueCheck = searchParams.get('queue') === 'true'

    // Queue / Peak Rush Load Status
    if (queueCheck) {
      const pendingCount = await prisma.order.count({
        where: { status: { in: ['pending', 'confirmed', 'preparing'] } },
      })

      let estimatedMinutes = 60
      let rushLevel = 'normal'
      let message = '⚡ 60-Min Fast Home Delivery in Ghaziabad'

      if (pendingCount >= 12) {
        estimatedMinutes = 120
        rushLevel = 'peak'
        message = '🔥 High Demand Rush: Home Delivery in ~90-120 mins'
      } else if (pendingCount >= 6) {
        estimatedMinutes = 90
        rushLevel = 'busy'
        message = '⏳ High Order Volume: Home Delivery in ~75-90 mins'
      }

      return NextResponse.json({
        pendingOrders: pendingCount,
        estimatedMinutes,
        rushLevel,
        message,
        shopPickupAvailable: true,
        shopPickupEta: '5-10 mins (Counter Ready)',
      })
    }

    const where: any = {}
    if (userId && !adminView) where.userId = userId

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { medicine: { select: { name: true, brand: true, imageUrl: true, unitType: true } } },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
      take: adminView ? 100 : 20,
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Generate order number
    const count = await prisma.order.count()
    const orderNumber = `HH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(count + 1).padStart(3, '0')}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress || null,
        deliveryType: data.deliveryType || 'pickup',
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount || 0,
        paymentMode: data.paymentMode || 'COD',
        prescriptionImageUrl: data.prescriptionImageUrl || null,
        prescriptionStatus: data.hasPrescriptionItems ? 'pending' : 'not_required',
        notes: data.notes || null,
      },
    })

    const itemsSummary: string[] = []

    // Create order items and reduce stock
    for (const item of data.items) {
      const unitsToDeduct =
        item.quantityType === 'loose_units'
          ? (item.looseUnitCount || 1)
          : item.quantity * (item.unitsPerPack || 10)

      // Find best batch (FIFO: oldest non-expired batch with stock)
      const batch = await prisma.medicineBatch.findFirst({
        where: {
          medicineId: item.medicineId,
          currentQuantity: { gte: 1 },
          expiryDate: { gt: new Date() },
        },
        orderBy: { expiryDate: 'asc' },
      })

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          medicineId: item.medicineId,
          batchId: batch?.id || null,
          quantity: item.quantity,
          quantityType: item.quantityType || 'full_pack',
          looseUnitCount: item.looseUnitCount || null,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        },
      })

      // Reduce stock
      if (batch) {
        const before = batch.currentQuantity
        const after = Math.max(0, before - unitsToDeduct)
        await prisma.medicineBatch.update({
          where: { id: batch.id },
          data: { currentQuantity: after },
        })
        await prisma.stockLog.create({
          data: {
            medicineId: item.medicineId,
            batchId: batch.id,
            action: 'sale',
            quantityChange: -unitsToDeduct,
            quantityBefore: before,
            quantityAfter: after,
            reference: `Order ${orderNumber}`,
          },
        })
      }
    }

    // Send confirmation email via Resend if configured
    if (resend && data.customerEmail) {
      try {
        await resend.emails.send({
          from: 'H&H Pharmacy <orders@hhpharmacy.in>',
          to: data.customerEmail,
          subject: `Order Confirmed: #${orderNumber} - H&H Pharmacy`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
              <h2 style="color: #0d9488;">Thank you for your order with H&H Pharmacy!</h2>
              <p><strong>Order Number:</strong> #${orderNumber}</p>
              <p><strong>Customer:</strong> ${data.customerName} (${data.customerPhone})</p>
              <p><strong>Delivery Option:</strong> ${data.deliveryType.toUpperCase()}</p>
              <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
              <p><strong>Shop Location:</strong> Ghookna Mode, Gali No-03, Ghaziabad</p>
              <p>For urgent questions, contact <strong>Nishant Choudhary (7827558443)</strong> or <strong>Harsh Kashyap (8171093455)</strong>.</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.warn('Resend email notice:', emailErr)
      }
    }

    return NextResponse.json(
      {
        ...order,
        whatsappDispatchUrl: `https://wa.me/917827558443?text=${encodeURIComponent(
          `*New Order Alert - H&H Pharmacy*\nOrder: #${orderNumber}\nCustomer: ${data.customerName} (${data.customerPhone})\nType: ${data.deliveryType.toUpperCase()}\nTotal: ₹${data.totalAmount}\nAddress: ${data.deliveryAddress || 'Shop Pickup'}`
        )}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
