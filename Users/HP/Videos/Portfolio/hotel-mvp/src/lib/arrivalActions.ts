// app/actions/arrivalActions.ts
"use server"

import { prisma } from "@/lib/prisma"
import type { BookingStatus, PaymentStatus } from "@prisma/client"

export type TodayArrival = {
  id: string
  guestName: string
  guestEmail: string
  suiteName: string
  roomNumber: string
  checkIn: Date
  checkOut: Date
  status: BookingStatus
  paymentStatus: PaymentStatus
}

/**
 * Fetch today's arrivals (check-in is today, not checked out)
 */
export async function getTodayArrivals(): Promise<TodayArrival[]> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const bookings = await prisma.booking.findMany({
    where: {
      checkIn: {
        gte: start,
        lte: end,
      },
      status: {
        in: ["CONFIRMED", "CHECKED_IN"], // operationally meaningful arrivals
      },
    },
    include: {
      guest: true,
      suite: true,
    },
    orderBy: {
      checkIn: "asc",
    },
  })

  return bookings.map((b) => ({
    id: b.id,

    // Guest may be deleted later — snapshot fields save us
    guestName: b.guest?.name ?? b.name ?? "Unknown Guest",
    guestEmail: b.guest?.email ?? b.email ?? "unknown@email",

    // Suite is required by schema, but we still fail soft
    suiteName: b.suite?.name ?? "Unknown Suite",
    roomNumber: b.suite?.roomNumber ?? "UNASSIGNED",

    checkIn: b.checkIn,
    checkOut: b.checkOut,

    status: b.status,
    paymentStatus: b.paymentStatus,
  }))
}
