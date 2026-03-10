// src/lib/paystack/client.ts
/*export async function paystackRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: any
): Promise<T> {
  const res = await fetch(`https://api.paystack.co${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return data as T;
}
*/

// src/lib/paystack/client.ts
import fs from "fs";
import path from "path";

function logPaystackApiResponse(params: {
  endpoint: string;
  method: string;
  requestBody?: any;
  responseBody: any;
  statusCode: number;
}) {
  if (process.env.PAYSTACK_DEBUG_LOGS !== "true") return;

  try {
    const logsDir = path.join(process.cwd(), "paystack-logs", "api");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeEndpoint = params.endpoint.replace(/[\/?=&]/g, "_");
    const filename = `${timestamp}_${params.method}_${safeEndpoint}.json`;

    const logData = {
      loggedAt: new Date().toISOString(),
      endpoint: params.endpoint,
      method: params.method,
      statusCode: params.statusCode,
      requestBody: params.requestBody ?? null,
      responseBody: params.responseBody,
    };

    fs.writeFileSync(
      path.join(logsDir, filename),
      JSON.stringify(logData, null, 2),
      "utf-8"
    );
  } catch (err) {
    // Never fail the request because of logging
    console.error("Paystack API logging failed:", err);
  }
}

export async function paystackRequest<T = any>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: any
): Promise<T> {
  const res = await fetch(`https://api.paystack.co${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  // 🧾 Log response (opt-in, non-blocking)
  logPaystackApiResponse({
    endpoint,
    method,
    requestBody: body,
    responseBody: data,
    statusCode: res.status,
  });

  // 🚨 Fail fast on Paystack or HTTP errors
  if (!res.ok || data?.status === false) {
    throw new Error(data?.message || "Paystack API request failed");
  }

  return data as T;
}
