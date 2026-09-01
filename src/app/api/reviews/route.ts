import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const medicineId = searchParams.get('medicineId')
  const shopOnly = searchParams.get('shop') === 'true'

  const where: any = { status: 'approved' }
  if (shopOnly) where.medicineId = null
  else if (medicineId) where.medicineId = parseInt(medicineId)

  const reviews = await prisma.review.findMany({
    where,
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const { userId, medicineId, rating, title, comment } = await req.json()
  if (!userId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Check if verified purchase
  let isVerified = false
  if (medicineId) {
    const purchase = await prisma.orderItem.findFirst({
      where: {
        medicineId: parseInt(medicineId),
        order: { userId, status: 'delivered' },
      },
    })
    isVerified = !!purchase
  }

  const review = await prisma.review.create({
    data: {
      userId,
      medicineId: medicineId ? parseInt(medicineId) : null,
      rating: parseInt(rating),
      title: title || null,
      comment: comment || null,
      isVerifiedPurchase: isVerified,
      status: 'pending',
    },
  })

  return NextResponse.json(review, { status: 201 })
}
