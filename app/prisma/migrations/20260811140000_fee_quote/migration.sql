-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deal" (
    "appDealId" TEXT NOT NULL PRIMARY KEY,
    "onChainDealId" TEXT,
    "goods" TEXT,
    "amountUsdc" TEXT,
    "sellerName" TEXT,
    "buyerName" TEXT,
    "shipmentDeadline" TEXT,
    "portOfLoading" TEXT,
    "portOfDischarge" TEXT,
    "incoterm" TEXT,
    "buyerId" TEXT,
    "buyerDisplayName" TEXT,
    "sellerId" TEXT,
    "sellerDisplayName" TEXT,
    "quoteJson" TEXT,
    "quotedTotalUsdc" TEXT,
    "quotedFeesUsdc" TEXT,
    "feePaymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "feeTxHash" TEXT,
    "feeRecipient" TEXT,
    "createdByRole" TEXT,
    "declinedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deal_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Deal_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Deal" ("amountUsdc", "appDealId", "buyerDisplayName", "buyerId", "buyerName", "createdAt", "createdByRole", "declinedAt", "goods", "incoterm", "onChainDealId", "portOfDischarge", "portOfLoading", "sellerDisplayName", "sellerId", "sellerName", "shipmentDeadline", "updatedAt") SELECT "amountUsdc", "appDealId", "buyerDisplayName", "buyerId", "buyerName", "createdAt", "createdByRole", "declinedAt", "goods", "incoterm", "onChainDealId", "portOfDischarge", "portOfLoading", "sellerDisplayName", "sellerId", "sellerName", "shipmentDeadline", "updatedAt" FROM "Deal";
DROP TABLE "Deal";
ALTER TABLE "new_Deal" RENAME TO "Deal";
CREATE UNIQUE INDEX "Deal_onChainDealId_key" ON "Deal"("onChainDealId");
CREATE INDEX "Deal_buyerId_idx" ON "Deal"("buyerId");
CREATE INDEX "Deal_sellerId_idx" ON "Deal"("sellerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
