import { nanoid } from "nanoid"

/**
 * Generate a unique ticket number
 * Example: "AB12CD34"
 */
export function generateTicketNumber(length = 8): string {
  return nanoid(length).toUpperCase()
}

/**
 * Format price (stored in cents) to USD string
 * Example: 25000 -> "$250.00"
 */
export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100)
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount)
}


/**
 * Format a Date object into readable string
 * Example: 2025-12-13 -> "Dec 13, 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Simple delay utility (ms)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
