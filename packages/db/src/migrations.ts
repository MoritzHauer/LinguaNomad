import type { SQLiteDatabase } from "./database.types.js";
import { INITIAL_SCHEMA_DDL } from "./schema.js";

interface MigrationRow {
  version: number;
  applied_at: string;
}

interface Migration {
  version: number;
  description: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
  )
`;

async function getAppliedVersions(db: SQLiteDatabase): Promise<Set<number>> {
  const rows = await db.getAllAsync<MigrationRow>(
    "SELECT version FROM schema_migrations ORDER BY version ASC"
  );
  return new Set(rows.map((r) => r.version));
}

async function recordMigration(db: SQLiteDatabase, version: number): Promise<void> {
  await db.runAsync(
    "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
    version,
    new Date().toISOString()
  );
}

/** Migration 001: initial schema. */
const migration001: Migration = {
  version: 1,
  description: "initial schema",
  async up(db) {
    for (const ddl of INITIAL_SCHEMA_DDL) {
      await db.execAsync(ddl);
    }
  },
};

const ALL_MIGRATIONS: Migration[] = [migration001];

/**
 * Runs all pending migrations against the provided database.
 * Idempotent — already-applied migrations are skipped.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Bootstrap the migrations tracking table first.
  await db.execAsync(CREATE_MIGRATIONS_TABLE);

  const applied = await getAppliedVersions(db);

  for (const migration of ALL_MIGRATIONS) {
    if (applied.has(migration.version)) {
      continue;
    }
    await migration.up(db);
    await recordMigration(db, migration.version);
  }
}
