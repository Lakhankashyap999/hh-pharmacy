import { Suspense } from 'react'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import HeroSection from '@/components/customer/HeroSection'
import CategoryGrid from '@/components/customer/CategoryGrid'
import FeaturedMedicines from '@/components/customer/FeaturedMedicines'
import ReviewsSection from '@/components/customer/ReviewsSection'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getCategories() {
  return await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
}

async function getFeaturedMedicines() {
  return await prisma.medicine.findMany({
    where: { isActive: true },
    include: {
      category: true,
      batches: {
        where: { expiryDate: { gt: new Date() } },
        orderBy: { expiryDate: 'asc' },
      },
      reviews: {
        where: { status: 'approved' },
        select: { rating: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })
}

async function getApprovedReviews() {
  return await prisma.review.findMany({
    where: { status: 'approved', medicineId: null },
    include: {
      user: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

export default async function HomePage() {
  const [categories, medicines, reviews] = await Promise.all([
    getCategories(),
    getFeaturedMedicines(),
    getApprovedReviews(),
  ])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <CategoryGrid categories={categories} />
        <Suspense fallback={<div className="h-96 skeleton" />}>
          <FeaturedMedicines medicines={medicines} />
        </Suspense>
        <ReviewsSection reviews={reviews} />
      </main>
      <Footer />
    </div>
  )
}
