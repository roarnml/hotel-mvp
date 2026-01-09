/*
import { prisma } from "@/lib/prisma"
import path from "path"
import fs from "fs"
import QRCode from "qrcode"
import pdf from "html-pdf-node"

export async function generateTicket(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) throw new Error("Booking not found")

  const ticketNumber =
    booking.ticketNumber ??
    `TKT-${Date.now()}-${Math.floor(Math.random() * 999)}`

  // ⚠️ TEMPORARY storage on Vercel; persist ticketPdfUrl in DB
  const ticketsDir = path.join(process.cwd(), "public", "tickets")
  if (!fs.existsSync(ticketsDir)) {
    fs.mkdirSync(ticketsDir, { recursive: true })
  }

  const fileName = `${ticketNumber}.pdf`
  const filePath = path.join(ticketsDir, fileName)

  // 🔳 Generate QR Code (bookingRef)
  const qrCodeDataUrl = await QRCode.toDataURL(booking.bookingRef, {
    margin: 1,
    width: 180,
    color: {
      dark: "#75240E",
      light: "#FFFFFF",
    },
  })

  // 🧾 Ticket HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin:0; padding:0; background:#000; font-family:Arial, Helvetica, sans-serif; color:#fff; }
  .ticket { width:100%; padding:32px; background:#000; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #75240E; padding-bottom:16px; margin-bottom:24px; }
  .hotel-info { max-width:70%; }
  .hotel-info h2 { margin:0 0 6px 0; color:#D55605; font-size:20px; }
  .hotel-info p { margin:2px 0; font-size:12px; color:#ffffffcc; }
  .logo img { width:90px; height:auto; }
  .section { margin-bottom:18px; }
  .label { font-size:11px; color:#ffffff99; margin-bottom:4px; }
  .value { font-size:14px; font-weight:bold; color:#fff; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .highlight { background:#75240E; padding:14px; border-radius:6px; margin-top:16px; }
  .highlight .value { font-size:16px; color:#fff; }
  .footer { margin-top:30px; padding-top:20px; border-top:2px dashed #75240E; display:flex; justify-content:space-between; align-items:center; }
  .qr img { width:160px; height:160px; }
  .ref { font-size:12px; color:#ffffffaa; margin-top:6px; text-align:center; }
</style>
</head>
<body>
<div class="ticket">
  <div class="header">
    <div class="hotel-info">
      <h2>Comfort Resort & Suites</h2>
      <p>BLOCK 11, Plot 4 & 5 Francis Elusogbon Avenue, Onda Akoja Family Layout, Aba Iya Gani, Dangote Bus Stop, off Ilesa Road, Ile-Ife 220101, Osun</p>
      <p>📞 +234 809 803 9194</p>
      <p>✉️ comfortrs@outlook.com</p>
    </div>
    <div class="logo">
      <img src="${process.env.NEXT_PUBLIC_BASE_URL}/logo/logo.png" />
    </div>
  </div>
  <div class="grid">
    <div class="section">
      <div class="label">Guest Name</div>
      <div class="value">${booking.name}</div>
    </div>
    <div class="section">
      <div class="label">Email</div>
      <div class="value">${booking.email}</div>
    </div>
    <div class="section">
      <div class="label">Check-In</div>
      <div class="value">${new Date(booking.checkIn).toLocaleDateString()}</div>
    </div>
    <div class="section">
      <div class="label">Check-Out</div>
      <div class="value">${new Date(booking.checkOut).toLocaleDateString()}</div>
    </div>
  </div>
  <div class="highlight">
    <div class="label">Amount Paid</div>
    <div class="value">₦${((booking.amountPaid ?? 0) / 100).toLocaleString()}</div>
  </div>
  <div class="footer">
    <div>
      <div class="label">Booking Reference</div>
      <div class="value">${booking.bookingRef}</div>
      <div class="label" style="margin-top:10px;">Ticket Number</div>
      <div class="value">${ticketNumber}</div>
    </div>
    <div class="qr">
      <img src="${qrCodeDataUrl}" />
      <div class="ref">${booking.bookingRef}</div>
    </div>
  </div>
</div>
</body>
</html>
`

  // ⚡ Generate PDF with html-pdf-node
  const file = { content: html }
  await pdf.generatePdf(file, { path: filePath })

  const pdfUrl = `/tickets/${fileName}`

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
*/
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export async function generateTicket(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  const ticketNumber = booking.ticketNumber ?? `TKT-${Date.now()}-${Math.floor(Math.random() * 999)}`;

  // Ticket storage
  const ticketsDir = path.join(process.cwd(), "/tickets");
  if (!fs.existsSync(ticketsDir)) fs.mkdirSync(ticketsDir, { recursive: true });

  const fileName = `${ticketNumber}.pdf`;
  const filePath = path.join(ticketsDir, fileName);

  // Generate QR code
  const qrCodeDataUrl = await QRCode.toDataURL(booking.bookingRef, {
    margin: 1,
    width: 160,
    color: { dark: "#75240E", light: "#FFFFFF" },
  });

  // PDFKit document
  const doc = new PDFDocument({ size: "A4", margins: { top: 32, bottom: 32, left: 32, right: 32 } });

  // Use a real font to avoid ENOENT
  const fontPath = path.join(process.cwd(), "/fonts/Helvetica.ttf");
  if (!fs.existsSync(fontPath)) throw new Error("Font file not found: " + fontPath);
  doc.font(fontPath);

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Background
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#000");

  // HEADER
  const headerY = 32;
  const leftX = 32;
  const rightX = doc.page.width - 122;

  doc.fillColor("#D55605").fontSize(20).text("Comfort Resort and Suites", leftX, headerY);
  doc.fillColor("#ffffffcc").fontSize(12)
    .text("BLOCK 11, Plot 4 & 5 Francis Elusogbon Avenue, Onda Akoja Family Layout, Aba Iya Gani, Dangote Bus Stop, off Ilesa Road, Ile-Ife 220101, Osun", leftX, headerY + 28)
    .text("📞 +234 809 803 9194", leftX, headerY + 44)
    .text("✉️ comfortrs@outlook.com", leftX, headerY + 60);

  // Logo
  const logoPath = path.join(process.cwd(), "/logo/logo.png");
  if (fs.existsSync(logoPath)) doc.image(logoPath, rightX, headerY, { width: 90 });

  // DETAILS GRID
  let y = headerY + 120;
  const details = [
    { label: "Guest Name", value: booking.name },
    { label: "Email", value: booking.email },
    { label: "Check-In", value: new Date(booking.checkIn).toLocaleDateString() },
    { label: "Check-Out", value: new Date(booking.checkOut).toLocaleDateString() },
  ];
  const gapY = 36;

  for (let i = 0; i < details.length; i += 2) {
    const left = details[i];
    const right = details[i + 1];

    doc.fillColor("#ffffff99").fontSize(11).text(left.label, leftX, y);
    doc.fillColor("#fff").fontSize(14).text(left.value, leftX, y + 12);

    if (right) {
      const colX = doc.page.width / 2 + 16;
      doc.fillColor("#ffffff99").fontSize(11).text(right.label, colX, y);
      doc.fillColor("#fff").fontSize(14).text(right.value, colX, y + 12);
    }

    y += gapY;
  }

  // Amount paid highlight
  y += 10;
  doc.roundedRect(leftX, y, doc.page.width - 64, 50, 6).fill("#75240E");
  doc.fillColor("#fff").fontSize(16).text(
    `₦${((booking.amountPaid ?? 0) / 100).toLocaleString()}`,
    leftX + 12,
    y + 14
  );

  // Footer
  y += 80;
  doc.moveTo(leftX, y).lineTo(doc.page.width - 32, y).dash(5, { space: 5 }).stroke("#75240E").undash();
  const footerY = y + 10;

  doc.fillColor("#ffffff99").fontSize(11).text("Booking Reference", leftX, footerY);
  doc.fillColor("#fff").fontSize(14).text(booking.bookingRef, leftX, footerY + 12);
  doc.fillColor("#ffffff99").fontSize(11).text("Ticket Number", leftX, footerY + 40);
  doc.fillColor("#fff").fontSize(14).text(ticketNumber, leftX, footerY + 52);

  // QR code on the right
  const qrX = doc.page.width - 192;
  const qrY = footerY;
  const qrImage = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
  doc.image(Buffer.from(qrImage, "base64"), qrX, qrY, { width: 160, height: 160 });
  doc.fillColor("#ffffffaa").fontSize(12).text(booking.bookingRef, qrX, qrY + 165, { width: 160, align: "center" });

  doc.end();
  await new Promise<void>((resolve) => writeStream.on("finish", resolve));

  const pdfUrl = `/tickets/${fileName}`;
  return prisma.booking.update({
    where: { id: bookingId },
    data: { ticketNumber, ticketPdfUrl: pdfUrl, ticketIssuedAt: new Date() },
  });
}
