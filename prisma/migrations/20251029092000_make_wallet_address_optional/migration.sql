-- SQLite: make walletAddress optional (nullable) in User
-- Note: SQLite allows multiple NULL values in unique columns automatically
-- The column is already nullable in the schema, we just need to ensure the index handles NULLs correctly
PRAGMA foreign_keys=OFF;

-- Drop old unique index if it exists
DROP INDEX IF EXISTS "User_walletAddress_key";

-- SQLite will allow multiple NULLs in unique columns, so this is safe
-- Only non-NULL walletAddresses will be enforced as unique
CREATE UNIQUE INDEX IF NOT EXISTS "User_walletAddress_key" ON "User"("walletAddress");

PRAGMA foreign_keys=ON;

