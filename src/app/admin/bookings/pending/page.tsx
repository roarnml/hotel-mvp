export default function PendingBookingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Pending Bookings</h1>
        <p className="text-sm text-gray-500">
          Awaiting check-in or confirmation
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Guest</th>
              <th>Suite</th>
              <th>Arrival</th>
              <th>Payment</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="p-4 font-medium">John Matthews</td>
              <td>Suite 215</td>
              <td>Today · 14:00</td>
              <td>
                <span className="text-yellow-600 font-medium">
                  Pending
                </span>
              </td>
              <td>
                <button className="text-blue-600 hover:underline">
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
