"use client"

export default function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2 border-b border-[#1f1f1f] last:border-b-0">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-sm text-white text-right break-words max-w-[60%]">{value}</div>
    </div>
  )
}