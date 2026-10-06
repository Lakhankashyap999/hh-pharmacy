import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    if (!q) return NextResponse.json([])

    const locations = await prisma.medicineLocation.findMany({
      where: {
        medicine: { name: { contains: q }, isActive: true },
      },
      include: { medicine: { select: { id: true, name: true, brand: true, genericName: true } } },
      take: 20,
    })

    return NextResponse.json(locations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to find locations' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const { medicineId, shelfLabel, rackNumber, section, coverLabel, description } = await req.json()
    const parsedMedId = parseInt(medicineId)
    if (isNaN(parsedMedId)) {
      return NextResponse.json({ error: 'Invalid medicine ID' }, { status: 400 })
    }

    const location = await prisma.medicineLocation.upsert({
      where: { medicineId: parsedMedId },
      create: {
        medicineId: parsedMedId,
        shelfLabel: shelfLabel || '',
        rackNumber: rackNumber || '',
        section: section || 'Middle',
        coverLabel: coverLabel || '',
        description: description || null,
      },
      update: {
        shelfLabel: shelfLabel || '',
        rackNumber: rackNumber || '',
        section: section || 'Middle',
        coverLabel: coverLabel || '',
        description: description || null,
      },
    })

    return NextResponse.json(location)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
