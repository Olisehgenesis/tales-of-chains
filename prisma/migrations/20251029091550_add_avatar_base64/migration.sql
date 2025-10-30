-- SQLite: add avatarImageBase64 column to Character
PRAGMA foreign_keys=OFF;

ALTER TABLE "Character" ADD COLUMN "avatarImageBase64" TEXT;

PRAGMA foreign_keys=ON;


