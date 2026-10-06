import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function GET(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const receipts = await prisma.billingReceipt.findMany({
      include: {
        batches: {
          include: {
            medicine: { select: { id: true, name: true, brand: true } },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(receipts)
  } catch (error) {
    console.error('Failed to get receipts:', error)
    return NextResponse.json({ error: 'Failed to retrieve receipts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const body = await req.json()
    const { imageUrl, extractedItems, supplier } = body

    if (!extractedItems || !Array.isArray(extractedItems) || extractedItems.length === 0) {
      return NextResponse.json({ error: 'No extracted items provided' }, { status: 400 })
    }

    const receipt = await prisma.billingReceipt.create({
      data: {
        imageUrl: imageUrl || '/placeholder-bill.jpg',
        status: 'processed',
        processedAt: new Date(),
        extractedData: JSON.stringify({ supplier: supplier || 'Wholesale Distributor', items: extractedItems }),
      },
    })

    // Create batches and stock logs for each extracted item
    for (const item of extractedItems) {
      // Find matching medicine by name (case-insensitive substring)
      const medicine = await prisma.medicine.findFirst({
        where: {
          OR: [
            { name: { contains: item.name } },
            { genericName: { contains: item.name } },
          ],
        },
      })

      if (medicine) {
        const qty = parseInt(item.quantity) || 50
        const batchNum = item.batchNumber?.trim() || `BILL-R${receipt.id}-${Date.now().toString().slice(-4)}`
        const expDate = item.expiryDate ? new Date(item.expiryDate) : new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)

        const batch = await prisma.medicineBatch.create({
          data: {
            medicineId: medicine.id,
            batchNumber: batchNum,
            expiryDate: isNaN(expDate.getTime()) ? new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) : expDate,
            totalQuantity: qty,
            currentQuantity: qty,
            purchasePrice: item.purchasePrice ? parseFloat(item.purchasePrice) : null,
            billingReceiptId: receipt.id,
          },
        })

        await prisma.stockLog.create({
          data: {
            medicineId: medicine.id,
            batchId: batch.id,
            action: 'restock',
            quantityChange: qty,
            quantityBefore: 0,
            quantityAfter: qty,
            reference: `Bill Receipt #${receipt.id} (${batchNum})`,
          },
        })
      }
    }

    return NextResponse.json(receipt, { status: 201 })
  } catch (error) {
    console.error('Receipt sync error:', error)
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 })
  }
}

// 1-Click Rollback endpoint
export async function DELETE(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '')
    if (isNaN(id)) return NextResponse.json({ error: 'Valid receipt ID required' }, { status: 400 })

    const receipt = await prisma.billingReceipt.findUnique({
      where: { id },
      include: { batches: true },
    })

    if (!receipt) return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })

    // Rollback batches created from this receipt
    for (const batch of receipt.batches) {
      await prisma.stockLog.create({
        data: {
          medicineId: batch.medicineId,
          batchId: batch.id,
          action: 'adjustment',
          quantityChange: -batch.currentQuantity,
          quantityBefore: batch.currentQuantity,
          quantityAfter: 0,
          reference: `Rollback of Receipt #${receipt.id}`,
        },
      })
      await prisma.medicineBatch.delete({ where: { id: batch.id } })
    }

    const updated = await prisma.billingReceipt.update({
      where: { id },
      data: { status: 'rolled_back' },
    })

    return NextResponse.json({ success: true, message: `Receipt #${id} successfully rolled back`, receipt: updated })
  } catch (error) {
    console.error('Rollback error:', error)
    return NextResponse.json({ error: 'Failed to rollback receipt' }, { status: 500 })
  }
}
