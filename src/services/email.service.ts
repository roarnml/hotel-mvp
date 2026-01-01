/*

// src/services/email.service.ts
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

interface SendTicketEmailOptions {
  to: string;
  subject?: string;
  guestName?: string;
  bookingRef?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  suiteName?: string;
  amountPaid?: string;
  pdfUrl: string; // e.g. "/tickets/booking-123.pdf"
}

export async function sendTicketEmail({
  to,
  subject = "Your Booking Confirmation",
  guestName,
  bookingRef,
  checkIn,
  checkOut,
  nights = 0,
  suiteName = ,
  amountPaid,
  pdfUrl,
}: SendTicketEmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Resolve absolute file path
  const pdfPath = path.join(process.cwd(), "public", pdfUrl);

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Ticket PDF not found at ${pdfPath}`);
  }

  await transporter.sendMail({
    from: `"Comfort Resort and Suite" <${process.env.SMTP_USER}>`,
    to,
    subject,
    attachments: [
      {
        filename: `Booking-${bookingRef}.pdf`,
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
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
                <h1 style="margin:0; color:#D55605;">Comfort Resort and Suite</h1>
                <p style="margin-top:4px; font-size:14px; opacity:0.85;">
                  Affordable Luxury in a place of comfort
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 0;">
                <h2>Booking Confirmed 🎟️</h2>

                <p style="line-height:1.6;">
                  Dear <strong>${guestName}</strong>,<br />
                  Your reservation has been successfully confirmed.
                  Your official booking ticket is attached to this email as a PDF.
                </p>

                <table width="100%" cellpadding="8" cellspacing="0" style="margin:24px 0;">
                  <tr>
                    <td>Booking Reference</td>
                    <td align="right"><strong>${bookingRef}</strong></td>
                  </tr>
                  <tr>
                    <td>Suite</td>
                    <td align="right">${suiteName}</td>
                  </tr>
                  <tr>
                    <td>Check-in</td>
                    <td align="right">${checkIn}</td>
                  </tr>
                  <tr>
                    <td>Check-out</td>
                    <td align="right">${checkOut}</td>
                  </tr>
                  <tr>
                    <td>Nights</td>
                    <td align="right">${nights}</td>
                  </tr>
                  <tr>
                    <td>Amount Paid</td>
                    <td align="right"><strong>${amountPaid}</strong></td>
                  </tr>
                </table>

                <p style="font-size:14px; opacity:0.85;">
                  Please keep this ticket for check-in. Our concierge team is available
                  24/7 should you need any assistance.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #222; padding-top:24px; font-size:12px; opacity:0.75;">
                <p>
                  📍 12 Prestige Avenue, Victoria Island<br />
                  ☎️ +234 800 000 0000
                </p>
                <p>
                  © ${new Date().getFullYear()} Grand Aurora Hotel. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  });
}
*/


// src/services/email.service.ts
import nodemailer from "nodemailer"
import path from "path"
import fs from "fs"

interface SendTicketEmailOptions {
  to: string
  subject?: string

  guestName: string
  bookingRef: string

  checkIn: string
  checkOut: string
  nights: number

  amountPaid: string

  suiteName: {
    name: string
    roomNumber: string
    capacity: number
    features: string[]
  }

  pdfUrl: string // e.g. "/tickets/TKT-123.pdf"
}

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
  pdfUrl,
}: SendTicketEmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  // 📎 Resolve PDF attachment
  const pdfPath = path.join(process.cwd(), "public", pdfUrl)

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`Ticket PDF not found at ${pdfPath}`)
  }

  const featureList = suiteName.features?.length
    ? suiteName.features.map(f => `• ${f}`).join("<br />")
    : "• Premium comfort guaranteed"

  await transporter.sendMail({
    from: `"Comfort Resort & Suites" <${process.env.SMTP_USER}>`,
    to,
    subject,
    attachments: [
      {
        filename: `Booking-${bookingRef}.pdf`,
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
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
                  We’re delighted to confirm your reservation.  
                  Your official booking ticket is attached to this email.
                </p>

                <table width="100%" cellpadding="8" cellspacing="0" style="margin:24px 0; border-collapse:collapse;">
                  <tr>
                    <td>Booking Reference</td>
                    <td align="right"><strong>${bookingRef}</strong></td>
                  </tr>
                  <tr>
                    <td>Suite</td>
                    <td align="right">${suiteName.name}</td>
                  </tr>
                  <tr>
                    <td>Room Number</td>
                    <td align="right"><strong>${suiteName.roomNumber}</strong></td>
                  </tr>
                  <tr>
                    <td>Capacity</td>
                    <td align="right">${suiteName.capacity} Guest(s)</td>
                  </tr>
                  <tr>
                    <td>Check-in</td>
                    <td align="right">${checkIn}</td>
                  </tr>
                  <tr>
                    <td>Check-out</td>
                    <td align="right">${checkOut}</td>
                  </tr>
                  <tr>
                    <td>Nights</td>
                    <td align="right">${nights}</td>
                  </tr>
                  <tr>
                    <td>Amount Paid</td>
                    <td align="right"><strong>${amountPaid}</strong></td>
                  </tr>
                </table>

                <div style="margin:24px 0; padding:16px; background:#111; border-left:4px solid #75240E;">
                  <strong>Suite Features</strong><br /><br />
                  ${featureList}
                </div>

                <p style="font-size:14px; opacity:0.85;">
                  Please present your attached ticket at check-in.
                  Our concierge team is available 24/7 to assist you.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #222; padding-top:24px; font-size:12px; opacity:0.75;">
                <p>
                  📍 BLOCK 11, ONDA AKOJA FAMILY LAYOUT, PLOT 4 & 5 LGA, WEST, Ife 220101, Osun<br />
                  ☎️ +234 809 803 9194
                </p>
                <p>
                  © ${new Date().getFullYear()} Comfort Resort & Suites. All rights reserved.
                </p>
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
}
