/*// server-actions.ts
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
    guestName: b.guest?.name || "Unknown Guest",
    suite: b.suite.name,
    checkIn: b.checkIn.toISOString().split("T")[0],
    vip: b.guest?.isVIP ?? false,
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
*/

// server-actions.ts
import { prisma } from "@/lib/prisma";

interface ArrivalFilters {
  vip: string;       // "true" | "false"
  suiteType: string; // "VIP" | "Regular"
  status: string;    // "Pending" | "Checked-in"
}

export async function getArrivals(filters?: ArrivalFilters) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const where: any = {
    checkIn: { gte: today, lt: tomorrow },
  };

  // Status filter
  if (filters?.status) {
    where.status =
      filters.status === "Pending" ? "PENDING" : "CHECKED_IN";
  }

  // VIP filter
  if (filters?.vip) {
    where.guest = { isVIP: filters.vip === "true" };
  }

  // Suite type filter
  if (filters?.suiteType) {
    where.suite = {
      category:
        filters.suiteType === "VIP" ? "VIP" : "REGULAR",
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { guest: true, suite: true },
    orderBy: { checkIn: "asc" }, // optional sorting
  });

  return bookings.map((b) => ({
    id: b.id,
    guestName: b.guest?.name || "Unknown Guest",
    suite: b.suite.name,
    checkIn: b.checkIn.toISOString().split("T")[0],
    vip: b.guest?.isVIP ?? false,
    status: b.status === "CHECKED_IN" ? "Checked-in" : "Pending",
  }));
}


// Check-in a booking
export async function checkInArrival(bookingId: string) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { suite: true },
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.status === "CHECKED_IN") throw new Error("Already checked-in");
    if (booking.status !== "CONFIRMED" || !booking.emailSentAt)
      throw new Error("Booking not eligible for check-in");

    // Assign room number
    const availableRooms = booking.suite.availableRooms;
    if (availableRooms <= 0) throw new Error("No rooms available");

    const roomNumber = `CH-${booking.suite.name}-${availableRooms}`;

    // Create room assignment
    await tx.roomAssignment.create({
      data: {
        bookingId: booking.id,
        suiteId: booking.suite.id,
        roomNumber,
      },
    });

    // Update booking and suite atomically
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: "CHECKED_IN" },
    });

    await tx.suite.update({
      where: { id: booking.suite.id },
      data: { availableRooms: { decrement: 1 } },
    });

    return { bookingId, roomNumber };
  });
}

// Toggle VIP status
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

  return { bookingId, vip: updatedGuest.isVIP };
}
