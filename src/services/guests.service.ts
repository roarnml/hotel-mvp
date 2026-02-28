// services/guests.service.ts
import { prisma } from "@/lib/prisma"
import { Prisma} from "@prisma/client"

type CreateGuestInput = {
  name: string
  email: string
  phone?: string
  address?: string
}

/**
 * Find or create a guest by unique email.
 * - Transaction-safe (pass tx from prisma.$transaction)
 * - Race-condition safe via upsert
 * - Keeps guest profile up-to-date on repeat bookings
 */
export async function findOrCreateGuest(
  data: CreateGuestInput,
  db: Prisma.TransactionClient = prisma
) {
  const { name, email, phone, address } = data

  return db.guest.upsert({
    where: { email },
    update: {
      name,
      phone: phone || undefined,
      address: address || undefined,
    },
    create: {
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
    },
  })
}