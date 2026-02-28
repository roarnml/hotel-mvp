/*import { prisma } from "@/lib/prisma"
import { generateBookingRef } from "@/utils/generateBookingRef"

export async function createBooking({
  suiteId,
  guestId,
  name,
  email,
  checkIn,
  checkOut,
  userId,
}: {
  suiteId: string
  guestId: string
  name: string
  email: string
  checkIn: Date
  checkOut: Date
  userId?: string
}) {
  return prisma.booking.create({
    data: {
      suiteId,
      guestId,
      name,
      email,
      checkIn,
      checkOut,
      userId,
      bookingRef: generateBookingRef(),
      status: "PENDING",
      paymentStatus: "PENDING",
    },
    include: { suite: true },
  })
}


// Fetch booking by bookingRef or ticketNumber
export async function getBookingByRef(ref: string) {
  return prisma.booking.findFirst({
    where: {
      OR: [
        { bookingRef: ref },
        { ticketNumber: ref },
      ],
    },
    include: { suite: true },
  })
}
*/
// services/booking.service.ts
import { prisma } from "@/lib/prisma"
import { generateBookingRef } from "@/utils/generateBookingRef"
//import { Prisma } from "@prisma/client"


//import { prisma } from "@/lib/prisma"
import { Prisma, PrismaClient } from "@prisma/client"
//import { generateBookingRef } from "@/utils/generateBookingRef"

function calcNights(checkIn: Date, checkOut: Date) {
  const msPerDay = 1000 * 60 * 60 * 24
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const diff = Math.round((end.getTime() - start.getTime()) / msPerDay)
  return Math.max(1, diff)
}

/*export async function createBooking(
  {
    suiteId,
    guestId,
    name,
    email,
    phone,
    address,
    checkIn,
    checkOut,
    chaletCount,
    pricePerNight,
    baseAmount,
    vatAmount,
    transactionFee,
    totalAmount,
    currency = "NGN",
    pricingFormula,
    userId,
  }: {
    suiteId: string
    guestId: string
    name: string
    email: string
    phone?: string
    address?: string
    checkIn: Date
    checkOut: Date
    chaletCount: number
    pricePerNight: number
    baseAmount: number
    vatAmount: number
    transactionFee: number
    totalAmount: number
    currency?: string
    pricingFormula?: string
    userId?: string
  },
  db: Prisma.TransactionClient = prisma
) {
  const nights = calcNights(checkIn, checkOut)

  // Keep guest profile in sync (optional; but useful)
  await db.guest.update({
    where: { id: guestId },
    data: {
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
    },
  })

  return db.booking.create({
    data: {
      suiteId,
      guestId,
      name,
      email,
      checkIn,
      checkOut,
      userId,
      bookingRef: generateBookingRef(),
      status: "PENDING",
      paymentStatus: "PENDING",
      details: {
        create: {
          suiteId,
          nights,
          chaletCount,
          pricePerNight,
          baseAmount,
          vatAmount,
          transactionFee,
          totalAmount,
          currency,
          pricingFormula,
        },
      },
    },
    include: { suite: true, guest: true, details: true },
  })
}*/



type DbClient = PrismaClient | Prisma.TransactionClient

export async function createBooking(
  {
    suiteId,
    guestId,
    name,
    email,
    phone,
    address,
    checkIn,
    checkOut,
    chaletCount,
    pricePerNight,
    baseAmount,
    vatAmount,
    transactionFee,
    totalAmount,
    currency = "NGN",
    pricingFormula,
    userId,
  }: {
    suiteId: string
    guestId: string
    name: string
    email: string
    phone?: string
    address?: string
    checkIn: Date
    checkOut: Date
    chaletCount: number
    pricePerNight: number
    baseAmount: number
    vatAmount: number
    transactionFee: number
    totalAmount: number
    currency?: string
    pricingFormula?: string
    userId?: string
  },
  db: DbClient = prisma
) {
  const nights = calcNights(checkIn, checkOut)

  await db.guest.update({
    where: { id: guestId },
    data: {
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
    },
  })

  return db.booking.create({
    data: {
      suiteId,
      guestId,
      name,
      email,
      checkIn,
      checkOut,
      userId,
      bookingRef: generateBookingRef(),
      status: "PENDING",
      paymentStatus: "PENDING",
      details: {
        create: {
          suiteId,
          nights,
          chaletCount,
          pricePerNight,
          baseAmount,
          vatAmount,
          transactionFee,
          totalAmount,
          currency,
          pricingFormula,
        },
      },
    },
    include: {
      suite: true,
      guest: true,
      details: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })
}