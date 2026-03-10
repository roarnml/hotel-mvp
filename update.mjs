/*// updateSuiteDescription.js
import { PrismaClient, SuiteStatus, SuiteCategory } from "@prisma/client"
import dotenv from "dotenv"

// Load your .env
dotenv.config()


const prisma = new PrismaClient()


// --------------------
// SUITES (updated)
// --------------------
const vipSuite = await prisma.suite.upsert({
  where: { id: "cmkwo8cbw0003uct0tnkl5gnc" },
  update: {},
  create: {
    id: "cmkwo8cbw0003uct0tnkl5gnc",
    name: "VIP Chalet",
    category: SuiteCategory.VIP,
    description: `
Exclusive VIP Chalet

Indulge in luxury in our VIP Chalet! Bigger space, upgraded comforts:

- 2 en-suite bedrooms with King size beds
- Expansive living area
- Fully-equipped kitchen (fridge, microwave, etc.)
- More space to unwind, extra perks for a VIP experience

Treat yourself to the best at Comfort Resort & Suites, Ile-Ife.
    `,
    price: 6200000, // ₦62,000.00
    images: ["/rooms/vip/vip-1.jpg", "/rooms/vip/vip-2.jpg"],
    capacity: 4,
    features: [
      "2 en-suite bedrooms with King size beds",
      "Expansive living area",
      "Fully-equipped kitchen (fridge, microwave, etc.)",
      "More space to unwind, extra perks for a VIP experience"
    ],
    availableRooms: 1,
    status: SuiteStatus.AVAILABLE,
  },
});

const regularSuite = await prisma.suite.upsert({
  where: { id: "cmkwo8dtb0004uct0fyj2chbu" },
  update: {},
  create: {
    id: "cmkwo8dtb0004uct0fyj2chbu",
    name: "Regular Deluxe Chalet",
    category: SuiteCategory.REGULAR,
    description: `
Standard 2-Bedroom Chalet

Escape to comfort in our cozy 2-bedroom chalet, perfect for families or friends traveling together! Sleeps 4 adults, with:

- 2 en-suite bedrooms
- Spacious living room
- Fully-equipped kitchen (fridge, microwave, etc.)
- Relax in comfort, make memories with loved ones

Ideal for a relaxing getaway at Comfort Resort & Suites, Ile-Ife.
    `,
    price: 5100000, // ₦51,000.00
    images: [
      "/rooms/regular/regular-1.JPG",
      "/rooms/regular/regular-2.JPG",
      "/rooms/regular/regular-3.JPG",
      "/rooms/regular/regular-4.JPG",
      "/rooms/regular/regular-5.JPG"
    ],
    capacity: 4,
    features: [
      "2 en-suite bedrooms",
      "Spacious living room",
      "Fully-equipped kitchen (fridge, microwave, etc.)",
      "Relax in comfort, make memories with loved ones",
      "WiFi",
      "Air conditioning"
    ],
    availableRooms: 6,
    status: SuiteStatus.AVAILABLE,
  },
});
*/

// updateSuites.ts
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

dotenv.config()
const prisma = new PrismaClient()

async function main() {
  try {
    // --------------------
    // VIP Chalet
    // --------------------
    const vipSuite = await prisma.suite.updateMany({
      where: { name: "VIP Chalet" },
      data: {
        description: `
Exclusive VIP Chalet:

Indulge in luxury in our VIP Chalet! Bigger space, upgraded comforts;
2 en-suite bedrooms with King size beds, Expansive living area, Fully-equipped kitchen (fridge, microwave, etc.)
More space to unwind, extra perks for a VIP experience.

Treat yourself to the best at Comfort Resort & Suites, Ile-Ife.
        `,
        images: ["/rooms/vip/vip-1.jpg", "/rooms/vip/vip-2.jpg"],
        price: 6200000
      }
    })

    console.log(`✅ VIP Chalet updated: ${vipSuite.count} record(s)`)

    // --------------------
    // Regular Deluxe Chalet
    // --------------------
    const regularSuite = await prisma.suite.updateMany({
      where: { name: "Regular Deluxe Chalet" },
      data: {
        description: `
Standard 2-Bedroom Chalet:

Escape to comfort in our cozy 2-bedroom chalet, perfect for families or friends traveling together! Sleeps 4 adults, with;
2 en-suite bedrooms, Spacious living room, Fully-equipped kitchen (fridge, microwave, etc.), Relax in comfort, make memories with loved ones
Ideal for a relaxing getaway at Comfort Resort & Suites, Ile-Ife.
        `,
        images: [
          "/rooms/regular/regular-1.JPG",
          "/rooms/regular/regular-2.JPG",
          "/rooms/regular/regular-3.JPG",
          "/rooms/regular/regular-4.JPG",
          "/rooms/regular/regular-5.JPG"
        ],
        price: 5100000
      }
    })

    console.log(`✅ Regular Deluxe Chalet updated: ${regularSuite.count} record(s)`)
  } catch (err) {
    console.error("❌ Error updating suites:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
