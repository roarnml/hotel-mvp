// src/utils/date.ts
export function calculateNights(checkIn: string | Date, checkOut: string | Date) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)

  // Normalize to UTC to avoid timezone shifts
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())

  const diffDays = Math.max(Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24)), 1)
  return diffDays
}
