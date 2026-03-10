"use server"

import { prisma } from "@/lib/prisma"

// Fetch alerts
export async function getPriorityAlerts() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const vipArrivals = await prisma.booking.findMany({
    where: {
      guest: { isVIP: true },
      checkIn: { gte: todayStart, lte: todayEnd },
      status: "PENDING",
    },
    include: { guest: true, suite: true },
    orderBy: { checkIn: "asc" },
  })

  const cleaningAlerts = await prisma.suite.findMany({
    where: { status: "MAINTENANCE" }, // or CLEANING_PENDING
    orderBy: { updatedAt: "desc" },
  })

  return { vipArrivals, cleaningAlerts }
}

// Mark suite as cleaned
export async function markSuiteCleaned(suiteId: string) {
  return prisma.suite.update({
    where: { id: suiteId },
    data: { status: "AVAILABLE" },
  })
}

// Check in VIP guest
export async function checkInVIP(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { suiteId: true, status: true },
  })

  if (!booking) throw new Error("Booking not found")
  if (booking.status === "CHECKED_IN") throw new Error("Guest already checked in")

  return prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CHECKED_IN" },
    }),
    prisma.suite.update({
      where: { id: booking.suiteId },
      data: { status: "OCCUPIED" },
    }),
  ])
}
