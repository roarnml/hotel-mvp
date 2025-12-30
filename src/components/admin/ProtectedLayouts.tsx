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
export default async function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const session = await getServerSession(authOptions); // server-only
  if (!session) redirect("/login");

  const user = session.user as { name: string; role: Role };
  if (!allowedRoles.includes(user.role)) redirect("/unauthorized");

  return (
    <div className="w-screen flex min-h-screen bg-gray-100">
      <Sidebar role={user.role} />
      <div className="flex flex-col flex-1">
        <Navbar role={user.role} user={user} />
        <main className="w-full flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
