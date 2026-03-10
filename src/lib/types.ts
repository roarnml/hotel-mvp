// @/lib/types.ts

export type SuiteStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE" | "AVAILABLE" | "OCCUPIED"

export interface Suite {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  isActive: boolean
  status: SuiteStatus
  capacity: number
  features: string[]
  roomNumber: string
  createdAt: string
  updatedAt: string
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
export type PaymentStatus =  "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED"

export interface Booking {
  id: string
  bookingRef: string
  suiteId: string
  guestId?: string
  userId?: string
  name: string
  email: string
  checkIn: string
  checkOut: string
  amountPaid?: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  ticketNumber?: string
  checkInNumber?: string
  ticketPdfUrl?: string
  ticketIssuedAt?: string
  emailSentAt?: string
  createdAt: string
  updatedAt: string
  suite: Suite
}
