// dashboardMetrics.ts
import { prisma } from "@/lib/prisma"
import { BookingStatus, SuiteStatus } from "@prisma/client"

export type DashboardMetrics = {
  arrivalsToday: number
  departuresToday: number
  occupiedRooms: number
  availableRooms: number
  maintenanceRooms: number
  vipArrivalsToday: number
}

/**
 * Fetch key metrics for the staff dashboard
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // 1️⃣ Fetch bookings and suites in parallel
  const [
    arrivalsToday,
    departuresToday,
    occupiedRooms,
    maintenanceRooms,
    activeSuites,
    vipArrivalsToday,
  ] = await Promise.all([
    // Bookings checking in today (CONFIRMED or CHECKED_IN)
    prisma.booking.count({
      where: {
        checkIn: { gte: todayStart, lte: todayEnd },
        status: { in: ["CONFIRMED", "CHECKED_IN"] as BookingStatus[] },
      },
    }),

    // Bookings checking out today (CHECKED_OUT)
    prisma.booking.count({
      where: {
        checkOut: { gte: todayStart, lte: todayEnd },
        status: "CHECKED_OUT",
      },
    }),

    // Rooms currently occupied (suite has a CHECKED_IN booking)
    prisma.booking.count({
      where: {
        status: "CHECKED_IN",
        suite: { status: SuiteStatus.ACTIVE },
      },
    }),

    // Suites under maintenance
    prisma.suite.count({
      where: { status: SuiteStatus.MAINTENANCE },
    }),

    // Active suites with availableRooms summed
    prisma.suite.findMany({
      where: { status: SuiteStatus.ACTIVE },
      select: { availableRooms: true },
    }),

    // VIP arrivals today
    prisma.booking.count({
      where: {
        checkIn: { gte: todayStart, lte: todayEnd },
        status: { in: ["PENDING", "CONFIRMED"] as BookingStatus[] },
        guest: { isVIP: true },
      },
    }),
  ])

  // 2️⃣ Sum the availableRooms across all active suites
  const availableRooms = activeSuites.reduce(
    (total, suite) => total + (suite.availableRooms ?? 0),
    0
  )

  return {
    arrivalsToday,
    departuresToday,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    vipArrivalsToday,
  }
}
