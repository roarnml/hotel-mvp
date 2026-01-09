import ProtectedLayout from "@/components/admin/ProtectedLayouts"
import { Role } from "@/config/dashboard.config"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout allowedRoles={["MANAGER", "OWNER" as Role]}>{children}</ProtectedLayout>
}
