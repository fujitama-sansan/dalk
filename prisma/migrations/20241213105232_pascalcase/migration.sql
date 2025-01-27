/*
  Warnings:

  - You are about to drop the `SQSMessageDefinition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SQSMessageDefinition";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SqsMessageDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "queueUrl" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "messageClass" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "graph" TEXT NOT NULL
);
