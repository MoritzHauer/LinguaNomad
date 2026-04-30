/**
 * @linguanomad/db — offline-first SQLite persistence layer.
 *
 * Usage (inside Expo app):
 *
 * ```ts
 * import * as SQLite from "expo-sqlite";
 * import { initDatabase, ContentRepository } from "@linguanomad/db";
 *
 * const db = SQLite.openDatabaseSync("linguanomad.db");
 * await initDatabase(db);
 * const content = new ContentRepository(db);
 * ```
 */

export type { SQLiteDatabase } from "./database.types.js";
export type { DbReviewItem, DbSyncOperation, DbReviewStats } from "./db.types.js";

export { INITIAL_SCHEMA_DDL } from "./schema.js";
export { runMigrations } from "./migrations.js";

export { ContentRepository } from "./repositories/content.repository.js";
export { ReviewRepository } from "./repositories/review.repository.js";
export { SyncRepository } from "./repositories/sync.repository.js";

import type { SQLiteDatabase } from "./database.types.js";
import { runMigrations } from "./migrations.js";

/**
 * Initialises the database by running all pending migrations.
 * Call this once at app startup before creating any repositories.
 */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await runMigrations(db);
}
