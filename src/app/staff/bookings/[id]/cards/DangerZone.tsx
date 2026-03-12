type DangerZoneProps = {
  booking: {
    canDelete: boolean
  }
}

export default function DangerZone({ booking }: DangerZoneProps) {
  if (!booking.canDelete) return null

  return (
    <div className="bg-neutral-900 border border-red-700 p-4 rounded-xl">
      <h3 className="text-red-500 text-sm">Danger Zone</h3>

      <button className="w-full mt-2 bg-red-600 p-2 rounded">
        Delete Booking
      </button>
    </div>
  )
}