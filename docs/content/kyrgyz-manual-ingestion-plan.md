# Kyrgyz Manual Ingestion Plan

## Recommendation

Use the Peace Corps Kyrgyz Language Manual as a restricted editorial reference for scope, sequencing, and linguistic cross-checking, not as shippable lesson text.
The public MVP should ship original LinguaNomad units that map manual coverage into `SourceRecord`, `Lexeme`, `SentenceCard`, `GrammarNote`, `TaskDefinition`, and `UnitDefinition` objects.

## Licensing And Quality Caveat

- Record the manual as a `SourceRecord` with `committable: false`, `packagable: false`, and a non-approved status until redistribution rights are verified.
- Keep any page-by-page extraction sheets, copied dialogue text, or verbatim exercise material outside the public repository while rights remain unresolved.
- Treat the manual as a strong beginner syllabus and grammar reference, but modernize wording, transliteration consistency, and pedagogical explanations for mobile use.

## Transformation Pipeline

### 1. Register the source before extraction

Create a source record for the manual with:
- Stable id
- Bibliographic name and URL
- License summary and attribution requirement
- Explicit non-public status
- Notes describing intended use: coverage planning, pattern mining, grammar validation

### 2. Build a private extraction sheet from the manual

For each dialogue, vocabulary box, grammar box, drill, and exercise, capture:
- Topic and page reference
- Communicative function
- Candidate lexemes
- Candidate sentence patterns
- Grammar points
- Pronunciation or script issues
- Reusable task shape

This extraction sheet is the working bridge between the manual and original LinguaNomad content. It should live outside the public repository if it contains copied text.

### 3. Convert manual material into LinguaNomad primitives

Map source material into these object types:

- `Lexeme`: high-utility nouns, pronouns, particles, and verbs with lemma, gloss, transliteration, and short usage notes
- `SentenceCard`: short, reusable beginner sentences built from manual patterns, rewritten into original LinguaNomad phrasing
- `GrammarNote`: one concept per note, written as a short learner-safe explanation tied to current unit sentences
- `TaskDefinition`: one concrete communicative objective with clear instructions and an offline-friendly completion rule
- `UnitDefinition`: the unit wrapper that binds lesson goal, reviewable items, grammar notes, task, supported scripts, and source references

### 4. Normalize for mobile-first delivery

Before authoring final objects, normalize each candidate item:
- Prefer short sentences over dense textbook lines
- Split multi-goal dialogues into micro-exchanges of 2 to 4 turns
- Keep one new grammar burden per sentence when possible
- Attach transliteration only where it reduces friction; do not let it replace Cyrillic exposure
- Add notes for vowel harmony, consonant alternations, and case endings only when needed to decode current material

### 5. Author original unit content

For each unit, create:
- A small lesson arc built around one communication goal
- 8 to 15 `Lexeme` items
- 6 to 12 `SentenceCard` items
- 1 to 3 short `GrammarNote` entries
- At least 1 `TaskDefinition` that requires comprehension plus guided production
- 1 `UnitDefinition` that references the above objects and the source record

### 6. Turn lesson content into reviewable items

Derive reviews from the same objects already used in the lesson:
- `Lexeme` recognition and recall
- `SentenceCard` comprehension and pattern recall
- Grammar-triggered form noticing, especially vowel harmony and case endings

This keeps lesson, review, and task data aligned for offline use.

### 7. Run an editorial release gate

Before a unit becomes public:
- Confirm all shipped wording is original
- Confirm source metadata is complete
- Confirm script, transliteration, and glossing are internally consistent
- Confirm the task can be completed offline without extra assets

## Prioritized Starter Sequence

The first public sequence should front-load script access, social survival, and the smallest grammar needed to unlock useful speech.

### Unit 1. Script And Sound Survival

- Goal: read and say core Kyrgyz sounds, greetings, yes-no responses, and a few courtesy expressions
- Main source areas: introduction plus phonetic course
- Grammar focus: sound-to-script mapping, vowel harmony as a listening and spelling pattern rather than a full rule set
- Task: identify, read aloud, and choose the correct greeting in short encounter prompts

### Unit 2. Greetings And Introductions

- Goal: greet someone, ask and give a name, say who you are
- Main source areas: Topic 1 greetings
- Grammar focus: personal pronouns, basic copular identity statements, question intonation and simple question forms
- Task: complete a two-person introduction exchange with the correct lines

### Unit 3. Politeness And Address Forms

- Goal: handle formal versus informal address, thanks, apologies, and respectful openings
- Main source areas: Topic 1 greetings plus relevant dialogue formulas
- Grammar focus: register choices, pronoun and address contrasts, high-frequency particles
- Task: choose the right response for elder, peer, and stranger scenarios

### Unit 4. Identity, Origin, And Family Basics

- Goal: say where you are from, introduce family members, state simple relationships
- Main source areas: Topic 2 family
- Grammar focus: possessive patterns, simple nominal linking, very light case exposure only where needed
- Task: introduce yourself and one family member from a prompt card

### Unit 5. Food And Everyday Preferences

- Goal: name common foods, express simple wants or preferences, handle tea-table exchanges
- Main source areas: Topic 3 food
- Grammar focus: high-utility verbs, polite offers, singular-plural contrasts where useful
- Task: respond to a host or ordering prompt using a limited phrase bank

### Unit 6. Location And Everyday Movement

- Goal: ask where something is, say where you are going, understand simple transport or destination talk
- Main source areas: Topic 5 transportation and selected housing/location patterns
- Grammar focus: beginner-safe introduction to directional and location-related case behavior
- Task: follow and complete a short route or destination dialogue

## Task Taxonomy

These task types fit the manual well and remain practical for offline mobile delivery.

### 1. Guided Dialogue Completion

Use for greetings, introductions, shopping, and transport.
The learner fills missing turns in a short exchange using comprehension plus controlled production.

### 2. Register Choice Task

Use for politeness and address forms.
The learner chooses the correct wording for peer, elder, stranger, or service interaction contexts.

### 3. Pattern Swap Task

Use for identity, family, food, and daily routine.
The learner rewrites one part of a sentence pattern with new names, items, or places while preserving Kyrgyz structure.

### 4. Information-Gap Microtask

Use for family, bazaar, apartment, and transport topics.
The learner receives partial information and must ask or answer to complete the missing detail.

### 5. Script-To-Meaning Task

Use heavily in Units 1 and 2.
The learner maps Cyrillic text to sound and meaning without relying entirely on transliteration.

### 6. Noticing Task

Use for vowel harmony, suffix changes, and case behavior.
The learner spots which ending changes and links that change to meaning in a live sentence, not an abstract table alone.

### 7. Mini Role Task

Use as the capstone task for each unit.
The learner completes one bounded real-world goal such as introducing themselves, greeting a host, buying tea, or asking where a bus goes.

## Editorial Checklist

Use this checklist whenever source material is turned into public LinguaNomad content.

### Source Handling

- Source record exists and license status is recorded before authoring starts.
- Unclear-license material is treated as reference only and not copied into public assets.
- Page references are preserved in private working notes for auditability.

### Originality And Safety

- Shipped dialogues, sentence cards, grammar notes, and tasks are original LinguaNomad wording.
- No verbatim dialogue blocks, vocabulary lists, or exercise instructions from the manual are shipped unless rights are cleared.
- Cultural notes are rewritten carefully and checked for outdated Peace Corps framing.

### Pedagogical Fit

- Each unit has one communication goal, one review set, and at least one task-based activity.
- New vocabulary is capped to a manageable set and reused across sentence cards and the task.
- Grammar notes explain only what the learner needs for the current unit.
- Script support appears early and often; transliteration is supportive, not dominant.

### Schema Readiness

- Every lesson item can be represented cleanly as `Lexeme`, `SentenceCard`, `GrammarNote`, `TaskDefinition`, or `UnitDefinition`.
- Source references are attached at the unit and item level where needed.
- The unit can function offline without requiring live lookup or streaming media.

### MVP Quality Gate

- The unit covers one of the Kyrgyz MVP priorities.
- The task feels like doing something with language, not just answering a quiz.
- Review items test retrieval from the lesson rather than isolated trivia.
- Script, transliteration, glossing, and English explanations have a final editorial pass.

## Proposed Immediate Next Deliverables

1. Add a candidate `SourceRecord` entry for the manual in a real source manifest.
2. Build a private extraction sheet for the intro, phonetic course, and Topics 1 to 3.
3. Draft `UnitDefinition` packages for Units 1 to 4 first, because they cover the Kyrgyz MVP priorities most directly.