import type { FillInBlankTaskDefinition } from "@linguanomad/content-schema";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface FillInBlankTaskProps {
  task: FillInBlankTaskDefinition;
  onComplete: (correct: boolean) => void;
}

type Phase = "filling" | "checking" | "done";

export function FillInBlankTask({ task, onComplete }: FillInBlankTaskProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("filling");

  function handleWordTap(word: string) {
    if (phase !== "filling") return;
    setSelected(word);
  }

  function handleCheck() {
    if (!selected) return;
    setPhase("checking");
  }

  function handleContinue() {
    onComplete(selected === task.correctAnswer);
  }

  const isCorrect = selected === task.correctAnswer;

  // Render template with blank highlighted
  const parts = task.template.split("{{blank}}");
  const beforeBlank = parts[0] ?? "";
  const afterBlank = parts[1] ?? "";

  return (
    <>
      {/* Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTypeLabel}>✏️ Task · Fill In Blank</Text>
          <Text style={styles.taskName}>{task.objective}</Text>
        </View>
      </View>

      {/* Instruction */}
      <View style={styles.instruction}>
        <Text style={styles.instructionText}>{task.instructions}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Sentence with blank */}
        <View style={styles.sentenceCard}>
          <View style={styles.sentenceRow}>
            {beforeBlank ? (
              <Text style={styles.sentenceText}>{beforeBlank}</Text>
            ) : null}
            <View
              style={[
                styles.blank,
                selected && styles.blankFilled,
                phase === "checking" && isCorrect && styles.blankCorrect,
                phase === "checking" && !isCorrect && styles.blankIncorrect,
              ]}
            >
              <Text
                style={[
                  styles.blankText,
                  phase === "checking" && isCorrect && styles.blankTextCorrect,
                  phase === "checking" && !isCorrect && styles.blankTextIncorrect,
                ]}
              >
                {selected ?? "___"}
              </Text>
            </View>
            {afterBlank ? (
              <Text style={styles.sentenceText}>{afterBlank}</Text>
            ) : null}
          </View>
          {task.translation ? (
            <Text style={styles.translation}>{task.translation}</Text>
          ) : null}
          {task.transliteration ? (
            <Text style={styles.transliteration}>{task.transliteration}</Text>
          ) : null}
        </View>

        {/* Feedback */}
        {phase === "checking" ? (
          <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
            <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextIncorrect]}>
              {isCorrect ? "✓ Correct!" : `✗ Correct answer: ${task.correctAnswer}`}
            </Text>
          </View>
        ) : null}

        {/* Word bank */}
        {phase === "filling" ? (
          <View style={styles.wordBankSection}>
            <Text style={styles.wordBankLabel}>Word bank</Text>
            <View style={styles.wordBankRow}>
              {task.wordBank.map((word) => (
                <Pressable
                  key={word}
                  onPress={() => handleWordTap(word)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected === word && styles.chipSelected,
                    pressed && selected !== word && styles.chipPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.chipText, selected === word && styles.chipTextSelected]}>
                    {word}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.checkBar}>
        {phase === "filling" ? (
          <Pressable
            accessibilityRole="button"
            disabled={!selected}
            onPress={handleCheck}
            style={[styles.btn, !selected && styles.btnDisabled]}
          >
            <Text style={[styles.btnText, !selected && styles.btnTextDisabled]}>
              Check answer
            </Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={handleContinue}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Continue →</Text>
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
    gap: 20,
  },
  sentenceCard: {
    backgroundColor: "rgba(30,30,52,1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  sentenceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  sentenceText: {
    fontSize: 26,
    fontWeight: "600",
    color: "#ffffff",
  },
  blank: {
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
    alignItems: "center",
  },
  blankFilled: {
    backgroundColor: "rgba(99,102,241,0.12)",
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  blankCorrect: {
    backgroundColor: "rgba(16,185,129,0.12)",
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  blankIncorrect: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  blankText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#818cf8",
  },
  blankTextCorrect: {
    color: "#34d399",
  },
  blankTextIncorrect: {
    color: "#f87171",
  },
  translation: {
    fontSize: 16,
    color: "#9090c0",
    textAlign: "center",
  },
  transliteration: {
    fontSize: 14,
    color: "#606090",
    fontStyle: "italic",
    textAlign: "center",
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
  feedbackTextCorrect: {
    color: "#34d399",
  },
  feedbackTextIncorrect: {
    color: "#f87171",
  },
  wordBankSection: {
    gap: 10,
  },
  wordBankLabel: {
    fontSize: 11,
    color: "#4a4a70",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  wordBankRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderColor: "rgba(99,102,241,0.5)",
  },
  chipPressed: {
    backgroundColor: "rgba(99,102,241,0.08)",
  },
  chipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e0e0f0",
  },
  chipTextSelected: {
    color: "#a5b4fc",
  },
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
