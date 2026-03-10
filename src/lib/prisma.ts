/*import { PrismaClient } from "@prisma/client";


// Create a global reference to avoid multiple PrismaClient instances in dev
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use the existing client if it exists, otherwise create a new one
export const prisma: PrismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

// Only assign to global in non-production (prevents multiple connections in dev with HMR)
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
*/

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma