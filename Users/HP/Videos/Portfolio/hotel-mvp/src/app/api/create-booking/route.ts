import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { suiteId, name, email, phone, address, checkIn, checkOut } = body
    
    // 1️⃣ Validate required fields
    if (!suiteId || !name || !email || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: "Check-in must be before check-out" },
        { status: 400 }
      )
    }

    // 2️⃣ Fetch suite and verify availability
    const suite = await prisma.suite.findUnique({ where: { id: suiteId } })

    if (!suite || !suite.isActive) {
      return NextResponse.json(
        { error: "Suite not available" },
        { status: 404 }
      )
    }

    // 3️⃣ Prevent overlapping bookings (atomic check)
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        suiteId,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
    })

    if (overlappingBooking) {
      return NextResponse.json(
        { error: "Suite already booked for selected dates" },
        { status: 409 }
      )
    }

    // 4️⃣ Upsert guest (idempotent)
    const guest = await prisma.guest.upsert({
      where: { email },
      update: { name, phone, address },
      create: { name, email, phone, address },
    })

    // 5️⃣ Booking identifiers
    const bookingRef = `BK-${randomUUID().slice(0, 8).toUpperCase()}`
    const checkInNumber = `CHK-${Date.now()}`

    
    // 6️⃣ Create booking (PENDING payment)
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        checkInNumber,
        paymentStatus: "PENDING",
        suiteId,
        guestId: guest.id,
        name,
        email,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: "PENDING",
      },
    })


    // 7️⃣ Initialize Paystack transaction
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: suite.price * 100, // kobo
          currency: "NGN",
          reference: bookingRef,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?reference=${bookingRef}`,
          metadata: {
            bookingId: booking.id,
            bookingRef,
          },
        }),
      }
    )

    const paystackData = await paystackRes.json()

    if (!paystackData.status) {
      console.error("Paystack initialization failed:", paystackData)
      return NextResponse.json(
        { error: paystackData.message || "Paystack initialization failed" },
        { status: 500 }
      )
    }

    // 8️⃣ Return authorization URL for frontend
    return NextResponse.json({
      success: true,
      bookingRef,
      authorizationUrl: paystackData.data.authorization_url,
    })
  } catch (err) {
    console.error("Create booking error:", err)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}
