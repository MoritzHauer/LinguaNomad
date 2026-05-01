import type {
  GuidedDialogueCompletionTaskDefinition,
  RegisterChoiceTaskDefinition,
  TaskDefinition,
} from "@linguanomad/content-schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChoiceButton } from "../../src/components/ChoiceButton";
import type { BlankToken, DialogueToken } from "../../src/components/DialogueTurn";
import { DialogueTurn } from "../../src/components/DialogueTurn";
import { getBundleByUnitId } from "../../lib/course-data";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlankAnswer {
  slotId: string;
  value: string | null;
}

type TaskPhase = "filling" | "checking" | "done";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SPEAKER_EMOJIS: Record<string, string> = {
  A: "👩",
  B: "👨",
};

const SPEAKER_LABELS: Record<string, string> = {
  A: "Speaker A",
  B: "Speaker B",
};

function speakerVariant(speaker: string): "a" | "b" {
  return speaker === "B" ? "b" : "a";
}

function buildTokens(
  text: string,
  slotId: string | undefined,
  answer: BlankAnswer | undefined,
  isActive: boolean,
  phase: TaskPhase
): DialogueToken[] {
  if (!slotId) {
    return [{ type: "text", value: text }];
  }

  // Split the text so the blank can appear at the end (or in middle if needed).
  // For guided-dialogue-completion the blank IS the whole turn text when it has a slot.
  // We show a blank chip in place of the speaker's text.
  const filled = answer?.value ?? null;
  let blankState: BlankToken["state"] = "empty";
  if (phase === "checking" || phase === "done") {
    blankState = filled === text ? "correct" : "incorrect";
  } else if (filled) {
    blankState = "filled";
  } else if (isActive) {
    blankState = "active";
  }

  return [
    {
      type: "blank",
      id: slotId,
      state: blankState,
      filledValue: filled ?? undefined,
    },
  ];
}

// ─── Guided Dialogue Completion ───────────────────────────────────────────────

function GuidedDialogueTask({
  task,
  onComplete,
}: {
  task: GuidedDialogueCompletionTaskDefinition;
  onComplete: (allCorrect: boolean) => void;
}) {
  const blanks = useMemo(
    () => task.turns.filter((t) => t.responseSlotId),
    [task]
  );
  const [activeBlankIndex, setActiveBlankIndex] = useState(0);
  const [answers, setAnswers] = useState<BlankAnswer[]>(
    blanks.map((b) => ({ slotId: b.responseSlotId ?? "", value: null }))
  );
  const [phase, setPhase] = useState<TaskPhase>("filling");

  const choices = useMemo(() => {
    const raw = task.responseChoices ?? blanks.map((b) => b.text);
    // Dedupe
    return [...new Set(raw)];
  }, [task, blanks]);

  const activeSloitId = blanks[activeBlankIndex]?.responseSlotId;
  const allFilled = answers.every((a) => a.value !== null);

  function handleChoice(choice: string) {
    if (phase !== "filling") return;
    const slotId = blanks[activeBlankIndex]?.responseSlotId;
    if (!slotId) return;

    const updated = answers.map((a) =>
      a.slotId === slotId ? { ...a, value: choice } : a
    );
    setAnswers(updated);

    // Advance to next unfilled blank
    const nextIdx = updated.findIndex((a) => a.value === null);
    if (nextIdx !== -1) {
      setActiveBlankIndex(nextIdx);
    }
  }

  function handleCheck() {
    setPhase("checking");
  }

  function handleContinue() {
    const allCorrect = answers.every((a) => {
      const turn = blanks.find((b) => b.responseSlotId === a.slotId);
      return a.value === turn?.text;
    });
    setPhase("done");
    onComplete(allCorrect);
  }

  const doneCount = answers.filter((a) => a.value !== null).length;

  return (
    <>
      {/* Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTypeLabel}>📝 Task · Dialogue</Text>
          <Text style={styles.taskName}>{task.objective}</Text>
        </View>
        <View style={styles.taskProgressBadge}>
          <Text style={styles.taskProgressText}>
            {doneCount} / {blanks.length}
          </Text>
        </View>
      </View>

      {/* Instruction */}
      <View style={styles.instruction}>
        <Text style={styles.instructionText}>{task.instructions}</Text>
      </View>

      {/* Dialogue */}
      <ScrollView
        style={styles.dialogueScroll}
        contentContainerStyle={styles.dialogueContent}
      >
        {task.turns.map((turn, i) => {
          const isBlank = !!turn.responseSlotId;
          const answer = answers.find((a) => a.slotId === turn.responseSlotId);
          const blankIdx = blanks.findIndex(
            (b) => b.responseSlotId === turn.responseSlotId
          );
          const isActive = blankIdx === activeBlankIndex && phase === "filling";
          const tokens = buildTokens(
            turn.text,
            turn.responseSlotId,
            answer,
            isActive,
            phase
          );

          return (
            <DialogueTurn
              key={i}
              speaker={SPEAKER_LABELS[turn.speaker] ?? turn.speaker}
              speakerEmoji={SPEAKER_EMOJIS[turn.speaker] ?? "👤"}
              speakerVariant={speakerVariant(turn.speaker)}
              tokens={tokens}
              translation={turn.translation}
            />
          );
        })}
      </ScrollView>

      {/* Choices */}
      {phase === "filling" && (
        <View style={styles.choicesSection}>
          <Text style={styles.choicesLabel}>
            Choose for blank {activeBlankIndex + 1}
          </Text>
          <View style={styles.choicesGrid}>
            {choices.map((choice) => (
              <View key={choice} style={styles.choiceGridItem}>
                <ChoiceButton
                  primaryText={choice}
                  state={
                    answers[activeBlankIndex]?.value === choice
                      ? "selected"
                      : "neutral"
                  }
                  onPress={() => handleChoice(choice)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Result feedback */}
      {phase === "checking" && (
        <View style={styles.choicesSection}>
          {answers.map((a) => {
            const turn = blanks.find((b) => b.responseSlotId === a.slotId);
            const correct = a.value === turn?.text;
            return (
              <View key={a.slotId} style={styles.feedbackRow}>
                <Text style={correct ? styles.feedbackCorrect : styles.feedbackIncorrect}>
                  {correct ? "✓" : "✗"}{" "}
                  {correct ? "Correct!" : `Expected: ${turn?.text ?? ""}`}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Check / Continue button */}
      <View style={styles.checkBar}>
        {phase === "filling" ? (
          <Pressable
            accessibilityRole="button"
            disabled={!allFilled}
            onPress={handleCheck}
            style={[styles.checkBtn, !allFilled && styles.checkBtnDisabled]}
          >
            <Text
              style={[
                styles.checkBtnText,
                !allFilled && styles.checkBtnTextDisabled,
              ]}
            >
              Check answers
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={handleContinue}
            style={styles.checkBtn}
          >
            <Text style={styles.checkBtnText}>Continue →</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

// ─── Register Choice Task ─────────────────────────────────────────────────────

function RegisterChoiceTask({
  task,
  onComplete,
}: {
  task: RegisterChoiceTaskDefinition;
  onComplete: (allCorrect: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<TaskPhase>("filling");

  function handleSelect(optionId: string) {
    if (phase !== "filling") return;
    setSelectedId(optionId);
  }

  function handleCheck() {
    if (!selectedId) return;
    setPhase("checking");
  }

  function handleContinue() {
    const correct = selectedId !== null && task.correctOptionIds.includes(selectedId);
    setPhase("done");
    onComplete(correct);
  }

  return (
    <>
      {/* Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTypeLabel}>🎭 Task · Register</Text>
          <Text style={styles.taskName}>{task.objective}</Text>
        </View>
      </View>

      {/* Scenario */}
      <View style={styles.instruction}>
        <Text style={styles.instructionText}>{task.scenario}</Text>
      </View>

      {/* Options */}
      <ScrollView
        style={styles.dialogueScroll}
        contentContainerStyle={styles.dialogueContent}
      >
        {task.options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrect = task.correctOptionIds.includes(option.id);
          let state: "neutral" | "selected" | "correct" | "incorrect" =
            "neutral";
          if (phase === "checking" || phase === "done") {
            if (isCorrect) state = "correct";
            else if (isSelected) state = "incorrect";
          } else if (isSelected) {
            state = "selected";
          }

          return (
            <View key={option.id} style={styles.optionRow}>
              <ChoiceButton
                primaryText={option.label}
                secondaryText={option.translation}
                state={state}
                onPress={() => handleSelect(option.id)}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Check / Continue button */}
      <View style={styles.checkBar}>
        {phase === "filling" ? (
          <Pressable
            accessibilityRole="button"
            disabled={!selectedId}
            onPress={handleCheck}
            style={[styles.checkBtn, !selectedId && styles.checkBtnDisabled]}
          >
            <Text
              style={[
                styles.checkBtnText,
                !selectedId && styles.checkBtnTextDisabled,
              ]}
            >
              Check answer
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={handleContinue}
            style={styles.checkBtn}
          >
            <Text style={styles.checkBtnText}>Continue →</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

// ─── Fallback Task ────────────────────────────────────────────────────────────

function FallbackTask({
  task,
  onComplete,
}: {
  task: TaskDefinition;
  onComplete: (allCorrect: boolean) => void;
}) {
  return (
    <>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTypeLabel}>📌 Task</Text>
          <Text style={styles.taskName}>{task.objective}</Text>
        </View>
      </View>
      <ScrollView
        style={styles.dialogueScroll}
        contentContainerStyle={styles.dialogueContent}
      >
        <View style={styles.instruction}>
          <Text style={styles.instructionText}>{task.instructions}</Text>
        </View>
      </ScrollView>
      <View style={styles.checkBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onComplete(true)}
          style={styles.checkBtn}
        >
          <Text style={styles.checkBtnText}>Mark complete</Text>
        </Pressable>
      </View>
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TaskScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bundle = useMemo(
    () => (unitId ? getBundleByUnitId(unitId) : undefined),
    [unitId]
  );

  const [taskIndex, setTaskIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  if (!bundle) {
    return (
      <View style={styles.safeArea}>
        <Text style={styles.errorText}>Unit not found.</Text>
      </View>
    );
  }

  const tasks = bundle.tasks;
  const task = tasks[taskIndex];

  function handleTaskComplete(_allCorrect: boolean) {
    setCompletedCount((n) => n + 1);
    if (taskIndex + 1 < tasks.length) {
      setTaskIndex((n) => n + 1);
    } else {
      // All tasks done — go back to course
      router.back();
    }
  }

  function renderTask(t: TaskDefinition) {
    if (t.kind === "guided-dialogue-completion") {
      return (
        <GuidedDialogueTask
          key={t.id}
          task={t}
          onComplete={handleTaskComplete}
        />
      );
    }
    if (t.kind === "register-choice") {
      return (
        <RegisterChoiceTask
          key={t.id}
          task={t}
          onComplete={handleTaskComplete}
        />
      );
    }
    return (
      <FallbackTask key={t.id} task={t} onComplete={handleTaskComplete} />
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Back header */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <View style={styles.topBarInfo}>
          <Text style={styles.topBarUnit}>{bundle.unit.title}</Text>
          <Text style={styles.topBarSub}>
            Task {taskIndex + 1} of {tasks.length}
          </Text>
        </View>
        <View style={styles.topBarCompleted}>
          <Text style={styles.topBarCompletedText}>{completedCount} done</Text>
        </View>
      </View>

      {task ? renderTask(task) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  errorText: {
    color: "#e8e8f0",
    fontSize: 16,
    margin: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  backBtnText: {
    fontSize: 20,
    color: "#9090c0",
    lineHeight: 22,
  },
  topBarInfo: {
    flex: 1,
  },
  topBarUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  topBarSub: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e0e0f0",
    marginTop: 1,
  },
  topBarCompleted: {
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topBarCompletedText: {
    fontSize: 12,
    color: "#818cf8",
    fontWeight: "600",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTypeLabel: {
    fontSize: 11,
    color: "#6366f1",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  taskName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e0e0f0",
  },
  taskProgressBadge: {
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  taskProgressText: {
    fontSize: 12,
    color: "#818cf8",
    fontWeight: "600",
  },
  instruction: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "rgba(99,102,241,0.08)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
    borderRadius: 14,
    padding: 12,
  },
  instructionText: {
    fontSize: 13.5,
    color: "#9090c0",
    lineHeight: 20,
  },
  dialogueScroll: {
    flex: 1,
  },
  dialogueContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  choicesSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    flexShrink: 0,
  },
  choicesLabel: {
    fontSize: 11,
    color: "#4a4a70",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 8,
  },
  choicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  choiceGridItem: {
    width: "48%",
  },
  optionRow: {
    marginBottom: 8,
  },
  feedbackRow: {
    marginBottom: 6,
  },
  feedbackCorrect: {
    fontSize: 13,
    color: "#34d399",
    fontWeight: "600",
  },
  feedbackIncorrect: {
    fontSize: 13,
    color: "#f87171",
    fontWeight: "600",
  },
  checkBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: "#0f0f1a",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    flexShrink: 0,
  },
  checkBtn: {
    height: 52,
    backgroundColor: "#6366f1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  checkBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.06)",
    shadowOpacity: 0,
  },
  checkBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  checkBtnTextDisabled: {
    color: "#4a4a70",
  },
});
