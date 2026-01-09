// hotel-mvp/src/components/booking/SuiteBookingForm.tsx
'use client'

import { useState, useEffect } from "react"
import { calculateNights } from "@/lib/date"
import { formatNaira } from "@/lib/utils"

interface SuiteBookingFormProps {
  suite: {
    id: string
    name: string
    price: number // per night
    description?: string
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
    acceptedTerms: false, // <-- new field
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState(suite.price)

  // Calculate total price based on number of nights
  useEffect(() => {
    if (form.checkIn && form.checkOut) {
      const diffDays = calculateNights(form.checkIn, form.checkOut)
      console.log("Calculated nights:", diffDays)
      console.log("Suite price per night:", suite.price)
      setTotalPrice(diffDays * suite.price)
    } else {
      setTotalPrice(suite.price)
    }
  }, [form.checkIn, form.checkOut, suite.price])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;
    let value: string | boolean;

    if (type === "checkbox") {
      value = (e.target as HTMLInputElement).checked;
    } else {
      value = e.target.value;
    }

    setForm({ ...form, [name]: value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const { name, email, checkIn, checkOut, acceptedTerms } = form
    if (!name || !email || !checkIn || !checkOut) {
      setError("Please fill all required fields.")
      return
    }

    if (!acceptedTerms) {
      setError("You must accept the privacy policy and terms before booking.")
      return
    }

    setLoading(true)

    try {
      console.log("Submitting booking for suite ID:", suite.id)
      console.log("Suite Price:", suite.price)
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suiteId: suite.id,
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          checkInDate: form.checkIn,
          checkOutDate: form.checkOut,
          userId: null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Booking failed")
        return
      }

      if (!data.authorizationUrl) {
        setError("Payment initialization failed")
        return
      }

      setSuccess("Redirecting to Paystack…")
      console.log("Redirecting to Paystack with URL:", data.authorizationUrl)
      console.log("Payment reference:", data.reference)
      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl
    } catch (err) {
      console.error(err)
      setError("Failed to submit booking. Try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black p-8 rounded-xl shadow-xl border border-gray-800 flex flex-col gap-4 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-white mb-4">{suite.name} Booking</h2>

      {error && <p className="text-red-600 font-medium">{error}</p>}
      {success && <p className="text-green-500 font-medium">{success}</p>}

      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Full Name*"
        className="p-3 rounded-lg bg-[#D55605]/20 placeholder-white text-white border border-[#D55605] focus:outline-none focus:ring-2 focus:ring-[#D55605]"
        required
      />

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email*"
        className="p-3 rounded-lg bg-[#D55605]/20 placeholder-white text-white border border-[#D55605] focus:outline-none focus:ring-2 focus:ring-[#D55605]"
        required
      />

      <input
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Phone"
        className="p-3 rounded-lg bg-[#D55605]/20 placeholder-white text-white border border-[#D55605] focus:outline-none focus:ring-2 focus:ring-[#D55605]"
      />

      <textarea
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="Address"
        className="p-3 rounded-lg bg-[#D55605]/20 placeholder-white text-white border border-[#D55605] focus:outline-none focus:ring-2 focus:ring-[#D55605] resize-none"
        rows={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          name="checkIn"
          value={form.checkIn}
          onChange={handleChange}
          className="p-3 rounded-lg bg-[#D55605]/20 text-white border border-[#D55605] focus:outline-none focus:ring-2 focus:ring-[#D55605]"
          required
        />
        <input
          type="date"
          name="checkOut"
          value={form.checkOut}
          onChange={handleChange}
          className="p-3 rounded-lg bg-[#D55605]/20 text-white border border-[#D55605] focus:outline-none focus:ring-2 focus:ring-[#D55605]"
          required
        />
      </div>

      {/* -------------------- TERMS & PRIVACY -------------------- */}
      <label className="flex items-start gap-3 mt-2 text-white text-sm">
        <input
          type="checkbox"
          name="acceptedTerms"
          checked={form.acceptedTerms}
          onChange={handleChange}
          className="mt-1 accent-[#D55605] w-4 h-4"
          required
        />
        I have read and agree to the{" "}
        <a href="/privacy" className="underline text-[#D55605]" target="_blank">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="/terms" className="underline text-[#D55605]" target="_blank">
          Terms & Conditions
        </a>
        .
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 py-3 rounded-lg bg-[#75240E] text-white font-semibold hover:bg-[#D55605] transition-all shadow-lg"
      >
        {loading
          ? "Processing..."
          : `Book Now - ${formatNaira(totalPrice).toLocaleString()}`}
      </button>
    </form>
  )
}
