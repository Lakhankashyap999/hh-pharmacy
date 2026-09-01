import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const orderId = parseInt(id)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { medicine: true } },
      address: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const orderId = parseInt(id)
  const { status, prescriptionStatus, rejectionReason } = await req.json()
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      ...(status && { status }),
      ...(prescriptionStatus && { prescriptionStatus }),
      ...(rejectionReason && { rejectionReason }),
    },
  })

  // If cancelled, restore stock
  if (status === 'cancelled') {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    })
    for (const item of items) {
      if (item.batchId) {
        const units = item.quantityType === 'loose_units'
          ? (item.looseUnitCount || 0)
          : item.quantity * 10
        const batch = await prisma.medicineBatch.findUnique({ where: { id: item.batchId } })
        if (batch) {
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
              reference: `Order ${id} cancelled`,
            },
          })
        }
      }
    }
  }

  return NextResponse.json(order)
}
