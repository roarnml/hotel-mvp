import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // For MVP, fetch first staff record, in real app: fetch logged-in user
    const staff = await prisma.user.findFirst()
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 })

    return NextResponse.json(staff)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
