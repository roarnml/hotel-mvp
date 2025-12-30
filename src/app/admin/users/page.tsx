import { prisma } from "@/lib/prisma"

export default async function AdminUsersPage() {
  const bookings = await prisma.booking.findMany({
    where: {
      paymentStatus: "PAID",
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

  bookings.forEach((b) => {
    const key = b.id // later: email or phone

    const existing = usersMap.get(key)

    if (existing) {
      existing.bookings += 1
      existing.totalSpent += b.totalAmount
      existing.lastBooking =
        b.createdAt > existing.lastBooking
          ? b.createdAt
          : existing.lastBooking
    } else {
      usersMap.set(key, {
        bookings: 1,
        totalSpent: b.totalAmount,
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
