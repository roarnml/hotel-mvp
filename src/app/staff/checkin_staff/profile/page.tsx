import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { FiMail, FiUserCheck, FiHome } from "react-icons/fi"
import { BookingCard } from "./BookingCard"

const COLORS = {
  bg: "#000000",
  primary: "#D55605",
  accent: "#75240E",
  text: "#FFFFFF",
}

export default async function StaffProfilePage() {
  const session = await getServerSession()

  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || user.role !== "CHECKIN_STAFF") {
    redirect("/unauthorized")
  }

  const now = new Date()

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      checkIn: { lte: now },
      checkOut: { gte: now },
    },
    include: {
      suite: true,
      guest: true,
      payment: true,
      roomAssignment: true,
    },
    orderBy: { checkIn: "asc" },
  })

  return (
    <main
      className="min-h-screen p-6 space-y-8"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      {/* ===== PROFILE HEADER ===== */}
      <section className="rounded-2xl border border-[#75240E] p-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-2xl font-bold tracking-wide"
              style={{ color: COLORS.primary }}
            >
              {user.name}
            </h1>

            <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
              <FiMail />
              <span>{user.email}</span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs">
              <FiUserCheck style={{ color: COLORS.accent }} />
              <span className="uppercase tracking-wider">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Permission Badges */}
          <div className="flex gap-2 flex-wrap">
            {user.canCheckIn && <Badge label="Check-In" />}
            {user.canCheckOut && <Badge label="Check-Out" />}
            {user.canAssignChalet && <Badge label="Assign Room" />}
          </div>
        </div>
      </section>

      {/* ===== CHECK-IN QUEUE ===== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FiHome style={{ color: COLORS.primary }} />
          <h2 className="text-xl font-semibold">
            Today’s Check-In Queue
          </h2>
        </div>

        {bookings.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#75240E] p-6 text-center text-gray-400">
            No guests awaiting check-in.
          </div>
        )}

        <div className="grid gap-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              canCheckIn={user.canCheckIn}
              canCheckOut={user.canCheckOut}
              theme={COLORS}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

/* ===== Badge Component ===== */
function Badge({ label }: { label: string }) {
  return (
    <span
      className="px-3 py-1 text-xs rounded-full font-semibold tracking-wide"
      style={{
        backgroundColor: "#75240E",
        color: "#FFFFFF",
      }}
    >
      {label}
    </span>
  )
}
