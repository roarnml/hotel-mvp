"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FiSearch, FiBell, FiUser } from "react-icons/fi"
import { dashboardConfig, Role } from "@/config/dashboard.config"

interface NavbarProps {
  role: Role
  user: { name: string }
}

/* Brand tokens */
const COLORS = {
  bg: "#000000",
  primary: "#D55605",
  accent: "#75240E",
  text: "#FFFFFF",
}

type Notification = {
  id: string
  message: string
  tag: "INFO" | "SUCCESS" | "CRITICAL"
  color: "green" | "orange" | "red"
  createdAt: string
}

export default function Navbar({ role, user }: NavbarProps) {
  const config = dashboardConfig[role]
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  //const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifications, setNotifications] = useState<Array<Notification>>([])


  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(console.error)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-lg"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      {/* Brand */}
      <Link
        href={config.brand.homeRoute}
        className="text-2xl font-bold tracking-wide"
        style={{ color: COLORS.primary }}
      >
        {config.brand.name}
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: COLORS.accent }}
          />
          <input
            type="text"
            placeholder={config.navbar.searchPlaceholder}
            className="w-full rounded-md pl-10 pr-4 py-2 focus:outline-none"
            style={{
              backgroundColor: "#111",
              color: COLORS.text,
              border: `1px solid ${COLORS.accent}`,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-full hover:opacity-80 transition"
            style={{ color: COLORS.accent }}
          >
            <FiBell size={22} />
            {notifications.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                style={{ backgroundColor: COLORS.primary, color: COLORS.text }}
              >
                {notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 mt-3 w-80 rounded-lg shadow-xl overflow-hidden"
              style={{ backgroundColor: "#111" }}
            >
              <div className="px-4 py-2 text-sm font-semibold border-b border-gray-700">
                Notifications
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-400">
                  No new alerts
                </div>
              ) : (
                notifications.map((n: Notification) => (
                  <div
                    key={n.id}
                    className="px-4 py-3 text-sm flex justify-between items-center cursor-pointer hover:bg-black transition"
                  >
                    <span>{n.message}</span>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{
                        backgroundColor:
                          n.color === "green"
                            ? "#0f5132"
                            : n.color === "red"
                            ? "#842029"
                            : "#664d03",
                        color: "#fff",
                      }}
                    >
                      {n.tag}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:opacity-80 transition"
            style={{ backgroundColor: COLORS.accent }}
          >
            <FiUser size={18} />
            <span className="hidden md:block font-medium">
              {user.name}
            </span>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-3 w-44 rounded-lg shadow-xl overflow-hidden"
              style={{ backgroundColor: "#111" }}
            >
              <Link
                href={`/${role.toLowerCase()}/profile`}
                className="block px-4 py-2 text-sm hover:bg-black"
              >
                Profile
              </Link>
              <Link
                href={`/${role.toLowerCase()}/settings`}
                className="block px-4 py-2 text-sm hover:bg-black"
              >
                Settings
              </Link>
              <Link
                href="/api/auth/signout"
                className="block px-4 py-2 text-sm text-red-400 hover:bg-black"
              >
                Sign Out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
