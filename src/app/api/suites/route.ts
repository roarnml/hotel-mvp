import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const suites = await prisma.suite.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: "asc",
      },
    })

    return NextResponse.json(
      {
        data: suites,
        meta: {
          count: suites.length,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  } catch (err) {
    console.error("Error fetching suites:", err)

    return NextResponse.json(
      { error: "Failed to fetch suites" },
      { status: 500 }
    )
  }
}
