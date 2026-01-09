// src/app/staff/actions/arrivals.ts
import { prisma } from "@/lib/prisma"

// Define the return type
export interface Arrival {
  id: string
  guestName: string
  suite: string
  checkIn: string
  vip: boolean
  status: "Pending" | "Checked-in"
}

// Fetch today's arrivals
export async function getArrivals(): Promise<Arrival[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const bookings = await prisma.booking.findMany({
    where: {
      checkIn: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      guest: true,
      suite: true,
    },
  })

  return bookings.map((b) => ({
    id: b.id,
    guestName: b.guest?.name || "Unknown Guest",
    suite: b.suite.name,
    checkIn: b.checkIn.toISOString().split("T")[0],
    vip: b.guest?.isVIP ?? false,
    status: b.status === "CHECKED_IN" ? "Checked-in" : "Pending",
  }))

}

// Check-in a guest
export async function checkInArrival(bookingId: string) {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CHECKED_IN" },
  })
}

/**
 * Mark a booking as checked in.
 * @param bookingId ID of the booking
 */
/*export async function checkInArrival(bookingId: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_IN",
      updatedAt: new Date(),
    },
  })
}
*/


// Toggle VIP status of a guest for a specific booking
export async function toggleVIPArrival(bookingId: string) {
  // Find the booking along with the guest info
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { guest: true },
  })

  if (!booking || !booking.guest) {
    throw new Error("Booking or guest not found")
  }

  // Flip VIP status
  const updatedGuest = await prisma.guest.update({
    where: { id: booking.guest.id },
    data: { isVIP: !booking.guest.isVIP },
  })

  // Return updated booking data with new VIP status
  return {
    bookingId,
    vip: updatedGuest.isVIP,
  }
}
