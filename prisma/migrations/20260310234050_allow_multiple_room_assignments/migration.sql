/*
  Warnings:

  - A unique constraint covering the columns `[suiteId,roomNumber]` on the table `RoomAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RoomAssignment_bookingId_key";

-- DropIndex
DROP INDEX "RoomAssignment_suiteId_roomNumber_idx";

-- CreateIndex
CREATE INDEX "RoomAssignment_bookingId_idx" ON "RoomAssignment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomAssignment_suiteId_roomNumber_key" ON "RoomAssignment"("suiteId", "roomNumber");
