# LinguaNomad Architecture

## Overview

LinguaNomad should use a TypeScript monorepo with a mobile-first client and shared domain packages.
The architecture should bias toward local-first behavior, narrow backend responsibilities, and reusable content models.

## Proposed Repository Layout

```text
apps/
  mobile/
  content-admin/
packages/
  content-schema/
  srs/
  shared/
docs/
  product/
  architecture/
  content/
```

## Core Components

### Mobile App

The learner-facing application should be built with Expo, React Native, TypeScript, and Expo Router.
Its responsibilities are lesson delivery, review flow, task flow, offline storage, and sync orchestration.

### Content Admin

The content-admin surface should support editorial review, source auditing, and content QA.
It can begin as a lightweight internal tool or scripted workflow before it becomes a fuller application.

### Content Schema Package

`packages/content-schema` should define the canonical structures for units, lessons, lexemes, sentences, tasks, sources, and attribution metadata.
All content should validate against this schema before entering the app pipeline.

### SRS Package

`packages/srs` should contain scheduling and learner-memory logic.
This logic should run on-device so review remains functional offline.

### Shared Package

`packages/shared` should contain cross-cutting types, utility functions, and domain helpers that do not belong only to one app.

## Data Model Direction

The content model should support:
- Concepts
- Lexemes
- Sentences
- Transliteration
- Pronunciation notes
- Grammar notes
- Exercises
- Tasks
- Source and attribution metadata
- Review state

## Offline-First Strategy

The client should persist:
- Downloaded content packs
- Progress state
- Review history
- Pending sync operations

SQLite is the preferred local storage layer for structured offline persistence.

## Backend Strategy

The backend should be limited to:
- Authentication
- Cloud backup of learner progress
- Content-pack metadata and distribution
- Remote configuration

Postgres-backed infrastructure such as Supabase is the current preferred direction because it is sufficient without forcing early microservices.

## End-To-End Scenario

1. The learner downloads the starter Kyrgyz pack.
2. The app stores the content pack locally.
3. The learner studies a lesson offline.
4. The app schedules review items locally.
5. The learner completes a review session offline.
6. The app queues syncable progress changes.
7. When connectivity returns, the app syncs progress and resolves conflicts deterministically.

## Risks

- Offline-first sync is easy to oversimplify and hard to repair later.
- Content quality and licensing discipline are more likely bottlenecks than UI scaffolding.
- Kyrgyz-specific linguistic features will expose weaknesses in shallow content models quickly.

## Immediate Next Step

Create the monorepo scaffold and shared package boundaries to match this document before adding feature-specific code.