"use client"

import { useEffect, useState } from "react"
import { FiSearch } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { getBookings } from "@/app/staff/actions/booking"

interface Booking {
  id: string
  guestName: string
  suite: string
  checkIn: string
  checkOut: string
  status: "PENDING" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "CONFIRMED"
  vip: boolean
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
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filteredBookings = bookings.filter(
    (b) =>
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.suite.toLowerCase().includes(search.toLowerCase()) ||
      b.status.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Bookings
        </h1>
      </div>

      {/* Search */}
      <div className="bg-neutral-900 rounded-xl border border-[#75240E] p-4 shadow-sm">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75240E]" />
          <input
            type="text"
            placeholder="Search guest, suite, status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={() => fetchBookings(search)}
            className="w-full rounded-lg border border-[#75240E] bg-black pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D55605]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-xl border border-[#75240E] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-400">
            Loading bookings…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1a1a1a] sticky top-0 z-10">
                <tr className="text-gray-300">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Guest</th>
                  <th className="px-4 py-3 text-left font-medium">Suite</th>
                  <th className="px-4 py-3 text-left font-medium">Check-In</th>
                  <th className="px-4 py-3 text-left font-medium">Check-Out</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">VIP</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#75240E]">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() =>
                        router.push(`/staff/bookings/${b.id}`)
                      }
                      className="cursor-pointer hover:bg-[#111111] transition"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#D55605]">
                        {b.id.slice(0, 8)}…
                      </td>

                      <td className="px-4 py-3 font-medium text-white">
                        {b.guestName}
                      </td>

                      <td className="px-4 py-3 text-gray-400">
                        {b.suite}
                      </td>

                      <td className="px-4 py-3 text-gray-400">
                        {b.checkIn}
                      </td>

                      <td className="px-4 py-3 text-gray-400">
                        {b.checkOut}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
                            ${
                              b.status === "CHECKED_IN"
                                ? "bg-green-700/20 text-green-400"
                                : b.status === "CHECKED_OUT"
                                ? "bg-gray-700/20 text-gray-400"
                                : "bg-yellow-700/20 text-yellow-400"
                            }
                          `}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {b.vip ? (
                          <span className="inline-flex items-center rounded-full bg-[#D55605]/20 px-2.5 py-1 text-xs font-medium text-[#D55605]">
                            VIP
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">
                            — 
                          </span>
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
