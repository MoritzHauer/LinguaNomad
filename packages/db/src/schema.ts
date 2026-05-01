/**
 * SQL DDL for the LinguaNomad local SQLite schema.
 * All CREATE TABLE statements use IF NOT EXISTS so they are safe to replay.
 */

export const CREATE_CONTENT_PACKS = `
  CREATE TABLE IF NOT EXISTS content_packs (
    id TEXT PRIMARY KEY NOT NULL,
    language_code TEXT NOT NULL,
    version INTEGER NOT NULL,
    downloaded_at TEXT NOT NULL,
    pack_json TEXT NOT NULL
  )
`;

export const CREATE_UNITS = `
  CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY NOT NULL,
    pack_id TEXT NOT NULL,
    sequence_number INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    communication_goal TEXT NOT NULL,
    data_json TEXT NOT NULL,
    FOREIGN KEY (pack_id) REFERENCES content_packs(id)
  )
`;

export const CREATE_LEXEMES = `
  CREATE TABLE IF NOT EXISTS lexemes (
    id TEXT PRIMARY KEY NOT NULL,
    unit_id TEXT NOT NULL,
    form TEXT NOT NULL,
    transliteration TEXT,
    gloss TEXT NOT NULL,
    part_of_speech TEXT,
    data_json TEXT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id)
  )
`;

export const CREATE_SENTENCE_CARDS = `
  CREATE TABLE IF NOT EXISTS sentence_cards (
    id TEXT PRIMARY KEY NOT NULL,
    unit_id TEXT NOT NULL,
    kyrgyz TEXT NOT NULL,
    transliteration TEXT,
    translation TEXT NOT NULL,
    data_json TEXT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id)
  )
`;

export const CREATE_GRAMMAR_NOTES = `
  CREATE TABLE IF NOT EXISTS grammar_notes (
    id TEXT PRIMARY KEY NOT NULL,
    unit_id TEXT NOT NULL,
    title TEXT NOT NULL,
    explanation TEXT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id)
  )
`;

export const CREATE_TASK_DEFINITIONS = `
  CREATE TABLE IF NOT EXISTS task_definitions (
    id TEXT PRIMARY KEY NOT NULL,
    unit_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    data_json TEXT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id)
  )
`;

export const CREATE_REVIEW_ITEMS = `
  CREATE TABLE IF NOT EXISTS review_items (
    id TEXT PRIMARY KEY NOT NULL,
    learner_id TEXT NOT NULL,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    ease_factor REAL NOT NULL DEFAULT 2.5,
    interval_days REAL NOT NULL DEFAULT 1.0,
    next_review_at TEXT NOT NULL,
    last_grade INTEGER,
    rep_count INTEGER NOT NULL DEFAULT 0,
    data_json TEXT NOT NULL
  )
`;

export const CREATE_PROGRESS = `
  CREATE TABLE IF NOT EXISTS progress (
    id TEXT PRIMARY KEY NOT NULL,
    learner_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    lesson_completed_at TEXT,
    task_completed_at TEXT,
    UNIQUE (learner_id, unit_id)
  )
`;

export const CREATE_SYNC_QUEUE = `
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY NOT NULL,
    operation TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    synced_at TEXT
  )
`;

// Indexes
export const CREATE_INDEX_REVIEW_ITEMS_NEXT_REVIEW_AT = `
  CREATE INDEX IF NOT EXISTS idx_review_items_next_review_at
    ON review_items (learner_id, next_review_at)
`;

export const CREATE_INDEX_REVIEW_ITEMS_LEARNER_ID = `
  CREATE INDEX IF NOT EXISTS idx_review_items_learner_id
    ON review_items (learner_id)
`;

export const CREATE_INDEX_SYNC_QUEUE_PENDING = `
  CREATE INDEX IF NOT EXISTS idx_sync_queue_pending
    ON sync_queue (synced_at)
    WHERE synced_at IS NULL
`;

export const CREATE_INDEX_UNITS_PACK_ID = `
  CREATE INDEX IF NOT EXISTS idx_units_pack_id
    ON units (pack_id)
`;

export const CREATE_INDEX_LEXEMES_UNIT_ID = `
  CREATE INDEX IF NOT EXISTS idx_lexemes_unit_id
    ON lexemes (unit_id)
`;

export const CREATE_INDEX_SENTENCE_CARDS_UNIT_ID = `
  CREATE INDEX IF NOT EXISTS idx_sentence_cards_unit_id
    ON sentence_cards (unit_id)
`;

export const CREATE_INDEX_GRAMMAR_NOTES_UNIT_ID = `
  CREATE INDEX IF NOT EXISTS idx_grammar_notes_unit_id
    ON grammar_notes (unit_id)
`;

export const CREATE_INDEX_TASK_DEFINITIONS_UNIT_ID = `
  CREATE INDEX IF NOT EXISTS idx_task_definitions_unit_id
    ON task_definitions (unit_id)
`;

/** All DDL statements in execution order. */
export const INITIAL_SCHEMA_DDL: string[] = [
  CREATE_CONTENT_PACKS,
  CREATE_UNITS,
  CREATE_LEXEMES,
  CREATE_SENTENCE_CARDS,
  CREATE_GRAMMAR_NOTES,
  CREATE_TASK_DEFINITIONS,
  CREATE_REVIEW_ITEMS,
  CREATE_PROGRESS,
  CREATE_SYNC_QUEUE,
  CREATE_INDEX_REVIEW_ITEMS_NEXT_REVIEW_AT,
  CREATE_INDEX_REVIEW_ITEMS_LEARNER_ID,
  CREATE_INDEX_SYNC_QUEUE_PENDING,
  CREATE_INDEX_UNITS_PACK_ID,
  CREATE_INDEX_LEXEMES_UNIT_ID,
  CREATE_INDEX_SENTENCE_CARDS_UNIT_ID,
  CREATE_INDEX_GRAMMAR_NOTES_UNIT_ID,
  CREATE_INDEX_TASK_DEFINITIONS_UNIT_ID,
];
