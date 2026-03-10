import { NextResponse } from "next/server"
import { getPendingCheckIns } from "@/lib/checkInQueries"

export async function GET() {
  const data = await getPendingCheckIns()
  return NextResponse.json(data)
}
