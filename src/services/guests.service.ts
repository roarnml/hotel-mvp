import { prisma } from "@/lib/prisma"

type CreateGuestInput = {
  name: string
  email: string
  phone?: string
  address?: string
}

export async function findOrCreateGuest(data: CreateGuestInput) {
  const existing = await prisma.guest.findUnique({
    where: { email: data.email },
  })

  if (existing) return existing

  return prisma.guest.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
    },
  })
}
