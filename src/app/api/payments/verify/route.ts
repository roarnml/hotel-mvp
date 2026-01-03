/*import { NextRequest, NextResponse } from "next/server"
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
    try {
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

      // Refresh the booking from DB to make sure all fields are up-to-date
      const refreshedBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
      })

      return NextResponse.json({
        status: refreshedBooking?.ticketPdfUrl ? "ready" : "processing",
        ticket: refreshedBooking
          ? {
              ticketNumber: refreshedBooking.ticketNumber,
              bookingRef: refreshedBooking.bookingRef,
              guestName: refreshedBooking.name,
              email: refreshedBooking.email,
              checkIn: refreshedBooking.checkIn,
              checkOut: refreshedBooking.checkOut,
              ticketPdfUrl: refreshedBooking.ticketPdfUrl,
              emailSentAt: refreshedBooking.emailSentAt,
              amountPaid: refreshedBooking.amountPaid,
            }
          : null,
      })
    } catch (err) {
      console.error(err)
      return NextResponse.json(
        { status: "error", message: "Ticket generation failed" },
        { status: 500 }
      )
    }
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
*/


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTicket } from "@/services/ticket.service"
import { sendTicketEmail } from "@/services/email.service"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference") // bookingRef
    const trxref = searchParams.get("trxref") // paystackReference

    if (!reference && !trxref) {
      return NextResponse.json(
        { message: "Missing reference or trxref" },
        { status: 400 }
      )
    }

    // 🔍 Lookup payment by either paystackReference or bookingRef
    const payment = await prisma.payment.findFirst({
      where: trxref
        ? { paystackReference: trxref }
        : { booking: { bookingRef: reference! } },
      include: {
        booking: { include: { suite: true } },
      },
    })

    if (!payment || !payment.booking) {
      return NextResponse.json({ status: "not_found" }, { status: 404 })
    }

    const booking = payment.booking

    if (booking.paymentStatus !== "SUCCESS") {
      return NextResponse.json({ status: "pending" })
    }

    // Generate ticket if missing
    if (!booking.ticketPdfUrl) {
      const updatedBooking = await generateTicket(booking.id)

      if (updatedBooking.ticketPdfUrl && !updatedBooking.emailSentAt) {
        const nights = Math.max(
          Math.ceil(
            (new Date(updatedBooking.checkOut).getTime() -
              new Date(updatedBooking.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          1
        )

        await sendTicketEmail({
          to: updatedBooking.email,
          subject: "Your Booking Ticket – Luxury Hotel",
          guestName: updatedBooking.name,
          bookingRef: updatedBooking.bookingRef,
          checkIn: updatedBooking.checkIn.toDateString(),
          checkOut: updatedBooking.checkOut.toDateString(),
          nights,
          suiteId: updatedBooking.suiteId,
          amountPaid: `₦${((updatedBooking.amountPaid ?? 0) / 100).toLocaleString()}`,
          pdfUrl: updatedBooking.ticketPdfUrl,
        })

        await prisma.booking.update({
          where: { id: updatedBooking.id },
          data: { emailSentAt: new Date() },
        })
      }

      const refreshedBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
      })

      return NextResponse.json({
        status: refreshedBooking?.ticketPdfUrl ? "ready" : "processing",
        ticket: refreshedBooking
          ? {
              ticketNumber: refreshedBooking.ticketNumber,
              bookingRef: refreshedBooking.bookingRef,
              guestName: refreshedBooking.name,
              email: refreshedBooking.email,
              checkIn: refreshedBooking.checkIn,
              checkOut: refreshedBooking.checkOut,
              ticketPdfUrl: refreshedBooking.ticketPdfUrl,
              emailSentAt: refreshedBooking.emailSentAt,
              amountPaid: refreshedBooking.amountPaid,
            }
          : null,
      })
    }

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
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { status: "error", message: "Payment verification failed" },
      { status: 500 }
    )
  }
}
