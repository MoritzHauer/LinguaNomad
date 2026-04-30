import type { SQLiteDatabase } from "../database.types.js";
import type {
  UnitBundle,
  UnitDefinition,
  Lexeme,
  SentenceCard,
  GrammarNote,
  TaskDefinition,
} from "@linguanomad/content-schema";

// ---------------------------------------------------------------------------
// Row shapes returned from SQLite queries
// ---------------------------------------------------------------------------

interface UnitRow {
  id: string;
  pack_id: string;
  sequence_number: number;
  title: string;
  communication_goal: string;
  data_json: string;
}

interface LexemeRow {
  id: string;
  unit_id: string;
  form: string;
  transliteration: string | null;
  gloss: string;
  part_of_speech: string | null;
  data_json: string;
}

interface SentenceCardRow {
  id: string;
  unit_id: string;
  kyrgyz: string;
  transliteration: string | null;
  translation: string;
  data_json: string;
}

interface GrammarNoteRow {
  id: string;
  unit_id: string;
  title: string;
  explanation: string;
}

interface TaskDefinitionRow {
  id: string;
  unit_id: string;
  kind: string;
  title: string;
  data_json: string;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class ContentRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  /**
   * Persists a full array of UnitBundles into the local database.
   * Existing records with matching IDs are replaced.
   */
  async saveContentPack(packs: UnitBundle[]): Promise<void> {
    for (const bundle of packs) {
      const { unit, lexemes, sentences, grammarNotes, tasks } = bundle;

      // Upsert the content_pack row (using bundle metadata).
      await this.db.runAsync(
        `INSERT OR REPLACE INTO content_packs (id, language_code, version, downloaded_at, pack_json)
         VALUES (?, ?, ?, ?, ?)`,
        bundle.unit.id,
        bundle.languageCode,
        bundle.version,
        new Date().toISOString(),
        JSON.stringify(bundle)
      );

      // Upsert the unit row.
      await this.db.runAsync(
        `INSERT OR REPLACE INTO units (id, pack_id, sequence_number, title, communication_goal, data_json)
         VALUES (?, ?, ?, ?, ?, ?)`,
        unit.id,
        unit.id,
        unit.sequenceNumber ?? 0,
        unit.title,
        unit.communicationGoal,
        JSON.stringify(unit)
      );

      // Lexemes
      for (const lexeme of lexemes) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO lexemes (id, unit_id, form, transliteration, gloss, part_of_speech, data_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          lexeme.id,
          unit.id,
          lexeme.lemma,
          lexeme.transliteration ?? null,
          lexeme.gloss,
          null,
          JSON.stringify(lexeme)
        );
      }

      // Sentence cards
      for (const sentence of sentences) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO sentence_cards (id, unit_id, kyrgyz, transliteration, translation, data_json)
           VALUES (?, ?, ?, ?, ?, ?)`,
          sentence.id,
          unit.id,
          sentence.text,
          sentence.transliteration ?? null,
          sentence.translation,
          JSON.stringify(sentence)
        );
      }

      // Grammar notes
      for (const note of grammarNotes) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO grammar_notes (id, unit_id, title, explanation)
           VALUES (?, ?, ?, ?)`,
          note.id,
          unit.id,
          note.title,
          note.summary
        );
      }

      // Task definitions
      for (const task of tasks) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO task_definitions (id, unit_id, kind, title, data_json)
           VALUES (?, ?, ?, ?, ?)`,
          task.id,
          unit.id,
          task.kind,
          task.objective,
          JSON.stringify(task)
        );
      }
    }
  }

  /** Retrieves a single unit by ID, or null if not found. */
  async getUnit(unitId: string): Promise<UnitDefinition | null> {
    const row = await this.db.getFirstAsync<UnitRow>(
      "SELECT * FROM units WHERE id = ?",
      unitId
    );
    if (!row) return null;
    return JSON.parse(row.data_json) as UnitDefinition;
  }

  /** Returns all lexemes associated with the given unit. */
  async getLexemesForUnit(unitId: string): Promise<Lexeme[]> {
    const rows = await this.db.getAllAsync<LexemeRow>(
      "SELECT * FROM lexemes WHERE unit_id = ?",
      unitId
    );
    return rows.map((r) => JSON.parse(r.data_json) as Lexeme);
  }

  /** Returns all sentence cards associated with the given unit. */
  async getSentenceCardsForUnit(unitId: string): Promise<SentenceCard[]> {
    const rows = await this.db.getAllAsync<SentenceCardRow>(
      "SELECT * FROM sentence_cards WHERE unit_id = ?",
      unitId
    );
    return rows.map((r) => JSON.parse(r.data_json) as SentenceCard);
  }

  /** Returns all grammar notes associated with the given unit. */
  async getGrammarNotesForUnit(unitId: string): Promise<GrammarNote[]> {
    const rows = await this.db.getAllAsync<GrammarNoteRow>(
      "SELECT id, unit_id, title, explanation FROM grammar_notes WHERE unit_id = ?",
      unitId
    );
    return rows.map(
      (r): GrammarNote => ({
        id: r.id,
        title: r.title,
        summary: r.explanation,
        sourceIds: [],
      })
    );
  }

  /** Returns all task definitions associated with the given unit. */
  async getTaskDefinitionsForUnit(unitId: string): Promise<TaskDefinition[]> {
    const rows = await this.db.getAllAsync<TaskDefinitionRow>(
      "SELECT * FROM task_definitions WHERE unit_id = ?",
      unitId
    );
    return rows.map((r) => JSON.parse(r.data_json) as TaskDefinition);
  }
}
