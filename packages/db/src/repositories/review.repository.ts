import type { SQLiteDatabase } from "../database.types.js";
import type { DbReviewItem, DbReviewStats } from "../db.types.js";

// ---------------------------------------------------------------------------
// Row shape
// ---------------------------------------------------------------------------

interface ReviewItemRow {
  id: string;
  learner_id: string;
  content_id: string;
  content_type: string;
  ease_factor: number;
  interval_days: number;
  next_review_at: string;
  last_grade: number | null;
  rep_count: number;
  data_json: string;
}

interface CountRow {
  count: number;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class ReviewRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  /**
   * Returns up to `limit` review items due now (next_review_at ≤ current ISO timestamp)
   * for the given learner, ordered by most overdue first.
   */
  async getDueReviewItems(learnerId: string, limit: number): Promise<DbReviewItem[]> {
    const now = new Date().toISOString();
    const rows = await this.db.getAllAsync<ReviewItemRow>(
      `SELECT * FROM review_items
       WHERE learner_id = ? AND next_review_at <= ?
       ORDER BY next_review_at ASC
       LIMIT ?`,
      learnerId,
      now,
      limit
    );
    return rows.map(rowToReviewItem);
  }

  /**
   * Inserts or replaces a review item.
   * Use this for both first-time creation and post-review updates.
   */
  async upsertReviewItem(item: DbReviewItem): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO review_items
         (id, learner_id, content_id, content_type, ease_factor, interval_days, next_review_at, last_grade, rep_count, data_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      item.id,
      item.learnerId,
      item.contentId,
      item.contentType,
      item.easeFactor,
      item.intervalDays,
      item.nextReviewAt,
      item.lastGrade ?? null,
      item.repCount,
      JSON.stringify(item.data)
    );
  }

  /**
   * Returns aggregate review stats for the given learner:
   * - `due`: items with next_review_at ≤ now
   * - `learned`: items with rep_count > 0 (seen at least once)
   */
  async getReviewStats(learnerId: string): Promise<DbReviewStats> {
    const now = new Date().toISOString();

    const dueRow = await this.db.getFirstAsync<CountRow>(
      `SELECT COUNT(*) AS count FROM review_items
       WHERE learner_id = ? AND next_review_at <= ?`,
      learnerId,
      now
    );

    const learnedRow = await this.db.getFirstAsync<CountRow>(
      `SELECT COUNT(*) AS count FROM review_items
       WHERE learner_id = ? AND rep_count > 0`,
      learnerId
    );

    return {
      due: dueRow?.count ?? 0,
      learned: learnedRow?.count ?? 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rowToReviewItem(row: ReviewItemRow): DbReviewItem {
  return {
    id: row.id,
    learnerId: row.learner_id,
    contentId: row.content_id,
    contentType: row.content_type,
    easeFactor: row.ease_factor,
    intervalDays: row.interval_days,
    nextReviewAt: row.next_review_at,
    lastGrade: row.last_grade,
    repCount: row.rep_count,
    data: JSON.parse(row.data_json) as Record<string, unknown>,
  };
}
