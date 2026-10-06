import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const medicineId = parseInt(id)
    if (isNaN(medicineId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
      include: {
        category: true,
        batches: { orderBy: { expiryDate: 'asc' } },
        location: true,
        reviews: {
          where: { status: 'approved' },
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!medicine) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(medicine)
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const { id } = await context.params
    const medicineId = parseInt(id)
    if (isNaN(medicineId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const data = await req.json()
    const medicine = await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameHindi !== undefined && { nameHindi: data.nameHindi || null }),
        ...(data.genericName !== undefined && { genericName: data.genericName || null }),
        ...(data.brand !== undefined && { brand: data.brand || null }),
        ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer || null }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.usageInstructions !== undefined && { usageInstructions: data.usageInstructions || null }),
        ...(data.sideEffects !== undefined && { sideEffects: data.sideEffects || null }),
        ...(data.mrp !== undefined && { mrp: parseFloat(data.mrp) }),
        ...(data.sellingPrice !== undefined && { sellingPrice: parseFloat(data.sellingPrice) }),
        ...(data.discountPercent !== undefined && { discountPercent: parseFloat(data.discountPercent || 0) }),
        ...(data.unitType && { unitType: data.unitType }),
        ...(data.unitsPerPack !== undefined && { unitsPerPack: parseInt(data.unitsPerPack || 10) }),
        ...(data.drugSchedule && { drugSchedule: data.drugSchedule }),
        ...(data.isNarcotic !== undefined && { isNarcotic: data.isNarcotic }),
        ...(data.requiresPrescription !== undefined && { requiresPrescription: data.requiresPrescription }),
        ...(data.maxQtyPerOrder !== undefined && { maxQtyPerOrder: parseInt(data.maxQtyPerOrder || 10) }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId ? parseInt(data.categoryId) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
    return NextResponse.json(medicine)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const { id } = await context.params
    const medicineId = parseInt(id)
    if (isNaN(medicineId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    await prisma.medicine.update({ where: { id: medicineId }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 })
  }
}
