"use server"

import { prisma } from "@/lib/prisma"

export async function getVIPGuests() {
  const bookings = await prisma.booking.findMany({
    where: {
      guest: {
        isVIP: true,
      },
      status: {
        in: ["PENDING", "CONFIRMED", "CHECKED_IN"],
      },
    },
    include: {
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
    },
    orderBy: {
      checkIn: "asc",
    },
  })

  return bookings.map((b) => ({
    id: b.id,
    guestName: b.guest.name,
    suite: b.suite.name,
  }))
}
