import { prisma } from "@/lib/prisma"
import type { Booking, Guest, Suite } from "@prisma/client"

export type PendingCheckInData = {
  id: string
  guestName: string
  suiteName: string
  status: "Pending"
}

/**
 * Fetch all CONFIRMED bookings for today (pending check-ins)
 */
export async function getPendingCheckIns(): Promise<PendingCheckInData[]> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  // Include guest and suite safely
  const bookings: (Booking & { guest: Guest | null; suite: Suite | null })[] =
    await prisma.booking.findMany({
      where: {
        checkIn: { gte: start, lte: end },
        status: "CONFIRMED",
      },
      include: {
        guest: true,
        suite: true,
      },
      orderBy: { checkIn: "asc" },
    })

  // Map safely with fallbacks
  return bookings.map((b) => ({
    id: b.id,
    guestName: b.guest?.name ?? b.name ?? "Unknown Guest", // fallback if guest deleted
    suiteName: b.suite?.name ?? "Unassigned",               // fallback if suite missing
    status: "Pending",
  }))
}
