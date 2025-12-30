// server-actions.ts
import { prisma } from "@/lib/prisma";

export async function getArrivals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      checkIn: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      guest: true,
      suite: true,
    },
  });

  return bookings.map((b) => ({
    id: b.id,
    guestName: b.guest.name,
    suite: b.suite.name,
    checkIn: b.checkIn.toISOString().split("T")[0],
    vip: b.guest.isVIP,
    status: b.status === "CHECKED_IN" ? "Checked-in" : "Pending",
  }));
}

export async function checkInArrival(bookingId: string) {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CHECKED_IN" },
  });
}

export async function toggleVIPArrival(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { guest: true },
  });
  if (!booking || !booking.guest) throw new Error("Booking not found");

  const updatedGuest = await prisma.guest.update({
    where: { id: booking.guest.id },
    data: { isVIP: !booking.guest.isVIP },
  });

  return {
    bookingId,
    vip: updatedGuest.isVIP,
  };
}
