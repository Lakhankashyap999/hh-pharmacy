import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    const batches = await prisma.medicineBatch.findMany({
      where: {
        currentQuantity: { gt: 0 },
        ...(q
          ? {
              medicine: {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { brand: { contains: q, mode: 'insensitive' } },
                  { genericName: { contains: q, mode: 'insensitive' } },
                ],
              },
            }
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

    return NextResponse.json(Object.values(grouped), {
      headers: {
        'Cache-Control': 'private, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const body = await req.json()
    const { batchId, medicineId, change, reason, batchNumber, expiryDate, purchasePrice } = body

    const qtyChange = parseInt(change) || 0
    if (qtyChange === 0) {
      return NextResponse.json({ error: 'Quantity change cannot be zero' }, { status: 400 })
    }

    if (batchId) {
      const batch = await prisma.medicineBatch.findUnique({ where: { id: parseInt(batchId) } })
      if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 })

      const before = batch.currentQuantity
      const after = Math.max(0, before + qtyChange)

      await prisma.medicineBatch.update({
        where: { id: parseInt(batchId) },
        data: { currentQuantity: after },
      })

      await prisma.stockLog.create({
        data: {
          medicineId: batch.medicineId,
          batchId: batch.id,
          action: 'adjustment',
          quantityChange: qtyChange,
          quantityBefore: before,
          quantityAfter: after,
          reference: reason || 'Manual adjustment',
        },
      })
      return NextResponse.json({ success: true, before, after })
    } else {
      const parsedMedId = parseInt(medicineId)
      if (isNaN(parsedMedId)) {
        return NextResponse.json({ error: 'Invalid medicine ID' }, { status: 400 })
      }

      // Safe date parser
      let parsedExpiry = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
      if (expiryDate) {
        const testDate = new Date(expiryDate)
        if (!isNaN(testDate.getTime())) {
          parsedExpiry = testDate
        }
      }

      const generatedBatchNum =
        batchNumber?.trim() || `BATCH-M${parsedMedId}-${Date.now().toString().slice(-6)}`

      const newBatch = await prisma.medicineBatch.create({
        data: {
          medicineId: parsedMedId,
          batchNumber: generatedBatchNum,
          expiryDate: parsedExpiry,
          totalQuantity: Math.max(1, qtyChange),
          currentQuantity: Math.max(1, qtyChange),
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        },
      })

      await prisma.stockLog.create({
        data: {
          medicineId: parsedMedId,
          batchId: newBatch.id,
          action: 'restock',
          quantityChange: qtyChange,
          quantityBefore: 0,
          quantityAfter: qtyChange,
          reference: reason || `New batch ${generatedBatchNum} intake`,
        },
      })

      return NextResponse.json({ success: true, batch: newBatch }, { status: 201 })
    }
  } catch (error) {
    console.error('Stock adjustment error:', error)
    return NextResponse.json({ error: 'Failed to adjust stock' }, { status: 500 })
  }
}
