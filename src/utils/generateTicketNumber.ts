// src/utils/generateTicketNumber.ts
export function generateTicketNumber() {
  return `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}