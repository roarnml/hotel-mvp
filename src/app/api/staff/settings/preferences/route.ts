// app/api/staff/settings/preferences/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.role !== "CHECKIN_STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const prefs = await req.json()

    // Upsert preferences
    const updated = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: prefs,
      create: { userId: user.id, ...prefs },
    })

    return NextResponse.json({ message: "Preferences saved", preferences: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
