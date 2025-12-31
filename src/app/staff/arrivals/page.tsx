"use client"

import { useEffect, useState } from "react"
import { FiUser, FiCalendar, FiCheck, FiStar, FiLoader } from "react-icons/fi"
import { getArrivals, checkInArrival, toggleVIPArrival } from "./actions"

interface Arrival {
  id: string
  guestName: string
  suite: string
  checkIn: string
  vip: boolean
  status: "Pending" | "Checked-in"
}



export default function StaffArrivalsPage() {
  const [arrivals, setArrivals] = useState<Arrival[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function fetchArrivals() {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/arrivals");
      const data = await res.json();
      setArrivals(data.sort((a: Arrival, b: Arrival) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(id: string) {
    setUpdatingId(id);
    try {
      await fetch("/api/staff/arrivals", {
        method: "POST",
        body: JSON.stringify({ action: "checkin", bookingId: id }),
        headers: { "Content-Type": "application/json" },
      });
      await fetchArrivals();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleVIP(id: string) {
    setUpdatingId(id);
    try {
      await fetch("/api/staff/arrivals", {
        method: "POST",
        body: JSON.stringify({ action: "toggleVIP", bookingId: id }),
        headers: { "Content-Type": "application/json" },
      });
      await fetchArrivals();
    } finally {
      setUpdatingId(null);
    }
  }


  /*const fetchArrivals = async () => {
    setLoading(true)
    try {
      const data = await getArrivals()
      setArrivals(data.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }*/

  useEffect(() => {
    fetchArrivals()
  }, [])

  /*const handleCheckIn = async (id: string) => {
    setUpdatingId(id)
    try {
      await checkInArrival(id)
      await fetchArrivals()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleVIP = async (id: string) => {
    setUpdatingId(id)
    try {
      await toggleVIPArrival(id)  // Calls this server action
      await fetchArrivals()       // Refresh the arrivals list
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }*/


  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Arrivals</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 bg-neutral-900 rounded-xl border border-[#75240E] animate-pulse h-28"></div>
          ))}
        </div>
      ) : arrivals.length === 0 ? (
        <div className="text-gray-400">No arrivals today</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {arrivals.map(a => (
            <div
              key={a.id}
              className="bg-neutral-900 p-4 rounded-xl border border-[#75240E] shadow flex flex-col justify-between hover:bg-[#111111] transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <FiUser className="text-[#75240E] text-xl" />
                <div>
                  <div className="font-semibold text-white">{a.guestName}</div>
                  <div className="text-gray-400 text-sm">
                    {a.suite} • <span className="font-medium">{a.checkIn}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {a.vip && (
                    <span
                      className="px-2 py-1 text-[#D55605] bg-[#75240E]/20 rounded-full font-semibold flex items-center gap-1 cursor-pointer"
                      onClick={() => handleToggleVIP(a.id)}
                    >
                      <FiStar /> VIP
                    </span>
                  )}
                  {!a.vip && (
                    <button
                      disabled={updatingId === a.id}
                      onClick={() => handleToggleVIP(a.id)}
                      className="px-2 py-1 bg-[#D55605]/20 text-[#D55605] rounded-full text-xs font-semibold hover:bg-[#D55605]/40 transition"
                    >
                      Mark VIP
                    </button>
                  )}
                </div>

                <div>
                  {a.status === "Pending" && (
                    <button
                      disabled={updatingId === a.id}
                      onClick={() => handleCheckIn(a.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#75240E] text-white rounded-lg hover:opacity-90 transition"
                    >
                      {updatingId === a.id ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiCheck />
                      )}
                      Check-in
                    </button>
                  )}
                  {a.status === "Checked-in" && (
                    <span className="px-3 py-1 bg-green-700/20 text-green-400 rounded-full font-medium">
                      Checked-in
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
