import type { ScriptCode } from "@linguanomad/shared";

export interface SourceRecord {
  id: string;
  name: string;
  url: string;
  licenseSummary: string;
  attributionRequired: boolean;
  committable: boolean;
  packagable: boolean;
  status: "candidate" | "approved" | "blocked";
  notes?: string;
}

export interface TextVariant {
  script: ScriptCode;
  value: string;
}

export interface Lexeme {
  id: string;
  languageCode: string;
  lemma: string;
  transliteration?: string;
  gloss: string;
  notes?: string;
}

export interface SentenceCard {
  id: string;
  languageCode: string;
  text: string;
  transliteration?: string;
  translation: string;
  sourceIds: string[];
}

export interface GrammarNote {
  id: string;
  title: string;
  summary: string;
}

export interface TaskDefinition {
  id: string;
  objective: string;
  instructions: string;
  completionHint?: string;
}

export interface UnitDefinition {
  id: string;
  slug: string;
  title: string;
  communicationGoal: string;
  supportedScripts: ScriptCode[];
  lexemeIds: string[];
  sentenceIds: string[];
  grammarNoteIds: string[];
  taskIds: string[];
  sourceIds: string[];
}

export function isPublicSource(source: SourceRecord): boolean {
  return source.committable && source.packagable && source.status === "approved";
}