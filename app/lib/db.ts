// Prisma client singleton. Next.js hot-reloads modules in dev, which would
// otherwise open a new connection on every edit — so the instance is cached on
// globalThis.
//
// Prisma 7 requires an explicit driver adapter, and WHICH adapter is not a
// property of the environment but of the connection string: a "file:" URL is
// SQLite, anything else is Postgres. Deriving it that way means the cloud deploy
// (Neon Postgres, so data survives across serverless invocations) and a local
// SQLite file both work from this one file, with no build-time switch to forget.
//
// The matching `provider` in schema.prisma must agree with the URL. Locally that
// means "sqlite"; the committed schema says "postgresql" for the deploy.
import { PrismaClient } from '@/lib/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? 'file:./dev.db';
  const adapter = url.startsWith('file:')
    ? new PrismaBetterSqlite3({ url })
    : new PrismaPg({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
