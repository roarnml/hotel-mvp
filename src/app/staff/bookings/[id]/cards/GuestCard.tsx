"use client"

import type { BookingDetailDTO } from "@/types/booking"
import Card from "./Card"
import Row from "./Row"

export default function GuestCard({ booking }: { booking: BookingDetailDTO }) {
  const g = booking.guest

  return (
    <Card title="Guest">
      <Row label="Full Name" value={g.name} />
      <Row label="Email" value={g.email} />
      <Row label="Phone" value={g.phone ?? "—"} />
      <Row label="Address" value={g.address ?? "—"} />
      <Row label="VIP" value={g.isVIP ? "Yes" : "No"} />
    </Card>
  )
}