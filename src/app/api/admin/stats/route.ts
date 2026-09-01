import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [
      totalMedicines,
      activeMedicines,
      totalOrders,
      todayOrders,
      todayRevenue,
      pendingOrders,
      expiringBatches,
      expiredBatches,
    ] = await Promise.all([
      prisma.medicine.count(),
      prisma.medicine.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today, lte: todayEnd } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today, lte: todayEnd }, status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: 'pending' } }),
      // Batches expiring in next 30 days
      prisma.medicineBatch.count({
        where: {
          expiryDate: { gt: new Date(), lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          currentQuantity: { gt: 0 },
        },
      }),
      // Expired batches with stock
      prisma.medicineBatch.count({
        where: { expiryDate: { lt: new Date() }, currentQuantity: { gt: 0 } },
      }),
    ])

    // Low stock medicines (total units < 10)
    const allMedicinesWithStock = await prisma.medicine.findMany({
      where: { isActive: true },
      include: {
        batches: { where: { expiryDate: { gt: new Date() } }, select: { currentQuantity: true } },
      },
    })
    const lowStockCount = allMedicinesWithStock.filter((m) => {
      const total = m.batches.reduce((a, b) => a + b.currentQuantity, 0)
      return total > 0 && total < 10
    }).length
    const outOfStockCount = allMedicinesWithStock.filter((m) => {
      const total = m.batches.reduce((a, b) => a + b.currentQuantity, 0)
      return total === 0
    }).length

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { items: { include: { medicine: { select: { name: true } } } } },
    })

    // Expiring soon list
    const expiringSoon = await prisma.medicineBatch.findMany({
      where: {
        expiryDate: { gt: new Date(), lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        currentQuantity: { gt: 0 },
      },
      include: { medicine: { select: { name: true, brand: true } } },
      orderBy: { expiryDate: 'asc' },
      take: 5,
    })

    return NextResponse.json({
      totalMedicines,
      activeMedicines,
      totalOrders,
      todayOrders,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      pendingOrders,
      lowStockCount,
      outOfStockCount,
      expiringBatches,
      expiredBatches,
      recentOrders,
      expiringSoon,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
