// src/services/booking.service.ts
import { prisma } from "@/lib/prisma";
import { generateBookingRef } from "@/utils/generateBookingRef";

export async function createBooking({
  suiteId,
  guestId,
  name,
  email,
  checkIn,
  checkOut,
  userId,
}: {
  suiteId: string;
  guestId: string;
  name: string;
  email: string;
  checkIn: Date;
  checkOut: Date;
  userId?: string;
}) {
  const bookingRef = generateBookingRef();
  const booking = await prisma.booking.create({
    data: {
      suiteId,
      guestId,
      name,
      email,
      checkIn,
      checkOut,
      userId,
      bookingRef,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
    include: { suite: true }, // <-- this gives you booking.suite
  });
  return booking;
}

// NEW: fetch booking by bookingRef or ticketNumber
export async function getBookingByRef(ref: string) {
  return prisma.booking.findFirst({
    where: {
      OR: [
        { bookingRef: ref },
        { ticketNumber: ref },
      ],
    },
    include: {
      suite: true,   // include suite info
    },
  });
}