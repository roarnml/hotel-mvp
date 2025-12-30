// REMOVE "use client"
import ProtectedLayout from "@/components/admin/ProtectedLayouts";
import { Role } from "@/config/dashboard.config";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  // ProtectedLayout is already server-only, no SessionProvider needed here
  return (
    <ProtectedLayout allowedRoles={["STAFF", "ADMIN", "SUPER_USER" as Role]}>
      {children}
    </ProtectedLayout>
  );
}
