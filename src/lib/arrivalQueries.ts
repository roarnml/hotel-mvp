import { prisma } from "@/lib/prisma"
import { BookingStatus, PaymentStatus } from "@prisma/client"

export type ArrivalRowData = {
  id: string
  guestName: string
  roomNumber: string
  checkInTime: string
  status: BookingStatus
  paymentStatus: PaymentStatus
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
      paymentStatus: {
        in: ["PAID"],
      },
    },
    select: {
      id: true,
      checkIn: true,
      status: true,
      paymentStatus: true,

      guest: {
        select: {
          name: true,
        },
      },

      suite: {
        select: {
          name: true,
        },
      },

      roomAssignment: {
        select: {
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
    guestName: b.guest?.name ?? "Unknown Guest",

    // Real room if assigned, otherwise suite label
    roomNumber: b.roomAssignment?.roomNumber ?? b.suite.name,

    checkInTime: b.checkIn.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),

    status: b.status,
    paymentStatus: b.paymentStatus,
  }))

}

/**
 * Translate backend booking status → UI-friendly label
 */
function mapBookingStatus(status: BookingStatus): ArrivalRowData["status"] {
  switch (status) {
    case "CHECKED_IN":
      return "CHECKED_IN"
    default:
      return "PENDING"
  }
}
