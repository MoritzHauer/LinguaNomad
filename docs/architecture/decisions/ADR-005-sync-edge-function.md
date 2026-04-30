# ADR-005: Sync Edge Function

**Status:** Accepted  
**Date:** 2026-04-30  
**Author:** LinguaNomad core team  
**Amends:** [ADR-003 — Supabase as Backend](ADR-003-supabase-backend.md)

---

## Context

LinguaNomad is an offline-first app. Learner progress is stored locally and periodically synchronised to Supabase. Progress records are opaque to the server: each record has an `updated_at` timestamp, a learner ID, and a serialised payload.

Multi-device sync introduces conflict: if the same progress record is modified on two devices while offline, both devices will attempt to push their version. The server must resolve the conflict and report the outcome to the client so the app can reconcile its local state.

Key requirements:

- **Batched writes.** A sync push may contain dozens of progress records. Issuing one HTTP request per record over a mobile connection is too expensive.
- **LWW conflict resolution.** Last-Write-Wins by `updated_at` timestamp is the chosen resolution strategy. The newer record wins; the older one is silently discarded server-side.
- **Conflict reporting.** Clients must know which records were rejected (server had a newer version) so the app can replace its local copy with the authoritative server version.
- **Single round-trip.** Push and pull should complete atomically in one request to minimise latency on constrained connections.
- **No domain logic server-side.** The server must not interpret what a progress record means; it stores and forwards only.

---

## Decision

LinguaNomad uses a **single Supabase Edge Function** at the path `/sync` to handle all progress synchronisation.

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/sync/push` | Client pushes a batch of progress records; server applies LWW and returns a conflict report |
| `GET` | `/sync/pull` | Client pulls records updated server-side since a given cursor timestamp |

### Behaviour of `/sync/push`

1. Accept a JSON array of progress records, each with `id`, `updated_at`, and `payload`.
2. For each record, compare `updated_at` with the stored value (if any).
3. If the incoming record is newer (or no record exists): upsert.
4. If the stored record is newer: skip the upsert and add the record to the conflict list.
5. Return `{ accepted: number, conflicts: [{ id, serverUpdatedAt, serverPayload }] }`.

### What the Edge Function does NOT do

- No SRS scheduling or interval calculation.
- No content validation or transformation.
- No lesson sequencing or curriculum logic.
- No interpretation of `payload` contents.

The function is transport infrastructure, not domain logic.

---

## Alternatives Considered

| Option | Problem |
|--------|---------|
| **Plain PostgREST REST upserts** | No native support for per-row conflict metadata in a single request. Requires N round-trips for N records. Cannot atomically batch-and-report. |
| **PostgREST RPC (`/rpc/sync_push`)** | A Postgres function could implement LWW, but Postgres functions are harder to test, version, and iterate on than Deno TypeScript. Edge Function is cleaner. |
| **Client-side merge only (no server arbitration)** | Unsafe for multi-device: if two devices disagree, there is no authoritative source. Last device to sync wins implicitly — non-deterministic. |
| **Full server-side SRS** | Would move domain logic (scheduling, scoring) to the server. Rejected as per ADR-003 constraints: the backend must remain domain-agnostic. |
| **WebSocket / Supabase Realtime** | Realtime is deferred to post-MVP. It adds operational complexity (connection management, reconnection logic) that is not warranted until multi-device live sync is a product requirement. |

---

## Consequences

**Positive:**

- Single round-trip push/pull reduces latency on mobile connections.
- Conflict reporting gives clients the information needed to reconcile local state without a follow-up pull.
- LWW is simple, deterministic, and auditable.
- The Edge Function is self-contained Deno TypeScript — easy to unit test in isolation.
- Keeps the Supabase database schema simple: no complex triggers or Postgres functions for conflict logic.

**Negative / Trade-offs:**

- Adds a Deno/Edge Function deployment step to the release process. Mitigated by Supabase CLI (`supabase functions deploy sync`) and CI integration.
- Contributors running the full stack locally must serve functions via `supabase functions serve`. This requires Docker and is documented in `supabase/README.md`.
- LWW is lossy: the losing write is discarded. This is acceptable for learner progress (the more recent action is authoritative) but must be reconsidered if the data model changes to require merge semantics.
- Edge Function cold-start latency (~200–400 ms on first invocation) adds a one-time delay per sync session. Acceptable at MVP scale.
