import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('q') || searchParams.get('search') || ''
    const categoryId = searchParams.get('category')
    const schedule = searchParams.get('schedule')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sort = searchParams.get('sort') || 'newest'

    const where: any = { isActive: true }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameHindi: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId) where.categoryId = parseInt(categoryId)
    if (schedule) {
      if (schedule === 'OTC') where.drugSchedule = 'OTC'
      else if (schedule === 'rx') where.requiresPrescription = true
    }

    const orderBy: any =
      sort === 'price_asc' ? { sellingPrice: 'asc' }
      : sort === 'price_desc' ? { sellingPrice: 'desc' }
      : sort === 'discount' ? { discountPercent: 'desc' }
      : { createdAt: 'desc' }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        select: {
          id: true,
          name: true,
          nameHindi: true,
          genericName: true,
          brand: true,
          manufacturer: true,
          mrp: true,
          sellingPrice: true,
          discountPercent: true,
          unitType: true,
          unitsPerPack: true,
          drugSchedule: true,
          requiresPrescription: true,
          imageUrl: true,
          isActive: true,
          categoryId: true,
          category: {
            select: { id: true, name: true, nameHindi: true, color: true, icon: true },
          },
          batches: {
            where: { expiryDate: { gt: new Date() } },
            select: { currentQuantity: true, expiryDate: true },
          },
          reviews: { where: { status: 'approved' }, select: { rating: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.medicine.count({ where }),
    ])

    return NextResponse.json(
      { medicines, total, page, pages: Math.ceil(total / limit) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch medicines:', error)
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const data = await req.json()
    const medicine = await prisma.medicine.create({
      data: {
        name: data.name,
        nameHindi: data.nameHindi || null,
        genericName: data.genericName || null,
        brand: data.brand || null,
        manufacturer: data.manufacturer || null,
        description: data.description || null,
        usageInstructions: data.usageInstructions || null,
        sideEffects: data.sideEffects || null,
        mrp: parseFloat(data.mrp),
        sellingPrice: parseFloat(data.sellingPrice),
        discountPercent: parseFloat(data.discountPercent || 0),
        unitType: data.unitType || 'strip',
        unitsPerPack: parseInt(data.unitsPerPack || 10),
        drugSchedule: data.drugSchedule || 'OTC',
        isNarcotic: data.isNarcotic || false,
        requiresPrescription: data.requiresPrescription || false,
        maxQtyPerOrder: parseInt(data.maxQtyPerOrder || 10),
        imageUrl: data.imageUrl || null,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })
    return NextResponse.json(medicine, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 })
  }
}
