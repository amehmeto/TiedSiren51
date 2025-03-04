-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BlockSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "minutesLeft" TEXT,
    "startedAt" TEXT NOT NULL,
    "endedAt" TEXT NOT NULL,
    "startNotificationId" TEXT NOT NULL,
    "endNotificationId" TEXT NOT NULL,
    "blockingConditions" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Blocklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sirens" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Siren" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "name" TEXT,
    "icon" TEXT
);

-- CreateTable
CREATE TABLE "_BlockSessionToBlocklist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BlockSessionToBlocklist_A_fkey" FOREIGN KEY ("A") REFERENCES "BlockSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlockSessionToBlocklist_B_fkey" FOREIGN KEY ("B") REFERENCES "Blocklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BlockSessionToDevice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BlockSessionToDevice_A_fkey" FOREIGN KEY ("A") REFERENCES "BlockSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlockSessionToDevice_B_fkey" FOREIGN KEY ("B") REFERENCES "Device" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_BlockSessionToBlocklist_AB_unique" ON "_BlockSessionToBlocklist"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockSessionToBlocklist_B_index" ON "_BlockSessionToBlocklist"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlockSessionToDevice_AB_unique" ON "_BlockSessionToDevice"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockSessionToDevice_B_index" ON "_BlockSessionToDevice"("B");
