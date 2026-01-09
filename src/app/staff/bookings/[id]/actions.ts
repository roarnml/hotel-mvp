/*"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Booking } from "@prisma/client"

const roomPools: Record<string, string[]> = {
  "Presidential Suite": ["101", "102", "103", "104", "105", "106", "107", "108"],
  "Deluxe Suite": ["201", "202", "203", "204", "205"],
}

/**
 * Get a single booking by ID, including guest and suite details.
 *
export async function getBookingById(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      guest: true,
      suite: true,
    },
  })
}

/**
 * Check-in a booking and assign a room.
 * Optionally pass a manual room number.
 *
export async function checkInGuest(
  bookingId: string,
  manualRoomNumber?: string
): Promise<Booking & { suite: { roomNumber: string } }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { suite: true, guest: true },
  })

  if (!booking) throw new Error("Booking not found")
  if (booking.status === "CHECKED_IN") throw new Error("Booking already checked in")

  const suiteName = booking.suite.name
  const pool = roomPools[suiteName]

  let assignedRoom = manualRoomNumber || booking.suite.roomNumber

  if (!assignedRoom && pool) {
    // Get rooms already taken by other CHECKED_IN bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        suiteId: booking.suiteId,
        status: "CHECKED_IN",
      },
      include: { suite: true },
    })

    const usedRooms = activeBookings.map((b) => b.suite.roomNumber)
    const availableRooms = pool.filter((r) => !usedRooms.includes(r))
    assignedRoom = availableRooms[0] ?? pool[0] // fallback if all taken
  }

  // Update booking status and assign room
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CHECKED_IN",
      checkIn: new Date(),
      suite: {
        update: {
          roomNumber: assignedRoom,
        },
      },
    },
    include: { suite: true, guest: true },
  })

  revalidatePath("/staff/bookings")
  return updatedBooking
}

/**
 * Check-out a booking and release room availability.
 *
export async function checkOutGuest(bookingId: string) {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) throw new Error("Booking not found")
    if (booking.status !== "CHECKED_IN") {
      throw new Error("Cannot check-out a guest who is not checked in")
    }

    // 1️⃣ Mark booking as checked out
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CHECKED_OUT",
        checkOut: new Date(),
      },
    })

    // 2️⃣ Increment available rooms for the suite category
    await tx.suite.update({
      where: { id: booking.suiteId },
      data: {
        availableRooms: {
          increment: 1,
        },
      },
    })
  })

  revalidatePath("/staff/bookings")
}

/**
 * Mark a guest as VIP.
 *
export async function markGuestVIP(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { guestId: true },
  })

  if (!booking) throw new Error("Booking not found")

  await prisma.guest.update({
    where: { id: booking.guestId ?? "" },
    data: { isVIP: true },
  })

  revalidatePath("/staff/bookings")
}
*/

"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/* ----------------------------------------
   Room pools (can later move to DB)
----------------------------------------- */
const roomPools: Record<string, string[]> = {
  "Presidential Suite": ["101", "102", "103", "104", "105", "106", "107", "108"],
  "Deluxe Suite": ["201", "202", "203", "204", "205"],
  "REGULAR": ["Chalet 1", "Chalet 2", "Chalet 3", "Chalet 4", "Chalet 5", "Chalet 6"],
  "VIP": ["Villa 1", "Villa 2", "Villa 3"],
}

/* ----------------------------------------
   Get Booking by ID
----------------------------------------- */
// app/staff/actions/booking.ts


export async function getBookingById(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }, // <- use 'id', not 'bookingRef'
    include: {
      guest: true,
      suite: true,
      roomAssignment: true,
      payment: true,
      user: true,
    },
  })

  if (!booking) return null

  return {
    id: booking.id,
    bookingRef: booking.bookingRef,
    suiteId: booking.suiteId,
    guestId: booking.guestId,
    userId: booking.userId,

    name: booking.name,
    email: booking.email,

    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),

    amountPaid: booking.amountPaid,

    status: booking.status,
    paymentStatus: booking.paymentStatus,

    ticketNumber: booking.ticketNumber,
    checkInNumber: booking.checkInNumber,
    ticketPdfUrl: booking.ticketPdfUrl,
    ticketIssuedAt: booking.ticketIssuedAt?.toISOString() ?? null,
    emailSentAt: booking.emailSentAt?.toISOString() ?? null,

    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),

    suite: {
      id: booking.suite.id,
      name: booking.suite.name,
      category: booking.suite.category,
    },

    guest: booking.guest
      ? {
          id: booking.guest.id,
          name: booking.guest.name,
          email: booking.guest.email,
          isVIP: booking.guest.isVIP,
        }
      : null,

    roomAssignment: booking.roomAssignment
      ? {
          id: booking.roomAssignment.id,
          roomNumber: booking.roomAssignment.roomNumber,
        }
      : null,
  }
}

/* ----------------------------------------
   CHECK-IN (HARD-LOCKED)
----------------------------------------- */
import crypto from "crypto"

export async function checkInGuest(
  bookingId: string,
  manualRoomNumber?: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Fetch booking
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        suite: true,
        guest: true,
        roomAssignment: true,
        payment: true,
      },
    })

    if (!booking) throw new Error("Booking not found")

    // 2️⃣ Business validations
    if (booking.status === "CHECKED_IN")
      throw new Error("Guest already checked in")

    if (booking.status !== "CONFIRMED")
      throw new Error("Booking is not confirmed")

    if (!booking.payment || booking.payment.status !== "PAID")
      throw new Error("Payment not completed")

    if (booking.roomAssignment)
      throw new Error("Room already assigned")

    // 3️⃣ Fetch active rooms for this suite
    const activeRooms = await tx.roomAssignment.findMany({
      where: { suiteId: booking.suiteId },
      select: { roomNumber: true },
    })

    const usedRooms = new Set(activeRooms.map((r) => r.roomNumber))

    // 4️⃣ Define all possible rooms for this suite
    // ⚠️ Adjust this logic if your suites have variable room ranges
    const allRooms = Array.from({ length: 10 }, (_, i) => (101 + i).toString())
    const availableRooms = allRooms.filter((r) => !usedRooms.has(r))

    if (!availableRooms.length)
      throw new Error("No available rooms in this suite")

    // 5️⃣ Assign room
    let assignedRoom = manualRoomNumber
    if (!assignedRoom) {
      assignedRoom = availableRooms[0] // auto-assign first available
    } else if (usedRooms.has(assignedRoom)) {
      throw new Error("Selected room is already assigned")
    }

    // 6️⃣ Create room assignment
    await tx.roomAssignment.create({
      data: {
        bookingId: booking.id,
        suiteId: booking.suiteId,
        roomNumber: assignedRoom,
      },
    })

    // 7️⃣ Update booking
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CHECKED_IN",
        checkIn: new Date(),
        checkInNumber: crypto.randomUUID(),
      },
      include: {
        suite: true,
        guest: true,
        roomAssignment: true,
      },
    })

    // 8️⃣ Revalidate paths for Next.js cache
    revalidatePath("/staff/bookings")
    revalidatePath(`/staff/bookings/${bookingId}`)

    // 9️⃣ Return updated booking info for the frontend
    return {
      id: updatedBooking.id,
      guest: updatedBooking.guest,
      suite: {
        name: updatedBooking.suite.name,
        category: updatedBooking.suite.category,
        type: updatedBooking.suite.name,
      },
      roomNumber: updatedBooking.roomAssignment?.roomNumber ?? null,
      checkIn: updatedBooking.checkIn,
      checkOut: updatedBooking.checkOut,
      status: updatedBooking.status,
      vip: updatedBooking.guest?.isVIP ?? false,
    }
  })
}

/* ----------------------------------------
   CHECK-OUT (SAFE & ATOMIC)
----------------------------------------- */
export async function checkOutGuest(bookingId: string) {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { roomAssignment: true },
    })

    if (!booking) throw new Error("Booking not found")
    if (booking.status !== "CHECKED_IN")
      throw new Error("Guest is not checked in")

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CHECKED_OUT",
        checkOut: new Date(),
      },
    })

    if (booking.roomAssignment) {
      await tx.roomAssignment.delete({
        where: { id: booking.roomAssignment.id },
      })
    }
  })

  revalidatePath("/staff/bookings")
}

/* ----------------------------------------
   VIP FLAG
----------------------------------------- */
export async function markGuestVIP(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { guestId: true },
  })

  if (!booking?.guestId)
    throw new Error("Guest not found")

  await prisma.guest.update({
    where: { id: booking.guestId },
    data: { isVIP: true },
  })

  revalidatePath("/staff/bookings")
}

/* ----------------------------------------
   ROOM POOLS (READ-ONLY FOR UI)
----------------------------------------- */
// actions.ts
// actions.ts
export async function getRoomPoolForSuite(suiteId: string) {
  try {
    // Use absolute URL in client
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/suite/${suiteId}/available-rooms`
        : `/api/suite/${suiteId}/available-rooms` // SSR fallback

    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch available rooms")
    const rooms: string[] = await res.json()
    return rooms
  } catch (err) {
    console.error(err)
    return []
  }
}

/**
 * Delete Pending Bookings
 */

interface DeleteBookingArgs {
  bookingId: string
  adminPassword?: string
  staffRole: "OWNER" | "MANAGER" | "STAFF" | "CHECKIN_STAFF"
}

const ADMIN_DELETE_PASSWORD = "admin123" // or from env

export async function deletePendingBooking({
  bookingId,
  adminPassword,
  staffRole,
}: DeleteBookingArgs) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        roomAssignment: true,
        payment: true,
        suite: true, // include suite to update availableRooms
      },
    })

    if (!booking) throw new Error("Booking not found")

    // Only pending & unpaid bookings allowed
    if (booking.status !== "PENDING" || booking.payment?.status !== "PENDING") {
      throw new Error("Only pending and unpaid bookings can be deleted")
    }

    // Admin password required if staff is not OWNER or MANAGER
    if (staffRole !== "OWNER" && staffRole !== "MANAGER") {
      if (!adminPassword) throw new Error("Admin password required")
      if (adminPassword !== ADMIN_DELETE_PASSWORD)
        throw new Error("Invalid admin password")
    }

    // 1️⃣ Cleanup room assignment (if any)
    if (booking.roomAssignment) {
      await tx.roomAssignment.delete({
        where: { id: booking.roomAssignment.id },
      })
    }

    // 2️⃣ Delete payment record (if exists)
    if (booking.payment) {
      await tx.payment.delete({
        where: { id: booking.payment.id },
      })
    }

    // 3️⃣ Delete booking itself
    await tx.booking.delete({ where: { id: bookingId } })

    // 4️⃣ Increment availableRooms in the suite
    if (booking.suite) {
      await tx.suite.update({
        where: { id: booking.suite.id },
        data: { availableRooms: { increment: 1 } },
      })
    }

    // 5️⃣ Revalidate booking paths for frontend
    revalidatePath("/staff/bookings")

    return { success: true }
  })
}
