// app/api/staff/settings/profile/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.role !== "CHECKIN_STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { name, email } = body

    if (!name || !email) return NextResponse.json({ error: "Name & email required" }, { status: 400 })

    // Optional: check if email is unique
    const emailTaken = await prisma.user.findUnique({ where: { email } })
    if (emailTaken && emailTaken.id !== user.id) return NextResponse.json({ error: "Email already in use" }, { status: 400 })

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
    })

    return NextResponse.json({ message: "Profile updated", user: { name: updated.name, email: updated.email } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
