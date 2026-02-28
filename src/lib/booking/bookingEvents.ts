import "server-only"
import { prisma } from "@/lib/prisma"

export type BookingEventDTO = {
  id: string
  type: string
  createdAt: string // ISO
  metadata: any
}

export async function getBookingEvents(bookingId: string): Promise<BookingEventDTO[]> {
  if (!bookingId) return []

  const events = await prisma.bookingEvent.findMany({
    where: { bookingId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      type: true,
      createdAt: true,
      metadata: true,
    },
  })

  return events.map((e) => ({
    id: e.id,
    type: e.type,
    createdAt: e.createdAt.toISOString(),
    metadata: e.metadata ?? {},
  }))
}