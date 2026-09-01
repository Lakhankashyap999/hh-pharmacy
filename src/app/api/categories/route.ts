import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const cat = await prisma.category.create({ data })
  return NextResponse.json(cat, { status: 201 })
}
