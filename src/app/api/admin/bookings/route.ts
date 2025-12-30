import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { suite: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ bookings })
  } catch (err: any) {
    console.error("Error fetching bookings:", err)
    return NextResponse.json(
      { error: "Failed to fetch bookings." },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticketNumber, checkedIn } = body

    if (!ticketNumber || typeof checkedIn !== "boolean") {
      throw new Error("Missing ticketNumber or checkedIn status")
    }

    const updated = await prisma.booking.update({
      where: { ticketNumber },
      data: { checkedIn, checkedInAt: checkedIn ? new Date() : null },
    })

    return NextResponse.json({ booking: updated })
  } catch (err: any) {
    console.error("Error updating booking:", err)
    return NextResponse.json(
      { error: "Failed to update booking." },
      { status: 500 }
    )
  }
}
