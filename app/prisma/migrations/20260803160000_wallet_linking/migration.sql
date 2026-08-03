-- AlterTable
ALTER TABLE "Account" ADD COLUMN "walletAddress" TEXT;
ALTER TABLE "Account" ADD COLUMN "walletLinkedAt" DATETIME;

-- CreateTable
CREATE TABLE "WalletNonce" (
    "nonce" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "WalletNonce_accountId_idx" ON "WalletNonce"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_walletAddress_key" ON "Account"("walletAddress");
