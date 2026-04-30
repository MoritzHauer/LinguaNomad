# ADR-003: Supabase as Backend

**Status:** Amended (see Amendment below)  
**Date:** 2026-04-30  
**Author:** LinguaNomad core team

---

## Context

LinguaNomad is an offline-first mobile app. The backend has deliberately narrow responsibilities:

1. **Authentication** — issue JWTs, manage sessions.
2. **Cloud backup of learner progress** — store serialised progress deltas so learners can restore state on a new device.
3. **Content-pack metadata and distribution** — list available packs and versions; serve download URLs.
4. **Remote configuration** — feature flags and minimum-app-version enforcement.

The architecture explicitly defers complex server-side logic. SRS scheduling, lesson sequencing, and content validation all run on-device. The backend does not need to understand LinguaNomad domain logic; it is a durable key/value + file store with auth.

Key forces:

- **Minimal backend surface.** Adding a bespoke API server introduces operational burden (hosting, deployment, secrets, monitoring) that is not warranted at MVP scale.
- **Postgres as persistence.** Progress records and content metadata are relational by nature; a document store is not a natural fit.
- **Open-source project.** Vendor choice must be transparent and self-hostable in principle; contributors should not need a proprietary cloud account to understand the system.
- **Speed to MVP.** The team should not spend weeks on auth infrastructure, storage, or API scaffolding before the core learning loop is proven.

Alternatives considered:

| Option | Problem |
|--------|---------|
| Custom Express / Fastify API + Postgres | Full operational control, but high bootstrapping cost: auth, migrations, hosting, CI, secrets. Not warranted until scale demands it. |
| Firebase (Firestore + Auth) | Document model is a poor fit for relational progress data; Google vendor lock-in; less transparent for open-source contributors. |
| PocketBase | Good self-hosted option, but smaller ecosystem, less battle-tested at scale, and fewer Expo SDK integrations available. |
| Plain file hosting (no auth, no backend) | Cannot support progress backup or user accounts; would limit the product to fully anonymous use. |
| Supabase | Postgres-backed, open-source core (self-hostable), first-class Auth and Storage, good Expo/React Native SDK, Row Level Security enforces per-user data isolation. Chosen. |

---

## Decision

LinguaNomad uses **Supabase** as its backend infrastructure for the MVP.

### Supabase usage scope

| Supabase feature | LinguaNomad use |
|-----------------|----------------|
| Auth (email + OAuth) | Learner accounts and JWT issuance |
| Postgres | Progress snapshots, sync queue acknowledgement, content-pack manifest |
| Storage | Content pack bundle files (`.json` downloads) |
| Row Level Security | Every progress row is scoped to `auth.uid()` |
| Realtime (optional) | Not used at MVP; may be considered for multi-device instant sync later |
| Edge Functions | Used for `/sync` only — transport logic, no domain logic (see Amendment below) |

### Constraints to keep backend narrow

- **No domain logic in Postgres functions or triggers.** SRS scheduling, lesson sequencing, and conflict resolution live in the mobile app and `packages/srs`.
- **Progress records are opaque blobs from the server's perspective.** Supabase stores them; it does not interpret them.
- **Remote config lives in a small config table.** It is read-only from the app and set by operators.

### Self-hosting path

Because Supabase is open-source, the project can be self-hosted via Docker Compose if the managed service becomes unavailable or if contributors prefer full control. This is not required at MVP but is a meaningful exit option.

---

---

## Amendment: Sync Edge Function

**Date:** 2026-04-30  
**Superseded by:** [ADR-005 — Sync Edge Function](ADR-005-sync-edge-function.md)

### Why plain REST is insufficient for batched sync

The original ADR stated "Edge Functions — Not used at MVP". Implementation revealed that batched sync with Last-Write-Wins (LWW) conflict resolution and per-record conflict reporting cannot be cleanly expressed via Supabase's auto-generated REST API:

1. **Atomicity.** A batch upsert spanning multiple progress rows must succeed or fail as a unit. The PostgREST REST layer does not expose a clean single-request batch-with-results primitive that also returns per-row conflict metadata.
2. **Conflict reporting.** LWW resolution requires the server to detect when an incoming record is older than the stored version and report that fact back to the client in the same response. This logic cannot be expressed in PostgREST URL parameters or RPC without a custom Postgres function — at which point an Edge Function is cleaner and more testable.
3. **Single round-trip.** Clients on mobile connections benefit strongly from a single push/pull round-trip rather than N individual REST calls.

### Why this is still consistent with "narrow backend"

The Edge Function contains **transport logic only**. It:

- Accepts a batch of serialised progress deltas.
- Upserts rows using LWW timestamp comparison.
- Returns a conflict report (which rows were rejected and why).
- Does not understand what a progress record *means*.

The Edge Function does **not** perform SRS scheduling, content validation, lesson sequencing, or any other domain logic. Those remain entirely on-device in `packages/srs` and the app layer. The server remains a durable key/value store with auth — the function is merely a smarter write path.

### What stays off-limits server-side (unchanged)

- SRS scheduling and interval calculation
- Lesson sequencing and curriculum logic
- Content-pack validation or transformation
- Any interpretation of what a progress record means semantically

These constraints are unchanged by this amendment. The Edge Function is a narrow exception carved out for transport efficiency, not a precedent for moving domain logic to the server.

---

## Consequences

**Positive:**

- Auth, storage, and Postgres are available on day one with no custom server code.
- Row Level Security provides strong per-user data isolation at the database layer.
- The `@supabase/supabase-js` client has Expo compatibility; no custom fetch shims required.
- Self-hostable; no proprietary lock-in at the protocol level.

**Negative / Trade-offs:**

- Managed Supabase introduces a recurring cost dependency. The free tier is sufficient for MVP, but must be re-evaluated at growth.
- Supabase API changes (storage URLs, auth flows) may require coordinated app updates.
- Contributors who want to run the full stack locally must run the Supabase local dev setup (`supabase start`), which requires Docker. This should be documented clearly in `CONTRIBUTING.md`.
