"use client"

import { useEffect, useState } from "react"
import { FiStar, FiUser } from "react-icons/fi"
import { getVIPGuests } from "./actions"

interface VIPGuest {
  id: string
  guestName: string
  suite: string
}

export default function VIPGuestsPage() {
  const [vips, setVips] = useState<VIPGuest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVIPs() {
      try {
        setLoading(true)
        const data = await getVIPGuests()
        setVips(data)
      } finally {
        setLoading(false)
      }
    }

    fetchVIPs()
  }, [])

  return (
    <div className="space-y-6 text-white min-h-screen bg-black p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
        <FiStar className="text-[#D55605]" />
        VIP Guests
      </h1>

      {loading ? (
        <div className="text-sm text-white/70">Loading VIP arrivals…</div>
      ) : vips.length === 0 ? (
        <div className="text-sm text-white/50">
          No VIP guests expected today
        </div>
      ) : (
        <div className="space-y-4">
          {vips.map((v) => (
            <div
              key={v.id}
              className="bg-[#1a0b06] p-4 rounded-lg shadow flex justify-between items-center hover:bg-[#2a0f08] transition"
            >
              <div className="flex items-center gap-3">
                <FiUser className="text-[#75240E]" />
                <div className="font-semibold text-white">
                  {v.guestName}
                </div>
              </div>

              <div className="text-sm text-white/70">{v.suite}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
