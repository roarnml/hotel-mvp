// src/components/layouts/ProtectedLayout.tsx
import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/admin/Sidebar"
import Navbar from "@/components/admin/Navbar"
import { Role } from "@/config/dashboard.config"

interface ProtectedLayoutProps {
  children: ReactNode
  allowedRoles: Role[]
}

/**
 * Server-only layout wrapper for role-based access control.
 * Redirects to /login if not authenticated and /unauthorized if role mismatch.
 */
export default async function ProtectedLayout({
  children,
  allowedRoles,
}: ProtectedLayoutProps) {
  // Server-side session retrieval
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  // Ensure user role matches schema roles
  const user = session.user as { name: string; role: Role }
  console.log("ProtectedLayout - User Role:", user.role)

  if (!allowedRoles.includes(user.role)) redirect("/unauthorized")

  return (
    <div className="w-screen flex min-h-screen bg-gray-100">
      {/* Sidebar adapts to role */}
      <Sidebar role={user.role} />

      <div className="flex flex-col flex-1">
        <Navbar role={user.role} user={user} />
        <main className="w-full flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
