interface TicketEmailPayload {
  to: string
  ticketNumber: string
  bookingRef: string
  checkInNumber: string
  guestName: string
  suiteName: string
  checkIn: Date
  checkOut: Date
}

export async function sendTicketEmail(payload: TicketEmailPayload) {
  const {
    to,
    ticketNumber,
    bookingRef,
    checkInNumber,
    guestName,
    suiteName,
    checkIn,
    checkOut,
  } = payload

  const subject = "Your Booking Is Confirmed • Hotel Reservation Ticket"

  const html = `
  <div style="background:#f6f7f9;padding:40px 0;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#0f172a;color:#ffffff;padding:24px 32px;">
        <h1 style="margin:0;font-size:22px;font-weight:600;">
          Booking Confirmed
        </h1>
        <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">
          We look forward to welcoming you
        </p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <p style="font-size:15px;color:#111827;margin:0 0 16px;">
          Dear <strong>${guestName}</strong>,
        </p>

        <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 24px;">
          Thank you for choosing our hotel. Your reservation has been successfully confirmed.
          Please find your booking details below.
        </p>

        <!-- Ticket Highlight -->
        <div style="border:1px dashed #c7d2fe;border-radius:8px;padding:20px;margin-bottom:24px;background:#f8fafc;">
          <p style="margin:0;font-size:13px;color:#475569;">
            Ticket Number
          </p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#1e293b;letter-spacing:1px;">
            ${ticketNumber}
          </p>
        </div>

        <!-- Details Table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#111827;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Booking Reference</td>
            <td style="padding:8px 0;font-weight:500;text-align:right;">${bookingRef}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Check-in Code</td>
            <td style="padding:8px 0;font-weight:500;text-align:right;">${checkInNumber}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Suite</td>
            <td style="padding:8px 0;font-weight:500;text-align:right;">${suiteName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Check-in Date</td>
            <td style="padding:8px 0;font-weight:500;text-align:right;">${checkIn.toDateString()}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">Check-out Date</td>
            <td style="padding:8px 0;font-weight:500;text-align:right;">${checkOut.toDateString()}</td>
          </tr>
        </table>

        <!-- Divider -->
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />

        <p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0;">
          Please present your <strong>ticket number</strong> at the front desk during check-in.
          If you have any questions, our support team will be happy to assist you.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:18px 32px;text-align:center;font-size:12px;color:#6b7280;">
        © ${new Date().getFullYear()} Hotel Booking System · All rights reserved
      </div>

    </div>
  </div>
  `

  return sendMail({
    to,
    subject,
    html,
    text: `
Booking Confirmed

Ticket Number: ${ticketNumber}
Booking Reference: ${bookingRef}
Check-in Code: ${checkInNumber}
Suite: ${suiteName}
Check-in: ${checkIn.toDateString()}
Check-out: ${checkOut.toDateString()}
    `,
  })
}
