-- Add participant state fields
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_BattleParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ALIVE',
    "hp" INTEGER NOT NULL DEFAULT 100,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "new_BattleParticipant_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "new_BattleParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_BattleParticipant" ("id","battleId","characterId","status","hp","kills","deaths")
  SELECT "id","battleId","characterId", 'ALIVE', 100, 0, 0 FROM "BattleParticipant";

DROP TABLE "BattleParticipant";
ALTER TABLE "new_BattleParticipant" RENAME TO "BattleParticipant";

-- Add contentJson to BattleMessage
CREATE TABLE "new_BattleMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "battleId" TEXT NOT NULL,
  "turn" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "contentJson" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "new_BattleMessage_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_BattleMessage" ("id","battleId","turn","content","createdAt")
  SELECT "id","battleId","turn","content","createdAt" FROM "BattleMessage";

DROP TABLE "BattleMessage";
ALTER TABLE "new_BattleMessage" RENAME TO "BattleMessage";

PRAGMA foreign_keys=ON;


