/*// updateSuiteDescription.js
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

// Load your .env
dotenv.config()

const prisma = new PrismaClient()

// 🎯 Update variables here
const suiteId = "cmk2mqztf0004uck4fb2uuvhk" // replace with the suite ID you want to update
const newDescription = `
Standard 2-Bedroom Chalet:

Escape to comfort in our cozy 2-bedroom chalet, perfect for families or friends traveling together! Sleeps 4 adults 

Relax in comfort, make memories with loved ones

Ideal for a relaxing getaway at Comfort Resort & Suites, Ile-Ife.

`

async function main() {
  try {
    const updatedSuite = await prisma.suite.update({
      where: { id: suiteId },
      data: { description: newDescription },
    })

    console.log("✅ Suite description updated successfully!")
    console.log(updatedSuite)
  } catch (error) {
    console.error("❌ Error updating suite description:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
*/


// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  try {
    // Step 1️⃣: Create suites if they don't exist
    const suitesData = [
      {
        id: "cmkwo8dtb0004uct0fyj2chbu", // pre-defined ID for easy updates
        name: "Regular Deluxe Chalet",
        price: 12000000,
        isActive: true,
      },
      {
        id: "cmkwo8cbw0003uct0tnkl5gnc", // pre-defined ID for easy updates
        name: "VIP Chalet",
        price: 25000000,
        isActive: true,
      },
    ]

    for (const suite of suitesData) {
      await prisma.suite.upsert({
        where: { id: suite.id },
        update: suite,
        create: suite,
      })
    }

    console.log("✅ Suites created or upserted successfully!")

    // Step 2️⃣: Update descriptions
    const descriptions = [
      {
        id: "cmkwo8dtb0004uct0fyj2chbu",
        description: `
Standard 2-Bedroom Chalet:

Escape to comfort in our cozy 2-bedroom chalet, perfect for families or friends traveling together! Sleeps 4 adults.

Relax in comfort, make memories with loved ones.

Ideal for a relaxing getaway at Comfort Resort & Suites, Ile-Ife.
`,
      },
      {
        id: "cmkwo8cbw0003uct0tnkl5gnc",
        description: `
Deluxe 3-Bedroom Villa:

Experience luxury in our spacious 3-bedroom villa, ideal for bigger groups! Sleeps 6 adults.

Private pool, modern amenities, and unforgettable comfort.

Perfect for a lavish retreat at Comfort Resort & Suites, Ile-Ife.
`,
      },
    ]

    for (const suiteDesc of descriptions) {
      const updated = await prisma.suite.update({
        where: { id: suiteDesc.id },
        data: { description: suiteDesc.description },
      })
      console.log(`✅ Updated description for suite: ${updated.name}`)
    }

    console.log("🎯 All suite descriptions updated successfully!")
  } catch (error) {
    console.error("❌ Error during seeding:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
