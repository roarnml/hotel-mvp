import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const suites = await prisma.suite.findMany({
      where: {
        isActive: true, // future-proof: hide unpublished suites
      },
      orderBy: {
        price: "asc", // luxury = calm, predictable ordering
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        capacity: true,
        // optional future fields
        // sizeSqm: true,
        // amenities: true,
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
          // Edge + CDN friendly
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  } catch (err) {
    console.error("Error fetching suites:", err)

    return NextResponse.json(
      {
        error: "Failed to fetch suites",
      },
      { status: 500 }
    )
  }
}
