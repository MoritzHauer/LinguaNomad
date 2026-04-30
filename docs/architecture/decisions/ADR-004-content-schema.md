# ADR-004: Content Schema Design

**Status:** Accepted  
**Date:** 2026-04-30  
**Author:** LinguaNomad core team

---

## Context

Language-learning apps most commonly model content as word pairs: `{ L2: "кошка", L1: "cat" }`. This is sufficient for flashcard apps but breaks down quickly when:

- The language has morphological complexity (Kyrgyz: agglutinative, vowel harmony, case system, postpositions).
- Pronunciation and script require explicit guidance (Cyrillic for learners unfamiliar with the script).
- Tasks require sentence-level and discourse-level understanding, not just lexical recall.
- Content must be attributed to sources with different license status.
- The SRS system needs to schedule items at different granularities (lexeme recall vs. sentence comprehension vs. form noticing).

LinguaNomad explicitly targets serious learners of Kyrgyz. A shallow word-pair schema would make the product brittle and editorially dishonest within the first content unit.

Key forces:

- **Kyrgyz requires rich annotations.** Transliteration, pronunciation cues, vowel harmony notes, and case notes must be first-class fields, not afterthoughts.
- **Sentences and lexemes are separate objects.** A sentence card is not merely a concatenation of lexemes; it has its own discourse function, translation, and review behaviour.
- **Grammar notes are their own entity.** Kyrgyz grammar points (e.g. genitive case, verb negation, vowel harmony) need a standalone type so they can be linked to multiple sentence cards and reviewed independently of lexemes.
- **Tasks are typed and varied.** A dialogue-completion task has a different structure than a pattern-swap task. A union type with a `kind` discriminant is the correct model.
- **Source attribution must be tracked.** Every content object must be traceable back to a `SourceRecord` with a license status. This is a content governance requirement, not a nice-to-have.
- **Schema must be reusable for future languages.** The `languageCode` field and the separation of script-specific fields (transliteration) from universal fields (gloss, proficiency) must be explicit from the start.

Alternatives considered:

| Option | Problem |
|--------|---------|
| Flat word-pair model | Cannot represent sentences, grammar notes, or task structure; collapses at the first Kyrgyz vowel harmony note. |
| Single `ContentItem` union | Too wide; an SRS scheduling system cannot determine what fields to display for a review without inspecting a type tag buried inside a generic object. |
| External CMS (Contentful, Sanity) | Schema is opaque to TypeScript; content governance (license tracking) becomes implicit; introduces a paid external dependency for a core open-source data model. |
| JSON Schema only (no TypeScript) | Validation works but contributors lose autocomplete, type inference, and compile-time checks across packages. |
| The current multi-layer schema | Each layer has a single responsibility; TypeScript types enforce shape at compile time; the pipeline is auditable. Chosen. |

---

## Decision

Content is modelled in **`packages/content-schema`** as a layered TypeScript type system covering five distinct pipeline stages:

### Layer overview

| Layer | Primary type | Responsibility |
|-------|-------------|----------------|
| 1. Source registry | `SourceRecord` | Legal and provenance tracking per source |
| 2. Source extraction | `SourceSegment` | Bounded chunks from a source with page refs |
| 3. Extracted information | `ExtractedInformation` | Reusable editorial signals (lexeme candidates, sentence patterns, grammar concepts, task cues) |
| 4. Editorial blueprinting | `UnitBlueprint` | Scope plan binding source material to a planned unit before authoring |
| 5. Learner-facing content | `Lexeme`, `SentenceCard`, `GrammarNote`, `TaskDefinition`, `ReviewSeed`, `UnitDefinition` | App-consumable, original LinguaNomad content |

### Key type decisions

**`Lexeme`** carries `form`, `transliteration`, `gloss`, `partOfSpeech`, `proficiency`, and optional `grammarTags`. It does not embed sentences; cross-references use IDs.

**`SentenceCard`** carries the Kyrgyz text, transliteration, translation, and optional audio metadata. It references `Lexeme` IDs for phrase-bank and SRS linking.

**`GrammarNote`** is a standalone entity with a title, learner-facing explanation, and example sentence IDs. It is not embedded in `SentenceCard` because a grammar note may apply to many sentences.

**`TaskDefinition`** is a discriminated union on `kind`:  
`guided-dialogue-completion | register-choice | pattern-swap | information-gap | script-to-meaning | noticing | mini-role`  
Each variant carries only the fields relevant to its mechanic.

**`ReviewSeed`** is the entry point for the SRS pipeline. It records what prompt/answer pair to test, what kind of review it represents (`lexeme-recall | sentence-comprehension | pattern-recall | form-noticing`), and links back to the originating content ID.

**`UnitDefinition`** is the runtime container. It binds lexeme IDs, sentence card IDs, grammar note IDs, task IDs, and review seed IDs into a single unit object that the app can load and play.

**`SourceRecord`** is the provenance anchor. Every shipped content object must be traceable to a source record with an explicit `committable` and `packagable` flag. Non-redistributable sources are excluded from the public repo and content packs.

### Schema versioning

All JSON files produced from this schema carry a top-level `"version": 1` field. The app and content-admin tooling check this field before processing. Schema changes that are not backward-compatible require a version bump and a documented migration path.

---

## Consequences

**Positive:**

- The schema supports Kyrgyz's full linguistic complexity without retrofitting.
- TypeScript types provide compile-time safety across `apps/mobile`, `apps/content-admin`, and `packages/srs`.
- Attribution tracking is structural, not procedural; it cannot be forgotten without a type error.
- The SRS layer (`packages/srs`) receives typed `ReviewSeed` and `ReviewItem` objects; it never parses raw lesson content.
- The schema is explicitly language-agnostic via `languageCode`; adding a second language requires no structural change.

**Negative / Trade-offs:**

- Five-layer pipeline has more concepts than a flat schema. Editorial contributors need onboarding documentation (see `docs/content/content-ingestion-schema.md`).
- The discriminated union for `TaskDefinition` grows as new task kinds are added. Each new `kind` requires a corresponding handler in both the app renderer and the content-admin tooling.
- JSON files for a single unit reference multiple sibling files (lexemes, sentences, grammar notes). Tooling must load and join these files; the app cannot treat a unit as a single self-contained document.
