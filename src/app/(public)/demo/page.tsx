"use client"

import Link from "next/link"

export default function DemoPage() {
  const pages = [
    { name: "Booking Form", path: "/booking" },
    { name: "Revenue Insights", path: "/admin/revenue" },
    { name: "Users Management", path: "/admin/users" },
    { name: "Landing Page (Home)", path: "/" },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">🏨 MVP Demo Navigation</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
        {pages.map((page) => (
          <Link
            key={page.path}
            href={page.path}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all text-center text-xl font-semibold"
          >
            {page.name}
          </Link>
        ))}
      </div>

      <p className="mt-8 text-gray-600">
        Click a card to navigate to each section of your MVP. Everything is wired with Prisma + Stripe + Email.
      </p>
    </div>
  )
}
