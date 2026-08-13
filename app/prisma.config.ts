// Prisma 7 moves the datasource URL out of schema.prisma into here.
// The datasource is Postgres; DATABASE_URL holds the connection string (see .env).
import path from 'node:path';
import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// The config file is evaluated before Prisma loads .env, so read it here — but
// only if a .env file exists. On hosts like Vercel the env vars are already in
// process.env and there is no .env file to load.
const envFile = path.join(process.cwd(), '.env');
if (existsSync(envFile)) process.loadEnvFile?.(envFile);

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
