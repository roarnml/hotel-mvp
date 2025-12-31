// src/app/(public)/booking/ClientBookingLayout.tsx
"use client"
import { Suspense } from "react"

export default function ClientBookingLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p className="text-center mt-10">Loading...</p>}>{children}</Suspense>
}
