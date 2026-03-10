// app/api/staff/settings/me/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    })

    if (!user || user.role !== "CHECKIN_STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Mock active sessions for now; extend with real session tracking if needed
    const sessions = [
      { id: "1", device: "Chrome on Windows", lastLogin: new Date() },
      { id: "2", device: "Mobile Safari", lastLogin: new Date() },
    ]

    return NextResponse.json({
      name: user.name,
      email: user.email,
      preferences: {
        showTodayOnlyBookings: user.preferences?.showTodayOnlyBookings ?? true,
        autoFocusRoomInput: user.preferences?.autoFocusRoomInput ?? true,
        confirmBeforeCheckout: user.preferences?.confirmBeforeCheckout ?? true,
        notifyCheckInSuccess: user.preferences?.notifyCheckInSuccess ?? true,
        notifyVIPGuest: user.preferences?.notifyVIPGuest ?? true,
      },
      sessions,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
