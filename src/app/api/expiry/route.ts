import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function GET(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const now = new Date()
    const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    const batches = await prisma.medicineBatch.findMany({
      where: { currentQuantity: { gt: 0 }, expiryDate: { lt: in90 } },
      include: { medicine: { select: { id: true, name: true, brand: true, unitType: true } } },
      orderBy: { expiryDate: 'asc' },
    })

    const categorized = batches.map((b) => {
      const daysLeft = Math.ceil((b.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      let status: 'expired' | 'critical' | 'warning'
      if (daysLeft <= 0) status = 'expired'
      else if (daysLeft <= 30) status = 'critical'
      else status = 'warning'
      return { ...b, daysLeft, status }
    })

    return NextResponse.json(categorized, {
      headers: {
        'Cache-Control': 'private, s-maxage=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expiry data' }, { status: 500 })
  }
}
