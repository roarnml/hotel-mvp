// app/api/staff/housekeeping/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId, nextStatus } = await req.json();

    if (!taskId || !nextStatus) {
      return NextResponse.json({ error: "Missing taskId or nextStatus" }, { status: 400 });
    }

    // Check permissions: HOUSEKEEPING can only update their own tasks
    const task = await prisma.housekeepingTask.findUnique({
      where: { id: taskId },
      include: { assignedTo: true },
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (session.user.role === "HOUSEKEEPING" && task.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTask = await prisma.housekeepingTask.update({
      where: { id: taskId },
      data: {
        status: nextStatus,
        ...(nextStatus === "IN_PROGRESS" ? { startedAt: new Date() } : {}),
        ...(nextStatus === "DONE" ? { completedAt: new Date() } : {}),
      },
      include: { suite: true, assignedTo: true },
    });

    return NextResponse.json(updatedTask);
  } catch (err: any) {
    console.error("Failed to update task:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
