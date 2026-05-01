import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type BlankState = "empty" | "active" | "filled" | "correct" | "incorrect";

interface BlankToken {
  type: "blank";
  id: string;
  state: BlankState;
  filledValue?: string;
}

interface TextToken {
  type: "text";
  value: string;
}

type DialogueToken = TextToken | BlankToken;

interface DialogueTurnProps {
  speaker: string;
  speakerEmoji?: string;
  speakerVariant?: "a" | "b";
  tokens: DialogueToken[];
  translation?: string;
}

export type { DialogueToken, BlankToken, TextToken };

export function DialogueTurn({ speaker, speakerEmoji = "👤", speakerVariant = "a", tokens, translation }: DialogueTurnProps) {
  const hasBlank = tokens.some((t) => t.type === "blank");

  return (
    <View style={styles.turn}>
      <View style={[styles.avatar, speakerVariant === "b" ? styles.avatarB : styles.avatarA]}>
        <Text>{speakerEmoji}</Text>
      </View>
      <View style={styles.stack}>
        <Text style={styles.speakerName}>{speaker}</Text>
        <View style={[styles.bubble, hasBlank && styles.bubbleWithBlank]}>
          <Text style={styles.bubbleText}>
            {tokens.map((token, i) => {
              if (token.type === "text") {
                return (
                  <Text key={i} style={styles.bubbleText}>
                    {token.value}
                  </Text>
                );
              }
              return (
                <BlankChip key={token.id} blank={token} />
              );
            })}
          </Text>
        </View>
        {translation ? <Text style={styles.translation}>{translation}</Text> : null}
      </View>
    </View>
  );
}

function BlankChip({ blank }: { blank: BlankToken }) {
  return (
    <Text
      style={[
        styles.blank,
        blank.state === "active" && styles.blankActive,
        blank.state === "filled" && styles.blankFilled,
        blank.state === "correct" && styles.blankCorrect,
        blank.state === "incorrect" && styles.blankIncorrect,
      ]}
    >
      {blank.filledValue ?? "  ·  "}
    </Text>
  );
}

const styles = StyleSheet.create({
  turn: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 20,
  },
  avatarA: {
    backgroundColor: "rgba(99,102,241,0.2)",
  },
  avatarB: {
    backgroundColor: "rgba(16,185,129,0.2)",
  },
  stack: {
    flex: 1,
    gap: 3,
  },
  speakerName: {
    fontSize: 10.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#4a4a80",
    marginBottom: 2,
  },
  bubble: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleWithBlank: {
    backgroundColor: "rgba(99,102,241,0.06)",
    borderColor: "rgba(99,102,241,0.2)",
  },
  bubbleText: {
    fontSize: 14,
    color: "#c8c8e8",
    lineHeight: 22,
    flexWrap: "wrap",
  },
  blank: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderRadius: 6,
    color: "#818cf8",
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontStyle: "italic",
  },
  blankActive: {
    backgroundColor: "rgba(99,102,241,0.2)",
    color: "#818cf8",
  },
  blankFilled: {
    backgroundColor: "rgba(16,185,129,0.15)",
    color: "#34d399",
    fontStyle: "normal",
  },
  blankCorrect: {
    backgroundColor: "rgba(16,185,129,0.2)",
    color: "#34d399",
    fontStyle: "normal",
  },
  blankIncorrect: {
    backgroundColor: "rgba(239,68,68,0.15)",
    color: "#f87171",
    fontStyle: "normal",
  },
  translation: {
    fontSize: 12,
    color: "#8888b0",
    fontStyle: "italic",
    marginTop: 4,
  },
});
