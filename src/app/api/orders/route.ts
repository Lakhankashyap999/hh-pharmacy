import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const adminView = searchParams.get('admin') === 'true'

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

    // Create order items and reduce stock
    for (const item of data.items) {
      // Find best batch (FIFO: oldest expiry first with stock)
      const batch = await prisma.medicineBatch.findFirst({
        where: {
          medicineId: item.medicineId,
          currentQuantity: { gte: item.unitsToDeduct },
          expiryDate: { gt: new Date() },
        },
        orderBy: { expiryDate: 'asc' },
      })

      const unitsToDeduct = item.quantityType === 'loose_units'
        ? item.looseUnitCount
        : item.quantity * item.unitsPerPack

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
        const after = before - unitsToDeduct
        await prisma.medicineBatch.update({
          where: { id: batch.id },
          data: { currentQuantity: Math.max(0, after) },
        })
        await prisma.stockLog.create({
          data: {
            medicineId: item.medicineId,
            batchId: batch.id,
            action: 'sale',
            quantityChange: -unitsToDeduct,
            quantityBefore: before,
            quantityAfter: Math.max(0, after),
            reference: orderNumber,
          },
        })
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
