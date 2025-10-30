-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Battle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "universe" TEXT NOT NULL,
    "realm" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "outcome" TEXT,
    "hostId" TEXT,
    "minParticipants" INTEGER NOT NULL DEFAULT 2,
    "maxParticipants" INTEGER NOT NULL DEFAULT 10,
    "scheduledStartTime" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Battle_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Battle" ("createdAt", "durationMinutes", "id", "outcome", "status", "universe") SELECT "createdAt", "durationMinutes", "id", "outcome", "status", "universe" FROM "Battle";
DROP TABLE "Battle";
ALTER TABLE "new_Battle" RENAME TO "Battle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
