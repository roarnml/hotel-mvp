import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const suites = await prisma.suite.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ suites })
  } catch (err: any) {
    console.error("Error fetching suites:", err)
    return NextResponse.json({ error: "Failed to fetch suites." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, price, images, capacity, status, roomNumber } = await req.json()

    if (!name || !price || !capacity) {
      throw new Error("Name, price, and capacity are required")
    }

    const suite = await prisma.suite.create({
      data: {
        name,
        description,
        price,
        images: images || [],
        isActive: true,
        capacity,
        status: status || "AVAILABLE",
        roomNumber: roomNumber || "UNASSIGNED",
      },
    })

    return NextResponse.json({ suite })
  } catch (err: any) {
    console.error("Error creating suite:", err)
    return NextResponse.json({ error: "Failed to create suite." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, description, price, images, isActive, capacity, status, roomNumber } = await req.json()
    if (!id) throw new Error("Suite ID is required")

    const updated = await prisma.suite.update({
      where: { id },
      data: {
        name,
        description,
        price,
        images,
        isActive,
        capacity,
        status,
        roomNumber,
      },
    })

    return NextResponse.json({ suite: updated })
  } catch (err: any) {
    console.error("Error updating suite:", err)
    return NextResponse.json({ error: "Failed to update suite." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) throw new Error("Suite ID is required")

    await prisma.suite.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Error deleting suite:", err)
    return NextResponse.json({ error: "Failed to delete suite." }, { status: 500 })
  }
}
