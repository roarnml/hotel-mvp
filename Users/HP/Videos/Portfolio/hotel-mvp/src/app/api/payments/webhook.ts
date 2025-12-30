import type { NextApiRequest, NextApiResponse } from "next"
import { PrismaClient, PaymentStatus, BookingStatus } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { reference } = req.query
    if (!reference || typeof reference !== "string") {
      return res.status(400).send("Missing payment reference")
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })
    const data = await verifyResponse.json()

    if (!data.status || data.data.status !== "success") {
      return res.status(400).send("Payment verification failed")
    }

    // Update DB
    const payment = await prisma.payment.update({
      where: { paystackReference: reference },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionId: data.data.id.toString(),
        paidAt: new Date(data.data.paid_at * 1000),
        receiptUrl: data.data.gateway_response,
      },
      include: { booking: true },
    })

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: PaymentStatus.SUCCESS, status: BookingStatus.CONFIRMED },
    })

    // Redirect to a front-end page that shows the ticket/download
    res.redirect(`/booking/success?bookingRef=${payment.booking.bookingRef}`)
  } catch (err) {
    console.error("Payment callback error:", err)
    res.status(500).send("Internal server error")
  }
}
