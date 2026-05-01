import type { MultipleChoiceTaskDefinition } from "@linguanomad/content-schema";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChoiceButton } from "./ChoiceButton";

interface MultipleChoiceTaskProps {
  task: MultipleChoiceTaskDefinition;
  onComplete: (correct: boolean) => void;
}

type Phase = "selecting" | "revealed";

export function MultipleChoiceTask({ task, onComplete }: MultipleChoiceTaskProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("selecting");

  function handleSelect(choiceId: string) {
    if (phase !== "selecting") return;
    setSelectedId(choiceId);
  }

  function handleReveal() {
    if (!selectedId) return;
    setPhase("revealed");
  }

  function handleContinue() {
    const selected = task.choices.find((c) => c.id === selectedId);
    onComplete(selected?.correct === true);
  }

  return (
    <>
      {/* Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTypeLabel}>🔤 Task · Multiple Choice</Text>
          <Text style={styles.taskName}>{task.objective}</Text>
        </View>
      </View>

      {/* Instruction */}
      <View style={styles.instruction}>
        <Text style={styles.instructionText}>{task.instructions}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Question */}
        <Text style={styles.question}>{task.question}</Text>

        {/* Stimulus */}
        {task.stimulus ? (
          <View style={styles.stimulusCard}>
            <Text style={styles.stimulusText}>{task.stimulus}</Text>
            {task.stimulusHint ? (
              <Text style={styles.stimulusHint}>{task.stimulusHint}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Choices */}
        <View style={styles.choicesGrid}>
          {task.choices.map((choice) => {
            let state: "neutral" | "selected" | "correct" | "incorrect" = "neutral";
            if (phase === "revealed") {
              if (choice.correct) state = "correct";
              else if (choice.id === selectedId) state = "incorrect";
            } else if (choice.id === selectedId) {
              state = "selected";
            }
            return (
              <View key={choice.id} style={styles.choiceItem}>
                <ChoiceButton
                  primaryText={choice.text}
                  state={state}
                  onPress={() => handleSelect(choice.id)}
                  disabled={phase === "revealed"}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.checkBar}>
        {phase === "selecting" ? (
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
    gap: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e0e0f0",
    textAlign: "center",
    marginTop: 4,
  },
  stimulusCard: {
    backgroundColor: "rgba(30,30,52,1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  stimulusText: {
    fontSize: 42,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  stimulusHint: {
    fontSize: 18,
    color: "#9090c0",
    fontStyle: "italic",
    textAlign: "center",
  },
  choicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  choiceItem: {
    width: "48%",
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
