"use server"

import { prisma } from "@/lib/prisma"

export async function checkInGuest(bookingId: string) {
  // Validate input
  if (!bookingId) throw new Error("Booking ID is required")

  // Fetch the booking along with the current status and suite
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { suiteId: true, status: true, guest: { select: { name: true } } },
  })

  if (!booking) throw new Error("Booking not found")

  if (booking.status === "CHECKED_IN") {
    throw new Error(`Guest ${booking.guest?.name ?? ""} is already checked in`)
  }

  try {
    // Atomic transaction: update booking and suite status
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CHECKED_IN" },
      }),
      prisma.suite.update({
        where: { id: booking.suiteId },
        data: { status: "OCCUPIED" },
      }),
    ])
  } catch (error) {
    console.error("Check-in transaction failed:", error)
    throw new Error("Unable to check in guest. Please try again.")
  }

  return { success: true, bookingId, suiteId: booking.suiteId }
}
