// lib/normalizeBooking.ts
import { BookingDB, BookingUI } from "@/types/booking"

// Helper: always return string, fallback to empty string if null
function toISOString(value: Date | null): string {
  return value ? new Date(value).toISOString() : ""
}

export function normalizeBooking(data: BookingDB): BookingUI {
  const checkInDate = data.checkIn ? new Date(data.checkIn) : null
  const checkOutDate = data.checkOut ? new Date(data.checkOut) : null

  const nights =
    checkInDate && checkOutDate
      ? Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

  return {
    ...data,

    // Guaranteed string
    checkIn: toISOString(data.checkIn),
    checkOut: toISOString(data.checkOut),

    createdAt: toISOString(data.createdAt),
    updatedAt: toISOString(data.updatedAt),

    ticketIssuedAt: data.ticketIssuedAt ? toISOString(data.ticketIssuedAt) : "",
    emailSentAt: data.emailSentAt ? toISOString(data.emailSentAt) : "",


    //canCheckIn: data.status === "CONFIRMED" && data.paymentStatus === "PAID",
    //canCheckOut: data.status === "CHECKED_IN",
    //canDelete: data.status === "PENDING" && data.paymentStatus === "PENDING",
  }
}


