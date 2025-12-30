import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const suites = await prisma.suite.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return NextResponse.json(
    suites.map(s => ({
      id: s.id,
      suite: s.name,
      status:
        s.status === "AVAILABLE"
          ? "Completed"
          : s.status === "OCCUPIED"
          ? "Pending"
          : "Maintenance",
    }))
  )
}
