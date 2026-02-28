/*"use client"

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
  ticketNumber: string | null
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
        /*const res = await fetch(
          `/api/payments/verify?trxref=${trxref}`
        )*
       const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(trxref)}`)
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
              
              {/* 🎟️ Ticket Info *}
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

              {/* 📦 QR Code *}
              <div className="bg-white p-3 rounded-lg">
                <QRCodeCanvas
                  value={`${ticket.ticketNumber}`}
                  size={120}
                />
              </div>
            </div>

            {/* Actions *}
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
*/

"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { FiCheckCircle, FiFileText, FiCalendar, FiMail } from "react-icons/fi"

interface Ticket {
  ticketNumber: string | null
  bookingRef: string
  suiteName?: string
  checkIn: string
  checkOut: string
  ticketPdfUrl?: string | null
  emailSentAt?: string | null
  guestName: string
  email: string
  amountPaid?: number
  chaletCount?: number
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()

  const reference = useMemo(() => {
    return searchParams.get("reference") || searchParams.get("trxref") || ""
  }, [searchParams])

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState("Checking payment status...")

  const inFlightRef = useRef(false)

  useEffect(() => {
    if (!reference) {
      setError("Missing payment reference. Please return to the booking page and try again.")
      setLoading(false)
      return
    }

    let attempts = 0
    const maxAttempts = 20 // ~60s at 3s interval
    let interval: any

    const tick = async () => {
      if (inFlightRef.current) return false
      inFlightRef.current = true

      attempts += 1
      try {
        const res = await fetch(
          `/api/payments/verify?reference=${encodeURIComponent(reference)}`,
          { cache: "no-store" }
        )

        // handle non-json or empty response safely
        let data: any = null
        try {
          data = await res.json()
        } catch {
          data = null
        }

        // ✅ Treat 404 as "not found yet" (keep polling)
        if (res.status === 404 || data?.status === "not_found") {
          setStatusMessage("We couldn’t find your payment yet…")
        } else if (!res.ok) {
          throw new Error(data?.message || "Verification failed")
        } else if (data?.status === "pending") {
          setStatusMessage("Waiting for payment confirmation…")
        } else if (data?.status === "ready") {
          setTicket(data.ticket)
          setLoading(false)
          return true // stop
        } else {
          setStatusMessage("Processing…")
        }

        if (attempts >= maxAttempts) {
          setLoading(false)
          setError("Payment confirmation is taking longer than expected. Please refresh this page in a moment.")
          return true // stop
        }

        return false
      } catch (err: any) {
        setError(err?.message || "Something went wrong")
        setLoading(false)
        return true // stop
      } finally {
        inFlightRef.current = false
      }
    }

    ;(async () => {
      const stop = await tick()
      if (stop) return
      interval = setInterval(async () => {
        const stopNow = await tick()
        if (stopNow) clearInterval(interval)
      }, 3000)
    })()

    return () => interval && clearInterval(interval)
  }, [reference])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p className="text-lg text-gray-300">{statusMessage}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4 bg-black text-white px-6 text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#75240E] text-white rounded hover:bg-[#D55605] transition"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p className="text-gray-300">No ticket found.</p>
      </div>
    )
  }

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(ticket.bookingRef)
    } catch {}
  }

  const qrValue = ticket.ticketNumber || ticket.bookingRef

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4 md:px-8 bg-black text-white min-h-screen">
      <div className="text-center mb-8">
        <FiCheckCircle className="mx-auto text-[#75240E] w-16 h-16" />
        <h1 className="text-4xl font-bold text-[#D55605] mt-4">Booking Confirmed!</h1>
        <p className="mt-2 text-gray-300">Your booking has been successfully processed. 🎉</p>
      </div>

      <div className="bg-[#1a1a1a] shadow-lg rounded-xl p-6 space-y-4 border border-gray-700">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Guest:</p>
          <p>
            {ticket.guestName} ({ticket.email})
          </p>
        </div>

        <div className="flex justify-between items-center gap-3">
          <p className="font-semibold flex items-center gap-2">
            <FiFileText className="text-[#75240E]" /> Booking Ref:
          </p>
          <p className="truncate">{ticket.bookingRef}</p>
          <button onClick={copyRef} className="text-sm text-[#D55605] hover:underline">
            Copy
          </button>
        </div>

        <div className="flex justify-between items-center">
          <p className="font-semibold flex items-center gap-2">
            <FiFileText className="text-[#75240E]" /> Ticket Number:
          </p>
          <p>{ticket.ticketNumber ?? "TBA"}</p>
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
          <p>{ticket.emailSentAt ? new Date(ticket.emailSentAt).toLocaleString() : "Pending"}</p>
        </div>

        <div className="mt-6 border border-dashed border-gray-600 rounded-xl p-6 bg-[#121212] space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-400 uppercase tracking-wide">Official Booking Ticket</p>
              <p className="text-xl font-bold text-[#D55605]">
                {ticket.ticketNumber ? `Ticket #${ticket.ticketNumber}` : "Ticket #TBA"}
              </p>
              <p className="text-gray-300">{ticket.guestName}</p>
              <p className="text-gray-400 text-sm">
                {new Date(ticket.checkIn).toDateString()} → {new Date(ticket.checkOut).toDateString()}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <QRCodeCanvas value={qrValue} size={120} />
            </div>
          </div>

          {ticket.ticketPdfUrl && (
            <div className="flex flex-col md:flex-row gap-3">
              <a
                href={ticket.ticketPdfUrl}
                target="_blank"
                rel="noreferrer"
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
          )}
        </div>
      </div>
    </div>
  )
}