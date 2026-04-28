# Content Ingestion Schema

## Purpose

LinguaNomad needs more than a final lesson schema.
To convert a source such as the Kyrgyz manual into usable input, the pipeline needs four layers:

1. source registry
2. source extraction
3. editorial blueprinting
4. learner-facing content

The TypeScript definitions for these layers live in `packages/content-schema`.

## Schema Layers

### 1. Source Registry

Use `SourceRecord` to describe whether a source is safe to commit or package.
This is the legal and provenance layer.

Important fields:
- `id`, `name`, `url`
- `licenseSummary`
- `attributionRequired`
- `committable`, `packagable`, `status`
- `sourceLanguages`, `contentTypes`

Example:

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

### 2. Source Extraction

Use `SourceSegment` to represent a bounded chunk from the source, such as a dialogue, vocabulary box, or grammar note.
This is the layer where editorial teams can keep page references and identify reusable signals.

Important fields:
- `kind`
- `topic`, `title`
- `text`, `translation`, `transliteration`
- `communicativeFunctions`
- `references`
- `informationIds`

Example:

```json
{
  "id": "topic-01-dialogue-01",
  "sourceId": "peace-corps-kyrgyz-language-manual-1997",
  "kind": "dialogue",
  "title": "Greeting exchange",
  "topic": "Greetings",
  "languageCode": "ky",
  "communicativeFunctions": ["greet", "ask-name", "self-introduce"],
  "references": [
    {
      "sourceId": "peace-corps-kyrgyz-language-manual-1997",
      "sectionTitle": "Topic 1. Greetings",
      "pageStart": 25,
      "pageEnd": 26
    }
  ],
  "informationIds": [
    "info-salamat-syzby",
    "info-menin-atym",
    "info-formal-greeting"
  ]
}
```

### 3. Extracted Information

Use `ExtractedInformation` to store the reusable things found in a source segment.
This is the most important intermediate layer because it separates editorial insight from verbatim source text.

Supported information types:
- `lexeme-candidate`: a word or short expression worth teaching
- `sentence-pattern`: a reusable sentence frame
- `grammar-concept`: a learner-facing grammar point to explain
- `pronunciation-cue`: sound distinction or reading issue
- `script-mapping`: script-to-sound or script-to-meaning association
- `register-note`: formal, informal, or honorific usage
- `cultural-context`: brief usage context, only when instructionally necessary
- `task-cue`: a real-world communicative action worth turning into a task
- `review-cue`: a signal that an item should recur in spaced review

Example:

```json
{
  "id": "info-menin-atym",
  "type": "sentence-pattern",
  "label": "My name is ...",
  "value": "Менин атым ...",
  "languageCode": "ky",
  "transliteration": "Menin atym ...",
  "translation": "My name is ...",
  "proficiency": "beginner",
  "tags": ["introduction", "identity"],
  "references": [
    {
      "sourceId": "peace-corps-kyrgyz-language-manual-1997",
      "sectionTitle": "Topic 1. Greetings",
      "pageStart": 25,
      "pageEnd": 26
    }
  ]
}
```

### 4. Editorial Blueprinting

Use `UnitBlueprint` to turn extracted source material into a planned LinguaNomad unit before authoring final lesson content.
This is the scope-control layer.

Important fields:
- `communicationGoal`
- `sourceSegmentIds`
- `informationIds`
- `grammarFocus`
- `recommendedTaskKinds`
- `targetLexemeCount`, `targetSentenceCount`

Example:

```json
{
  "id": "unit-blueprint-greetings-01",
  "slug": "greetings-and-introductions",
  "title": "Greetings And Introductions",
  "communicationGoal": "Greet someone, ask and give a name, and say who you are.",
  "sourceSegmentIds": ["topic-01-dialogue-01"],
  "informationIds": ["info-salamat-syzby", "info-menin-atym", "info-formal-greeting"],
  "grammarFocus": ["personal pronouns", "basic identity statements"],
  "recommendedTaskKinds": ["guided-dialogue-completion", "mini-role"],
  "targetLexemeCount": 10,
  "targetSentenceCount": 8
}
```

### 5. Learner-Facing Content

Use `Lexeme`, `SentenceCard`, `GrammarNote`, `TaskDefinition`, `ReviewSeed`, and `UnitDefinition` for the actual app content.
This layer should contain only original LinguaNomad wording unless the source is explicitly cleared for redistribution.

## Task Types

`TaskDefinition` is a typed union.
Each task kind is distinct because the app and editorial tooling need different fields for different task mechanics.

### `guided-dialogue-completion`

Use when the learner must complete missing turns in a short exchange.
Best for greetings, shopping, and transportation.

Key fields:
- `turns`
- `responseChoices`
- `responseMode`

### `register-choice`

Use when the learner must pick wording appropriate for peer, elder, stranger, or service contexts.
Best for politeness and address forms.

Key fields:
- `scenario`
- `options`
- `correctOptionIds`

### `pattern-swap`

Use when the learner must keep a Kyrgyz sentence frame and swap a slot such as a name, place, or item.
Best for identity, family, food, and daily routine.

Key fields:
- `pattern`
- `slots`
- `promptSentenceId`

### `information-gap`

Use when one side knows something the other side does not, and the learner has to ask or answer to complete the missing information.
Best for family, bazaar, apartment, and transport topics.

Key fields:
- `scenario`
- `learnerRole`
- `partnerRole`
- `facts`

### `script-to-meaning`

Use when the learner should connect Kyrgyz Cyrillic directly to sound and meaning.
Best for onboarding and early lessons.

Key fields:
- `transliterationVisible`
- `items`

### `noticing`

Use when the learner must spot a form change or grammatical signal in context.
Best for vowel harmony, case endings, and register markers.

Key fields:
- `prompt`
- `targets`

### `mini-role`

Use when the learner completes a bounded communicative outcome such as greeting a host or introducing themselves.
This is the best default capstone format for a unit.

Key fields:
- `scenario`
- `learnerRole`
- `phraseBankLexemeIds`
- `phraseBankSentenceIds`

## Review Input Schema

Use `ReviewSeed` to define what should enter spaced retrieval.
This layer is simpler than lesson content because it only needs a prompt, acceptable answers, and links back to the relevant content.

Recommended review seed kinds:
- `lexeme-recall`
- `sentence-comprehension`
- `pattern-recall`
- `form-noticing`

## Recommended Conversion Flow

For a source like the Kyrgyz manual, the operational flow should be:

1. register the manual as a `SourceRecord`
2. break each lesson into `SourceSegment`s
3. store reusable findings as `ExtractedInformation`
4. bundle promising lesson scope into a `UnitBlueprint`
5. author original `Lexeme`, `SentenceCard`, `GrammarNote`, `TaskDefinition`, and `ReviewSeed` objects
6. bind them with a `UnitDefinition`

This gives LinguaNomad a usable input schema without forcing raw source material directly into the shipping app.

## Related Files

Use these files alongside this schema guide:
- `docs/content/storage-conventions.md` for where each JSON artifact should live
- `docs/content/examples/kyrgyz-topic-01-source-ingestion-pack.example.json` for an end-to-end sample ingestion pack