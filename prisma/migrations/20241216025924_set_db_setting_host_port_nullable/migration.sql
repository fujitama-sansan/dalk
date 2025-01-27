-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DbSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "host" TEXT,
    "port" INTEGER,
    "user" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "staging" BOOLEAN NOT NULL
);
INSERT INTO "new_DbSetting" ("host", "id", "name", "password", "port", "staging", "user") SELECT "host", "id", "name", "password", "port", "staging", "user" FROM "DbSetting";
DROP TABLE "DbSetting";
ALTER TABLE "new_DbSetting" RENAME TO "DbSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
