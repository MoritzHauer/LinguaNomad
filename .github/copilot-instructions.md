# LinguaNomad Project Guidelines

## Product Focus

LinguaNomad is a mobile-first, offline-first language-learning app that starts with Kyrgyz and is designed for serious long-term learners.
Prioritize depth, pedagogical coherence, and content quality over streaks, leagues, or shallow gamification.

## Workflow

Use this file as the single workspace-wide instruction file.
Do not add AGENTS.md unless the project explicitly replaces this file.
When a task spans planning, content research, and implementation, prefer the focused agents in `.github/agents/` over one general-purpose workflow.

## Architecture

Target a TypeScript monorepo managed with `pnpm`.
Use Expo and React Native for the learner app.
Keep the client local-first: lesson content, learner progress, and review state must continue to work offline.
Keep backend responsibilities narrow: auth, sync, storage metadata, and remote configuration.

## Learning Model

Design features around four pillars:
- Comprehensible input
- Spaced retrieval
- Task-based practice
- Explicit grammar support where Kyrgyz structure is difficult for learners

Treat script support, transliteration, pronunciation notes, vowel harmony, case endings, and sentence-level morphology as first-class product concerns.

## Content And Licensing

Separate redistributable content from prototype-only material.
Do not commit source material with unclear redistribution rights.
Every source used in the public repository must have recorded license status, attribution requirements, and commitability.

## Engineering Standards

Prefer minimal, testable changes.
Keep domain logic reusable across mobile client, content tooling, and sync layers.
Document architectural decisions before building irreversible infrastructure.
When adding code, validate the smallest affected slice first.

## Documentation

Keep the public overview in `README.md` short.
Put product details under `docs/product/`, architecture details under `docs/architecture/`, and content policy under `docs/content/`.