import { prisma } from "@/lib/prisma"
import { generateBookingRef } from "@/utils/generateBookingRef"

export async function createBooking({
  suiteId,
  guestId,
  name,
  email,
  checkIn,
  checkOut,
  userId,
}: {
  suiteId: string
  guestId: string
  name: string
  email: string
  checkIn: Date
  checkOut: Date
  userId?: string
}) {
  return prisma.booking.create({
    data: {
      suiteId,
      guestId,
      name,
      email,
      checkIn,
      checkOut,
      userId,
      bookingRef: generateBookingRef(),
      status: "PENDING",
      paymentStatus: "PENDING",
    },
    include: { suite: true },
  })
}


// Fetch booking by bookingRef or ticketNumber
export async function getBookingByRef(ref: string) {
  return prisma.booking.findFirst({
    where: {
      OR: [
        { bookingRef: ref },
        { ticketNumber: ref },
      ],
    },
    include: { suite: true },
  })
}
