import fs from "fs";
import path from "path";

export async function logPaystackPayload({
  event,
  payload,
  signatureValid,
}: {
  event: string;
  payload: any;
  signatureValid: boolean;
}) {
  // Kill switch — logging must be opt-in
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return;

  try {
    const logsDir = path.join(process.cwd(), "paystack-logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${timestamp}_${event}.json`;

    const filePath = path.join(logsDir, filename);

    const data = {
      receivedAt: new Date().toISOString(),
      event,
      signatureValid,
      payload,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Never break the webhook because of logging
    console.error("Paystack payload logging failed:", err);
  }
}
