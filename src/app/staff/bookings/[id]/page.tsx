"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FiArrowLeft, FiUser, FiKey, FiCalendar, FiStar, FiCheck } from "react-icons/fi"
import Link from "next/link"
import { checkInGuest, checkOutGuest, markGuestVIP, getBookingById } from "./actions"

interface BookingDetail {
  id: string
  guestName: string
  suite: string
  checkIn: string
  checkOut: string
  status: "PENDING" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "CONFIRMED"
  vip: boolean
  roomNumber: string | null
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs text-white/50 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  )
}

export default function BookingDetailPage() {
  const params = useParams()
  const bookingId = params.id as string
  if (!bookingId) throw new Error("Booking ID missing in URL")

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [roomInput, setRoomInput] = useState<string>("")

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true)
      try {
        const data = await getBookingById(bookingId)
        if (!data) {
          setBooking(null)
          return
        }

        setBooking({
          id: data.id,
          guestName: data.guest?.name ?? data.name,
          suite: data.suite.name,
          checkIn: new Date(data.checkIn).toISOString().split("T")[0],
          checkOut: new Date(data.checkOut).toISOString().split("T")[0],
          status: data.status,
          vip: data.guest?.isVIP ?? false,
          roomNumber: data.suite.roomNumber ?? null,
        })

        setRoomInput(data.suite.roomNumber ?? "")
      } catch (err) {
        console.error("Failed to fetch booking:", err)
        setBooking(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) return <div className="text-center py-10">Loading booking...</div>
  if (!booking) return <div className="text-center py-10 text-red-500">Booking not found</div>

  return (
    <div className="space-y-6 bg-black text-white min-h-screen p-4 sm:p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/staff/bookings"
          className="inline-flex items-center text-sm font-medium text-[#D55605] hover:opacity-80 transition"
        >
          <FiArrowLeft className="mr-2 text-[#75240E]" />
          Back to Bookings
        </Link>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
            ${
              booking.status === "CHECKED_IN"
                ? "bg-[#75240E] text-white"
                : booking.status === "CHECKED_OUT"
                ? "bg-neutral-800 text-white/70"
                : "bg-[#D55605] text-black"
            }
          `}
        >
          {booking.status}
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Booking #{booking.id.slice(0, 8)}</h1>
        <p className="text-sm text-white/60">Detailed booking overview and actions</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Booking Info */}
        <div className="lg:col-span-2 bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-6">
          <InfoRow icon={<FiUser className="text-[#75240E]" />} label="Guest" value={booking.guestName} />
          <InfoRow
            icon={<FiKey className="text-[#75240E]" />}
            label="Suite"
            value={`${booking.suite} ${booking.roomNumber ? `(Room ${roomInput})` : ""}`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={<FiCalendar className="text-[#75240E]" />} label="Check-In" value={booking.checkIn} />
            <InfoRow icon={<FiCalendar className="text-[#75240E]" />} label="Check-Out" value={booking.checkOut} />
          </div>

          {/* VIP */}
          <div className="flex items-center gap-3">
            <FiStar className={`text-xl ${booking.vip ? "text-[#D55605]" : "text-white/30"}`} />
            <span className="text-sm font-medium text-white/60">VIP Status:</span>
            <span className={`text-sm font-semibold ${booking.vip ? "text-[#D55605]" : "text-white/50"}`}>
              {booking.vip ? "VIP Guest" : "Standard Guest"}
            </span>
          </div>
        </div>

        {/* RIGHT — Actions */}
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Actions</h3>

          {/* Room input for manual assignment */}
          {booking.status === "CONFIRMED" && (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Room # (optional)"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="rounded-lg p-1 text-black text-sm w-24"
              />
            </div>
          )}

          {/* Check-in Button */}
          {booking.status === "CONFIRMED" && (
            <button
              disabled={actionLoading === "checkin"}
              onClick={async () => {
                setActionLoading("checkin")
                try {
                  const updated = await checkInGuest(booking.id)
                  setBooking({
                    ...booking,
                    status: "CHECKED_IN",
                    roomNumber: updated.suite.roomNumber,
                  })
                } catch (err) {
                  console.error("Check-in failed:", err)
                  alert("Failed to check in. Make sure room is available.")
                } finally {
                  setActionLoading(null)
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#75240E] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
            >
              <FiCheck />
              {actionLoading === "checkin" ? "Checking in..." : "Check-in Guest"}
            </button>
          )}

          {/* Mark VIP */}
          {!booking.vip && (
            <button
              disabled={actionLoading === "vip"}
              onClick={async () => {
                setActionLoading("vip")
                try {
                  await markGuestVIP(booking.id)
                  setBooking({ ...booking, vip: true })
                } catch (err) {
                  console.error("VIP update failed:", err)
                } finally {
                  setActionLoading(null)
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#D55605] px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50 transition"
            >
              <FiStar />
              {actionLoading === "vip" ? "Updating..." : "Mark as VIP"}
            </button>
          )}

          {/* Check-out Button */}
          {booking.status === "CHECKED_IN" && (
            <button
              disabled={actionLoading === "checkout"}
              onClick={async () => {
                setActionLoading("checkout")
                try {
                  await checkOutGuest(booking.id)
                  setBooking({ ...booking, status: "CHECKED_OUT" })
                } catch (err) {
                  console.error("Check-out failed:", err)
                } finally {
                  setActionLoading(null)
                }
              }}
              className="w-full rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition"
            >
              {actionLoading === "checkout" ? "Checking out..." : "Check-out Guest"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
