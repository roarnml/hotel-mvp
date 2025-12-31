import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = params

  // Fetch bookings for this user
  const bookings = await prisma.booking.findMany({
    where: {
      id, // ideally this should be email or userId
      paymentStatus: "SUCCESS",
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!bookings.length) {
    return notFound()
  }

  // Aggregate stats for this user
  const totalSpent = bookings.reduce((acc, b) => acc + (b.amountPaid ?? 0), 0)
  const lastBooking = bookings[0].createdAt
  const totalBookings = bookings.length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Customer Details
        </h1>
        <p className="text-sm text-gray-500">
          Stats and booking history for {id}
        </p>
      </header>

      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-medium mb-2">Summary</h2>
        <ul className="space-y-1">
          <li>Total Bookings: {totalBookings}</li>
          <li>Total Spent: ${totalSpent.toFixed(2)}</li>
          <li>Last Booking: {new Date(lastBooking).toLocaleDateString()}</li>
        </ul>
      </section>

      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-medium mb-2">Booking History</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Booking Ref</th>
              <th className="p-2">Suite</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Check-In</th>
              <th className="p-2">Check-Out</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{b.bookingRef}</td>
                <td className="p-2">{b.suiteId}</td>
                <td className="p-2">${(b.amountPaid ?? 0).toFixed(2)}</td>
                <td className="p-2">{new Date(b.checkIn).toLocaleDateString()}</td>
                <td className="p-2">{new Date(b.checkOut).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
