import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

interface PaystackInitResponse {
  status: boolean;
  message?: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bookingRef, email } = req.body;

  if (!bookingRef || !email) {
    return res.status(400).json({ error: "bookingRef and email are required" });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: { payment: true, guest: true, suite: true },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.paymentStatus === "SUCCESS") {
      return res.status(400).json({ error: "Payment already completed for this booking" });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const paystackUrl = "https://api.paystack.co/transaction/initialize";
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?bookingRef=${bookingRef}`;

    const paystackRes = await fetch(paystackUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: booking.suite.price * 100,
        reference: booking.bookingRef,
        callback_url: callbackUrl,
        metadata: {
          bookingId: booking.id,
          suiteName: booking.suite.name,
        },
      }),
    });

    // Cast the response to the typed interface
    const rawData = await paystackRes.json();

    if (
      typeof rawData !== "object" ||
      rawData === null ||
      typeof (rawData as any).status !== "boolean"
    ) {
      return res.status(500).json({ error: "Invalid Paystack response" });
    }

    const paystackData: PaystackInitResponse = rawData as PaystackInitResponse;


    if (!paystackData.status) {
      return res.status(400).json({ error: paystackData.message || "Paystack initialization failed" });
    }

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        provider: "PAYSTACK",
        paystackReference: booking.bookingRef,
        amount: booking.suite.price,
        status: "PENDING",
      },
      create: {
        bookingId: booking.id,
        provider: "PAYSTACK",
        paystackReference: booking.bookingRef,
        amount: booking.suite.price,
        status: "PENDING",
      },
    });

    return res.status(200).json({ authorizationUrl: paystackData.data?.authorization_url });
  } catch (err: any) {
    console.error("Payment initialization error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
