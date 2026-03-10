"use client"

import { useState } from "react"

export function BookingCard({
  booking,
  canCheckIn,
  canCheckOut,
}: any) {
  const [roomNumber, setRoomNumber] = useState("")

  async function handleCheckIn() {
    await fetch("/api/staff/bookings/checkin", {
      method: "POST",
      body: JSON.stringify({
        bookingId: booking.id,
        roomNumber,
      }),
    })
    location.reload()
  }

  async function handleCheckOut() {
    await fetch("/api/staff/bookings/checkout", {
      method: "POST",
      body: JSON.stringify({ bookingId: booking.id }),
    })
    location.reload()
  }

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between">
        <div>
          <p className="font-medium">{booking.name}</p>
          <p className="text-sm text-muted-foreground">
            {booking.suite.name}
          </p>
        </div>

        <span className="text-xs">
          Payment: {booking.payment?.status}
        </span>
      </div>

      {booking.roomAssignment && (
        <p className="text-sm">
          Room: {booking.roomAssignment.roomNumber}
        </p>
      )}

      {canCheckIn && !booking.roomAssignment && (
        <div className="flex gap-2">
          <input
            placeholder="Room No"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="border px-2 py-1 text-sm"
          />
          <button onClick={handleCheckIn}>
            Check In
          </button>
        </div>
      )}

      {canCheckOut && booking.status === "CHECKED_IN" && (
        <button onClick={handleCheckOut}>
          Check Out
        </button>
      )}
    </div>
  )
}
