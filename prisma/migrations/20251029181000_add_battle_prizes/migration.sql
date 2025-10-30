PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Battle" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "status" TEXT NOT NULL,
  "universe" TEXT NOT NULL,
  "realm" TEXT,
  "durationMinutes" INTEGER NOT NULL,
  "outcome" TEXT,
  "prizeAmount" INTEGER,
  "prizeCurrency" TEXT,
  "hostId" TEXT,
  "minParticipants" INTEGER NOT NULL DEFAULT 2,
  "maxParticipants" INTEGER NOT NULL DEFAULT 10,
  "scheduledStartTime" DATETIME,
  "startedAt" DATETIME,
  "completedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "new_Battle_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Battle" ("id","status","universe","realm","durationMinutes","outcome","hostId","minParticipants","maxParticipants","scheduledStartTime","startedAt","completedAt","createdAt")
  SELECT "id","status","universe","realm","durationMinutes","outcome","hostId","minParticipants","maxParticipants","scheduledStartTime","startedAt","completedAt","createdAt" FROM "Battle";

DROP TABLE "Battle";
ALTER TABLE "new_Battle" RENAME TO "Battle";

PRAGMA foreign_keys=ON;


