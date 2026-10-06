import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function GET(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const entries = await prisma.drugRegister.findMany({
      include: {
        medicine: { select: { id: true, name: true, brand: true, drugSchedule: true } },
        batch: { select: { batchNumber: true, expiryDate: true } },
        order: { select: { orderNumber: true, customerName: true, customerPhone: true } },
      },
      orderBy: { saleDate: 'desc' },
      take: 100,
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Failed to get drug register:', error)
    return NextResponse.json({ error: 'Failed to retrieve drug register' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const body = await req.json()
    const {
      medicineId,
      medicineName,
      batchNumber,
      quantitySold,
      customerName,
      customerAddress,
      doctorName,
      doctorRegNumber,
      soldBy,
      remarks,
    } = body

    if (!medicineId || !quantitySold || !customerName) {
      return NextResponse.json(
        { error: 'Medicine, quantity, and customer name are required' },
        { status: 400 }
      )
    }

    const med = await prisma.medicine.findUnique({
      where: { id: Number(medicineId) },
    })
    if (!med) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
    }

    const entry = await prisma.drugRegister.create({
      data: {
        medicineId: med.id,
        medicineName: medicineName || med.name,
        batchNumber: batchNumber || 'MANUAL-SALE',
        quantitySold: Number(quantitySold),
        customerName: String(customerName).trim(),
        customerAddress: customerAddress ? String(customerAddress).trim() : null,
        doctorName: doctorName ? String(doctorName).trim() : 'Prescribed Physician',
        doctorRegNumber: doctorRegNumber ? String(doctorRegNumber).trim() : 'N/A',
        soldBy: soldBy ? String(soldBy).trim() : 'Harsh Kashyap / Nishant Choudhary',
        remarks: remarks ? String(remarks).trim() : 'Manual Counter Entry',
      },
      include: {
        medicine: { select: { id: true, name: true, brand: true, drugSchedule: true } },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Failed to create drug register entry:', error)
    return NextResponse.json({ error: 'Failed to record entry in statutory register' }, { status: 500 })
  }
}
