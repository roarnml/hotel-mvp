/*
  Warnings:

  - A unique constraint covering the columns `[detailsId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "detailsId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "detailsId" TEXT;

-- CreateTable
CREATE TABLE "BookingDetails" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "suiteId" TEXT NOT NULL,
    "nights" INTEGER NOT NULL,
    "chaletCount" INTEGER NOT NULL DEFAULT 1,
    "pricePerNight" INTEGER NOT NULL,
    "baseAmount" INTEGER NOT NULL,
    "vatAmount" INTEGER NOT NULL,
    "transactionFee" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "pricingFormula" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingDetails_suiteId_idx" ON "BookingDetails"("suiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_detailsId_key" ON "Booking"("detailsId");

-- AddForeignKey
ALTER TABLE "BookingDetails" ADD CONSTRAINT "BookingDetails_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDetails" ADD CONSTRAINT "BookingDetails_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "Suite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_detailsId_fkey" FOREIGN KEY ("detailsId") REFERENCES "BookingDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
