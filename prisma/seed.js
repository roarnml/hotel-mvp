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
      status: "ACTIVE",
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
      status: "ACTIVE",
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
