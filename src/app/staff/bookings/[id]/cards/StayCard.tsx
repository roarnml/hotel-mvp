"use client"

import type { BookingDetailDTO } from "@/types/booking"
import Card from "./Card"
import Row from "./Row"

export default function StayCard({ booking }: { booking: BookingDetailDTO }) {
  const checkIn = new Date(booking.stay.checkIn)
  const checkOut = new Date(booking.stay.checkOut)

  return (
    <Card title="Stay & Room">
      <Row label="Suite" value={booking.suite.name} />
      <Row label="Category" value={booking.suite.category} />
      <Row label="Room Number" value={booking.room.roomNumber ?? "TBA"} />
      <Row label="Capacity" value={booking.suite.capacity ?? "—"} />
      <Row label="Check-in" value={checkIn.toLocaleString()} />
      <Row label="Check-out" value={checkOut.toLocaleString()} />
      <Row label="Nights" value={booking.stay.nights ?? "—"} />
      <Row label="Chalet Count" value={booking.stay.chaletCount ?? "—"} />
    </Card>
  )
}