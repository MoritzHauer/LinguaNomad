# Adding Content

This guide walks you through adding a new unit (chapter) with all its content files, or extending an existing unit.

---

## Overview: what a unit looks like

A unit is a self-contained teaching block. Physically it is six JSON files in `content/languages/<lang>/`:

```
content/languages/ky/
├── units/           greetings-and-introductions.unit.json
├── lexemes/         greetings-and-introductions.lexemes.json
├── sentences/       greetings-and-introductions.sentences.json
├── grammar-notes/   greetings-and-introductions.grammar-notes.json
├── tasks/           greetings-and-introductions.tasks.json
└── review-seeds/    greetings-and-introductions.review-seeds.json
```

Each file's root JSON object has the same envelope:

```jsonc
{
  "version": 1,
  "languageCode": "ky",
  "items": [ /* ... */ ]        // all files except unit.json
  // unit.json uses "unit": { ... } instead of "items"
}
```

---

## Step 1 — Pick a slug and IDs

Choose a slug for your unit, e.g. `numbers-and-counting`.

By convention, all content IDs are prefixed with `<lang>-<content-type>-<topic>`, e.g.:
- Unit ID: `ky-unit-numbers-and-counting`
- Lexeme IDs: `ky-lex-bir`, `ky-lex-eki`, …
- Sentence IDs: `ky-sent-numbers-01`, `ky-sent-numbers-02`, …
- Grammar note IDs: `ky-grammar-numbers-01`, …
- Task IDs: `ky-task-numbers-dialogue-01`, …
- Review seed IDs: `ky-review-numbers-01`, …

---

## Step 2 — Create the unit file

Create `content/languages/ky/units/numbers-and-counting.unit.json`:

```jsonc
{
  "version": 1,
  "languageCode": "ky",
  "unit": {
    "id": "ky-unit-numbers-and-counting",
    "slug": "numbers-and-counting",
    "title": "Numbers and Counting",
    "communicationGoal": "Count to ten, ask how many, and talk about quantities in everyday contexts.",
    "sequenceNumber": 7,                           // controls order in the course
    "unlocksAfterUnitId": "ky-unit-location-and-movement",  // omit to unlock immediately
    "supportedScripts": ["cyrl", "latn"],
    "pronunciationFocus": [
      "Stress the first syllable in most Kyrgyz numbers",
      "Notice that 'жети' (seven) has a soft ж"
    ],
    "lexemeIds": [
      "ky-lex-bir",
      "ky-lex-eki"
      // ... add IDs matching what you put in lexemes.json
    ],
    "sentenceIds": [
      "ky-sent-numbers-01"
      // ... add IDs matching what you put in sentences.json
    ],
    "grammarNoteIds": [
      "ky-grammar-numbers-01"
    ],
    "taskIds": [
      "ky-task-numbers-dialogue-01"
    ],
    "reviewSeedIds": [
      "ky-review-numbers-01"
    ],
    "sourceIds": [
      "linguanomad-original-kyrgyz-starter-2026"
    ]
  }
}
```

The TypeScript type for the unit metadata is `UnitDefinition` in `packages/content-schema/src/index.ts`.

---

## Step 3 — Create lexemes

Create `content/languages/ky/lexemes/numbers-and-counting.lexemes.json`:

```jsonc
{
  "version": 1,
  "languageCode": "ky",
  "items": [
    {
      "id": "ky-lex-bir",
      "languageCode": "ky",
      "lemma": "бир",
      "transliteration": "bir",
      "gloss": "one",
      "sourceIds": ["linguanomad-original-kyrgyz-starter-2026"]
    },
    {
      "id": "ky-lex-eki",
      "languageCode": "ky",
      "lemma": "эки",
      "transliteration": "eki",
      "gloss": "two",
      "sourceIds": ["linguanomad-original-kyrgyz-starter-2026"]
    }
    // ...
  ]
}
```

TypeScript type: `Lexeme` in `packages/content-schema/src/index.ts`.

---

## Step 4 — Create sentences

Create `content/languages/ky/sentences/numbers-and-counting.sentences.json`:

```jsonc
{
  "version": 1,
  "languageCode": "ky",
  "items": [
    {
      "id": "ky-sent-numbers-01",
      "languageCode": "ky",
      "text": "Бул канча?",
      "transliteration": "Bul kancha?",
      "translation": "How many is this? / How much is this?",
      "sourceIds": ["linguanomad-original-kyrgyz-starter-2026"]
    }
    // ...
  ]
}
```

TypeScript type: `SentenceCard`.

---

## Step 5 — Create grammar notes

Create `content/languages/ky/grammar-notes/numbers-and-counting.grammar-notes.json`:

```jsonc
{
  "version": 1,
  "languageCode": "ky",
  "items": [
    {
      "id": "ky-grammar-numbers-01",
      "title": "Cardinal numbers don't change for case",
      "summary": "Kyrgyz cardinal numbers (1–10) are invariable when used as adjectives before a noun. The noun still takes the appropriate case suffix, but the number itself stays the same.",
      "sourceIds": ["linguanomad-original-kyrgyz-starter-2026"]
    }
  ]
}
```

TypeScript type: `GrammarNote`.

---

## Step 6 — Create tasks

Tasks are the interactive exercises. Each task has a `kind` field that determines its structure. See [Adding Exercise Types](./adding-exercise-types.md) for the full list of kinds and their fields.

Create `content/languages/ky/tasks/numbers-and-counting.tasks.json`:

```jsonc
{
  "version": 1,
  "languageCode": "ky",
  "items": [
    {
      "id": "ky-task-numbers-script-01",
      "kind": "script-to-meaning",
      "objective": "Match Kyrgyz numbers to their meanings",
      "instructions": "You will see Kyrgyz numbers in Cyrillic script. Choose the correct English meaning.",
      "successCriteria": ["Correctly identify all 5 numbers"],
      "transliterationVisible": true,
      "items": [
        { "text": "бир",  "transliteration": "bir",  "meaning": "one"   },
        { "text": "эки",  "transliteration": "eki",  "meaning": "two"   },
        { "text": "үч",   "transliteration": "üch",  "meaning": "three" },
        { "text": "төрт", "transliteration": "tört", "meaning": "four"  },
        { "text": "беш",  "transliteration": "besh", "meaning": "five"  }
      ]
    }
  ]
}
```

TypeScript type: `TaskDefinition` (discriminated union — pick the interface matching your `kind`).

---

## Step 7 — Create review seeds

Create `content/languages/ky/review-seeds/numbers-and-counting.review-seeds.json`:

```jsonc
{
  "version": 1,
  "languageCode": "ky",
  "items": [
    {
      "id": "ky-review-numbers-01",
      "kind": "lexeme-recall",
      "prompt": "Kyrgyz: one",
      "acceptableAnswers": ["бир", "bir"],
      "lexemeIds": ["ky-lex-bir"]
    },
    {
      "id": "ky-review-numbers-02",
      "kind": "lexeme-recall",
      "prompt": "Kyrgyz: two",
      "acceptableAnswers": ["эки", "eki"],
      "lexemeIds": ["ky-lex-eki"]
    }
  ]
}
```

TypeScript type: `ReviewSeed`. Valid `kind` values: `"lexeme-recall" | "sentence-comprehension" | "pattern-recall" | "form-noticing"`.

---

## Step 8 — Register the unit in the mobile app

Open `apps/mobile/lib/course-data.ts` and add six import lines (one per file) and one `createBundle(...)` call.

### Add imports (near the top of the file, with the other imports)

```ts
// --- Numbers and Counting ---
import numbersGrammarNotesData from "../../../content/languages/ky/grammar-notes/numbers-and-counting.grammar-notes.json";
import numbersLexemesData      from "../../../content/languages/ky/lexemes/numbers-and-counting.lexemes.json";
import numbersReviewSeedsData  from "../../../content/languages/ky/review-seeds/numbers-and-counting.review-seeds.json";
import numbersSentencesData    from "../../../content/languages/ky/sentences/numbers-and-counting.sentences.json";
import numbersTasksData        from "../../../content/languages/ky/tasks/numbers-and-counting.tasks.json";
import numbersUnitData         from "../../../content/languages/ky/units/numbers-and-counting.unit.json";
```

### Add a `createBundle` call to the `courseBundles` array

```ts
const courseBundles: CourseBundle[] = [
  // ... existing entries ...
  createBundle(
    numbersUnitData,
    numbersLexemesData,
    numbersSentencesData,
    numbersGrammarNotesData,
    numbersTasksData as unknown as Collection<TaskDefinition>,
    numbersReviewSeedsData as Collection<ReviewSeed>
  ),
].sort(/* ... existing sort ... */);
```

The array is sorted by `unit.sequenceNumber` automatically, so the new unit will appear in the right position in the course list.

---

## Step 9 — Run tests

```bash
pnpm test
```

The tests in `packages/content-schema/src/__tests__/` validate content fixture shapes. If you added new content, make sure the types are correct.

---

## Extending an existing unit

To add more vocabulary, sentences, tasks, or review seeds to an *existing* unit:

1. Add items to the relevant JSON file(s) in `content/languages/ky/`.
2. Add the new IDs to the `lexemeIds` / `sentenceIds` / `taskIds` / `reviewSeedIds` arrays in the unit's `.unit.json`.
3. Run `pnpm test` to confirm nothing broke.

No changes to `course-data.ts` are needed for existing units.
