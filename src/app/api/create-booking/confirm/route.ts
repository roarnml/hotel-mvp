import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendTicketEmail } from "@/lib/mailer"

export const runtime = "nodejs"

function generateTicketNumber() {
  return `TKT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
}

export async function POST(req: NextRequest) {
  const { bookingRef } = await req.json()

  if (!bookingRef) {
    return NextResponse.json({ error: "Missing booking reference" }, { status: 400 })
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: { suite: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Idempotency: if already confirmed
    if (booking.paymentStatus === "PAID" && booking.status === "CONFIRMED") {
      return NextResponse.json({ message: "Already confirmed", booking })
    }

    const ticketNumber = generateTicketNumber()

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        ticketNumber,
      },
    })

    // Send ticket email (async, don't block response)
    sendTicketEmail({
      to: updatedBooking.email,
      ticketNumber,
      bookingRef: updatedBooking.bookingRef,
      checkInNumber: updatedBooking.checkInNumber ?? "N/A",
      guestName: updatedBooking.name,
      suiteName: booking.suite.name,
      checkIn: updatedBooking.checkIn,
      checkOut: updatedBooking.checkOut,
    }).catch(err => console.error("Failed sending ticket email:", err))

    return NextResponse.json({ message: "Booking confirmed", booking: updatedBooking })
  } catch (err: any) {
    console.error("Failed confirming booking:", err)
    return NextResponse.json({ error: err.message || "Error confirming booking" }, { status: 500 })
  }
}
