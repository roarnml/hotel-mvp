// /app/api/staff/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, suiteId } = body as { bookingId: string; suiteId: string };

    if (!bookingId || !suiteId) {
      return NextResponse.json({ error: "bookingId and suiteId are required" }, { status: 400 });
    }

    // Transaction ensures all-or-nothing
    const [updatedBooking, updatedSuite, housekeepingTask] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CHECKED_OUT" }, // Use your enum value
      }),
      prisma.suite.update({
        where: { id: suiteId },
        data: { status: "OCCUPIED" }, // Room is dirty, needs cleaning
      }),
      prisma.housekeepingTask.create({
        data: {
          suiteId,
          status: "PENDING",  // Auto-create housekeeping task
        },
      }),
    ]);

    return NextResponse.json({
      message: "Checkout completed and housekeeping task created.",
      booking: updatedBooking,
      suite: updatedSuite,
      housekeepingTask,
    });

  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
