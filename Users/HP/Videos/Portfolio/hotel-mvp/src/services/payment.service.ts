// src/services/payment.service.ts
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
