// Prisma client singleton. Next.js hot-reloads modules in dev, which would
// otherwise open a new connection on every edit until SQLite complains — so the
// instance is cached on globalThis.
//
// Prisma 7 requires an explicit driver adapter; SQLite is a local file, which
// suits the demo. Swapping to Postgres later means changing the adapter and the
// datasource provider, not the queries.
import { PrismaClient } from '@/lib/generated/prisma';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
