-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QueryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "targetParameter" TEXT NOT NULL,
    "querySetDefinitionId" TEXT NOT NULL,
    "listOrder" INTEGER NOT NULL,
    CONSTRAINT "QueryItem_querySetDefinitionId_fkey" FOREIGN KEY ("querySetDefinitionId") REFERENCES "QuerySetDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QueryItem" ("id", "listOrder", "query", "querySetDefinitionId", "targetParameter") SELECT "id", "listOrder", "query", "querySetDefinitionId", "targetParameter" FROM "QueryItem";
DROP TABLE "QueryItem";
ALTER TABLE "new_QueryItem" RENAME TO "QueryItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
