"use client";

import { useState, useTransition } from "react";
import { FiCoffee, FiCheckCircle, FiTool } from "react-icons/fi";

/* =======================
   Types
======================= */

type HousekeepingStatus = "PENDING" | "IN_PROGRESS" | "DONE";

interface Suite {
  id: string;
  name: string;
}

interface StaffUser {
  id: string;
  name: string;
}

interface HousekeepingTask {
  id: string;
  status: HousekeepingStatus;
  suite: Suite;
  assignedTo?: StaffUser | null;
}

interface Props {
  tasks: HousekeepingTask[];
  user: StaffUser;
}

/* =======================
   Component
======================= */

export default function HousekeepingDashboard({
  tasks: initialTasks,
  user,
}: Props) {
  const [tasks, setTasks] = useState<HousekeepingTask[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | HousekeepingStatus>("ALL");

  /* =======================
     Helpers
  ======================= */

  const getNextStatus = (status: HousekeepingStatus): HousekeepingStatus => {
    switch (status) {
      case "PENDING":
        return "IN_PROGRESS";
      case "IN_PROGRESS":
        return "DONE";
      case "DONE":
        return "PENDING";
    }
  };

  const updateStatus = (task: HousekeepingTask) => {
    const nextStatus = getNextStatus(task.status);

    startTransition(async () => {
      try {
        const res = await fetch("/api/staff/housekeeping/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: task.id,
            nextStatus,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to update task");
        }

        const updatedTask: HousekeepingTask = await res.json();

        setTasks((prev) =>
          prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      } catch (err) {
        console.error("Failed to update task:", err);
      }
    });
  };

  const filteredTasks = tasks.filter(
    (task) => statusFilter === "ALL" || task.status === statusFilter
  );

  /* =======================
     Render
  ======================= */

  return (
    <div className="min-h-screen bg-black p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">Housekeeping Dashboard</h1>

      {/* Filter */}
      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value as "ALL" | HousekeepingStatus)
        }
        className="p-2 rounded-lg border border-[#75240E] bg-black text-white w-48"
      >
        <option value="ALL">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      {/* Tasks */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <button
            key={task.id}
            disabled={isPending}
            onClick={() => updateStatus(task)}
            className="w-full p-6 flex justify-between items-center rounded-xl border border-[#75240E] bg-black hover:bg-[#1a0b06] transition disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              {task.status === "DONE" ? (
                <FiCheckCircle className="text-[#D55605] text-2xl" />
              ) : task.status === "IN_PROGRESS" ? (
                <FiTool className="text-[#D55605] text-2xl" />
              ) : (
                <FiCoffee className="text-[#D55605] text-2xl" />
              )}

              <div className="flex flex-col text-left">
                <span className="font-semibold">{task.suite.name}</span>
                {task.assignedTo && (
                  <span className="text-white/70 text-sm">
                    Assigned to: {task.assignedTo.name}
                  </span>
                )}
              </div>
            </div>

            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-[#75240E]/20 text-[#D55605]">
              {task.status.replace("_", " ")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
