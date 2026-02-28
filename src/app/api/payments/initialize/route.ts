/*
// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { paystackRequest } from "@/lib/paystack/client"
import { prisma } from "@/lib/prisma"

const VAT_RATE = 0.075
const TRANSACTION_RATE = 0.0025

function toStartOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function nightsBetween(checkIn: Date, checkOut: Date) {
  const msPerDay = 1000 * 60 * 60 * 24
  const start = toStartOfDay(checkIn).getTime()
  const end = toStartOfDay(checkOut).getTime()
  return Math.round((end - start) / msPerDay)
}

function koboRound(n: number) {
  // Always store kobo as integer
  return Math.round(n)
}

function makeReference(prefix = "HB") {
  // Example: HB-2f8c1c0a3a4b4e1d9c0f...
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "")}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      suiteId,
      chaletCount,
      fullName,
      email,
      phone,
      address,
      checkInDate,
      checkOutDate,
      amount, // total (kobo)
      userId,
    } = body ?? {}

    console.log("Payment initialization request body:", body)

    // ------------------------
    // Validate
    // ------------------------
    if (!suiteId || !fullName || !email || !phone || !address || !checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const chaletCountNum = Number(chaletCount)
    if (!Number.isFinite(chaletCountNum) || chaletCountNum < 1) {
      return NextResponse.json({ error: "Invalid chaletCount" }, { status: 400 })
    }

    const amountNum = Number(amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: "Invalid check-in/check-out date" }, { status: 400 })
    }
    if (checkOut <= checkIn) {
      return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 })
    }

    // ------------------------
    // Load suite + compute pricing server-side (kobo ints)
    // ------------------------
    const suite = await prisma.suite.findUnique({
      where: { id: suiteId },
      select: { id: true, price: true, name: true },
    })
    if (!suite) return NextResponse.json({ error: "Suite not found" }, { status: 404 })

    const nights = nightsBetween(checkIn, checkOut)
    if (nights < 1) return NextResponse.json({ error: "Invalid stay duration" }, { status: 400 })

    const baseAmount = koboRound(suite.price * nights * chaletCountNum)
    const vatAmount = koboRound(baseAmount * VAT_RATE)
    const transactionFee = koboRound(baseAmount * TRANSACTION_RATE)
    const expectedTotal = baseAmount + vatAmount + transactionFee

    if (koboRound(amountNum) !== expectedTotal) {
      return NextResponse.json(
        { error: "Pricing mismatch. Please refresh and try again." },
        { status: 400 }
      )
    }

    // ------------------------
    // DB-only transaction (no external calls inside)
    // ------------------------
    const result = await prisma.$transaction(async (tx) => {
      // Guest
      const guest = await tx.guest.upsert({
        where: { email },
        update: {
          name: fullName,
          phone,
          address,
        },
        create: {
          name: fullName,
          email,
          phone,
          address,
        },
      })

      // Reuse existing pending booking/payment (if your schema supports these fields)
      const existingBooking = await tx.booking.findFirst({
        where: {
          suiteId,
          guestId: guest.id,
          checkIn,
          checkOut,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
        include: {
          details: { orderBy: { createdAt: "desc" }, take: 1 },
          payment: true,
        },
      })

      if (existingBooking?.payment?.status === "PENDING" && existingBooking.details?.[0]) {
        return {
          guest,
          booking: existingBooking,
          details: existingBooking.details[0],
          payment: existingBooking.payment,
          reused: true,
        }
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          suiteId,
          guestId: guest.id,
          checkIn,
          checkOut,
          chaletCount: chaletCountNum,
          status: "PENDING",
          paymentStatus: "PENDING",
          userId: userId ?? null,
          // If you have bookingRef and it’s required, generate it here:
          bookingRef: `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        },
      })

      // Create details snapshot (BookingDetails)
      const details = await tx.bookingDetails.create({
        data: {
          bookingId: booking.id,
          nights,
          pricePerNight: suite.price,
          baseAmount,
          vatAmount,
          transactionFee,
          totalAmount: expectedTotal,
          currency: "NGN",
          pricingFormula: JSON.stringify({
            nights,
            chaletCount: chaletCountNum,
            pricePerNight: suite.price,
            VAT_RATE,
            TRANSACTION_RATE,
            recomputedOnServer: true,
          }),
        },
      })

      // Create pending payment
      const reference = makeReference("HB")
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          detailsId: details.id,
          amount: expectedTotal,
          reference,
          status: "PENDING",
          provider: "PAYSTACK",
        },
      })

      return { guest, booking, details, payment, reused: false }
    })

    const { guest, booking, details, payment } = result

    // ------------------------
    // External call AFTER transaction
    // ------------------------
    const paystackResponse = await paystackRequest("/transaction/initialize", "POST", {
      email,
      amount: payment.amount, // kobo
      reference: payment.reference,
      metadata: {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        guestId: guest.id,
        suiteId: suite.id,
        chaletCount: chaletCountNum,
        nights: details.nights,
        breakdown: {
          baseAmount: details.baseAmount,
          vatAmount: details.vatAmount,
          transactionFee: details.transactionFee,
          totalAmount: details.totalAmount,
          currency: details.currency,
        },
      },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success`,
    })

    return NextResponse.json({
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: payment.reference,
      bookingRef: booking.bookingRef,
    })
  } catch (err: any) {
    console.error("Payment initialization error:", err)
    return NextResponse.json(
      { error: err?.message || "Payment initialization failed" },
      { status: 500 }
    )
  }
}*/


// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { paystackRequest } from "@/lib/paystack/client"
import { prisma } from "@/lib/prisma"

const VAT_RATE = 0.075
const TRANSACTION_RATE = 0.0025

function toStartOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function nightsBetween(checkIn: Date, checkOut: Date) {
  const msPerDay = 1000 * 60 * 60 * 24
  const start = toStartOfDay(checkIn).getTime()
  const end = toStartOfDay(checkOut).getTime()
  return Math.round((end - start) / msPerDay)
}

function kobo(n: number) {
  return Math.round(n)
}

function makeReference(prefix = "HB") {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "")}`
}

function makeBookingRef() {
  // short, readable booking reference
  return `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      suiteId,
      chaletCount,
      fullName,
      email,
      phone,
      address,
      checkInDate,
      checkOutDate,
      amount, // total (kobo) from frontend
      userId,
    } = body ?? {}

    if (!suiteId || !fullName || !email || !phone || !address || !checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const chaletCountNum = Number(chaletCount)
    if (!Number.isFinite(chaletCountNum) || chaletCountNum < 1) {
      return NextResponse.json({ error: "Invalid chaletCount" }, { status: 400 })
    }

    const amountNum = Number(amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: "Invalid check-in/check-out date" }, { status: 400 })
    }
    if (checkOut <= checkIn) {
      return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 })
    }

    const suite = await prisma.suite.findUnique({
      where: { id: suiteId },
      select: { id: true, price: true, name: true },
    })
    if (!suite) return NextResponse.json({ error: "Suite not found" }, { status: 404 })

    // --- server recompute (kobo ints) ---
    const nights = nightsBetween(checkIn, checkOut)
    if (nights < 1) return NextResponse.json({ error: "Invalid stay duration" }, { status: 400 })

    const baseAmount = kobo(suite.price * nights * chaletCountNum)
    const vatAmount = kobo(baseAmount * VAT_RATE)
    const transactionFee = kobo(baseAmount * TRANSACTION_RATE)
    const expectedTotal = baseAmount + vatAmount + transactionFee

    if (kobo(amountNum) !== expectedTotal) {
      return NextResponse.json(
        { error: "Pricing mismatch. Please refresh and try again." },
        { status: 400 }
      )
    }

    // --- DB-only transaction ---
    const { guest, booking, details, payment } = await prisma.$transaction(async (tx) => {
      const guest = await tx.guest.upsert({
        where: { email },
        update: { name: fullName, phone, address },
        create: { name: fullName, email, phone, address },
      })

      // Try to reuse a PENDING booking/payment (optional, but matches your intent)
      const existingBooking = await tx.booking.findFirst({
        where: {
          suiteId,
          guestId: guest.id,
          checkIn,
          checkOut,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
        include: {
          details: { orderBy: { createdAt: "desc" }, take: 1 },
          payment: true,
        },
      })

      if (existingBooking?.payment?.status === "PENDING" && existingBooking.details?.[0]) {
        return {
          guest,
          booking: existingBooking,
          details: existingBooking.details[0],
          payment: existingBooking.payment,
        }
      }

      const booking = await tx.booking.create({
        data: {
          bookingRef: makeBookingRef(),
          suiteId,
          guestId: guest.id,
          userId: userId ?? null,
          name: fullName,
          email,
          checkIn,
          checkOut,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      })

      const details = await tx.bookingDetails.create({
        data: {
          bookingId: booking.id,
          suiteId: suite.id,
          nights,
          chaletCount: chaletCountNum,
          pricePerNight: suite.price,
          baseAmount,
          vatAmount,
          transactionFee,
          totalAmount: expectedTotal,
          currency: "NGN",
          pricingFormula: JSON.stringify({
            nights,
            chaletCount: chaletCountNum,
            pricePerNight: suite.price,
            VAT_RATE,
            TRANSACTION_RATE,
            recomputedOnServer: true,
          }),
        },
      })

      // Payment.bookingId is UNIQUE => only one payment per booking
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          detailsId: details.id,
          reference: makeReference("HB"),
          provider: "PAYSTACK",
          amount: expectedTotal,
          currency: "NGN",
          status: "PENDING",
        },
      })

      return { guest, booking, details, payment }
    })

    // --- external call AFTER transaction ---
    const paystackResponse = await paystackRequest("/transaction/initialize", "POST", {
      email,
      amount: payment.amount,
      reference: payment.reference,
      metadata: {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        guestId: guest.id,
        suiteId: suite.id,
        chaletCount: chaletCountNum,
        nights: details.nights,
        breakdown: {
          baseAmount: details.baseAmount,
          vatAmount: details.vatAmount,
          transactionFee: details.transactionFee,
          totalAmount: details.totalAmount,
          currency: details.currency,
        },
      },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success`,
    })

    // Optional: mark initiated time (nice for audit)
    await prisma.payment.update({
      where: { id: payment.id },
      data: { initiatedAt: new Date(), rawResponse: paystackResponse as any },
    })

    return NextResponse.json({
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: payment.reference,
      bookingRef: booking.bookingRef,
    })
  } catch (err: any) {
    console.error("Payment initialization error:", err)
    return NextResponse.json(
      { error: err?.message || "Payment initialization failed" },
      { status: 500 }
    )
  }
}