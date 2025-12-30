// src/services/ticket.service.ts
import { prisma } from "@/lib/prisma";
import { generateTicketNumber } from "@/utils/generateTicketNumber";

export async function generateTicket(bookingId: string) {
  const ticketNumber = generateTicketNumber();
  const ticketPdfUrl = `/tickets/${ticketNumber}.pdf`; // later generate PDF file
  const now = new Date();

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { ticketNumber, ticketPdfUrl, ticketIssuedAt: now },
  });

  return booking;
}
