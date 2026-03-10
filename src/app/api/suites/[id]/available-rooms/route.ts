
/*export async function GET(req: NextRequest, { params }: { params: { id: string }}) {
  const suiteId = params.id
  // Fetch rooms not assigned in RoomAssignment table
  const assignedRooms = await prisma.roomAssignment.findMany({
    where: { suiteId },
    select: { roomNumber: true }
  })
  const assignedNumbers = assignedRooms.map(r => r.roomNumber)

  // Suppose the suite has room numbers 101–110
  const allRooms = Array.from({ length: 10 }, (_, i) => (101 + i).toString())
  const availableRooms = allRooms.filter(r => !assignedNumbers.includes(r))

  return NextResponse.json(availableRooms)
}
*/
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // <-- params is a Promise
) {
  const { id: suiteId } = await context.params  // <-- unwrap it

  if (!suiteId) {
    return NextResponse.json({ error: "Suite ID required" }, { status: 400 })
  }

  // Fetch rooms already assigned
  const assignedRooms = await prisma.roomAssignment.findMany({
    where: { suiteId },
    select: { roomNumber: true },
  })

  const assignedNumbers = assignedRooms.map(r => r.roomNumber)

  // Assume suite has rooms 101–110
  const allRooms = Array.from({ length: 10 }, (_, i) => (101 + i).toString())

  const availableRooms = allRooms.filter((r) => !assignedNumbers.includes(r))

  return NextResponse.json(availableRooms)
}
