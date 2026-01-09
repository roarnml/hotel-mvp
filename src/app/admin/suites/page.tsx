import { prisma } from "@/lib/prisma"
import { FiPlus, FiEdit, FiDollarSign } from "react-icons/fi"
import { SuiteStatus } from "@/lib/types"

// ⚠️ IGNORE BELOW - reference only
function SuiteCard({
  id,
  name,
  price,
  status,
  features,
}: {
  id: string
  name: string
  price: number
  status: SuiteStatus
  features: string[]
}) {
  const statusStyle =
    status === "AVAILABLE"
      ? "bg-green-100 text-green-700"
      : status === "OCCUPIED"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">
            {name}
          </h3>

          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle}`}>
            {status}
          </span>
        </div>

        <p className="text-sm text-gray-600 flex items-center gap-2">
          <FiDollarSign />
          ₦{price.toLocaleString()} / night
        </p>

        <ul className="text-sm text-gray-500 space-y-1">
          {features.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3 mt-6">
        <a
          href={`/admin/suites/${id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
        >
          <FiEdit />
          Manage
        </a>
      </div>
    </div>
  )
}


export default async function AdminSuitesPage() {
  const suites = await prisma.suite.findMany({
    orderBy: { createdAt: "desc" },
  })

  const total = suites.length
  const available = suites.filter((s: any) => s.status === "AVAILABLE").length
  const occupied = suites.filter((s: any) => s.status === "OCCUPIED").length

  function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-semibold text-gray-900 mt-2">
            {value}
        </p>
        </div>
    )
    }



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Suites
          </h1>
          <p className="text-sm text-gray-500">
            Live inventory from suite cloud database
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <FiPlus />
          Add Suite
        </button>
      </div>

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Metric label="Total Suites" value={total} />
        <Metric label="Available" value={available} />
        <Metric label="Occupied" value={occupied} />
      </section>

      {/* Suites Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {suites.map((suite: any) => (
          <SuiteCard
            key={suite.id}
            id={suite.id}
            name={suite.name}
            price={suite.price}
            status={suite.status}
            features={suite.features}
          />
        ))}

        {suites.length === 0 && (
          <div className="text-sm text-gray-500">
            No suites found in database.
          </div>
        )}
      </section>
    </div>
  )
}
