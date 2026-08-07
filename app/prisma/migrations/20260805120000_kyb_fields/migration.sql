-- registrationNumber becomes NOT NULL. Existing rows predate the requirement,
-- so they are backfilled with '' rather than dropped: an empty string reads as
-- "not supplied" and leaves kybStatus at 'incomplete', which is accurate.

-- CreateTable
CREATE TABLE "PersonOfControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "birthMonthYear" TEXT NOT NULL,
    "countryOfResidence" TEXT NOT NULL,
    "controlCondition" TEXT NOT NULL,
    "controlDetail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonOfControl_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "companyType" TEXT,
    "jurisdiction" TEXT,
    "issuingAuthority" TEXT,
    "incorporationDate" DATETIME,
    "contactName" TEXT NOT NULL,
    "signatoryName" TEXT,
    "signatoryNationality" TEXT,
    "signatoryDob" DATETIME,
    "signatoryPassportExpiry" DATETIME,
    "fundsSourceNature" TEXT,
    "fundsSourceCountry" TEXT,
    "declaredNotCriminalFunds" BOOLEAN NOT NULL DEFAULT false,
    "declaredNoSanctions" BOOLEAN NOT NULL DEFAULT false,
    "declarationsAt" DATETIME,
    "walletAddress" TEXT,
    "walletLinkedAt" DATETIME,
    "type" TEXT NOT NULL DEFAULT 'client',
    "kybStatus" TEXT NOT NULL DEFAULT 'incomplete',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Account" ("addressLine1", "addressLine2", "city", "companyName", "contactName", "country", "createdAt", "email", "id", "passwordHash", "postcode", "registrationNumber", "type", "updatedAt", "walletAddress", "walletLinkedAt") SELECT "addressLine1", "addressLine2", "city", "companyName", "contactName", "country", "createdAt", "email", "id", "passwordHash", "postcode", COALESCE("registrationNumber", ''), "type", "updatedAt", "walletAddress", "walletLinkedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_walletAddress_key" ON "Account"("walletAddress");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PersonOfControl_accountId_idx" ON "PersonOfControl"("accountId");
