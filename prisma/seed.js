/*import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Reset-seeding database...")

  // --------------------
  // USERS (SYSTEM STAFF)
  // --------------------
  const users = [
    { name: "Super User", email: "super@hotel.com", password: "supersecret", role: "SUPER_USER" },
    { name: "Admin User", email: "admin@hotel.com", password: "admin123", role: "ADMIN" },
    { name: "Front Desk Staff", email: "staff@hotel.com", password: "staff123", role: "STAFF" },
  ]

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (!existing) {
      const hashed = await bcrypt.hash(u.password, 10)
      await prisma.user.create({ data: { ...u, password: hashed } })
    }
  }

  // --------------------
  // HOUSEKEEPING STAFF
  // --------------------
  const housekeepingStaff = []
  for (let i = 0; i < 10; i++) {
    const staff = await prisma.staff.create({
      data: {
        name: faker.person.fullName(),
        role: "HOUSEKEEPING",
        isActive: true,
      },
    })
    housekeepingStaff.push(staff)
  }

  // --------------------
  // GUEST
  // --------------------
  const guestEmail = "john.doe@gmail.com"
  let guest = await prisma.guest.findUnique({ where: { email: guestEmail } })
  if (!guest) {
    guest = await prisma.guest.create({
      data: {
        name: "John Doe",
        email: guestEmail,
        phone: "+2348012345678",
        address: "Lagos, Nigeria",
        isVIP: true,
      },
    })
  }

  // --------------------
  // SUITES
  // --------------------
  const suitesData = [
    {
      name: "VIP Chalet",
      status: "AVAILABLE",
      description: `About this property
  Comfortable Accommodations: Comfort Resort & Suites offers premium VIP chalets designed for relaxation, privacy, and entertainment. Each chalet features air-conditioning, sound-proof rooms, private ensuite bathrooms, spacious seating areas, Smart TVs, and fast internet connectivity for work or leisure.

  Entertainment & Leisure: Guests enjoy exclusive access to an on-site gaming zone, a relaxing bar area, and premium in-room entertainment. The VIP Chalet is ideal for families, couples, and executives seeking comfort with a touch of luxury.

  Dining Experience: Room service is available, alongside a well-stocked bar offering a selection of drinks in a calm and stylish environment.

  Convenient Facilities: The resort provides 24-hour front desk service, concierge support, daily housekeeping, and free on-site private parking.

  Prime Location: Comfort Resort & Suites is strategically located in a serene environment, offering easy access to nearby attractions while maintaining a peaceful, private atmosphere.

  Most popular facilities
  Free Internet
  Sound-proof rooms
  Gaming Zone
  Bar
  Room Service
  Smart TV
  Free Parking`,
      price: 60000,
      capacity: 4,
      availableRooms: 2,
      images: [
        "/rooms/vip/PHOTO-2025-05-03-18-50-32.jpg",
        "/rooms/vip/PHOTO-2025-06-07-21-00-14.jpg",
        "/rooms/vip/image-iv.jpg",
      ],
      features: [
        "2 Ensuite Bedrooms",
        "Sound-proof Rooms",
        "Living Room",
        "Smart TV",
        "Gaming Zone Access",
        "Bar Access",
        "High-Speed Internet",
        "Room Service",
      ],
      video: "/rooms/vip/VIP.mp4",
    },
    {
      name: "Regular Chalet",
      status: "AVAILABLE",
      description: `About this property
  Comfortable Accommodations: Comfort Resort & Suites offers well-designed Regular Chalets that combine comfort and functionality. Each chalet includes air-conditioning, sound-proof rooms, private bathrooms, Smart TVs, and reliable internet access.

  Entertainment & Leisure: Guests have access to the resort’s gaming zone and bar, providing a relaxed and enjoyable stay for individuals, couples, and small families.

  Dining Experience: Room service is available for guests who prefer dining in a comfortable, private setting.

  Convenient Facilities: The resort features 24-hour front desk support, housekeeping services, and free on-site parking for all guests.

  Most popular facilities
  Free Internet
  Sound-proof rooms
  Gaming Zone
  Bar
  Room Service
  Smart TV
  Free Parking`,
      price: 50000,
      capacity: 2,
      availableRooms: 6,
      images: [
        "/rooms/regular/IMG_2659.jpg",
        "/rooms/regular/IMG_2687.jpg",
        "/rooms/regular/IMG_2663.jpg",
        "/rooms/regular/IMG_2710.jpg",
        "/rooms/regular/IMG_2644.jpg",
      ],
      features: [
        "2 Ensuite Bedrooms",
        "Sound-proof Rooms",
        "Living Room",
        "Smart TV",
        "Gaming Zone Access",
        "High-Speed Internet",
        "Room Service",
      ],
    },
  ]


  const suites = []
  for (const s of suitesData) {
    let suite = await prisma.suite.findUnique({ where: { name: s.name } })
    if (!suite) {
      const { video, ...dataWithoutVideo } = s
      suite = await prisma.suite.create({ data: dataWithoutVideo })
    }
    suites.push(suite)
  }

  // --------------------
  // BOOKING (PENDING)
  // --------------------
  const bookingRef = "BOOK-DEMO-001"
  let booking = await prisma.booking.findUnique({ where: { bookingRef } })
  if (!booking) {
    booking = await prisma.booking.create({
      data: {
        bookingRef,
        suiteId: suites[0].id, // VIP Chalet
        guestId: guest.id,
        name: guest.name,
        email: guest.email,
        checkIn: new Date("2025-12-20"),
        checkOut: new Date("2025-12-23"),
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    })
  }

  // --------------------
  // PAYMENT
  // --------------------
  const payRef = "PSK_TEST_REF_001"
  const existingPayment = await prisma.payment.findUnique({ where: { paystackReference: payRef } })
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: 180000,
        currency: "NGN",
        status: "PENDING",
        provider: "PAYSTACK",
        paystackReference: payRef,
      },
    })
  }

  // --------------------
  // HOUSEKEEPING TASKS
  // --------------------
  const statuses = ["PENDING", "IN_PROGRESS", "DONE"]
  for (let i = 0; i < 10; i++) {
    await prisma.housekeepingTask.create({
      data: {
        suiteId: faker.helpers.arrayElement(suites).id,
        assignedToId: faker.helpers.arrayElement(housekeepingStaff).id,
        status: faker.helpers.arrayElement(statuses),
      },
    })
  }

  console.log("✅ Database seeded with 1 VIP and 6 Regular Chalets")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
*/

import {
  PrismaClient,
  Role,
  SuiteCategory,
  SuiteStatus,
  BookingStatus,
  PaymentStatus,
  PaymentProvider,
} from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database (safe & repeatable)...")

  const passwordHash = await bcrypt.hash("Password123!", 12)

  // --------------------
  // USERS
  // --------------------
  const owner = await prisma.user.upsert({
    where: { email: "owner@hotel.test" },
    update: {},
    create: {
      name: "Hotel Owner",
      email: "owner@hotel.test",
      password: passwordHash,
      role: Role.OWNER,
      canCreateBooking: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
      canEditRoomMaintenance: true,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "manager@hotel.test" },
    update: {},
    create: {
      name: "Hotel Manager",
      email: "manager@hotel.test",
      password: passwordHash,
      role: Role.MANAGER,
      canCreateBooking: true,
      canCheckIn: true,
      canCheckOut: true,
      canAssignChalet: true,
    },
  })

  const checkinStaff = await prisma.user.upsert({
    where: { email: "checkin@hotel.test" },
    update: {},
    create: {
      name: "Front Desk",
      email: "checkin@hotel.test",
      password: passwordHash,
      role: Role.CHECKIN_STAFF,
      canCheckIn: true,
      canAssignChalet: true,
    },
  })

  // --------------------
  // SUITES (kobo)
  // --------------------
  const vipSuite = await prisma.suite.upsert({
    where: { name: "VIP Chalet" },
    update: {},
    create: {
      name: "VIP Chalet",
      category: SuiteCategory.VIP,
      description: "Exclusive VIP chalet with premium amenities.",
      price: 250_000_00, // ₦250,000
      images: ["vip-1.jpg"],
      capacity: 2,
      features: ["Private pool", "Butler service"],
      availableRooms: 1,
      status: SuiteStatus.AVAILABLE,
    },
  })

  const regularSuite = await prisma.suite.upsert({
    where: { name: "Regular Deluxe Chalet" },
    update: {},
    create: {
      name: "Regular Deluxe Chalet",
      category: SuiteCategory.REGULAR,
      description: "Comfortable deluxe chalet.",
      price: 120_000_00, // ₦120,000
      images: ["regular-1.jpg"],
      capacity: 2,
      features: ["WiFi", "Air conditioning"],
      availableRooms: 6,
      status: SuiteStatus.AVAILABLE,
    },
  })

  // --------------------
  // GUESTS
  // --------------------
  const vipGuest = await prisma.guest.upsert({
    where: { email: "ada@guest.test" },
    update: {},
    create: {
      name: "Ada VIP",
      email: "ada@guest.test",
      phone: "0800000001",
      isVIP: true,
    },
  })

  const regularGuest = await prisma.guest.upsert({
    where: { email: "john@guest.test" },
    update: {},
    create: {
      name: "John Regular",
      email: "john@guest.test",
      phone: "0800000002",
    },
  })

  // --------------------
  // BOOKINGS
  // --------------------
  const confirmedBooking = await prisma.booking.upsert({
    where: { bookingRef: "CONFIRM-001" },
    update: {},
    create: {
      bookingRef: "CONFIRM-001",
      suiteId: vipSuite.id,
      guestId: vipGuest.id,
      userId: manager.id,
      name: vipGuest.name,
      email: vipGuest.email,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 2 * 86400000),
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      ticketNumber: "TICKET-001",
      ticketIssuedAt: new Date(),
      emailSentAt: new Date(),
      amountPaid: 250_000_00,
    },
  })

  const checkedInBooking = await prisma.booking.upsert({
    where: { bookingRef: "CHECKIN-001" },
    update: {},
    create: {
      bookingRef: "CHECKIN-001",
      suiteId: regularSuite.id,
      guestId: regularGuest.id,
      userId: checkinStaff.id,
      name: regularGuest.name,
      email: regularGuest.email,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 86400000),
      status: BookingStatus.CHECKED_IN,
      paymentStatus: PaymentStatus.PAID,
      checkInNumber: "CHK-001",
      amountPaid: 120_000_00,
    },
  })

  await prisma.roomAssignment.upsert({
    where: { bookingId: checkedInBooking.id },
    update: {},
    create: {
      bookingId: checkedInBooking.id,
      suiteId: regularSuite.id,
      roomNumber: "R-03",
    },
  })

  // --------------------
  // PAYMENTS
  // --------------------
  await prisma.payment.upsert({
    where: { reference: "PAYSTACK-001" },
    update: {},
    create: {
      bookingId: confirmedBooking.id,
      reference: "PAYSTACK-001",
      provider: PaymentProvider.PAYSTACK,
      amount: 250_000_00,
      amountPaid: 250_000_00,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  })

  await prisma.payment.upsert({
    where: { reference: "CASH-001" },
    update: {},
    create: {
      bookingId: checkedInBooking.id,
      reference: "CASH-001",
      provider: PaymentProvider.CASH,
      amount: 120_000_00,
      amountPaid: 120_000_00,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    },
  })

  console.log("✅ Seed complete — safe to re-run")
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect())
