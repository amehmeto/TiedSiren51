/*
  Warnings:

  - You are about to drop the column `sirens` on the `Blocklist` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_BlocklistToSiren" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BlocklistToSiren_A_fkey" FOREIGN KEY ("A") REFERENCES "Blocklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlocklistToSiren_B_fkey" FOREIGN KEY ("B") REFERENCES "Siren" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Blocklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Blocklist" ("id", "name") SELECT "id", "name" FROM "Blocklist";
DROP TABLE "Blocklist";
ALTER TABLE "new_Blocklist" RENAME TO "Blocklist";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_BlocklistToSiren_AB_unique" ON "_BlocklistToSiren"("A", "B");

-- CreateIndex
CREATE INDEX "_BlocklistToSiren_B_index" ON "_BlocklistToSiren"("B");
