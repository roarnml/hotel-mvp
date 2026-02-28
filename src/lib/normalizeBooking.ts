// lib/normalizeBooking.ts
import { BookingDB, BookingUI } from "@/types/booking"

export function normalizeBooking(data: BookingDB) {
  const checkIn = new Date(data.checkIn)
  const checkOut = new Date(data.checkOut)

  const nights =
    Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 0

  return {
    ...data,
    checkIn: checkIn.toISOString(),
    checkOut: checkOut.toISOString(),
    createdAt: new Date(data.createdAt).toISOString(),
    updatedAt: new Date(data.updatedAt).toISOString(),
    ticketIssuedAt: data.ticketIssuedAt ? new Date(data.ticketIssuedAt).toISOString() : null,
    emailSentAt: data.emailSentAt ? new Date(data.emailSentAt).toISOString() : null,

    nights,
    canCheckIn: data.status === "CONFIRMED" && data.paymentStatus === "PAID",
    canCheckOut: data.status === "CHECKED_IN",
    canDelete: data.status === "PENDING" && data.paymentStatus === "PENDING",
  }
}
