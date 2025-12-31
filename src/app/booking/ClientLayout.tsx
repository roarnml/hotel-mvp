// src/app/booking/ClientLayout.tsx
"use client"
import React, { Suspense } from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
}
