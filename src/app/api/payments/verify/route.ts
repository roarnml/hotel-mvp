import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTicket } from "@/services/ticket.service"
import { sendTicketEmail } from "@/services/email.service"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get("reference")

  if (!reference) {
    return NextResponse.json(
      { message: "Missing reference" },
      { status: 400 }
    )
  }

  // 🔍 1️⃣ Find payment first (Paystack owns the reference)
  const payment = await prisma.payment.findFirst({
    where: {
      paystackReference: reference,
    },
    include: {
      booking: true,
    },
  })

  if (!payment || !payment.booking) {
    return NextResponse.json(
      { status: "not_found" },
      { status: 404 }
    )
  }

  const booking = payment.booking

  // ⏳ Payment not confirmed yet
  if (booking.paymentStatus !== "SUCCESS") {
    return NextResponse.json({ status: "pending" })
  }

  // 🎟️ Ticket not generated yet
  if (!booking.ticketPdfUrl) {
    const updatedBooking = await generateTicket(booking.id)

    if (updatedBooking.ticketPdfUrl && !updatedBooking.emailSentAt) {
      await sendTicketEmail(
        updatedBooking.email,
        "Your Booking Ticket",
        updatedBooking.ticketPdfUrl
      )

      await prisma.booking.update({
        where: { id: booking.id },
        data: { emailSentAt: new Date() },
      })
    }

    return NextResponse.json({ status: "processing" })
  }

  // ✅ Fully ready — polling stops
  return NextResponse.json({
    status: "ready",
    ticket: {
      ticketNumber: booking.ticketNumber,
      bookingRef: booking.bookingRef,
      guestName: booking.name,
      email: booking.email,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      ticketPdfUrl: booking.ticketPdfUrl,
      emailSentAt: booking.emailSentAt,
      amountPaid: booking.amountPaid,
    },
  })
}
