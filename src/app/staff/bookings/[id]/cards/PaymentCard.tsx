"use client"

import type { BookingDetailDTO } from "@/types/booking"
import Card from "./Card"
import Row from "./Row"

function formatNaira(kobo?: number | null, currency?: string | null) {
  const cur = currency ?? "NGN"
  if (kobo == null) return "—"
  const amount = kobo / 100
  return `${cur} ${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PaymentCard({ booking }: { booking: BookingDetailDTO }) {
  const p = booking.payment

  return (
    <Card title="Payment">
      <Row label="Provider" value={p.provider ?? "—"} />
      <Row label="Reference" value={p.reference ?? "—"} />
      <Row label="Status" value={p.status ?? "—"} />
      <Row label="Expected" value={formatNaira(p.amountExpected, p.currency)} />
      <Row label="Paid" value={formatNaira(p.amountPaid ?? p.amountExpected, p.currency)} />
      <Row label="Paid At" value={p.paidAt ? new Date(p.paidAt).toLocaleString() : "—"} />
    </Card>
  )
}