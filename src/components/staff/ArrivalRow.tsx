"use client"

import { useState, useTransition } from "react"
import type { BookingStatus, PaymentStatus } from "@prisma/client"
import { FiStar, FiLock, FiUnlock } from "react-icons/fi"

/* ================================
   HELPERS
================================ */

function formatBookingStatus(status: BookingStatus) {
  switch (status) {
    case "CHECKED_IN":
      return "Checked in"
    case "CONFIRMED":
      return "Pending"
    case "CHECKED_OUT":
      return "Checked out"
    case "CANCELLED":
      return "Cancelled"
    default:
      return status
  }
}

function bookingStatusStyles(status: BookingStatus) {
  switch (status) {
    case "CHECKED_IN":
      return "bg-green-500/15 text-green-400 border-green-500/30"
    case "CONFIRMED":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
    case "CANCELLED":
      return "bg-red-500/15 text-red-400 border-red-500/30"
    case "CHECKED_OUT":
      return "bg-gray-500/15 text-gray-400 border-gray-500/30"
    default:
      return "bg-gray-500/15 text-gray-400 border-gray-500/30"
  }
}

function paymentStyles(status: PaymentStatus) {
  return status === "PAID"
    ? "bg-green-500/15 text-green-400 border-green-500/30"
    : "bg-red-500/15 text-red-400 border-red-500/30"
}

/* ================================
   PROPS
================================ */

type ArrivalRowProps = {
  bookingId: string
  guest: string
  isVIP?: boolean
  room: string
  roomOccupied: boolean
  checkInTime: string // ISO
  bookingStatus: BookingStatus
  paymentStatus: PaymentStatus
}

/* ================================
   COMPONENT
================================ */

export default function ArrivalRow({
  bookingId,
  guest,
  isVIP,
  room,
  roomOccupied,
  checkInTime,
  bookingStatus,
  paymentStatus,
}: ArrivalRowProps) {
  const [hovered, setHovered] = useState(false)
  const [isPending, startTransition] = useTransition()

  const formattedTime = new Date(checkInTime).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  async function handleCheckIn() {
    startTransition(async () => {
      await fetch("/api/staff/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
    })
  }

  return (
    <tr
      className="relative hover:bg-white/5 transition"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Guest */}
      <td className="py-3 font-medium text-white flex items-center gap-2">
        {guest}
        {isVIP && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            <FiStar /> VIP
          </span>
        )}
      </td>

      {/* Room */}
      <td className="text-gray-400 flex items-center gap-2">
        {room}
        {roomOccupied ? (
          <FiLock className="text-red-400" title="Room occupied" />
        ) : (
          <FiUnlock className="text-green-400" title="Room available" />
        )}
      </td>

      {/* Check-in time */}
      <td className="text-gray-400">{formattedTime}</td>

      {/* Booking status */}
      <td>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${bookingStatusStyles(
            bookingStatus
          )}`}
        >
          {formatBookingStatus(bookingStatus)}
        </span>
      </td>

      {/* Payment status */}
      <td>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${paymentStyles(
            paymentStatus
          )}`}
        >
          {paymentStatus}
        </span>
      </td>

      {/* Actions */}
      <td>
        {bookingStatus === "CONFIRMED" && (
          <button
            onClick={handleCheckIn}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-[#75240E] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            Check-in
          </button>
        )}
      </td>

      {/* Hover drawer */}
      {hovered && (
        <td
          colSpan={6}
          className="absolute left-0 top-full z-20 w-full bg-neutral-900 border border-[#75240E] rounded-xl p-4 mt-2 shadow-xl"
        >
          <div className="text-sm text-white space-y-1">
            <div>
              <strong>Guest:</strong> {guest}
            </div>
            <div>
              <strong>Room:</strong> {room}
            </div>
            <div>
              <strong>Status:</strong> {bookingStatus}
            </div>
            <div>
              <strong>Payment:</strong> {paymentStatus}
            </div>
          </div>
        </td>
      )}
    </tr>
  )
}
