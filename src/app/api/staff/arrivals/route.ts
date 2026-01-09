/*import { NextRequest, NextResponse } from "next/server";
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
*/

// src/app/api/staff/arrivals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getArrivals, checkInArrival, toggleVIPArrival } from "@/app/staff/arrivals/server-actions";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const vip = searchParams.get("vip") || "false";          // "true" | "false"
  const suiteType = searchParams.get("suite") || "REGULAR";  // "VIP" | "Regular"
  const status = searchParams.get("status") || "Pending";    // "Pending" | "Checked-in"

  const data = await getArrivals({ vip, suiteType, status });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { action, bookingId } = await req.json();
  const url = new URL(req.url);
  const vip = url.searchParams.get("vip") || "false";
  const suiteType = url.searchParams.get("suite") || "Regular";
  const status = url.searchParams.get("status") || "Pending";

  if (action === "checkin") {
    await checkInArrival(bookingId);
  } else if (action === "toggleVIP") {
    await toggleVIPArrival(bookingId);
  }

  const data = await getArrivals({ vip, suiteType, status });
  return NextResponse.json(data);
}

