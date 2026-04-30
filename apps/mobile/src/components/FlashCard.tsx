import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface FlashCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  revealed: boolean;
  onReveal: () => void;
}

/**
 * Flashcard with front/back states. Tap the card (when not revealed) to flip.
 */
export function FlashCard({ front, back, revealed, onReveal }: FlashCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && !revealed && styles.cardPressed]}
      onPress={() => {
        if (!revealed) {
          onReveal();
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={revealed ? "Card revealed" : "Tap to reveal answer"}
    >
      <Text style={styles.instruction}>
        {revealed ? "YOUR ANSWER" : "TAP TO REVEAL"}
      </Text>

      <View style={styles.frontContent}>{front}</View>

      {revealed ? (
        <View style={styles.revealedSection}>{back}</View>
      ) : (
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap to reveal answer</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "rgba(30,30,52,1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 0,
    alignItems: "center",
    gap: 16,
    minHeight: 240,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    overflow: "hidden"
  },
  cardPressed: {
    opacity: 0.85
  },
  instruction: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 11,
    color: "#4a4a80",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontWeight: "600"
  },
  frontContent: {
    alignItems: "center",
    gap: 12,
    paddingBottom: 16
  },
  tapHint: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
    alignItems: "center"
  },
  tapHintText: {
    fontSize: 13,
    color: "#4a4a70"
  },
  revealedSection: {
    width: "110%",
    backgroundColor: "rgba(99,102,241,0.06)",
    borderTopWidth: 1,
    borderTopColor: "rgba(99,102,241,0.15)",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 6
  }
});
