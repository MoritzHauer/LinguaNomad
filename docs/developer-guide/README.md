# Developer Guide

This guide is for contributors who want to extend LinguaNomad — adding new chapters, exercises, exercise types, app screens, or supporting a new language.

## Contents

| Guide | What it covers |
|---|---|
| [Project Structure](./project-structure.md) | Every folder, package, and file explained |
| [Adding Content](./adding-content.md) | How to add a new unit/chapter, lexemes, sentences, grammar notes, review seeds |
| [Adding Exercise Types](./adding-exercise-types.md) | End-to-end walkthrough for adding a brand new exercise type |
| [Adding App Screens](./adding-screens.md) | How Expo Router file routing works and how to add new pages |

## Quick Concepts

Before diving into a guide, it helps to understand three core concepts:

### 1. Content = JSON, Schema = TypeScript

All learning content (vocabulary, sentences, exercises) lives in `content/languages/<lang>/` as plain JSON files. The TypeScript types that describe that JSON are in `packages/content-schema/src/index.ts`. The content files must always match those types.

### 2. Units are the atomic teaching unit

A **unit** (sometimes called a chapter) is the main teaching block. Each unit has:
- A `unit.json` — metadata and IDs list
- `lexemes.json` — vocabulary
- `sentences.json` — example sentences
- `grammar-notes.json` — grammar explanations
- `tasks.json` — interactive exercises
- `review-seeds.json` — spaced-repetition prompts

### 3. The mobile app wires content to screens

`apps/mobile/lib/course-data.ts` imports all content JSON and exposes `getCourseBundles()`. When you add a new unit, you add its imports here. Exercise components live in `apps/mobile/src/components/`. The task screen in `apps/mobile/app/task/[unitId].tsx` dispatches to the right component based on `task.kind`.

## Getting Started

```bash
# Install deps
pnpm install

# Run tests
pnpm test

# Start the mobile app (requires Expo Go or simulator)
cd apps/mobile && npx expo start
```
