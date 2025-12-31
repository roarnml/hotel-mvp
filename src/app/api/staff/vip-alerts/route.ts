import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vipGuests = await prisma.booking.findMany({
      where: {
        guest: {
          isVIP: true,
        },
        status: "CONFIRMED",
      },
      select: {
        id: true,
        guest: {
          select: {
            name: true,
          },
        },
        suite: {
          select: {
            roomNumber: true,
          },
        },
        checkIn: true,
      },
      orderBy: {
        checkIn: "asc",
      },
      take: 5,
    });

    return NextResponse.json(vipGuests);
  } catch (error) {
    console.error("VIP alerts error:", error);
    return NextResponse.json(
      { error: "Failed to load VIP alerts" },
      { status: 500 }
    );
  }
}
