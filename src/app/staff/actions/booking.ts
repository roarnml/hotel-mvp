"use server"

import { prisma } from "@/lib/prisma"

export async function getBookings(query?: string) {
  // 1️⃣ Fetch bookings
  const bookings = await prisma.booking.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { suite: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      suite: true,
      guest: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // 2️⃣ Heal orphaned bookings
  const orphaned = bookings.filter((b) => !b.guestId && b.email)

  for (const booking of orphaned) {
    const guest = await prisma.guest.findUnique({
      where: { email: booking.email },
    })

    if (guest) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { guestId: guest.id },
      })

      booking.guest = guest
    }
  }

  // 3️⃣ Normalize response for UI
  return bookings.map((b) => ({
    id: b.id,
    guestName: b.guest?.name ?? b.name,
    suite: b.suite.name,
    checkIn: b.checkIn.toDateString(),
    checkOut: b.checkOut.toDateString(),
    status: b.status, // now directly matches BookingStatus enum
    vip: b.guest?.isVIP ?? false,
  }))
}
