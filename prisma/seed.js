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
      description: "Luxury VIP chalet with 2 ensuite bedrooms and fully equipped living space",
      price: 60000,
      capacity: 4,
      images: [
        "/rooms/vip/PHOTO-2025-05-03-18-50-32.jpg",
        "/rooms/vip/PHOTO-2025-06-07-21-00-14.jpg",
        "/rooms/vip/image-iv.jpg",
      ],
      features: [
        "2 Ensuite Bedrooms",
        "Living Room",
        "Smart TV",
        "Kitchen",
        "Microwave Oven",
        "Mini Fridge",
        "Cooking Utensils",
      ],
      video: "/rooms/vip/VIP.mp4",
    },
    ...Array.from({ length: 6 }).map((_, i) => ({
      name: `Regular Chalet ${i + 1}`,
      description: "Comfortable 2-bedroom ensuite chalet ideal for regular guests",
      price: 50000,
      capacity: 2,
      images: [
        "/rooms/regular/IMG_2659.jpg",
        "/rooms/regular/IMG_2687.jpg",
        "/rooms/regular/IMG_2663.jpg",
        "/rooms/regular/IMG_2710.jpg",
        "/rooms/regular/IMG_2644.jpg",
      ],
      features: [
        "2 Ensuite Bedrooms",
        "Living Room",
        "Comfortable Sofa",
        "Smart TV",
        "Kitchen",
        "Microwave Oven",
        "Mini Fridge",
      ],
    })),
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
