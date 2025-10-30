-- Add optional age field as TEXT for SQLite
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "age" TEXT,
  "avatarImageUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "new_Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Character" ("id","userId","name","avatarImageUrl","createdAt")
  SELECT "id","userId","name","avatarImageUrl","createdAt" FROM "Character";

DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
PRAGMA foreign_keys=ON;

