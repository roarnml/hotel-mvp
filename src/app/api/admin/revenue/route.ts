import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch all paid bookings including suite price
    const bookings = await prisma.booking.findMany({
      where: { paymentStatus: "SUCCESS" },
      include: { suite: { select: { price: true, name: true } } },
    })

    // Total revenue
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.suite.price ?? 0), 0)

    // Revenue per suite
    const revenueMap: Record<string, number> = {}
    bookings.forEach((b) => {
      const suiteName = b.suite.name
      revenueMap[suiteName] = (revenueMap[suiteName] || 0) + (b.suite.price ?? 0)
    })
    const suiteRevenue = Object.entries(revenueMap).map(([name, revenue]) => ({ name, revenue }))

    // Payment status breakdown
    const paymentCountsRaw = await prisma.booking.groupBy({
      by: ["paymentStatus"],
      _count: { ticketNumber: true },
    })
    const paymentCounts = paymentCountsRaw.map((p) => ({
      status: p.paymentStatus,
      count: p._count.ticketNumber,
    }))

    return NextResponse.json({ totalRevenue, suiteRevenue, paymentCounts })
  } catch (err: any) {
    console.error("Error fetching revenue data:", err)
    return NextResponse.json({ error: "Failed to fetch revenue data." }, { status: 500 })
  }
}
