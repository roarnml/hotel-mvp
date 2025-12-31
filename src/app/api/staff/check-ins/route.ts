import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["PENDING", "CHECKED_IN"],
        },
      },
      include: {
        guest: true,
        suite: true,
      },
      orderBy: {
        checkIn: "asc",
      },
    })

    return NextResponse.json(
      bookings.map(b => ({
        id: b.id,
        guestName: b.guest?.name,
        suite: b.suite?.name ?? undefined,
        status: b.status === "CHECKED_IN" ? "Checked-in" : "Pending",
      }))
    )
  } catch (error) {
    console.error("Failed to fetch check-ins", error)
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    )
  }
}
