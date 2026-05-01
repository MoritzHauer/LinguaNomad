import { describe, it, expect } from "vitest";
import type {
  Lexeme,
  UnitDefinition,
  ReviewItem,
  ReviewSeed,
  UnitBundle,
  SentenceCard,
  SourceRecord,
} from "../index.js";
import { isPublicSource } from "../index.js";

describe("Lexeme shape", () => {
  it("a valid Lexeme has required fields", () => {
    const lexeme: Lexeme = {
      id: "ky-lex-test-01",
      languageCode: "ky",
      lemma: "Салам",
      transliteration: "Salam",
      gloss: "hello / greeting",
    };
    expect(lexeme.id).toBeTruthy();
    expect(lexeme.languageCode).toBe("ky");
    expect(lexeme.lemma).toBeTruthy();
    expect(lexeme.gloss).toBeTruthy();
  });

  it("Lexeme with optional fields", () => {
    const lexeme: Lexeme = {
      id: "ky-lex-test-02",
      languageCode: "ky",
      lemma: "Рахмат",
      gloss: "thank you",
      sourceIds: ["source-01"],
      notes: "Polite expression",
    };
    expect(lexeme.sourceIds).toHaveLength(1);
    expect(lexeme.transliteration).toBeUndefined();
  });

  it("Lexeme with empty optional arrays is still valid", () => {
    const lexeme: Lexeme = {
      id: "ky-lex-test-03",
      languageCode: "ky",
      lemma: "Жок",
      gloss: "no / none",
      sourceIds: [],
    };
    expect(lexeme.sourceIds).toHaveLength(0);
  });
});

describe("UnitDefinition shape", () => {
  it("a valid UnitDefinition has all required fields", () => {
    const unit: UnitDefinition = {
      id: "ky-unit-test-01",
      slug: "test-unit",
      title: "Test Unit",
      communicationGoal: "Test communication goal",
      supportedScripts: ["cyrl"],
      lexemeIds: ["ky-lex-01", "ky-lex-02"],
      sentenceIds: ["ky-sent-01"],
      grammarNoteIds: [],
      taskIds: ["ky-task-01"],
      sourceIds: ["source-01"],
    };
    expect(unit.id).toBeTruthy();
    expect(unit.supportedScripts).toContain("cyrl");
    expect(unit.lexemeIds.length).toBeGreaterThan(0);
  });

  it("UnitDefinition supports multiple scripts", () => {
    const unit: UnitDefinition = {
      id: "ky-unit-test-02",
      slug: "multi-script",
      title: "Multi Script Unit",
      communicationGoal: "Learn both scripts",
      supportedScripts: ["cyrl", "latn"],
      lexemeIds: [],
      sentenceIds: [],
      grammarNoteIds: [],
      taskIds: [],
      sourceIds: [],
    };
    expect(unit.supportedScripts).toHaveLength(2);
    expect(unit.lexemeIds).toHaveLength(0);
  });
});

describe("ReviewItem shape", () => {
  it("a valid ReviewItem has SRS state fields", () => {
    const seed: ReviewSeed = {
      id: "ky-review-test-01",
      kind: "lexeme-recall",
      prompt: "What does 'Салам' mean?",
      acceptableAnswers: ["hello", "greeting", "hi"],
    };
    const item: ReviewItem = {
      id: "ri-test-01",
      seed,
      dueAt: new Date().toISOString(),
      intervalDays: 0,
      reviewCount: 0,
      lapseCount: 0,
    };
    expect(item.dueAt).toBeTruthy();
    expect(new Date(item.dueAt).getTime()).toBeGreaterThan(0);
    expect(item.intervalDays).toBeGreaterThanOrEqual(0);
    expect(item.reviewCount).toBeGreaterThanOrEqual(0);
    expect(item.lapseCount).toBeGreaterThanOrEqual(0);
    expect(item.lastReviewedAt).toBeUndefined();
  });

  it("ReviewItem with lastReviewedAt set after a review", () => {
    const seed: ReviewSeed = {
      id: "ky-review-test-02",
      kind: "sentence-comprehension",
      prompt: "Translate: Кандайсыз?",
      acceptableAnswers: ["How are you?", "How are you doing?"],
    };
    const item: ReviewItem = {
      id: "ri-test-02",
      seed,
      dueAt: "2026-05-07T00:00:00.000Z",
      intervalDays: 7,
      reviewCount: 1,
      lapseCount: 0,
      lastReviewedAt: "2026-04-30T12:00:00.000Z",
    };
    expect(item.lastReviewedAt).toBe("2026-04-30T12:00:00.000Z");
    expect(item.reviewCount).toBe(1);
  });
});

describe("isPublicSource helper", () => {
  it("returns true for a committed, packagable, approved source", () => {
    const source: SourceRecord = {
      id: "src-01",
      name: "LinguaNomad Original",
      url: "https://example.com",
      licenseSummary: "CC BY 4.0",
      attributionRequired: true,
      committable: true,
      packagable: true,
      status: "approved",
    };
    expect(isPublicSource(source)).toBe(true);
  });

  it("returns false if status is candidate", () => {
    const source: SourceRecord = {
      id: "src-02",
      name: "Draft Source",
      url: "https://example.com",
      licenseSummary: "unknown",
      attributionRequired: false,
      committable: true,
      packagable: true,
      status: "candidate",
    };
    expect(isPublicSource(source)).toBe(false);
  });

  it("returns false if not committable", () => {
    const source: SourceRecord = {
      id: "src-03",
      name: "Restricted Source",
      url: "https://example.com",
      licenseSummary: "All rights reserved",
      attributionRequired: true,
      committable: false,
      packagable: true,
      status: "approved",
    };
    expect(isPublicSource(source)).toBe(false);
  });

  it("returns false if not packagable", () => {
    const source: SourceRecord = {
      id: "src-04",
      name: "Internal Source",
      url: "https://internal.com",
      licenseSummary: "internal use only",
      attributionRequired: false,
      committable: true,
      packagable: false,
      status: "approved",
    };
    expect(isPublicSource(source)).toBe(false);
  });
});

describe("UnitBundle structure", () => {
  it("a minimal valid UnitBundle has correct version and arrays", () => {
    const bundle: UnitBundle = {
      version: 1,
      languageCode: "ky",
      unit: {
        id: "ky-unit-bundle-test",
        slug: "bundle-test",
        title: "Bundle Test",
        communicationGoal: "Test bundling",
        supportedScripts: ["cyrl"],
        lexemeIds: [],
        sentenceIds: [],
        grammarNoteIds: [],
        taskIds: [],
        sourceIds: [],
      },
      lexemes: [],
      sentences: [],
      grammarNotes: [],
      tasks: [],
      reviewSeeds: [],
    };
    expect(bundle.version).toBe(1);
    expect(bundle.languageCode).toBe("ky");
    expect(Array.isArray(bundle.lexemes)).toBe(true);
    expect(Array.isArray(bundle.sentences)).toBe(true);
    expect(Array.isArray(bundle.tasks)).toBe(true);
  });
});

describe("SentenceCard edge cases", () => {
  it("SentenceCard with empty sourceIds array is valid", () => {
    const card: SentenceCard = {
      id: "ky-sent-test-01",
      languageCode: "ky",
      text: "Кандайсыз?",
      transliteration: "Kandaysyz?",
      translation: "How are you?",
      sourceIds: [],
    };
    expect(card.sourceIds).toHaveLength(0);
  });

  it("SentenceCard without transliteration is valid", () => {
    const card: SentenceCard = {
      id: "ky-sent-test-02",
      languageCode: "ky",
      text: "Салам!",
      translation: "Hello!",
      sourceIds: ["source-01"],
    };
    expect(card.transliteration).toBeUndefined();
    expect(card.translation).toBeTruthy();
  });
});
