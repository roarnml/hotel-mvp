// src/lib/auth/requireStaffRole.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export type StaffRole = "OWNER" | "MANAGER" | "CHECKIN_STAFF" | "STAFF"

export async function requireStaffRole(allowedRoles: StaffRole[]) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const role = session.user.role as StaffRole

  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden: insufficient privileges")
  }

  return session.user
}