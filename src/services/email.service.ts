
/*
interface SendTicketEmailOptions {
  to: string
  subject?: string

  guestName: string
  bookingRef: string

  checkIn: string
  checkOut: string
  nights: number

  amountPaid: string

  suiteName: string
  roomNumber?: string | null
  capacity?: number | null
  features?: string[]

  qrCodeDataUrl: string // base64 PNG
}
// src/services/email.service.ts
import nodemailer from "nodemailer"

export async function sendTicketEmail({
  to,
  subject = "Your Booking Confirmation",
  guestName,
  bookingRef,
  checkIn,
  checkOut,
  nights,
  amountPaid,
  suiteName,
  roomNumber,
  capacity,
  features = [],
  qrCodeDataUrl,
}: {
  to: string
  subject?: string
  guestName: string
  bookingRef: string
  checkIn: string
  checkOut: string
  nights: number
  amountPaid: string
  suiteName: string
  roomNumber?: string | null
  capacity?: number | null
  features?: string[]
  qrCodeDataUrl: string
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const featureList = features.length
    ? features.map(f => `• ${f}`).join("<br />")
    : "• Premium comfort guaranteed"

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
                  Dear <strong>${guestName}</strong>,<br />
                  This email is your official booking ticket.
                </p>

                <table width="100%" cellpadding="8" cellspacing="0" style="margin:24px 0;">
                  <tr><td>Booking Ref</td><td align="right"><strong>${bookingRef}</strong></td></tr>
                  <tr><td>Suite</td><td align="right">${suiteName}</td></tr>
                  <tr><td>Room</td><td align="right">${roomNumber ?? "TBA"}</td></tr>
                  <tr><td>Capacity</td><td align="right">${capacity ?? "N/A"} Guest(s)</td></tr>
                  <tr><td>Check-in</td><td align="right">${checkIn}</td></tr>
                  <tr><td>Check-out</td><td align="right">${checkOut}</td></tr>
                  <tr><td>Nights</td><td align="right">${nights}</td></tr>
                  <tr><td>Amount Paid</td><td align="right"><strong>${amountPaid}</strong></td></tr>
                </table>

                <div style="margin:24px 0; padding:16px; background:#111; border-left:4px solid #75240E;">
                  <strong>Suite Features</strong><br /><br />
                  ${featureList}
                </div>

                <!-- QR CODE -->
                <div style="text-align:center; margin:32px 0;">
                  <p style="opacity:0.85;">Present this QR code at check-in</p>
                  <img src="${qrCodeDataUrl}" width="180" height="180" />
                  <p style="font-size:12px; opacity:0.7;">${bookingRef}</p>
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
  })

  console.log(`Ticket email sent to ${to} (${bookingRef})`)
}
*/

// src/services/email.service.ts
import nodemailer from "nodemailer"

export interface SendTicketEmailOptions {
  to: string
  guestName: string
  bookingRef: string
  checkIn: string
  checkOut: string
  nights: number
  amountPaid: string
  suiteName: string
  roomNumber?: string | null
  capacity?: number | null
  features?: string[]
  qrCodeDataUrl: string
  subject?: string
}

export async function sendTicketEmail(options: SendTicketEmailOptions) {
  const {
    to,
    subject = "Your Booking Confirmation",
    guestName,
    bookingRef,
    checkIn,
    checkOut,
    nights,
    amountPaid,
    suiteName,
    roomNumber,
    capacity,
    features = [],
    qrCodeDataUrl,
  } = options

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const featureList = features.length
    ? features.map((f) => `• ${f}`).join("<br />")
    : "• Premium comfort guaranteed"

  try {
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
                          Dear <strong>${guestName}</strong>,<br />
                          This email is your official booking ticket.
                        </p>

                        <table width="100%" cellpadding="8" cellspacing="0" style="margin:24px 0;">
                          <tr><td>Booking Ref</td><td align="right"><strong>${bookingRef}</strong></td></tr>
                          <tr><td>Suite</td><td align="right">${suiteName}</td></tr>
                          <tr><td>Room</td><td align="right">${roomNumber ?? "TBA"}</td></tr>
                          <tr><td>Capacity</td><td align="right">${capacity ?? "N/A"} Guest(s)</td></tr>
                          <tr><td>Check-in</td><td align="right">${checkIn}</td></tr>
                          <tr><td>Check-out</td><td align="right">${checkOut}</td></tr>
                          <tr><td>Nights</td><td align="right">${nights}</td></tr>
                          <tr><td>Amount Paid</td><td align="right"><strong>${amountPaid}</strong></td></tr>
                        </table>

                        <div style="margin:24px 0; padding:16px; background:#111; border-left:4px solid #75240E;">
                          <strong>Suite Features</strong><br /><br />
                          ${featureList}
                        </div>

                        <!-- QR CODE -->
                        <div style="text-align:center; margin:32px 0;">
                          <p style="opacity:0.85;">Present this QR code at check-in</p>
                          <img src="${qrCodeDataUrl}" width="180" height="180" />
                          <p style="font-size:12px; opacity:0.7;">${bookingRef}</p>
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
    })

    console.log(`✅ Ticket email sent to ${to} (${bookingRef})`)
  } catch (err) {
    console.error("❌ Failed to send ticket email:", err)
    throw err
  }
}
