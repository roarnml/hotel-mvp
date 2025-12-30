import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
    })
    return NextResponse.json({ users })
  } catch (err: any) {
    console.error("Error fetching users:", err)
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, role } = await req.json()
    if (!fullName || !email || !password || !role) throw new Error("Missing fields")

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { fullName, email, password: hashed, role },
    })

    return NextResponse.json({ user })
  } catch (err: any) {
    console.error("Error creating user:", err)
    return NextResponse.json({ error: "Failed to create user." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, fullName, email, role, isActive } = await req.json()
    if (!id) throw new Error("User ID is required")

    const updated = await prisma.user.update({
      where: { id },
      data: { fullName, email, role, isActive },
    })

    return NextResponse.json({ user: updated })
  } catch (err: any) {
    console.error("Error updating user:", err)
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) throw new Error("User ID is required")

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Error deleting user:", err)
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 })
  }
}
