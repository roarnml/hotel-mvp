'use client'

import { useEffect } from "react"
import jsPDF from "jspdf"
import QRCode from "qrcode"

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
  const downloadPremiumTicket = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: [500, 250] })
    
    // Black background
    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, 500, 250, "F")
    
    // White card
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(15, 15, 470, 220, 10, 10, 'F')

    // Title
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('🎟️ Hotel Booking Ticket', 30, 40)

    // Details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${booking.guest.name}`, 30, 65)
    doc.text(`Email: ${booking.guest.email}`, 30, 80)
    if (booking.guest.phone) doc.text(`Phone: ${booking.guest.phone}`, 30, 95)
    doc.text(`Booking Ref: ${booking.bookingRef}`, 30, 110)
    doc.text(`Ticket Number: ${booking.ticketNumber}`, 30, 125)
    doc.text(`Check-In Code: ${booking.checkInNumber}`, 30, 140)
    doc.text(`Suite: ${booking.suite.name}`, 30, 155)
    doc.text(`Price: ₦${booking.suite.price}`, 30, 170)
    doc.text(`Check-In: ${new Date(booking.checkIn).toLocaleDateString()}`, 30, 185)
    doc.text(`Check-Out: ${new Date(booking.checkOut).toLocaleDateString()}`, 30, 200)

    // QR code
    const qrData = await QRCode.toDataURL(booking.bookingRef)
    doc.addImage(qrData, 'PNG', 350, 60, 120, 120)

    doc.save(`Ticket-${booking.bookingRef}.pdf`)
  }

  useEffect(() => {
    downloadPremiumTicket()
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
          <button
            onClick={downloadPremiumTicket}
            className="text-yellow-300 underline hover:text-yellow-400"
          >
            download your PDF ticket here
          </button>
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
