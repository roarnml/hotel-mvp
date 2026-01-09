import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  const now = new Date()

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      checkIn: { lte: now },
      checkOut: { gte: now },
    },
    include: {
      suite: true,
      guest: true,
      payment: true,
      roomAssignment: true,
    },
    orderBy: { checkIn: "asc" },
  })

  return NextResponse.json(bookings)
}
