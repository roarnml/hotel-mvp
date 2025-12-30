"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FiSearch, FiFilter } from "react-icons/fi"

interface AdminBooking {
  id: string
  guestName: string
  suite: string
  checkIn: string
  checkOut: string
  amount: number
  source: "Website" | "Agent" | "Walk-in"
  status: "Pending" | "Confirmed" | "Checked-in" | "Checked-out"
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true)

      // TEMP mock data – replace with real API
      setBookings([
        {
          id: "BKG-2201",
          guestName: "Liam Chen",
          suite: "Presidential Suite",
          checkIn: "2025-12-18",
          checkOut: "2025-12-23",
          amount: 12000,
          source: "Website",
          status: "Confirmed",
        },
        {
          id: "BKG-2202",
          guestName: "Aisha Bello",
          suite: "Executive Suite",
          checkIn: "2025-12-16",
          checkOut: "2025-12-19",
          amount: 4800,
          source: "Agent",
          status: "Pending",
        },
      ])

      setLoading(false)
    }

    fetchBookings()
  }, [])

  const filtered = bookings.filter(
    (b) =>
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.suite.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bookings
          </h1>
          <p className="text-sm text-gray-500">
            Full booking lifecycle & revenue visibility
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest, booking ID, suite..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
          <FiFilter />
          Filters
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading bookings...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-4">Booking ID</th>
                <th>Guest</th>
                <th>Suite</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Amount</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-gray-500"
                  >
                    No bookings found
                  </td>
                </tr>
              )}

              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium text-blue-600">
                    <Link href={`/admin/bookings/${b.id}`}>
                      {b.id}
                    </Link>
                  </td>
                  <td>{b.guestName}</td>
                  <td>{b.suite}</td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td className="font-medium">
                    ${b.amount.toLocaleString()}
                  </td>
                  <td>{b.source}</td>
                  <td>
                    <StatusPill status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* --- Components --- */

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-blue-100 text-blue-700",
    "Checked-in": "bg-green-100 text-green-700",
    "Checked-out": "bg-gray-100 text-gray-700",
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        map[status]
      }`}
    >
      {status}
    </span>
  )
}
