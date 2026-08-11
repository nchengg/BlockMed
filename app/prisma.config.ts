// Prisma 7 moves the datasource URL out of schema.prisma into here.
// Local dev uses a SQLite file; DATABASE_URL overrides it (see .env).
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// The config file is evaluated before Prisma loads .env, so read it here.
// Next.js loads .env itself at runtime; this is only for the Prisma CLI.
process.loadEnvFile?.(path.join(process.cwd(), '.env'));

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
});
