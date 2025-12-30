// app/suites/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SuiteBookingForm from "@/components/booking/SuiteBookingForm"
import SuiteCarousel from "@/components/booking/SuiteCarousel"

export default async function SuiteDetailPage(props: any) {
  const params = await props.params // unwrap if it's a promise
  const suiteId = params.id
  console.log("Suite ID from params:", suiteId)
  //if (isNaN(suiteId)) return <p className="text-center mt-12">Invalid suite ID.</p>

  const suite = await prisma.suite.findUnique({
    where: { id: suiteId },
  })
  console.log("Fetched suite:", suite)
  if (!suite) return <p className="text-center mt-12">Suite not found. {suiteId}</p>

  const images = Array.isArray(suite.images) ? suite.images : []

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4 md:px-8 grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">{suite.name}</h1>
        <p className="text-gray-700">{suite.description || "No description available."}</p>

        <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow">
          {images.length > 0 ? (
            <SuiteCarousel images={images} name={suite.name} />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
              Images coming soon
            </div>
          )}
        </div>

        <div className="flex space-x-4 text-gray-600">
          <p>Capacity: {suite.capacity ?? "N/A"} guests</p>
          <p>Price: ₦{suite.price !== undefined ? suite.price.toLocaleString() : "N/A"}</p>
        </div>
      </div>

      <SuiteBookingForm suite={suite} />
    </div>
  )
}
