-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuerySetDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "ucompanyIds" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_QuerySetDefinition" ("description", "id", "name", "threshold") SELECT "description", "id", "name", "threshold" FROM "QuerySetDefinition";
DROP TABLE "QuerySetDefinition";
ALTER TABLE "new_QuerySetDefinition" RENAME TO "QuerySetDefinition";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
