import type { ReviewSeed } from "@linguanomad/content-schema";
import type { ReviewRating, ReviewState } from "@linguanomad/srs";
import { createInitialReviewState, scheduleNextReview } from "@linguanomad/srs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getBundleByUnitId } from "../../lib/course-data";
import { FlashCard } from "../../src/components/FlashCard";
import { RatingButtons } from "../../src/components/RatingButtons";

interface ReviewCardState {
  seed: ReviewSeed;
  srsState: ReviewState;
}

export default function ReviewScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();

  const bundle = useMemo(() => {
    if (!unitId) return undefined;
    return getBundleByUnitId(unitId);
  }, [unitId]);

  // Initialize review queue with fresh SRS states
  const initialQueue = useMemo<ReviewCardState[]>(() => {
    if (!bundle) return [];
    return bundle.reviewSeeds.map((seed) => ({
      seed,
      srsState: createInitialReviewState()
    }));
  }, [bundle]);

  const [queue, setQueue] = useState<ReviewCardState[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);

  if (!bundle) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Unit not found</Text>
          <Pressable onPress={() => router.back()} style={styles.errorBtn}>
            <Text style={styles.errorBtnText}>← Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const remaining = queue.length - currentIndex;
  const isComplete = currentIndex >= queue.length;

  function handleReveal() {
    setRevealed(true);
  }

  function handleRate(rating: ReviewRating) {
    const current = queue[currentIndex];
    if (!current) return;

    const nextState = scheduleNextReview(current.srsState, rating, new Date());
    const isCorrect = rating !== "again";

    // Update the queue entry with new state
    const updatedQueue = queue.map((item, idx) =>
      idx === currentIndex ? { ...item, srsState: nextState } : item
    );

    // If "again", re-queue at the end
    if (rating === "again") {
      updatedQueue.push({ seed: current.seed, srsState: nextState });
    }

    setQueue(updatedQueue);
    setDoneCount((c) => c + 1);
    setCorrectCount((c) => c + (isCorrect ? 1 : 0));
    setAgainCount((c) => c + (rating === "again" ? 1 : 0));
    setCurrentIndex((i) => i + 1);
    setRevealed(false);
  }

  if (isComplete) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.completionContent}>
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Review Complete!</Text>
            <Text style={styles.completionSubtitle}>
              You reviewed {doneCount} card{doneCount !== 1 ? "s" : ""} for{" "}
              <Text style={styles.unitNameHighlight}>{bundle.unit.title}</Text>
            </Text>

            <View style={styles.statsRow}>
              <StatChip label="Done" value={String(doneCount)} color="#ffffff" />
              <StatChip label="Correct" value={String(correctCount)} color="#10b981" />
              <StatChip label="Again" value={String(againCount)} color="#ef4444" />
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
              onPress={() => router.push("/course")}
              accessibilityRole="button"
            >
              <Text style={styles.primaryBtnText}>Back to Course</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  const currentCard = queue[currentIndex];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBack}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Review Session</Text>
        </View>
        <View style={styles.queueBadge}>
          <Text style={styles.queueBadgeText}>{remaining} remaining</Text>
        </View>
      </View>

      {/* Session stats */}
      <View style={styles.statsRow}>
        <StatChip label="Done" value={String(doneCount)} color="#ffffff" />
        <StatChip label="Correct" value={String(correctCount)} color="#10b981" />
        <StatChip label="Again" value={String(againCount)} color="#ef4444" />
        <StatChip label="Queue" value={String(remaining)} color="#818cf8" />
      </View>

      {/* Card area */}
      <ScrollView
        contentContainerStyle={styles.cardArea}
        showsVerticalScrollIndicator={false}
      >
        <FlashCard
          revealed={revealed}
          onReveal={handleReveal}
          front={
            <FrontContent seed={currentCard.seed} />
          }
          back={
            <BackContent seed={currentCard.seed} />
          }
        />

        {revealed ? (
          <RatingButtons
            currentState={currentCard.srsState}
            onRate={handleRate}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function FrontContent({ seed }: { seed: ReviewSeed }) {
  // The prompt is the Kyrgyz word/sentence; extract Cyrillic and transliteration if pipe-separated
  const promptParts = seed.prompt.split("|").map((s) => s.trim());
  const cyrillic = promptParts[0] ?? seed.prompt;
  const transliteration = promptParts[1];

  const isSingleWord = cyrillic.split(" ").length <= 2;
  const fontSize = isSingleWord ? (cyrillic.length > 8 ? 40 : 52) : 28;

  return (
    <View style={styles.frontContentInner}>
      <Text
        style={[styles.kyrillicWord, { fontSize }]}
        adjustsFontSizeToFit
        numberOfLines={3}
      >
        {cyrillic}
      </Text>
      {transliteration ? (
        <Text style={styles.transliteration}>{transliteration}</Text>
      ) : null}
    </View>
  );
}

function BackContent({ seed }: { seed: ReviewSeed }) {
  const answer = seed.acceptableAnswers[0] ?? "—";
  return (
    <View style={styles.backContentInner}>
      <Text style={styles.englishAnswer}>{answer}</Text>
      {seed.acceptableAnswers.length > 1 ? (
        <Text style={styles.answerNote}>
          Also accepted: {seed.acceptableAnswers.slice(1).join(", ")}
        </Text>
      ) : null}
    </View>
  );
}

function StatChip({
  label,
  value,
  color
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={chipStyles.chip}>
      <Text style={[chipStyles.value, { color }]}>{value}</Text>
      <Text style={chipStyles.label}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center"
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22
  },
  label: {
    fontSize: 10.5,
    color: "#5050a0",
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.6
  }
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f0f1a"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16
  },
  headerBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  backBtn: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  backBtnText: {
    fontSize: 20,
    color: "#9090c0",
    lineHeight: 24
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e0e0f0"
  },
  queueBadge: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  queueBadgeText: {
    fontSize: 12.5,
    color: "#818cf8",
    fontWeight: "600"
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10
  },
  cardArea: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 40
  },
  frontContentInner: {
    alignItems: "center",
    gap: 12,
    paddingBottom: 8
  },
  kyrillicWord: {
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -1,
    lineHeight: undefined,
    textAlign: "center"
  },
  transliteration: {
    fontSize: 18,
    color: "#7070a0",
    fontStyle: "italic",
    letterSpacing: 0.5
  },
  backContentInner: {
    alignItems: "center",
    gap: 6
  },
  englishAnswer: {
    fontSize: 24,
    color: "#c8c8ee",
    fontWeight: "500",
    textAlign: "center"
  },
  answerNote: {
    fontSize: 12,
    color: "#6060a0",
    textAlign: "center"
  },
  // Completion screen
  completionContent: {
    flex: 1,
    padding: 24,
    justifyContent: "center"
  },
  completionCard: {
    backgroundColor: "rgba(30,30,52,1)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 16
  },
  completionEmoji: {
    fontSize: 48
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff"
  },
  completionSubtitle: {
    fontSize: 16,
    color: "#9090c0",
    textAlign: "center",
    lineHeight: 24
  },
  unitNameHighlight: {
    color: "#818cf8",
    fontWeight: "600"
  },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16
  },
  errorText: {
    fontSize: 18,
    color: "#9090c0"
  },
  errorBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(99,102,241,0.12)",
    borderRadius: 12
  },
  errorBtnText: {
    fontSize: 15,
    color: "#818cf8",
    fontWeight: "600"
  },
  primaryBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%"
  },
  primaryBtnPressed: {
    opacity: 0.85
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff"
  }
});
