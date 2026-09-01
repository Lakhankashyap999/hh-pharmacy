import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  if (!q) return NextResponse.json([])

  const locations = await prisma.medicineLocation.findMany({
    where: {
      medicine: { name: { contains: q }, isActive: true },
    },
    include: { medicine: { select: { id: true, name: true, brand: true, genericName: true } } },
    take: 10,
  })

  return NextResponse.json(locations)
}

export async function PUT(req: NextRequest) {
  const { medicineId, shelfLabel, rackNumber, section, coverLabel, description } = await req.json()

  const location = await prisma.medicineLocation.upsert({
    where: { medicineId },
    create: { medicineId, shelfLabel, rackNumber, section, coverLabel, description },
    update: { shelfLabel, rackNumber, section, coverLabel, description },
  })

  return NextResponse.json(location)
}
