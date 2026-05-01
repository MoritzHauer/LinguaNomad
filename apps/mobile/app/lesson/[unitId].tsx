import type { GrammarNote, Lexeme, SentenceCard } from "@linguanomad/content-schema";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getBundleByUnitId } from "../../lib/course-data";
import { LexemeCard } from "../../src/components/LexemeCard";
import { ProgressBar } from "../../src/components/ProgressBar";

// A lesson item is either a lexeme card or a sentence card
type LessonItem =
  | { kind: "lexeme"; data: Lexeme }
  | { kind: "sentence"; data: SentenceCard };

export default function LessonScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [grammarExpanded, setGrammarExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  const bundle = useMemo(() => {
    if (!unitId) return undefined;
    return getBundleByUnitId(unitId);
  }, [unitId]);

  const items = useMemo<LessonItem[]>(() => {
    if (!bundle) return [];
    const lexemeItems: LessonItem[] = bundle.lexemes.map((l) => ({ kind: "lexeme" as const, data: l }));
    const sentenceItems: LessonItem[] = bundle.sentences.map((s) => ({ kind: "sentence" as const, data: s }));
    return [...lexemeItems, ...sentenceItems];
  }, [bundle]);

  if (!bundle || items.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Unit not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtnWrap}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const current = items[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  function handleNext() {
    if (isLast) {
      router.push(`/review/${unitId}`);
    } else {
      setCurrentIndex((i) => i + 1);
      setGrammarExpanded(false);
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
      setGrammarExpanded(false);
    }
  }

  // Find grammar notes relevant to the current lexeme/sentence
  const relevantGrammarNotes = useMemo<GrammarNote[]>(() => {
    if (!bundle) return [];
    if (current.kind === "lexeme") {
      // For now show first grammar note on all items; could filter by association
      return bundle.grammarNotes.slice(0, 1);
    }
    return bundle.grammarNotes.slice(0, 1);
  }, [bundle, current]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top bar: back + progress */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.iconBtnText}>‹</Text>
        </Pressable>

        <View style={styles.progressWrap}>
          <View style={styles.progressLabels}>
            <Text style={styles.unitCrumb}>{bundle.unit.title}</Text>
            <Text style={styles.itemCounter}>
              {currentIndex + 1} / {items.length}
            </Text>
          </View>
          <ProgressBar current={currentIndex + 1} total={items.length} />
        </View>

        <View style={styles.iconBtn} />
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.contentArea}
        showsVerticalScrollIndicator={false}
      >
        {current.kind === "lexeme" ? (
          <LexemeCard
            cyrillic={current.data.lemma}
            transliteration={current.data.transliteration}
            gloss={current.data.gloss}
            tapToReveal
          />
        ) : (
          <SentenceCardView sentence={current.data} tapToReveal />
        )}

        {/* Grammar note accordion */}
        {relevantGrammarNotes.map((note) => (
          <GrammarAccordion
            key={note.id}
            note={note}
            expanded={grammarExpanded}
            onToggle={() => setGrammarExpanded((v) => !v)}
          />
        ))}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.navRow}>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            styles.navBtnSecondary,
            isFirst && styles.navBtnDisabled,
            pressed && !isFirst && styles.navBtnPressed
          ]}
          onPress={handlePrev}
          disabled={isFirst}
          accessibilityRole="button"
          accessibilityLabel="Previous card"
        >
          <Text style={[styles.navBtnText, isFirst && styles.navBtnTextDisabled]}>← Previous</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            styles.navBtnPrimary,
            pressed && styles.navBtnPressed
          ]}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Continue to review" : "Next card"}
        >
          <Text style={styles.navBtnTextPrimary}>
            {isLast ? "Start Review →" : "Next →"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SentenceCardView({ sentence, tapToReveal = false }: { sentence: SentenceCard; tapToReveal?: boolean }) {
  const [revealed, setRevealed] = useState(!tapToReveal);

  const content = (
    <View style={styles.sentenceCard}>
      <Text style={styles.sentenceCyrillic} adjustsFontSizeToFit numberOfLines={3}>
        {sentence.text}
      </Text>
      {tapToReveal && !revealed ? (
        <Text style={styles.sentenceRevealHint}>Tap to reveal pronunciation</Text>
      ) : null}
      {sentence.transliteration && revealed ? (
        <Text style={styles.sentenceTranslit}>{sentence.transliteration}</Text>
      ) : null}
      <View style={styles.sentenceDivider} />
      <Text style={styles.sentenceTranslation}>{sentence.translation}</Text>
    </View>
  );

  if (tapToReveal) {
    return (
      <Pressable onPress={() => setRevealed((v) => !v)} accessibilityRole="button" accessibilityLabel="Toggle pronunciation">
        {content}
      </Pressable>
    );
  }
  return content;
}

function GrammarAccordion({
  note,
  expanded,
  onToggle
}: {
  note: GrammarNote;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.grammarNote}>
      <Pressable
        style={styles.grammarHeader}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse grammar note" : "Expand grammar note"}
      >
        <View style={styles.grammarHeaderLeft}>
          <Text style={styles.grammarHeaderEmoji}>📚</Text>
          <Text style={styles.grammarHeaderTitle}>{note.title}</Text>
        </View>
        <Text style={styles.grammarChevron}>{expanded ? "▲" : "▼"}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.grammarBody}>
          <Text style={styles.grammarBodyText}>{note.summary}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f0f1a"
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12
  },
  iconBtn: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  iconBtnText: {
    fontSize: 20,
    color: "#9090c0",
    lineHeight: 24
  },
  progressWrap: {
    flex: 1,
    gap: 5
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  unitCrumb: {
    fontSize: 11.5,
    color: "#5050a0"
  },
  itemCounter: {
    fontSize: 11.5,
    color: "#818cf8",
    fontWeight: "600"
  },
  contentArea: {
    padding: 24,
    gap: 20,
    paddingBottom: 120
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
  backBtnWrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(99,102,241,0.12)",
    borderRadius: 12
  },
  backBtnText: {
    fontSize: 15,
    color: "#818cf8",
    fontWeight: "600"
  },
  // Sentence card styles
  sentenceCard: {
    width: "100%",
    backgroundColor: "rgba(30,30,52,1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 }
  },
  sentenceCyrillic: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 40
  },
  sentenceTranslit: {
    fontSize: 18,
    color: "#9090c0",
    letterSpacing: 1,
    fontStyle: "italic",
    textAlign: "center"
  },
  sentenceRevealHint: {
    fontSize: 12,
    color: "#6060a0",
    fontStyle: "italic",
  },
  sentenceDivider: {
    width: 48,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  sentenceTranslation: {
    fontSize: 20,
    color: "#c8c8e8",
    fontWeight: "400",
    textAlign: "center"
  },
  // Grammar accordion
  grammarNote: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,160,0,0.2)",
    backgroundColor: "rgba(255,160,0,0.04)"
  },
  grammarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  grammarHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  grammarHeaderEmoji: {
    fontSize: 14
  },
  grammarHeaderTitle: {
    fontSize: 13,
    color: "#f59e0b",
    fontWeight: "600"
  },
  grammarChevron: {
    fontSize: 12,
    color: "#f59e0b"
  },
  grammarBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,160,0,0.12)"
  },
  grammarBodyText: {
    fontSize: 13,
    color: "#9090b0",
    lineHeight: 20.8 // 1.6 * 13
  },
  // Bottom nav
  navRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f0f1a",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    flexDirection: "row",
    gap: 12
  },
  navBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  navBtnPrimary: {
    backgroundColor: "#6366f1"
  },
  navBtnSecondary: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },
  navBtnDisabled: {
    opacity: 0.3
  },
  navBtnPressed: {
    opacity: 0.8
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9090c0"
  },
  navBtnTextDisabled: {
    color: "#5050a0"
  },
  navBtnTextPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff"
  }
});
