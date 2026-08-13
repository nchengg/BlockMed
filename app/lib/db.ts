// Prisma client singleton. Next.js hot-reloads modules in dev, which would
// otherwise open a new connection on every edit — so the instance is cached on
// globalThis.
//
// Prisma 7 requires an explicit driver adapter. We run on Postgres (Neon in the
// cloud) so the data survives across serverless deploys; DATABASE_URL holds the
// connection string.
import { PrismaClient } from '@/lib/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
