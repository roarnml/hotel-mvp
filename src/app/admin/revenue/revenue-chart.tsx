"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[]
}) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(v: number | undefined) =>
              v !== undefined ? `₦${v.toLocaleString()}` : ""
            }
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
