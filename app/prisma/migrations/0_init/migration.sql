-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
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
    "incorporationDate" TIMESTAMP(3),
    "contactName" TEXT NOT NULL,
    "signatoryName" TEXT,
    "signatoryNationality" TEXT,
    "signatoryDob" TIMESTAMP(3),
    "signatoryPassportExpiry" TIMESTAMP(3),
    "fundsSourceNature" TEXT,
    "fundsSourceCountry" TEXT,
    "declaredNotCriminalFunds" BOOLEAN NOT NULL DEFAULT false,
    "declaredNoSanctions" BOOLEAN NOT NULL DEFAULT false,
    "declarationsAt" TIMESTAMP(3),
    "walletAddress" TEXT,
    "walletLinkedAt" TIMESTAMP(3),
    "type" TEXT NOT NULL DEFAULT 'client',
    "kybStatus" TEXT NOT NULL DEFAULT 'incomplete',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonOfControl" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "birthMonthYear" TEXT NOT NULL,
    "countryOfResidence" TEXT NOT NULL,
    "controlCondition" TEXT NOT NULL,
    "controlDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonOfControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "token" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "WalletNonce" (
    "nonce" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletNonce_pkey" PRIMARY KEY ("nonce")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "dealCounter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "appDealId" TEXT NOT NULL,
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
    "createdByRole" TEXT,
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("appDealId")
);

-- CreateTable
CREATE TABLE "Review" (
    "dealId" TEXT NOT NULL,
    "fieldsJson" TEXT NOT NULL,
    "verdictJson" TEXT NOT NULL,
    "noticeAt" TIMESTAMP(3) NOT NULL,
    "windowEndsAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "objectionGround" TEXT,
    "objectionDetail" TEXT,
    "objectionRaisedAt" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("dealId")
);

-- CreateTable
CREATE TABLE "AuditEntry" (
    "id" SERIAL NOT NULL,
    "dealId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "txHash" TEXT,
    "accountId" TEXT,

    CONSTRAINT "AuditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_walletAddress_key" ON "Account"("walletAddress");

-- CreateIndex
CREATE INDEX "PersonOfControl_accountId_idx" ON "PersonOfControl"("accountId");

-- CreateIndex
CREATE INDEX "Session_accountId_idx" ON "Session"("accountId");

-- CreateIndex
CREATE INDEX "WalletNonce_accountId_idx" ON "WalletNonce"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_onChainDealId_key" ON "Deal"("onChainDealId");

-- CreateIndex
CREATE INDEX "Deal_buyerId_idx" ON "Deal"("buyerId");

-- CreateIndex
CREATE INDEX "Deal_sellerId_idx" ON "Deal"("sellerId");

-- CreateIndex
CREATE INDEX "AuditEntry_dealId_ts_idx" ON "AuditEntry"("dealId", "ts");

-- AddForeignKey
ALTER TABLE "PersonOfControl" ADD CONSTRAINT "PersonOfControl_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("appDealId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("appDealId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEntry" ADD CONSTRAINT "AuditEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
