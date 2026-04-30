# LinguaNomad Product Backlog

_Last updated: 2026-04-30_
_Total stories: 52 | Estimated full-backlog points: 196_

---

## Epic Index

| ID    | Name                            |
|-------|---------------------------------|
| EP-01 | Core Learning Loop              |
| EP-02 | Offline-First Infrastructure    |
| EP-03 | Kyrgyz Content                  |
| EP-04 | Supabase Backend                |
| EP-05 | Progress & Retention            |
| EP-06 | UI/UX Polish                    |

---

## EP-01 · Core Learning Loop

### US-001
- **Epic:** EP-01
- **Title:** Welcome & Onboarding Screen
- **Story:** As a new learner, I want to see a welcoming entry screen that introduces the app concept, so that I understand what LinguaNomad is before I start.
- **Acceptance Criteria:**
  - App launches to a welcome screen with app name and brief value proposition
  - CTA button navigates to onboarding flow
  - Screen works offline (no network call required)
  - Cyrillic font renders correctly on Android and iOS
  - Design matches approved mockup-01-welcome
- **Points:** 2
- **Priority:** P1
- **Dependencies:** —
- **Status:** done

---

### US-002
- **Epic:** EP-01
- **Title:** Onboarding: Script & Pronunciation Intro
- **Story:** As a new learner, I want a short onboarding sequence introducing the Kyrillic script and Kyrgyz sound system, so that I can start reading before the first lesson.
- **Acceptance Criteria:**
  - Onboarding covers at minimum: alphabet overview, vowel harmony concept, 2–3 pronunciation examples
  - Learner can tap through at their own pace
  - Audio examples play offline (bundled assets)
  - Onboarding can be skipped and revisited from settings
  - Completion sets `onboarding_complete` flag in local state
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-001, US-011
- **Status:** backlog

---

### US-003
- **Epic:** EP-01
- **Title:** Course Home / Unit List Screen
- **Story:** As a learner, I want to see all course units in a list with their unlock status, so that I know where I am and where I am going.
- **Acceptance Criteria:**
  - Units display title, short description, and lock/unlock state
  - Completed units show a visual completion marker
  - Locked units show a clear disabled state with unlock hint
  - Screen loads from local SQLite; no network required
  - Tapping an available unit navigates to lesson screen
- **Points:** 3
- **Priority:** P1
- **Dependencies:** US-011, US-030
- **Status:** backlog

---

### US-004
- **Epic:** EP-01
- **Title:** Lesson Screen — Lexeme Cards
- **Story:** As a learner studying a lesson, I want to read through vocabulary (lexeme) cards with Cyrillic, transliteration, and gloss, so that I can learn new words in context.
- **Acceptance Criteria:**
  - Card shows: Cyrillic form, transliteration, English gloss, example sentence
  - Grammar/pronunciation note appears inline when present
  - Swipe or tap-next advances to next card
  - Progress bar shows position in lesson
  - All card data is read from local SQLite content pack
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-003, US-011, US-013
- **Status:** backlog

---

### US-005
- **Epic:** EP-01
- **Title:** Lesson Screen — Sentence Cards
- **Story:** As a learner, I want to see sentence cards with Cyrillic text, transliteration toggle, and English translation, so that I encounter language in meaningful chunks.
- **Acceptance Criteria:**
  - Sentence displayed in Cyrillic by default
  - Transliteration toggle shows/hides romanization
  - English translation revealed on tap
  - Tap on any lexeme highlights its gloss
  - Card renders correctly offline
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-004
- **Status:** backlog

---

### US-006
- **Epic:** EP-01
- **Title:** Lesson Screen — Grammar Note Cards
- **Story:** As a learner, I want to see grammar note cards at the point of need during a lesson, so that I understand the linguistic pattern without leaving the lesson.
- **Acceptance Criteria:**
  - Grammar note cards appear at position defined in `UnitDefinition.grammarNoteIds`
  - Note shows title, explanation paragraph, and 1–2 illustrative sentence examples
  - Learner can expand/collapse detail section
  - Card type is visually distinct from lexeme/sentence cards
  - Skipping grammar notes does not block lesson completion
- **Points:** 3
- **Priority:** P1
- **Dependencies:** US-005
- **Status:** backlog

---

### US-007
- **Epic:** EP-01
- **Title:** Task Screen — Guided Dialogue Completion
- **Story:** As a learner, I want to complete a guided dialogue task where I fill in missing turns, so that I practice producing language in a realistic exchange.
- **Acceptance Criteria:**
  - Task screen shows dialogue with blank turn(s) requiring learner input
  - Input validated against acceptable answers (array match)
  - Feedback shows correct answer on wrong attempt (max 2 tries)
  - Task completion recorded in local progress store
  - Task works fully offline
- **Points:** 8
- **Priority:** P1
- **Dependencies:** US-006, US-013
- **Status:** backlog

---

### US-008
- **Epic:** EP-01
- **Title:** Task Screen — Register Choice Task
- **Story:** As a learner, I want to complete a register-choice task selecting the right form for elder, peer, or stranger contexts, so that I learn Kyrgyz politeness distinctions.
- **Acceptance Criteria:**
  - Task presents a scenario description and 3 answer choices
  - Correct choice is explained with a short note on register
  - Incorrect choice gives targeted feedback
  - Task type visually distinct from dialogue completion
  - Completion recorded locally
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-007
- **Status:** backlog

---

### US-009
- **Epic:** EP-01
- **Title:** Task Screen — Script-to-Meaning Task
- **Story:** As a learner in early units, I want to map Cyrillic text to meaning without relying on transliteration, so that I build direct reading ability.
- **Acceptance Criteria:**
  - Task shows Cyrillic word or phrase; learner selects meaning from choices
  - No transliteration shown during task unless learner requests hint
  - Hint usage tracked (soft penalty)
  - Task works offline
  - Applicable to Units 1 and 2 content
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-007
- **Status:** backlog

---

### US-010
- **Epic:** EP-01
- **Title:** End-of-Unit Summary Screen
- **Story:** As a learner who just finished a lesson and task, I want to see a summary of what I completed and what I'll review, so that I feel a sense of progress.
- **Acceptance Criteria:**
  - Shows count of new lexemes, sentences, and tasks completed
  - Shows number of items seeded into review queue
  - "Start Review" CTA navigates to review screen
  - "Back to Course" CTA returns to unit list
  - Completion persisted locally before screen renders
- **Points:** 2
- **Priority:** P1
- **Dependencies:** US-007, US-030
- **Status:** backlog

---

### US-011
- **Epic:** EP-01 / EP-02
- **Title:** Local SQLite Database Bootstrap
- **Story:** As a developer, I need the mobile app to initialize a SQLite database on first launch with the correct schema, so that all learning state and content can be stored offline.
- **Acceptance Criteria:**
  - `expo-sqlite` (or `better-sqlite3` equivalent) initialized on app startup
  - Schema includes tables: `content_packs`, `units`, `lexemes`, `sentences`, `grammar_notes`, `tasks`, `progress`, `review_items`, `sync_queue`
  - Migration system handles schema upgrades
  - Database path is consistent across restarts
  - Tests confirm schema creation succeeds
- **Points:** 5
- **Priority:** P1
- **Dependencies:** —
- **Status:** done

---

### US-012
- **Epic:** EP-01
- **Title:** Pattern Swap Task
- **Story:** As a learner, I want to complete a pattern swap task where I substitute one element of a sentence (name, place, food), so that I practice productive manipulation of Kyrgyz structure.
- **Acceptance Criteria:**
  - Task shows model sentence and a target substitution prompt
  - Learner types or selects the new element
  - Validation accepts morphologically correct alternatives
  - Feedback explains any vowel harmony or suffix change
  - Works offline
- **Points:** 5
- **Priority:** P2
- **Dependencies:** US-007
- **Status:** backlog

---

### US-013
- **Epic:** EP-01 / EP-02
- **Title:** Content Pack Loader — JSON to SQLite
- **Story:** As a developer, I need a service that reads bundled or downloaded JSON content packs and loads them into SQLite, so that lesson content is available offline.
- **Acceptance Criteria:**
  - Loader validates JSON against `content-schema` types before insert
  - Idempotent: re-loading the same pack does not create duplicates
  - Loader logs validation errors per item without aborting the full pack
  - Unit test covers load of Unit 1 and Unit 2 fixtures
  - Bundled starter pack (Units 1–2) loads on first launch
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-011
- **Status:** backlog

---

## EP-02 · Offline-First Infrastructure

### US-014
- **Epic:** EP-02
- **Title:** Content Pack Download — Metadata & Listing
- **Story:** As a learner, I want to see available downloadable content packs with their size and description, so that I can choose what to download before going offline.
- **Acceptance Criteria:**
  - Pack list fetched from Supabase (or local fallback if offline)
  - Each pack shows: name, language, unit count, download size
  - Already-downloaded packs shown as installed
  - Offline: shows cached pack list or a graceful empty state
  - Navigation into download flow from unit list
- **Points:** 3
- **Priority:** P2
- **Dependencies:** US-011, US-040
- **Status:** backlog

---

### US-015
- **Epic:** EP-02
- **Title:** Content Pack Download — Background Download & Progress
- **Story:** As a learner, I want to download a content pack in the background with a visible progress indicator, so that I can continue using the app while packs download.
- **Acceptance Criteria:**
  - Download uses Expo's background download API or equivalent
  - Progress bar updates at least every 10%
  - Download survives app backgrounding
  - On completion, pack is automatically loaded into SQLite via US-013
  - Download failure shows retry option
- **Points:** 8
- **Priority:** P2
- **Dependencies:** US-014, US-013
- **Status:** backlog

---

### US-016
- **Epic:** EP-02
- **Title:** Offline Sync Queue — Progress Events
- **Story:** As a learner, I want my progress events (lesson complete, review result, task result) to be queued locally when offline, so that nothing is lost and sync happens automatically when I reconnect.
- **Acceptance Criteria:**
  - `sync_queue` table records each progress event with timestamp and type
  - Queue is durable across app restarts
  - Events include: lesson_complete, review_result, task_complete, review_schedule_update
  - UI does not require sync to function
  - Queue drains automatically when connectivity is detected
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-011, US-042
- **Status:** backlog

---

### US-017
- **Epic:** EP-02
- **Title:** Connectivity Monitor
- **Story:** As the app, I need to detect network connectivity changes so that I can trigger sync when the learner comes back online.
- **Acceptance Criteria:**
  - Uses `@react-native-community/netinfo` or Expo equivalent
  - Fires a sync attempt within 5 seconds of connectivity restored
  - Offline indicator shown in app header when disconnected
  - No crash or error thrown when all network requests fail offline
  - Unit test stubs connectivity transitions
- **Points:** 3
- **Priority:** P1
- **Dependencies:** US-016
- **Status:** backlog

---

### US-018
- **Epic:** EP-02
- **Title:** Conflict-Free Progress Merge on Sync
- **Story:** As a learner who studied on two devices, I want my progress to merge without data loss when both devices sync, so that I never lose review history.
- **Acceptance Criteria:**
  - Merge strategy: last-write-wins per item with server timestamp as authority
  - Review schedule conflicts resolved by taking the stricter (earlier) next-due date
  - Sync does not delete local-only items not yet acknowledged by server
  - Conflict resolution is logged (debug mode)
  - Integration test covers two-device merge scenario with fixtures
- **Points:** 8
- **Priority:** P2
- **Dependencies:** US-016, US-042
- **Status:** backlog

---

### US-019
- **Epic:** EP-02
- **Title:** Content Schema Package — TypeScript Types & Zod Validators
- **Story:** As a developer, I need `packages/content-schema` to export TypeScript types and Zod validators for all content objects, so that both app and tooling share one source of truth.
- **Acceptance Criteria:**
  - Exports: `UnitDefinition`, `Lexeme`, `SentenceCard`, `GrammarNote`, `TaskDefinition`, `SourceRecord`, `ReviewItem`
  - Each type has a corresponding Zod schema
  - `parseUnit()`, `parseLexeme()` etc. throw on invalid input with descriptive messages
  - Package has its own `tsconfig.json` and builds cleanly
  - Used by both mobile app and content-admin
- **Points:** 3
- **Priority:** P1
- **Dependencies:** —
- **Status:** done

---

### US-020
- **Epic:** EP-02
- **Title:** SRS Package — SM-2 Scheduling Algorithm
- **Story:** As a learner, I want my review items scheduled by spaced repetition so that reviews are timed to maximize retention without over-drilling.
- **Acceptance Criteria:**
  - `packages/srs` implements SM-2 (or equivalent) with quality ratings 0–5
  - `scheduleNext(item, quality): ReviewItem` returns updated item with new due date and interval
  - Algorithm is deterministic and unit-tested
  - Package has no React Native dependencies (runs in Node for testing)
  - Exported and consumed by mobile app locally (no server call)
- **Points:** 3
- **Priority:** P1
- **Dependencies:** —
- **Status:** done

---

### US-021
- **Epic:** EP-02
- **Title:** Review Queue Builder — Seed Items from Lesson
- **Story:** As a learner who completes a lesson, I want review items automatically seeded from that lesson's lexemes and sentences, so that I don't need to manually add items.
- **Acceptance Criteria:**
  - On lesson completion, one `ReviewItem` created per lexeme and sentence card
  - Initial due date: now (immediately reviewable)
  - Initial interval: 0, easiness factor: 2.5 (SM-2 defaults)
  - Duplicate prevention: re-completing a lesson does not create duplicate items
  - Items stored in SQLite `review_items` table
- **Points:** 3
- **Priority:** P1
- **Dependencies:** US-020, US-011
- **Status:** backlog

---

### US-022
- **Epic:** EP-02
- **Title:** Monorepo Workspace Setup
- **Story:** As a developer, I need the TypeScript monorepo (`apps/`, `packages/`) configured with shared tsconfig, lint, and build scripts, so that all packages build and test consistently.
- **Acceptance Criteria:**
  - pnpm workspaces (or equivalent) linking `apps/` and `packages/`
  - Root `package.json` scripts: `build`, `test`, `lint`, `typecheck`
  - `packages/content-schema` and `packages/srs` build without errors
  - `apps/mobile` resolves workspace packages via symlinks
  - CI-ready: `pnpm run build && pnpm run test` exits 0
- **Points:** 3
- **Priority:** P1
- **Dependencies:** —
- **Status:** done

---

## EP-03 · Kyrgyz Content

### US-023
- **Epic:** EP-03
- **Title:** Unit 1 — Script & Sound Survival (Content)
- **Story:** As a learner, I want to complete Unit 1 covering Cyrillic reading and core Kyrgyz sounds, so that I can read script before advancing to vocabulary.
- **Acceptance Criteria:**
  - Unit contains: ≥8 lexemes, ≥6 sentence cards, 1–2 grammar notes, ≥1 task
  - Grammar notes cover: vowel harmony intro, key sound-to-letter mappings
  - Task type: script-to-meaning (US-009)
  - All content original (not verbatim from Peace Corps manual)
  - Source record references `source-manifest.json`
  - JSON validates against `content-schema`
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-019
- **Status:** done

---

### US-024
- **Epic:** EP-03
- **Title:** Unit 2 — Greetings & Introductions (Content)
- **Story:** As a learner, I want to complete Unit 2 teaching greetings, name exchanges, and basic identity statements in Kyrgyz.
- **Acceptance Criteria:**
  - Unit contains: ≥10 lexemes, ≥8 sentence cards, 1–2 grammar notes, ≥1 task
  - Grammar notes cover: personal pronouns, basic copular statements
  - Task type: guided dialogue completion (US-007)
  - Editorial checklist passed (originality, schema readiness, offline task)
  - JSON validates against `content-schema`
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-019
- **Status:** done

---

### US-025
- **Epic:** EP-03
- **Title:** Unit 3 — Politeness & Address Forms (Content)
- **Story:** As a learner, I want to complete Unit 3 covering formal/informal register, apologies, and respectful openings in Kyrgyz.
- **Acceptance Criteria:**
  - Unit contains: ≥10 lexemes, ≥8 sentence cards, 1–2 grammar notes, ≥1 task
  - Grammar notes cover: pronoun register contrast, key particles
  - Task type: register choice (US-008)
  - Editorial checklist passed
  - JSON validates against `content-schema`
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-019, US-024
- **Status:** backlog

---

### US-026
- **Epic:** EP-03
- **Title:** Unit 4 — Identity, Origin & Family Basics (Content)
- **Story:** As a learner, I want to complete Unit 4 covering where I'm from, family members, and simple relationships in Kyrgyz.
- **Acceptance Criteria:**
  - Unit contains: ≥12 lexemes, ≥10 sentence cards, 2 grammar notes, ≥1 task
  - Grammar notes cover: possessive patterns, nominal linking
  - Task type: pattern swap or information-gap (US-012)
  - Editorial checklist passed
  - JSON validates against `content-schema`
- **Points:** 5
- **Priority:** P1
- **Dependencies:** US-025
- **Status:** backlog

---

### US-027
- **Epic:** EP-03
- **Title:** Unit 5 — Food & Everyday Preferences (Content)
- **Story:** As a learner, I want to complete Unit 5 covering food vocabulary, expressing preferences, and tea-table exchanges in Kyrgyz.
- **Acceptance Criteria:**
  - Unit contains: ≥12 lexemes, ≥10 sentence cards, 2 grammar notes, ≥1 task
  - Grammar notes cover: high-utility verbs, polite offers, singular/plural
  - Task type: mini role task
  - Editorial checklist passed
  - JSON validates against `content-schema`
- **Points:** 5
- **Priority:** P2
- **Dependencies:** US-026
- **Status:** backlog

---

### US-028
- **Epic:** EP-03
- **Title:** Unit 6 — Location & Everyday Movement (Content)
- **Story:** As a learner, I want to complete Unit 6 covering asking where things are, saying where I'm going, and basic transport/destination talk.
- **Acceptance Criteria:**
  - Unit contains: ≥12 lexemes, ≥10 sentence cards, 2–3 grammar notes, ≥1 task
  - Grammar notes cover: beginner directional/locative case behavior
  - Task type: information-gap microtask (guided route/destination dialogue)
  - Editorial checklist passed
  - JSON validates against `content-schema`
- **Points:** 5
- **Priority:** P2
- **Dependencies:** US-027
- **Status:** backlog

---

### US-029
- **Epic:** EP-03
- **Title:** Source Manifest — Kyrgyz Sources Registered
- **Story:** As a content editor, I want all Kyrgyz content sources registered in `source-manifest.json` with license status, so that no content ships with unresolved attribution.
- **Acceptance Criteria:**
  - Peace Corps manual registered with `committable: false`, `packagable: false`
  - All original LinguaNomad units reference only clear-license or original-authorship sources
  - Manifest validates against `SourceRecord` schema
  - CI step: manifest validation runs on every PR
  - No unit ships referencing a source with unresolved license
- **Points:** 2
- **Priority:** P1
- **Dependencies:** US-019
- **Status:** done

---

### US-030
- **Epic:** EP-03
- **Title:** Editorial Pipeline — Content Validation CI Step
- **Story:** As a developer, I want a CI check that validates all content JSON against `content-schema`, so that malformed content is caught before merge.
- **Acceptance Criteria:**
  - CI step runs `content-schema` Zod validators against all `content/` JSON files
  - Build fails if any file fails validation
  - Error output names the failing file and field
  - Check runs on PRs touching `content/` directory
  - Passes cleanly on current Units 1–2 + source manifest
- **Points:** 3
- **Priority:** P1
- **Dependencies:** US-019, US-029
- **Status:** backlog

---

## EP-04 · Supabase Backend

### US-031
- **Epic:** EP-04
- **Title:** Supabase Project Setup & Environment Config
- **Story:** As a developer, I need a Supabase project configured with environment variables for the mobile app, so that the backend is ready for auth and sync features.
- **Acceptance Criteria:**
  - Supabase project created (free tier sufficient for MVP)
  - `.env.example` documents required vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `supabase` client initialized in `packages/shared` or `apps/mobile/lib`
  - Client not imported in offline-only code paths (no crash when env vars absent)
  - README documents how to set up local Supabase for development
- **Points:** 2
- **Priority:** P2
- **Dependencies:** US-022
- **Status:** backlog

---

### US-032
- **Epic:** EP-04
- **Title:** Email/Password Authentication — Sign Up
- **Story:** As a new learner, I want to create an account with email and password, so that my progress can sync across devices.
- **Acceptance Criteria:**
  - Sign-up screen with email + password fields + confirm password
  - Supabase `auth.signUp()` call on submit
  - Validation: email format, password min 8 chars
  - On success: navigate to onboarding / course home
  - On error: display Supabase error message in human-readable form
  - Offline: show clear message that account creation requires connectivity
- **Points:** 3
- **Priority:** P2
- **Dependencies:** US-031
- **Status:** backlog

---

### US-033
- **Epic:** EP-04
- **Title:** Email/Password Authentication — Sign In & Session Persistence
- **Story:** As a returning learner, I want to sign in with email and password, and stay signed in between sessions, so that I don't re-authenticate every launch.
- **Acceptance Criteria:**
  - Sign-in screen with email + password fields
  - Session persisted via Expo SecureStore
  - Auto-login on app launch if valid session exists
  - Sign-out clears session from SecureStore
  - Expired session redirects to sign-in without data loss
- **Points:** 3
- **Priority:** P2
- **Dependencies:** US-032
- **Status:** backlog

---

### US-034
- **Epic:** EP-04
- **Title:** Guest Mode — Learn Without Account
- **Story:** As a learner who doesn't want to register, I want to use the app in guest mode with local-only storage, so that I can evaluate the app before committing to an account.
- **Acceptance Criteria:**
  - "Continue as guest" option on sign-in screen
  - Guest state stored only in local SQLite
  - Sync features disabled (no queue drain) in guest mode
  - Upgrade prompt offered when guest completes Unit 1
  - Guest progress can be claimed by a new account on sign-up
- **Points:** 5
- **Priority:** P2
- **Dependencies:** US-032
- **Status:** backlog

---

### US-035
- **Epic:** EP-04
- **Title:** Supabase Schema — Progress Sync Tables
- **Story:** As a developer, I need Supabase tables for learner progress and review state, so that sync has a reliable backend target.
- **Acceptance Criteria:**
  - Tables: `learner_progress`, `review_items_remote`, `sync_log`
  - Row-level security: learner can only read/write their own rows
  - `updated_at` column on all tables for conflict resolution
  - Supabase migrations under `supabase/migrations/`
  - Schema documented in `docs/architecture/` with ADR if significant
- **Points:** 3
- **Priority:** P2
- **Dependencies:** US-031
- **Status:** backlog

---

### US-036
- **Epic:** EP-04
- **Title:** Progress Sync — Upload Queue to Supabase
- **Story:** As a learner, I want my locally queued progress events uploaded to Supabase when I reconnect, so that my cloud backup is current.
- **Acceptance Criteria:**
  - Sync service reads `sync_queue` and upserts records to Supabase
  - Successful uploads marked as `synced` in queue
  - Failed uploads retried with exponential backoff (max 3 retries)
  - Sync runs on: app foreground, connectivity restored
  - Learner sees last-synced timestamp in profile/settings
- **Points:** 5
- **Priority:** P2
- **Dependencies:** US-016, US-035, US-033
- **Status:** backlog

---

### US-037
- **Epic:** EP-04
- **Title:** Progress Sync — Download Remote State on Login
- **Story:** As a learner signing into a new device, I want my remote progress pulled into the local SQLite so that I can continue exactly where I left off.
- **Acceptance Criteria:**
  - On sign-in, fetch remote `learner_progress` and `review_items_remote`
  - Merge with local state using conflict-free strategy (US-018)
  - Download completes before user sees course home (with loading state)
  - Works for accounts with Units 1–6 progress
  - Handles Supabase errors gracefully (fall back to local state)
- **Points:** 5
- **Priority:** P2
- **Dependencies:** US-036, US-018
- **Status:** backlog

---

### US-038
- **Epic:** EP-04
- **Title:** Content Pack Distribution via Supabase Storage
- **Story:** As a developer, I want content packs hosted in Supabase Storage, so that future language packs can be downloaded without app updates.
- **Acceptance Criteria:**
  - Content packs as versioned JSON bundles in Supabase Storage bucket
  - Pack metadata table in Supabase with: pack_id, language, version, size_bytes, url
  - Mobile app fetches pack list from metadata table (US-014)
  - Pack download uses signed URL with expiry
  - Starter Kyrgyz pack (Units 1–6) uploaded and accessible
- **Points:** 5
- **Priority:** P2
- **Dependencies:** US-035, US-015
- **Status:** backlog

---

### US-039
- **Epic:** EP-04
- **Title:** ADR — Supabase Auth & Sync Architecture
- **Story:** As a developer, I want an ADR documenting the Supabase auth and sync design decisions, so that future contributors understand the rationale.
- **Acceptance Criteria:**
  - ADR written at `docs/architecture/decisions/ADR-005-supabase-auth-sync.md`
  - Covers: auth approach, RLS design, sync strategy, conflict model
  - Reviewed and approved before implementation begins
  - References ADR-003 (existing Supabase backend ADR)
- **Points:** 1
- **Priority:** P2
- **Dependencies:** US-031
- **Status:** backlog

---

### US-040
- **Epic:** EP-04
- **Title:** Supabase Client Initialization — Shared Package
- **Story:** As a developer, I need the Supabase client initialized once in a shared module so that all app features use the same authenticated client instance.
- **Acceptance Criteria:**
  - `packages/shared/supabase.ts` exports initialized `SupabaseClient`
  - Client uses env vars from Expo Constants or process.env
  - Session hydration from SecureStore on client creation
  - No Supabase import outside of `packages/shared` and `apps/mobile/lib`
  - TypeScript strict mode passes
- **Points:** 2
- **Priority:** P2
- **Dependencies:** US-031
- **Status:** backlog

---

## EP-05 · Progress & Retention

### US-041
- **Epic:** EP-05
- **Title:** Review Screen — Flashcard-Style Review Flow
- **Story:** As a learner, I want to review due items in a flashcard flow with self-rating, so that the SRS algorithm can schedule my next review accurately.
- **Acceptance Criteria:**
  - Review screen shows due items sorted by due date ascending
  - Each card: Cyrillic prompt, learner taps to reveal answer
  - Rating buttons: Again / Hard / Good / Easy (maps to SM-2 quality 0–5)
  - Rating updates review item via `packages/srs` and writes to SQLite
  - Empty state when no items are due
  - Works fully offline
- **Points:** 8
- **Priority:** P1
- **Dependencies:** US-020, US-021, US-011
- **Status:** backlog

---

### US-042
- **Epic:** EP-05
- **Title:** Progress Store — Lesson & Unit Completion State
- **Story:** As a learner, I want the app to remember which lessons and units I've completed so that my unlock state and progress are accurate across restarts.
- **Acceptance Criteria:**
  - `progress` table in SQLite records unit_id, lesson_complete (bool), task_complete (bool), completed_at
  - Progress readable synchronously for unit list rendering
  - Completing a lesson writes a progress row
  - Progress survives app restart and device reboot
  - Progress state exported to sync queue for upload (US-016)
- **Points:** 3
- **Priority:** P1
- **Dependencies:** US-011
- **Status:** backlog

---

### US-043
- **Epic:** EP-05
- **Title:** Unit Unlock Logic
- **Story:** As a learner, I want units to unlock sequentially after completing the previous unit's lesson and task, so that progression is guided without being punishing.
- **Acceptance Criteria:**
  - Unit N+1 unlocks when Unit N lesson AND task are marked complete in progress store
  - Unit 1 always unlocked
  - Lock state computed at render time from SQLite progress
  - Unlocking is immediate (no server call required)
  - Edge case: re-install preserves unlock state if progress synced (US-037)
- **Points:** 2
- **Priority:** P1
- **Dependencies:** US-042, US-003
- **Status:** backlog

---

### US-044
- **Epic:** EP-05
- **Title:** Daily Review Reminder — Local Push Notification
- **Story:** As a learner, I want an optional daily reminder when I have due review items, so that I stay consistent without obsessive in-app checking.
- **Acceptance Criteria:**
  - Learner opts in to reminders in settings
  - Notification scheduled for user-selected time daily (default: 19:00)
  - Notification fires only when `review_items` table has items with `due_date ≤ today`
  - Tapping notification deep-links to review screen
  - Notification cancelled if learner completes all reviews before scheduled time
- **Points:** 5
- **Priority:** P2
- **Dependencies:** US-041, US-042
- **Status:** backlog

---

### US-045
- **Epic:** EP-05
- **Title:** Progress Dashboard — Learner Stats Screen
- **Story:** As a learner, I want to see my learning stats (units completed, total reviews done, items learned), so that I can feel tangible progress.
- **Acceptance Criteria:**
  - Screen shows: units completed / total, total lexemes learned, review sessions this week, current streak (days studied)
  - All data computed from local SQLite
  - Streak resets if no lesson or review activity for 48h
  - Accessible from main nav
  - Renders offline
- **Points:** 3
- **Priority:** P2
- **Dependencies:** US-042, US-041
- **Status:** backlog

---

### US-046
- **Epic:** EP-05
- **Title:** Review Item Priority — Overdue Surfacing
- **Story:** As a learner returning after a break, I want overdue items surfaced first in the review queue so that I tackle forgotten material before adding new.
- **Acceptance Criteria:**
  - Items with `due_date < now - 24h` sorted to top of review queue
  - Visual badge or count of overdue items on review CTA
  - Items due today shown after overdue items
  - Future items excluded from session
  - SRS algorithm not penalized for intervals > max interval (cap at 180 days)
- **Points:** 2
- **Priority:** P2
- **Dependencies:** US-041
- **Status:** backlog

---

## EP-06 · UI/UX Polish

### US-047
- **Epic:** EP-06
- **Title:** Design System — Typography & Color Tokens
- **Story:** As a developer, I want a shared design token set (colors, typography, spacing) so that all screens are visually consistent with minimal per-screen style effort.
- **Acceptance Criteria:**
  - `packages/shared/theme.ts` exports color palette, font scale, spacing scale
  - Cyrillic-compatible font (e.g. Inter or Noto Sans) loaded via Expo Font
  - Dark mode tokens defined (even if not activated in MVP)
  - All existing screens use tokens, not hardcoded hex values
  - Typography scale tested on Android (Pixel) and iOS (iPhone SE)
- **Points:** 3
- **Priority:** P2
- **Dependencies:** US-022
- **Status:** backlog

---

### US-048
- **Epic:** EP-06
- **Title:** Lesson Screen — Card Swipe Animations
- **Story:** As a learner, I want smooth swipe and transition animations on lesson cards so that the study experience feels polished.
- **Acceptance Criteria:**
  - Card transitions use `react-native-reanimated` (no JS-thread animations)
  - Swipe gesture recognizer handles left/right with spring physics
  - Minimum 60fps on a mid-range Android device
  - Animation disabled in `reduceMotion` accessibility mode
  - No visual jank on first card load
- **Points:** 3
- **Priority:** P3
- **Dependencies:** US-004
- **Status:** backlog

---

### US-049
- **Epic:** EP-06
- **Title:** Review Screen — Flip Card Animation
- **Story:** As a learner doing reviews, I want a satisfying card-flip reveal animation so that the review experience feels engaging.
- **Acceptance Criteria:**
  - Tap "reveal" triggers 3D flip animation revealing answer
  - Flip completes in ≤300ms
  - Animation uses `react-native-reanimated`
  - Reduce-motion: instant reveal without animation
  - No layout shift after flip
- **Points:** 2
- **Priority:** P3
- **Dependencies:** US-041
- **Status:** backlog

---

### US-050
- **Epic:** EP-06
- **Title:** Accessibility — Screen Reader Support
- **Story:** As a learner using a screen reader, I want all lesson and review content announced correctly, so that the app is usable with assistive technology.
- **Acceptance Criteria:**
  - All interactive elements have `accessibilityLabel`
  - Cyrillic text has `accessibilityLanguage="ky"` where appropriate
  - Tap targets ≥ 44×44pt
  - VoiceOver (iOS) and TalkBack (Android) tested on lesson and review screens
  - No accessibility lint errors in CI
- **Points:** 3
- **Priority:** P2
- **Dependencies:** US-004, US-041
- **Status:** backlog

---

### US-051
- **Epic:** EP-06
- **Title:** Navigation — Bottom Tab Bar
- **Story:** As a learner, I want a persistent bottom navigation bar with tabs for Course, Review, and Profile so that I can move between sections quickly.
- **Acceptance Criteria:**
  - Bottom tabs: Course (unit list), Review (due queue), Profile/Stats
  - Active tab highlighted
  - Review tab shows badge with due item count
  - Navigation implemented via Expo Router tab layout
  - Works on both iOS safe area and Android nav bar
- **Points:** 3
- **Priority:** P1
- **Dependencies:** US-003, US-041
- **Status:** backlog

---

### US-052
- **Epic:** EP-06
- **Title:** Transliteration Toggle — Persistent Preference
- **Story:** As a learner, I want my transliteration preference (show/hide) to persist across sessions so that I don't have to reset it every time I open the app.
- **Acceptance Criteria:**
  - Transliteration toggle stored in Expo SecureStore or AsyncStorage
  - Default: transliteration visible for Units 1–2, hidden for Units 3+
  - Override available in settings
  - Preference applied immediately without restart
  - Unit test confirms default logic per unit index
- **Points:** 2
- **Priority:** P2
- **Dependencies:** US-005
- **Status:** backlog

---

## Backlog Summary

| Epic  | Stories | Total Points | P1 | P2 | P3 |
|-------|---------|-------------|----|----|-----|
| EP-01 | 13      | 57          | 10 | 3  | 0  |
| EP-02 | 9       | 37          | 7  | 2  | 0  |
| EP-03 | 8       | 34          | 6  | 2  | 0  |
| EP-04 | 9       | 29          | 0  | 9  | 0  |
| EP-05 | 6       | 23          | 4  | 2  | 0  |
| EP-06 | 6       | 16          | 1  | 3  | 2  |
| **Total** | **52** | **196**  | **28** | **21** | **2** |

**Already Done:** US-001, US-011, US-019, US-020, US-022, US-023, US-024, US-029 (8 stories, ~28 points)
