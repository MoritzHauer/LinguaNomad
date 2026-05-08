# LinguaNomad
LinguaNomad is an open-source app for adventurous language learners. Start your journey with Kyrgyz, and soon explore other underrepresented languages — wherever your curiosity takes you.

## What it is

A mobile-first, offline-first language learning app for serious learners of underrepresented languages, starting with Kyrgyz.
It combines structured lessons, spaced retrieval, task-based practice, and explicit support for script, pronunciation, and grammar.

## Getting started

```bash
# Install dependencies (requires pnpm)
pnpm install

# Run all tests
pnpm test

# Start the mobile app (requires Expo Go or a simulator)
cd apps/mobile && npx expo start
```

## Repository layout

```
LinguaNomad/
├── apps/mobile/          # Expo React Native app
├── apps/content-admin/   # Content management CLI
├── packages/
│   ├── content-schema/   # TypeScript types for all content JSON
│   ├── db/               # SQLite schema + repositories
│   ├── learner-state/    # Scoring and learner profile logic
│   ├── shared/           # Shared primitives
│   └── srs/              # Spaced-repetition scheduler
├── content/languages/ky/ # Kyrgyz content (units, exercises, vocab …)
├── supabase/             # Cloud backend (migrations, Edge Functions)
└── docs/                 # All project documentation
```

## Documentation

| Topic | Link |
|---|---|
| **Developer Guide** (adding content, exercises, screens) | [`docs/developer-guide/`](docs/developer-guide/README.md) |
| Architecture & decisions | [`docs/architecture/`](docs/architecture/architecture.md) |
| Content schema spec | [`docs/content/schema-spec.md`](docs/content/schema-spec.md) |
| Product vision & requirements | [`docs/product/vision.md`](docs/product/vision.md) |
| Supabase backend setup | [`supabase/README.md`](supabase/README.md) |
