import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Total revenue
    const totalRevenue = await prisma.booking.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { suite: { price: true } }, // Price stored in suite relation
    })

    // Revenue per suite
    const revenuePerSuite = await prisma.suite.findMany({
      select: {
        id: true,
        name: true,
        bookings: {
          where: { paymentStatus: "PAID" },
          select: { price: true },
        },
      },
    })

    const suiteRevenue = revenuePerSuite.map((s) => ({
      name: s.name,
      revenue: s.bookings.reduce((acc, b) => acc + b.price, 0),
    }))

    // Payment status breakdown
    const paymentCounts = await prisma.booking.groupBy({
      by: ["paymentStatus"],
      _count: { ticketNumber: true },
    })

    return NextResponse.json({ totalRevenue: totalRevenue._sum.suite?.price || 0, suiteRevenue, paymentCounts })
  } catch (err: any) {
    console.error("Error fetching revenue data:", err)
    return NextResponse.json({ error: "Failed to fetch revenue data." }, { status: 500 })
  }
}
