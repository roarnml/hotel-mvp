import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
      canEditProfile: true,
    },
  })

  if (!user) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}
