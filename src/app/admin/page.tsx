export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Operational, financial, and system overview
          </p>
        </div>

        <div className="text-sm text-gray-500">
          System Time · <span className="font-medium text-gray-800">09:42</span>
        </div>
      </div>

      {/* Top Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Occupancy" value="86%" />
        <MetricCard label="Today’s Revenue" value="$48,200" />
        <MetricCard label="Active Bookings" value="124" />
        <MetricCard label="Staff On Duty" value="32" />
      </section>

      {/* Alerts & System Health */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Priority Alerts
          </h2>

          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span>VIP Guest Escalation · Suite 801</span>
              <span className="text-gray-500">Immediate</span>
            </li>
            <li className="flex justify-between">
              <span>Payment failure · Booking BKG-2211</span>
              <span className="text-gray-500">10 mins ago</span>
            </li>
            <li className="flex justify-between">
              <span>Housekeeping backlog · Floor 2</span>
              <span className="text-gray-500">Ongoing</span>
            </li>
          </ul>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            System Health
          </h2>

          <ul className="space-y-3 text-sm">
            <HealthRow label="Booking Engine" status="Operational" />
            <HealthRow label="Payments" status="Operational" />
            <HealthRow label="Email Service" status="Delayed" />
            <HealthRow label="Database" status="Operational" />
          </ul>
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Bookings
          </h2>

          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Guest</th>
                <th>Suite</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <BookingRow
                guest="Liam Chen"
                suite="Presidential"
                amount="$12,000"
                status="Confirmed"
              />
              <BookingRow
                guest="Fatima Noor"
                suite="Executive"
                amount="$4,800"
                status="Pending"
              />
            </tbody>
          </table>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-lg font-medium text-gray-900">
            Admin Actions
          </h2>

          <button className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
            View Revenue Report
          </button>

          <button className="w-full py-3 rounded-lg border text-sm font-medium hover:bg-gray-50">
            Manage Suites
          </button>

          <button className="w-full py-3 rounded-lg border text-sm font-medium hover:bg-gray-50">
            Manage Users
          </button>
        </div>
      </section>
    </div>
  )
}

/* --- Components --- */

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">
        {value}
      </p>
    </div>
  )
}

function HealthRow({
  label,
  status,
}: {
  label: string
  status: "Operational" | "Delayed"
}) {
  return (
    <li className="flex justify-between items-center">
      <span>{label}</span>
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          status === "Operational"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {status}
      </span>
    </li>
  )
}

function BookingRow({
  guest,
  suite,
  amount,
  status,
}: {
  guest: string
  suite: string
  amount: string
  status: string
}) {
  return (
    <tr>
      <td className="py-3">{guest}</td>
      <td>{suite}</td>
      <td>{amount}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Confirmed"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </td>
    </tr>
  )
}
