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
  return prisma.$transaction(async (tx) => {
    // 1️⃣ Atomically decrement availableRooms
    const updatedSuites = await tx.suite.updateMany({
      where: {
        id: suiteId,
        status: "ACTIVE",
        availableRooms: { gt: 0 },
      },
      data: {
        availableRooms: { decrement: 1 },
      },
    })

    if (updatedSuites.count === 0) {
      throw new Error("No rooms available for this suite")
    }

    // 2️⃣ Create booking
    const booking = await tx.booking.create({
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
      include: {
        suite: true, // include price & suite info
      },
    })

    return booking
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
