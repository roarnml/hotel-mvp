interface UserRow {
  id: string
  bookings: number
  totalSpent: number
  lastBooking: Date
}

export default function UsersTable({ users }: { users: UserRow[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-6 py-3 text-left">Customer ID</th>
            <th className="px-6 py-3 text-right">Bookings</th>
            <th className="px-6 py-3 text-right">Total Spent</th>
            <th className="px-6 py-3 text-right">Last Booking</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="px-6 py-3 font-mono text-xs">
                {u.id.slice(0, 8)}…
              </td>

              <td className="px-6 py-3 text-right">
                {u.bookings}
              </td>

              <td className="px-6 py-3 text-right font-medium">
                ₦{u.totalSpent.toLocaleString()}
              </td>

              <td className="px-6 py-3 text-right text-gray-500">
                {u.lastBooking.toDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <p className="p-6 text-sm text-gray-500">
          No paying customers yet.
        </p>
      )}
    </div>
  )
}
