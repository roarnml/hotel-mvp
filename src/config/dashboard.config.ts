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

export type Role = "OWNER" | "MANAGER" | "CHECKIN_STAFF" | "STAFF"

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

  CHECKIN_STAFF: {
    brand: {
      name: "Comfort Check-in",
      homeRoute: "/staff",
    },
    navbar: {
      searchPlaceholder: "Search arrivals, guests...",
      profileLabel: "Check-in Staff",
    },
    sidebar: {
      title: "Check-in Panel",
      items: [
        { label: "Dashboard", href: "/staff", icon: FiHome },
        { label: "Bookings", href: "/staff/bookings", icon: FiCalendar },
        { label: "Check-in Guests", href: "/staff/check-in", icon: FiKey },
        { label: "VIP Guests", href: "/staff/vip", icon: FiStar },
      ],
    },
  },

  MANAGER: {
    brand: {
      name: "Comfort Manager",
      homeRoute: "/manager/dashboard",
    },
    navbar: {
      searchPlaceholder: "Search services, suites...",
      profileLabel: "Manager",
    },
    sidebar: {
      title: "Manager Panel",
      items: [
        { label: "Dashboard", href: "/manager/dashboard", icon: FiHome },
        {
          label: "Bookings",
          href: "/manager/bookings",
          icon: FiCalendar,
          children: [
            { label: "Active", href: "/manager/bookings/active" },
            { label: "Pending", href: "/manager/bookings/pending" },
            { label: "Completed", href: "/manager/bookings/completed" },
            { label: "Issues", href: "/manager/bookings/issues" },
          ],
        },
        { label: "Suites", href: "/manager/suites", icon: FiLayers },
        { label: "Revenue", href: "/manager/revenue", icon: FiDollarSign },
        { label: "Users", href: "/manager/users", icon: FiUsers },
      ],
    },
  },

  OWNER: {
    brand: {
      name: "Comfort Owner",
      homeRoute: "/owner/dashboard",
    },
    navbar: {
      searchPlaceholder: "Search everything...",
      profileLabel: "Owner",
    },
    sidebar: {
      title: "System Control",
      items: [
        { label: "Dashboard", href: "/owner/dashboard", icon: FiHome },
        { label: "Bookings", href: "/owner/bookings", icon: FiCalendar },
        { label: "Suites", href: "/owner/suites", icon: FiLayers },
        { label: "Revenue", href: "/owner/revenue", icon: FiDollarSign },
        { label: "Users Management", href: "/owner/users", icon: FiUsers },
        { label: "System Audit", href: "/owner/audit", icon: FiMonitor },
      ],
    },
  },
}
