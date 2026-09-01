import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const reviewId = parseInt(id)
  const { status, adminReply } = await req.json()
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(status && { status }),
      ...(adminReply && { adminReply, adminReplyDate: new Date() }),
    },
  })
  return NextResponse.json(review)
}
