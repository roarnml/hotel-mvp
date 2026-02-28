

// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyPaystackSignature } from "@/lib/paystack/verifySignature"
import {
  processPaystackChargeSuccess,
  processPaystackChargeFailed,
} from "@/services/payment.service"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

async function logPaystackPayload(params: {
  event: string
  payload: any
  signatureValid: boolean
}) {
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return

  const logsDir = path.join(process.cwd(), "paystack-logs", "webhooks")
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filename = `${timestamp}_${params.event}.json`

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
  )
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-paystack-signature") || ""

    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
    }

    const signatureValid = verifyPaystackSignature(rawBody, signature)

    await logPaystackPayload({
      event: payload.event ?? "unknown",
      payload,
      signatureValid,
    })

    if (!signatureValid) {
      // IMPORTANT: 401 here is fine; Paystack will retry invalid signature anyway.
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
    }

    // Handle relevant events
    if (payload.event === "charge.success") {
      await processPaystackChargeSuccess(payload)
    } else if (payload.event === "charge.failed") {
      await processPaystackChargeFailed(payload)
    }

    // Always return ok so Paystack doesn't keep retrying for unhandled events
    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (err: any) {
    console.error("Webhook error:", err)
    // Return 200 to avoid Paystack retry storms due to transient internal errors.
    // If you'd rather retry, change to 500 (but be ready for duplicates).
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }
}