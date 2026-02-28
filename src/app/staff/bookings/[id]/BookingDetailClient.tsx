"use client"

import type { BookingDetailDTO } from "@/types/booking"
import type { BookingEventDTO } from "@/lib/booking/bookingEvents"
import type { Role } from "@/lib/auth"

import BookingHeader from "./cards/Header"
import GuestCard from "./cards/GuestCard"
import StayCard from "./cards/StayCard"
import PaymentCard from "./cards/PaymentCard"
import TimelineCard from "./cards/Timeline"
import ActionsCard from "./cards/ActionsCard"

export default function BookingDetailClient({
  booking,
  events,
  staffRole,
}: {
  booking: BookingDetailDTO
  events: BookingEventDTO[]
  staffRole: Role
}) {
  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <BookingHeader booking={booking} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GuestCard booking={booking} />
          <StayCard booking={booking} />
          <TimelineCard booking={booking} events={events} />
        </div>

        <div className="space-y-6">
          <PaymentCard booking={booking} />
          <ActionsCard booking={booking} staffRole={staffRole} />
        </div>
      </div>
    </div>
  )
}