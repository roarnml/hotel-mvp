"use server"

import { prisma } from "@/lib/prisma"

export interface DashboardMetrics {
  totalBookingsToday: number
  vipArrivalsToday: number
  suitesPendingCleaning: number
  totalRevenue: number
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const totalBookingsToday = await prisma.booking.count({
    where: {
      checkIn: { gte: startOfDay, lte: endOfDay },
    },
  })

  const vipArrivalsToday = await prisma.booking.count({
    where: {
      checkIn: { gte: startOfDay, lte: endOfDay },
      status: { in: ["PENDING", "CONFIRMED"] },
      guest: { isVIP: true },
    },
  })

  const suitesPendingCleaning = await prisma.suite.count({
    where: { status: "MAINTENANCE" },
  })

  const totalRevenueRaw = await prisma.booking.aggregate({
    _sum: { amountPaid: true },
    where: { status: "CONFIRMED" },
  })

  const totalRevenue = totalRevenueRaw._sum.amountPaid || 0

  return { totalBookingsToday, vipArrivalsToday, suitesPendingCleaning, totalRevenue }
}
