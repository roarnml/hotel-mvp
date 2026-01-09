// app/api/staff/settings/password/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import bcrypt from "bcrypt"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.role !== "CHECKIN_STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { current, new: newPassword } = await req.json()
    if (!current || !newPassword) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    // Verify current password
    const valid = await bcrypt.compare(current, user.password)
    if (!valid) return NextResponse.json({ error: "Current password incorrect" }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

    return NextResponse.json({ message: "Password changed successfully" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
