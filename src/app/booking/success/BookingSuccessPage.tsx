"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import {
  FiCheckCircle,
  FiFileText,
  FiCalendar,
  FiCreditCard,
  FiMail,
} from "react-icons/fi"

interface Ticket {
  ticketNumber: string
  bookingRef: string
  suiteName?: string
  checkIn: string
  checkOut: string
  ticketPdfUrl?: string
  emailSentAt?: string
  guestName: string
  email: string
  amountPaid?: number
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const trxref =
    searchParams.get("trxref") ||
    searchParams.get("reference") || ""


  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState(
    "Checking payment status..."
  )

  // 🔁 Clean polling — stops automatically when ticket is ready
  useEffect(() => {
    if (!trxref) return

    console.log("Starting payment verification for trxref:", trxref)

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payments/verify?trxref=${trxref}`
        )
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Verification failed")

        if (data.status === "pending") {
          setStatusMessage("Waiting for payment confirmation…")
          return
        }

        if (data.status === "processing") {
          setStatusMessage("Generating your ticket…")
          return
        }

        if (data.status === "ready") {
          setTicket(data.ticket)
          setLoading(false)
          clearInterval(interval)
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong")
        setLoading(false)
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [trxref])


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p className="text-lg text-gray-300">{statusMessage}</p>
      </div>
    )

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4 bg-black text-white">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#75240E] text-white rounded hover:bg-[#D55605] transition"
        >
          Retry
        </button>
      </div>
    )

  if (!ticket)
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p className="text-gray-300">No ticket found.</p>
      </div>
    )

  const copyRef = () => {
    navigator.clipboard.writeText(ticket.bookingRef)
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4 md:px-8 bg-black text-white min-h-screen">
      <div className="text-center mb-8">
        <FiCheckCircle className="mx-auto text-[#75240E] w-16 h-16" />
        <h1 className="text-4xl font-bold text-[#D55605] mt-4">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-gray-300">
          Your booking has been successfully processed. 🎉
        </p>
      </div>

      <div className="bg-[#1a1a1a] shadow-lg rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Guest:</p>
          <p>{ticket.guestName} ({ticket.email})</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold flex items-center gap-2">
            <FiFileText className="text-[#75240E]" /> Booking Ref:
          </p>
          <p>{ticket.bookingRef}</p>
          <button
            onClick={copyRef}
            className="text-sm text-[#D55605] hover:underline"
          >
            Copy
          </button>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold flex items-center gap-2">
            <FiFileText className="text-[#75240E]" /> Ticket Number:
          </p>
          <p>{ticket.ticketNumber}</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold flex items-center gap-2">
            <FiCalendar className="text-[#75240E]" /> Check-in:
          </p>
          <p>{new Date(ticket.checkIn).toLocaleDateString()}</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold flex items-center gap-2">
            <FiCalendar className="text-[#75240E]" /> Check-out:
          </p>
          <p>{new Date(ticket.checkOut).toLocaleDateString()}</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold flex items-center gap-2">
            <FiMail className="text-[#75240E]" /> Email Sent:
          </p>
          <p>
            {ticket.emailSentAt
              ? new Date(ticket.emailSentAt).toLocaleString()
              : "Pending"}
          </p>
        </div>

        {ticket.ticketPdfUrl && (
          <div className="mt-6 border border-dashed border-gray-600 rounded-xl p-6 bg-[#121212] space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* 🎟️ Ticket Info */}
              <div className="space-y-2">
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Official Booking Ticket
                </p>

                <p className="text-xl font-bold text-[#D55605]">
                  Ticket #{ticket.ticketNumber}
                </p>

                <p className="text-gray-300">
                  {ticket.guestName}
                </p>

                <p className="text-gray-400 text-sm">
                  {new Date(ticket.checkIn).toDateString()} →{" "}
                  {new Date(ticket.checkOut).toDateString()}
                </p>
              </div>

              {/* 📦 QR Code */}
              <div className="bg-white p-3 rounded-lg">
                <QRCodeCanvas
                  value={`${ticket.ticketNumber}`}
                  size={120}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              <a
                href={ticket.ticketPdfUrl}
                target="_blank"
                className="flex-1 text-center bg-[#75240E] text-white px-6 py-3 rounded-lg hover:bg-[#D55605] transition font-medium"
              >
                View Ticket PDF
              </a>

              <button
                onClick={() => window.print()}
                className="flex-1 text-center border border-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Print Ticket
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
