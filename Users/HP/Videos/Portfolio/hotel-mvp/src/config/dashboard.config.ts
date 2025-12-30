import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiLayers,
  FiKey,
  FiCoffee,
  FiStar,
  FiMonitor
} from "react-icons/fi"
import { IconType } from "react-icons"

export type Role = "SUPER_USER" | "ADMIN" | "STAFF"

export interface SidebarItem {
  label: string
  href?: string
  icon?: IconType
  children?: SidebarItem[]
}

export const dashboardConfig: Record<
  Role,
  {
    brand: {
      name: string
      homeRoute: string
    }
    navbar: {
      searchPlaceholder: string
      profileLabel: string
    }
    sidebar: {
      title: string
      items: {
        label: string
        href: string
        icon?: any
        children?: SidebarItem[]
      }[]
    }
  }
> = {
  STAFF: {
    brand: {
      name: "Comfort Staff",
      homeRoute: "/staff",
    },
    navbar: {
      searchPlaceholder: "Search bookings, guests...",
      profileLabel: "Staff",
    },
    sidebar: {
      title: "Staff Panel",
      items: [
        { label: "Dashboard", href: "/staff", icon: FiHome },
        { label: "Bookings", href: "/staff/bookings", icon: FiCalendar },
        { label: "Arrivals", href: "/staff/arrivals", icon: FiUsers },
        { label: "Check-in", href: "/staff/check-in", icon: FiKey },
        { label: "Housekeeping", href: "/staff/housekeeping", icon: FiCoffee },
        { label: "VIP Guests", href: "/staff/vip", icon: FiStar },
      ],
    },
  },

  ADMIN: {
    brand: {
      name: "Comfort Admin",
      homeRoute: "/admin/dashboard",
    },
    navbar: {
      searchPlaceholder: "Search services, suites...",
      profileLabel: "Admin",
    },
    sidebar: {
      title: "Admin Panel",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: FiHome },
        {
          label: "Bookings",
          href: "/admin/bookings",
          icon: FiCalendar,
          children: [
            { label: "Active", href: "/admin/bookings/active" },
            { label: "Pending", href: "/admin/bookings/pending" },
            { label: "Completed", href: "/admin/bookings/completed" },
            { label: "Issues", href: "/admin/bookings/issues" },
          ],
        },

        { label: "Suites", href: "/admin/suites", icon: FiLayers },
        { label: "Revenue", href: "/admin/revenue", icon: FiDollarSign },
        { label: "Users", href: "/admin/users", icon: FiUsers },
      ],
    },
  },

  SUPER_USER: {
    brand: {
      name: "Confort Control",
      homeRoute: "/super/dashboard",
    },
    navbar: {
      searchPlaceholder: "Search everything...",
      profileLabel: "Super User",
    },
    sidebar: {
      title: "System Control",
      items: [
        { label: "Dashboard", href: "/super/dashboard", icon: FiHome },
        { label: "Bookings", href: "/super/bookings", icon: FiCalendar },
        { label: "Suites", href: "/super/suites", icon: FiLayers },
        { label: "Revenue", href: "/super/revenue", icon: FiDollarSign },
        { label: "Users Management", href: "/super/users", icon: FiUsers },
        { label: "System Audit", href: "/super/audit", icon: FiMonitor },
      ],
    },
  },
}
