"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface BookingFormProps {
  suiteId: string
  suiteName: string
  price: number
}

export default function BookingForm({ suiteId, suiteName, price }: BookingFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    checkInDate: "",
    checkOutDate: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, suiteId })
      })

      const data = await res.json()

      if (!res.ok || !data.url) throw new Error(data.error || "Checkout creation failed")

      router.push(data.url) // Redirect to Stripe Checkout
    } catch (err: any) {
      console.error("Booking API error:", err)
      setError("Something went wrong. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold">{suiteName} Booking</h2>
      <input
        name="fullName"
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        name="checkInDate"
        type="date"
        value={formData.checkInDate}
        onChange={handleChange}
        required
        className="input"
      />
      <input
        name="checkOutDate"
        type="date"
        value={formData.checkOutDate}
        onChange={handleChange}
        required
        className="input"
      />
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? "Processing..." : `Pay ₦${price / 100}`}
      </button>
    </form>
  )
}
