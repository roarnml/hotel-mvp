"use client"

export default function ExportCSVButton({
  bookings,
}: {
  bookings: any[]
}) {
  function exportCSV() {
    const rows = [
      ["Date", "Suite", "Amount"],
      ...bookings.map(b => [
        b.createdAt.toISOString(),
        b.suite.name,
        b.totalAmount,
      ]),
    ]

    const csv = rows.map(r => r.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "revenue.csv"
    a.click()
  }

  return (
    <button
      onClick={exportCSV}
      className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
    >
      Export CSV
    </button>
  )
}
