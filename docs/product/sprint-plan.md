# LinguaNomad Sprint Plan

_Planning baseline: 2026-04-30_
_Sprint length: 2 weeks_
_Capacity assumption: ~30 story points per sprint (solo/small team)_

---

## Sprint 1 — Foundation Complete
**Dates:** Sprint 1 (current / just completed)**
**Goal:** Monorepo scaffold, content schema, SRS package, and first two content units are solid and merged.

### Already Done ✅

| Story | Title | Points |
|-------|-------|--------|
| US-001 | Welcome & Onboarding Screen | 2 |
| US-011 | Local SQLite Database Bootstrap | 5 |
| US-019 | Content Schema Package — TypeScript Types & Zod Validators | 3 |
| US-020 | SRS Package — SM-2 Scheduling Algorithm | 3 |
| US-022 | Monorepo Workspace Setup | 3 |
| US-023 | Unit 1 — Script & Sound Survival (Content) | 5 |
| US-024 | Unit 2 — Greetings & Introductions (Content) | 5 |
| US-029 | Source Manifest — Kyrgyz Sources Registered | 2 |

**Sprint 1 Total: 28 points**

### In Progress / Carry Over

- ADRs 001–004 written and merged
- Architecture diagrams generated (01–05)
- Content ingestion plan documented
- UX mockup 01 (welcome screen) created

### Sprint 1 Exit Criteria
- [x] Monorepo builds cleanly
- [x] `packages/content-schema` and `packages/srs` export correctly
- [x] Units 1–2 content JSON validate against schema
- [x] Source manifest registered with license status for all sources
- [ ] CI content validation step running (US-030 — first Sprint 2 priority)

---

## Sprint 2 — MVP Learning Loop
**Dates:** Sprint 2 (starts immediately)
**Goal:** A learner can open the app, complete a lesson with vocabulary and grammar cards, do a task, and review due items — all offline.

### Sprint Goal Statement
> By end of Sprint 2, a motivated tester can install the app, complete Units 1–2, review their first due items, and see their progress reflected in the unit list — with no network connection required.

### Stories

| Story | Title | Points | Priority | Dependencies Met? |
|-------|-------|--------|----------|------------------|
| US-030 | Editorial Pipeline — Content Validation CI Step | 3 | P1 | ✅ US-019, US-029 |
| US-013 | Content Pack Loader — JSON to SQLite | 5 | P1 | ✅ US-011 |
| US-021 | Review Queue Builder — Seed Items from Lesson | 3 | P1 | ✅ US-020, US-011 |
| US-042 | Progress Store — Lesson & Unit Completion State | 3 | P1 | ✅ US-011 |
| US-051 | Navigation — Bottom Tab Bar | 3 | P1 | ✅ US-003, US-041 (partial) |
| US-003 | Course Home / Unit List Screen | 3 | P1 | ✅ US-011, US-030 |
| US-043 | Unit Unlock Logic | 2 | P1 | ✅ US-042, US-003 |
| US-004 | Lesson Screen — Lexeme Cards | 5 | P1 | ✅ US-003, US-013 |

**Sprint 2 Total: 27 points**

### Stretch (if capacity allows)

| Story | Title | Points |
|-------|-------|--------|
| US-005 | Lesson Screen — Sentence Cards | 5 |
| US-041 | Review Screen — Flashcard-Style Review Flow | 8 |

### Sprint 2 Exit Criteria
- [ ] Unit list screen loads from SQLite with correct lock states
- [ ] Lesson screen shows lexeme cards for Unit 1 content
- [ ] Lesson completion writes to progress store and seeds review items
- [ ] Review screen shows due items and accepts quality ratings
- [ ] CI validates content JSON on every PR
- [ ] All of the above work with airplane mode enabled

---

## Sprint 3 — Backend + Sync
**Dates:** Sprint 3
**Goal:** Learner can create an account, sync progress to Supabase, and pick up where they left off on a second device.

### Sprint Goal Statement
> By end of Sprint 3, a learner can sign up, complete lessons across two sessions, sync to Supabase, and restore their progress on a fresh install — while the full offline-first experience from Sprint 2 continues to work.

### Stories

| Story | Title | Points | Priority | Dependencies Met? |
|-------|-------|--------|----------|------------------|
| US-005 | Lesson Screen — Sentence Cards | 5 | P1 | ✅ Sprint 2 |
| US-006 | Lesson Screen — Grammar Note Cards | 3 | P1 | ✅ US-005 |
| US-007 | Task Screen — Guided Dialogue Completion | 8 | P1 | ✅ US-006, US-013 |
| US-010 | End-of-Unit Summary Screen | 2 | P1 | ✅ US-007, US-030 |
| US-031 | Supabase Project Setup & Environment Config | 2 | P2 | ✅ US-022 |
| US-039 | ADR — Supabase Auth & Sync Architecture | 1 | P2 | ✅ US-031 |
| US-040 | Supabase Client Initialization — Shared Package | 2 | P2 | ✅ US-031 |
| US-032 | Email/Password Auth — Sign Up | 3 | P2 | ✅ US-040 |

**Sprint 3 Total: 26 points**

### Stretch (if capacity allows)

| Story | Title | Points |
|-------|-------|--------|
| US-033 | Email/Password Auth — Sign In & Session Persistence | 3 |
| US-035 | Supabase Schema — Progress Sync Tables | 3 |
| US-016 | Offline Sync Queue — Progress Events | 5 |

### Sprint 3 Exit Criteria
- [ ] Full lesson loop (lexemes → sentences → grammar notes → task → summary) works end-to-end
- [ ] Supabase project live, auth sign-up working
- [ ] ADR-005 written before Supabase code merged
- [ ] Sign-up and sign-in screens functional
- [ ] Guest mode available as fallback
- [ ] Existing offline experience from Sprint 2 unchanged

---

## Roadmap Horizon (Sprints 4–6, rough estimates)

| Sprint | Focus | Key Stories |
|--------|-------|-------------|
| S4 | Full sync + Units 3–4 content | US-016, US-017, US-018, US-025, US-026, US-036, US-037 |
| S5 | Units 5–6 + remaining task types + polish | US-027, US-028, US-008, US-009, US-012, US-047, US-050 |
| S6 | Content pack distribution + notifications + stats | US-038, US-044, US-045, US-046, US-048, US-049, US-052 |

---

_Sprint velocity will be recalibrated after Sprint 2 actuals are known._
