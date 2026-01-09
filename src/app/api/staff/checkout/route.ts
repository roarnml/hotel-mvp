import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendTicketEmail } from "@/services/email.service"
import QRCode from "qrcode"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference") // bookingRef
    const trxref = searchParams.get("trxref") // paystack reference

    if (!reference && !trxref) {
      return NextResponse.json(
        { message: "Missing reference or trxref" },
        { status: 400 }
      )
    }

    // 🔍 Fetch payment (single source of truth = reference)
    const payment = await prisma.payment.findFirst({
      where: trxref
        ? { reference: trxref }
        : { booking: { bookingRef: reference! } },
      include: {
        booking: {
          include: {
            suite: true,
          },
        },
      },
    })

    if (!payment || !payment.booking) {
      return NextResponse.json({ status: "not_found" }, { status: 404 })
    }

    const booking = payment.booking

    // 🔒 HARD LOCK: only webhook-confirmed payments pass
    if (booking.paymentStatus !== "PAID") {
      return NextResponse.json({ status: "pending" })
    }

    // 📧 Send ticket email (best-effort, idempotent)
    if (!booking.emailSentAt) {
      try {
        const nights = Math.max(
          Math.ceil(
            (new Date(booking.checkOut).getTime() -
              new Date(booking.checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          1
        )

        // 🔳 QR = bookingRef (perfect check-in key)
        const qrCodeDataUrl = await QRCode.toDataURL(
          booking.bookingRef,
          { margin: 1, width: 256 }
        )

        await sendTicketEmail({
          to: booking.email,
          subject: "Your Booking Ticket – Luxury Hotel",
          guestName: booking.name,
          bookingRef: booking.bookingRef,
          checkIn: booking.checkIn.toDateString(),
          checkOut: booking.checkOut.toDateString(),
          nights,
          suiteName: booking.suite.name,
          amountPaid: `₦${((booking.amountPaid ?? 0) / 100).toLocaleString()}`,
          qrCodeDataUrl,
        })

        await prisma.booking.update({
          where: { id: booking.id },
          data: { emailSentAt: new Date() },
        })
      } catch (emailError) {
        console.error("Ticket email failed", {
          bookingId: booking.id,
          bookingRef: booking.bookingRef,
          error: emailError,
        })
      }
    }

    // ✅ Final response
    return NextResponse.json({
      status: "ready",
      ticket: {
        bookingRef: booking.bookingRef,
        guestName: booking.name,
        email: booking.email,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
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


export async function POST(req: NextRequest) {
  const { bookingId } = await req.json()

  if (!bookingId) {
    return NextResponse.json(
      { message: "Missing bookingId" },
      { status: 400 }
    )
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_OUT",
    },
  })

  return NextResponse.json({ status: "checked_out" })
}