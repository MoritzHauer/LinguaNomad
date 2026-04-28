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
import alphabetLexemesData from "../../../content/languages/ky/lexemes/script-and-sound-survival.lexemes.json";
import greetingsLexemesData from "../../../content/languages/ky/lexemes/greetings-and-introductions.lexemes.json";
import alphabetReviewSeedsData from "../../../content/languages/ky/review-seeds/script-and-sound-survival.review-seeds.json";
import greetingsReviewSeedsData from "../../../content/languages/ky/review-seeds/greetings-and-introductions.review-seeds.json";
import alphabetSentencesData from "../../../content/languages/ky/sentences/script-and-sound-survival.sentences.json";
import greetingsSentencesData from "../../../content/languages/ky/sentences/greetings-and-introductions.sentences.json";
import alphabetTasksData from "../../../content/languages/ky/tasks/script-and-sound-survival.tasks.json";
import greetingsTasksData from "../../../content/languages/ky/tasks/greetings-and-introductions.tasks.json";
import alphabetUnitData from "../../../content/languages/ky/units/script-and-sound-survival.unit.json";
import greetingsUnitData from "../../../content/languages/ky/units/greetings-and-introductions.unit.json";

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
    alphabetTasksData as Collection<TaskDefinition>,
    alphabetReviewSeedsData as Collection<ReviewSeed>
  ),
  createBundle(
    greetingsUnitData,
    greetingsLexemesData,
    greetingsSentencesData,
    greetingsGrammarNotesData,
    greetingsTasksData as Collection<TaskDefinition>,
    greetingsReviewSeedsData as Collection<ReviewSeed>
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