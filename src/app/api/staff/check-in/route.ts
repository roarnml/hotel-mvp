
/*import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { bookingId, suiteId } = await req.json()

  if (!bookingId || !suiteId) {
    return NextResponse.json(
      { error: "Missing bookingId or suiteId" },
      { status: 400 }
    )
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_IN",
      suiteId,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true })
}
*/

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { bookingRef } = await req.json()

    if (!bookingRef) {
      return NextResponse.json({ error: "Missing bookingRef" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: { suite: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Invalid booking" }, { status: 404 })
    }

    if (booking.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 403 })
    }

    if (booking.status === "CHECKED_IN") {
      return NextResponse.json({ status: "already_checked_in" })
    }

    if (booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Booking not eligible for check-in" }, { status: 400 })
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CHECKED_IN",
        checkIn: new Date(),
      },
    })

    return NextResponse.json({
      status: "checked_in",
      bookingRef: updated.bookingRef,
      guestName: updated.name,
      suite: booking.suite.name,
    })
  } catch (err) {
    console.error("Check-in failed", err)
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 })
  }
}
