import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/serverAuth'

export async function GET(req: NextRequest) {
  try {
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.response!

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
      allMedicinesWithStock,
      recentOrders,
      expiringSoon,
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
      // Low stock medicines: lean select of batch quantities only
      prisma.medicine.findMany({
        where: { isActive: true },
        select: {
          id: true,
          batches: {
            where: { expiryDate: { gt: new Date() } },
            select: { currentQuantity: true },
          },
        },
      }),
      // Recent orders: lean selection
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          deliveryType: true,
          status: true,
          totalAmount: true,
          paymentMode: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              medicine: { select: { name: true } },
            },
          },
        },
      }),
      // Expiring soon: top 5
      prisma.medicineBatch.findMany({
        where: {
          expiryDate: { gt: new Date(), lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          currentQuantity: { gt: 0 },
        },
        select: {
          id: true,
          batchNumber: true,
          expiryDate: true,
          currentQuantity: true,
          medicine: { select: { name: true, brand: true } },
        },
        orderBy: { expiryDate: 'asc' },
        take: 5,
      }),
    ])

    const lowStockCount = allMedicinesWithStock.filter((m) => {
      const total = m.batches.reduce((a, b) => a + b.currentQuantity, 0)
      return total > 0 && total < 10
    }).length
    const outOfStockCount = allMedicinesWithStock.filter((m) => {
      const total = m.batches.reduce((a, b) => a + b.currentQuantity, 0)
      return total === 0
    }).length

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=5, stale-while-revalidate=20',
        },
      }
    )
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
