// src/lib/ticket.ts
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8)

export function generateTicketNumber() {
  return `TCK-${nanoid()}`
}
