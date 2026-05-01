# ADR-005: Sync Protocol for Learner Progress

**Status:** Accepted  
**Date:** 2026-04-30  
**Author:** LinguaNomad core team  
**Relates to:** ADR-003 (Supabase as Backend)

---

## Context

LinguaNomad is an offline-first app. Learners study and review on their devices without network access. When connectivity returns, locally-modified records must be reconciled with the server state. This can happen across multiple devices (phone + tablet) or after the learner reinstalls the app.

The sync protocol must satisfy:

1. **Correctness under offline use** — no data loss when the device is offline for days.
2. **Determinism** — the same set of pushes always produces the same server state.
3. **Simplicity** — the backend must remain thin; no domain logic server-side.
4. **Idempotency** — retrying a push due to a network timeout must not corrupt state.
5. **Auditability** — conflicts should be visible to diagnose data quality issues.

Key constraints from ADR-003:
- SRS scheduling (ease factor, intervals) is **on-device only**.
- The server stores records opaquely — it does not compute review schedules.
- Edge Functions are permitted (reverses the original "not used at MVP" note in ADR-003 because the conflict-resolution logic is too nuanced for auto-generated REST endpoints).

---

## Decision

LinguaNomad uses a **client-authoritative, last-write-wins** sync protocol with **field-level merge** for progress snapshots.

### Two-phase sync (push then pull)

1. **Push** — the client sends locally-modified records since the last successful sync. The server upserts using `client_updated_at` as the authority.
2. **Pull** — the client requests all server records updated since its `last_sync_at`. It reconciles received records against its local state.

### Conflict resolution strategies

**`review_sync_records` — last-write-wins on `client_updated_at`**

SRS records are device-generated. Whichever device last graded a card has the most accurate state. Ties (same `client_updated_at`) are broken by `server_updated_at` (set by DB trigger); the most recently written server row wins. Stale records rejected by the server are returned on the next pull so the client can update its local copy.

**`progress_snapshots` — field-level merge**

A learner may complete a lesson on one device and a task on another before syncing. Overwriting the full row would silently erase either completion. Instead the server applies `GREATEST(incoming, stored)` independently to `lesson_completed_at` and `task_completed_at`. This is a simple, correct strategy for monotonic completion events.

### Edge Function

Conflict logic is implemented in `supabase/functions/sync/index.ts` (Deno runtime) rather than relying on auto-generated REST endpoints. This keeps the resolution rules auditable, testable, and co-located with the schema.

---

## Alternatives Considered

| Option | Reason rejected |
|---|---|
| **Auto-generated REST (`/rest/v1/`)** | Cannot enforce `client_updated_at` LWW logic; RLS-only access would allow any client to overwrite any row unconditionally. No idempotency support. |
| **Server-authoritative (server decides conflicts)** | Server does not understand SRS domain; it cannot know which grade is "more correct". Client-authoritative is the only sensible model here. |
| **CRDT-based merge** | Operationally complex; requires vector clocks or logical timestamps beyond what SM-2 scheduling tracks. Overkill for the MVP data volume. |
| **Event sourcing / append-only review log** | Correct and powerful, but significant schema and client complexity. Deferred as a future evolution path if the LWW model proves insufficient. |
| **Realtime subscriptions (Supabase Realtime)** | Solves multi-device live sync but does not address offline-then-reconnect conflicts. Not a replacement for the push/pull protocol. |
| **Periodic full-sync (send all records every time)** | Simple to implement but does not scale once a learner has thousands of review records. Delta sync is necessary from the start. |

---

## Consequences

**Positive:**
- No server-side domain logic. The server is a durable store with upsert semantics.
- Deterministic: same push batch always produces the same Postgres state.
- Retries are safe via idempotency keys (UUID per push batch).
- `sync_log` provides an audit trail for conflict rate monitoring.
- Field-level merge on progress snapshots prevents silent progress erasure in multi-device scenarios.

**Negative / Trade-offs:**
- LWW can lose data in rare edge cases: if a learner grades the same card on two devices while offline and both `client_updated_at` values are identical, one grade is silently discarded. This is acceptable for MVP; an event-log approach could be introduced later.
- The Edge Function adds a deployment dependency. The auto-generated REST API is no longer the sync path; contributors must understand this distinction.
- The idempotency key store (proposed: small Postgres table with TTL) needs a cron cleanup job; this is minor but not zero operational cost.

---

## Implementation Notes

- See `supabase/migrations/001_initial_schema.sql` for table definitions.
- See `supabase/migrations/002_rls_policies.sql` for access control.
- See `supabase/functions/sync/index.ts` for the Edge Function implementation.
- See `docs/architecture/sync-protocol.md` for the full protocol specification including sequence diagrams and retry strategy.

---

## Open Questions (Needs Human Review)

1. **Idempotency key durability**: use an in-memory Deno KV store (simple, resets on cold start) or a Postgres `idempotency_keys` table (durable, needs cleanup cron)? Recommend the Postgres table for correctness.
2. **Pull pagination**: should the pull endpoint support `limit`/`cursor` for users with very large histories? Not needed at MVP but worth deciding before release.
3. **Snapshot merge ownership**: should the server always apply the `GREATEST` merge on push (current approach) or should the client be responsible for merging before pushing? Current design puts merge logic server-side for consistency; client-side merge would simplify the Edge Function at the cost of client complexity.
