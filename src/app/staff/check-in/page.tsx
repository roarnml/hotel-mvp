"use client"

import { useEffect, useState, useTransition } from "react"
import { FiUser } from "react-icons/fi"
import ConfirmCheckInModal from "@/components/staff/ConfirmationModal"
import { Booking, Suite } from "@/lib/types" // Strongly typed imports

interface CheckInGuest {
  id: string
  guestName: string
  suite?: Suite
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
}

async function checkInGuestClient(bookingId: string, suiteId: string) {
  const res = await fetch("/api/staff/check-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, suiteId }),
  })

  if (!res.ok) throw new Error("Check-in failed")
}

async function checkoutGuest(bookingId: string, suiteId: string) {
  const res = await fetch("/api/staff/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, suiteId }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error || "Checkout failed")
  }

  return res.json()
}

function queueOfflineAction(action: any) {
  const q = JSON.parse(localStorage.getItem("offlineQueue") || "[]")
  q.push(action)
  localStorage.setItem("offlineQueue", JSON.stringify(q))
}

export default function StaffCheckInPage() {
  const [guests, setGuests] = useState<CheckInGuest[]>([])
  const [suites, setSuites] = useState<Suite[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [selectedGuest, setSelectedGuest] = useState<CheckInGuest | null>(null)
  const [printDate, setPrintDate] = useState<string>("")

  useEffect(() => {
    async function load() {
      try {
        const [g, s] = await Promise.all([
          fetch("/api/staff/check-ins").then(r => r.json()),
          fetch("/api/staff/available-suites").then(r => r.json()),
        ])
        setGuests(g)
        setSuites(s)
        setPrintDate(new Date().toLocaleString())
        localStorage.setItem("checkins", JSON.stringify(g))
      } catch {
        const cached = localStorage.getItem("checkins")
        if (cached) setGuests(JSON.parse(cached))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function confirmCheckIn(suiteId: string): Promise<void> {
    if (!selectedGuest) return

    startTransition(async () => {
      try {
        await checkInGuestClient(selectedGuest.id, suiteId)

        setGuests(prev =>
          prev.map(g =>
            g.id === selectedGuest.id
              ? { ...g, status: "CHECKED_IN", suite: suites.find(s => s.id === suiteId) }
              : g
          )
        )

        window.print()
      } catch (err) {
        console.error(err)
        queueOfflineAction({ type: "CHECK_IN", bookingId: selectedGuest.id, suiteId })
      } finally {
        setSelectedGuest(null)
      }
    })
  }

  function handleCheckout(guest: CheckInGuest) {
    if (!guest.suite?.id) return alert("Cannot checkout: No suite assigned")

    startTransition(async () => {
      try {
        await checkoutGuest(guest.id, guest.suite?.id ?? "")

        setGuests(prev =>
          prev.map(g =>
            g.id === guest.id ? { ...g, status: "CHECKED_OUT" } : g
          )
        )

        alert(`${guest.guestName} checked out successfully`)
      } catch (err: any) {
        console.error(err)
        alert(err.message)
        queueOfflineAction({ type: "CHECK_OUT", bookingId: guest.id, suiteId: guest.suite?.id })
      }
    })
  }

  return (
    <div className="min-h-screen w-full bg-black p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Check-In Guests</h1>

      {loading ? (
        <div className="text-white/60">Loading…</div>
      ) : (
        <div className="space-y-4">
          {guests.map(g => (
            <div
              key={g.id}
              className="bg-neutral-900 border border-[#75240E] p-4 rounded-xl flex justify-between items-center hover:bg-neutral-800 transition"
            >
              <div className="flex items-center gap-3">
                <FiUser className="text-[#75240E] text-xl" />
                <div>
                  <div className="font-semibold text-white">{g.guestName}</div>
                  <div className="text-white/60 text-sm">{g.suite?.name ?? "Room not assigned"}</div>
                </div>
              </div>

              <div className="flex gap-2">
                {g.status === "PENDING" && (
                  <button
                    onClick={() => setSelectedGuest(g)}
                    className="px-4 py-2 rounded-lg bg-[#75240E] text-white font-medium hover:opacity-90 transition"
                  >
                    Check-in
                  </button>
                )}

                {(g.status === "CHECKED_IN" || g.status === "PENDING") && g.suite && (
                  <button
                    onClick={() => handleCheckout(g)}
                    className="px-4 py-2 rounded-lg bg-[#D55605] text-white font-medium hover:opacity-90 transition"
                  >
                    Checkout
                  </button>
                )}

                {g.status === "CHECKED_OUT" && (
                  <span className="px-3 py-1 rounded-full bg-[#D55605]/20 text-[#D55605] font-semibold text-sm">
                    Checked-out
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmCheckInModal
        open={!!selectedGuest}
        guestName={selectedGuest?.guestName}
        suites={suites}
        loading={isPending}
        onCancel={() => setSelectedGuest(null)}
        onConfirm={confirmCheckIn}
      />

      {/* Printable welcome slip */}
      <div className="hidden print:block text-black">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p>Guest: {selectedGuest?.guestName}</p>
        <p>Suite: {selectedGuest?.suite?.name ?? "Not assigned"}</p>
        <p>Date: {printDate}</p>
      </div>
    </div>
  )
}
