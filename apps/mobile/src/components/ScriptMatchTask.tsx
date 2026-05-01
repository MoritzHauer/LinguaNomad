import type { ScriptMatchTaskDefinition } from "@linguanomad/content-schema";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceButton } from "./ChoiceButton";

interface ScriptMatchTaskProps {
  task: ScriptMatchTaskDefinition;
  onComplete: (correctCount: number, totalCount: number) => void;
}

type ItemPhase = "selecting" | "revealed";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function ScriptMatchTask({ task, onComplete }: ScriptMatchTaskProps) {
  const [itemIndex, setItemIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [itemPhase, setItemPhase] = useState<ItemPhase>("selecting");
  const [correctCount, setCorrectCount] = useState(0);

  const currentItem = task.items[itemIndex];

  // Build choices for current item: correct answer + up to 3 distractors
  const choices = useMemo(() => {
    if (!currentItem) return [];
    const others = task.items.filter((it) => it.id !== currentItem.id);
    const distractors = shuffle(others).slice(0, 3);
    const allChoices = shuffle([currentItem, ...distractors]);

    if (task.direction === "cyrl-to-latn") {
      return allChoices.map((it) => ({ id: it.id, label: it.transliteration }));
    } else {
      return allChoices.map((it) => ({ id: it.id, label: it.cyrillic }));
    }
  }, [currentItem, task.items, task.direction]);

  if (!currentItem) {
    return null;
  }

  const totalCount = task.items.length;
  const isLast = itemIndex >= totalCount - 1;

  function handleSelect(choiceId: string) {
    if (itemPhase !== "selecting") return;
    setSelectedId(choiceId);
  }

  function handleReveal() {
    if (!selectedId) return;
    const isCorrect = selectedId === currentItem?.id;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setItemPhase("revealed");
  }

  function handleNext() {
    if (isLast) {
      const finalCorrect = selectedId === currentItem?.id
        ? correctCount + (itemPhase === "selecting" ? 0 : 0) // already counted in handleReveal
        : correctCount;
      // correctCount was updated in handleReveal before moving on
      onComplete(correctCount + (selectedId === currentItem?.id && itemPhase === "revealed" ? 0 : 0), totalCount);
      return;
    }
    setItemIndex((i) => i + 1);
    setSelectedId(null);
    setItemPhase("selecting");
  }

  const questionText = task.direction === "cyrl-to-latn"
    ? currentItem.cyrillic
    : currentItem.transliteration;

  const questionLabel = task.direction === "cyrl-to-latn"
    ? "Choose the transliteration"
    : "Choose the Cyrillic";

  return (
    <>
      {/* Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTypeLabel}>🔡 Task · Script Match</Text>
          <Text style={styles.taskName}>{task.objective}</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{itemIndex + 1} / {totalCount}</Text>
        </View>
      </View>

      {/* Instruction */}
      <View style={styles.instruction}>
        <Text style={styles.instructionText}>{task.instructions}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>{questionLabel}</Text>
          <Text style={styles.questionText}>{questionText}</Text>
          {currentItem.gloss ? (
            <Text style={styles.questionGloss}>{currentItem.gloss}</Text>
          ) : null}
        </View>

        {/* Choices */}
        <View style={styles.choicesGrid}>
          {choices.map((choice) => {
            let state: "neutral" | "selected" | "correct" | "incorrect" = "neutral";
            if (itemPhase === "revealed") {
              if (choice.id === currentItem.id) state = "correct";
              else if (choice.id === selectedId) state = "incorrect";
            } else if (choice.id === selectedId) {
              state = "selected";
            }
            return (
              <View key={choice.id} style={styles.choiceItem}>
                <ChoiceButton
                  primaryText={choice.label}
                  state={state}
                  onPress={() => handleSelect(choice.id)}
                  disabled={itemPhase === "revealed"}
                />
              </View>
            );
          })}
        </View>

        {/* Feedback */}
        {itemPhase === "revealed" ? (
          <View style={[
            styles.feedback,
            selectedId === currentItem.id ? styles.feedbackCorrect : styles.feedbackIncorrect
          ]}>
            <Text style={[
              styles.feedbackText,
              selectedId === currentItem.id ? styles.feedbackTextCorrect : styles.feedbackTextIncorrect
            ]}>
              {selectedId === currentItem.id
                ? "✓ Correct!"
                : `✗ Correct: ${task.direction === "cyrl-to-latn" ? currentItem.transliteration : currentItem.cyrillic}`
              }
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.checkBar}>
        {itemPhase === "selecting" ? (
          <Pressable
            accessibilityRole="button"
            disabled={!selectedId}
            onPress={handleReveal}
            style={[styles.btn, !selectedId && styles.btnDisabled]}
          >
            <Text style={[styles.btnText, !selectedId && styles.btnTextDisabled]}>
              Check answer
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={handleNext}
            style={styles.btn}
          >
            <Text style={styles.btnText}>{isLast ? "Finish →" : "Next →"}</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  taskInfo: { flex: 1 },
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
  progressBadge: {
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressText: {
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  questionCard: {
    backgroundColor: "rgba(30,30,52,1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  questionLabel: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  questionText: {
    fontSize: 44,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  questionGloss: {
    fontSize: 16,
    color: "#9090c0",
    textAlign: "center",
    fontStyle: "italic",
  },
  choicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  choiceItem: {
    width: "48%",
  },
  feedback: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  feedbackCorrect: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  feedbackIncorrect: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "600",
  },
  feedbackTextCorrect: { color: "#34d399" },
  feedbackTextIncorrect: { color: "#f87171" },
  checkBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: "#0f0f1a",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  btn: {
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
  btnDisabled: {
    backgroundColor: "rgba(255,255,255,0.06)",
    shadowOpacity: 0,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  btnTextDisabled: {
    color: "#4a4a70",
  },
});
