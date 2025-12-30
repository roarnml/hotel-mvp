import { NextRequest, NextResponse } from "next/server";
import { getArrivals, checkInArrival, toggleVIPArrival } from "@/app/staff/arrivals/server-actions";

export async function GET(req: NextRequest) {
  const data = await getArrivals();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { action, bookingId } = await req.json();

  if (action === "checkin") {
    await checkInArrival(bookingId);
  } else if (action === "toggleVIP") {
    await toggleVIPArrival(bookingId);
  }

  const data = await getArrivals();
  return NextResponse.json(data);
}
