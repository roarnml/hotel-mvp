
// app/staff/bookings/[id]/actions.ts
"use server"

import { requireStaffRole } from "@/lib/auth/requireStaffRole"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import { PaymentStatus } from "@prisma/client"
import { sendTicketEmailForBooking } from "@/services/email.service"

/* ----------------------------------------
   Room pools (can later move to DB)
----------------------------------------- */
const roomPools: Record<string, string[]> = {
  "Presidential Suite": ["101", "102", "103", "104", "105", "106", "107", "108"],
  "Deluxe Suite": ["201", "202", "203", "204", "205"],
  REGULAR: ["Chalet 1", "Chalet 2", "Chalet 3", "Chalet 4", "Chalet 5", "Chalet 6"],
  VIP: ["Villa 1", "Villa 2", "Villa 3"],
}

/* ----------------------------------------
   Helpers
----------------------------------------- */
function nowIso() {
  return new Date().toISOString()
}

async function logBookingEvent(tx: any, bookingId: string, type: string, metadata?: any) {
  await tx.bookingEvent.create({
    data: {
      bookingId,
      type,
      metadata: metadata ?? {},
    },
  })
}

function getRoomPoolForSuiteNameOrCategory(suiteName: string, suiteCategory: string) {
  return roomPools[suiteName] ?? roomPools[suiteCategory] ?? []
}

/* ----------------------------------------
   Get room options for this booking (server-side)
----------------------------------------- */
export async function getRoomOptionsForBooking(bookingId: string) {
  await requireStaffRole(["CHECKIN_STAFF", "STAFF"]) // ✅ only check-in staff

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { suite: true },
  })
  if (!booking) return []

  const allRooms = getRoomPoolForSuiteNameOrCategory(booking.suite.name, String(booking.suite.category))
  if (!allRooms.length) return []

  const assigned = await prisma.roomAssignment.findMany({
    where: { suiteId: booking.suiteId },
    select: { roomNumber: true },
  })
  const used = new Set(assigned.map((r) => r.roomNumber))
  return allRooms.filter((r) => !used.has(r))
}
/* ----------------------------------------
   CHECK-IN (atomic, does NOT overwrite stay dates)
----------------------------------------- */
export async function checkInGuest(bookingId: string, manualRoomNumber?: string) {
  await requireStaffRole(["CHECKIN_STAFF", "STAFF"]) // ✅ only check-in staff
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        suite: true,
        guest: true,
        roomAssignment: true,
        payment: true,
        details: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })
    if (!booking) throw new Error("Booking not found")

    // Validations
    if (booking.status === "CHECKED_IN") throw new Error("Guest already checked in")
    if (booking.status !== "CONFIRMED") throw new Error("Booking is not confirmed")
    if (!booking.payment || booking.payment.status !== PaymentStatus.PAID)
      throw new Error("Payment not completed")
    if (booking.roomAssignment) throw new Error("Room already assigned")

    // Determine room pool
    const pool = getRoomPoolForSuiteNameOrCategory(booking.suite.name, String(booking.suite.category))
    if (!pool.length) throw new Error("No room pool configured for this suite/category")

    // Fetch used rooms
    const activeRooms = await tx.roomAssignment.findMany({
      where: { suiteId: booking.suiteId },
      select: { roomNumber: true },
    })
    const usedRooms = new Set(activeRooms.map((r) => r.roomNumber))

    // Available rooms
    const availableRooms = pool.filter((r) => !usedRooms.has(r))
    if (!availableRooms.length) throw new Error("No available rooms for this suite")

    // Assign room
    let assignedRoom = manualRoomNumber?.trim()
    if (!assignedRoom) assignedRoom = availableRooms[0]
    if (usedRooms.has(assignedRoom)) throw new Error("Selected room is already assigned")
    if (!pool.includes(assignedRoom)) throw new Error("Selected room is not valid for this suite")

    // Create assignment
    await tx.roomAssignment.create({
      data: {
        bookingId: booking.id,
        suiteId: booking.suiteId,
        roomNumber: assignedRoom,
      },
    })

    // Update booking status only (do NOT overwrite stay dates)
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CHECKED_IN",
        checkInNumber: crypto.randomUUID(),
      },
      select: { id: true, bookingRef: true, status: true, checkInNumber: true },
    })

    // Log event
    await logBookingEvent(tx, bookingId, "CHECK_IN", {
      at: nowIso(),
      roomNumber: assignedRoom,
      staffNote: "Checked in from staff panel",
    })

    return {
      id: updated.id,
      bookingRef: updated.bookingRef,
      status: updated.status,
      checkInNumber: updated.checkInNumber,
      roomNumber: assignedRoom,
    }
  })

  revalidatePath("/staff/bookings")
  revalidatePath(`/staff/bookings/${bookingId}`)
  return result
}

/* ----------------------------------------
   CHECK-OUT (atomic, does NOT overwrite stay dates)
----------------------------------------- */
export async function checkOutGuest(bookingId: string) {
  await requireStaffRole(["CHECKIN_STAFF", "STAFF"]) // ✅ only check-in staff
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomAssignment: true,
        details: { orderBy: { createdAt: "desc" }, take: 1 },
        suite: true,
      },
    })
    if (!booking) throw new Error("Booking not found")
    if (booking.status !== "CHECKED_IN") throw new Error("Guest is not checked in")

    // Update booking status only
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CHECKED_OUT",
      },
      select: { id: true, bookingRef: true, status: true },
    })

    // release room assignment
    if (booking.roomAssignment) {
      await tx.roomAssignment.delete({ where: { id: booking.roomAssignment.id } })
    }

    // Increment availableRooms based on chaletCount if present, else 1
    const chaletCount = booking.details?.[0]?.chaletCount ?? 1
    const roomsToIncrement = Math.max(1, chaletCount)

    await tx.suite.update({
      where: { id: booking.suiteId },
      data: { availableRooms: { increment: roomsToIncrement } },
    })

    await logBookingEvent(tx, bookingId, "CHECK_OUT", {
      at: nowIso(),
      roomNumber: booking.roomAssignment?.roomNumber ?? null,
      roomsIncremented: roomsToIncrement,
      staffNote: "Checked out from staff panel",
    })

    return { id: updated.id, bookingRef: updated.bookingRef, status: updated.status }
  })

  revalidatePath("/staff/bookings")
  revalidatePath(`/staff/bookings/${bookingId}`)
  return result
}

/* ----------------------------------------
   VIP FLAG
----------------------------------------- */
export async function markGuestVIP(bookingId: string) {
  await requireStaffRole(["MANAGER", "OWNER"]) // ✅ block check-in staff
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { guestId: true },
  })
  if (!booking?.guestId) throw new Error("Guest not found")

  await prisma.guest.update({
    where: { id: booking.guestId },
    data: { isVIP: true },
  })

  revalidatePath("/staff/bookings")
  revalidatePath(`/staff/bookings/${bookingId}`)
  return { ok: true }
}

/* ----------------------------------------
   RESEND TICKET EMAIL (safe)
----------------------------------------- */
export async function resendTicketEmail(bookingId: string) {
  await requireStaffRole(["MANAGER", "OWNER"]) // ✅ block check-in staff
  // Let email service decide whether it can send (paid, etc).
  const res = await sendTicketEmailForBooking(bookingId)
  revalidatePath(`/staff/bookings/${bookingId}`)
  return res
}