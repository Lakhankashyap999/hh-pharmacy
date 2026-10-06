import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { getSessionUser } from '@/lib/serverAuth'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const adminView = searchParams.get('admin') === 'true'
    const queueCheck = searchParams.get('queue') === 'true'

    // Live Queue / Peak Rush Load Status
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
        shopPickupEta: '5-10 mins (Counter Ready at Ghookna Mode)',
      })
    }

    const sessionUser = await getSessionUser()
    const isAdmin = (sessionUser as any)?.role === 'admin'

    const where: any = {}
    if (adminView) {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
      }
    } else if (userId) {
      where.userId = userId
    } else if (sessionUser && (sessionUser as any).id) {
      where.userId = (sessionUser as any).id
    }

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

    return NextResponse.json(orders, {
      headers: {
        'Cache-Control': 'private, s-maxage=5, stale-while-revalidate=15',
      },
    })
  } catch (error) {
    console.error('Failed to get orders:', error)
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validate customer info
    if (!data.customerName?.trim() || !data.customerPhone?.trim()) {
      return NextResponse.json({ error: 'Customer name and phone number are required' }, { status: 400 })
    }
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const medicineIds = data.items.map((i: any) => parseInt(i.medicineId))
    const dbMedicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds }, isActive: true },
      include: {
        batches: {
          where: { currentQuantity: { gt: 0 }, expiryDate: { gt: new Date() } },
          orderBy: { expiryDate: 'asc' },
        },
      },
    })

    const medicineMap = new Map(dbMedicines.map((m) => [m.id, m]))

    // 1. Validate each item and calculate price SERVER-SIDE
    let calculatedSubtotal = 0
    let requiresRx = false
    const validatedItems: Array<{
      medicineId: number
      medicineName: string
      unitsToDeduct: number
      quantity: number
      quantityType: string
      looseUnitCount: number | null
      unitPrice: number
      totalPrice: number
      batches: typeof dbMedicines[0]['batches']
      drugSchedule: string
    }> = []

    for (const item of data.items) {
      const medId = parseInt(item.medicineId)
      const med = medicineMap.get(medId)

      if (!med) {
        return NextResponse.json({ error: `Medicine not found or inactive (ID: ${medId})` }, { status: 400 })
      }

      if (med.drugSchedule === 'X') {
        return NextResponse.json(
          { error: `Schedule X drug (${med.name}) cannot be ordered online. In-person pharmacy visit required by law.` },
          { status: 400 }
        )
      }

      if (med.requiresPrescription || med.drugSchedule === 'H' || med.drugSchedule === 'H1') {
        requiresRx = true
      }

      const isLoose = item.quantityType === 'loose_units'
      const qty = Math.max(1, parseInt(item.quantity) || 1)
      const looseCount = isLoose ? Math.max(1, Math.min(med.unitsPerPack, parseInt(item.looseUnitCount) || 1)) : null

      const unitsToDeduct = isLoose ? looseCount! : qty * med.unitsPerPack

      // Check stock across non-expired batches
      const totalAvailableUnits = med.batches.reduce((sum, b) => sum + b.currentQuantity, 0)
      if (totalAvailableUnits < unitsToDeduct) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${med.name}. Available: ${totalAvailableUnits} units, requested: ${unitsToDeduct} units.`,
          },
          { status: 400 }
        )
      }

      // Compute tamper-proof price from DB
      let unitPrice = 0
      let totalPrice = 0
      if (isLoose) {
        unitPrice = Math.round((med.sellingPrice / med.unitsPerPack) * 100) / 100
        totalPrice = Math.round(unitPrice * looseCount! * 100) / 100
      } else {
        unitPrice = med.sellingPrice
        totalPrice = Math.round(unitPrice * qty * 100) / 100
      }

      calculatedSubtotal += totalPrice

      validatedItems.push({
        medicineId: med.id,
        medicineName: med.name,
        unitsToDeduct,
        quantity: qty,
        quantityType: isLoose ? 'loose_units' : 'full_pack',
        looseUnitCount: looseCount,
        unitPrice,
        totalPrice,
        batches: med.batches,
        drugSchedule: med.drugSchedule,
      })
    }

    if (requiresRx && !data.prescriptionImageUrl) {
      return NextResponse.json(
        { error: 'Doctor prescription is required for Schedule H/H1 medicines in your order.' },
        { status: 400 }
      )
    }

    if (data.prescriptionImageUrl) {
      const rx = String(data.prescriptionImageUrl)
      const okFormat = /^data:(image\/(jpeg|jpg|png|webp)|application\/pdf);base64,/.test(rx) || /^\/uploads\//.test(rx)
      if (!okFormat || rx.length > 4_500_000) {
        return NextResponse.json(
          { error: 'Prescription file is invalid or too large. Please re-attach a smaller photo.' },
          { status: 400 }
        )
      }
    }

    const deliveryType = data.deliveryType === 'delivery' ? 'delivery' : 'pickup'
    const deliveryFee = deliveryType === 'delivery' ? (calculatedSubtotal > 500 ? 0 : 40) : 0
    const finalTotal = calculatedSubtotal + deliveryFee

    // 2. Execute order creation and multi-batch FIFO stock deduction in a single transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      const count = await tx.order.count()
      const orderNumber = `HH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(count + 1).padStart(3, '0')}`

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: data.userId || null,
          customerName: data.customerName.trim(),
          customerPhone: data.customerPhone.trim(),
          deliveryAddress: data.deliveryAddress?.trim() || null,
          deliveryType,
          totalAmount: finalTotal,
          discountAmount: 0,
          paymentMode: data.paymentMode === 'UPI' ? 'UPI' : 'COD',
          prescriptionImageUrl: data.prescriptionImageUrl || null,
          prescriptionStatus: requiresRx ? 'pending' : 'not_required',
          notes: data.notes?.trim() || null,
        },
      })

      // Multi-batch FIFO deduction
      for (const item of validatedItems) {
        let remainingNeeded = item.unitsToDeduct
        let primaryBatchId: number | null = null

        for (const batch of item.batches) {
          if (remainingNeeded <= 0) break

          const deductFromThisBatch = Math.min(batch.currentQuantity, remainingNeeded)
          if (deductFromThisBatch > 0) {
            if (!primaryBatchId) primaryBatchId = batch.id

            const beforeQty = batch.currentQuantity
            const afterQty = beforeQty - deductFromThisBatch

            await tx.medicineBatch.update({
              where: { id: batch.id },
              data: { currentQuantity: afterQty },
            })

            await tx.stockLog.create({
              data: {
                medicineId: item.medicineId,
                batchId: batch.id,
                action: 'sale',
                quantityChange: -deductFromThisBatch,
                quantityBefore: beforeQty,
                quantityAfter: afterQty,
                reference: `Order #${orderNumber}`,
              },
            })

            remainingNeeded -= deductFromThisBatch
          }
        }

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            medicineId: item.medicineId,
            batchId: primaryBatchId,
            quantity: item.quantity,
            quantityType: item.quantityType,
            looseUnitCount: item.looseUnitCount,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          },
        })

        // Statutory requirement: Log Schedule H1 & X drugs into statutory register
        if (item.drugSchedule === 'H1' || item.drugSchedule === 'X') {
          const matchedBatch = item.batches.find((b) => b.id === primaryBatchId)
          await tx.drugRegister.create({
            data: {
              orderId: createdOrder.id,
              medicineId: item.medicineId,
              batchId: primaryBatchId,
              medicineName: item.medicineName,
              batchNumber: matchedBatch?.batchNumber || 'BATCH-STATUTORY',
              quantitySold: item.unitsToDeduct,
              customerName: data.customerName.trim(),
              customerAddress: data.deliveryAddress?.trim() || 'Ghaziabad',
              prescriptionImageUrl: data.prescriptionImageUrl || null,
              soldBy: 'Pharmacist (H&H Pharmacy)',
            },
          })
        }
      }

      return createdOrder
    })

    // Construct formatted WhatsApp dispatch URL for owner alert
    const itemsText = validatedItems
      .map(
        (i) =>
          `• ${i.medicineName} (${i.quantityType === 'loose_units' ? `${i.looseUnitCount} Loose Tablets` : `${i.quantity} Strip(s)`}) - ₹${i.totalPrice}`
      )
      .join('\n')

    const rxNote = orderResult.prescriptionImageUrl
      ? orderResult.prescriptionImageUrl.startsWith('data:')
        ? `\n\n*Prescription:* Attached ✅ (view in Admin → Orders → #${orderResult.orderNumber})`
        : `\n\n*Prescription Photo:* ${orderResult.prescriptionImageUrl}`
      : ''

    const whatsappText = `*🔔 NEW ORDER ALERT - H&H Pharmacy*\n\n*Order:* #${orderResult.orderNumber}\n*Customer:* ${data.customerName.trim()} (${data.customerPhone.trim()})\n*Type:* ${deliveryType === 'delivery' ? '60-MIN HOME DELIVERY' : 'SHOP PICKUP'}\n*Address:* ${data.deliveryAddress || 'Ghookna Mode Shop Pickup'}\n*Total:* ₹${finalTotal.toFixed(0)} (${data.paymentMode === 'UPI' ? 'UPI' : 'Cash on Delivery'})\n\n*Items Ordered:*\n${itemsText}${rxNote}`

    const whatsappDispatchUrl = `https://wa.me/917827558443?text=${encodeURIComponent(whatsappText)}`

    // Optional email confirmation via Resend
    if (resend && data.customerEmail) {
      try {
        await resend.emails.send({
          from: 'H&H Pharmacy <orders@hhpharmacy.in>',
          to: data.customerEmail,
          subject: `Order Confirmed: #${orderResult.orderNumber} - H&H Pharmacy`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
              <h2 style="color: #0d9488; margin-top: 0;">Order Confirmed!</h2>
              <p>Hi ${data.customerName},</p>
              <p>Your order <strong>#${orderResult.orderNumber}</strong> has been received by H&H Pharmacy.</p>
              <p><strong>Total Amount:</strong> ₹${finalTotal.toFixed(0)} (${data.paymentMode})</p>
              <p><strong>Type:</strong> ${deliveryType === 'delivery' ? '60-Min Home Delivery' : 'Shop Pickup'}</p>
              <p><strong>Delivery Location:</strong> ${data.deliveryAddress || 'Ghookna Mode Shop'}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
              <p style="font-size: 12px; color: #6b7280;">H&H Pharmacy, Plot No-7, Kh No-606, Ghookna Mode, Gali No-03, Ghaziabad. Contact: 7827558443 / 8171093455.</p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.warn('Resend email notice:', emailErr)
      }
    }

    return NextResponse.json({ ...orderResult, whatsappDispatchUrl }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
  }
}
