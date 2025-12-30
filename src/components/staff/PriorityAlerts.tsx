"use client"

import { useState, useEffect } from "react"
import { FiStar, FiTool } from "react-icons/fi"
import { getPriorityAlerts, markSuiteCleaned, checkInVIP, PriorityAlert } from "./actions"

export default function PriorityAlerts() {
  const [alerts, setAlerts] = useState<PriorityAlert[]>([])
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    try {
      const data = await getPriorityAlerts()
      setAlerts(data)
    } catch (err: any) {
      setError(err.message || "Failed to load alerts")
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // auto-refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const handleCheckIn = async (id: string) => {
    setLoadingIds(prev => [...prev, id])
    try {
      await checkInVIP(id)
      fetchAlerts()
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to check in VIP")
    } finally {
      setLoadingIds(prev => prev.filter(x => x !== id))
    }
  }

  const handleMarkCleaned = async (id: string) => {
    setLoadingIds(prev => [...prev, id])
    try {
      await markSuiteCleaned(id)
      fetchAlerts()
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Failed to mark suite as cleaned")
    } finally {
      setLoadingIds(prev => prev.filter(x => x !== id))
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-black border border-[#75240E] p-6 shadow-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl bg-black border border-[#75240E] p-6 shadow-lg">
      <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-4">
        Priority Alerts
      </h2>

      {alerts.length === 0 ? (
        <p className="text-sm text-gray-500">No priority alerts</p>
      ) : (
        <ul className="space-y-4 text-sm">
          {alerts.map((a) => {
            const isLoading = loadingIds.includes(a.id)
            return (
              <li
                key={a.id}
                className="flex justify-between items-center p-3 rounded-xl
                           border border-[#75240E]/40 hover:bg-[#75240E]/20 transition"
              >
                <div className="flex items-center gap-3">
                  {a.type === "VIP_ARRIVAL" ? (
                    <FiStar className="text-[#D55605]" />
                  ) : (
                    <FiTool className="text-yellow-400" />
                  )}

                  <span className="text-white">{a.message}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">{a.time}</span>

                  {a.type === "VIP_ARRIVAL" ? (
                    <button
                      disabled={isLoading}
                      onClick={() => handleCheckIn(a.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium
                                 bg-[#D55605] text-white hover:bg-[#b84804]
                                 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isLoading ? "Checking in..." : "Check In"}
                    </button>
                  ) : (
                    <button
                      disabled={isLoading}
                      onClick={() => handleMarkCleaned(a.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium
                                 bg-[#75240E] text-white hover:bg-[#5e1d0b]
                                 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isLoading ? "Updating..." : "Mark Cleaned"}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
