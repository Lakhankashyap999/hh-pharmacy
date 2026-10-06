import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

    const { id } = await context.params
    const reviewId = parseInt(id)
    if (isNaN(reviewId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const { status, adminReply } = await req.json()

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(status && { status }),
        ...(adminReply !== undefined && {
          adminReply: adminReply?.trim() || null,
          adminReplyDate: adminReply?.trim() ? new Date() : null,
        }),
      },
    })
    return NextResponse.json(review)
  } catch (error) {
    console.error('Failed to moderate review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}
