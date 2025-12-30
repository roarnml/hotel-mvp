// src/services/email.service.ts
import nodemailer from "nodemailer";

export async function sendTicketEmail(to: string, subject: string, pdfUrl: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Hotel Booking" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: `<p>Your ticket is ready!</p><p><a href="${pdfUrl}">Download Ticket PDF</a></p>`,
  });
}
