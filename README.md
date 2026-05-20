# LinguaNomad
LinguaNomad is an open-source app for adventurous language learners. Start your journey with Kyrgyz, and soon explore other underrepresented languages - wherever your curiosity takes you.

## Current Direction

LinguaNomad is being built as a mobile-first, offline-first learning app for serious learners of underrepresented languages, starting with Kyrgyz.
The current MVP direction combines structured lessons, spaced retrieval, task-based practice, and explicit support for script, pronunciation, and grammar.

## Project Status

The repository now includes the first implementation slice of the product:
- An Expo mobile app under `apps/mobile`
- Shared TypeScript packages under `packages/`
- Kyrgyz prototype content under `content/`
- Product, architecture, and content-policy docs under `docs/`
- Supabase sync scaffolding under `supabase/`

## Developer Onramp

### Prerequisites

- Node.js 22+
- `corepack` enabled
- `pnpm` via the workspace package manager

### First Commands

```bash
corepack pnpm install
corepack pnpm typecheck
corepack pnpm test
corepack pnpm mobile
```

### Where To Start Reading

- `docs/product/requirements.md` for MVP scope
- `docs/architecture/architecture.md` for the system shape
- `docs/content/schema-spec.md` for content model expectations
- `apps/mobile/README.md` for app-specific notes

### Repository Shape

- `apps/mobile`: learner-facing Expo app
- `packages/content-schema`: shared lesson and task types
- `packages/learner-state`: lesson progression and completion logic
- `packages/srs`: spaced-repetition scheduling logic
- `content/kyrgyz`: seed lesson data used by the app
- `supabase`: backend sync and schema scaffolding

## Good First Implementation Areas

- Tighten package integration by resolving current workspace typecheck gaps first, especially around `@linguanomad/srs` and content-schema alignment.
- Expand the mobile learner flow in `apps/mobile/app/` by polishing task, review, and progress screens.
- Move more domain logic into shared packages so mobile UI stays thin and reusable.
- Improve content-tooling and validation so Kyrgyz lesson data is easier to add safely.
- Add focused tests around learner-state and SRS behavior before expanding review logic.

## Working Style

- Keep changes small and testable.
- Prefer reusable domain logic over app-only helpers.
- Preserve the offline-first path for lessons, progress, and review state.
- Treat grammar, script support, transliteration, and pronunciation as first-class product concerns.
