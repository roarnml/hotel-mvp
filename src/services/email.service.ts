// src/services/email.service.ts
import nodemailer from "nodemailer"
import QRCode from "qrcode"
import { prisma } from "@/lib/prisma"
import { PaymentStatus } from "@prisma/client"

function formatNairaFromKobo(kobo: number | null | undefined) {
  const v = Number(kobo ?? 0)
  const naira = v / 100
  return `₦${naira.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function safeText(v: any) {
  return v == null || v === "" ? "N/A" : String(v)
}

/**
 * Generate QR PNG buffer (for CID embed / attachment).
 * Use ticketNumber by default; fallback to bookingRef.
 */
export async function generateQrPngBuffer(value: string) {
  return QRCode.toBuffer(value, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  })
}

type SendTicketEmailInput = {
  to: string
  subject?: string

  // Identifiers
  bookingRef: string
  ticketNumber: string | null
  paymentReference: string | null

  // Guest / Form info (from DB)
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  guestAddress?: string | null

  // Stay info
  checkIn: string
  checkOut: string
  nights: number

  // Room info
  suiteName: string
  roomNumber?: string | null
  capacity?: number | null
  features?: string[]

  // Pricing & Payment
  pricePerNightKobo?: number | null
  chaletCount?: number | null
  baseAmountKobo?: number | null
  vatAmountKobo?: number | null
  transactionFeeKobo?: number | null
  totalAmountKobo?: number | null

  paymentProvider?: string | null
  paymentStatus?: string | null
  amountExpectedKobo?: number | null
  amountPaidKobo?: number | null
  paidAt?: string | null

  // QR
  qrPng: Buffer
  qrValue: string
}

export async function sendTicketEmail(payload: SendTicketEmailInput) {
  const {
    to,
    subject = "Your Booking Confirmation",
    bookingRef,
    ticketNumber,
    paymentReference,

    guestName,
    guestEmail,
    guestPhone,
    guestAddress,

    checkIn,
    checkOut,
    nights,

    suiteName,
    roomNumber,
    capacity,
    features = [],

    pricePerNightKobo,
    chaletCount,
    baseAmountKobo,
    vatAmountKobo,
    transactionFeeKobo,
    totalAmountKobo,

    paymentProvider,
    paymentStatus,
    amountExpectedKobo,
    amountPaidKobo,
    paidAt,

    qrPng,
    qrValue,
  } = payload

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // common: 465 = TLS, 587 = STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const featureList = features.length
    ? features.map((f) => `• ${f}`).join("<br />")
    : "• Premium comfort guaranteed"

  // CID id used in HTML
  const qrCid = "qr-ticket"

  const ticketLabel = ticketNumber ? `Ticket #${ticketNumber}` : "Ticket #TBA"

  await transporter.sendMail({
    from: `"Comfort Resort & Suites" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#000; color:#fff; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="padding:32px;">
            <!-- Header -->
            <tr>
              <td style="text-align:center;">
                <h1 style="margin:0; color:#D55605;">Comfort Resort & Suites</h1>
                <p style="margin-top:6px; font-size:14px; opacity:0.85;">
                  Affordable luxury, elevated comfort.
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 0;">
                <h2 style="margin-top:0;">Booking Confirmed 🎟️</h2>
                <p style="line-height:1.6;">
                  Dear <strong>${safeText(guestName)}</strong>,<br />
                  This email is your official booking ticket.
                </p>

                <!-- Ticket IDs -->
                <div style="margin:18px 0; padding:14px; background:#111; border-left:4px solid #75240E;">
                  <div style="font-size:14px; opacity:0.9;">
                    <div><strong>${ticketLabel}</strong></div>
                    <div style="margin-top:6px;">Booking Ref: <strong>${safeText(bookingRef)}</strong></div>
                    <div style="margin-top:6px;">Payment Ref: <strong>${safeText(paymentReference)}</strong></div>
                  </div>
                </div>

                <!-- Guest / Form Info -->
                <h3 style="margin:24px 0 10px;">Guest Information</h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                  <tr><td style="border-bottom:1px solid #222;">Full Name</td><td style="border-bottom:1px solid #222;" align="right"><strong>${safeText(guestName)}</strong></td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Email</td><td style="border-bottom:1px solid #222;" align="right">${safeText(guestEmail)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Phone</td><td style="border-bottom:1px solid #222;" align="right">${safeText(guestPhone)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Address</td><td style="border-bottom:1px solid #222;" align="right">${safeText(guestAddress)}</td></tr>
                </table>

                <!-- Room / Stay Info -->
                <h3 style="margin:24px 0 10px;">Booking Details</h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                  <tr><td style="border-bottom:1px solid #222;">Suite</td><td style="border-bottom:1px solid #222;" align="right"><strong>${safeText(suiteName)}</strong></td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Room Number</td><td style="border-bottom:1px solid #222;" align="right">${safeText(roomNumber ?? "TBA")}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Capacity</td><td style="border-bottom:1px solid #222;" align="right">${safeText(capacity ?? "N/A")} Guest(s)</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Check-in</td><td style="border-bottom:1px solid #222;" align="right">${safeText(checkIn)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Check-out</td><td style="border-bottom:1px solid #222;" align="right">${safeText(checkOut)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Nights</td><td style="border-bottom:1px solid #222;" align="right">${safeText(nights)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Chalet Count</td><td style="border-bottom:1px solid #222;" align="right">${safeText(chaletCount ?? 1)}</td></tr>
                </table>

                <div style="margin:18px 0; padding:16px; background:#111; border-left:4px solid #75240E;">
                  <strong>Suite Features</strong><br /><br />
                  ${featureList}
                </div>

                <!-- Payment Info -->
                <h3 style="margin:24px 0 10px;">Payment Information</h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                  <tr><td style="border-bottom:1px solid #222;">Provider</td><td style="border-bottom:1px solid #222;" align="right">${safeText(paymentProvider)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Status</td><td style="border-bottom:1px solid #222;" align="right"><strong>${safeText(paymentStatus)}</strong></td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Paid At</td><td style="border-bottom:1px solid #222;" align="right">${safeText(paidAt)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Amount Expected</td><td style="border-bottom:1px solid #222;" align="right"><strong>${formatNairaFromKobo(amountExpectedKobo)}</strong></td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Amount Paid</td><td style="border-bottom:1px solid #222;" align="right"><strong>${formatNairaFromKobo(amountPaidKobo ?? amountExpectedKobo)}</strong></td></tr>
                </table>

                <!-- Pricing Breakdown -->
                <h3 style="margin:24px 0 10px;">Pricing Breakdown</h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                  <tr><td style="border-bottom:1px solid #222;">Price / Night</td><td style="border-bottom:1px solid #222;" align="right">${formatNairaFromKobo(pricePerNightKobo)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Base Amount</td><td style="border-bottom:1px solid #222;" align="right">${formatNairaFromKobo(baseAmountKobo)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">VAT</td><td style="border-bottom:1px solid #222;" align="right">${formatNairaFromKobo(vatAmountKobo)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;">Transaction Fee</td><td style="border-bottom:1px solid #222;" align="right">${formatNairaFromKobo(transactionFeeKobo)}</td></tr>
                  <tr><td style="border-bottom:1px solid #222;"><strong>Total</strong></td><td style="border-bottom:1px solid #222;" align="right"><strong>${formatNairaFromKobo(totalAmountKobo)}</strong></td></tr>
                </table>

                <!-- QR CODE (CID inline) -->
                <div style="text-align:center; margin:32px 0;">
                  <p style="opacity:0.85;">Present this QR code at check-in</p>
                  <img src="cid:${qrCid}" width="180" height="180" alt="QR Code" style="display:inline-block;" />
                  <p style="font-size:12px; opacity:0.7;">QR Value: ${safeText(qrValue)}</p>
                </div>

                <p style="font-size:14px; opacity:0.85;">
                  Our concierge team is available 24/7.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #222; padding-top:24px; font-size:12px; opacity:0.75;">
                <p>
                  📍 BLOCK 11, ONDA AKOJA FAMILY LAYOUT, ILE-IFE, OSUN<br />
                  ☎️ +234 809 803 9194
                </p>
                <p>© ${new Date().getFullYear()} Comfort Resort & Suites</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
    attachments: [
      // Inline CID attachment (renders in email clients)
      {
        filename: `${ticketNumber ?? bookingRef}.png`,
        content: qrPng,
        contentType: "image/png",
        cid: qrCid,
      },
      // Optional: also attach as a normal attachment (some clients show inline still)
      {
        filename: `${ticketNumber ?? bookingRef}.png`,
        content: qrPng,
        contentType: "image/png",
      },
    ],
  })
}

/**
 * Webhook-friendly helper:
 * - idempotent: won't resend if emailSentAt already set
 * - requires booking is PAID
 * - fetches latest BookingDetails and Payment info
 * - uses ticketNumber for QR if available
 */
export async function sendTicketEmailForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      suite: true,
      guest: true,
      roomAssignment: true,
      details: { orderBy: { createdAt: "desc" }, take: 1 },
      payment: true,
    },
  })

  if (!booking) throw new Error("Booking not found for email sending")
  if (booking.emailSentAt) return { skipped: true, reason: "already_sent" }
  if (booking.paymentStatus !== PaymentStatus.PAID) return { skipped: true, reason: "not_paid" }

  const details = booking.details?.[0]
  if (!details) throw new Error("BookingDetails not found for email sending")

  const payment = booking.payment
  if (!payment) throw new Error("Payment not found for booking email sending")

  const nights =
    details.nights ??
    Math.max(
      Math.ceil(
        (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      1
    )

  // Prefer ticketNumber for QR value (stronger identifier), fallback to bookingRef
  const qrValue = booking.ticketNumber ?? booking.bookingRef
  const qrPng = await generateQrPngBuffer(qrValue)

  // Send first. Only mark emailSentAt if successful.
  await sendTicketEmail({
    to: booking.email,
    guestName: booking.name,
    guestEmail: booking.email,
    guestPhone: booking.guest?.phone ?? null,
    guestAddress: booking.guest?.address ?? null,

    bookingRef: booking.bookingRef,
    ticketNumber: booking.ticketNumber ?? null,
    paymentReference: payment.reference ?? null,

    checkIn: new Date(booking.checkIn).toDateString(),
    checkOut: new Date(booking.checkOut).toDateString(),
    nights,

    suiteName: booking.suite.name,
    roomNumber: booking.roomAssignment?.roomNumber ?? null,
    capacity: booking.suite.capacity ?? null,
    features: booking.suite.features ?? [],

    pricePerNightKobo: details.pricePerNight,
    chaletCount: details.chaletCount,
    baseAmountKobo: details.baseAmount,
    vatAmountKobo: details.vatAmount,
    transactionFeeKobo: details.transactionFee,
    totalAmountKobo: details.totalAmount,

    paymentProvider: payment.provider,
    paymentStatus: payment.status,
    amountExpectedKobo: payment.amount,
    amountPaidKobo: payment.amountPaid ?? null,
    paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,

    qrPng,
    qrValue,
  })

  await prisma.booking.update({
    where: { id: bookingId },
    data: { emailSentAt: new Date() },
  })

  return { sent: true }
}