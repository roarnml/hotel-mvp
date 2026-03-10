// app/api/available-suites/route.ts
import { NextResponse } from "next/server"
import { getAvailableSuites } from "@/lib/roomQueries"

export async function GET() {
  return NextResponse.json(await getAvailableSuites())
}
