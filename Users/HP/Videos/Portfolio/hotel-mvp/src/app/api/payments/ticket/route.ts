import { NextRequest, NextResponse } from "next/server";
import { getBookingByRef } from "@/services/booking.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference"); // Paystack bookingRef

    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    // 1️⃣ Fetch booking by bookingRef
    const booking = await getBookingByRef(reference);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2️⃣ Return ticket info
    return NextResponse.json({
      bookingRef: booking.bookingRef,
      ticketNumber: booking.ticketNumber,
      ticketPdfUrl: booking.ticketPdfUrl,
      guestName: booking.name,
      guestEmail: booking.email,
      suiteName: booking.suite.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      amountPaid: booking.amountPaid,
      paymentStatus: booking.paymentStatus,
      emailSentAt: booking.emailSentAt,
    });
  } catch (err: any) {
    console.error("Ticket fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch ticket" }, { status: 500 });
  }
}
