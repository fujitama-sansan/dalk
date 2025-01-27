-- CreateTable
CREATE TABLE "UcompanyShard" (
    "dbSettingId" TEXT NOT NULL,
    "ucompanyId" TEXT NOT NULL,
    "shardNum" INTEGER NOT NULL,

    PRIMARY KEY ("dbSettingId", "ucompanyId")
);
