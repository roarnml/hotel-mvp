"use client"

import { useState, useEffect } from "react"
import { FiLock, FiMail, FiUser, FiBell, FiInfo } from "react-icons/fi"

const COLORS = {
  bg: "#000000",
  primary: "#D55605",
  accent: "#75240E",
  text: "#FFFFFF",
}

export default function StaffSettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "" })
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [prefs, setPrefs] = useState({
    showTodayOnlyBookings: true,
    autoFocusRoomInput: true,
    confirmBeforeCheckout: true,
    notifyCheckInSuccess: true,
    notifyVIPGuest: true,
  })
  const [sessions, setSessions] = useState<{ id: string, device: string, lastLogin: string }[]>([])

  // Fetch profile, prefs, sessions
  useEffect(() => {
    fetch("/api/staff/settings/me")
      .then((res) => res.json())
      .then((data) => {
        setProfile({ name: data.name, email: data.email })
        setPrefs(data.preferences)
        setSessions(data.sessions)
      })
      .catch(console.error)
  }, [])

  // Update profile
  async function handleProfileSave() {
    const res = await fetch("/api/staff/settings/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    })
    if (res.ok) alert("Profile updated")
  }

  // Change password
  async function handlePasswordChange() {
    if (passwords.new !== passwords.confirm) {
      alert("New password and confirm do not match")
      return
    }
    const res = await fetch("/api/staff/settings/password", {
      method: "POST",
      body: JSON.stringify(passwords),
    })
    if (res.ok) alert("Password changed")
  }

  // Save preferences
  async function handlePrefsSave() {
    const res = await fetch("/api/staff/settings/preferences", {
      method: "POST",
      body: JSON.stringify(prefs),
    })
    if (res.ok) alert("Preferences saved")
  }

  return (
    <main className="p-6 space-y-8 min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
        Settings
      </h1>

      {/* ===== PROFILE ===== */}
      <section className="rounded-xl border border-[#75240E] p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>Profile</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <FiUser /> Name
            </label>
            <input
              className="w-full px-3 py-2 rounded border border-[#75240E] bg-[#111] text-white"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <FiMail /> Email
            </label>
            <input
              className="w-full px-3 py-2 rounded border border-[#75240E] bg-[#111] text-white"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <button
            onClick={handleProfileSave}
            className="px-4 py-2 rounded font-semibold"
            style={{ backgroundColor: COLORS.accent, color: COLORS.text }}
          >
            Save Profile
          </button>
        </div>
      </section>

      {/* ===== PASSWORD ===== */}
      <section className="rounded-xl border border-[#75240E] p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>Password</h2>
        <div className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-3 py-2 rounded border border-[#75240E] bg-[#111] text-white"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-3 py-2 rounded border border-[#75240E] bg-[#111] text-white"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full px-3 py-2 rounded border border-[#75240E] bg-[#111] text-white"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
          <button
            onClick={handlePasswordChange}
            className="px-4 py-2 rounded font-semibold"
            style={{ backgroundColor: COLORS.accent, color: COLORS.text }}
          >
            Change Password
          </button>
        </div>
      </section>

      {/* ===== PREFERENCES ===== */}
      <section className="rounded-xl border border-[#75240E] p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>Work Preferences</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(prefs).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                className="accent-[#D55605]"
              />
              {key.replace(/([A-Z])/g, " $1")}
            </label>
          ))}
          <button
            onClick={handlePrefsSave}
            className="px-4 py-2 rounded font-semibold"
            style={{ backgroundColor: COLORS.accent, color: COLORS.text }}
          >
            Save Preferences
          </button>
        </div>
      </section>

      {/* ===== SESSIONS ===== */}
      <section className="rounded-xl border border-[#75240E] p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>Active Sessions</h2>
        {sessions.length === 0 && <p className="text-gray-400">No active sessions.</p>}
        {sessions.map((s) => (
          <div key={s.id} className="flex justify-between items-center px-3 py-2 rounded border border-[#75240E] bg-[#111]">
            <span>{s.device}</span>
            <span className="text-gray-400 text-xs">{new Date(s.lastLogin).toLocaleString()}</span>
          </div>
        ))}
      </section>

      {/* ===== HELP ===== */}
      <section className="rounded-xl border border-[#75240E] p-6 shadow-lg space-y-2">
        <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>Help / SOP</h2>
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>How Check-In Works</li>
          <li>What to do if payment isn’t PAID</li>
          <li>VIP handling rules</li>
          <li>Emergency contact: Manager / Owner</li>
        </ul>
      </section>
    </main>
  )
}
