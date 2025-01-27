-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuerySetDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "maxCount" INTEGER NOT NULL,
    "ucompanyIds" TEXT NOT NULL
);
INSERT INTO "new_QuerySetDefinition" ("description", "id", "maxCount", "name", "threshold", "ucompanyIds") SELECT "description", "id", "maxCount", "name", "threshold", "ucompanyIds" FROM "QuerySetDefinition";
DROP TABLE "QuerySetDefinition";
ALTER TABLE "new_QuerySetDefinition" RENAME TO "QuerySetDefinition";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
