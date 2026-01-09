/*// src/services/payment.service.ts
import { prisma } from "@/lib/prisma";

export async function createPaymentRecord({
  bookingId,
  amount,
  currency = "NGN",
  provider = "PAYSTACK",
  paystackReference,
}: {
  bookingId: string;
  amount: number;
  currency?: string;
  provider?: string;
  paystackReference: string;
}) {
  return prisma.payment.create({
    data: {
      bookingId,
      amount,
      currency,
      provider,
      paystackReference,
      status: "PENDING",
    },
  });
}

function exportSettlementJson(record: any) {
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return;

  try {
    const dir = path.join(process.cwd(), "paystack-logs", "settlements");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `settlement_${record.booking.bookingRef}_${Date.now()}.json`;

    fs.writeFileSync(
      path.join(dir, filename),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          record,
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("Settlement export failed:", err);
  }
}


// Mark payment as success
export async function markPaymentSuccess(
  bookingId: string,
  paystackReference: string,
  amount: number
) {
  // Update payment record
  const payment = await prisma.payment.upsert({
    where: { bookingId },
    update: { status: "SUCCESS", paystackReference, amount, paidAt: new Date() },
    create: { bookingId, status: "SUCCESS", paystackReference, amount },
  });

  // Update booking
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: "SUCCESS", status: "CONFIRMED" },
  });

  return { payment, booking };
}

// Verify Paystack payment
export async function verifyPayment(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });

  const data = await res.json();

  if (!data.status) return { success: false };

  const { status, amount, paid_at } = data.data;

  const payment = await prisma.payment.updateMany({
    where: { paystackReference: reference },
    data: {
      status: status === "success" ? "SUCCESS" : "FAILED",
      paidAt: status === "success" ? new Date(paid_at) : null,
    },
  });

  return {
    success: true,
    status,
    amount,
    paidAt: paid_at,
    bookingRef: data.data.metadata?.bookingRef || null,
  };
}


import fs from "fs";
import path from "path";

export async function processPaystackChargeSuccess(payload: any) {
  const data = payload.data;
  const metadata = data.metadata;

  const bookingId = metadata.bookingId;
  const webhookEventId = `${payload.event}_${data.id}`;

  // 🔁 Idempotency guard
  const existing = await prisma.payment.findFirst({
    where: { webhookEventId },
  });

  if (existing) {
    return {
      alreadyProcessed: true,
      bookingId,
      paymentId: existing.id,
    };
  }

  // 💳 Upsert Payment (authoritative financial record)
  const payment = await prisma.payment.upsert({
    where: { bookingId },
    update: {
      status: "SUCCESS",
      amount: data.amount,
      currency: data.currency,
      paystackReference: data.reference,
      transactionId: String(data.id),
      paidAt: new Date(data.paid_at),
      webhookEventId,
    },
    create: {
      bookingId,
      amount: data.amount,
      currency: data.currency,
      status: "SUCCESS",
      provider: "PAYSTACK",
      paystackReference: data.reference,
      transactionId: String(data.id),
      paidAt: new Date(data.paid_at),
      webhookEventId,
    },
  });

  // 🏨 Update Booking (business state)
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      amountPaid: data.amount,
      paymentStatus: "SUCCESS",
      status: "CONFIRMED",
    },
  });

  // 🧾 Export settlement record (separate from webhook raw log)
  exportSettlementJson({
    booking,
    payment,
    paystack: {
      gatewayResponse: data.gateway_response,
      fees: data.fees,
      authorization: data.authorization,
      customer: data.customer,
      channel: data.channel,
      paidAt: data.paid_at,
    },
  });

  // 📦 Return structured info for downstream logic
  return {
    success: true,
    bookingId: booking.id,
    bookingRef: booking.bookingRef,
    paymentId: payment.id,
    amountPaid: data.amount,
    currency: data.currency,
    paidAt: data.paid_at,
    customerEmail: data.customer.email,
  };
}
*/

import { prisma } from "@/lib/prisma"
import { PaymentProvider, PaymentStatus, BookingStatus } from "@prisma/client"
import crypto from "crypto"
import fs from "fs"
import path from "path"

/* -----------------------------
   UTIL
-------------------------------- */
function generatePaymentReference() {
  return `PAY-${crypto.randomUUID()}`
}

/* -----------------------------
   CREATE PENDING PAYMENT
   (called during /initialize)
-------------------------------- */
export async function createPendingPayment({
  bookingId,
  amount,
  currency = "NGN",
  provider = PaymentProvider.PAYSTACK,
}: {
  bookingId: string
  amount: number
  currency?: string
  provider?: PaymentProvider
}) {
  return prisma.payment.create({
    data: {
      reference: generatePaymentReference(),
      amount,
      currency,
      provider,
      status: PaymentStatus.PENDING,
      booking: {
        connect: { id: bookingId },
      },
    },
  })
}

/* -----------------------------
   PAYSTACK WEBHOOK (AUTHORITATIVE)
-------------------------------- */
export async function processPaystackChargeSuccess(payload: any) {
  const data = payload.data
  const metadata = data.metadata

  if (!metadata?.bookingId) {
    throw new Error("Missing bookingId in Paystack metadata")
  }

  const bookingId = metadata.bookingId
  const webhookEventId = `${payload.event}_${data.id}`

  return prisma.$transaction(async (tx) => {
    // 🧱 Idempotency guard
    const alreadyHandled = await tx.payment.findFirst({
      where: { webhookEventId },
    })

    if (alreadyHandled) {
      return { alreadyProcessed: true }
    }

    // 💳 Update payment
    const payment = await tx.payment.update({
      where: { reference: data.reference },
      data: {
        status: "PAID",
        amountPaid: data.amount,
        transactionId: String(data.id),
        paidAt: new Date(data.paid_at),
        webhookEventId,
        rawResponse: data,
      },
    })

    // 🏨 Lock booking + inventory atomically
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    // 🔐 HARD availability lock
    const suiteUpdate = await tx.suite.updateMany({
      where: {
        id: booking.suiteId,
        availableRooms: { gt: 0 },
      },
      data: {
        availableRooms: { decrement: 1 },
      },
    })

    if (suiteUpdate.count === 0) {
      throw new Error("No rooms available at payment time")
    }

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        amountPaid: data.amount,
        ticketIssuedAt: new Date(),
      },
    })

    exportSettlementJson({ booking: updatedBooking, payment, paystack: data })

    return {
      success: true,
      bookingId: updatedBooking.id,
      bookingRef: updatedBooking.bookingRef,
      paymentId: payment.id,
      amountPaid: data.amount,
      paidAt: data.paid_at,
    }
  })
}


/* -----------------------------
   OPTIONAL: CLIENT VERIFY
   (non-authoritative)
-------------------------------- */
export async function verifyPaystack(reference: string) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  )

  return res.json()
}

/* -----------------------------
   DEBUG / SETTLEMENT EXPORT
-------------------------------- */
function exportSettlementJson(record: any) {
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return

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
