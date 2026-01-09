export default function BookingIssuesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Booking Issues</h1>
        <p className="text-sm text-gray-500">
          Conflicts, payment failures, or complaints
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Guest</th>
              <th>Issue</th>
              <th>Suite</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="p-4 font-medium">Sarah Williams</td>
              <td>Payment mismatch</td>
              <td>Suite 108</td>
              <td>
                <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                  High
                </span>
              </td>
              <td>
                <button className="text-blue-600 hover:underline">
                  Resolve
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
