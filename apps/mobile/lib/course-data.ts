/**
 * course-data.ts
 *
 * Central registry for all course content.
 *
 * HOW TO ADD A NEW UNIT
 * ─────────────────────
 * 1. Create the six JSON files in content/languages/ky/:
 *    <slug>.unit.json, .lexemes.json, .sentences.json,
 *    .grammar-notes.json, .tasks.json, .review-seeds.json
 *
 * 2. Add six import lines at the top of this file (follow the pattern below).
 *
 * 3. Add a createBundle(...) call to the courseBundles array.
 *
 * See docs/developer-guide/adding-content.md for a full walkthrough.
 */
import type {
  GrammarNote,
  GuidedDialogueCompletionTaskDefinition,
  Lexeme,
  NoticingTaskDefinition,
  ReviewSeed,
  ScriptToMeaningTaskDefinition,
  SentenceCard,
  TaskDefinition,
  UnitDefinition
} from "@linguanomad/content-schema";
import { assertNever } from "@linguanomad/shared";

import alphabetGrammarNotesData from "../../../content/languages/ky/grammar-notes/script-and-sound-survival.grammar-notes.json";
import greetingsGrammarNotesData from "../../../content/languages/ky/grammar-notes/greetings-and-introductions.grammar-notes.json";
import politenessGrammarNotesData from "../../../content/languages/ky/grammar-notes/politeness-and-address.grammar-notes.json";
import identityGrammarNotesData from "../../../content/languages/ky/grammar-notes/identity-origin-family.grammar-notes.json";
import foodGrammarNotesData from "../../../content/languages/ky/grammar-notes/food-and-preferences.grammar-notes.json";
import locationGrammarNotesData from "../../../content/languages/ky/grammar-notes/location-and-movement.grammar-notes.json";
import alphabetLexemesData from "../../../content/languages/ky/lexemes/script-and-sound-survival.lexemes.json";
import greetingsLexemesData from "../../../content/languages/ky/lexemes/greetings-and-introductions.lexemes.json";
import politenessLexemesData from "../../../content/languages/ky/lexemes/politeness-and-address.lexemes.json";
import identityLexemesData from "../../../content/languages/ky/lexemes/identity-origin-family.lexemes.json";
import foodLexemesData from "../../../content/languages/ky/lexemes/food-and-preferences.lexemes.json";
import locationLexemesData from "../../../content/languages/ky/lexemes/location-and-movement.lexemes.json";
import alphabetReviewSeedsData from "../../../content/languages/ky/review-seeds/script-and-sound-survival.review-seeds.json";
import greetingsReviewSeedsData from "../../../content/languages/ky/review-seeds/greetings-and-introductions.review-seeds.json";
import politenessReviewSeedsData from "../../../content/languages/ky/review-seeds/politeness-and-address.review-seeds.json";
import identityReviewSeedsData from "../../../content/languages/ky/review-seeds/identity-origin-family.review-seeds.json";
import foodReviewSeedsData from "../../../content/languages/ky/review-seeds/food-and-preferences.review-seeds.json";
import locationReviewSeedsData from "../../../content/languages/ky/review-seeds/location-and-movement.review-seeds.json";
import alphabetSentencesData from "../../../content/languages/ky/sentences/script-and-sound-survival.sentences.json";
import greetingsSentencesData from "../../../content/languages/ky/sentences/greetings-and-introductions.sentences.json";
import politenessSentencesData from "../../../content/languages/ky/sentences/politeness-and-address.sentences.json";
import identitySentencesData from "../../../content/languages/ky/sentences/identity-origin-family.sentences.json";
import foodSentencesData from "../../../content/languages/ky/sentences/food-and-preferences.sentences.json";
import locationSentencesData from "../../../content/languages/ky/sentences/location-and-movement.sentences.json";
import alphabetTasksData from "../../../content/languages/ky/tasks/script-and-sound-survival.tasks.json";
import greetingsTasksData from "../../../content/languages/ky/tasks/greetings-and-introductions.tasks.json";
import politenessTasksData from "../../../content/languages/ky/tasks/politeness-and-address.tasks.json";
import identityTasksData from "../../../content/languages/ky/tasks/identity-origin-family.tasks.json";
import foodTasksData from "../../../content/languages/ky/tasks/food-and-preferences.tasks.json";
import locationTasksData from "../../../content/languages/ky/tasks/location-and-movement.tasks.json";
import alphabetUnitData from "../../../content/languages/ky/units/script-and-sound-survival.unit.json";
import greetingsUnitData from "../../../content/languages/ky/units/greetings-and-introductions.unit.json";
import politenessUnitData from "../../../content/languages/ky/units/politeness-and-address.unit.json";
import identityUnitData from "../../../content/languages/ky/units/identity-origin-family.unit.json";
import foodUnitData from "../../../content/languages/ky/units/food-and-preferences.unit.json";
import locationUnitData from "../../../content/languages/ky/units/location-and-movement.unit.json";

type Collection<T> = {
  version: number;
  languageCode: string;
  items: T[];
};

type UnitFile = {
  version: number;
  languageCode: string;
  unit: Omit<UnitDefinition, "supportedScripts"> & {
    supportedScripts: string[];
  };
};

export interface CourseBundle {
  unit: UnitDefinition;
  lexemes: Lexeme[];
  sentences: SentenceCard[];
  grammarNotes: GrammarNote[];
  tasks: TaskDefinition[];
  reviewSeeds: ReviewSeed[];
}

export interface MachineCheckedPrompt {
  id: string;
  prompt: string;
  stimulus?: string;
  sublabel?: string;
  choices: string[];
  correctAnswer: string;
}

const courseBundles: CourseBundle[] = [
  createBundle(
    alphabetUnitData,
    alphabetLexemesData,
    alphabetSentencesData,
    alphabetGrammarNotesData,
    alphabetTasksData as unknown as Collection<TaskDefinition>,
    alphabetReviewSeedsData as Collection<ReviewSeed>
  ),
  createBundle(
    greetingsUnitData,
    greetingsLexemesData,
    greetingsSentencesData,
    greetingsGrammarNotesData,
    greetingsTasksData as unknown as Collection<TaskDefinition>,
    greetingsReviewSeedsData as Collection<ReviewSeed>
  ),
  createBundle(
    politenessUnitData,
    politenessLexemesData,
    politenessSentencesData,
    politenessGrammarNotesData,
    politenessTasksData as unknown as Collection<TaskDefinition>,
    politenessReviewSeedsData as Collection<ReviewSeed>
  ),
  createBundle(
    identityUnitData,
    identityLexemesData,
    identitySentencesData,
    identityGrammarNotesData,
    identityTasksData as unknown as Collection<TaskDefinition>,
    identityReviewSeedsData as Collection<ReviewSeed>
  ),
  createBundle(
    foodUnitData,
    foodLexemesData,
    foodSentencesData,
    foodGrammarNotesData,
    foodTasksData as unknown as Collection<TaskDefinition>,
    foodReviewSeedsData as Collection<ReviewSeed>
  ),
  createBundle(
    locationUnitData,
    locationLexemesData,
    locationSentencesData,
    locationGrammarNotesData,
    locationTasksData as unknown as Collection<TaskDefinition>,
    locationReviewSeedsData as Collection<ReviewSeed>
  )
].sort((left, right) => (left.unit.sequenceNumber ?? Number.MAX_SAFE_INTEGER) - (right.unit.sequenceNumber ?? Number.MAX_SAFE_INTEGER));

export function getCourseBundles(): CourseBundle[] {
  return courseBundles;
}

export function getBundleByUnitId(unitId: string): CourseBundle | undefined {
  return courseBundles.find((bundle) => bundle.unit.id === unitId);
}

export function buildMachineCheckedPrompts(task: TaskDefinition): MachineCheckedPrompt[] {
  switch (task.kind) {
    case "script-to-meaning":
      return buildScriptPrompts(task);
    case "guided-dialogue-completion":
      return buildDialoguePrompts(task);
    case "noticing":
      return buildNoticingPrompts(task);
    case "register-choice":
      return task.options.map((option, index) => ({
        id: `${task.id}-choice-${option.id}`,
        prompt: task.scenario,
        sublabel: option.translation,
        choices: rotateChoices(task.options.map((entry) => entry.label), index),
        correctAnswer: task.options.find((entry) => task.correctOptionIds.includes(entry.id))?.label ?? option.label
      }));
    case "pattern-swap":
    case "information-gap":
    case "mini-role":
    case "multiple-choice":
    case "fill-in-blank":
    case "script-match":
      return [];
    default:
      return assertNever(task);
  }
}

export function getTaskKindLabel(kind: TaskDefinition["kind"]): string {
  switch (kind) {
    case "guided-dialogue-completion":
      return "Guided Dialogue";
    case "register-choice":
      return "Register Choice";
    case "pattern-swap":
      return "Pattern Swap";
    case "information-gap":
      return "Information Gap";
    case "script-to-meaning":
      return "Script To Meaning";
    case "noticing":
      return "Noticing";
    case "mini-role":
      return "Mini Role";
    case "multiple-choice":
      return "Multiple Choice";
    case "fill-in-blank":
      return "Fill In Blank";
    case "script-match":
      return "Script Match";
    default:
      return assertNever(kind);
  }
}

export function getReviewAnswer(seed: ReviewSeed): string {
  return seed.acceptableAnswers.join(" / ");
}

function createBundle(
  unitFileData: UnitFile,
  lexemeData: Collection<Lexeme>,
  sentenceData: Collection<SentenceCard>,
  grammarData: Collection<GrammarNote>,
  taskData: Collection<TaskDefinition>,
  reviewData: Collection<ReviewSeed>
): CourseBundle {
  return {
    unit: unitFileData.unit as UnitDefinition,
    lexemes: lexemeData.items,
    sentences: sentenceData.items,
    grammarNotes: grammarData.items,
    tasks: taskData.items,
    reviewSeeds: reviewData.items
  };
}

function buildScriptPrompts(
  task: ScriptToMeaningTaskDefinition
): MachineCheckedPrompt[] {
  const meanings = unique(task.items.map((item) => item.meaning));

  return task.items.map((item, index) => ({
    id: `${task.id}-item-${index}`,
    prompt: "What does this Kyrgyz item mean?",
    stimulus: item.text,
    sublabel: task.transliterationVisible ? item.transliteration : undefined,
    choices: rotateChoices(meanings, index),
    correctAnswer: item.meaning
  }));
}

function buildDialoguePrompts(
  task: GuidedDialogueCompletionTaskDefinition
): MachineCheckedPrompt[] {
  const responseChoices = unique(task.responseChoices ?? task.turns.filter((turn) => turn.responseSlotId).map((turn) => turn.text));

  return task.turns
    .filter((turn) => turn.responseSlotId)
    .map((turn, index) => ({
      id: `${task.id}-${turn.responseSlotId ?? index}`,
      prompt: `Choose ${turn.speaker}'s best reply.`,
      stimulus: turn.translation,
      sublabel: turn.transliteration,
      choices: rotateChoices(responseChoices, index),
      correctAnswer: turn.text
    }));
}

function buildNoticingPrompts(
  task: NoticingTaskDefinition
): MachineCheckedPrompt[] {
  const choices = task.targets.map((target) => target.text);

  return task.targets
    .filter((target) => !target.focus.toLowerCase().includes("no special"))
    .map((target, index) => ({
      id: `${task.id}-target-${index}`,
      prompt: target.focus,
      sublabel: task.prompt,
      choices: rotateChoices(choices, index),
      correctAnswer: target.text
    }));
}

function rotateChoices(choices: string[], offset: number): string[] {
  if (choices.length === 0) {
    return choices;
  }

  const safeOffset = offset % choices.length;
  return [...choices.slice(safeOffset), ...choices.slice(0, safeOffset)];
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}