import { prisma } from "@/lib/prisma"
import RevenueChart from "./revenue-chart"
import ExportCSVButton from "./export-csv"
//import { PrismaClient } from "@prisma/client"


function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export default async function AdminRevenuePage() {
  const now = new Date()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(now.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const bookings = await prisma.booking.findMany({
    where: {
      paymentStatus: "PAID",
      createdAt: { gte: sixMonthsAgo },
    },
    include: { suite: true },
    orderBy: { createdAt: "asc" },
  })

  // TypeScript now knows `bookings` is an array of your Booking model
  const totalRevenue = bookings.reduce(
    (sum: number, b: any) => sum + (b.amountPaid ?? 0),
    0
  )


  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayRevenue = bookings
    .filter((b: any) => b.createdAt >= today)
    .reduce((sum: number, b: any) => sum + (b.amountPaid ?? 0), 0)

  // ---- Monthly aggregation ----
  const monthlyMap: Record<string, number> = {}

  bookings.forEach((b: any) => {
    const monthKey = startOfMonth(b.createdAt).toISOString()
    monthlyMap[monthKey] =
      (monthlyMap[monthKey] || 0) + (b.amountPaid ?? 0)
  })

  const monthlyRevenue = Object.entries(monthlyMap).map(
    ([date, revenue]) => ({
      month: new Date(date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      revenue,
    })
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Revenue
          </h1>
          <p className="text-sm text-gray-500">
            Financial performance & trends
          </p>
        </div>

        <ExportCSVButton bookings={bookings} />
      </div>

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Metric label="Total Revenue" value={totalRevenue} />
        <Metric label="Revenue Today" value={todayRevenue} />
        <Metric label="Paid Bookings" value={bookings.length} />
      </section>

      {/* Chart */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Revenue (Last 6 Months)
        </h2>

        <RevenueChart data={monthlyRevenue} />
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">
        ₦{value.toLocaleString()}
      </p>
    </div>
  )
}
