"use server"

import { prisma } from "@/lib/prisma"

export type AlertType = "VIP_ARRIVAL" | "CLEANING_PENDING"

export interface PriorityAlert {
  id: string
  type: AlertType
  message: string
  time: string
}

/* ---------------- GET ALERTS ---------------- */

export async function getPriorityAlerts(): Promise<PriorityAlert[]> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setHours(23, 59, 59, 999)

  // 1️⃣ VIP Arrivals (today, paid, not checked in)
  const vipArrivals = await prisma.booking.findMany({
    where: {
      checkIn: { gte: startOfDay, lte: endOfDay },
      status: "CONFIRMED",
      paymentStatus: "PAID",
      guest: { isVIP: true },
    },
    include: {
      guest: { select: { name: true } },
      suite: { select: { name: true } },
    },
  })

  // 2️⃣ Pending housekeeping tasks
  /*const pendingTasks = await prisma.housekeepingTask.findMany({
    where: { status: "PENDING" },
    include: { suite: true, assignedTo: true },
  })*/

  const vipAlerts: PriorityAlert[] = vipArrivals.map(b => ({
    id: b.id,
    type: "VIP_ARRIVAL",
    message: `VIP Arrival · ${b.guest?.name} · ${b.suite.name}`,
    time: b.checkIn.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }))

  /*const cleaningAlerts: PriorityAlert[] = pendingTasks.map(t => ({
    id: t.id,
    type: "CLEANING_PENDING",
    message: `Room ${t.suite.name} pending cleaning${t.assignedTo ? ` (Assigned to ${t.assignedTo.name})` : ""}`,
    time: t.createdAt.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
  }))*/

  return [...vipAlerts] // ...cleaningAlerts]
}

/* ---------------- ACTIONS ---------------- */

/**
 * Resolve VIP arrival alert by checking in guest
 */
export async function checkInVIP(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { suite: true },
  })

  if (!booking) throw new Error("Booking not found")
  if (booking.status === "CHECKED_IN") throw new Error("Guest already checked in")

  const checkInNumber = `CI-${Date.now().toString().slice(-6)}`

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CHECKED_IN",
        checkInNumber,
      },
    }),
    prisma.suite.update({
      where: { id: booking.suiteId },
      data: { status: "OCCUPIED" },
    }),
  ])
}

/**
 * Resolve cleaning alert by marking task done and suite available if needed
 */
/*export async function markSuiteCleaned(taskId: string) {
  const task = await prisma.housekeepingTask.findUnique({
    where: { id: taskId },
    include: { suite: true },
  })

  if (!task) throw new Error("Task not found")
  if (task.status !== "PENDING") throw new Error("Task is not pending")

  await prisma.$transaction([
    prisma.housekeepingTask.update({
      where: { id: taskId },
      data: { status: "DONE", completedAt: new Date() },
    }),
    prisma.suite.update({
      where: { id: task.suiteId },
      data: { status: "AVAILABLE" },
    }),
  ])
}*/
