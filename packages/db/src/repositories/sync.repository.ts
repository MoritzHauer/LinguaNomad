import type { SQLiteDatabase } from "../database.types.js";
import type { DbSyncOperation } from "../db.types.js";

// ---------------------------------------------------------------------------
// Row shape
// ---------------------------------------------------------------------------

interface SyncQueueRow {
  id: string;
  operation: string;
  table_name: string;
  record_id: string;
  payload_json: string;
  created_at: string;
  synced_at: string | null;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class SyncRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  /** Enqueues a new sync operation. */
  async enqueueSyncOperation(op: DbSyncOperation): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO sync_queue (id, operation, table_name, record_id, payload_json, created_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      op.id,
      op.operation,
      op.tableName,
      op.recordId,
      JSON.stringify(op.payload),
      op.createdAt,
      op.syncedAt ?? null
    );
  }

  /**
   * Returns all pending sync operations (synced_at IS NULL),
   * ordered by creation time so they are replayed in order.
   */
  async getPendingSyncOperations(): Promise<DbSyncOperation[]> {
    const rows = await this.db.getAllAsync<SyncQueueRow>(
      `SELECT * FROM sync_queue
       WHERE synced_at IS NULL
       ORDER BY created_at ASC`
    );
    return rows.map(rowToSyncOperation);
  }

  /** Marks a sync operation as complete by recording the current timestamp. */
  async markSyncOperationComplete(id: string): Promise<void> {
    await this.db.runAsync(
      "UPDATE sync_queue SET synced_at = ? WHERE id = ?",
      new Date().toISOString(),
      id
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rowToSyncOperation(row: SyncQueueRow): DbSyncOperation {
  return {
    id: row.id,
    operation: row.operation,
    tableName: row.table_name,
    recordId: row.record_id,
    payload: JSON.parse(row.payload_json) as Record<string, unknown>,
    createdAt: row.created_at,
    syncedAt: row.synced_at,
  };
}
