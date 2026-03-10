"use server"

import { prisma } from "@/lib/prisma"

export async function getVIPGuests() {
  const vips = await prisma.booking.findMany({
    where: {
      guest: {
        isVIP: true,
      },
    },
    select: {
      id: true,
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
  })

  return vips.map((v) => ({
    id: v.id,
    guestName: v.guest?.name ?? "VIP Guest",
    suite: v.suite.name,
  }))
}
