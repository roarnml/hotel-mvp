/*
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  FiArrowLeft,
  FiUser,
  FiKey,
  FiCalendar,
  FiStar,
  FiCheck,
} from "react-icons/fi"

import {
  checkInGuest,
  checkOutGuest,
  markGuestVIP,
  getBookingById,
  getRoomPoolForSuite,
} from "./actions"

/* ================================
   Schema-aligned types
================================ *

type BookingDetail = {
  id: string
  bookingRef: string
  suiteId: string
  guestId: string | null
  userId: string | null

  name: string
  email: string

  checkIn: string
  checkOut: string

  amountPaid: number | null

  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
  paymentStatus:
    | "PENDING"
    | "PROCESSING"
    | "PAID"
    | "FAILED"
    | "REFUNDED"

  ticketNumber: string | null
  checkInNumber: string | null
  ticketPdfUrl: string | null
  ticketIssuedAt: string | null
  emailSentAt: string | null

  createdAt: string
  updatedAt: string

  suite: {
    id: string
    name: string
    category: "VIP" | "REGULAR"
  }

  guest: {
    id: string
    name: string
    email: string
    isVIP: boolean
  } | null

  roomAssignment: {
    id: string
    roomNumber: string
  } | null
}

type StaffPermissions = {
  canCheckIn: boolean
  canCheckOut: boolean
  canAssignChalet: boolean
}

/* ================================
   UI helpers
================================ *

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/50">
          {label}
        </p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  )
}

/* ================================
   Page
================================ *

export default function BookingDetailPage() {
  const params = useParams()
  const bookingId = params.id as string
  if (!bookingId) throw new Error("Missing booking ID")

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [roomInput, setRoomInput] = useState("")
  const [availableRooms, setAvailableRooms] = useState<string[]>([])

  /* Example: inject from session later *
  const staffPermissions: StaffPermissions = {
    canCheckIn: true,
    canCheckOut: true,
    canAssignChalet: true,
  }

  /* ================================
     Fetch booking
  ================================ *

  useEffect(() => {
    async function loadBooking() {
      setLoading(true)
      try {
        const data = await getBookingById(bookingId)
        if (!data) {
          setBooking(null)
          return
        }

        setBooking({
          ...data,
          checkIn: new Date(data.checkIn).toISOString(),
          checkOut: new Date(data.checkOut).toISOString(),
          ticketIssuedAt: data.ticketIssuedAt
            ? new Date(data.ticketIssuedAt).toISOString()
            : null,
          emailSentAt: data.emailSentAt
            ? new Date(data.emailSentAt).toISOString()
            : null,
          createdAt: new Date(data.createdAt).toISOString(),
          updatedAt: new Date(data.updatedAt).toISOString(),
        })

        setRoomInput(data.roomAssignment?.roomNumber ?? "")
      } catch (err) {
        console.error(err)
        setBooking(null)
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [bookingId])

  useEffect(() => {
    if (!booking?.suite?.id) return

    async function loadRooms() {
      try {
        const rooms = await getRoomPoolForSuite(booking.suite.id)
        setAvailableRooms(rooms)
      } catch (err) {
        console.error("Failed to fetch rooms:", err)
        setAvailableRooms([])
      }
    }

    loadRooms()
  }, [booking?.suite?.id])



  if (loading)
    return <div className="py-10 text-center">Loading booking…</div>

  if (!booking)
    return (
      <div className="py-10 text-center text-red-500">
        Booking not found
      </div>
    )

  /* ================================
     Derived values
  ================================ *

  const guestName = booking.guest?.name ?? booking.name
  const isVIP = booking.guest?.isVIP ?? false
  const roomNumber = booking.roomAssignment?.roomNumber ?? null

  /* ================================
     Render
  ================================ *

  return (
    <div className="min-h-screen space-y-6 bg-black p-4 text-white sm:p-6">
      {/* Top bar *}
      <div className="flex items-center justify-between">
        <Link
          href="/staff/bookings"
          className="inline-flex items-center text-sm font-medium text-[#D55605]"
        >
          <FiArrowLeft className="mr-2 text-[#75240E]" />
          Back to bookings
        </Link>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            booking.status === "CHECKED_IN"
              ? "bg-[#75240E] text-white"
              : booking.status === "CHECKED_OUT"
              ? "bg-neutral-800 text-white/70"
              : "bg-[#D55605] text-black"
          }`}
        >
          {booking.status}
        </span>
      </div>

      {/* Title *}
      <div>
        <h1 className="text-2xl font-semibold">
          Booking #{booking.bookingRef}
        </h1>
        <p className="text-sm text-white/60">
          Full booking record & actions
        </p>
      </div>

      {/* Layout *}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info *}
        <div className="lg:col-span-2 space-y-6 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <InfoRow
            icon={<FiUser className="text-[#75240E]" />}
            label="Guest"
            value={guestName}
          />

          <InfoRow
            icon={<FiKey className="text-[#75240E]" />}
            label="Suite"
            value={`${booking.suite.name} (${booking.suite.category}) ${
              roomNumber ? `(Room ${roomNumber})` : ""
            }`}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              icon={<FiCalendar className="text-[#75240E]" />}
              label="Check-in"
              value={booking.checkIn.split("T")[0]}
            />
            <InfoRow
              icon={<FiCalendar className="text-[#75240E]" />}
              label="Check-out"
              value={booking.checkOut.split("T")[0]}
            />
          </div>

          <div className="flex items-center gap-3">
            <FiStar
              className={`text-xl ${
                isVIP ? "text-[#D55605]" : "text-white/30"
              }`}
            />
            <span className="text-sm">
              {isVIP ? "VIP Guest" : "Standard Guest"}
            </span>
          </div>
        </div>

        {/* Actions /}
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-sm uppercase tracking-wide text-white/80">
            Actions
          </h3>

          {booking.status === "CONFIRMED" &&
            staffPermissions.canAssignChalet && (
              <select
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="w-36 rounded-lg p-1 text-sm text-black"
              >
                <option value="">Select room</option>

                {availableRooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            )}


          {booking.status === "CONFIRMED" &&
            staffPermissions.canCheckIn && (
              <button
                disabled={actionLoading === "checkin"}
                onClick={async () => {
                  setActionLoading("checkin")
                  const updated = await checkInGuest(
                    booking.id,
                    roomInput
                  )
                  setBooking({
                    ...booking,
                    status: "CHECKED_IN",
                    roomAssignment: updated.roomAssignment,
                  })
                  setActionLoading(null)
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#75240E] px-4 py-2 text-sm font-medium"
              >
                <FiCheck /> Check-in Guest
              </button>
            )}

          {booking.status === "CHECKED_IN" &&
            staffPermissions.canCheckOut && (
              <button
                onClick={async () => {
                  setActionLoading("checkout")
                  await checkOutGuest(booking.id)
                  setBooking({
                    ...booking,
                    status: "CHECKED_OUT",
                    roomAssignment: null,
                  })
                  setActionLoading(null)
                }}
                className="w-full rounded-lg border border-neutral-700 px-4 py-2 text-sm"
              >
                Check-out Guest
              </button>
            )}

          {!isVIP && (
            <button
              onClick={async () => {
                await markGuestVIP(booking.id)
                if (booking.guest) {
                  setBooking({
                    ...booking,
                    guest: { ...booking.guest, isVIP: true },
                  })
                }
              }}
              className="w-full rounded-lg bg-[#D55605] px-4 py-2 text-sm font-medium text-black"
            >
              <FiStar /> Mark VIP
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
*/


"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  FiArrowLeft,
  FiUser,
  FiKey,
  FiCalendar,
  FiStar,
  FiCheck,
} from "react-icons/fi"

import {
  checkInGuest,
  checkOutGuest,
  markGuestVIP,
  getBookingById,
  deletePendingBooking,
} from "./actions"

/* ================================
   Schema-aligned types
================================ */

type BookingDetail = {
  id: string
  bookingRef: string
  suiteId: string
  guestId: string | null
  userId: string | null

  name: string
  email: string

  checkIn: string
  checkOut: string

  amountPaid: number | null

  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
  paymentStatus:
    | "PENDING"
    | "PROCESSING"
    | "PAID"
    | "FAILED"
    | "REFUNDED"

  ticketNumber: string | null
  checkInNumber: string | null
  ticketPdfUrl: string | null
  ticketIssuedAt: string | null
  emailSentAt: string | null

  createdAt: string
  updatedAt: string

  suite: {
    id: string
    name: string
    category: "VIP" | "REGULAR"
  }

  guest: {
    id: string
    name: string
    email: string
    isVIP: boolean
  } | null

  roomAssignment: {
    id: string
    roomNumber: string
  } | null
}

type StaffPermissions = {
  canCheckIn: boolean
  canCheckOut: boolean
  canAssignChalet: boolean
}

type StaffRole = "OWNER" | "MANAGER" | "STAFF"

/* ================================
   Helper for info rows
================================ */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  )
}

/* ================================
   Fetch available rooms (client-safe)
================================ */

async function fetchAvailableRooms(suiteId: string | undefined): Promise<string[]> {
  try {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/suites/${suiteId}/available-rooms`
        : `/api/suites/${suiteId}/available-rooms`

    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch rooms")
    const data: string[] = await res.json()
    return data
  } catch (err) {
    console.error("Error fetching rooms:", err)
    return []
  }
}

/* ================================
   Booking Detail Page
================================ */

export default function BookingDetailPage() {
  const params = useParams()
  const bookingId = params.id as string
  if (!bookingId) throw new Error("Missing booking ID")

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [roomInput, setRoomInput] = useState("")
  const [availableRooms, setAvailableRooms] = useState<string[]>([])

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const staffRole: StaffRole = "STAFF" // now TS is happy // replace with session later

  const staffPermissions: StaffPermissions = {
    canCheckIn: true,
    canCheckOut: true,
    canAssignChalet: true,
  }

  /* ================================
     Fetch booking data
  ================================ */
  useEffect(() => {
    async function loadBooking() {
      setLoading(true)
      try {
        const data = await getBookingById(bookingId)
        if (!data) {
          setBooking(null)
          return
        }

        setBooking({
          ...data,
          checkIn: new Date(data.checkIn).toISOString(),
          checkOut: new Date(data.checkOut).toISOString(),
          ticketIssuedAt: data.ticketIssuedAt
            ? new Date(data.ticketIssuedAt).toISOString()
            : null,
          emailSentAt: data.emailSentAt
            ? new Date(data.emailSentAt).toISOString()
            : null,
          createdAt: new Date(data.createdAt).toISOString(),
          updatedAt: new Date(data.updatedAt).toISOString(),
        })

        setRoomInput(data.roomAssignment?.roomNumber ?? "")
      } catch (err) {
        console.error("Failed to fetch booking:", err)
        setBooking(null)
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [bookingId])

  /* ================================
     Fetch available rooms when suite changes
  ================================ */
  useEffect(() => {
    if (!booking?.suite?.id) return

    async function loadRooms() {
      const rooms = await fetchAvailableRooms(booking?.suite?.id)
      setAvailableRooms(rooms)
    }

    loadRooms()
  }, [booking?.suite?.id])

  /* ================================
     Derived values
  ================================ */
  const guestName = booking?.guest?.name ?? booking?.name ?? ""
  const isVIP = booking?.guest?.isVIP ?? false
  const roomNumber = booking?.roomAssignment?.roomNumber ?? null

  if (loading)
    return <div className="py-10 text-center">Loading booking…</div>

  if (!booking)
    return (
      <div className="py-10 text-center text-red-500">
        Booking not found
      </div>
    )

  /* ================================
     Render
  ================================ */
  return (
    <div className="min-h-screen space-y-6 bg-black p-4 text-white sm:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/staff/bookings"
          className="inline-flex items-center text-sm font-medium text-[#D55605]"
        >
          <FiArrowLeft className="mr-2 text-[#75240E]}" />
          Back to bookings
        </Link>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            booking.status === "CHECKED_IN"
              ? "bg-[#75240E] text-white"
              : booking.status === "CHECKED_OUT"
              ? "bg-neutral-800 text-white/70"
              : "bg-[#D55605] text-black"
          }`}
        >
          {booking.status}
        </span>
      </div>

      {/* Booking info */}
      <div>
        <h1 className="text-2xl font-semibold">Booking #{booking.bookingRef}</h1>
        <p className="text-sm text-white/60">Full booking record & actions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Info */}
        <div className="lg:col-span-2 space-y-6 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <InfoRow icon={<FiUser className="text-[#75240E]" />} label="Guest" value={guestName} />
          <InfoRow
            icon={<FiKey className="text-[#75240E]" />}
            label="Suite"
            value={`${booking.suite.name} (${booking.suite.category}) ${
              roomNumber ? `(Room ${roomNumber})` : ""
            }`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={<FiCalendar className="text-[#75240E]" />} label="Check-in" value={booking.checkIn.split("T")[0]} />
            <InfoRow icon={<FiCalendar className="text-[#75240E]" />} label="Check-out" value={booking.checkOut.split("T")[0]} />
          </div>
          <div className="flex items-center gap-3">
            <FiStar className={`text-xl ${isVIP ? "text-[#D55605]" : "text-white/30"}`} />
            <span className="text-sm">{isVIP ? "VIP Guest" : "Standard Guest"}</span>
          </div>
        </div>

        {/* Right — Actions */}
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-sm uppercase tracking-wide text-white/80">Actions</h3>

          {booking.status === "CONFIRMED" && staffPermissions.canAssignChalet && (
            <select
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              className="w-36 rounded-lg p-1 text-sm text-black"
            >
              <option value="">Select room</option>
              {availableRooms.map((room) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          )}

          {booking.status === "CONFIRMED" && staffPermissions.canCheckIn && (
            <button
              disabled={actionLoading === "checkin"}
              onClick={async () => {
                setActionLoading("checkin")
                try {
                  const updated = await checkInGuest(booking.id, roomInput)
                  setBooking({ ...booking, status: "CHECKED_IN", roomAssignment: booking.roomAssignment })
                } catch (err) {
                  console.error("Check-in failed:", err)
                  alert("Failed to check in guest.")
                } finally {
                  setActionLoading(null)
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#75240E] px-4 py-2 text-sm font-medium"
            >
              <FiCheck /> {actionLoading === "checkin" ? "Checking in..." : "Check-in Guest"}
            </button>
          )}

          {booking.status === "CHECKED_IN" && staffPermissions.canCheckOut && (
            <button
              onClick={async () => {
                setActionLoading("checkout")
                await checkOutGuest(booking.id)
                setBooking({ ...booking, status: "CHECKED_OUT", roomAssignment: null })
                setActionLoading(null)
              }}
              className="w-full rounded-lg border border-neutral-700 px-4 py-2 text-sm"
            >
              Check-out Guest
            </button>
          )}

          {!isVIP && (
            <button
              onClick={async () => {
                await markGuestVIP(booking.id)
                if (booking.guest) setBooking({ ...booking, guest: { ...booking.guest, isVIP: true } })
              }}
              className="w-full rounded-lg bg-[#D55605] px-4 py-2 text-sm font-medium text-black"
            >
              <FiStar /> Mark VIP
            </button>
          )}
          {booking.status === "PENDING" &&
            booking.paymentStatus === "PENDING" && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Delete Pending Booking
              </button>
            )}

        </div>
        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-sm space-y-4 rounded-xl bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white">
                Confirm Delete
              </h3>

              {staffRole === "STAFF" && (
                <input
                  type="password"
                  placeholder="Admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-lg p-2 text-sm text-black"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 rounded-lg border border-neutral-700 px-4 py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  disabled={deleteLoading}
                  onClick={async () => {
                    setDeleteLoading(true)
                    try {
                      await deletePendingBooking({
                        bookingId: booking.id,
                        adminPassword,
                        staffRole,
                      })
                      window.location.href = "/staff/bookings"
                    } catch (err: any) {
                      alert(err.message || "Delete failed")
                    } finally {
                      setDeleteLoading(false)
                    }
                  }}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                >
                  {deleteLoading ? "Deleting…" : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
