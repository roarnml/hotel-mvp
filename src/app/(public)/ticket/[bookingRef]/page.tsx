/*
// (public)/ticket/[bookingRef]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { useEffect } from "react"
import jsPDF from "jspdf"

type TicketPageProps = {
  params: Promise<{ bookingRef: string }>
}

// Helper to generate PDF
function downloadTicketPDF(booking: any) {
  const doc = new jsPDF()
  doc.setFontSize(22)
  doc.text("🎟️ Hotel Booking Ticket", 20, 30)
  doc.setFontSize(14)
  doc.text(`Booking Ref: ${booking.bookingRef}`, 20, 50)
  doc.text(`Ticket Number: ${booking.ticketNumber}`, 20, 60)
  doc.text(`Check-In Code: ${booking.checkInNumber}`, 20, 70)
  doc.text(`Status: ${booking.status}`, 20, 80)
  doc.text(`Guest: ${booking.guest.name}`, 20, 100)
  doc.text(`Email: ${booking.guest.email}`, 20, 110)
  if (booking.guest.phone) doc.text(`Phone: ${booking.guest.phone}`, 20, 120)
  doc.text(`Suite: ${booking.suite.name}`, 20, 140)
  doc.text(`Price: ₦${booking.suite.price}`, 20, 150)
  doc.text(`Check-In: ${new Date(booking.checkIn).toLocaleDateString()}`, 20, 170)
  doc.text(`Check-Out: ${new Date(booking.checkOut).toLocaleDateString()}`, 20, 180)

  doc.save(`Ticket-${booking.bookingRef}.pdf`)
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { bookingRef } = await params

  if (!bookingRef || typeof bookingRef !== "string") notFound()

  const booking = await prisma.booking.findUnique({
    where: { bookingRef },
    include: { suite: true, guest: true },
  })

  if (!booking) notFound()

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center px-4 py-12">
      {/* ✅ Green Success Notification /}
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 w-full max-w-xl rounded shadow">
        <p className="font-semibold">🎉 Your booking is confirmed!</p>
        <p className="text-sm">
          Your ticket has been sent to your email. You can also{" "}
          <button
            onClick={() => downloadTicketPDF(booking)}
            className="text-green-800 underline hover:text-green-900"
          >
            download your PDF ticket here
          </button>
          .
        </p>
      </div>

      {/* Ticket Card *}
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 space-y-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-indigo-900">
          🎫 Booking Ticket
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Booking Ref</p>
            <p className="font-semibold text-indigo-800">{booking.bookingRef}</p>
          </div>
          <div>
            <p className="text-gray-500">Ticket Number</p>
            <p className="font-semibold text-indigo-800">{booking.ticketNumber}</p>
          </div>
          <div>
            <p className="text-gray-500">Check-In Code</p>
            <p className="font-semibold text-indigo-800">{booking.checkInNumber}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-semibold text-indigo-800">{booking.status}</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Guest</p>
            <p className="font-semibold">{booking.guest.name}</p>
            <p className="text-sm">{booking.guest.email}</p>
            {booking.guest.phone && <p className="text-sm">{booking.guest.phone}</p>}
          </div>
          <div>
            <p className="text-gray-500">Suite</p>
            <p className="font-semibold">{booking.suite.name}</p>
            <p>₦{booking.suite.price}</p>
            <p>Check-In: {new Date(booking.checkIn).toLocaleDateString()}</p>
            <p>Check-Out: {new Date(booking.checkOut).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        You will be redirected to the home page in 1 minute.
      </p>

      {/* Auto redirect after 1 minute /}
      <script
        dangerouslySetInnerHTML={{
          __html: `setTimeout(() => { window.location.href = '/' }, 60000)`,
        }}
      />
    </main>
  )
}*/

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import TicketDownload from "./TicketDownload" // Client component

type TicketPageProps = {
  params: { bookingRef: string } | Promise<{ bookingRef: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { bookingRef } = await params

  if (!bookingRef || typeof bookingRef !== "string") notFound()

  const booking = await prisma.booking.findUnique({
    where: { bookingRef },
    include: { suite: true, guest: true },
  })

  if (!booking) notFound()
  if (booking.paymentStatus !== "PAID") notFound()

  // Map DB fields to types expected by TicketDownload
  const safeBooking = {
    bookingRef: booking.bookingRef,
    ticketNumber: booking.ticketNumber ?? "",
    checkInNumber: booking.checkInNumber ? booking.checkInNumber.toString() : "",
    status: booking.paymentStatus,
    guest: booking.guest
      ? {
          name: booking.guest.name,
          email: booking.guest.email,
          phone: booking.guest.phone ?? "",
        }
      : {
          name: "Unknown Guest",
          email: "unknown@example.com",
          phone: "",
        },
    suite: {
      name: booking.suite.name,
      price: booking.suite.price,
    },
    checkIn: booking.checkIn ? booking.checkIn.toISOString() : "",
    checkOut: booking.checkOut ? booking.checkOut.toISOString() : "",
  }

  return <TicketDownload booking={safeBooking} />
}
