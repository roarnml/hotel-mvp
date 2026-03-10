/*

"use client"

import { useEffect, useState, useTransition } from "react"
import type { BookingDetailDTO } from "@/types/booking"
import type { Role } from "@/lib/auth"
import Card from "./Card"
import Row from "./Row"
import { checkInGuest, checkOutGuest, getRoomOptionsForBooking } from "../actions"

export default function ActionsCard({
  booking,
  staffRole,
}: {
  booking: BookingDetailDTO
  staffRole: Role
}) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [rooms, setRooms] = useState<string[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>("")

  // ✅ check-in staff only
  const canUseActions = staffRole === "CHECKIN_STAFF" || staffRole === "STAFF"

  const canCheckIn =
    canUseActions &&
    booking.status === "CONFIRMED" &&
    booking.paymentStatus === "PAID" &&
    !booking.room.roomNumber

  const canCheckOut =
    canUseActions &&
    booking.status === "CHECKED_IN"

  useEffect(() => {
    if (!canCheckIn) return
    ;(async () => {
      const list = await getRoomOptionsForBooking(booking.id)
      setRooms(list)
      setSelectedRoom(list[0] ?? "")
    })()
  }, [booking.id, canCheckIn])

  const doCheckIn = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        await checkInGuest(booking.id, selectedRoom || undefined)
        setMessage("✅ Guest checked in successfully.")
      } catch (e: any) {
        setMessage(`❌ ${e?.message ?? "Check-in failed"}`)
      }
    })
  }

  const doCheckOut = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        await checkOutGuest(booking.id)
        setMessage("✅ Guest checked out successfully.")
      } catch (e: any) {
        setMessage(`❌ ${e?.message ?? "Check-out failed"}`)
      }
    })
  }

  return (
    <Card title="Actions">
      <div className="text-xs text-gray-500 mb-2">Role: {String(staffRole)}</div>
      {!canUseActions ? (
        <div className="text-sm text-gray-400">No actions available for your role.</div>
      ) : (
        <>
          {message ? <div className="text-sm mb-3">{message}</div> : null}

          <Row
            label="Check-in"
            value={
              canCheckIn ? (
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="bg-black border border-[#333] rounded px-2 py-1 text-sm"
                  >
                    {rooms.length ? (
                      rooms.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))
                    ) : (
                      <option value="">No rooms available</option>
                    )}
                  </select>

                  <button
                    disabled={!rooms.length || isPending}
                    onClick={doCheckIn}
                    className="px-3 py-1.5 rounded bg-[#75240E] hover:bg-[#D55605] disabled:opacity-50 text-sm"
                  >
                    {isPending ? "Working..." : "Check In"}
                  </button>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">Not available</span>
              )
            }
          />

          <Row
            label="Check-out"
            value={
              <button
                disabled={!canCheckOut || isPending}
                onClick={doCheckOut}
                className="px-3 py-1.5 rounded border border-[#333] hover:bg-[#111] disabled:opacity-50 text-sm"
              >
                {isPending ? "Working..." : "Check Out"}
              </button>
            }
          />
        </>
      )}
    </Card>
  )
}*/


"use client"

import { useEffect, useState, useTransition } from "react"
import type { BookingDetailDTO } from "@/types/booking"
import type { Role } from "@/lib/auth"
import Card from "./Card"
import Row from "./Row"
import { checkInGuest, checkOutGuest, getRoomOptionsForBooking } from "../actions"

export default function ActionsCard({
  booking,
  staffRole,
}: {
  booking: BookingDetailDTO
  staffRole: Role
}) {

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const [rooms, setRooms] = useState<string[]>([])
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])

  // number of chalets booked
  const chaletCount = booking.stay.chaletCount ?? 1

  const canUseActions =
    staffRole === "CHECKIN_STAFF" || staffRole === "STAFF"

  const canCheckIn =
    canUseActions &&
    booking.status === "CONFIRMED" &&
    booking.paymentStatus === "PAID"

  const canCheckOut =
    canUseActions &&
    booking.status === "CHECKED_IN"

  useEffect(() => {
    if (!canCheckIn) return

    ;(async () => {
      const list = await getRoomOptionsForBooking(booking.id)
      setRooms(list)
    })()

  }, [booking.id, canCheckIn])

  const toggleRoom = (room: string) => {
    setSelectedRooms((prev) => {

      if (prev.includes(room)) {
        return prev.filter((r) => r !== room)
      }

      if (prev.length >= chaletCount) {
        return prev
      }

      return [...prev, room]
    })
  }

  const doCheckIn = () => {
    setMessage(null)

    startTransition(async () => {
      try {

        if (selectedRooms.length !== chaletCount) {
          throw new Error(
            `Select ${chaletCount} chalet(s) before check-in`
          )
        }

        await checkInGuest(booking.id, selectedRooms)

        setMessage("✅ Guest checked in successfully.")

      } catch (e: any) {
        setMessage(`❌ ${e?.message ?? "Check-in failed"}`)
      }
    })
  }

  const doCheckOut = () => {
    setMessage(null)

    startTransition(async () => {
      try {

        await checkOutGuest(booking.id)

        setMessage("✅ Guest checked out successfully.")

      } catch (e: any) {
        setMessage(`❌ ${e?.message ?? "Check-out failed"}`)
      }
    })
  }

  return (
    <Card title="Actions">

      <div className="text-xs text-gray-500 mb-2">
        Role: {String(staffRole)}
      </div>

      {!canUseActions ? (
        <div className="text-sm text-gray-400">
          No actions available for your role.
        </div>
      ) : (
        <>
          {message ? (
            <div className="text-sm mb-3">{message}</div>
          ) : null}

          <Row
            label="Check-in"
            value={
              canCheckIn ? (
                <div className="flex flex-col items-end gap-2">

                  <div className="text-xs text-gray-400">
                    Chalets booked: {chaletCount}
                  </div>

                  <div className="max-h-40 overflow-auto border border-[#333] rounded p-2 w-48">

                    {rooms.length ? (
                      rooms.map((room) => (

                        <label
                          key={room}
                          className="flex items-center gap-2 text-sm mb-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRooms.includes(room)}
                            onChange={() => toggleRoom(room)}
                            disabled={
                              !selectedRooms.includes(room) &&
                              selectedRooms.length >= chaletCount
                            }
                          />

                          {room}

                        </label>

                      ))
                    ) : (
                      <div className="text-xs text-gray-400">
                        No chalets available
                      </div>
                    )}

                  </div>

                  <div className="text-xs text-gray-500">
                    Selected: {selectedRooms.length} / {chaletCount}
                  </div>

                  <button
                    disabled={
                      selectedRooms.length !== chaletCount || isPending
                    }
                    onClick={doCheckIn}
                    className="px-3 py-1.5 rounded bg-[#75240E] hover:bg-[#D55605] disabled:opacity-50 text-sm"
                  >
                    {isPending ? "Working..." : "Check In"}
                  </button>

                </div>
              ) : (
                <span className="text-gray-400 text-sm">
                  Not available
                </span>
              )
            }
          />

          <Row
            label="Check-out"
            value={
              <button
                disabled={!canCheckOut || isPending}
                onClick={doCheckOut}
                className="px-3 py-1.5 rounded border border-[#333] hover:bg-[#111] disabled:opacity-50 text-sm"
              >
                {isPending ? "Working..." : "Check Out"}
              </button>
            }
          />

        </>
      )}
    </Card>
  )
}