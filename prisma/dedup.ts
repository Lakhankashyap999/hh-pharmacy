import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning duplicate medicines...')

  const duplicateIdsToRemove = [1, 4, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 24, 33, 44, 53]

  for (const id of duplicateIdsToRemove) {
    // Delete location, batches, reviews, then medicine
    await prisma.medicineLocation.deleteMany({ where: { medicineId: id } })
    await prisma.stockLog.deleteMany({ where: { medicineId: id } })
    await prisma.medicineBatch.deleteMany({ where: { medicineId: id } })
    await prisma.review.deleteMany({ where: { medicineId: id } })
    await prisma.medicine.deleteMany({ where: { id } })
  }

  const remaining = await prisma.medicine.count()
  console.log(`✅ Cleaned! Remaining unique medicines: ${remaining}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
