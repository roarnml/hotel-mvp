"use client"

import { useEffect, useState } from "react"
import { getDashboardMetrics, DashboardMetrics } from "./metrics"

type MetricCardProps = {
  label: string
  value?: number | string
  subtext?: string
}

export default function MetricCard({ label, value, subtext }: MetricCardProps) {
  const [metricValue, setMetricValue] = useState<number | string>(value || "—")

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data: DashboardMetrics = await getDashboardMetrics()
        switch (label) {
          case "Total Bookings Today":
            setMetricValue(data.totalBookingsToday)
            break
          case "VIP Arrivals Today":
            setMetricValue(data.vipArrivalsToday)
            break
          case "Suites Pending Cleaning":
            setMetricValue(data.suitesPendingCleaning)
            break
          case "Total Revenue":
            setMetricValue(`₦${(data.totalRevenue / 100).toLocaleString()}`)
            break
          default:
            setMetricValue(value || "—")
        }
      } catch (err) {
        console.error(err)
        setMetricValue("—")
      }
    }

    fetchMetrics()
  }, [label, value])

  return (
    <div
      className="rounded-2xl p-6 border border-[#75240E] bg-black shadow-lg
                 hover:shadow-xl transition"
    >
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>

      <p className="mt-2 text-3xl font-bold text-white">{metricValue}</p>

      {subtext && <p className="mt-1 text-xs text-gray-500">{subtext}</p>}
    </div>
  )
}
