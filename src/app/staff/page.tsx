import MetricCard from "@/components/staff/MetricCard"
import { getDashboardMetrics } from "@/lib/dashboardMetrics"
import ArrivalRow from "@/components/staff/ArrivalRow"
import { getTodaysArrivals } from "@/lib/arrivalQueries"
import QuickActions from "@/components/staff/QuickActions"
import PriorityAlerts from "@/components/staff/PriorityAlerts"

export default async function StaffDashboardPage() {
  const metrics = await getDashboardMetrics()
  const arrivals = await getTodaysArrivals()

  return (
    <div
      className="space-y-8 min-h-screen p-6"
      style={{ backgroundColor: "#000000", color: "white" }}
    >
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-2xl font-semibold tracking-wide"
            style={{ color: "#D55605" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-gray-400">
            Today’s hotel operations overview
          </p>
        </div>

        <div className="text-sm text-gray-400">
          Local Time ·{" "}
          <span className="font-medium text-white">
            {new Date().toLocaleTimeString("en-NG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Arrivals Today" value={metrics.arrivalsToday} />
        <MetricCard label="Departures Today" value={metrics.departuresToday} />
        <MetricCard label="Occupied Rooms" value={metrics.occupiedRooms} />
        <MetricCard label="Available Rooms" value={metrics.availableRooms} />
      </section>

      {/* Priority Alerts */}
      <PriorityAlerts />

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arrivals Table */}
        <div className="lg:col-span-2 bg-[#0b0b0b] rounded-xl shadow-sm p-6">
          <h2
            className="text-lg font-medium mb-4"
            style={{ color: "#D55605" }}
          >
            Today’s Arrivals
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
                  bookingId={arrival.id}
                  roomOccupied={arrival.roomNumber !== null}
                  paymentStatus="PENDING"
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions (Client Component) */}
        <QuickActions />
      </section>
    </div>
  )
}
