// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendTicketEmailForBooking } from "@/services/email.service"
import { PaymentStatus } from "@prisma/client"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference") || searchParams.get("trxref")

    if (!reference) {
      return NextResponse.json({ status: "error", message: "Missing reference" }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: {
        booking: {
          include: {
            suite: true,
            guest: true,
            roomAssignment: true,
            details: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
    })

    // ✅ return 200 so polling logic stays simple
    if (!payment || !payment.booking) {
      return NextResponse.json({ status: "not_found" }, { status: 200 })
    }

    const booking = payment.booking
    const details = booking.details?.[0] || null

    const isPaid =
      payment.status === PaymentStatus.PAID || booking.paymentStatus === PaymentStatus.PAID

    if (!isPaid) {
      return NextResponse.json({
        status: "pending",
        reference,
        bookingRef: booking.bookingRef,
        paymentStatus: payment.status,
        bookingStatus: booking.status,
      })
    }

    // Fallback: webhook should have already sent.
    if (!booking.emailSentAt) {
      sendTicketEmailForBooking(booking.id).catch((err) => {
        console.error("❌ Ticket email fallback failed (verify):", err)
      })
    }

    return NextResponse.json({
      status: "ready",
      reference,
      bookingRef: booking.bookingRef,
      ticket: {
        ticketNumber: booking.ticketNumber || null,
        suiteName: booking.suite.name,
        roomNumbers: booking.roomAssignment.map((r) => r.roomNumber),
        capacity: booking.suite.capacity ?? null,
        features: booking.suite.features ?? [],
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        ticketPdfUrl: booking.ticketPdfUrl || null,
        emailSentAt: booking.emailSentAt ? booking.emailSentAt.toISOString() : null,
        guestName: booking.name,
        email: booking.email,
        phone: booking.guest?.phone || null,
        address: booking.guest?.address || null,
        chaletCount: details?.chaletCount ?? 1,
        nights: details?.nights ?? null,
        paymentReference: payment.reference,
        provider: payment.provider,
        paymentStatus: payment.status,
        amountExpected: payment.amount,
        amountPaid: payment.amountPaid ?? null,
        currency: payment.currency ?? "NGN",
        pricePerNight: details?.pricePerNight ?? null,
        baseAmount: details?.baseAmount ?? null,
        vatAmount: details?.vatAmount ?? null,
        transactionFee: details?.transactionFee ?? null,
        totalAmount: details?.totalAmount ?? null,
      },
    })
  } catch (err: any) {
    console.error("❌ Payment verification error:", err)
    return NextResponse.json(
      { status: "error", message: err?.message || "Payment verification failed" },
      { status: 500 }
    )
  }
}