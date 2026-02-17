import { config } from 'dotenv';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Always load apps/api/.env (works when running from repo root or from apps/api)
config({ path: resolve(__dirname, '../../.env') });

const raw =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  'postgresql://localhost:5432/handig';
const connectionString = typeof raw === 'string' ? raw.trim() : raw;

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: join(__dirname, 'migrations') });
}

export * from './schema.js';
