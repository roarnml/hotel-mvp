"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Booking } from "@prisma/client"

const roomPools: Record<string, string[]> = {
  "Presidential Suite": ["101", "102", "103", "104", "105", "106", "107", "108"],
  "Deluxe Suite": ["201", "202", "203", "204", "205"],
}

/**
 * Get a single booking by ID, including guest and suite details.
 */
export async function getBookingById(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      guest: true,
      suite: true,
    },
  })
}

/**
 * Check-in a booking and assign a room.
 * Optionally pass a manual room number.
 */
export async function checkInGuest(
  bookingId: string,
  manualRoomNumber?: string
): Promise<Booking & { suite: { roomNumber: string } }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { suite: true, guest: true },
  })

  if (!booking) throw new Error("Booking not found")
  if (booking.status === "CHECKED_IN") throw new Error("Booking already checked in")

  const suiteName = booking.suite.name
  const pool = roomPools[suiteName]

  let assignedRoom = manualRoomNumber || booking.suite.roomNumber

  if (!assignedRoom && pool) {
    // Get rooms already taken by other CHECKED_IN bookings
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

  // Update booking status and assign room
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_IN",
      checkIn: new Date(),
      suite: {
        update: {
          roomNumber: assignedRoom,
        },
      },
    },
    include: { suite: true, guest: true },
  })

  revalidatePath("/staff/bookings")
  return updatedBooking
}

/**
 * Check-out a booking.
 */
export async function checkOutGuest(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw new Error("Booking not found")
  if (booking.status !== "CHECKED_IN") throw new Error("Cannot check-out a guest who is not checked in")

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_OUT",
      checkOut: new Date(),
    },
  })

  revalidatePath("/staff/bookings")
}

/**
 * Mark a guest as VIP.
 */
export async function markGuestVIP(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { guestId: true },
  })

  if (!booking) throw new Error("Booking not found")

  await prisma.guest.update({
    where: { id: booking.guestId },
    data: { isVIP: true },
  })

  revalidatePath("/staff/bookings")
}
