import { prisma } from "@/lib/prisma"
import type { SuiteStatus } from "@prisma/client"

export type AvailableSuite = {
  id: string
  name: string
  roomNumber?: string
  capacity?: number
  price?: number
  features?: string[]
}

/**
 * Fetch all suites currently available for booking
 */
export async function getAvailableSuites(): Promise<AvailableSuite[]> {
  return prisma.suite.findMany({
    where: { status: "AVAILABLE" as SuiteStatus },
    select: {
      id: true,
      name: true,
      roomNumber: true,
      capacity: true,
      price: true,
      features: true,
    },
    orderBy: { name: "asc" }, // optional: sort alphabetically
  })
}
