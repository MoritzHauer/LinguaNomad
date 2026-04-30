# Sync Protocol

**Status:** Draft  
**Last updated:** 2026-04-30  
**Applies to:** `review_sync_records`, `progress_snapshots`

---

## Overview

LinguaNomad uses a **client-authoritative, last-write-wins** sync model. All SRS scheduling logic runs on-device. The backend is a durable store — it holds serialised state, resolves conflicts deterministically, and returns deltas. It never reinterprets domain data.

---

## Tables Involved

| Table | Sync direction | Conflict strategy |
|---|---|---|
| `review_sync_records` | Bidirectional | `client_updated_at` last-write-wins; server timestamp breaks ties |
| `progress_snapshots` | Bidirectional | Field-level merge: `max(lesson_completed_at)`, `max(task_completed_at)` |
| `sync_log` | Client → server (insert only) | Append-only; no conflict |

---

## Push Flow

The client POSTs a batch of locally-modified records. The server upserts each record using `client_updated_at` for conflict resolution.

```
POST /functions/v1/sync/push
Authorization: Bearer <supabase-jwt>
Content-Type: application/json

{
  "idempotency_key": "<uuid-v4>",        // deduplication key for retry safety
  "records": [
    {
      "content_id": "ky-lexeme-0042",
      "content_type": "lexeme",
      "ease_factor": 2.3,
      "interval_days": 4,
      "next_review_at": "2026-05-04T09:00:00Z",
      "last_grade": 4,
      "rep_count": 3,
      "client_updated_at": "2026-04-30T18:45:00Z"
    }
  ]
}
```

**Server steps:**

1. Validate JWT → extract `auth.uid()`.
2. Validate `idempotency_key` (deduplicate within a 24-hour window).
3. For each record: `INSERT ... ON CONFLICT (user_id, content_id) DO UPDATE`:
   - Apply update **only if** `excluded.client_updated_at >= review_sync_records.client_updated_at`.
   - On tie (`=`): server applies the update and lets `server_updated_at` (set by trigger) serve as the final tiebreaker. The latest server write wins.
4. Write a `sync_log` row with `records_pushed`, `conflict_count`.
5. Return structured response.

**Response:**

```json
{
  "accepted": 1,
  "skipped": 0,
  "conflicts": [],
  "synced_at": "2026-04-30T18:45:01Z"
}
```

A "conflict" in the response means the server already held a **newer** `client_updated_at` for that record. The client should not override with its stale copy; the pull flow will return the authoritative version.

---

## Pull Flow

The client sends its `last_sync_at` timestamp. The server returns all records updated on the server after that point.

```
POST /functions/v1/sync/pull
Authorization: Bearer <supabase-jwt>
Content-Type: application/json

{
  "last_sync_at": "2026-04-29T10:00:00Z"
}
```

**Server steps:**

1. Validate JWT.
2. Query `review_sync_records` where `user_id = auth.uid()` and `server_updated_at > last_sync_at`.
3. Query `progress_snapshots` where `user_id = auth.uid()` and `updated_at > last_sync_at`.
4. Return all matching rows.

**Response:**

```json
{
  "synced_at": "2026-04-30T18:45:01Z",
  "review_sync_records": [ /* array of records */ ],
  "progress_snapshots": [ /* array of records */ ]
}
```

The client stores `synced_at` as its new `last_sync_at` baseline for the next pull.

---

## Conflict Resolution Rules

### `review_sync_records` — Last-write-wins on `client_updated_at`

1. Compare incoming `client_updated_at` against the stored value.
2. **Incoming is newer** → apply the update.
3. **Incoming is equal** → apply update; `server_updated_at` (set by DB trigger) disambiguates if two devices push simultaneously.
4. **Incoming is older** → skip; report in `conflicts[]` of push response.
5. Local records are **never discarded** — if the server skips a push, it returns the authoritative record in the next pull so the client can reconcile on its end.

### `progress_snapshots` — Field-level merge

Progress snapshots use a **merge-not-overwrite** strategy because lessons and tasks can be completed independently on different devices:

- `lesson_completed_at` → take `MAX(local, server)`.
- `task_completed_at`  → take `MAX(local, server)`.
- `updated_at` is always set to `now()` by the server trigger after upsert.

The server applies this merge in the Edge Function before upserting:

```sql
INSERT INTO progress_snapshots (user_id, unit_id, language_code, lesson_completed_at, task_completed_at)
VALUES ($user_id, $unit_id, $lang, $lesson_ts, $task_ts)
ON CONFLICT (user_id, unit_id, language_code) DO UPDATE SET
  lesson_completed_at = GREATEST(excluded.lesson_completed_at, progress_snapshots.lesson_completed_at),
  task_completed_at   = GREATEST(excluded.task_completed_at,   progress_snapshots.task_completed_at);
```

---

## Endpoint Design

Both endpoints are implemented as a **Supabase Edge Function** (`supabase/functions/sync/index.ts`) to keep conflict-resolution logic co-located with the schema and auditable in the repository.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/functions/v1/sync/push` | POST | JWT required | Batch upsert review records |
| `/functions/v1/sync/pull` | POST | JWT required | Fetch delta since `last_sync_at` |

Auto-generated Supabase REST (`/rest/v1/review_sync_records`) is available but should not be used directly from the app — it bypasses idempotency keys and conflict logging.

---

## Retry Strategy

### Client-side retries

1. **Idempotency key**: generate a UUID per push batch. Reuse the same key on retry. The server deduplicates within 24 hours.
2. **Exponential backoff**: `delay = min(base * 2^attempt + jitter, max_delay)`
   - `base` = 1 s, `max_delay` = 60 s, `jitter` = random 0–500 ms.
3. **Retry budget**: 5 attempts per batch before surfacing an error to the UI.
4. **Retry triggers**: HTTP 5xx, network timeout, `ECONNRESET`. Do **not** retry HTTP 4xx (bad request, auth failure) without intervention.

### Idempotency on the server

The server checks an optional `idempotency_key` in the request body. If the same key is seen within 24 hours, the previous response is returned immediately without re-upserting. Implementation note: use a lightweight in-memory cache or a small `idempotency_keys` table (keyed by `(user_id, key)` with a TTL index).

---

## Sequence Diagram

```
Client                          Supabase Edge Function         Postgres
  │                                      │                        │
  │  POST /sync/push {records, idem_key} │                        │
  │─────────────────────────────────────>│                        │
  │                                      │  validate JWT          │
  │                                      │  check idempotency     │
  │                                      │  upsert records ──────>│
  │                                      │  (LWW conflict logic)  │
  │                                      │  insert sync_log ─────>│
  │                                      │<──── rows written ──────│
  │<──── {accepted, skipped, conflicts} ─│                        │
  │                                      │                        │
  │  POST /sync/pull {last_sync_at}      │                        │
  │─────────────────────────────────────>│                        │
  │                                      │  query delta ─────────>│
  │                                      │<──── delta rows ────────│
  │<──── {synced_at, records, snapshots}─│                        │
```

---

## Open Questions / Human Review Needed

1. **Idempotency store**: in-memory (KV in Deno) vs. a small Postgres table. In-memory is simpler but doesn't survive Edge Function cold starts. If retries happen across cold starts, they could double-write. Recommend a lightweight `idempotency_keys` table with a cron cleanup.
2. **Pull pagination**: for users with large histories (1000+ records), a single pull response may be large. Consider adding `limit`/`cursor` parameters.
3. **Snapshot merge on pull**: currently the server returns snapshots as stored. The client is responsible for the `GREATEST` merge. For consistency, consider making the server always apply the merge on push (current approach) and return the merged result on pull.
