import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  /* 1. Active suites with zero available rooms */
  const blockedSuites = await prisma.suite.findMany({
    where: {
      isActive: true,
      status: "ACTIVE",
      availableRooms: 0,
    },
    select: {
      id: true,
      name: true,
    },
  })

  /* 2. New guests today */
  const newGuests = await prisma.guest.findMany({
    where: {
      createdAt: { gte: today },
    },
    select: {
      id: true,
      name: true,
    },
  })

  /* 3. New confirmed bookings today */
  const newBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { gte: today },
    },
    select: {
      id: true,
      bookingRef: true,
      name: true,
      email: true,
    },
  })

  /* 4. Confirmed or checked-in bookings without room assignment */
  const unassignedBookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
      roomAssignment: null,
    },
    select: {
      id: true,
      bookingRef: true,
      name: true,
      suite: {
        select: { name: true },
      },
    },
  })

  /* Normalize for frontend */
  const notifications = [
    ...blockedSuites.map((s) => ({
      id: `suite-${s.id}`,
      message: `Suite "${s.name}" has no available rooms`,
      tag: "INFO" as const,
      color: "orange" as const,
      createdAt: new Date().toISOString(),
    })),

    ...newGuests.map((g) => ({
      id: `guest-${g.id}`,
      message: `New guest registered: ${g.name}`,
      tag: "SUCCESS" as const,
      color: "green" as const,
      createdAt: new Date().toISOString(),
    })),

    ...newBookings.map((b) => ({
      id: `booking-${b.bookingRef}`,
      message: `New booking confirmed: ${b.bookingRef} (${b.name})`,
      tag: "SUCCESS" as const,
      color: "green" as const,
      createdAt: new Date().toISOString(),
    })),

    ...unassignedBookings.map((b) => ({
      id: `assign-${b.id}`,
      message: `Room not assigned for ${b.suite.name} — Booking ${b.bookingRef}`,
      tag: "CRITICAL" as const,
      color: "red" as const,
      createdAt: new Date().toISOString(),
    })),
  ]

  return NextResponse.json(notifications)
}
