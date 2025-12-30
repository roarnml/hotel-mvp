"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import BookingTimeline from "@/components/admin/BookingTimeline"
import {
  FiArrowLeft,
  FiUser,
  FiKey,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi"

interface BookingAdminDetail {
  id: string
  guestName: string
  email: string
  phone: string
  suite: string
  roomNumber?: string
  checkIn: string
  checkOut: string
  status: "Pending" | "Checked-in" | "Checked-out" | "Cancelled"
  vip: boolean
  amountPaid: number
  paymentStatus: "Paid" | "Pending" | "Refunded"
  createdAt: string
}

export default function AdminBookingDetailPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState<BookingAdminDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true)

      // TEMP — replace with real API
      const data: BookingAdminDetail = {
        id: id as string,
        guestName: "Alice Johnson",
        email: "alice@example.com",
        phone: "+1 202 555 0193",
        suite: "Presidential Suite",
        roomNumber: "402",
        checkIn: "2025-12-15",
        checkOut: "2025-12-20",
        status: "Checked-in",
        vip: true,
        amountPaid: 4200,
        paymentStatus: "Paid",
        createdAt: "2025-11-28 09:34",
      }

      setBooking(data)
      setLoading(false)
    }

    fetchBooking()
  }, [id])

  if (loading) return <div>Loading booking…</div>
  if (!booking) return <div>Booking not found</div>

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/bookings"
        className="inline-flex items-center text-sm text-blue-600 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Bookings
      </Link>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Booking #{booking.id}
          </h1>
          <p className="text-sm text-gray-500">
            Created {booking.createdAt}
          </p>
        </div>

        <StatusBadge status={booking.status} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Guest & Stay */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-5">
          <Section title="Guest Information" icon={<FiUser />}>
            <InfoRow label="Name" value={booking.guestName} />
            <InfoRow label="Email" value={booking.email} />
            <InfoRow label="Phone" value={booking.phone} />
            <InfoRow label="VIP" value={booking.vip ? "Yes" : "No"} />
          </Section>

          <Section title="Stay Details" icon={<FiCalendar />}>
            <InfoRow label="Suite" value={booking.suite} />
            <InfoRow label="Room" value={booking.roomNumber ?? "—"} />
            <InfoRow label="Check-In" value={booking.checkIn} />
            <InfoRow label="Check-Out" value={booking.checkOut} />
          </Section>

          <Section title="Payment" icon={<FiDollarSign />}>
            <InfoRow
              label="Amount Paid"
              value={`$${booking.amountPaid.toLocaleString()}`}
            />
            <InfoRow label="Payment Status" value={booking.paymentStatus} />
          </Section>
          <BookingTimeline
            events={[
                {
                label: "Booking created",
                time: "Nov 28, 2025 · 09:34",
                status: "CREATED",
                },
                {
                label: "Payment confirmed",
                time: "Nov 28, 2025 · 09:36",
                status: "PAID",
                },
                {
                label: "Guest checked in",
                time: "Dec 15, 2025 · 14:02",
                status: "CHECKED_IN",
                },
            ]}
            />

        </div>

        {/* Right: Admin Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Admin Actions
          </h2>

          {booking.status === "Pending" && (
            <ActionButton variant="success">
              Force Confirm Booking
            </ActionButton>
          )}

          {booking.status === "Checked-in" && (
            <ActionButton variant="warning">
              Report Issue
            </ActionButton>
          )}

          <ActionButton variant="outline">
            Add Internal Note
          </ActionButton>

          <ActionButton variant="danger">
            Flag for Review
          </ActionButton>

          <div className="pt-4 border-t text-xs text-gray-500 flex items-center gap-2">
            <FiAlertCircle />
            Actions are logged for audit
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- UI Helpers ---------- */

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-gray-900 font-medium">
        {icon}
        {title}
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    "Checked-in": "bg-green-100 text-green-700",
    "Checked-out": "bg-gray-100 text-gray-700",
    Cancelled: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  )
}

function ActionButton({
  children,
  variant = "outline",
}: {
  children: React.ReactNode
  variant?: "success" | "warning" | "danger" | "outline"
}) {
  const styles: Record<string, string> = {
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50",
  }

  return (
    <button
      className={`w-full py-2 rounded-lg text-sm font-medium ${styles[variant]}`}
    >
      {children}
    </button>
  )
}
