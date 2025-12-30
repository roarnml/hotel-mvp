// src/app/(admin)/admin/login/page.tsx
import AdminLoginForm from "@/components/admin/AdminLoginForm"

export default function LoginPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#75240E] to-black">
      <AdminLoginForm />
    </div>
  )
}
