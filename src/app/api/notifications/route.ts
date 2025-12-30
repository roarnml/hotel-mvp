import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  /* 1. Unassigned Rooms */
  const unassignedSuites = await prisma.suite.findMany({
    where: { roomNumber: "UNASSIGNED" },
    select: { id: true, name: true, status: true },
  })

  /* 2. New Guests Today */
  const newGuests = await prisma.guest.findMany({
    where: { createdAt: { gte: today } },
    select: { id: true, name: true },
  })

  /* 3. New Active Bookings */
  const newBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      createdAt: { gte: today },
    },
    select: {
      bookingRef: true,
      guest: {
        select: { name: true, email: true },
      },
    },
  })

  /* 4. Housekeeping Tasks NOT Done */
  const criticalTasks = await prisma.housekeepingTask.findMany({
    where: { status: { not: "DONE" } },
    select: { id: true, suiteName: true },
  })

  /* Normalize */
  const notifications = [
    ...unassignedSuites.map((s) => ({
      id: `suite-${s.id}`,
      message: `Suite ${s.name} yet to be assigned`,
      tag: "INFO",
      color: "orange",
      createdAt: new Date(),
    })),

    ...newGuests.map((g) => ({
      id: `guest-${g.id}`,
      message: `New guest registered: ${g.name}`,
      tag: "SUCCESS",
      color: "green",
      createdAt: new Date(),
    })),

    ...newBookings.map((b) => ({
      id: `booking-${b.bookingRef}`,
      message: `New booking ${b.bookingRef} (${b.guest?.name} - ${b.guest?.email})`,
      tag: "SUCCESS",
      color: "green",
      createdAt: new Date(),
    })),

    ...criticalTasks.map((t) => ({
      id: `task-${t.id}`,
      message: `Housekeeping pending for ${t.suiteName}`,
      tag: "CRITICAL",
      color: "red",
      createdAt: new Date(),
    })),
  ]

  return NextResponse.json(notifications)
}
