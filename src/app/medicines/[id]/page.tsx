import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Header from '@/components/customer/Header'
import Footer from '@/components/customer/Footer'
import MedicineDetailClient from './MedicineDetailClient'

export const dynamic = 'force-dynamic'

async function getMedicine(id: number) {
  return await prisma.medicine.findUnique({
    where: { id },
    include: {
      category: true,
      batches: {
        where: { expiryDate: { gt: new Date() } },
        orderBy: { expiryDate: 'asc' },
      },
      reviews: {
        where: { status: 'approved' },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export default async function MedicineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const medicineId = parseInt(id)
  if (isNaN(medicineId)) notFound()

  const medicine = await getMedicine(medicineId)
  if (!medicine) notFound()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <MedicineDetailClient medicine={medicine as any} />
      </main>
      <Footer />
    </div>
  )
}
