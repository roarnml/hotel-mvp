import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const suites = await prisma.suite.findMany({
      where: {
        isActive: true,              // suite is usable
        status: "AVAILABLE",         // not occupied or under maintenance
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(suites)
  } catch (error) {
    console.error("Failed to fetch available suites:", error)
    return NextResponse.json(
      { error: "Failed to fetch available suites" },
      { status: 500 }
    )
  }
}
