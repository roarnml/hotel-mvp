export default function ActiveBookingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Active Bookings</h1>
        <p className="text-sm text-gray-500">
          Guests currently checked in
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Guest</th>
              <th>Suite</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="p-4 font-medium">Aisha Bello</td>
              <td>Suite 402</td>
              <td>Dec 15</td>
              <td>Dec 20</td>
              <td>
                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Checked-in
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
