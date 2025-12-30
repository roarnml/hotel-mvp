export default function CompletedBookingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Completed Stays</h1>
        <p className="text-sm text-gray-500">
          Guests who have checked out
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Guest</th>
              <th>Suite</th>
              <th>Stayed</th>
              <th>Revenue</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="p-4 font-medium">Michael Chen</td>
              <td>Presidential</td>
              <td>Dec 10 – Dec 14</td>
              <td className="font-medium">$4,800</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
