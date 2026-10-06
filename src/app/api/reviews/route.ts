import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser, requireUser } from '@/lib/serverAuth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const medicineId = searchParams.get('medicineId')
    const shopOnly = searchParams.get('shop') === 'true'
    const statusParam = searchParams.get('status')

    const sessionUser = await getSessionUser()
    const isAdmin = (sessionUser as any)?.role === 'admin'

    const where: any = {}

    // Admin can view all or filter by pending/rejected/approved
    if (isAdmin && statusParam) {
      if (statusParam !== 'all') {
        where.status = statusParam
      }
    } else {
      // Public customers only see approved reviews
      where.status = 'approved'
    }

    if (shopOnly) {
      where.medicineId = null
    } else if (medicineId) {
      where.medicineId = parseInt(medicineId)
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, image: true } },
        medicine: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Failed to get reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser()
    if (!auth.authorized) return auth.response!

    const user = auth.user!
    const { medicineId, rating, title, comment } = await req.json()

    const parsedRating = parseInt(rating)
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Valid rating between 1 and 5 is required' }, { status: 400 })
    }

    const userId = (user as any).id

    // Check if verified purchase
    let isVerified = false
    if (medicineId) {
      const parsedMedId = parseInt(medicineId)
      const purchase = await prisma.orderItem.findFirst({
        where: {
          medicineId: parsedMedId,
          order: { userId, status: 'delivered' },
        },
      })
      isVerified = !!purchase
    }

    const review = await prisma.review.create({
      data: {
        userId,
        medicineId: medicineId ? parseInt(medicineId) : null,
        rating: parsedRating,
        title: title?.trim() || null,
        comment: comment?.trim() || null,
        isVerifiedPurchase: isVerified,
        status: 'pending', // Requires admin moderation
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Failed to create review:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
