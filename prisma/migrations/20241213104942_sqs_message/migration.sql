-- CreateTable
CREATE TABLE "SQSMessageDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "queueUrl" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "messageClass" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "graph" TEXT NOT NULL
);
