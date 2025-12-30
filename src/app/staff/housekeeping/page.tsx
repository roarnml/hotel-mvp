/*"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { FiCoffee, FiCheckCircle, FiTool } from "react-icons/fi";

interface RoomTask {
  id: string;
  suite: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  assignedTo?: string;
  lastUpdated?: string;
}

export default function HousekeepingPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<RoomTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<RoomTask["status"] | "ALL">("ALL");
  const [staffFilter, setStaffFilter] = useState<string>("ALL");

  useEffect(() => {
    const loadTasks = async () => {
      if (!session?.user) return;

      setLoading(true);
      try {
        const res = await fetch("/api/staff/housekeeping");
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch tasks");
        }

        let data: RoomTask[] = await res.json();

        // Filter tasks for HOUSEKEEPING users
        if (session.user.role === "HOUSEKEEPING") {
          data = data.filter(task => task.assignedTo === session.user.id);
        }

        setTasks(data);
      } catch (err: any) {
        console.error(err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [session]);

  const updateStatus = (task: RoomTask) => {
    const nextStatus: RoomTask["status"] =
      task.status === "PENDING" ? "IN_PROGRESS" :
      task.status === "IN_PROGRESS" ? "DONE" :
      "PENDING";

    startTransition(async () => {
      try {
        const res = await fetch("/api/staff/housekeeping/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suiteId: task.id, nextStatus }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to update task");
        }

        setTasks(prev =>
          prev.map(t =>
            t.id === task.id
              ? { ...t, status: nextStatus, lastUpdated: new Date().toISOString() }
              : t
          )
        );
      } catch (err: any) {
        console.error(err.message);
      }
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
    if (staffFilter !== "ALL" && task.assignedTo !== staffFilter) return false;
    return true;
  });

  const staffList = Array.from(new Set(tasks.map(t => t.assignedTo).filter(Boolean))) as string[];

  if (status === "loading") return <div className="p-6 text-white">Loading session…</div>;
  if (!session?.user) return <div className="p-6 text-white">Not signed in</div>;
  if (loading) return <div className="p-6 text-white">Loading tasks…</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">Housekeeping Dashboard</h1>

      {/* Filters for supervisors/admins *}
      {staffList.length > 1 && (
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as RoomTask["status"] | "ALL")}
            className="p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={staffFilter}
            onChange={e => setStaffFilter(e.target.value)}
            className="p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="ALL">All Staff</option>
            {staffList.map(staffId => (
              <option key={staffId} value={staffId}>
                {staffId}
              </option>
            ))}
          </select>

          <button
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
            onClick={() => { setStatusFilter("ALL"); setStaffFilter("ALL"); }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-gray-400">No active tasks</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <button
              key={task.id}
              disabled={isPending}
              onClick={() => updateStatus(task)}
              className="w-full p-6 flex justify-between items-center rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-4">
                {task.status === "DONE" ? (
                  <FiCheckCircle className="text-green-500 text-2xl" />
                ) : task.status === "IN_PROGRESS" ? (
                  <FiTool className="text-red-500 text-2xl" />
                ) : (
                  <FiCoffee className="text-yellow-500 text-2xl" />
                )}

                <div className="flex flex-col">
                  <span className="font-bold text-white text-lg">{task.suite}</span>
                  {task.lastUpdated && (
                    <span className="text-sm text-gray-400">
                      Last updated: {new Date(task.lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                  {task.assignedTo && (
                    <span className="text-sm text-gray-400">Assigned to: {task.assignedTo}</span>
                  )}
                </div>
              </div>

              <span
                className={`px-4 py-2 rounded-full font-semibold ${
                  task.status === "DONE" ? "bg-green-600/20 text-green-400" :
                  task.status === "IN_PROGRESS" ? "bg-red-600/20 text-red-400" :
                  "bg-yellow-600/20 text-yellow-400"
                }`}
              >
                {task.status.replace("_", " ")}
              </span>
            </button>
          ))}
        </div>
      )}

      {session.user.role === "HOUSEKEEPING" && (
        <p className="text-sm text-gray-400 mt-2">
          Tap a room to cycle status → PENDING → IN_PROGRESS → DONE
        </p>
      )}
    </div>
  );
}
*/

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HousekeepingDashboard from "./HousekeepingDashboard";

export default async function HousekeepingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return <div className="p-6 text-white">Not signed in</div>;

  // Fetch tasks server-side
  const tasks = await prisma.housekeepingTask.findMany({
    where: session.user.role === "HOUSEKEEPING"
      ? { assignedToId: session.user.id }
      : {},
    orderBy: { createdAt: "desc" },
    include: { assignedTo: true, suite: true },
  });

  return <HousekeepingDashboard tasks={tasks} user={session.user} />;
}
