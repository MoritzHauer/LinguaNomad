import type { ReviewRating, ReviewState } from "@linguanomad/srs";
import { scheduleNextReview } from "@linguanomad/srs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RatingButtonsProps {
  currentState: ReviewState;
  onRate: (rating: ReviewRating) => void;
}

const RATINGS: { rating: ReviewRating; label: string; emoji: string; color: string; bgColor: string }[] = [
  { rating: "again", label: "Again", emoji: "😰", color: "#f87171", bgColor: "rgba(239,68,68,0.15)" },
  { rating: "hard", label: "Hard", emoji: "😓", color: "#fbbf24", bgColor: "rgba(245,158,11,0.12)" },
  { rating: "good", label: "Good", emoji: "🙂", color: "#34d399", bgColor: "rgba(16,185,129,0.12)" },
  { rating: "easy", label: "Easy", emoji: "😄", color: "#818cf8", bgColor: "rgba(99,102,241,0.12)" }
];

function formatInterval(days: number): string {
  if (days === 0) return "< 1 day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function RatingButtons({ currentState, onRate }: RatingButtonsProps) {
  const now = new Date();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>How well did you know it?</Text>
      <View style={styles.row}>
        {RATINGS.map(({ rating, label, emoji, color, bgColor }) => {
          const next = scheduleNextReview(currentState, rating, now);
          const interval = formatInterval(next.intervalDays);

          return (
            <Pressable
              key={rating}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: bgColor },
                pressed && styles.btnPressed
              ]}
              onPress={() => onRate(rating)}
              accessibilityRole="button"
              accessibilityLabel={`${label}: next review in ${interval}`}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={[styles.btnLabel, { color }]}>{label}</Text>
              <Text style={[styles.interval, { color }]}>{interval}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 10
  },
  label: {
    fontSize: 11.5,
    color: "#4a4a80",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    textAlign: "center"
  },
  row: {
    flexDirection: "row",
    gap: 8
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 4
  },
  btnPressed: {
    opacity: 0.7
  },
  emoji: {
    fontSize: 20
  },
  btnLabel: {
    fontSize: 12,
    fontWeight: "600"
  },
  interval: {
    fontSize: 10,
    opacity: 0.7
  }
});
