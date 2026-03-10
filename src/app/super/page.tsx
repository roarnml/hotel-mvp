import MetricCard from "@/components/staff/MetricCard"
import PriorityAlerts from "@/components/staff/PriorityAlerts"
import QuickActions from "@/components/staff/QuickActions"
import ArrivalRow from "@/components/staff/ArrivalRow"

import { getDashboardMetrics } from "@/lib/dashboardMetrics"
import { getTodaysArrivals } from "@/lib/arrivalQueries"

export default async function SuperUserDashboardPage() {
  const metrics = await getDashboardMetrics()
  const arrivals = await getTodaysArrivals()

  return (
    <div
      className="space-y-8 min-h-screen p-6"
      style={{ backgroundColor: "#000000", color: "white" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-2xl font-semibold tracking-wide"
            style={{ color: "#D55605" }}
          >
            Executive Dashboard
          </h1>
          <p className="text-sm text-gray-400">
            Global hotel performance & system oversight
          </p>
        </div>

        <div className="text-sm text-gray-400">
          System Time ·{" "}
          <span className="font-medium text-white">
            {new Date().toLocaleTimeString("en-NG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* High-level Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Arrivals Today" value={metrics.arrivalsToday} />
        <MetricCard label="Total Departures Today" value={metrics.departuresToday} />
        <MetricCard label="Rooms Occupied" value={metrics.occupiedRooms} />
        <MetricCard label="Rooms Available" value={metrics.availableRooms} />
      </section>

      {/* Priority / VIP / System Alerts */}
      <PriorityAlerts />

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arrivals Overview */}
        <div className="lg:col-span-2 bg-[#0b0b0b] rounded-xl shadow-sm p-6">
          <h2
            className="text-lg font-medium mb-4"
            style={{ color: "#D55605" }}
          >
            Today’s Arrivals (Overview)
          </h2>

          <table className="w-full text-sm">
            <thead className="text-left text-gray-400">
              <tr>
                <th className="py-2">Guest</th>
                <th>Room</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {arrivals.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-gray-500"
                  >
                    No arrivals scheduled for today
                  </td>
                </tr>
              )}

              {arrivals.map((arrival) => (
                <ArrivalRow
                  key={arrival.id}
                  guest={arrival.guestName}
                  room={arrival.roomNumber}
                  checkInTime={arrival.checkInTime}
                  bookingStatus={arrival.status}
                  roomOccupied={arrival.roomNumber !== null}
                  paymentStatus={"PENDING"}
                  bookingId={arrival.id}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Executive Quick Actions */}
        <QuickActions />
      </section>
    </div>
  )
}
