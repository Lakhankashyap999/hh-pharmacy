import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import MedicinesClient from './MedicinesClient'

export const dynamic = 'force-dynamic'

async function getMedicines(params: any) {
  const search = params?.search || params?.q || ''
  const category = params?.category ? parseInt(params.category) : undefined
  const schedule = params?.schedule

  const where: any = { isActive: true }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { genericName: { contains: search } },
      { brand: { contains: search } },
    ]
  }
  if (category) where.categoryId = category
  if (schedule === 'OTC') where.drugSchedule = 'OTC'
  if (schedule === 'rx') where.requiresPrescription = true

  const [medicines, categories] = await Promise.all([
    prisma.medicine.findMany({
      where,
      include: {
        category: true,
        batches: {
          where: { expiryDate: { gt: new Date() } },
          select: { currentQuantity: true, expiryDate: true },
        },
        reviews: { where: { status: 'approved' }, select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  return { medicines, categories }
}

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  const { medicines, categories } = await getMedicines(resolvedSearchParams)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Suspense fallback={<div className="h-96 skeleton max-w-7xl mx-auto my-8 rounded-3xl" />}>
          <MedicinesClient
            initialMedicines={medicines}
            categories={categories}
            initialSearch={(resolvedSearchParams?.search as string) || ''}
            initialCategory={(resolvedSearchParams?.category as string) || ''}
            initialSchedule={(resolvedSearchParams?.schedule as string) || ''}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
