import type { ScriptCode } from "@linguanomad/shared";

export type SourceStatus = "candidate" | "approved" | "blocked";

export interface SourceRecord {
  id: string;
  name: string;
  url: string;
  licenseSummary: string;
  attributionRequired: boolean;
  committable: boolean;
  packagable: boolean;
  status: SourceStatus;
  sourceLanguages?: string[];
  contentTypes?: SourceSegmentKind[];
  notes?: string;
}

export interface TextVariant {
  script: ScriptCode;
  value: string;
}

export interface SourceReference {
  sourceId: string;
  sectionTitle?: string;
  topic?: string;
  pageStart?: number;
  pageEnd?: number;
  itemLabel?: string;
  notes?: string;
}

export type SourceSegmentKind =
  | "dialogue"
  | "vocabulary-box"
  | "grammar-box"
  | "phonetic-drill"
  | "exercise"
  | "self-study"
  | "reference-grammar"
  | "cultural-note"
  | "reading"
  | "table"
  | "prompt";

export type SourceInformationType =
  | "lexeme-candidate"
  | "sentence-pattern"
  | "grammar-concept"
  | "pronunciation-cue"
  | "script-mapping"
  | "register-note"
  | "cultural-context"
  | "task-cue"
  | "review-cue";

export interface SourceSegment {
  id: string;
  sourceId: string;
  kind: SourceSegmentKind;
  title?: string;
  topic?: string;
  languageCode?: string;
  text?: string;
  transliteration?: string;
  translation?: string;
  scripts?: ScriptCode[];
  communicativeFunctions?: string[];
  register?: "neutral" | "informal" | "formal" | "honorific";
  informationIds: string[];
  references: SourceReference[];
  notes?: string;
}

export interface ExtractedInformation {
  id: string;
  type: SourceInformationType;
  label: string;
  value: string;
  languageCode?: string;
  transliteration?: string;
  translation?: string;
  proficiency?: "intro" | "beginner" | "elementary" | "intermediate";
  tags?: string[];
  references: SourceReference[];
  notes?: string;
}

export interface UnitBlueprint {
  id: string;
  slug: string;
  title: string;
  communicationGoal: string;
  sourceSegmentIds: string[];
  informationIds: string[];
  grammarFocus: string[];
  pronunciationFocus?: string[];
  recommendedTaskKinds: TaskKind[];
  targetLexemeCount?: number;
  targetSentenceCount?: number;
  notes?: string;
}

export interface SourceIngestionPack {
  source: SourceRecord;
  segments: SourceSegment[];
  information: ExtractedInformation[];
  unitBlueprints: UnitBlueprint[];
}

export interface Lexeme {
  id: string;
  languageCode: string;
  lemma: string;
  transliteration?: string;
  gloss: string;
  sourceIds?: string[];
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
  sourceIds?: string[];
}

export type TaskSupportKind = "grammar" | "pronunciation" | "fun-fact";

export interface TaskSupportCard {
  id: string;
  kind: TaskSupportKind;
  title: string;
  body: string;
  grammarNoteIds?: string[];
  lexemeIds?: string[];
  sentenceIds?: string[];
  sourceIds?: string[];
}

/**
 * All supported exercise/task kinds.
 * When adding a new exercise type:
 *   1. Add the kind string here.
 *   2. Create a new `<Kind>TaskDefinition` interface extending `BaseTaskDefinition`.
 *   3. Add it to the `TaskDefinition` union below.
 *   4. Add a case in `getTaskKindLabel()` in apps/mobile/lib/course-data.ts.
 *   5. Add a render branch in `renderTask()` in apps/mobile/app/task/[unitId].tsx.
 * See docs/developer-guide/adding-exercise-types.md for a full walkthrough.
 */
export type TaskKind =
  | "guided-dialogue-completion"
  | "register-choice"
  | "pattern-swap"
  | "information-gap"
  | "script-to-meaning"
  | "noticing"
  | "mini-role"
  | "multiple-choice"
  | "fill-in-blank"
  | "script-match";

export interface DialogueTurn {
  speaker: string;
  text: string;
  transliteration?: string;
  translation?: string;
  responseSlotId?: string;
}

export interface RegisterChoiceOption {
  id: string;
  label: string;
  register: "informal" | "neutral" | "formal" | "honorific";
  translation?: string;
  notes?: string;
}

export interface PatternSlot {
  id: string;
  label: string;
  allowedLexemeIds?: string[];
  hint?: string;
}

export interface InformationGapFact {
  id: string;
  label: string;
  value?: string;
  revealedTo: "learner" | "partner" | "both";
}

export interface ScriptPromptItem {
  text: string;
  transliteration?: string;
  meaning: string;
}

export interface NoticingTarget {
  sentenceId?: string;
  text: string;
  transliteration?: string;
  translation?: string;
  focus: string;
}

export interface BaseTaskDefinition {
  id: string;
  kind: TaskKind;
  objective: string;
  instructions: string;
  successCriteria: string[];
  sourceIds?: string[];
  lexemeIds?: string[];
  sentenceIds?: string[];
  grammarNoteIds?: string[];
  completionHint?: string;
  supportCards?: TaskSupportCard[];
}

export interface GuidedDialogueCompletionTaskDefinition extends BaseTaskDefinition {
  kind: "guided-dialogue-completion";
  turns: DialogueTurn[];
  responseChoices?: string[];
  responseMode?: "ordered-choice" | "free-text";
}

export interface RegisterChoiceTaskDefinition extends BaseTaskDefinition {
  kind: "register-choice";
  scenario: string;
  options: RegisterChoiceOption[];
  correctOptionIds: string[];
}

export interface PatternSwapTaskDefinition extends BaseTaskDefinition {
  kind: "pattern-swap";
  pattern: string;
  slots: PatternSlot[];
  promptSentenceId?: string;
}

export interface InformationGapTaskDefinition extends BaseTaskDefinition {
  kind: "information-gap";
  scenario: string;
  learnerRole: string;
  partnerRole: string;
  facts: InformationGapFact[];
}

export interface ScriptToMeaningTaskDefinition extends BaseTaskDefinition {
  kind: "script-to-meaning";
  transliterationVisible: boolean;
  items: ScriptPromptItem[];
}

export interface NoticingTaskDefinition extends BaseTaskDefinition {
  kind: "noticing";
  prompt: string;
  targets: NoticingTarget[];
}

export interface MiniRoleTaskDefinition extends BaseTaskDefinition {
  kind: "mini-role";
  scenario: string;
  learnerRole: string;
  phraseBankLexemeIds?: string[];
  phraseBankSentenceIds?: string[];
}

export interface MultipleChoiceTaskDefinition extends BaseTaskDefinition {
  kind: "multiple-choice";
  question: string;
  stimulus?: string;
  stimulusHint?: string;
  choices: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
}

export interface FillInBlankTaskDefinition extends BaseTaskDefinition {
  kind: "fill-in-blank";
  template: string;
  translation?: string;
  transliteration?: string;
  wordBank: string[];
  correctAnswer: string;
}

export interface ScriptMatchTaskDefinition extends BaseTaskDefinition {
  kind: "script-match";
  direction: "cyrl-to-latn" | "latn-to-cyrl";
  items: Array<{
    id: string;
    cyrillic: string;
    transliteration: string;
    gloss?: string;
  }>;
}

export type TaskDefinition =
  | GuidedDialogueCompletionTaskDefinition
  | RegisterChoiceTaskDefinition
  | PatternSwapTaskDefinition
  | InformationGapTaskDefinition
  | ScriptToMeaningTaskDefinition
  | NoticingTaskDefinition
  | MiniRoleTaskDefinition
  | MultipleChoiceTaskDefinition
  | FillInBlankTaskDefinition
  | ScriptMatchTaskDefinition;

export type ReviewSeedKind =
  | "lexeme-recall"
  | "sentence-comprehension"
  | "pattern-recall"
  | "form-noticing";

/**
 * ReviewItem combines a review seed (what to ask) with the learner's current
 * spaced-repetition state for that item. This is the runtime unit the SRS
 * scheduler operates on.
 */
export interface ReviewItem {
  id: string;
  seed: ReviewSeed;
  /** ISO date string: when this item is next due */
  dueAt: string;
  intervalDays: number;
  reviewCount: number;
  lapseCount: number;
  lastReviewedAt?: string;
}

export interface ReviewSeed {
  id: string;
  kind: ReviewSeedKind;
  prompt: string;
  acceptableAnswers: string[];
  lexemeIds?: string[];
  sentenceIds?: string[];
  grammarNoteIds?: string[];
  informationIds?: string[];
}

export interface UnitDefinition {
  id: string;
  slug: string;
  title: string;
  communicationGoal: string;
  sequenceNumber?: number;
  unlocksAfterUnitId?: string;
  supportedScripts: ScriptCode[];
  pronunciationFocus?: string[];
  lexemeIds: string[];
  sentenceIds: string[];
  grammarNoteIds: string[];
  taskIds: string[];
  reviewSeedIds?: string[];
  sourceIds: string[];
}

/**
 * UnitBundle bundles an entire unit and all its content into one portable JSON.
 * Useful for seeding, exporting, and content review tooling.
 */
export interface UnitBundle {
  version: number;
  languageCode: string;
  unit: UnitDefinition;
  lexemes: Lexeme[];
  sentences: SentenceCard[];
  grammarNotes: GrammarNote[];
  tasks: TaskDefinition[];
  reviewSeeds: ReviewSeed[];
}

export function isPublicSource(source: SourceRecord): boolean {
  return source.committable && source.packagable && source.status === "approved";
}