"use server"

import { prisma } from "@/lib/prisma"
import { Booking } from "@prisma/client" // import Prisma types

const roomPools: Record<string, string[]> = {
  "Presidential Suite": ["101", "102", "103", "104", "105", "106", "107", "108"],
  "Deluxe Suite": ["201", "202", "203", "204", "205"],
}

export async function checkInGuest(bookingId: string): Promise<Booking & { suite: { roomNumber: string } }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { suite: true, guest: true },
  })

  if (!booking) throw new Error("Booking not found")
  if (booking.status === "CHECKED_IN") throw new Error("Already checked in")

  const suiteName = booking.suite.name
  const pool = roomPools[suiteName]

  let assignedRoom = booking.suite.roomNumber
  if (!assignedRoom && pool) {
    // Find all rooms already assigned to active bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        suiteId: booking.suiteId,
        status: "CHECKED_IN",
      },
      include: { suite: true },
    })

    const usedRooms = activeBookings.map((b) => b.suite.roomNumber)
    const availableRooms = pool.filter((r) => !usedRooms.includes(r))
    assignedRoom = availableRooms[0] ?? pool[0] // fallback if all taken
  }

  // Update booking status and assign room number
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_IN",
      suite: {
        update: {
          roomNumber: assignedRoom,
        },
      },
    },
    include: { suite: true, guest: true },
  })

  return updatedBooking
}
