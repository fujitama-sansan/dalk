-- CreateTable
CREATE TABLE "QueryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "targetParameter" TEXT NOT NULL,
    "querySetDefinitionId" TEXT NOT NULL,
    CONSTRAINT "QueryItem_querySetDefinitionId_fkey" FOREIGN KEY ("querySetDefinitionId") REFERENCES "QuerySetDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuerySetDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL
);
