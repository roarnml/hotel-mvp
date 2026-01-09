import { PrismaClient } from "@prisma/client";


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
