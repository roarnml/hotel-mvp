-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showTodayOnlyBookings" BOOLEAN NOT NULL DEFAULT true,
    "autoFocusRoomInput" BOOLEAN NOT NULL DEFAULT true,
    "confirmBeforeCheckout" BOOLEAN NOT NULL DEFAULT true,
    "notifyCheckInSuccess" BOOLEAN NOT NULL DEFAULT true,
    "notifyVIPGuest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
