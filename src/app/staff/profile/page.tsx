// File: src/app/staff/profile/page.tsx
"use client"

import { useEffect, useState } from "react"
//import { prisma } from "@/lib/prisma"
import { FiUser, FiMail, FiPhone } from "react-icons/fi"

interface StaffProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

export default function StaffProfilePage() {
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/staff/profile")
        const data = await res.json()
        setProfile(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) return <p className="p-4">Loading profile...</p>
  if (!profile) return <p className="p-4 text-red-500">Profile not found</p>

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Staff Profile</h1>
      <div className="flex items-center gap-2 mb-2">
        <FiUser />
        <span>{profile.name}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <FiMail />
        <span>{profile.email}</span>
      </div>
      {profile.phone && (
        <div className="flex items-center gap-2 mb-2">
          <FiPhone />
          <span>{profile.phone}</span>
        </div>
      )}
      <div className="mt-4">
        <strong>Role:</strong> {profile.role}
      </div>
    </div>
  )
}
