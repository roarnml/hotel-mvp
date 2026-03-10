/*



import { prisma } from "@/lib/prisma"
import { PaymentProvider, PaymentStatus, Prisma, PrismaClient } from "@prisma/client"
import crypto from "crypto"
import fs from "fs"
import path from "path"

// If you don't have this file yet, comment this import out.
// import { sendTicketEmailForBooking } from "@/services/email.service"

type DbClient = PrismaClient | Prisma.TransactionClient

function generatePaymentReference() {
  // Paystack reference must be unique
  return `PAY-${crypto.randomUUID()}`
}

function safeJson(obj: any) {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch {
    return { note: "Could not serialize rawResponse safely" }
  }
}

/**
 * Creates (or reuses) a pending payment.
 *
 * IMPORTANT (your schema): Payment.bookingId is @unique
 * => there can be only one Payment per booking.
 *
 * So we must REUSE the existing Payment (any status) or UPDATE it,
 * not attempt to create a new one for the same booking.
 *
export async function createPendingPayment(
  {
    bookingId,
    detailsId,
    currency = "NGN",
    provider = PaymentProvider.PAYSTACK,
  }: {
    bookingId: string
    detailsId: string
    currency?: string
    provider?: PaymentProvider
  },
  db: DbClient = prisma
) {
  const run = async (client: DbClient) => {
    const existing = await client.payment.findUnique({
      where: { bookingId }, // bookingId is UNIQUE in your schema
    })

    const details = await client.bookingDetails.findUnique({ where: { id: detailsId } })
    if (!details) throw new Error("BookingDetails not found for pending payment creation")

    const expectedTotal = details.totalAmount
    if (!Number.isFinite(expectedTotal) || expectedTotal <= 0) {
      throw new Error("Invalid expected payment amount")
    }

    // If a payment already exists for this booking, reuse/update it
    if (existing) {
      // If already paid, don't downgrade it
      if (existing.status === PaymentStatus.PAID) return existing

      return client.payment.update({
        where: { id: existing.id },
        data: {
          detailsId: details.id,
          // keep the same reference if it already exists; otherwise generate one
          reference: existing.reference || generatePaymentReference(),
          amount: Math.round(expectedTotal),
          currency,
          provider,
          status: PaymentStatus.PENDING,
          initiatedAt: null,
          paidAt: null,
          failedAt: null,
          transactionId: null,
          receiptUrl: null,
          webhookEventId: null,
          rawResponse: safeJson({
            kind: "initialize_snapshot",
            bookingId,
            detailsId: details.id,
            breakdown: {
              baseAmount: details.baseAmount,
              vatAmount: details.vatAmount,
              transactionFee: details.transactionFee,
              totalAmount: details.totalAmount,
              nights: details.nights,
              chaletCount: details.chaletCount,
              pricePerNight: details.pricePerNight,
              currency: details.currency,
            },
          }),
        },
      })
    }

    // No payment exists yet -> create one
    return client.payment.create({
      data: {
        bookingId,
        detailsId: details.id,
        reference: generatePaymentReference(),
        amount: Math.round(expectedTotal),
        currency,
        provider,
        status: PaymentStatus.PENDING,
        rawResponse: safeJson({
          kind: "initialize_snapshot",
          bookingId,
          detailsId: details.id,
          breakdown: {
            baseAmount: details.baseAmount,
            vatAmount: details.vatAmount,
            transactionFee: details.transactionFee,
            totalAmount: details.totalAmount,
            nights: details.nights,
            chaletCount: details.chaletCount,
            pricePerNight: details.pricePerNight,
            currency: details.currency,
          },
        }),
      },
    })
  }

  // If db is PrismaClient (has $transaction), create a tx. Otherwise use existing tx client.
  const hasTx = typeof (db as PrismaClient).$transaction === "function"
  return hasTx ? (db as PrismaClient).$transaction((tx) => run(tx)) : run(db)
}

// -----------------------------
// PAYSTACK WEBHOOK (AUTHORITATIVE)
// -----------------------------
export async function processPaystackChargeSuccess(payload: any) {
  const data = payload?.data
  if (!data?.reference) throw new Error("Missing Paystack reference in webhook payload")

  const reference = String(data.reference)
  const webhookEventId = `${payload?.event ?? "unknown"}_${String(data.id ?? "noid")}`

  // We'll export this after commit (no I/O inside DB tx)
  let settlementRecord: any = null

  const result = await prisma.$transaction(async (tx) => {
    // Find payment by reference (this is the most reliable key)
    const existingPayment = await tx.payment.findUnique({
      where: { reference },
      select: { id: true, bookingId: true, status: true, webhookEventId: true },
    })

    if (!existingPayment) {
      // If you want to be more lenient, you could return ok and investigate later.
      throw new Error(`Payment not found for reference: ${reference}`)
    }

    // Idempotency: if already PAID or already processed with same webhookEventId, exit fast
    if (
      existingPayment.status === PaymentStatus.PAID ||
      (existingPayment.webhookEventId && existingPayment.webhookEventId === webhookEventId)
    ) {
      return { alreadyProcessed: true as const, bookingId: existingPayment.bookingId }
    }

    // Update payment record
    const payment = await tx.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: PaymentStatus.PAID,
        amountPaid: Number(data.amount),
        transactionId: data.id != null ? String(data.id) : null,
        paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        webhookEventId,
        rawResponse: safeJson(data),
      },
    })

    // Pull latest BookingDetails snapshot for room decrement + audit
    const details = await tx.bookingDetails.findFirst({
      where: { bookingId: existingPayment.bookingId },
      orderBy: { createdAt: "desc" },
    })
    if (!details) throw new Error("BookingDetails missing at payment success time")

    const roomsToDecrement = Math.max(1, details.chaletCount)

    // Ensure availability is sufficient and decrement
    const suiteUpdate = await tx.suite.updateMany({
      where: { id: details.suiteId, availableRooms: { gte: roomsToDecrement } },
      data: { availableRooms: { decrement: roomsToDecrement } },
    })
    if (suiteUpdate.count === 0) throw new Error("Not enough rooms available at payment time")

    // Confirm booking
    const updatedBooking = await tx.booking.update({
      where: { id: existingPayment.bookingId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: "CONFIRMED",
        amountPaid: Number(data.amount),
        ticketIssuedAt: new Date(),
      },
    })

    settlementRecord = {
      booking: updatedBooking,
      payment,
      paystack: data,
      details,
    }

    return {
      alreadyProcessed: false as const,
      bookingId: updatedBooking.id,
      bookingRef: updatedBooking.bookingRef,
      paymentId: payment.id,
      amountPaid: Number(data.amount),
      paidAt: data.paid_at ?? null,
    }
  })

  // ---- post-commit side effects ----
  exportSettlementJson(settlementRecord)

  // Email after commit (keeps webhook fast and avoids DB locks)
  // if (!result.alreadyProcessed && result.bookingId) {
  //   sendTicketEmailForBooking(result.bookingId).catch((err) => {
  //     console.error("❌ Ticket email send failed (webhook):", err)
  //   })
  // }

  return result
}

export async function processPaystackChargeFailed(payload: any) {
  const data = payload?.data
  if (!data?.reference) throw new Error("Missing Paystack reference in webhook payload")

  const reference = String(data.reference)
  const webhookEventId = `${payload?.event ?? "unknown"}_${String(data.id ?? "noid")}`

  const result = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findUnique({
      where: { reference },
      select: { id: true, bookingId: true, status: true, webhookEventId: true },
    })

    if (!existingPayment) {
      throw new Error(`Payment not found for reference: ${reference}`)
    }

    // Idempotency
    if (
      existingPayment.status === PaymentStatus.FAILED ||
      (existingPayment.webhookEventId && existingPayment.webhookEventId === webhookEventId)
    ) {
      return { alreadyProcessed: true as const, bookingId: existingPayment.bookingId }
    }

    const payment = await tx.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
        webhookEventId,
        rawResponse: safeJson(data),
      },
    })

    await tx.booking.update({
      where: { id: existingPayment.bookingId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
      },
    })

    return { alreadyProcessed: false as const, bookingId: existingPayment.bookingId, paymentId: payment.id }
  })

  return result
}

// -----------------------------
// OPTIONAL: PROVIDER VERIFY (non-authoritative)
// -----------------------------
export async function verifyPaystack(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  })
  return res.json()
}

// -----------------------------
// DEBUG / SETTLEMENT EXPORT
// -----------------------------
function exportSettlementJson(record: any) {
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return
  if (!record) return

  try {
    const dir = path.join(process.cwd(), "paystack-logs", "settlements")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    fs.writeFileSync(
      path.join(dir, `settlement_${Date.now()}.json`),
      JSON.stringify(record, null, 2)
    )
  } catch (err) {
    console.error("Settlement export failed:", err)
  }
}*/

import { prisma } from "@/lib/prisma"
import { PaymentStatus, Prisma } from "@prisma/client"
import { sendTicketEmailForBooking } from "@/services/email.service"
import crypto from "crypto"
import fs from "fs"
import path from "path"

// -----------------------------
// Ticket number generation (unique)
// -----------------------------
function generateTicketNumber() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `TKT-${y}${m}${day}-${rand}`
}

async function assignUniqueTicketNumber(tx: Prisma.TransactionClient, bookingId: string) {
  const existing = await tx.booking.findUnique({
    where: { id: bookingId },
    select: { ticketNumber: true },
  })
  if (existing?.ticketNumber) return existing.ticketNumber

  for (let attempt = 1; attempt <= 7; attempt++) {
    const candidate = generateTicketNumber()
    try {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { ticketNumber: candidate },
        select: { ticketNumber: true },
      })
      return updated.ticketNumber
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue
      throw err
    }
  }

  throw new Error("Could not generate a unique ticket number after multiple attempts.")
}

function safeJson(obj: any) {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch {
    return { note: "Could not serialize rawResponse safely" }
  }
}

// -----------------------------
// PAYSTACK WEBHOOK (AUTHORITATIVE)
// Generates ticketNumber here
// Sends email AFTER commit
// -----------------------------
export async function processPaystackChargeSuccess(payload: any) {
  const data = payload?.data
  if (!data?.reference) throw new Error("Missing Paystack reference in webhook payload")

  const reference = String(data.reference)
  const webhookEventId = `${payload?.event ?? "unknown"}_${String(data.id ?? "noid")}`

  const result = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findUnique({
      where: { reference },
      select: { id: true, bookingId: true, status: true, webhookEventId: true },
    })

    if (!existingPayment) {
      throw new Error(`Payment not found for reference: ${reference}`)
    }

    if (
      existingPayment.status === PaymentStatus.PAID ||
      (existingPayment.webhookEventId && existingPayment.webhookEventId === webhookEventId)
    ) {
      const b = await tx.booking.findUnique({
        where: { id: existingPayment.bookingId },
        select: { bookingRef: true, ticketNumber: true, emailSentAt: true },
      })

      return {
        alreadyProcessed: true as const,
        bookingId: existingPayment.bookingId,
        bookingRef: b?.bookingRef ?? null,
        ticketNumber: b?.ticketNumber ?? null,
        emailSentAt: b?.emailSentAt ?? null,
      }
    }

    const payment = await tx.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: PaymentStatus.PAID,
        amountPaid: Number(data.amount),
        transactionId: data.id != null ? String(data.id) : null,
        paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
        webhookEventId,
        rawResponse: safeJson(data),
      },
      select: { id: true, bookingId: true },
    })

    const details = await tx.bookingDetails.findFirst({
      where: { bookingId: payment.bookingId },
      orderBy: { createdAt: "desc" },
      select: { chaletCount: true, suiteId: true },
    })
    if (!details) throw new Error("BookingDetails missing at payment success time")

    const roomsToDecrement = Math.max(1, details.chaletCount)

    const suiteUpdate = await tx.suite.updateMany({
      where: { id: details.suiteId, availableRooms: { gte: roomsToDecrement } },
      data: { availableRooms: { decrement: roomsToDecrement } },
    })
    if (suiteUpdate.count === 0) throw new Error("Not enough rooms available at payment time")

    const ticketNumber = await assignUniqueTicketNumber(tx, payment.bookingId)

    const updatedBooking = await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: "CONFIRMED",
        amountPaid: Number(data.amount),
        ticketIssuedAt: new Date(),
      },
      select: { id: true, bookingRef: true, ticketNumber: true, emailSentAt: true },
    })

    return {
      alreadyProcessed: false as const,
      bookingId: updatedBooking.id,
      bookingRef: updatedBooking.bookingRef,
      ticketNumber: updatedBooking.ticketNumber ?? ticketNumber,
      paymentId: payment.id,
      emailSentAt: updatedBooking.emailSentAt ?? null,
    }
  })

  // ✅ AFTER COMMIT: send email (won't run inside transaction)
  // sendTicketEmailForBooking has its own idempotency guard (emailSentAt).
  if (!result.alreadyProcessed) {
    sendTicketEmailForBooking(result.bookingId).catch((err) => {
      console.error("❌ Ticket email send failed (webhook):", err)
    })
  }

  return result
}


export async function processPaystackChargeFailed(payload: any) {
  const data = payload?.data
  if (!data?.reference) throw new Error("Missing Paystack reference in webhook payload")

  const reference = String(data.reference)
  const webhookEventId = `${payload?.event ?? "unknown"}_${String(data.id ?? "noid")}`

  const result = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findUnique({
      where: { reference },
      select: { id: true, bookingId: true, status: true, webhookEventId: true },
    })

    if (!existingPayment) {
      throw new Error(`Payment not found for reference: ${reference}`)
    }

    // ✅ Idempotency / ordering safety:
    // - if already FAILED or already processed same webhook, do nothing
    // - if already PAID, do NOT downgrade to FAILED
    if (
      existingPayment.status === PaymentStatus.FAILED ||
      (existingPayment.webhookEventId && existingPayment.webhookEventId === webhookEventId)
    ) {
      return { alreadyProcessed: true as const, bookingId: existingPayment.bookingId }
    }

    if (existingPayment.status === PaymentStatus.PAID) {
      return { alreadyProcessed: true as const, bookingId: existingPayment.bookingId, note: "already_paid" }
    }

    const payment = await tx.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
        webhookEventId,
        rawResponse: safeJson(data),
      },
      select: { id: true },
    })

    // Keep booking pending but mark paymentStatus failed (safe default)
    await tx.booking.update({
      where: { id: existingPayment.bookingId },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        // Optional: if you want bookings to move to CANCELLED on failure, uncomment:
        // status: "CANCELLED",
      },
      select: { id: true },
    })

    return {
      alreadyProcessed: false as const,
      bookingId: existingPayment.bookingId,
      paymentId: payment.id,
    }
  })

  return result
}
// -----------------------------
// OPTIONAL: PROVIDER VERIFY (non-authoritative)
// -----------------------------
export async function verifyPaystack(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  })
  return res.json()
}

// -----------------------------
// DEBUG / SETTLEMENT EXPORT
// -----------------------------
function exportSettlementJson(record: any) {
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return
  if (!record) return

  try {
    const dir = path.join(process.cwd(), "paystack-logs", "settlements")
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    fs.writeFileSync(
      path.join(dir, `settlement_${Date.now()}.json`),
      JSON.stringify(record, null, 2)
    )
  } catch (err) {
    console.error("Settlement export failed:", err)
  }
}