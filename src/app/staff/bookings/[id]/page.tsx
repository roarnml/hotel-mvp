import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getBookingDetail } from "@/lib/booking/bookingDetail"
import { getBookingEvents } from "@/lib/booking/bookingEvents"
import BookingDetailClient from "./BookingDetailClient"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  const staffRole = session?.user?.role ?? "STAFF" // fallback if session missing

  const [booking, events] = await Promise.all([
    getBookingDetail(id),
    getBookingEvents(id),
  ])

  if (!booking) return <div className="min-h-screen bg-black text-white p-6">Not found</div>

  return <BookingDetailClient booking={booking} events={events} staffRole={staffRole} />
}