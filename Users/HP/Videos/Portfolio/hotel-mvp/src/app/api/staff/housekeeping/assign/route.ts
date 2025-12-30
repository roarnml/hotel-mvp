export async function POST(req: Request) {
  const { taskId, staffId } = await req.json()

  await prisma.housekeepingTask.update({
    where: { id: taskId },
    data: {
      assignedToId: staffId,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  })

  return Response.json({ success: true })
}
