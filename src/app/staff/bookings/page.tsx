"use client"

import { useEffect, useState } from "react"
import { FiSearch } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { getBookings } from "@/app/staff/actions/booking"

interface Booking {
  id: string
  bookingRef: string
  guestName: string
  guestEmail: string
  suiteName: string
  suiteCategory: string
  roomNumber?: string | null
  checkIn: string
  checkOut: string
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
  paymentStatus: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED"
  vip: boolean
  createdAt: string
}

export default function StaffBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()

  const fetchBookings = async (query?: string) => {
    setLoading(true)
    try {
      const data = await getBookings(query)
      setBookings(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return (
    <div className="space-y-6 p-6 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings Control</h1>
      </div>

      {/* Search */}
      <div className="bg-neutral-900 rounded-xl border border-[#75240E] p-4">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75240E]" />
          <input
            type="text"
            placeholder="Search guest, suite, status…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              fetchBookings(e.target.value)
            }}
            className="w-full rounded-lg border border-[#75240E] bg-black pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-xl border border-[#75240E] overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-400">Loading bookings…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1a1a1a] sticky top-0">
                <tr className="text-gray-300">
                  <th className="px-4 py-3 text-left">Ref</th>
                  <th className="px-4 py-3 text-left">Guest</th>
                  <th className="px-4 py-3 text-left">Suite</th>
                  <th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-left">Check-In</th>
                  <th className="px-4 py-3 text-left">Check-Out</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">VIP</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#75240E]">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => router.push(`/staff/bookings/${b.id}`)}
                      className="cursor-pointer hover:bg-[#111111]"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#D55605]">
                        {b.bookingRef}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium">{b.guestName}</div>
                        <div className="text-xs text-gray-500">{b.guestEmail}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div>{b.suiteName}</div>
                        <div className="text-xs text-gray-500">{b.suiteCategory}</div>
                      </td>

                      <td className="px-4 py-3 text-gray-400">
                        {b.roomNumber ?? "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-400">{b.checkIn}</td>
                      <td className="px-4 py-3 text-gray-400">{b.checkOut}</td>

                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs
                          ${
                            b.status === "CHECKED_IN"
                              ? "bg-green-700/20 text-green-400"
                              : b.status === "CHECKED_OUT"
                              ? "bg-gray-700/20 text-gray-400"
                              : b.status === "CONFIRMED"
                              ? "bg-blue-700/20 text-blue-400"
                              : "bg-yellow-700/20 text-yellow-400"
                          }
                        `}>
                          {b.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs
                          ${
                            b.paymentStatus === "PAID"
                              ? "bg-green-700/20 text-green-400"
                              : "bg-red-700/20 text-red-400"
                          }
                        `}>
                          {b.paymentStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {b.vip ? (
                          <span className="rounded-full bg-[#D55605]/20 px-2 py-1 text-xs text-[#D55605]">
                            VIP
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
