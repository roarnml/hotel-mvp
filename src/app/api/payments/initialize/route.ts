/*import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/services/booking.service";
import { paystackRequest } from "@/lib/paystack/client";
import { createPaymentRecord } from "@/services/payment.service";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { suiteId, guestId, fullName, email, checkInDate, checkOutDate, userId } = data;

    if (!suiteId || !fullName || !email || !checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1️⃣ Create booking in DB
    const booking = await createBooking({
      suiteId,
      guestId,
      name: fullName,
      email,
      checkIn: new Date(checkInDate),
      checkOut: new Date(checkOutDate),
      userId,
    });

    // 2️⃣ Determine amount from suite price
    const amountInKobo = booking.suite.price * 100; // price per night assumed

    // 3️⃣ Initialize Paystack transaction
    const paystackPayload = {
      email,
      amount: amountInKobo,
      metadata: {
        bookingId: booking.id,
        suiteId,
        guestId,
        bookingRef: booking.bookingRef,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?reference=${booking.bookingRef}`,
    };

    const response = await paystackRequest("/transaction/initialize", "POST", paystackPayload);

    // 4️⃣ Save PENDING payment record in DB
    await createPaymentRecord({
      bookingId: booking.id,
      amount: amountInKobo,
      currency: "NGN",
      provider: "PAYSTACK",
      paystackReference: response.data.reference,
    });

    // 5️⃣ Return authorization URL for frontend redirect
    return NextResponse.json({
      authorizationUrl: response.data.authorization_url,
      reference: response.data.reference,
      bookingRef: booking.bookingRef,
    });
  } catch (err: any) {
    console.error("Payment initialization error:", err);
    return NextResponse.json({ error: err.message || "Payment initialization failed" }, { status: 500 });
  }
}
*/


/*import { NextRequest, NextResponse } from "next/server"
import { paystackRequest } from "@/lib/paystack/client"
import { createBooking } from "@/services/booking.service"
import { createPaymentRecord } from "@/services/payment.service"
import { findOrCreateGuest } from "@/services/guests.service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      suiteId,
      fullName,
      email,
      phone,
      address,
      checkInDate,
      checkOutDate,
      userId,
    } = body

    if (!suiteId || !fullName || !email || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 1️⃣ Create or reuse guest (MANDATORY)
    const guest = await findOrCreateGuest({
      name: fullName,
      email,
      phone,
      address,
    })

    // 2️⃣ Create booking WITH guestId attached
    const booking = await createBooking({
      suiteId,
      guestId: guest.id,
      name: fullName,
      email,
      checkIn: new Date(checkInDate),
      checkOut: new Date(checkOutDate),
      userId,
      
    })

    // 3️⃣ Calculate amount (use nights if you want later)
    // 3️⃣ Calculate number of nights (SERVER-SIDE)
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    const diffTime = checkOut.getTime() - checkIn.getTime()
    const numberOfNights = Math.max(
      Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
      1
    )

    // 4️⃣ Calculate total amount
    const amountInKobo = booking.suite.price * numberOfNights * 100


    // 4️⃣ Initialize Paystack
    const paystackPayload = {
      email,
      amount: amountInKobo,
      metadata: {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        guestId: guest.id,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?reference=${booking.bookingRef}`,
    }

    const response = await paystackRequest(
      "/transaction/initialize",
      "POST",
      paystackPayload
    )

    // 5️⃣ Persist payment record
    await createPaymentRecord({
      bookingId: booking.id,
      amount: amountInKobo,
      currency: "NGN",
      provider: "PAYSTACK",
      paystackReference: response.data.reference,
    })

    return NextResponse.json({
      authorizationUrl: response.data.authorization_url,
      reference: response.data.reference,
      bookingRef: booking.bookingRef,
    })
  } catch (err: any) {
    console.error("Payment initialization error:", err)
    return NextResponse.json(
      { error: err.message || "Payment initialization failed" },
      { status: 500 }
    )
  }
}
*/

import { NextRequest, NextResponse } from "next/server"
import { paystackRequest } from "@/lib/paystack/client"
import { createBooking } from "@/services/booking.service"
import { createPaymentRecord } from "@/services/payment.service"
import { findOrCreateGuest } from "@/services/guests.service"
import { prisma } from "@/lib/prisma"
import { calculateNights } from "@/lib/date"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { suiteId, fullName, email, phone, address, checkInDate, checkOutDate, userId } = body

    if (!suiteId || !fullName || !email || !checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1️⃣ Find or create guest
    const guest = await findOrCreateGuest({ name: fullName, email, phone, address })

    // 2️⃣ Reserve room & create booking atomically
    const booking = await createBooking({
      suiteId,
      guestId: guest.id,
      name: fullName,
      email,
      checkIn: new Date(checkInDate),
      checkOut: new Date(checkOutDate),
      userId,
    })

    // 3️⃣ Calculate amount
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const nights = calculateNights(checkInDate, checkOutDate)
    const amountInKobo = booking.suite.price * nights * 100


    // 4️⃣ Check for existing payment (idempotency)
    const existingPayment = await prisma.payment.findFirst({ where: { bookingId: booking.id } })
    if (existingPayment) {
      return NextResponse.json({
        authorizationUrl: existingPayment.provider === "PAYSTACK" ? existingPayment.paystackReference : null,
        reference: existingPayment.paystackReference,
        bookingRef: booking.bookingRef,
      })
    }

    // 5️⃣ Initialize Paystack
    const paystackPayload = {
      email,
      amount: amountInKobo,
      metadata: {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        guestId: guest.id,
      },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?reference=${booking.bookingRef}`,
    }

    const response = await paystackRequest("/transaction/initialize", "POST", paystackPayload)
    console.log("Paystack initialization response:", response.data.reference)

    // 6️⃣ Persist payment record
    await createPaymentRecord({
      bookingId: booking.id,
      amount: amountInKobo,
      currency: "NGN",
      provider: "PAYSTACK",
      paystackReference: response.data.reference,
    })

    return NextResponse.json({
      authorizationUrl: response.data.authorization_url,
      reference: response.data.reference,
      bookingRef: booking.bookingRef,
    })
  } catch (err: any) {
    console.error("Payment initialization error:", err)
    return NextResponse.json({ error: err.message || "Payment initialization failed" }, { status: 500 })
  }
}
