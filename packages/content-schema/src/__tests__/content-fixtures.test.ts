import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import type { UnitBundle, Lexeme, SentenceCard } from "../index.js";

const CONTENT_DIR = join(__dirname, "../../../../content/kyrgyz");

function loadUnit(filename: string): UnitBundle {
  const raw = readFileSync(join(CONTENT_DIR, filename), "utf-8");
  return JSON.parse(raw) as UnitBundle;
}

const UNIT_FILES = [
  "unit-01-script-and-sound.json",
  "unit-02-greetings.json",
] as const;

for (const filename of UNIT_FILES) {
  describe(`content fixture: ${filename}`, () => {
    const bundle = loadUnit(filename);

    it("has valid top-level structure", () => {
      expect(bundle.version).toBe(1);
      expect(bundle.languageCode).toBe("ky");
      expect(bundle.unit).toBeDefined();
      expect(Array.isArray(bundle.lexemes)).toBe(true);
      expect(Array.isArray(bundle.sentences)).toBe(true);
      expect(Array.isArray(bundle.grammarNotes)).toBe(true);
      expect(Array.isArray(bundle.tasks)).toBe(true);
      expect(Array.isArray(bundle.reviewSeeds)).toBe(true);
    });

    it("unit has required metadata fields", () => {
      const { unit } = bundle;
      expect(unit.id).toBeTruthy();
      expect(unit.slug).toBeTruthy();
      expect(unit.title).toBeTruthy();
      expect(unit.communicationGoal).toBeTruthy();
      expect(Array.isArray(unit.supportedScripts)).toBe(true);
      expect(unit.supportedScripts.length).toBeGreaterThan(0);
    });

    it("lexemeIds in unit match lexemes array", () => {
      const { unit, lexemes } = bundle;
      const lexemeIdSet = new Set(lexemes.map((l) => l.id));
      for (const id of unit.lexemeIds) {
        expect(lexemeIdSet.has(id), `lexeme ${id} missing from lexemes array`).toBe(true);
      }
    });

    it("sentenceIds in unit match sentences array", () => {
      const { unit, sentences } = bundle;
      const sentenceIdSet = new Set(sentences.map((s) => s.id));
      for (const id of unit.sentenceIds) {
        expect(sentenceIdSet.has(id), `sentence ${id} missing from sentences array`).toBe(true);
      }
    });

    it("all lexemes have Cyrillic form, transliteration, and gloss", () => {
      for (const lexeme of bundle.lexemes) {
        expect(lexeme.id, "lexeme.id must be truthy").toBeTruthy();
        expect(lexeme.lemma, `lexeme ${lexeme.id} must have lemma`).toBeTruthy();
        // Cyrillic check: lemma should contain at least one Cyrillic character
        const hasCyrillic = /[\u0400-\u04FF]/.test(lexeme.lemma);
        expect(hasCyrillic, `lexeme ${lexeme.id} lemma '${lexeme.lemma}' should be Cyrillic`).toBe(true);
        expect(lexeme.transliteration, `lexeme ${lexeme.id} must have transliteration`).toBeTruthy();
        expect(lexeme.gloss, `lexeme ${lexeme.id} must have gloss`).toBeTruthy();
      }
    });

    it("all sentences have text, transliteration, and translation", () => {
      for (const card of bundle.sentences) {
        expect(card.id, "sentence.id must be truthy").toBeTruthy();
        expect(card.text, `sentence ${card.id} must have text`).toBeTruthy();
        expect(card.transliteration, `sentence ${card.id} must have transliteration`).toBeTruthy();
        expect(card.translation, `sentence ${card.id} must have translation`).toBeTruthy();
      }
    });

    it("lexemes are non-empty", () => {
      expect(bundle.lexemes.length).toBeGreaterThan(0);
    });

    it("sentences are non-empty", () => {
      expect(bundle.sentences.length).toBeGreaterThan(0);
    });

    it("reviewSeeds have required fields", () => {
      for (const seed of bundle.reviewSeeds) {
        expect(seed.id).toBeTruthy();
        expect(seed.kind).toBeTruthy();
        expect(seed.prompt).toBeTruthy();
        expect(Array.isArray(seed.acceptableAnswers)).toBe(true);
        expect(seed.acceptableAnswers.length).toBeGreaterThan(0);
      }
    });

    it("grammarNotes have required fields", () => {
      for (const note of bundle.grammarNotes) {
        expect(note.id).toBeTruthy();
        expect(note.title).toBeTruthy();
        expect(note.summary).toBeTruthy();
      }
    });
  });
}

describe("cross-unit assertions", () => {
  it("unit sequence numbers are unique", () => {
    const bundles = UNIT_FILES.map(loadUnit);
    const seqNums = bundles
      .map((b) => b.unit.sequenceNumber)
      .filter((n): n is number => n !== undefined);
    const unique = new Set(seqNums);
    expect(unique.size).toBe(seqNums.length);
  });

  it("unit slugs are unique across units", () => {
    const bundles = UNIT_FILES.map(loadUnit);
    const slugs = bundles.map((b) => b.unit.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("lexeme IDs are unique across units", () => {
    const bundles = UNIT_FILES.map(loadUnit);
    const allIds = bundles.flatMap((b) => b.lexemes.map((l) => l.id));
    const unique = new Set(allIds);
    expect(unique.size).toBe(allIds.length);
  });
});
