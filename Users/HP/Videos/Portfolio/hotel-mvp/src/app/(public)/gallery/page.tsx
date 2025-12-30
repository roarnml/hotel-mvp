import { prisma } from "@/lib/prisma"
import SuiteCard from "@/components/booking/SuiteCard"

export default async function GalleryPage() {
  // Fetch suites from the database
  const suites = await prisma.suite.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, price: true, images: true },
  })

  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-12">Our Suites</h1>

      {suites.length === 0 ? (
        <p className="text-center text-gray-500">No suites available at the moment.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {suites.map((suite) => (
            <SuiteCard
              key={suite.id}
              id={suite.id}
              name={suite.name}
              price={suite.price}
              images={suite.images || []}
            />
          ))}
        </div>
      )}
    </main>
  )
}
