import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { taskId } = await req.json()

  const task = await prisma.housekeepingTask.update({
    where: { id: taskId },
    data: {
      status: "DONE",
      completedAt: new Date(),
    },
    include: { suite: true },
  })

  await prisma.suite.update({
    where: { id: task.suiteId },
    data: { status: "AVAILABLE" },
  })

  return Response.json({ success: true })
}
