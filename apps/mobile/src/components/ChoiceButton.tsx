import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ChoiceState = "neutral" | "selected" | "correct" | "incorrect";

interface ChoiceButtonProps {
  primaryText: string;
  secondaryText?: string;
  state?: ChoiceState;
  onPress: () => void;
  disabled?: boolean;
}

export function ChoiceButton({ primaryText, secondaryText, state = "neutral", onPress, disabled = false }: ChoiceButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        state === "selected" && styles.buttonSelected,
        state === "correct" && styles.buttonCorrect,
        state === "incorrect" && styles.buttonIncorrect,
        pressed && state === "neutral" && !disabled && styles.buttonPressed,
      ]}
    >
      <View style={styles.inner}>
        <Text
          style={[
            styles.primaryText,
            state === "correct" && styles.primaryTextCorrect,
            state === "incorrect" && styles.primaryTextIncorrect,
            state === "selected" && styles.primaryTextSelected,
          ]}
        >
          {primaryText}
        </Text>
        {secondaryText ? (
          <Text
            style={[
              styles.secondaryText,
              state === "correct" && styles.secondaryTextCorrect,
              state === "incorrect" && styles.secondaryTextIncorrect,
            ]}
          >
            {secondaryText}
          </Text>
        ) : null}
      </View>
      {state === "correct" ? <Text style={styles.stateIcon}>✓</Text> : null}
      {state === "incorrect" ? <Text style={styles.stateIcon}>✗</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 14,
  },
  buttonSelected: {
    borderColor: "rgba(99,102,241,0.5)",
    backgroundColor: "rgba(99,102,241,0.1)",
  },
  buttonCorrect: {
    borderColor: "rgba(16,185,129,0.5)",
    backgroundColor: "rgba(16,185,129,0.1)",
  },
  buttonIncorrect: {
    borderColor: "rgba(239,68,68,0.5)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  buttonPressed: {
    borderColor: "rgba(99,102,241,0.4)",
    backgroundColor: "rgba(99,102,241,0.07)",
  },
  inner: {
    flex: 1,
    gap: 2,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e0e0f0",
  },
  primaryTextSelected: {
    color: "#a5b4fc",
  },
  primaryTextCorrect: {
    color: "#34d399",
  },
  primaryTextIncorrect: {
    color: "#f87171",
  },
  secondaryText: {
    fontSize: 11.5,
    color: "#5050a0",
    marginTop: 2,
  },
  secondaryTextCorrect: {
    color: "rgba(52,211,153,0.6)",
  },
  secondaryTextIncorrect: {
    color: "rgba(248,113,113,0.6)",
  },
  stateIcon: {
    fontSize: 16,
    marginLeft: 8,
    color: "#34d399",
  },
});
