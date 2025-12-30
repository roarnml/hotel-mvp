import { PrismaClient } from "@prisma/client"
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
    const hashed = await bcrypt.hash(u.password, 10)
    await prisma.user.create({
      data: { ...u, password: hashed },
    })
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
  const guest = await prisma.guest.create({
    data: {
      name: "John Doe",
      email: "john.doe@gmail.com",
      phone: "+2348012345678",
      address: "Lagos, Nigeria",
      isVIP: true,
    },
  })

  // --------------------
  // SUITES
  // --------------------
  const deluxeSuite = await prisma.suite.create({
    data: {
      name: "Deluxe Suite",
      description: "Spacious deluxe suite with ocean view",
      price: 120000,
      images: [
        "/rooms/deluxe/business.jpg",
        "/rooms/deluxe/deluxe.jpg",
        "/rooms/deluxe/family.jpg",
      ],
      capacity: 2,
      features: ["King Bed", "Ocean View", "WiFi", "Mini Bar"],
    },
  })

  const presidentialSuite = await prisma.suite.create({
    data: {
      name: "Presidential Suite",
      description: "Luxury presidential suite with private lounge",
      price: 350000,
      images: [
        "/rooms/presidential/presidential.jpg",
        "/rooms/presidential/royal.jpg",
      ],
      capacity: 4,
      features: ["Private Lounge", "Butler Service", "Jacuzzi"],
    },
  })

  // --------------------
  // SEASONAL RATE
  // --------------------
  await prisma.seasonalRate.create({
    data: {
      suiteId: deluxeSuite.id,
      start: new Date("2025-12-15"),
      end: new Date("2026-01-10"),
      price: 150000,
      label: "Festive Season",
    },
  })

  // --------------------
  // BOOKING (PENDING)
  // --------------------
  const booking = await prisma.booking.create({
    data: {
      bookingRef: "BOOK-DEMO-001",
      suiteId: deluxeSuite.id,
      guestId: guest.id,
      name: guest.name,
      email: guest.email,
      checkIn: new Date("2025-12-20"),
      checkOut: new Date("2025-12-23"),
      status: "PENDING",
      paymentStatus: "PENDING",
    },
  })

  // --------------------
  // PAYMENT (PAYSTACK, PENDING)
  // --------------------
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: 360000,
      currency: "NGN",
      status: "PENDING",
      provider: "PAYSTACK",
      paystackReference: "PSK_TEST_REF_001",
    },
  })

  // --------------------
  // HOUSEKEEPING TASKS
  // --------------------
  const suites = [deluxeSuite, presidentialSuite]
  const statuses = ["PENDING", "IN_PROGRESS", "DONE"]

  for (let i = 0; i < 10; i++) {
    const suite = faker.helpers.arrayElement(suites)
    const staff = faker.helpers.arrayElement(housekeepingStaff)
    const status = faker.helpers.arrayElement(statuses)

    await prisma.housekeepingTask.create({
      data: {
        suiteId: suite.id,
        assignedToId: staff.id,
        status,
        startedAt: status !== "PENDING" ? faker.date.recent() : null,
        completedAt: status === "DONE" ? faker.date.recent() : null,
      },
    })
  }

  console.log("✅ Database reset & seeded successfully")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
