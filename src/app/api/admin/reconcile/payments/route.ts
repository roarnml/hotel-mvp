import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const mismatches = await prisma.payment.findMany({
    where: {
      OR: [
        { status: "PAID", booking: { paymentStatus: { not: "PAID" } } },
        { status: "FAILED", booking: { paymentStatus: "PAID" } },
      ],
    },
    include: {
      booking: true,
    },
  })

  return NextResponse.json({
    mismatches: mismatches.map(p => ({
      paymentId: p.id,
      reference: p.reference,
      paymentStatus: p.status,
      bookingRef: p.booking?.bookingRef,
      bookingPaymentStatus: p.booking?.paymentStatus,
    })),
  })
}
