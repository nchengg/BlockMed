-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "buyerDisplayName" TEXT;
ALTER TABLE "Deal" ADD COLUMN "sellerDisplayName" TEXT;

-- CreateTable
CREATE TABLE "Counter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "dealCounter" INTEGER NOT NULL DEFAULT 0
);
