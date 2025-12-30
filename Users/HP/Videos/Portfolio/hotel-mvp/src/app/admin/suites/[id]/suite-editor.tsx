"use client"

import { useState } from "react"

export default function SuiteEditor({ suite }: { suite: any }) {
  const [price, setPrice] = useState(suite.price)
  const [status, setStatus] = useState(suite.status)
  const [features, setFeatures] = useState(suite.features.join(", "))

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* Price */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Base Price (₦ per night)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="mt-2 w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* Status */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-2 w-full border rounded-lg px-4 py-2"
        >
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      {/* Features */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Features (comma separated)
        </label>
        <input
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          className="mt-2 w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
          Cancel
        </button>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  )
}
