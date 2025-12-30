"use client";
import { useState, useTransition } from "react";
import { FiCoffee, FiCheckCircle, FiTool } from "react-icons/fi";

export default function HousekeepingDashboard({ tasks: initialTasks, user }: any) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "IN_PROGRESS" | "DONE">("ALL");

  const updateStatus = async (task: any) => {
    const nextStatus =
      task.status === "PENDING" ? "IN_PROGRESS" :
      task.status === "IN_PROGRESS" ? "DONE" : "PENDING";

    startTransition(async () => {
      try {
        const res = await fetch("/api/staff/housekeeping/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: task.id, nextStatus }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to update task");
        }

        const updatedTask = await res.json();
        setTasks(prev =>
          prev.map(t => (t.id === updatedTask.id ? updatedTask : t))
        );
      } catch (err: any) {
        console.error("Failed to update task:", err.message);
      }
    });
  };

  const filteredTasks = tasks.filter(task => statusFilter === "ALL" || task.status === statusFilter);

  return (
    <div className="min-h-screen bg-black p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold text-white">Housekeeping Dashboard</h1>

      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value as any)}
        className="p-2 rounded border border-[#75240E] bg-black text-white"
      >
        <option value="ALL">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <button
            key={task.id}
            disabled={isPending}
            onClick={() => updateStatus(task)}
            className="w-full p-6 flex justify-between items-center rounded-xl border border-[#75240E] bg-black hover:bg-[#1a0b06] transition"
          >
            <div className="flex items-center gap-4">
              {task.status === "DONE" ? 
                <FiCheckCircle className="text-[#75240E] text-2xl" /> :
               task.status === "IN_PROGRESS" ? 
                <FiTool className="text-[#75240E] text-2xl" /> :
                <FiCoffee className="text-[#75240E] text-2xl" />}
              <div className="flex flex-col">
                <span className="font-bold text-white">{task.suite.name}</span>
                {task.assignedTo && (
                  <span className="text-white/70">Assigned to: {task.assignedTo.name}</span>
                )}
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold ${
              task.status === "DONE" ? "bg-[#75240E]/20 text-[#D55605]" :
              task.status === "IN_PROGRESS" ? "bg-[#75240E]/20 text-[#D55605]" :
              "bg-[#75240E]/20 text-[#D55605]"
            }`}>
              {task.status.replace("_", " ")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
