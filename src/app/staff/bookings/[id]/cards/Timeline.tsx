"use client"

import type { BookingDetailDTO } from "@/types/booking"
import type { BookingEventDTO } from "@/lib/booking/bookingEvents"
import Card from "./Card"

function fmt(iso?: string | null) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return "—"
  }
}

function eventLabel(type: string) {
  switch (type) {
    case "CHECK_IN":
      return "Checked In"
    case "CHECK_OUT":
      return "Checked Out"
    case "ROOM_ASSIGNED":
      return "Room Assigned"
    case "EMAIL_SENT":
      return "Email Sent"
    default:
      return type.replace(/_/g, " ")
  }
}

function eventDetail(e: BookingEventDTO) {
  const md = e.metadata ?? {}

  // show the useful parts only
  const parts: string[] = []
  if (md.roomNumber) parts.push(`Room: ${md.roomNumber}`)
  if (md.roomsIncremented) parts.push(`Rooms +${md.roomsIncremented}`)
  if (md.staffNote) parts.push(md.staffNote)

  return parts.length ? parts.join(" • ") : ""
}

export default function TimelineCard({
  booking,
  events,
}: {
  booking: BookingDetailDTO
  events: BookingEventDTO[]
}) {
  const base = [
    { label: "Created", time: booking.timeline.createdAt },
    { label: "Updated", time: booking.timeline.updatedAt },
    { label: "Ticket Issued", time: booking.timeline.ticketIssuedAt },
    { label: "Email Sent", time: booking.timeline.emailSentAt },
  ]

  return (
    <Card title="Timeline">
      {/* Base lifecycle */}
      <div className="space-y-2">
        {base.map((x) => (
          <div
            key={x.label}
            className="flex items-start justify-between gap-6 py-2 border-b border-[#1f1f1f] last:border-b-0"
          >
            <div className="text-sm text-gray-400">{x.label}</div>
            <div className="text-sm text-white text-right">{fmt(x.time)}</div>
          </div>
        ))}
      </div>

      {/* Event feed */}
      <div className="mt-4 pt-4 border-t border-[#222]">
        <div className="text-sm font-semibold mb-3">Activity</div>

        {events.length === 0 ? (
          <div className="text-sm text-gray-400">No activity recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.id} className="bg-black/40 border border-[#1f1f1f] rounded-lg p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium">{eventLabel(e.type)}</div>
                  <div className="text-xs text-gray-400">{fmt(e.createdAt)}</div>
                </div>

                {eventDetail(e) ? (
                  <div className="text-xs text-gray-300 mt-1">{eventDetail(e)}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}