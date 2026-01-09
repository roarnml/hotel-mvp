// updateSuiteDescription.js
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

// Load your .env
dotenv.config()

const prisma = new PrismaClient()

// 🎯 Update variables here
const suiteId = "cmk2mqztf0004uck4fb2uuvhk" // replace with the suite ID you want to update
const newDescription = `
Comfortable Accommodations: Comfort Resort & Suites offers well-designed Regular Chalets that combine comfort, convenience, and practical functionality. Each chalet features air-conditioning, sound-proof rooms, private bathrooms, Smart TV entertainment, and reliable internet access suitable for both work and leisure.

Entertainment & Leisure: Guests have access to the resort’s gaming zone and bar, providing a relaxed and enjoyable stay for individuals, couples, and small families.

Dining Experience: Room service is available for guests who prefer dining in a comfortable and private setting.

Convenient Facilities: The resort provides 24-hour front desk support, daily housekeeping, and complimentary on-site parking to ensure a smooth and hassle-free stay.

Most Popular Facilities: Free Internet, sound-proof rooms, gaming zone, bar, room service, Smart TV, and free parking.

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
