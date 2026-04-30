# ADR-002: Offline-First Architecture with SQLite

**Status:** Accepted  
**Date:** 2026-04-30  
**Author:** LinguaNomad core team

---

## Context

LinguaNomad's target learners include people studying on low-bandwidth connections, on commutes, or in areas with intermittent connectivity. The product vision explicitly calls offline study and review a first-class requirement, not a graceful degradation path.

Key forces:

- **Study and review must work with no network access.** Content packs, progress, and review history must all live on the device.
- **SRS scheduling runs on-device.** The `packages/srs` module computes review due dates locally; it must read and write state without a round-trip to any server.
- **Progress must not be lost** if the app is closed mid-session, the device runs out of battery, or the learner is offline for days.
- **Sync must be safe.** When connectivity returns, the app must push local changes without corrupting server-side state or losing local data.
- **React Native / Expo ecosystem.** The storage layer must have reliable Expo support.

Alternatives considered:

| Option | Problem |
|--------|---------|
| AsyncStorage (key/value) | No relational queries; cannot efficiently fetch due review items, join lexemes to sentences, or paginate content. |
| MMKV (key/value) | Same structural problem as AsyncStorage; fast but wrong shape for relational content. |
| Realm / MongoDB Atlas Device Sync | Proprietary; sync model is opaque; vendor lock-in risk; licensing and cost concerns for an open-source project. |
| WatermelonDB | Good abstraction over SQLite, but adds a significant ORM layer above what is needed at MVP; can be evaluated later. |
| SQLite via Expo SQLite | First-class Expo support, battle-tested, relational, zero external dependencies, free. Chosen. |

---

## Decision

LinguaNomad uses **SQLite via `expo-sqlite`** as the primary on-device persistence layer.

Everything that must survive app restarts or offline periods lives in SQLite:

- Downloaded content pack rows (units, lexemes, sentence cards, grammar notes, tasks)
- Learner progress state (lesson completion, unlocked units)
- SRS review item records (ease factor, interval, next due date, last grade)
- Pending sync queue (serialised progress deltas awaiting upload)

### Sync Conflict Resolution

Conflict resolution follows a small set of deterministic rules chosen to never discard learner work:

| Scenario | Resolution |
|----------|-----------|
| Server and client both updated the same progress record | **Last-write-wins by server timestamp** for high-level progress flags (e.g. lesson completed). The server timestamp is the authoritative clock because devices can drift. |
| ReviewItem exists locally but not on server | **Local wins.** Review items are inserted into the server record; they are never dropped on the assumption that a locally-completed review is always valid. |
| ReviewItem on server is more recent than local | **Server wins.** This can happen if the learner used a second device. The local record is overwritten. |
| Pending sync queue partially flushed before connectivity lost | The queue uses an **idempotency key per delta** derived from `(learnerId, contentId, eventType, localTimestamp)`. The server ignores duplicate submissions. |
| Content pack schema version mismatch | **App refuses to apply stale content.** The sync layer checks `schemaVersion` on the pack before inserting rows. |

The sync orchestrator is a small module in `apps/mobile` (not a shared package) because sync policy is application-specific.

---

## Consequences

**Positive:**

- Full study and review loop works with zero network access after content download.
- SQLite is battle-tested, performant on mobile, and familiar to contributors.
- Relational queries handle SRS due-item fetching and content joins cleanly.
- The pending-queue pattern makes sync observable and debuggable (it is just a table).

**Negative / Trade-offs:**

- Offline-first sync is notoriously easy to underdesign. The conflict rules above must be treated as a contract: any schema change to progress records requires a corresponding rule update.
- SQLite migration management needs care. A migration library (e.g. Drizzle ORM migrations or a lightweight custom runner) should be adopted before the first public release to avoid manual ALTER TABLE chains.
- Binary SQLite files cannot be inspected as easily as JSON in developer tooling; a dev-mode inspector or CLI export utility is advisable.
