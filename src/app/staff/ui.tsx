// src/app/staff/ui.tsx

"use client" // only needed if you want client interactivity, otherwise can omit

import React from "react"

/* --- Metric Card Component --- */
export function MetricCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  )
}

/* --- Arrival Row Component --- */
export function ArrivalRow({
  guest,
  room,
  time,
  status,
}: {
  guest: string
  room: string
  time: string
  status: string
}) {
  return (
    <tr>
      <td className="py-3">{guest}</td>
      <td>{room}</td>
      <td>{new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "CHECKED_IN" || status === "Checked in"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </td>
    </tr>
  )
}
