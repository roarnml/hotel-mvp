import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const { bookingId, roomNumber } = await req.json()

  if (!bookingId || !roomNumber) {
    return NextResponse.json(
      { message: "Missing fields" },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { suite: true },
  })

  if (!booking || booking.status !== "CONFIRMED") {
    return NextResponse.json(
      { message: "Invalid booking state" },
      { status: 400 }
    )
  }

  await prisma.$transaction([
    prisma.roomAssignment.create({
      data: {
        bookingId,
        suiteId: booking.suiteId,
        roomNumber,
      },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CHECKED_IN",
        checkInNumber: crypto.randomUUID(),
      },
    }),
  ])

  return NextResponse.json({ status: "checked_in" })
}
