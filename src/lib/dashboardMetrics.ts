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

  const [
    arrivalsToday,
    departuresToday,
    occupiedRooms,
    maintenanceRooms,
    sellableSuites,
    vipArrivalsToday,
  ] = await Promise.all([
    // Arrivals today (confirmed or already checked in)
    prisma.booking.count({
      where: {
        checkIn: { gte: todayStart, lte: todayEnd },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      },
    }),

    // Departures today
    prisma.booking.count({
      where: {
        checkOut: { gte: todayStart, lte: todayEnd },
        status: BookingStatus.CHECKED_OUT,
      },
    }),

    // Currently occupied rooms (checked-in guests)
    prisma.booking.count({
      where: {
        status: BookingStatus.CHECKED_IN,
        roomAssignment: { isNot: null },
      },
    }),

    // Suites under maintenance
    prisma.suite.count({
      where: {
        status: SuiteStatus.MAINTENANCE,
      },
    }),

    // Sellable suites for availability calculation
    prisma.suite.findMany({
      where: {
        isActive: true,
        status: { in: [SuiteStatus.ACTIVE, SuiteStatus.AVAILABLE] },
      },
      select: {
        availableRooms: true,
      },
    }),

    // VIP arrivals today
    prisma.booking.count({
      where: {
        checkIn: { gte: todayStart, lte: todayEnd },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        guest: {
          isVIP: true,
        },
      },
    }),
  ])

  // Sum available rooms across sellable suites
  const availableRooms = sellableSuites.reduce(
    (sum, suite) => sum + suite.availableRooms,
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
