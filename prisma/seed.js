const {
  PrismaClient,
  Role,
  SuiteCategory,
  SuiteStatus,
  BookingStatus,
  PaymentStatus,
  PaymentProvider,
} = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const now = new Date();
const atDayOffset = (days) => new Date(now.getTime() + days * DAY);
const money = (naira) => naira * 100; // Schema amounts are stored in kobo.

async function main() {
  console.log("🌱 Seeding hotel demo data...");

  const passwordHash = await bcrypt.hash("Password123!", 12);

  // STAFF
  const owner = await prisma.user.upsert({
    where: { email: "owner@hotel.test" },
    update: {
      name: "Hotel Owner",
      role: Role.OWNER,
      isActive: true,
      canCreateBooking: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
      canEditRoomMaintenance: true,
      canEditProfile: true,
    },
    create: {
      name: "Hotel Owner",
      email: "owner@hotel.test",
      password: passwordHash,
      role: Role.OWNER,
      isActive: true,
      canCreateBooking: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
      canEditRoomMaintenance: true,
      canEditProfile: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@hotel.test" },
    update: {
      name: "Hotel Manager",
      role: Role.MANAGER,
      isActive: true,
      canCreateBooking: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
      canEditRoomMaintenance: true,
      canEditProfile: true,
    },
    create: {
      name: "Hotel Manager",
      email: "manager@hotel.test",
      password: passwordHash,
      role: Role.MANAGER,
      isActive: true,
      canCreateBooking: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
      canEditRoomMaintenance: true,
      canEditProfile: true,
    },
  });

  const checkinStaff = await prisma.user.upsert({
    where: { email: "checkin@hotel.test" },
    update: {
      name: "Front Desk Staff",
      role: Role.CHECKIN_STAFF,
      isActive: true,
      canCreateBooking: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
      canEditRoomMaintenance: false,
      canEditProfile: true,
    },
    create: {
      name: "Front Desk Staff",
      email: "checkin@hotel.test",
      password: passwordHash,
      role: Role.CHECKIN_STAFF,
      isActive: true,
      canCreateBooking: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
      canEditRoomMaintenance: false,
      canEditProfile: true,
    },
  });

  for (const user of [owner, manager, checkinStaff]) {
    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        showTodayOnlyBookings: true,
        autoFocusRoomInput: true,
        confirmBeforeCheckout: true,
        notifyCheckInSuccess: true,
        notifyVIPGuest: true,
      },
      create: {
        userId: user.id,
        showTodayOnlyBookings: true,
        autoFocusRoomInput: true,
        confirmBeforeCheckout: true,
        notifyCheckInSuccess: true,
        notifyVIPGuest: true,
      },
    });
  }

  // SUITES — populate every non-generated Suite field.
  const suitesData = [
    {
      name: "VIP Chalet",
      category: SuiteCategory.VIP,
      description:
        "Premium private chalet with spacious accommodation, ensuite bedrooms, a comfortable lounge, smart entertainment, and exclusive resort amenities.",
      price: money(250000),
      images: [
        "/rooms/vip/PHOTO-2025-05-03-18-50-32.jpg",
        "/rooms/vip/PHOTO-2025-06-07-21-00-14.jpg",
        "/rooms/vip/image-iv.jpg",
      ],
      video: "/rooms/vip/VIP.mp4",
      capacity: 4,
      features: [
        "2 Ensuite Bedrooms",
        "Air Conditioning",
        "Sound-proof Rooms",
        "Living Room",
        "Smart TV",
        "Gaming Zone Access",
        "Bar Access",
        "High-Speed Internet",
        "Room Service",
        "Free Parking",
      ],
      availableRooms: 2,
      status: SuiteStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: "Regular Chalet",
      category: SuiteCategory.REGULAR,
      description:
        "Comfortable chalet with private bathroom, air conditioning, smart TV, internet access, and convenient resort facilities for couples or small families.",
      price: money(120000),
      images: [
        "/rooms/regular/IMG_2659.jpg",
        "/rooms/regular/IMG_2687.jpg",
        "/rooms/regular/IMG_2663.jpg",
        "/rooms/regular/IMG_2710.jpg",
        "/rooms/regular/IMG_2644.jpg",
      ],
      video: null,
      capacity: 2,
      features: [
        "Private Ensuite Bathroom",
        "Air Conditioning",
        "Sound-proof Rooms",
        "Smart TV",
        "Gaming Zone Access",
        "Bar Access",
        "High-Speed Internet",
        "Room Service",
        "Free Parking",
      ],
      availableRooms: 6,
      status: SuiteStatus.AVAILABLE,
      isActive: true,
    },
    {
      name: "Family Chalet",
      category: SuiteCategory.REGULAR,
      description:
        "Family-friendly chalet with extra sleeping capacity, private bathroom, lounge space, and essential comfort amenities.",
      price: money(180000),
      images: [
        "/rooms/regular/IMG_2659.jpg",
        "/rooms/regular/IMG_2687.jpg",
      ],
      video: null,
      capacity: 4,
      features: [
        "Family Sleeping Area",
        "Private Ensuite Bathroom",
        "Air Conditioning",
        "Smart TV",
        "High-Speed Internet",
        "Room Service",
        "Free Parking",
      ],
      availableRooms: 2,
      status: SuiteStatus.AVAILABLE,
      isActive: true,
    },
  ];

  const suites = {};

  for (const data of suitesData) {
    suites[data.name] = await prisma.suite.upsert({
      where: { name: data.name },
      update: { ...data },
      create: { ...data },
    });
  }

  const vipSuite = suites["VIP Chalet"];
  const regularSuite = suites["Regular Chalet"];
  const familySuite = suites["Family Chalet"];

  // GUESTS
  const vipGuest = await prisma.guest.upsert({
    where: { email: "ada@guest.test" },
    update: {
      name: "Ada VIP",
      phone: "+2348000000001",
      address: "Victoria Island, Lagos, Nigeria",
      isVIP: true,
    },
    create: {
      name: "Ada VIP",
      email: "ada@guest.test",
      phone: "+2348000000001",
      address: "Victoria Island, Lagos, Nigeria",
      isVIP: true,
    },
  });

  const regularGuest = await prisma.guest.upsert({
    where: { email: "john@guest.test" },
    update: {
      name: "John Regular",
      phone: "+2348000000002",
      address: "Ikeja, Lagos, Nigeria",
      isVIP: false,
    },
    create: {
      name: "John Regular",
      email: "john@guest.test",
      phone: "+2348000000002",
      address: "Ikeja, Lagos, Nigeria",
      isVIP: false,
    },
  });

  const familyGuest = await prisma.guest.upsert({
    where: { email: "family@guest.test" },
    update: {
      name: "The Williams Family",
      phone: "+2348000000003",
      address: "Lekki, Lagos, Nigeria",
      isVIP: false,
    },
    create: {
      name: "The Williams Family",
      email: "family@guest.test",
      phone: "+2348000000003",
      address: "Lekki, Lagos, Nigeria",
      isVIP: false,
    },
  });

  // BOOKINGS
  const confirmedBooking = await prisma.booking.upsert({
    where: { bookingRef: "CONFIRM-001" },
    update: {
      suiteId: vipSuite.id,
      guestId: vipGuest.id,
      userId: manager.id,
      name: vipGuest.name,
      email: vipGuest.email,
      checkIn: atDayOffset(1),
      checkOut: atDayOffset(3),
      amountPaid: money(500000),
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      ticketNumber: "TICKET-001",
      checkInNumber: null,
      ticketPdfUrl: null,
      ticketIssuedAt: now,
      emailSentAt: now,
    },
    create: {
      bookingRef: "CONFIRM-001",
      suiteId: vipSuite.id,
      guestId: vipGuest.id,
      userId: manager.id,
      name: vipGuest.name,
      email: vipGuest.email,
      checkIn: atDayOffset(1),
      checkOut: atDayOffset(3),
      amountPaid: money(500000),
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      ticketNumber: "TICKET-001",
      ticketIssuedAt: now,
      emailSentAt: now,
    },
  });

  const checkedInBooking = await prisma.booking.upsert({
    where: { bookingRef: "CHECKIN-001" },
    update: {
      suiteId: regularSuite.id,
      guestId: regularGuest.id,
      userId: checkinStaff.id,
      name: regularGuest.name,
      email: regularGuest.email,
      checkIn: atDayOffset(-1),
      checkOut: atDayOffset(1),
      amountPaid: money(120000),
      status: BookingStatus.CHECKED_IN,
      paymentStatus: PaymentStatus.PAID,
      ticketNumber: "TICKET-002",
      checkInNumber: "CHK-001",
      ticketIssuedAt: now,
      emailSentAt: now,
    },
    create: {
      bookingRef: "CHECKIN-001",
      suiteId: regularSuite.id,
      guestId: regularGuest.id,
      userId: checkinStaff.id,
      name: regularGuest.name,
      email: regularGuest.email,
      checkIn: atDayOffset(-1),
      checkOut: atDayOffset(1),
      amountPaid: money(120000),
      status: BookingStatus.CHECKED_IN,
      paymentStatus: PaymentStatus.PAID,
      ticketNumber: "TICKET-002",
      checkInNumber: "CHK-001",
      ticketIssuedAt: now,
      emailSentAt: now,
    },
  });

  const pendingBooking = await prisma.booking.upsert({
    where: { bookingRef: "PENDING-001" },
    update: {
      suiteId: familySuite.id,
      guestId: familyGuest.id,
      userId: owner.id,
      name: familyGuest.name,
      email: familyGuest.email,
      checkIn: atDayOffset(7),
      checkOut: atDayOffset(10),
      amountPaid: null,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      ticketNumber: null,
      checkInNumber: null,
      ticketPdfUrl: null,
      ticketIssuedAt: null,
      emailSentAt: null,
    },
    create: {
      bookingRef: "PENDING-001",
      suiteId: familySuite.id,
      guestId: familyGuest.id,
      userId: owner.id,
      name: familyGuest.name,
      email: familyGuest.email,
      checkIn: atDayOffset(7),
      checkOut: atDayOffset(10),
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  // BOOKING DETAILS
  const bookingDetailsData = [
    {
      id: "seed-details-confirm-001",
      bookingId: confirmedBooking.id,
      suiteId: vipSuite.id,
      nights: 2,
      chaletCount: 1,
      pricePerNight: money(250000),
      baseAmount: money(500000),
      vatAmount: money(0),
      transactionFee: money(0),
      totalAmount: money(500000),
      currency: "NGN",
      pricingFormula: JSON.stringify({
        source: "seed",
        pricePerNightNaira: 250000,
        nights: 2,
        chaletCount: 1,
        vatPercent: 0,
        transactionFeeNaira: 0,
      }),
    },
    {
      id: "seed-details-checkin-001",
      bookingId: checkedInBooking.id,
      suiteId: regularSuite.id,
      nights: 2,
      chaletCount: 1,
      pricePerNight: money(120000),
      baseAmount: money(240000),
      vatAmount: money(0),
      transactionFee: money(0),
      totalAmount: money(240000),
      currency: "NGN",
      pricingFormula: JSON.stringify({
        source: "seed",
        pricePerNightNaira: 120000,
        nights: 2,
        chaletCount: 1,
        vatPercent: 0,
        transactionFeeNaira: 0,
      }),
    },
    {
      id: "seed-details-pending-001",
      bookingId: pendingBooking.id,
      suiteId: familySuite.id,
      nights: 3,
      chaletCount: 1,
      pricePerNight: money(180000),
      baseAmount: money(540000),
      vatAmount: money(0),
      transactionFee: money(0),
      totalAmount: money(540000),
      currency: "NGN",
      pricingFormula: JSON.stringify({
        source: "seed",
        pricePerNightNaira: 180000,
        nights: 3,
        chaletCount: 1,
        vatPercent: 0,
        transactionFeeNaira: 0,
      }),
    },
  ];

  const detailsByBooking = {};

  for (const details of bookingDetailsData) {
    const record = await prisma.bookingDetails.upsert({
      where: { id: details.id },
      update: { ...details },
      create: { ...details },
    });

    detailsByBooking[details.bookingId] = record;
  }

  // Populate Booking.detailsId snapshot pointers.
  await prisma.booking.update({
    where: { id: confirmedBooking.id },
    data: { detailsId: detailsByBooking[confirmedBooking.id].id },
  });

  await prisma.booking.update({
    where: { id: checkedInBooking.id },
    data: { detailsId: detailsByBooking[checkedInBooking.id].id },
  });

  await prisma.booking.update({
    where: { id: pendingBooking.id },
    data: { detailsId: detailsByBooking[pendingBooking.id].id },
  });

  // BOOKING EVENTS
  const bookingEvents = [
    {
      id: "seed-event-confirm-001",
      bookingId: confirmedBooking.id,
      type: "BOOKING_CONFIRMED",
      metadata: {
        source: "seed",
        bookingRef: confirmedBooking.bookingRef,
      },
      createdAt: now,
    },
    {
      id: "seed-event-checkin-001",
      bookingId: checkedInBooking.id,
      type: "GUEST_CHECKED_IN",
      metadata: {
        source: "seed",
        roomNumber: "R-03",
      },
      createdAt: now,
    },
    {
      id: "seed-event-pending-001",
      bookingId: pendingBooking.id,
      type: "BOOKING_CREATED",
      metadata: {
        source: "seed",
        bookingRef: pendingBooking.bookingRef,
      },
      createdAt: now,
    },
  ];

  for (const event of bookingEvents) {
    await prisma.bookingEvent.upsert({
      where: { id: event.id },
      update: {
        bookingId: event.bookingId,
        type: event.type,
        metadata: event.metadata,
        createdAt: event.createdAt,
      },
      create: event,
    });
  }

  // ROOM ASSIGNMENT — use the schema's compound unique key.
  await prisma.roomAssignment.upsert({
    where: {
      suiteId_roomNumber: {
        suiteId: regularSuite.id,
        roomNumber: "R-03",
      },
    },
    update: { bookingId: checkedInBooking.id },
    create: {
      bookingId: checkedInBooking.id,
      suiteId: regularSuite.id,
      roomNumber: "R-03",
    },
  });

  // PAYMENTS
  const payments = [
    {
      bookingId: confirmedBooking.id,
      detailsId: detailsByBooking[confirmedBooking.id].id,
      reference: "PAYSTACK-001",
      provider: PaymentProvider.PAYSTACK,
      amount: money(500000),
      amountPaid: money(500000),
      currency: "NGN",
      status: PaymentStatus.PAID,
      transactionId: "SEED-TXN-001",
      receiptUrl: null,
      webhookEventId: null,
      rawResponse: {
        source: "seed",
        status: "success",
      },
      initiatedAt: now,
      paidAt: now,
      failedAt: null,
    },
    {
      bookingId: checkedInBooking.id,
      detailsId: detailsByBooking[checkedInBooking.id].id,
      reference: "CASH-001",
      provider: PaymentProvider.CASH,
      amount: money(240000),
      amountPaid: money(240000),
      currency: "NGN",
      status: PaymentStatus.PAID,
      transactionId: "SEED-TXN-002",
      receiptUrl: null,
      webhookEventId: null,
      rawResponse: {
        source: "seed",
        method: "cash",
      },
      initiatedAt: now,
      paidAt: now,
      failedAt: null,
    },
    {
      bookingId: pendingBooking.id,
      detailsId: detailsByBooking[pendingBooking.id].id,
      reference: "PAYSTACK-PENDING-001",
      provider: PaymentProvider.PAYSTACK,
      amount: money(540000),
      amountPaid: null,
      currency: "NGN",
      status: PaymentStatus.PENDING,
      transactionId: null,
      receiptUrl: null,
      webhookEventId: null,
      rawResponse: {
        source: "seed",
        status: "pending",
      },
      initiatedAt: now,
      paidAt: null,
      failedAt: null,
    },
  ];

  for (const payment of payments) {
    await prisma.payment.upsert({
      where: { reference: payment.reference },
      update: { ...payment },
      create: { ...payment },
    });
  }

  // SEASONAL RATES
  const seasonalRates = [
    {
      id: "seed-season-vip-holiday",
      suiteId: vipSuite.id,
      start: atDayOffset(30),
      end: atDayOffset(37),
      price: money(300000),
      label: "VIP Holiday Rate",
    },
    {
      id: "seed-season-regular-holiday",
      suiteId: regularSuite.id,
      start: atDayOffset(30),
      end: atDayOffset(37),
      price: money(150000),
      label: "Regular Holiday Rate",
    },
  ];

  for (const rate of seasonalRates) {
    await prisma.seasonalRate.upsert({
      where: { id: rate.id },
      update: { ...rate },
      create: { ...rate },
    });
  }

  console.log("✅ Seed complete.");
  console.log("Suites:", await prisma.suite.count());
  console.log("Staff:", await prisma.user.count());
  console.log("Guests:", await prisma.guest.count());
  console.log("Bookings:", await prisma.booking.count());
  console.log("Booking details:", await prisma.bookingDetails.count());
  console.log("Payments:", await prisma.payment.count());
  console.log("Seasonal rates:", await prisma.seasonalRate.count());
  console.log("Demo staff password: Password123!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
