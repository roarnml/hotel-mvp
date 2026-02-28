"use client"

import type { BookingDetailDTO } from "@/types/booking"
import StatusPill from "./StatusPill"

export default function BookingHeader({ booking }: { booking: BookingDetailDTO }) {
  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-sm text-gray-400">Booking Ref</div>
          <div className="text-2xl font-bold">{booking.bookingRef}</div>
          <div className="mt-2 text-sm text-gray-400">
            Ticket: <span className="text-white">{booking.ticketNumber ?? "TBA"}</span>
            {booking.checkInNumber ? (
              <>
                {" "}• Check-in#: <span className="text-white">{booking.checkInNumber}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <StatusPill value={booking.status} />
          <StatusPill value={booking.paymentStatus} />
        </div>
      </div>
    </div>
  )
}