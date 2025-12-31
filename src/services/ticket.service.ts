/*import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"
import { prisma } from "@/lib/prisma"

export async function generateTicket(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) throw new Error("Booking not found")

  const ticketNumber =
    booking.ticketNumber ?? `TKT-${Date.now()}-${Math.floor(Math.random() * 999)}`

  // 📁 Store PDFs publicly
  const ticketsDir = path.join(process.cwd(), "public", "tickets")
  if (!fs.existsSync(ticketsDir)) fs.mkdirSync(ticketsDir, { recursive: true })

  const fileName = `${ticketNumber}.pdf`
  const filePath = path.join(ticketsDir, fileName)

  // 🧾 Create PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  doc.pipe(fs.createWriteStream(filePath))

  doc
    .fontSize(22)
    .text("Hotel Booking Ticket", { align: "center" })
    .moveDown()

  doc.fontSize(14)
  doc.text(`Ticket Number: ${ticketNumber}`)
  doc.text(`Booking Ref: ${booking.bookingRef}`)
  doc.text(`Guest: ${booking.name}`)
  doc.text(`Email: ${booking.email}`)
  doc.moveDown()

  doc.text(`Check-in: ${booking.checkIn.toDateString()}`)
  doc.text(`Check-out: ${booking.checkOut.toDateString()}`)
  doc.moveDown()

  doc.text(`Amount Paid: ₦${(booking.amountPaid ?? 0) / 100}`)
  doc.moveDown(2)

  doc
    .fontSize(12)
    .text("Please present this ticket at check-in.", {
      align: "center",
    })

  doc.end()

  const pdfUrl = `/tickets/${fileName}`

  // 💾 Save to DB
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      ticketNumber,
      ticketPdfUrl: pdfUrl,
      ticketIssuedAt: new Date(),
    },
  })

  return updatedBooking
}*/

import { prisma } from "@/lib/prisma"
import puppeteer from "puppeteer-core" // notice puppeteer-core
import path from "path"
import fs from "fs"

export async function generateTicket(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) throw new Error("Booking not found")

  const ticketNumber =
    booking.ticketNumber ?? `TKT-${Date.now()}-${Math.floor(Math.random() * 999)}`

  // Public folder
  const ticketsDir = path.join(process.cwd(), "public", "tickets")
  if (!fs.existsSync(ticketsDir)) fs.mkdirSync(ticketsDir, { recursive: true })

  const fileName = `${ticketNumber}.pdf`
  const filePath = path.join(ticketsDir, fileName)

  // HTML template
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f7f7f7; margin:0; }
          .card { max-width: 600px; margin: 50px auto; padding: 30px; background:#fff; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.2);}
          h1 { text-align:center; color:#D55605; }
          .section { margin:15px 0; }
          .qr { text-align:center; margin-top:20px;}
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🎟️ Hotel Booking Ticket</h1>
          <div class="section"><strong>Ticket Number:</strong> ${ticketNumber}</div>
          <div class="section"><strong>Booking Ref:</strong> ${booking.bookingRef}</div>
          <div class="section"><strong>Guest:</strong> ${booking.name}</div>
          <div class="section"><strong>Email:</strong> ${booking.email}</div>
          <div class="section"><strong>Check-In:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</div>
          <div class="section"><strong>Check-Out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</div>
          <div class="section"><strong>Amount Paid:</strong> ₦${(booking.amountPaid ?? 0)/100}</div>
          <div class="qr">🔗 QR here if needed</div>
        </div>
      </body>
    </html>
  `

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // <- your system Chrome path
  })

  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: "networkidle0" })

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
  })

  await browser.close()

  const pdfUrl = `/tickets/${fileName}`

  // Save to DB
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      ticketNumber,
      ticketPdfUrl: pdfUrl,
      ticketIssuedAt: new Date(),
    },
  })

  return updatedBooking
}
