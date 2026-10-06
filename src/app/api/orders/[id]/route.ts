import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, getSessionUser } from '@/lib/serverAuth'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const orderId = parseInt(id)
    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { medicine: true } },
        address: true,
      },
    })
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Optional: check if caller is owner or admin
    const user = await getSessionUser()
    const isAdmin = (user as any)?.role === 'admin'
    if (order.userId && user && !isAdmin && order.userId !== (user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const { id } = await context.params
    const orderId = parseInt(id)
    if (isNaN(orderId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const { status, prescriptionStatus, rejectionReason } = await req.json()

    // Fetch existing order to check previous status
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { medicine: true },
        },
      },
    })
    if (!existingOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status }),
        ...(prescriptionStatus && { prescriptionStatus }),
        ...(rejectionReason && { rejectionReason }),
      },
    })

    // If newly cancelled, restore exact stock using medicine unitsPerPack
    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      for (const item of existingOrder.items) {
        if (item.batchId) {
          const unitsPerPack = item.medicine?.unitsPerPack || 10
          const units =
            item.quantityType === 'loose_units'
              ? (item.looseUnitCount || 0)
              : item.quantity * unitsPerPack

          const batch = await prisma.medicineBatch.findUnique({ where: { id: item.batchId } })
          if (batch && units > 0) {
            await prisma.medicineBatch.update({
              where: { id: item.batchId },
              data: { currentQuantity: batch.currentQuantity + units },
            })
            await prisma.stockLog.create({
              data: {
                medicineId: item.medicineId,
                batchId: item.batchId,
                action: 'adjustment',
                quantityChange: units,
                quantityBefore: batch.currentQuantity,
                quantityAfter: batch.currentQuantity + units,
                reference: `Order #${existingOrder.orderNumber} cancelled - stock restored`,
              },
            })
          }
        }
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
