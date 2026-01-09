import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref")

  if (!ref) {
    return NextResponse.json({ error: "Missing booking ref" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingRef: ref },
    select: {
      paymentStatus: true, // PENDING, SUCCESS, FAILED
      status: true,        // PENDING, CONFIRMED, CANCELLED
      ticketNumber: true,
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Map Prisma status to frontend-friendly status
  let frontendStatus: "PENDING" | "SUCCESS" | "FAILED" = "PENDING"

  if (booking.paymentStatus === "PAID") {
    frontendStatus = "SUCCESS"
  } else if (booking.paymentStatus === "FAILED") {
    frontendStatus = "FAILED"
  }

  return NextResponse.json({
    paymentStatus: frontendStatus,
    status: booking.status,
    ticketNumber: booking.ticketNumber,
  })
}
