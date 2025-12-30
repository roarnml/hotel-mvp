import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { bookingId, suiteId } = await req.json()

  if (!bookingId || !suiteId) {
    return NextResponse.json(
      { error: "Missing bookingId or suiteId" },
      { status: 400 }
    )
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_IN",
      suiteId,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true })
}
