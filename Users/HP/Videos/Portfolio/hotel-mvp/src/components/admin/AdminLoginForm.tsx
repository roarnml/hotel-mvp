"use client"

import { getSession } from "next-auth/react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError(res.error)
      } else if (res?.ok) {
        // Fetch session to get the role
        const session = await getSession()
        const role = session?.user?.role

        switch (role) {
          case "STAFF":
            router.push("/staff")
            break
          case "ADMIN":
            router.push("/admin/dashboard")
            break
          case "SUPER_USER":
            router.push("/super/dashboard")
            break
          default:
            router.push("/")
        }
      }
    } catch (err) {
      setError("Unexpected error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/20 rounded-3xl p-10 flex flex-col gap-6 shadow-xl text-white"
    >
      <h1 className="text-3xl font-bold text-center mb-4">GrandStay Portal</h1>
      <p className="text-center text-gray-200 mb-6">Secure access for authorized users only</p>

      {error && (
        <p className="bg-red-600/30 text-red-100 p-2 rounded text-center text-sm animate-pulse">
          {error}
        </p>
      )}

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-4 rounded-xl bg-white/20 border border-white/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full py-4 rounded-xl bg-[#D55605] hover:bg-transparent hover:border-2 hover:border-[#75240E] transition text-lg font-semibold flex justify-center items-center gap-2"
      >
        {loading ? (
          <span className="animate-pulse">Signing in…</span>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="text-center text-gray-300 text-sm mt-4">
        Need help? Contact IT support.
      </p>
    </form>
  )
}
