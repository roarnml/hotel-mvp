"use client"

export default function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      {children}
    </div>
  )
}