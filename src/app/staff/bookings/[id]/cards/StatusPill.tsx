"use client"

function pillClass(v: string) {
  const s = v.toUpperCase()
  if (s.includes("PAID") || s.includes("CONFIRMED")) return "bg-green-900/30 text-green-300 border-green-800"
  if (s.includes("PENDING") || s.includes("PROCESS")) return "bg-yellow-900/30 text-yellow-300 border-yellow-800"
  if (s.includes("FAILED") || s.includes("CANCEL")) return "bg-red-900/30 text-red-300 border-red-800"
  return "bg-gray-800/40 text-gray-200 border-gray-700"
}

export default function StatusPill({ value }: { value: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs border ${pillClass(value)}`}>
      {value}
    </span>
  )
}