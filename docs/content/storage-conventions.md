# Content Storage Conventions

## Purpose

LinguaNomad needs stable file placement rules before real content starts landing in the repository.
The goal is to keep legal-risk material, editorial planning material, and shipping content clearly separated.

## Principles

- Do not store unclear-license extraction material in the public repository.
- Keep examples and planning assets under `docs/`, not mixed with shipping content.
- Keep shipping content in machine-readable JSON files with predictable directories.
- Prefer small, focused files over one giant language dump.

## Public Repository Zones

Use these zones for different artifact types.

### 1. Documentation And Examples

Path:
- `docs/content/`
- `docs/content/examples/`

Use for:
- policy
- schema guides
- example manifests
- example ingestion packs
- example unit blueprints

Do not use for:
- production lesson data consumed by the app
- copied extraction notes from restricted sources

### 2. Future Shipping Content Root

Recommended path:

```text
content/
  sources/
    source-manifest.json
  languages/
    ky/
      blueprints/
      lexemes/
      sentences/
      grammar-notes/
      tasks/
      review-seeds/
      units/
```

Use this root only for public, reusable, app-consumable content.

### 3. Private Editorial Extraction Workspace

Do not place this in the public repository.
Keep it in a separate private workspace or local-only folder.

Use for:
- copied source text
- page-by-page extraction sheets
- source screenshots
- licensing investigation notes that include non-public source excerpts

## File Naming Rules

### Source Files

Use stable source ids everywhere.

Examples:
- `source-manifest.json`
- `peace-corps-kyrgyz-language-manual-1997.source.json`

### Ingestion Example Files

Use:
- `<language>-<topic-or-scope>-source-ingestion-pack.example.json`

Example:
- `kyrgyz-topic-01-source-ingestion-pack.example.json`

### Blueprint Files

Use:
- `<unit-slug>.blueprint.json`

Example:
- `greetings-and-introductions.blueprint.json`

### Learner-Facing Content Files

Use one file per object collection type.

Examples:
- `lexemes/greetings-and-introductions.lexemes.json`
- `sentences/greetings-and-introductions.sentences.json`
- `grammar-notes/greetings-and-introductions.grammar-notes.json`
- `tasks/greetings-and-introductions.tasks.json`
- `review-seeds/greetings-and-introductions.review-seeds.json`
- `units/greetings-and-introductions.unit.json`

This keeps content diffable and lets editorial tooling load only the slices it needs.

## JSON Structure Conventions

### Source Manifest

Store as a single file:
- `content/sources/source-manifest.json`

Top-level shape:

```json
{
  "version": 1,
  "sources": []
}
```

### Ingestion Packs

Use for planning, transformation, and content-admin tooling.
Keep them in `docs/content/examples/` while the structure is still evolving.
Move real public ingestion packs into `content/languages/<lang>/blueprints/` only if they contain no restricted material.

Top-level shape:

```json
{
  "version": 1,
  "source": {},
  "segments": [],
  "information": [],
  "unitBlueprints": []
}
```

### Learner-Facing Content Files

Use collection files rather than individual-object files.

Recommended shapes:

```json
{
  "version": 1,
  "languageCode": "ky",
  "items": []
}
```

For the unit wrapper:

```json
{
  "version": 1,
  "languageCode": "ky",
  "unit": {}
}
```

## ID Conventions

Use ids that encode scope but remain stable if English glosses change.

Recommended patterns:
- source: `peace-corps-kyrgyz-language-manual-1997`
- segment: `topic-01-dialogue-01`
- information: `info-greeting-formal-01`
- blueprint: `unit-blueprint-greetings-01`
- lexeme: `ky-lex-salamatsyzby`
- sentence: `ky-sent-intro-my-name-01`
- grammar note: `ky-grammar-basic-identity-01`
- task: `ky-task-greetings-dialogue-01`
- review seed: `ky-review-greeting-form-01`
- unit: `ky-unit-greetings-and-introductions`

## What Stays Out Of Shipping Content

Do not store these in app-consumable JSON files:
- copied paragraphs from restricted sources
- page scans or screenshots
- editorial uncertainty notes
- alternative drafts that are not intended for runtime

Keep shipping content focused on finalized, original LinguaNomad lesson objects.

## Immediate Recommendation

Until a public `content/` root exists, use:
- `docs/content/` for conventions and guides
- `docs/content/examples/` for example JSON artifacts

When the first public Kyrgyz content pack is ready, add the `content/` root in one deliberate repo change instead of gradually scattering content files across `docs/`, `packages/`, and `apps/`.