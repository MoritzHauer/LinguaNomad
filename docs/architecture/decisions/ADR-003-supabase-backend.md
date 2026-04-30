# ADR-003: Supabase as Backend

**Status:** Accepted  
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
| Edge Functions | Not used at MVP |

### Constraints to keep backend narrow

- **No domain logic in Postgres functions or triggers.** SRS scheduling, lesson sequencing, and conflict resolution live in the mobile app and `packages/srs`.
- **Progress records are opaque blobs from the server's perspective.** Supabase stores them; it does not interpret them.
- **Remote config lives in a small config table.** It is read-only from the app and set by operators.

### Self-hosting path

Because Supabase is open-source, the project can be self-hosted via Docker Compose if the managed service becomes unavailable or if contributors prefer full control. This is not required at MVP but is a meaningful exit option.

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
