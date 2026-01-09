import { prisma } from "@/lib/prisma"
import UsersTable from "./users-table"

export default async function AdminUsersPage() {
  const bookings = await prisma.booking.findMany({
    where: {
      paymentStatus: "PAID", // only consider paying customers
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Aggregate users by booking behavior
  const usersMap = new Map<
    string,
    {
      bookings: number
      totalSpent: number
      lastBooking: Date
    }
  >()

  bookings.forEach((b: any) => {
    const key = b.id // later: email or phone

    const existing = usersMap.get(key)

    if (existing) {
      existing.bookings += 1
      existing.totalSpent += b.amountPaid ?? 0
      existing.lastBooking =
        b.createdAt > existing.lastBooking
          ? b.createdAt
          : existing.lastBooking
    } else {
      usersMap.set(key, {
        bookings: 1,
        totalSpent: b.amountPaid ?? 0,
        lastBooking: b.createdAt,
      })
    }
  })

  const users = Array.from(usersMap.entries()).map(
    ([id, data]) => ({
      id,
      ...data,
    })
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Customers
        </h1>
        <p className="text-sm text-gray-500">
          Paying customers derived from booking activity
        </p>
      </header>

      <UsersTable users={users} />
    </div>
  )
}
