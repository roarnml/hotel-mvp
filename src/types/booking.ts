// types/booking.ts

export type BookingDB = {
  id: string
  bookingRef: string
  checkIn: Date | null
  checkOut: Date | null
  createdAt: Date
  updatedAt: Date
  ticketIssuedAt: Date | null
  emailSentAt: Date | null
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
  paymentStatus: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REFUNDED"

  name: string
  email: string
  amountPaid: number | null

  suite: {
    id: string
    name: string
    category: "VIP" | "REGULAR"
  }

  guest: {
    id: string
    name: string
    email: string
    isVIP: boolean
  } | null

  roomAssignment: {
    id: string
    roomNumber: string
  } | null
}

export type BookingUI = Omit<
  BookingDB,
  "checkIn" | "checkOut" | "createdAt" | "updatedAt" | "ticketIssuedAt" | "emailSentAt"
> & {
  checkIn: string
  checkOut: string
  createdAt: string
  updatedAt: string
  ticketIssuedAt: string | null
  emailSentAt: string | null
}


export type BookingDetailDTO = {
  id: string
  bookingRef: string
  status: string
  paymentStatus: string

  ticketNumber: string | null
  checkInNumber: string | null

  stay: {
    checkIn: string
    checkOut: string
    nights: number | null
    chaletCount: number | null
  }

  guest: {
    name: string
    email: string
    phone: string | null
    address: string | null
    isVIP: boolean | null
  }

  suite: {
    id: string
    name: string
    category: string
    capacity: number | null
    features: string[]
  }

  room: {
    roomNumber: string | null
  }

  payment: {
    reference: string | null
    provider: string | null
    status: string | null
    amountExpected: number | null
    amountPaid: number | null
    currency: string | null
    paidAt: string | null
  }

  timeline: {
    createdAt: string
    updatedAt: string
    ticketIssuedAt: string | null
    emailSentAt: string | null
  }
}