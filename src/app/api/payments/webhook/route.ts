/*// src/app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack/verifySignature";
import { processPaystackChargeSuccess } from "@/services/payment.service";
import { generateTicket } from "@/services/ticket.service";
import { sendTicketEmail } from "@/services/email.service";
import fs from "fs";
import path from "path";

async function logPaystackPayload(params: {
  event: string;
  payload: any;
  signatureValid: boolean;
}) {
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return;

  try {
    const logsDir = path.join(process.cwd(), "paystack-logs", "webhooks");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${timestamp}_${params.event}.json`;

    fs.writeFileSync(
      path.join(logsDir, filename),
      JSON.stringify(
        {
          receivedAt: new Date().toISOString(),
          event: params.event,
          signatureValid: params.signatureValid,
          payload: params.payload,
        },
        null,
        2
      ),
      "utf-8"
    );
  } catch (err) {
    console.error("Paystack webhook logging failed:", err);
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const signatureValid = verifyPaystackSignature(rawBody, signature);

  // 🧾 Always log first (never blocks execution)
  await logPaystackPayload({
    event: payload.event ?? "unknown",
    payload,
    signatureValid,
  });

  if (!signatureValid) {
    return NextResponse.json(
      { message: "Invalid Paystack signature" },
      { status: 400 }
    );
  }

  // 💰 Financial source of truth
  if (payload.event === "charge.success") {
    const result = await processPaystackChargeSuccess(payload);

    // 🔁 Idempotent replays stop here
    if (result.alreadyProcessed) {
      return NextResponse.json({ status: "already_processed" });
    }

    // 🎟️ Generate ticket
    const booking = await generateTicket(result.bookingId);

    // 📧 Send ticket email
    if (booking.ticketPdfUrl) {
      await sendTicketEmail(
        result.customerEmail,
        "Your Booking Ticket",
        booking.ticketPdfUrl
      );
    } else {
      console.warn(
        "Ticket PDF missing after payment for booking:",
        result.bookingId
      );
    }
  }

  return NextResponse.json({ status: "ok" });
}
*/


import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack/verifySignature";
import { processPaystackChargeSuccess } from "@/services/payment.service";
import fs from "fs";
import path from "path";

async function logPaystackPayload(params: {
  event: string;
  payload: any;
  signatureValid: boolean;
}) {
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return;

  const logsDir = path.join(process.cwd(), "paystack-logs", "webhooks");
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}_${params.event}.json`;

  fs.writeFileSync(
    path.join(logsDir, filename),
    JSON.stringify(
      {
        receivedAt: new Date().toISOString(),
        event: params.event,
        signatureValid: params.signatureValid,
        payload: params.payload,
      },
      null,
      2
    )
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const signatureValid = verifyPaystackSignature(rawBody, signature);

  await logPaystackPayload({
    event: payload.event ?? "unknown",
    payload,
    signatureValid,
  });

  if (!signatureValid) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (payload.event === "charge.success") {
    await processPaystackChargeSuccess(payload);
    // ⛔ nothing else happens here
  }

  return NextResponse.json({ status: "ok" });
}
