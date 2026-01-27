/*
'use client'

import { useState, useEffect } from "react"
import { calculateNights } from "@/lib/date"
import { formatNaira } from "@/lib/utils"

const VAT_RATE = 0.075
const TRANSACTION_RATE = 0.0025

interface SuiteBookingFormProps {
  suite: {
    id: string
    name: string
    price: number // kobo per night
  }
}

export default function SuiteBookingForm({ suite }: SuiteBookingFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    checkIn: "",
    checkOut: "",
    chaletCount: 1,
    acceptedTerms: false,
    hasDownloadedPrivacy: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState(suite.price)

  useEffect(() => {
    if (!form.checkIn || !form.checkOut) return

    const nights = calculateNights(form.checkIn, form.checkOut)
    const base = nights * suite.price * form.chaletCount
    const vat = base * VAT_RATE
    const transactionFee = base * TRANSACTION_RATE

    setTotalPrice(base + vat + transactionFee)
  }, [form.checkIn, form.checkOut, form.chaletCount, suite.price])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target
    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value

    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePrivacyDownload = () => {
    const link = document.createElement("a")
    link.href = "/docs/privacy-policy.pdf"
    link.download = "Privacy-Policy.pdf"
    link.click()
    setForm(prev => ({ ...prev, hasDownloadedPrivacy: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.acceptedTerms) {
      setError("You must accept the privacy policy.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suiteId: suite.id,
          chaletCount: Number(form.chaletCount),
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          checkInDate: form.checkIn,
          checkOutDate: form.checkOut,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      window.location.href = data.authorizationUrl
    } catch (err: any) {
      setError(err.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-8 rounded-xl max-w-md mx-auto space-y-4 text-white"
    >
      <h2 className="text-2xl font-bold mb-4">{suite.name}</h2>

      {error && <p className="text-red-500 font-medium">{error}</p>}

      <div className="flex flex-col space-y-2">
        <label className="font-medium">Full Name</label>
        <input
          name="name"
          placeholder="Enter your full name"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium">Phone</label>
        <input
          name="phone"
          type="tel"
          placeholder="08012345678"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium">Check-In</label>
        <input
          type="date"
          name="checkIn"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium">Check-Out</label>
        <input
          type="date"
          name="checkOut"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium">Number of Chalets</label>
        <input
          type="number"
          name="chaletCount"
          min={1}
          value={form.chaletCount}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      <button
        type="button"
        onClick={handlePrivacyDownload}
        className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-medium"
      >
        Download Privacy Policy
      </button>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="acceptedTerms"
          disabled={!form.hasDownloadedPrivacy}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <label>I have read and accept the privacy policy</label>
      </div>

      <button
        type="submit"
        disabled={!form.acceptedTerms || loading}
        className={`w-full p-3 rounded font-bold ${
          !form.acceptedTerms || loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Processing..." : `Book Now – ${formatNaira(totalPrice)}`}
      </button>
    </form>
  )
}
*/

/*


'use client'

import { useState, useEffect } from "react"
import { calculateNights } from "@/lib/date"
import { formatNaira } from "@/lib/utils"

const VAT_RATE = 0.075
const TRANSACTION_RATE = 0.0025

interface SuiteBookingFormProps {
  suite: {
    id: string
    name: string
    price: number // kobo per night
  }
}

export default function SuiteBookingForm({ suite }: SuiteBookingFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    checkIn: "",
    checkOut: "",
    chaletCount: 1,
    acceptedTerms: false,
    hasDownloadedPrivacy: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState(suite.price)

  useEffect(() => {
    if (!form.checkIn || !form.checkOut) return

    const nights = calculateNights(form.checkIn, form.checkOut)
    const base = nights * suite.price * form.chaletCount
    const vat = base * VAT_RATE
    const transactionFee = base * TRANSACTION_RATE

    setTotalPrice(base + vat + transactionFee)
  }, [form.checkIn, form.checkOut, form.chaletCount, suite.price])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target
    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value

    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePrivacyDownload = () => {
    const link = document.createElement("a")
    link.href = "/docs/privacy-policy.pdf"
    link.download = "Privacy-Policy.pdf"
    link.click()
    setForm(prev => ({ ...prev, hasDownloadedPrivacy: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.acceptedTerms) {
      setError("You must accept the privacy policy.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suiteId: suite.id,
          chaletCount: Number(form.chaletCount),
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          checkInDate: form.checkIn,
          checkOutDate: form.checkOut,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      window.location.href = data.authorizationUrl
    } catch (err: any) {
      setError(err.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black p-8 rounded-xl max-w-md mx-auto space-y-4 text-white"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">{suite.name}</h2>

      {error && <p className="text-red-500 font-medium">{error}</p>}

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Full Name</label>
        <input
          name="name"
          placeholder="Enter your full name"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Phone</label>
        <input
          name="phone"
          type="tel"
          placeholder="08012345678"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Check-In</label>
        <input
          type="date"
          name="checkIn"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Check-Out</label>
        <input
          type="date"
          name="checkOut"
          onChange={handleChange}
          required
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Number of Chalets</label>
        <input
          type="number"
          name="chaletCount"
          min={1}
          value={form.chaletCount}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      <button
        type="button"
        onClick={handlePrivacyDownload}
        className="bg-[#75240E] hover:bg-[#D55605] p-2 rounded font-medium w-full"
      >
        Download Privacy Policy
      </button>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="acceptedTerms"
          disabled={!form.hasDownloadedPrivacy}
          onChange={handleChange}
          className="w-4 h-4 accent-[#D55605]"
        />
        <label className="text-white">I have read and accept the privacy policy</label>
      </div>

      <button
        type="submit"
        disabled={!form.acceptedTerms || loading}
        className={`w-full p-3 rounded font-bold ${
          !form.acceptedTerms || loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-[#75240E] hover:bg-[#D55605]"
        }`}
      >
        {loading ? "Processing..." : `Book Now – ${formatNaira(totalPrice)}`}
      </button>
    </form>
  )
}
*/

'use client'

import { useState, useEffect } from "react"
import { calculateNights } from "@/lib/date"
import { formatNaira } from "@/lib/utils"

const VAT_RATE = 0.075
const TRANSACTION_RATE = 0.0025

interface SuiteBookingFormProps {
  suite: {
    id: string
    name: string
    price: number // kobo per night
  }
}

export default function SuiteBookingForm({ suite }: SuiteBookingFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    checkIn: "",
    checkOut: "",
    chaletCount: 1,
    acceptedTerms: false,
    hasDownloadedPrivacy: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [privacyAvailable, setPrivacyAvailable] = useState(false)

  const [breakdown, setBreakdown] = useState({
    base: suite.price,
    vat: 0,
    transactionFee: 0,
    total: suite.price
  })

  // Check if privacy file exists
  useEffect(() => {
    const checkFile = async () => {
      try {
        const res = await fetch("/docs/privacy-policy.pdf", { method: "HEAD" })
        if (res.ok) setPrivacyAvailable(true)
      } catch {
        setPrivacyAvailable(false)
      }
    }
    checkFile()
  }, [])

  // Calculate total and breakdown whenever relevant fields change
  useEffect(() => {
    if (!form.checkIn || !form.checkOut) return
    const nights = calculateNights(form.checkIn, form.checkOut)
    const base = nights * suite.price * form.chaletCount
    const vat = base * VAT_RATE
    const transactionFee = base * TRANSACTION_RATE
    const total = base + vat + transactionFee
    setBreakdown({ base, vat, transactionFee, total })
  }, [form.checkIn, form.checkOut, form.chaletCount, suite.price])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target
    const value = type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePrivacyDownload = () => {
    if (!privacyAvailable) return
    const link = document.createElement("a")
    link.href = "/docs/privacy-policy.pdf"
    link.download = "Privacy-Policy.pdf"
    link.click()
    setForm(prev => ({ ...prev, hasDownloadedPrivacy: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.acceptedTerms) {
      setError("You must accept the privacy policy.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suiteId: suite.id,
          chaletCount: Number(form.chaletCount),
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          checkInDate: form.checkIn,
          checkOutDate: form.checkOut,
          amount: Math.round(breakdown.total), // ✅ send total including VAT & fees
          vat: Math.round(breakdown.vat),
          transactionFee: Math.round(breakdown.transactionFee)
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.authorizationUrl
    } catch (err: any) {
      setError(err.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="bg-black p-8 rounded-xl max-w-md mx-auto space-y-4 text-white" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4 text-white">{suite.name}</h2>
      {error && <p className="text-red-500 font-medium">{error}</p>}

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Full Name</label>
        <input name="name" placeholder="Enter your full name" onChange={handleChange} required
          className="p-2 rounded bg-[#1a1a1a] border border-[#333] text-white" />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Email</label>
        <input name="email" type="email" placeholder="Enter your email" onChange={handleChange} required
          className="p-2 rounded bg-[#1a1a1a] border border-[#333] text-white" />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Phone</label>
        <input name="phone" type="tel" placeholder="08012345678" onChange={handleChange} required
          className="p-2 rounded bg-[#1a1a1a] border border-[#333] text-white" />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Check-In</label>
        <input type="date" name="checkIn" onChange={handleChange} required
          className="p-2 rounded bg-[#1a1a1a] border border-[#333] text-white" />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Check-Out</label>
        <input type="date" name="checkOut" onChange={handleChange} required
          className="p-2 rounded bg-[#1a1a1a] border border-[#333] text-white" />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="font-medium text-white">Number of Chalets</label>
        <input type="number" name="chaletCount" min={1} value={form.chaletCount} onChange={handleChange}
          className="p-2 rounded bg-[#1a1a1a] border border-[#333] text-white" />
      </div>

      <button type="button" onClick={handlePrivacyDownload}
        disabled={!privacyAvailable}
        className={`w-full p-2 rounded font-medium ${privacyAvailable ? 'bg-[#75240E] hover:bg-[#D55605]' : 'bg-gray-600 cursor-not-allowed'}`}>
        {privacyAvailable ? "Download Privacy Policy" : "Privacy Policy Not Available"}
      </button>

      <div className="flex items-center space-x-2">
        <input type="checkbox" name="acceptedTerms" disabled={!form.hasDownloadedPrivacy} onChange={handleChange} className="w-4 h-4 accent-[#D55605]" />
        <label className="text-white">I have read and accept the privacy policy</label>
      </div>

      {/* Price breakdown */}
      <div className="bg-[#1a1a1a] p-4 rounded space-y-1">
        <p>Base Price: {formatNaira(breakdown.base)}</p>
        <p>VAT ({VAT_RATE * 100}%): {formatNaira(breakdown.vat)}</p>
        <p>Transaction Fee ({TRANSACTION_RATE * 100}%): {formatNaira(breakdown.transactionFee)}</p>
        <p className="font-bold text-xl">Total: {formatNaira(breakdown.total)}</p>
      </div>

      <button type="submit"
        disabled={!form.acceptedTerms || loading}
        className={`w-full p-3 rounded font-bold ${!form.acceptedTerms || loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#75240E] hover:bg-[#D55605]'}`}>
        {loading ? "Processing..." : `Book Now – ${formatNaira(breakdown.total)}`}
      </button>
    </form>
  )
}
