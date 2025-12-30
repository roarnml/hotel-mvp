import { prisma } from "@/lib/prisma"
import type { BookingStatus, SuiteStatus } from "@prisma/client"

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

  const [
    arrivalsToday,
    departuresToday,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
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

    // Rooms currently occupied
    prisma.suite.count({
      where: { status: "OCCUPIED" as SuiteStatus },
    }),

    // Rooms currently available
    prisma.suite.count({
      where: { status: "AVAILABLE" as SuiteStatus },
    }),

    // Rooms under maintenance (pending cleaning)
    prisma.suite.count({
      where: { status: "MAINTENANCE" as SuiteStatus },
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

  return {
    arrivalsToday,
    departuresToday,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    vipArrivalsToday,
  }
}
