// src/utils/generateBookingRef.ts
export function generateBookingRef() {
  return `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}