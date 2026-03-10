"use server"

import { prisma } from "@/lib/prisma"
import { BookingStatus, SuiteCategory, Booking } from "@prisma/client"

/**
 * Normalized booking shape for staff frontend
 */
export interface NormalizedBooking {
  id: string
  bookingRef: string
  guestName: string
  guestEmail: string
  suiteName: string
  suiteCategory: string
  roomNumber?: string | null
  checkIn: string
  checkOut: string
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
  paymentStatus: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED"
  vip: boolean
  createdAt: string
}

/**
 * Fetch all bookings (searchable)
 */
export async function getBookings(query?: string): Promise<NormalizedBooking[]> {
  const bookings = await prisma.booking.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { suite: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      suite: true,
      guest: true,
      roomAssignment: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return bookings.map((b) => ({
    id: b.id,
    bookingRef: b.bookingRef,
    guestName: b.guest?.name ?? b.name,
    guestEmail: b.guest?.email ?? b.email,
    suiteName: b.suite.name,
    suiteCategory: b.suite.category,
    roomNumber: b.roomAssignment?.roomNumber ?? null,
    checkIn: b.checkIn.toISOString().split("T")[0],
    checkOut: b.checkOut.toISOString().split("T")[0],
    status: b.status as Booking["status"],
    paymentStatus: b.paymentStatus,
    vip: b.guest?.isVIP ?? false,
    createdAt: b.createdAt.toISOString(),
  }))

}

/**
 * Fetch full booking details by ID
 */
export async function getBookingById(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      suite: true,
      guest: true,
      roomAssignment: true,
      payment: true,
      user: true,
    },
  })

  if (!booking) return null

  return {
    id: booking.id,
    bookingRef: booking.bookingRef,

    guest: {
      id: booking.guest?.id ?? null,
      name: booking.guest?.name ?? booking.name,
      email: booking.guest?.email ?? booking.email,
      phone: booking.guest?.phone ?? null,
      isVIP: booking.guest?.isVIP ?? false,
    },

    suite: {
      id: booking.suite.id,
      name: booking.suite.name,
      category: booking.suite.category,
    },

    roomNumber: booking.roomAssignment?.roomNumber ?? null,

    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),

    status: booking.status,
    paymentStatus: booking.payment?.status ?? "PENDING",

    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }
}
