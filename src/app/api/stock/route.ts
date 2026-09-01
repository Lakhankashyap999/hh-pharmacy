import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    const batches = await prisma.medicineBatch.findMany({
      where: {
        currentQuantity: { gt: 0 },
        ...(q
          ? { medicine: { name: { contains: q } } }
          : {}),
      },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            nameHindi: true,
            brand: true,
            unitType: true,
            unitsPerPack: true,
            categoryId: true,
            category: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    })

    // Group by medicine
    const grouped: Record<number, any> = {}
    for (const b of batches) {
      const id = b.medicineId
      if (!grouped[id]) {
        grouped[id] = {
          medicine: b.medicine,
          medicineId: id,
          batches: [],
          totalUnits: 0,
        }
      }
      grouped[id].batches.push(b)
      grouped[id].totalUnits += b.currentQuantity
    }

    return NextResponse.json(Object.values(grouped))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { batchId, medicineId, change, reason } = await req.json()

    if (batchId) {
      const batch = await prisma.medicineBatch.findUnique({ where: { id: batchId } })
      if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })

      const before = batch.currentQuantity
      const after = Math.max(0, before + parseInt(change))

      await prisma.medicineBatch.update({
        where: { id: batchId },
        data: { currentQuantity: after },
      })
      await prisma.stockLog.create({
        data: {
          medicineId,
          batchId,
          action: 'adjustment',
          quantityChange: parseInt(change),
          quantityBefore: before,
          quantityAfter: after,
          reference: reason || 'Manual adjustment',
        },
      })
      return NextResponse.json({ success: true, before, after })
    } else {
      // Create new batch if no batchId provided
      const newBatch = await prisma.medicineBatch.create({
        data: {
          medicineId,
          batchNumber: `BATCH-M${medicineId}-${new Date().getFullYear()}`,
          expiryDate: new Date('2028-12-31'),
          totalQuantity: parseInt(change),
          currentQuantity: parseInt(change),
        },
      })
      await prisma.stockLog.create({
        data: {
          medicineId,
          batchId: newBatch.id,
          action: 'restock',
          quantityChange: parseInt(change),
          quantityBefore: 0,
          quantityAfter: parseInt(change),
          reference: reason || 'New batch intake',
        },
      })
      return NextResponse.json({ success: true, batch: newBatch })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
