"use client"

import { useState } from "react"

interface SeasonalRate {
  id: string
  start: string
  end: string
  price: number
  label?: string
}

export default function SeasonalPricing({
  rates,
}: {
  rates: SeasonalRate[]
}) {
  const [list, setList] = useState(rates)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          Seasonal Pricing
        </h2>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          + Add Season
        </button>
      </div>

      {list.length === 0 && (
        <p className="text-sm text-gray-500">
          No seasonal pricing configured.
        </p>
      )}

      <div className="space-y-3">
        {list.map((rate) => (
          <div
            key={rate.id}
            className="flex justify-between items-center border rounded-lg p-4"
          >
            <div>
              <p className="font-medium">
                {rate.label || "Seasonal Rate"}
              </p>
              <p className="text-sm text-gray-500">
                {rate.start} → {rate.end}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ₦{rate.price.toLocaleString()}
              </p>
              <button className="text-xs text-red-500 hover:underline">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
