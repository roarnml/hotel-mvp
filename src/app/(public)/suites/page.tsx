// app/suites/page.tsx
import { prisma } from "@/lib/prisma"
import SuiteCard from "@/components/booking/SuiteCard"

export const revalidate = 10 // ISR for 10s

export default async function SuitesPage() {
  const suites = await prisma.suite.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })

  if (!suites.length)
    return <p className="text-center mt-12">No suites available at the moment.</p>

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4 md:px-8 grid md:grid-cols-3 gap-6 py-16">
      {suites.map((suite: { id: string; name: string; price: number; images: string[] , description: string, capacity: number }) => (
        <SuiteCard
          key={suite.id}
          id={suite.id}
          name={suite.name}
          description={suite.description}
          price={suite.price}
          images={suite.images}
          capacity={suite.capacity}
        />
      ))}
    </div>
  )
}
