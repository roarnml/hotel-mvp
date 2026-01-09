"use server"

import { prisma } from "@/lib/prisma"
import {
  Booking,
  Guest,
  Suite,
  RoomAssignment,
} from "@prisma/client"

// Static room pools per suite name
const roomPools: Record<string, string[]> = {
  "Presidential Suite": ["101", "102", "103", "104", "105", "106", "107", "108"],
  "Deluxe Suite": ["201", "202", "203", "204", "205"],
}

export async function checkInGuest(
  bookingId: string
): Promise<
  Booking & {
    suite: Suite
    guest: Guest | null
    roomAssignment: RoomAssignment | null
  }
> {
  // 1️⃣ Load booking with relations
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      suite: true,
      guest: true,
      roomAssignment: true,
    },
  })

  if (!booking) {
    throw new Error("Booking not found")
  }

  if (booking.status === "CHECKED_IN") {
    throw new Error("Booking already checked in")
  }

  if (booking.roomAssignment) {
    throw new Error("Room already assigned for this booking")
  }

  // 2️⃣ Resolve room pool
  const suiteName = booking.suite.name
  const pool = roomPools[suiteName]

  if (!pool || pool.length === 0) {
    throw new Error(`No room pool configured for suite: ${suiteName}`)
  }

  // 3️⃣ Get rooms already used for this suite
  const usedRooms = await prisma.roomAssignment.findMany({
    where: {
      suiteId: booking.suiteId,
    },
    select: {
      roomNumber: true,
    },
  })

  const usedRoomSet = new Set(usedRooms.map((r) => r.roomNumber))

  const availableRoom = pool.find(
    (roomNumber) => !usedRoomSet.has(roomNumber)
  )

  if (!availableRoom) {
    throw new Error("No available rooms for this suite")
  }

  // 4️⃣ Check in + assign room
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_IN",
      roomAssignment: {
        create: {
          suiteId: booking.suiteId,
          roomNumber: availableRoom,
        },
      },
    },
    include: {
      suite: true,
      guest: true,
      roomAssignment: true,
    },
  })

  // 5️⃣ Return (roomAssignment is nullable by type, guaranteed by logic)
  return updatedBooking
}
