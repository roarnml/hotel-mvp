import { prisma } from "@/lib/prisma"
import type { BookingStatus } from "@prisma/client"

export type ArrivalRowData = {
  id: string
  guestName: string
  roomNumber: string
  checkInTime: string
  status: "Pending" | "Checked in"
}

/**
 * Fetch today's arrivals (CONFIRMED or CHECKED_IN)
 */
export async function getTodaysArrivals(): Promise<ArrivalRowData[]> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const arrivals = await prisma.booking.findMany({
    where: {
      checkIn: {
        gte: start,
        lte: end,
      },
      status: {
        in: ["CONFIRMED", "CHECKED_IN"],
      },
    },
    select: {
      id: true,
      name: true,
      checkIn: true,
      status: true,
      guest: {
        select: {
          name: true,
        },
      },
      suite: {
        select: {
          name: true,
          roomNumber: true,
        },
      },
    },
    orderBy: {
      checkIn: "asc",
    },
  })

  return arrivals.map((b) => ({
    id: b.id,

    // Snapshot-first: survives guest deletion
    guestName: b.guest?.name ?? b.name ?? "Unknown Guest",

    // Prefer physical room, fallback to suite label
    roomNumber:
      b.suite.roomNumber !== "UNASSIGNED"
        ? b.suite.roomNumber
        : b.suite.name,

    checkInTime: b.checkIn.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),

    status: mapBookingStatus(b.status),
  }))
}

/**
 * Translate backend booking status → UI-friendly label
 */
function mapBookingStatus(status: BookingStatus): ArrivalRowData["status"] {
  switch (status) {
    case "CHECKED_IN":
      return "Checked in"
    default:
      return "Pending"
  }
}
