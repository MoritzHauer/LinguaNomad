/**
 * DB-layer domain types used across repositories.
 * These are distinct from content-schema types to allow the DB layer to evolve
 * its storage representation independently.
 */

export interface DbReviewItem {
  id: string;
  learnerId: string;
  contentId: string;
  contentType: string;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  lastGrade: number | null;
  repCount: number;
  /** Arbitrary extra data serialised to JSON. */
  data: Record<string, unknown>;
}

export interface DbSyncOperation {
  id: string;
  operation: string;
  tableName: string;
  recordId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  syncedAt: string | null;
}

export interface DbReviewStats {
  due: number;
  learned: number;
}
