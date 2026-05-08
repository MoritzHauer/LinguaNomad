# Project Structure

This document explains every top-level folder and key file in the repository.

```
LinguaNomad/
├── apps/
│   ├── mobile/              # Expo React Native app (the main user-facing app)
│   └── content-admin/       # CLI tool for content management tasks
├── packages/
│   ├── content-schema/      # TypeScript types for all content JSON (single source of truth)
│   ├── db/                  # SQLite database schema, migrations, and repositories
│   ├── learner-state/       # Scoring logic and learner profile state
│   ├── shared/              # Tiny shared utilities (ScriptCode type, assertNever, etc.)
│   └── srs/                 # Spaced-repetition scheduling algorithm
├── content/
│   └── languages/
│       └── ky/              # Kyrgyz content (units, lexemes, sentences, tasks, …)
├── supabase/
│   ├── migrations/          # SQL migrations for the remote Postgres schema
│   ├── functions/           # Deno Edge Functions (sync push/pull, feedback)
│   └── seed.sql             # Dev-only seed data
├── docs/                    # All project documentation
├── pnpm-workspace.yaml      # pnpm monorepo workspace definition
└── vitest.config.ts         # Root test configuration
```

---

## packages/

### `packages/content-schema`

**The single source of truth for content types.**

All JSON files under `content/` must conform to the interfaces exported from `packages/content-schema/src/index.ts`. If you add a new field to a content type, update this file first.

Key exports:
- `UnitBundle` — the whole unit rolled up into one portable object
- `UnitDefinition` — unit metadata plus ID arrays referencing the other content
- `Lexeme` — a vocabulary word
- `SentenceCard` — an example sentence
- `GrammarNote` — a grammar explanation
- `TaskDefinition` — a discriminated union of all exercise types (see [Adding Exercise Types](./adding-exercise-types.md))
- `ReviewSeed` — a spaced-repetition question prompt

### `packages/db`

**SQLite schema and data access for the mobile app.**

- `src/schema.ts` — DDL strings for all CREATE TABLE / CREATE INDEX statements
- `src/migrations.ts` — migration runner
- `src/repositories/content.repository.ts` — read/write `UnitBundle` content
- `src/repositories/review.repository.ts` — read/write review item SRS state
- `src/repositories/sync.repository.ts` — offline sync queue

### `packages/srs`

**Spaced-repetition scheduling.**

Pure TypeScript, no side effects. Exports `scheduleNextReview(state, rating)` which returns the updated `ReviewState`. The rating choices are `"again" | "hard" | "good" | "easy"`.

### `packages/learner-state`

**Scoring and learner profile logic.**

Also pure TypeScript. Key functions:
- `createLessonRunState(unitId)` — start a new lesson session
- `applyAnswerEvaluation(run, evaluation)` — apply a correct/incorrect answer
- `completeLessonRun(profile, run)` — finalize and update the learner profile

### `packages/shared`

Small shared primitives used by both the app and the packages:
- `ScriptCode` — `"cyrl" | "latn" | "arab"`
- `assertNever(value)` — TypeScript exhaustiveness helper

---

## apps/mobile

**The Expo React Native app.** Uses [Expo Router](https://expo.github.io/router/) for file-based routing.

```
apps/mobile/
├── app/                     # Routes (file = screen)
│   ├── index.tsx            # Welcome / home screen
│   ├── course.tsx           # Course overview (list of units)
│   ├── progress.tsx         # Learner progress screen
│   ├── lesson/[unitId].tsx  # Lesson screen — lexeme + sentence cards
│   ├── review/[unitId].tsx  # Review screen — SRS flashcard session
│   ├── task/[unitId].tsx    # Task screen — interactive exercises
│   └── admin/               # Developer-only admin screens
├── lib/
│   ├── course-data.ts       # Imports all content JSON, builds CourseBundle[]
│   ├── custom-exercises.tsx # React context for runtime-added exercises
│   ├── exercise-feedback.ts # Exercise feedback submission helpers
│   └── learner-progress.tsx # React context wrapping learner-state package
├── src/
│   ├── components/          # Reusable UI components
│   └── theme/               # Colors and typography constants
├── app.json                 # Expo app config
├── babel.config.js
└── metro.config.js
```

### Key screens

| File | Route | Purpose |
|---|---|---|
| `app/index.tsx` | `/` | Welcome screen, entry point |
| `app/course.tsx` | `/course` | Grid of unit cards with lock/unlock state |
| `app/lesson/[unitId].tsx` | `/lesson/:unitId` | Step through lexemes and sentence cards |
| `app/review/[unitId].tsx` | `/review/:unitId` | SRS flashcard review session |
| `app/task/[unitId].tsx` | `/task/:unitId` | Interactive exercise tasks for a unit |
| `app/progress.tsx` | `/progress` | Points, streaks, completed units |

### Key components

| Component | Used for |
|---|---|
| `LexemeCard` | Vocabulary word card with Cyrillic + transliteration + gloss |
| `MultipleChoiceTask` | Multiple-choice exercise |
| `FillInBlankTask` | Fill-in-the-blank exercise |
| `ScriptMatchTask` | Script matching (Cyrillic ↔ transliteration) |
| `DialogueTurn` | Renders one turn of a dialogue, including blank slots |
| `ProgressBar` | Progress indicator strip |
| `RatingButtons` | SRS `again / hard / good / easy` buttons for the review screen |
| `FeedbackWidget` | Post-exercise feedback submission overlay |

---

## content/

All learning content lives here as JSON. The active content for Kyrgyz is under:

```
content/languages/ky/
├── units/           # Unit metadata files (*.unit.json)
├── lexemes/         # Vocabulary (*.lexemes.json)
├── sentences/       # Example sentences (*.sentences.json)
├── grammar-notes/   # Grammar explanations (*.grammar-notes.json)
├── tasks/           # Interactive exercises (*.tasks.json)
└── review-seeds/    # SRS review prompts (*.review-seeds.json)
```

Each set of files is named after its unit's slug, e.g.:
- `greetings-and-introductions.unit.json`
- `greetings-and-introductions.lexemes.json`
- `greetings-and-introductions.tasks.json`
- … etc.

See [Adding Content](./adding-content.md) for the step-by-step on creating a new unit.

---

## supabase/

Cloud backend. Contains:
- **Migrations** (`migrations/`) — Postgres DDL applied in order by `supabase db push`
- **Edge Functions** (`functions/`) — Deno TypeScript serverless functions
  - `sync/` — batched last-write-wins sync push and pull
  - `feedback/` — exercise feedback submission
- **seed.sql** — dev-only: creates a starter content-pack row and test user profile

See [`supabase/README.md`](../../supabase/README.md) for local dev setup instructions.

---

## docs/

Project documentation organized by audience:

```
docs/
├── architecture/    # System design, ADRs, diagrams
├── content/         # Content schema spec, ingestion guidelines, licensing
├── product/         # Vision, requirements, backlog
├── ux/              # Mockups and screenshots
└── developer-guide/ # ← You are here
```
