import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET() {
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  // -----------------------------
  // Top Metrics
  // -----------------------------
  const [
    arrivalsToday,
    departuresToday,
    occupiedRooms,
    totalActiveSuites,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        checkIn: { gte: todayStart, lte: todayEnd },
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
      },
    }),

    prisma.booking.count({
      where: {
        checkOut: { gte: todayStart, lte: todayEnd },
        status: "CHECKED_IN",
      },
    }),

    prisma.booking.count({
      where: {
        status: "CHECKED_IN",
      },
    }),

    prisma.suite.count({
      where: { isActive: true },
    }),
  ])

  const availableRooms = totalActiveSuites - occupiedRooms

  // -----------------------------
  // Today’s Arrivals
  // -----------------------------
  const todaysArrivals = await prisma.booking.findMany({
    where: {
      checkIn: { gte: todayStart, lte: todayEnd },
    },
    include: {
      suite: true,
      guest: true,
    },
    orderBy: {
      checkIn: "asc",
    },
  })

  // -----------------------------
  // Priority Alerts (basic MVP)
  // -----------------------------
  const dirtySuites = await prisma.suite.findMany({
    where: { status: "DIRTY" },
    select: { id: true, name: true },
  })

  return NextResponse.json({
    metrics: {
      arrivalsToday,
      departuresToday,
      occupiedRooms,
      availableRooms,
    },
    alerts: {
      dirtySuites,
    },
    arrivals: todaysArrivals.map((b) => ({
      id: b.id,
      guest: b.name,
      room: b.suite.name,
      time: b.checkIn,
      status: b.status,
    })),
  })
}
