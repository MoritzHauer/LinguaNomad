# LinguaNomad Content Schema Specification

## Purpose

This document provides the canonical field-level specification for all LinguaNomad content schema objects.
Use it when authoring content, writing ingestion tooling, reviewing pull requests, or building editorial UI.

The TypeScript definitions live in `packages/content-schema/src/index.ts`.
This document explains *why* each field exists, not just its type.

---

## Object Reference

### SourceRecord

Tracks a content source's legal status and provenance before any content derived from it enters the repository.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Stable kebab-case identifier. Use format `<org>-<name>-<year>`. |
| `name` | `string` | ✅ | Human-readable bibliographic name. |
| `url` | `string` | ✅ | Canonical URL for the source. |
| `licenseSummary` | `string` | ✅ | Short description of license status. Mention if unverified. |
| `attributionRequired` | `boolean` | ✅ | Whether attribution must appear when referencing this source. |
| `committable` | `boolean` | ✅ | Safe to store in the public repo. Set `false` for restricted sources. |
| `packagable` | `boolean` | ✅ | Safe to bundle in an app release. Set `false` until rights are cleared. |
| `status` | `"candidate" \| "approved" \| "blocked"` | ✅ | Editorial workflow state. |
| `sourceLanguages` | `string[]` | optional | BCP 47 language codes present in the source. |
| `contentTypes` | `SourceSegmentKind[]` | optional | Kinds of content the source contains. |
| `notes` | `string` | optional | Editorial guidance for use of this source. |

**Example:**

```json
{
  "id": "peace-corps-kyrgyz-language-manual-1997",
  "name": "Peace Corps Kyrgyz Language Manual",
  "url": "https://files.eric.ed.gov/fulltext/ED461284.pdf",
  "licenseSummary": "Redistribution status not yet verified; use as restricted editorial reference only",
  "attributionRequired": true,
  "committable": false,
  "packagable": false,
  "status": "candidate",
  "sourceLanguages": ["ky", "en"],
  "contentTypes": ["dialogue", "vocabulary-box", "grammar-box", "phonetic-drill", "exercise"],
  "notes": "Use for coverage planning, pattern mining, and grammar cross-checking rather than shipping verbatim text."
}
```

---

### Lexeme

A single teachable word, expression, or short chunk. The atomic vocabulary unit.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Stable id. Pattern: `ky-lex-<slug>`. Slug should not change if the gloss changes. |
| `languageCode` | `string` | ✅ | BCP 47 code for the target language. Use `ky` for Kyrgyz. |
| `lemma` | `string` | ✅ | The word in Cyrillic script (primary form for Kyrgyz). |
| `transliteration` | `string` | optional | Latin transliteration alongside Cyrillic. Include for all Kyrgyz content. |
| `gloss` | `string` | ✅ | Short English translation or meaning label. Keep it under 5 words. |
| `sourceIds` | `string[]` | optional | Source records this item is associated with. |
| `notes` | `string` | optional | Pronunciation, usage, or pedagogical hint for the learner. |

**Constraints:**
- `lemma` must use Cyrillic as the primary script for Kyrgyz.
- `transliteration` should be included for every Kyrgyz lexeme.
- `gloss` is a meaning label, not a translation; keep it brief.
- `id` slugs must be stable even if the English gloss is edited.

**Example:**

```json
{
  "id": "ky-lex-kechiresiz",
  "languageCode": "ky",
  "lemma": "Кечиресиз",
  "transliteration": "Kechiresiz",
  "gloss": "excuse me / sorry",
  "sourceIds": ["linguanomad-original-kyrgyz-starter-2026"],
  "notes": "Polite form. Use `Кечир` in casual speech with peers. The ending `-сиз` is the polite second-person marker."
}
```

---

### SentenceCard

A short, complete, reusable target-language sentence for reading, listening, and pattern practice.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Stable id. Pattern: `ky-sent-<scope>-<seq>`. |
| `languageCode` | `string` | ✅ | BCP 47 code. |
| `text` | `string` | ✅ | The full sentence in Cyrillic. |
| `transliteration` | `string` | optional | Latin transliteration. Include for all Kyrgyz sentences. |
| `translation` | `string` | ✅ | English translation of the sentence. |
| `sourceIds` | `string[]` | ✅ | Source records this sentence is associated with. |

**Constraints:**
- Keep sentences short. Two to eight words is the beginner target.
- Prefer one new grammar burden per sentence.
- Transliteration must be included for Kyrgyz content.
- Do not copy verbatim from restricted sources; write original sentences.

**Example:**

```json
{
  "id": "ky-sent-greeting-03",
  "languageCode": "ky",
  "text": "Менин атым Алия.",
  "transliteration": "Menin atym Aliya.",
  "translation": "My name is Aliya.",
  "sourceIds": ["linguanomad-original-kyrgyz-starter-2026"]
}
```

---

### GrammarNote

A short learner-facing explanation of one grammar concept tied to current unit material.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Stable id. Pattern: `ky-grammar-<scope>-<seq>`. |
| `title` | `string` | ✅ | One concise heading naming the concept. |
| `summary` | `string` | ✅ | Two to five sentence plain-language explanation. Avoid jargon where possible. |
| `sourceIds` | `string[]` | optional | Source records consulted when drafting this note. |

**Constraints:**
- One concept per note. Do not bundle two grammar points into one entry.
- Write for learners, not linguists.
- Anchor the explanation to a sentence or word already visible in the unit.
- Grammar notes should not exceed one short paragraph.

**Example:**

```json
{
  "id": "ky-grammar-greeting-03",
  "title": "`-мин` builds simple identity statements",
  "summary": "In sentences like `Мен студентмин`, the ending `-мин` expresses `I am` with a noun. It is one of the simplest copula forms in Kyrgyz and safe to use from the first day.",
  "sourceIds": ["linguanomad-original-kyrgyz-starter-2026"]
}
```

---

### TaskDefinition

A typed union representing one interactive learning activity. Each task kind has different mechanics.

All task definitions share these base fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Stable id. Pattern: `ky-task-<scope>-<seq>`. |
| `kind` | `TaskKind` | ✅ | Discriminant field that determines the task structure. |
| `objective` | `string` | ✅ | One sentence describing what the learner will do. |
| `instructions` | `string` | ✅ | Learner-facing task instructions. |
| `successCriteria` | `string[]` | ✅ | Checklist of observable completion signals (2–4 items). |
| `sourceIds` | `string[]` | optional | Sources referenced. |
| `lexemeIds` | `string[]` | optional | Lexemes featured in this task. |
| `sentenceIds` | `string[]` | optional | Sentences featured in this task. |
| `grammarNoteIds` | `string[]` | optional | Grammar notes linked to this task. |
| `completionHint` | `string` | optional | One-line hint surfaced when learner is stuck. |
| `supportCards` | `TaskSupportCard[]` | optional | Grammar, pronunciation, or fun-fact cards that support the task. |

**Task kinds and their additional fields:**

#### `script-to-meaning`

Learner maps Cyrillic text directly to sound and meaning.

| Field | Type | Description |
|---|---|---|
| `transliterationVisible` | `boolean` | Whether Latin transliteration is visible by default. |
| `items` | `ScriptPromptItem[]` | Array of `{ text, transliteration?, meaning }` objects. |

#### `guided-dialogue-completion`

Learner fills missing turns in a short exchange.

| Field | Type | Description |
|---|---|---|
| `turns` | `DialogueTurn[]` | Ordered dialogue lines. Lines with `responseSlotId` are blanked out for the learner. |
| `responseChoices` | `string[]` | Optional multiple-choice pool. |
| `responseMode` | `"ordered-choice" \| "free-text"` | How the learner submits answers. |

#### `register-choice`

Learner picks the wording appropriate for the given social context.

| Field | Type | Description |
|---|---|---|
| `scenario` | `string` | Description of the social situation. |
| `options` | `RegisterChoiceOption[]` | Options with register labels. |
| `correctOptionIds` | `string[]` | Ids of acceptable answers. |

#### `pattern-swap`

Learner substitutes one slot in a sentence frame.

| Field | Type | Description |
|---|---|---|
| `pattern` | `string` | The Kyrgyz sentence pattern with slot markers. |
| `slots` | `PatternSlot[]` | Slot definitions with optional allowed lexeme ids. |
| `promptSentenceId` | `string` | Optional seed sentence shown as the starting example. |

#### `information-gap`

Learner holds partial information and must ask or answer to complete the missing detail.

| Field | Type | Description |
|---|---|---|
| `scenario` | `string` | Description of the situation. |
| `learnerRole` | `string` | The learner's part in the exchange. |
| `partnerRole` | `string` | The partner's part. |
| `facts` | `InformationGapFact[]` | Items revealed to learner, partner, or both. |

#### `noticing`

Learner identifies a form change or grammatical signal in context.

| Field | Type | Description |
|---|---|---|
| `prompt` | `string` | The noticing question posed to the learner. |
| `targets` | `NoticingTarget[]` | Items with `text`, `transliteration`, `translation`, `focus`. |

#### `mini-role`

Learner completes a bounded communicative outcome (best capstone format).

| Field | Type | Description |
|---|---|---|
| `scenario` | `string` | The real-world scene. |
| `learnerRole` | `string` | The role the learner plays. |
| `phraseBankLexemeIds` | `string[]` | Lexemes available in the phrase bank. |
| `phraseBankSentenceIds` | `string[]` | Sentences available in the phrase bank. |

---

### UnitDefinition

The binding object that assembles all content items into a learnable unit.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Stable id. Pattern: `ky-unit-<slug>`. |
| `slug` | `string` | ✅ | URL-safe kebab-case unit identifier. |
| `title` | `string` | ✅ | Human-readable unit title. |
| `communicationGoal` | `string` | ✅ | One sentence describing what the learner can do after completing this unit. |
| `sequenceNumber` | `number` | optional | Position in the course sequence. |
| `unlocksAfterUnitId` | `string` | optional | Id of the prerequisite unit. |
| `supportedScripts` | `ScriptCode[]` | ✅ | Scripts the unit supports. Use `["cyrl", "latn"]` for Kyrgyz. |
| `pronunciationFocus` | `string[]` | optional | Short descriptions of the key sounds introduced or practiced. |
| `lexemeIds` | `string[]` | ✅ | Ids of all lexemes in the unit. |
| `sentenceIds` | `string[]` | ✅ | Ids of all sentence cards in the unit. |
| `grammarNoteIds` | `string[]` | ✅ | Ids of grammar notes in the unit. |
| `taskIds` | `string[]` | ✅ | Ids of tasks in the unit. |
| `reviewSeedIds` | `string[]` | optional | Ids of review seeds derived from this unit. |
| `sourceIds` | `string[]` | ✅ | Sources referenced at the unit level. |

---

### ReviewItem

A single item that enters spaced retrieval practice. Derived from lesson content already in the unit.

> In code this type is called `ReviewSeed`.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Stable id. Pattern: `ky-review-<scope>-<seq>`. |
| `kind` | `ReviewSeedKind` | ✅ | One of: `lexeme-recall`, `sentence-comprehension`, `pattern-recall`, `form-noticing`. |
| `prompt` | `string` | ✅ | The question or cue shown to the learner. |
| `acceptableAnswers` | `string[]` | ✅ | One or more correct answers. |
| `lexemeIds` | `string[]` | optional | Lexemes this review tests. |
| `sentenceIds` | `string[]` | optional | Sentences this review tests. |
| `grammarNoteIds` | `string[]` | optional | Grammar concepts this review tests. |
| `informationIds` | `string[]` | optional | Extracted information ids linked to this review item. |

**Review kind guide:**

| Kind | Use when |
|---|---|
| `lexeme-recall` | Testing word recognition or production from gloss or context. |
| `sentence-comprehension` | Testing understanding of a full sentence from earlier in the unit. |
| `pattern-recall` | Testing production of a sentence frame with a slot filled in. |
| `form-noticing` | Testing whether the learner can identify a specific form change (e.g. vowel harmony). |

---

## Collection File Shapes

### Flat collection (lexemes, sentences, grammar notes, review seeds)

```json
{
  "version": 1,
  "languageCode": "ky",
  "items": []
}
```

### Task collection

```json
{
  "version": 1,
  "languageCode": "ky",
  "items": []
}
```

### Unit wrapper

```json
{
  "version": 1,
  "languageCode": "ky",
  "unit": {}
}
```

### Unit bundle (combined single-file format)

When shipping a complete unit as one portable JSON, use:

```json
{
  "version": 1,
  "languageCode": "ky",
  "unit": {},
  "lexemes": [],
  "sentences": [],
  "grammarNotes": [],
  "tasks": [],
  "reviewSeeds": []
}
```

---

## ID Conventions Summary

| Object | Pattern | Example |
|---|---|---|
| SourceRecord | `<org>-<name>-<year>` | `peace-corps-kyrgyz-language-manual-1997` |
| Lexeme | `ky-lex-<slug>` | `ky-lex-kechiresiz` |
| SentenceCard | `ky-sent-<scope>-<seq>` | `ky-sent-greeting-03` |
| GrammarNote | `ky-grammar-<scope>-<seq>` | `ky-grammar-greeting-01` |
| TaskDefinition | `ky-task-<scope>-<seq>` | `ky-task-greetings-dialogue-01` |
| ReviewItem | `ky-review-<scope>-<seq>` | `ky-review-greeting-01` |
| UnitDefinition | `ky-unit-<slug>` | `ky-unit-greetings-and-introductions` |

---

## Related Files

- `docs/content/content-ingestion-schema.md` — ingestion pipeline and intermediate schema layers
- `docs/content/storage-conventions.md` — where files live and how they are named
- `docs/content/kyrgyz-manual-ingestion-plan.md` — editorial plan for Kyrgyz starter sequence
- `packages/content-schema/src/index.ts` — TypeScript definitions for all objects above
