"use client"

import { useState, useEffect } from "react"
import { Booking, Suite } from "@/lib/types" // Import types from your Prisma/DB types

interface Props {
  open: boolean
  guestName?: string
  suites: Suite[]
  loading?: boolean
  onCancel: () => void
  onConfirm: (suiteId: string) => Promise<void>
}

export default function ConfirmCheckInModal({
  open,
  guestName,
  suites,
  loading: externalLoading,
  onCancel,
  onConfirm,
}: Props) {
  const [suiteId, setSuiteId] = useState("")
  const [loading, setLoading] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) setSuiteId("")
  }, [open])

  if (!open) return null

  const handleConfirm = async () => {
    if (!suiteId) return
    setLoading(true)
    try {
      await onConfirm(suiteId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center transition-opacity">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg transform transition-transform scale-95 animate-scale-in">
        <h3 className="text-lg font-semibold text-gray-900">Confirm Check-in</h3>

        <p className="text-sm text-gray-600">
          Check in <strong>{guestName}</strong>?
        </p>

        <select
          value={suiteId}
          onChange={e => setSuiteId(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D55605]"
          disabled={loading || externalLoading}
        >
          <option value="">Assign room</option>
          {suites.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            disabled={loading || externalLoading}
            className="px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!suiteId || loading || externalLoading}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
