# LinguaNomad Definition of Done

_This checklist applies to every user story before it can be moved to "done"._
_All applicable items must pass. Items marked "N/A" must be explicitly noted in the PR description._

---

## Code Quality

- [ ] TypeScript strict mode — no `any` types without explicit comment explaining why
- [ ] No `console.log` or debug statements in merged code (`console.error` in error handlers is acceptable)
- [ ] All tests pass (`pnpm run test` exits 0)
- [ ] TypeScript compiles without errors (`pnpm run typecheck` exits 0)
- [ ] ESLint passes with zero errors (`pnpm run lint` exits 0)
- [ ] No unused imports or dead code paths (auto-caught by lint)
- [ ] Functions over 40 lines reviewed for extraction
- [ ] No hardcoded credentials, API keys, or environment-specific paths

---

## UI / User-Facing Work

- [ ] Mockup approved by Moritz before build begins (not after)
- [ ] Feature works correctly with no network connection (airplane mode tested)
- [ ] Cyrillic text renders correctly on Android and iOS
- [ ] Transliteration toggle state respected if applicable
- [ ] Touch targets are ≥ 44×44pt
- [ ] Screen tested on at minimum one Android device and one iOS device (or simulators)
- [ ] `reduceMotion` accessibility setting disables animations where present
- [ ] Loading and empty states implemented (not blank screens)
- [ ] Error states show human-readable messages (not raw API errors)

---

## Content (when story includes content JSON)

- [ ] All content JSON validates against `content-schema` Zod validators (CI must pass)
- [ ] Content is original LinguaNomad wording — no verbatim text from non-cleared sources
- [ ] Source record exists in `source-manifest.json` before content references it
- [ ] No source with `packagable: false` referenced in production content bundles
- [ ] Cyrillic, transliteration, gloss, and English explanations are internally consistent
- [ ] Editorial checklist from `docs/content/kyrgyz-manual-ingestion-plan.md` completed
- [ ] Unit has one clear communication goal
- [ ] Task can be completed fully offline (no live lookup, no streaming media)
- [ ] Review items derived from lesson content (not independent trivia)
- [ ] Grammar notes cover only what is needed for current unit

---

## Architecture

- [ ] ADR written for any decision that affects: data model, offline strategy, auth approach, package boundaries, or third-party dependency
- [ ] ADR reviewed and acknowledged by Moritz before implementation merges
- [ ] New packages follow monorepo conventions (`packages/` with own `tsconfig.json` and `package.json`)
- [ ] No circular dependencies between packages
- [ ] Supabase calls isolated behind service layer (not scattered through components)
- [ ] SQLite schema changes accompanied by a migration

---

## Pull Request

- [ ] Feature developed on a named branch (e.g. `feat/us-007-dialogue-task`)
- [ ] Commits are descriptive and reference story ID (e.g. `feat(US-007): add dialogue completion validation`)
- [ ] PR description includes: what changed, why, how to test, and any known limitations
- [ ] PR links to the relevant user story in the backlog
- [ ] No unrelated changes bundled in the PR
- [ ] Reviewer requested where applicable
- [ ] CI is green before merge (tests, lint, typecheck, content validation)

---

## Sprint Hygiene

- [ ] Story status updated in `backlog.md` to `done`
- [ ] If story was split or descoped, new stories added to backlog with clear IDs
- [ ] Any carry-over to next sprint documented in sprint-plan.md

---

_When in doubt: if the feature can't be demoed offline with real content, it's not done._
