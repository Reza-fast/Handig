import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL ?? join(process.cwd(), 'data', 'handig.db');
const dataDir = dirname(dbPath);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: join(__dirname, 'migrations') });

export * from './schema.js';
