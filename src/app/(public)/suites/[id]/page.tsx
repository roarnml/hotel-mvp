// app/suites/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SuiteBookingForm from "@/components/booking/SuiteBookingForm"
import SuiteCarousel from "@/components/booking/SuiteCarousel"

export default async function SuiteDetailPage(props: any) {
  const params = await props.params // unwrap if it's a promise
  const suiteId = params.id
  console.log("Suite ID from params:", suiteId)

  const suite = await prisma.suite.findUnique({
    where: { id: suiteId },
  })
  console.log("Fetched suite:", suite)
  if (!suite) return <p className="text-center mt-12">Suite not found. {suiteId}</p>

  const images = Array.isArray(suite.images) ? suite.images : []

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4 md:px-8 grid md:grid-cols-2 gap-12">
      
      {/* --------------------- Left Column: Suite Info --------------------- */}
      <div className="space-y-8">
        {/* Suite Name */}
        <h1 className="text-4xl font-bold">{suite.name}</h1>

        {/* Suite Description */}
        <div className="prose dark:prose-invert max-w-none">
          {suite.description ? (
            suite.description.split("\n\n").map((paragraph: string, idx: number) => {
              // Check if paragraph contains a colon
              if (paragraph.includes(":")) {
                const [heading, ...rest] = paragraph.split(":")
                const content = rest.join(":").trim()

                return (
                  <div key={idx} className="mb-6">
                    <p className="font-bold text-lg text-[#D55605]">{heading}:</p>
                    <p className="mt-1 ml-2 text-gray-700 dark:text-gray-300">{content}</p>
                  </div>
                )
              }

              return (
                <p key={idx} className="mb-6 text-gray-700 dark:text-gray-300">
                  {paragraph}
                </p>
              )
            })
          ) : (
            <p>No description available for this suite.</p>
          )}
        </div>


        {/* Suite Features */}
        {suite.features && suite.features.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Features & Amenities</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {suite.features.map((feature: string, idx: number) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Suite Media */}
        <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow">
          {images.length > 0 ? (
            <SuiteCarousel images={images} name={suite.name} />
          ) : (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Images coming soon
            </div>
          )}
        </div>

        {/* Capacity & Price */}
        <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-300 text-sm mt-4">
          <p>
            <span className="font-semibold">Capacity:</span> {suite.capacity ?? "N/A"} guests
          </p>
          <p>
            <span className="font-semibold">Price:</span> ₦{(suite.price / 100) !== undefined ? (suite.price / 100).toLocaleString() : "N/A"} / night
          </p>
          <p>
            <span className="font-semibold">Availability:</span>{" "}
            {suite.availableRooms > 0 ? `${suite.availableRooms} rooms left` : "Sold out"}
          </p>
        </div>
      </div>

      {/* --------------------- Right Column: Booking Form --------------------- */}
      <SuiteBookingForm suite={suite} />
    </div>
  )
}
