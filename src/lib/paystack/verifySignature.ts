// src/lib/paystack/verifySignature.ts
import crypto from "crypto";

export function verifyPaystackSignature(
  payload: string,
  signature: string
) {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");
  return hash === signature;
}
