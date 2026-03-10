"use client"

import Link from "next/link"
import { useState } from "react"
import { dashboardConfig, Role, SidebarItem } from "@/config/dashboard.config"
import { FiChevronDown } from "react-icons/fi"
import { usePathname } from "next/navigation"

/* Brand tokens */
const COLORS = {
  bg: "#000000",
  primary: "#D55605",
  accent: "#75240E",
  text: "#FFFFFF",
  muted: "#9CA3AF",
}

interface SidebarProps {
  role: Role
}

export default function Sidebar({ role }: SidebarProps) {
  const config = dashboardConfig[role]
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const toggleSection = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }))

  return (
    <aside
      className="w-64 min-h-screen p-4 flex flex-col border-r"
      style={{
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        borderColor: "#111",
      }}
    >
      {/* Title */}
      <h2
        className="text-xl font-bold mb-6 tracking-wide"
        style={{ color: COLORS.primary }}
      >
        {config.sidebar.title}
      </h2>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 text-sm">
        {config.sidebar.items.map((item) => {
          const Icon = item.icon
          const isOpen = openSections[item.label]
          const isActive = item.href && pathname === item.href

          if (item.children && item.children.length > 0) {
            return (
              <div key={item.label} className="flex flex-col">
                <button
                  onClick={() => toggleSection(item.label)}
                  className="flex items-center justify-between p-2 rounded-md transition"
                  style={{
                    backgroundColor: isOpen ? "#111" : "transparent",
                  }}
                >
                  <span className="flex items-center gap-3">
                    {Icon && <Icon size={18} color={COLORS.accent} />}
                    <span>{item.label}</span>
                  </span>

                  <FiChevronDown
                    size={16}
                    className="transition-transform"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      color: COLORS.muted,
                    }}
                  />
                </button>

                {isOpen && (
                  <div className="ml-6 mt-1 flex flex-col gap-1">
                    {item.children.map((child: SidebarItem) => {
                      const childActive = pathname === child.href

                      return (
                        <Link
                          key={child.href}
                          href={child.href!}
                          className="p-2 rounded-md text-sm transition"
                          style={{
                            backgroundColor: childActive
                              ? COLORS.accent
                              : "transparent",
                            color: childActive
                              ? COLORS.text
                              : COLORS.muted,
                          }}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className="flex items-center gap-3 p-2 rounded-md transition"
              style={{
                backgroundColor: isActive ? COLORS.accent : "transparent",
                color: isActive ? COLORS.text : COLORS.muted,
              }}
            >
              {Icon && <Icon size={18} color={COLORS.accent} />}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
