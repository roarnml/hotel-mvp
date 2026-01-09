'use client'

import { useEffect } from "react"
import { notFound } from "next/navigation"

type Booking = {
  bookingRef: string
  ticketNumber: string
  checkInNumber: string
  status: string
  guest: { name: string; email: string; phone: string }
  suite: { name: string; price: number }
  checkIn: string
  checkOut: string
}

type Props = { booking: Booking }

export default function TicketDownload({ booking }: Props) {

  useEffect(() => {
    //if (!booking.ticketNumber) notFound()
    const timer = setTimeout(() => {
      window.location.href = "/"
    }, 60000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12 text-white">
      <div className="bg-gray-900 border-l-4 border-yellow-500 text-yellow-400 p-4 mb-6 max-w-xl rounded shadow">
        <p className="font-semibold">🎉 Your booking is confirmed!</p>
        <p className="text-sm">
          Your ticket has been sent to your email. You can also{" "}
          <a
            href={`/tickets/${booking.ticketNumber}.pdf`}
            target="_blank"
            className="text-yellow-300 underline hover:text-yellow-400"
          >
            Download your PDF ticket
          </a>

          .
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full p-8 space-y-6 border border-gray-700">
        <h1 className="text-3xl font-bold text-center text-yellow-400">🎫 Booking Ticket</h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Booking Ref</p>
            <p className="font-semibold text-white">{booking.bookingRef}</p>
          </div>
          <div>
            <p className="text-gray-400">Ticket Number</p>
            <p className="font-semibold text-white">{booking.ticketNumber}</p>
          </div>
          <div>
            <p className="text-gray-400">Check-In Code</p>
            <p className="font-semibold text-white">{booking.checkInNumber}</p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            <p className="font-semibold text-white">{booking.status}</p>
          </div>
        </div>

        <hr className="border-gray-700" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Guest</p>
            <p className="font-semibold">{booking.guest.name}</p>
            <p className="text-sm">{booking.guest.email}</p>
            {booking.guest.phone && <p className="text-sm">{booking.guest.phone}</p>}
          </div>
          <div>
            <p className="text-gray-400">Suite</p>
            <p className="font-semibold">{booking.suite.name}</p>
            <p>₦{booking.suite.price}</p>
            <p>Check-In: {new Date(booking.checkIn).toLocaleDateString()}</p>
            <p>Check-Out: {new Date(booking.checkOut).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-gray-400 text-sm">
        You will be redirected to the home page in 1 minute.
      </p>
    </main>
  )
}
