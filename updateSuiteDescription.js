// updateSuiteDescription.js
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
