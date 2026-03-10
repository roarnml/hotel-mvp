"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"

interface Suite {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  capacity: number
}

export default function SuiteBookingPage() {
  const searchParams = useSearchParams()
  const suiteIdFromQuery = searchParams.get("suiteId") || ""

  const [suite, setSuite] = useState<Suite | null>(null)
  const [suites, setSuites] = useState<Suite[]>([])
  const [loadingSuite, setLoadingSuite] = useState(false)
  const [loadingSuitesList, setLoadingSuitesList] = useState(false)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    checkInDate: "",
    checkOutDate: "",
  })

  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -------------------- FETCH SINGLE SUITE --------------------
  useEffect(() => {
    if (!suiteIdFromQuery) return
    setLoadingSuite(true)

    async function fetchSuite() {
      try {
        const res = await fetch(`/api/suites/${suiteIdFromQuery}`)
        const data = await res.json()

        if (!res.ok) throw new Error("Suite not found")
        setSuite(data)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch suite details.")
      } finally {
        setLoadingSuite(false)
      }
    }

    fetchSuite()
  }, [suiteIdFromQuery])

  // -------------------- FETCH ALL SUITES --------------------
  useEffect(() => {
    if (suiteIdFromQuery) return
    setLoadingSuitesList(true)

    async function fetchSuites() {
      try {
        const res = await fetch("/api/suites")
        const data = await res.json()

        if (!res.ok) throw new Error("Failed to fetch suites")
        setSuites(data.data)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch suites.")
      } finally {
        setLoadingSuitesList(false)
      }
    }

    fetchSuites()
  }, [suiteIdFromQuery])

  // -------------------- FORM HANDLERS --------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!suite) return

    setLoadingSubmit(true)
    setError(null)

    const checkIn = new Date(form.checkInDate)
    const checkOut = new Date(form.checkOutDate)

    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in.")
      setLoadingSubmit(false)
      return
    }

    try {
      /**
       * 🔑 THIS IS THE KEY CHANGE
       * We initialize payment instead of creating a final booking
       */
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          suiteId: suite.id,
          checkInDate: form.checkInDate,
          checkOutDate: form.checkOutDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Payment initialization failed")
      }

      /**
       * 🚀 Redirect to Paystack Checkout
       * Backend returns authorization_url
       */
      window.location.href = data.authorization_url
    } catch (err: any) {
      console.error("Payment init error:", err)
      setError(err.message || "Something went wrong.")
      setLoadingSubmit(false)
    }
  }

  // -------------------- RENDER STATES --------------------
  if (loadingSuite || loadingSuitesList)
    return <p className="text-center mt-10">Loading...</p>

  if (!suiteIdFromQuery && suites.length === 0)
    return <p className="text-center mt-10">No suites available.</p>

  // -------------------- SUITE PICKER --------------------
  if (!suiteIdFromQuery)
    return (
      <div className="max-w-7xl mx-auto mt-12 px-4 md:px-8 grid md:grid-cols-3 gap-6">
        {suites.map((s) => (
          <div
            key={s.id}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col"
          >
            <div className="h-48 overflow-hidden rounded-lg mb-2">
              {s.images[0] && (
                <img
                  src={s.images[0]}
                  alt={s.name}
                  className="w-full h-full object-cover hover:scale-105 transition"
                />
              )}
            </div>

            <h3 className="text-lg font-semibold">{s.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {s.description}
            </p>
            <p className="mt-2 font-semibold">
              ₦{s.price.toLocaleString()}
            </p>

            <button
              onClick={() => setSuite(s)}
              className="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    )

  // -------------------- FALLBACK --------------------
  if (!suite) return <p className="text-center mt-10">Suite not found.</p>

  // -------------------- MAIN BOOKING VIEW --------------------
  return (
    <div className="max-w-7xl mx-auto mt-12 px-4 md:px-8 grid md:grid-cols-2 gap-8">
      {/* SUITE DETAILS */}
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">{suite.name}</h1>
        <p className="text-gray-700">{suite.description}</p>

        <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow">
          {suite.images.length > 0 ? (
            <Carousel
              showThumbs={false}
              showStatus={false}
              infiniteLoop
              autoPlay
              interval={5000}
            >
              {suite.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${suite.name} ${idx + 1}`}
                  className="object-cover"
                />
              ))}
            </Carousel>
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              Image coming soon
            </div>
          )}
        </div>

        <div className="flex space-x-4 text-gray-600">
          <p>Capacity: {suite.capacity} guests</p>
          <p>Price: ₦{suite.price.toLocaleString()} / night</p>
        </div>
      </div>

      {/* BOOKING FORM */}
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-semibold mb-4">Book This Suite</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border px-4 py-2 rounded"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="checkInDate"
              value={form.checkInDate}
              onChange={handleChange}
              required
              className="border px-4 py-2 rounded"
            />
            <input
              type="date"
              name="checkOutDate"
              value={form.checkOutDate}
              onChange={handleChange}
              required
              className="border px-4 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loadingSubmit}
            className="bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700"
          >
            {loadingSubmit
              ? "Redirecting to payment..."
              : `Proceed to Payment – ₦${suite.price.toLocaleString()}`}
          </button>
        </form>

        {error && (
          <p className="text-red-600 mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}
