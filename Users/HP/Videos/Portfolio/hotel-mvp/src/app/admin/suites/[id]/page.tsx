import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SuiteEditor from "./suite-editor"
import SeasonalPricing from "./seasonal-pricing"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminSuiteDetailPage({ params }: PageProps) {
  const { id } = await params // 🔑 unwrap params

  const suite = await prisma.suite.findUnique({
    where: { id },
    include: { seasonalRates: true },
  })

  if (!suite) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {suite.name}
        </h1>
        <p className="text-sm text-gray-500">
          Manage pricing, status, and features
        </p>
      </div>

      <SuiteEditor suite={suite} />

      <SeasonalPricing
        rates={suite.seasonalRates.map((r) => ({
          id: r.id,
          start: r.start.toDateString(),
          end: r.end.toDateString(),
          price: r.price,
          label: r.label,
        }))}
      />
    </div>
  )
}
