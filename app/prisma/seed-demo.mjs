// Minimal, repeatable demo identities for the integrated Prisma-backed dashboard.
//
// This deliberately seeds companies only. Deals remain user-created so the
// team can rehearse the real two-party lifecycle, while the frontend's labelled
// example portfolio covers the empty state. All values are synthetic.
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import prismaClientPackage from '../lib/generated/prisma/index.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const { PrismaClient } = prismaClientPackage;
const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

// Demo workspaces use /api/auth/demo-login, not shared credentials. Generate an
// unknown password unless a developer explicitly supplies one for local testing.
const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD ?? randomBytes(32).toString('base64url');
const ATTESTED_AT = new Date('2026-08-01T09:00:00.000Z');
const PASSPORT_EXPIRY = new Date('2032-12-31T00:00:00.000Z');

const companies = [
  {
    id: 'acc-buyer',
    email: 'buyer@meridian.demo',
    companyName: 'Meridian Imports Ltd.',
    registrationNumber: 'DEMO-UK-001',
    country: 'United Kingdom',
    addressLine1: '1 Demo Import Way',
    city: 'London',
    postcode: 'EC1A 1DE',
    companyType: 'Private limited company',
    jurisdiction: 'England and Wales',
    issuingAuthority: 'Companies House',
    incorporationDate: new Date('2018-04-12T00:00:00.000Z'),
    contactName: 'Maya Patel',
    signatoryName: 'Maya Patel',
    signatoryNationality: 'British',
    signatoryDob: new Date('1987-05-14T00:00:00.000Z'),
    fundsSourceNature: 'Wholesale imports and retail distribution',
    fundsSourceCountry: 'United Kingdom',
    psc: {
      id: 'demo-psc-buyer',
      fullName: 'Maya Patel',
      nationality: 'British',
      birthMonthYear: '1987-05',
      countryOfResidence: 'United Kingdom',
      controlDetail: 'Holds 60% of shares',
    },
  },
  {
    id: 'acc-seller',
    email: 'seller@solaris.demo',
    companyName: 'Solaris Textiles Co.',
    registrationNumber: 'DEMO-TR-002',
    country: 'Turkey',
    addressLine1: '22 Demo Textile Park',
    city: 'Izmir',
    postcode: '35000',
    companyType: 'Private limited company',
    jurisdiction: 'Turkey',
    issuingAuthority: 'MERSIS',
    incorporationDate: new Date('2016-09-20T00:00:00.000Z'),
    contactName: 'Selin Kaya',
    signatoryName: 'Selin Kaya',
    signatoryNationality: 'Turkish',
    signatoryDob: new Date('1984-11-08T00:00:00.000Z'),
    fundsSourceNature: 'Textile manufacturing and exports',
    fundsSourceCountry: 'Turkey',
    psc: {
      id: 'demo-psc-seller',
      fullName: 'Selin Kaya',
      nationality: 'Turkish',
      birthMonthYear: '1984-11',
      countryOfResidence: 'Turkey',
      controlDetail: 'Holds 55% of shares',
    },
  },
  {
    id: 'acc-both',
    email: 'trader@bridgetrade.demo',
    companyName: 'BridgeTrade Co.',
    registrationNumber: 'DEMO-SG-003',
    country: 'Singapore',
    addressLine1: '8 Demo Trade Quay',
    city: 'Singapore',
    postcode: '018956',
    companyType: 'Private limited company',
    jurisdiction: 'Singapore',
    issuingAuthority: 'ACRA',
    incorporationDate: new Date('2019-02-18T00:00:00.000Z'),
    contactName: 'Avery Tan',
    signatoryName: 'Avery Tan',
    signatoryNationality: 'Singaporean',
    signatoryDob: new Date('1989-07-03T00:00:00.000Z'),
    fundsSourceNature: 'Cross-border trading services',
    fundsSourceCountry: 'Singapore',
    psc: {
      id: 'demo-psc-both',
      fullName: 'Avery Tan',
      nationality: 'Singaporean',
      birthMonthYear: '1989-07',
      countryOfResidence: 'Singapore',
      controlDetail: 'Holds 51% of shares',
    },
  },
  {
    id: 'acc-platform',
    email: 'ops@tradebridge.demo',
    companyName: 'TradeBridge Platform',
    registrationNumber: 'DEMO-UK-004',
    country: 'United Kingdom',
    addressLine1: '4 Demo Platform Square',
    city: 'Manchester',
    postcode: 'M1 1AE',
    companyType: 'Private limited company',
    jurisdiction: 'England and Wales',
    issuingAuthority: 'Companies House',
    incorporationDate: new Date('2020-06-30T00:00:00.000Z'),
    contactName: 'Jordan Okafor',
    signatoryName: 'Jordan Okafor',
    signatoryNationality: 'British',
    signatoryDob: new Date('1986-03-22T00:00:00.000Z'),
    fundsSourceNature: 'Trade workflow and escrow administration services',
    fundsSourceCountry: 'United Kingdom',
    psc: {
      id: 'demo-psc-platform',
      fullName: 'Jordan Okafor',
      nationality: 'British',
      birthMonthYear: '1986-03',
      countryOfResidence: 'United Kingdom',
      controlDetail: 'Holds 70% of shares',
    },
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const company of companies) {
    const { psc, ...identity } = company;
    const account = await prisma.account.upsert({
      where: { email: identity.email },
      create: {
        ...identity,
        passwordHash,
        signatoryPassportExpiry: PASSPORT_EXPIRY,
        declaredNotCriminalFunds: true,
        declaredNoSanctions: true,
        declarationsAt: ATTESTED_AT,
        kybStatus: 'attested',
        type: 'client',
      },
      update: {
        companyName: identity.companyName,
        registrationNumber: identity.registrationNumber,
        country: identity.country,
        addressLine1: identity.addressLine1,
        city: identity.city,
        postcode: identity.postcode,
        companyType: identity.companyType,
        jurisdiction: identity.jurisdiction,
        issuingAuthority: identity.issuingAuthority,
        incorporationDate: identity.incorporationDate,
        contactName: identity.contactName,
        signatoryName: identity.signatoryName,
        signatoryNationality: identity.signatoryNationality,
        signatoryDob: identity.signatoryDob,
        signatoryPassportExpiry: PASSPORT_EXPIRY,
        fundsSourceNature: identity.fundsSourceNature,
        fundsSourceCountry: identity.fundsSourceCountry,
        declaredNotCriminalFunds: true,
        declaredNoSanctions: true,
        declarationsAt: ATTESTED_AT,
        kybStatus: 'attested',
        type: 'client',
      },
    });

    await prisma.personOfControl.upsert({
      where: { id: psc.id },
      create: {
        ...psc,
        accountId: account.id,
        controlCondition: 'shares_over_25',
      },
      update: {
        accountId: account.id,
        fullName: psc.fullName,
        nationality: psc.nationality,
        birthMonthYear: psc.birthMonthYear,
        countryOfResidence: psc.countryOfResidence,
        controlCondition: 'shares_over_25',
        controlDetail: psc.controlDetail,
      },
    });
  }

  const seeded = await prisma.account.findMany({
    where: { email: { in: companies.map(company => company.email) } },
    select: { id: true, email: true, companyName: true, kybStatus: true },
    orderBy: { email: 'asc' },
  });
  const ownerRecords = await prisma.personOfControl.count({
    where: { id: { in: companies.map(company => company.psc.id) } },
  });

  console.log(`Demo seed ready: ${seeded.length} company workspaces, ${ownerRecords} synthetic owner records.`);
  for (const account of seeded) {
    console.log(`- ${account.companyName} (${account.email}) [${account.kybStatus}]`);
  }
}

main()
  .catch(error => {
    console.error('Demo seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
