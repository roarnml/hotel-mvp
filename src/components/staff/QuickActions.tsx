"use client"

import { useRouter } from "next/navigation"
import { FiLogIn, FiSearch, FiCalendar } from "react-icons/fi"
import { IconType } from "react-icons"

interface ActionItem {
  label: string
  href: string
  icon: IconType
  variant?: "primary" | "secondary"
}

const actions: ActionItem[] = [
  { label: "Check in Guest", href: "/staff/check-in", icon: FiLogIn, variant: "primary" },
  { label: "Find Booking", href: "/staff/bookings", icon: FiSearch, variant: "secondary" },
  { label: "View All Arrivals", href: "/staff/arrivals", icon: FiCalendar, variant: "secondary" },
]

export default function QuickActions() {
  const router = useRouter()

  const getButtonClasses = (variant: ActionItem["variant"]) =>
    variant === "primary"
      ? "bg-[#D55605] hover:bg-[#b84804] text-white border-none"
      : "border border-[#75240E] hover:bg-[#75240E]/30 text-white bg-transparent"

  return (
    <div className="rounded-2xl bg-black border border-[#75240E] p-6 flex flex-col gap-4 shadow-lg">
      <h3 className="text-sm uppercase tracking-wide text-gray-400">Quick Actions</h3>

      {actions.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.href}
            onClick={() => router.push(action.href)}
            className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition ${getButtonClasses(
              action.variant
            )}`}
          >
            <Icon />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}
