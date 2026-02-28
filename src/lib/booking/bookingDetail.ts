import { prisma } from "@/lib/prisma"
import type { BookingDetailDTO } from "@/types/booking"

const iso = (d?: Date | null) => (d ? d.toISOString() : null)

export async function getBookingDetail(bookingId: string): Promise<BookingDetailDTO | null> {
  if (!bookingId) return null

  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      suite: true,
      guest: true,
      roomAssignment: true,
      payment: true,
      details: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  if (!b) return null

  const d = b.details?.[0] ?? null

  return {
    id: b.id,
    bookingRef: b.bookingRef,
    status: b.status,
    paymentStatus: b.paymentStatus,

    ticketNumber: b.ticketNumber,
    checkInNumber: b.checkInNumber,

    stay: {
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      nights: d?.nights ?? null,
      chaletCount: d?.chaletCount ?? null,
    },

    guest: {
      name: b.name,
      email: b.email,
      phone: b.guest?.phone ?? null,
      address: b.guest?.address ?? null,
      isVIP: b.guest?.isVIP ?? null,
    },

    suite: {
      id: b.suite.id,
      name: b.suite.name,
      category: String(b.suite.category),
      capacity: b.suite.capacity ?? null,
      features: b.suite.features ?? [],
    },

    room: {
      roomNumber: b.roomAssignment?.roomNumber ?? null,
    },

    payment: {
      reference: b.payment?.reference ?? null,
      provider: b.payment?.provider ?? null,
      status: b.payment?.status ?? null,
      amountExpected: b.payment?.amount ?? null,
      amountPaid: b.payment?.amountPaid ?? null,
      currency: b.payment?.currency ?? null,
      paidAt: iso(b.payment?.paidAt),
    },

    timeline: {
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      ticketIssuedAt: iso(b.ticketIssuedAt),
      emailSentAt: iso(b.emailSentAt),
    },
  }
}