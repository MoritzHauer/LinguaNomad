import type { ReviewSeed, TaskDefinition, TaskSupportCard } from "@linguanomad/content-schema";
import { applyAnswerEvaluation, isUnitUnlocked } from "@linguanomad/learner-state";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  buildMachineCheckedPrompts,
  getBundleByUnitId,
  getCourseBundles,
  getReviewAnswer,
  getTaskKindLabel,
  type CourseBundle,
  type MachineCheckedPrompt
} from "../lib/course-data";
import { useLearnerProgress, type PersistedSession } from "../lib/learner-progress";

export default function HomeScreen() {
  const { isHydrated, profile, activeSession, clearSession, finalizeRun, saveSession, startUnit } = useLearnerProgress();
  const [feedback, setFeedback] = useState<string | null>(null);
  const bundles = useMemo(() => getCourseBundles(), []);

  if (!isHydrated) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingTitle}>Loading offline learner state...</Text>
          <Text style={styles.loadingBody}>Bringing back your unlocked chapters, streak, and best scores.</Text>
        </View>
      </View>
    );
  }

  if (activeSession) {
    const bundle = getBundleByUnitId(activeSession.unitId);

    if (!bundle) {
      void clearSession();
      return null;
    }

    return (
      <SessionScreen
        activeSession={activeSession}
        bundle={bundle}
        feedback={feedback}
        onAnswer={handleAnswer}
        onCompletePracticeTask={handleCompletePracticeTask}
        onRevealReview={() => updateSession({ ...activeSession, reviewRevealed: true })}
        onReviewSelfCheck={handleReviewSelfCheck}
        onFinishSession={() => {
          setFeedback(null);
          void clearSession();
        }}
      />
    );
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Offline-first Kyrgyz Starter</Text>
          <Text style={styles.title}>Build script confidence, then speak.</Text>
          <Text style={styles.subtitle}>
            The course now opens with the alphabet and sound system, then moves into greetings with points, correct-answer streaks, and saved high scores.
          </Text>
          <View style={styles.heroStatsRow}>
            <StatPill label="Total points" value={String(profile.totalPoints)} />
            <StatPill label="Current streak" value={String(profile.currentCorrectAnswerStreak)} />
            <StatPill label="Longest streak" value={String(profile.longestCorrectAnswerStreak)} />
          </View>
          <View style={styles.heroStatsRow}>
            <StatPill label="Best global" value={String(profile.highScores.bestGlobalTotalPoints)} />
            <StatPill label="Units cleared" value={`${profile.completedUnitIds.length}/${bundles.length}`} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course path</Text>
          {bundles.map((bundle) => {
            const unlocked = isUnitUnlocked(bundle.unit.unlocksAfterUnitId, profile.completedUnitIds);
            const unitProgress = profile.unitProgress[bundle.unit.id];

            return (
              <View key={bundle.unit.id} style={[styles.unitCard, !unlocked && styles.lockedCard]}>
                <View style={styles.unitHeaderRow}>
                  <View>
                    <Text style={styles.unitSequence}>Chapter {bundle.unit.sequenceNumber ?? "-"}</Text>
                    <Text style={styles.unitTitle}>{bundle.unit.title}</Text>
                  </View>
                  <Text style={[styles.unitBadge, unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                    {unlocked ? "Unlocked" : "Locked"}
                  </Text>
                </View>

                <Text style={styles.unitGoal}>{bundle.unit.communicationGoal}</Text>
                <Text style={styles.unitFocusLabel}>Pronunciation focus</Text>
                <Text style={styles.unitFocusBody}>{(bundle.unit.pronunciationFocus ?? []).join(" | ")}</Text>

                <View style={styles.scoreboardRow}>
                  <ScoreChip label="Best run" value={String(profile.highScores.bestLessonRunScores[bundle.unit.id] ?? 0)} />
                  <ScoreChip label="Unit total" value={String(unitProgress?.totalPoints ?? 0)} />
                  <ScoreChip label="Best unit total" value={String(profile.highScores.bestUnitTotals[bundle.unit.id] ?? 0)} />
                </View>

                <Pressable
                  accessibilityRole="button"
                  disabled={!unlocked}
                  onPress={() => {
                    setFeedback(null);
                    void startUnit(bundle.unit.id);
                  }}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    !unlocked && styles.disabledButton,
                    pressed && unlocked && styles.primaryButtonPressed
                  ]}
                >
                  <Text style={styles.primaryButtonText}>{unitProgress ? "Replay chapter" : "Start chapter"}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  function handleAnswer(prompt: MachineCheckedPrompt, choice: string) {
    if (!activeSession) {
      return;
    }

    const result = applyAnswerEvaluation(activeSession.run, { isCorrect: choice === prompt.correctAnswer });
    setFeedback(
      result.outcome.pointsAwarded > 0
        ? `Correct +${result.outcome.pointsAwarded} points` 
        : "Missed that one. Streak reset."
    );
    void updateSession(advanceAfterTaskPrompt(activeSession, bundleFromSession(activeSession), result.run));
  }

  function handleCompletePracticeTask() {
    if (!activeSession) {
      return;
    }

    setFeedback("Practice step completed.");
    void updateSession(advanceToNextTask(activeSession));
  }

  function handleReviewSelfCheck(isCorrect: boolean) {
    if (!activeSession) {
      return;
    }

    const result = applyAnswerEvaluation(activeSession.run, { isCorrect });
    setFeedback(isCorrect ? `Review held. +${result.outcome.pointsAwarded} points` : "Marked for another repetition.");
    void advanceReview(activeSession, result.run);
  }

  async function advanceReview(session: PersistedSession, run: PersistedSession["run"]) {
    const bundle = bundleFromSession(session);

    if (session.reviewIndex + 1 < bundle.reviewSeeds.length) {
      await updateSession({
        ...session,
        phase: "review",
        reviewIndex: session.reviewIndex + 1,
        reviewRevealed: false,
        run
      });
      return;
    }

    const summary = await finalizeRun(run);
    await updateSession({
      ...session,
      phase: "summary",
      reviewRevealed: false,
      run,
      summary
    });
  }

  async function updateSession(nextSession: PersistedSession) {
    await saveSession(nextSession);
  }

  function bundleFromSession(session: PersistedSession): CourseBundle {
    return getBundleByUnitId(session.unitId) ?? bundles[0];
  }
}

function SessionScreen({
  activeSession,
  bundle,
  feedback,
  onAnswer,
  onCompletePracticeTask,
  onRevealReview,
  onReviewSelfCheck,
  onFinishSession
}: {
  activeSession: PersistedSession;
  bundle: CourseBundle;
  feedback: string | null;
  onAnswer: (prompt: MachineCheckedPrompt, choice: string) => void;
  onCompletePracticeTask: () => void;
  onRevealReview: () => void;
  onReviewSelfCheck: (isCorrect: boolean) => void;
  onFinishSession: () => void;
}) {
  const currentTask = bundle.tasks[activeSession.taskIndex];
  const prompts = currentTask ? buildMachineCheckedPrompts(currentTask) : [];
  const currentPrompt = prompts[activeSession.promptIndex];
  const reviewSeed = bundle.reviewSeeds[activeSession.reviewIndex];

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.sessionHero}>
          <Text style={styles.eyebrow}>{bundle.unit.title}</Text>
          <Text style={styles.sessionTitle}>
            {activeSession.phase === "task" ? `Task ${activeSession.taskIndex + 1} of ${bundle.tasks.length}` : activeSession.phase === "review" ? `Review ${activeSession.reviewIndex + 1} of ${bundle.reviewSeeds.length}` : "Run summary"}
          </Text>
          <Text style={styles.sessionSubtitle}>{bundle.unit.communicationGoal}</Text>

          <View style={styles.heroStatsRow}>
            <StatPill label="Run points" value={String(activeSession.run.score)} />
            <StatPill label="Live streak" value={String(activeSession.run.currentCorrectAnswerStreak)} />
            <StatPill label="Best in run" value={String(activeSession.run.longestCorrectAnswerStreak)} />
          </View>

          {feedback ? <Text style={styles.feedbackBanner}>{feedback}</Text> : null}
        </View>

        {activeSession.phase === "task" && currentTask ? (
          <>
            <TaskCard task={currentTask} />
            <SupportCards cards={currentTask.supportCards ?? []} />
            {currentPrompt ? (
              <PromptCard prompt={currentPrompt} onAnswer={onAnswer} />
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Guided practice step</Text>
                <Text style={styles.cardBody}>{currentTask.instructions}</Text>
                <Pressable onPress={onCompletePracticeTask} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
                  <Text style={styles.primaryButtonText}>Mark practice complete</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : null}

        {activeSession.phase === "review" && reviewSeed ? (
          <View style={styles.card}>
            <Text style={styles.taskLabel}>Spaced retrieval</Text>
            <Text style={styles.cardTitle}>{reviewSeed.prompt}</Text>
            {activeSession.reviewRevealed ? (
              <>
                <Text style={styles.answerLine}>Answer: {getReviewAnswer(reviewSeed)}</Text>
                <View style={styles.choiceColumn}>
                  <Pressable onPress={() => onReviewSelfCheck(true)} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
                    <Text style={styles.primaryButtonText}>I got it</Text>
                  </Pressable>
                  <Pressable onPress={() => onReviewSelfCheck(false)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}>
                    <Text style={styles.secondaryButtonText}>Need another rep</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Pressable onPress={onRevealReview} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
                <Text style={styles.primaryButtonText}>Reveal answer</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {activeSession.phase === "summary" && activeSession.summary ? (
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Chapter complete</Text>
            <Text style={styles.summaryLead}>You finished {bundle.unit.title}.</Text>
            <View style={styles.scoreboardRow}>
              <ScoreChip label="Run score" value={String(activeSession.summary.scoreAwarded)} />
              <ScoreChip label="Best run" value={String(activeSession.summary.bestLessonRunScore)} />
              <ScoreChip label="Unit total" value={String(activeSession.summary.unitTotalPoints)} />
            </View>
            <View style={styles.scoreboardRow}>
              <ScoreChip label="Best unit total" value={String(activeSession.summary.bestUnitTotal)} />
              <ScoreChip label="Best global" value={String(activeSession.summary.bestGlobalTotalPoints)} />
            </View>
            <Pressable onPress={onFinishSession} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
              <Text style={styles.primaryButtonText}>Back to course path</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function TaskCard({ task }: { task: TaskDefinition }) {
  return (
    <View style={styles.taskCard}>
      <Text style={styles.taskLabel}>{getTaskKindLabel(task.kind)}</Text>
      <Text style={styles.cardTitle}>{task.objective}</Text>
      <Text style={styles.cardBody}>{task.instructions}</Text>
      <Text style={styles.taskSubheading}>Success criteria</Text>
      {task.successCriteria.map((criterion) => (
        <Text key={criterion} style={styles.criteriaLine}>
          • {criterion}
        </Text>
      ))}
    </View>
  );
}

function SupportCards({ cards }: { cards: TaskSupportCard[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Always-on support</Text>
      {cards.map((card) => (
        <View key={card.id} style={styles.supportCard}>
          <Text style={styles.supportKind}>{card.kind}</Text>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardBody}>{card.body}</Text>
        </View>
      ))}
    </View>
  );
}

function PromptCard({ prompt, onAnswer }: { prompt: MachineCheckedPrompt; onAnswer: (prompt: MachineCheckedPrompt, choice: string) => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.taskLabel}>Scored prompt</Text>
      <Text style={styles.cardTitle}>{prompt.prompt}</Text>
      {prompt.stimulus ? <Text style={styles.kyrgyzLine}>{prompt.stimulus}</Text> : null}
      {prompt.sublabel ? <Text style={styles.transliteration}>{prompt.sublabel}</Text> : null}
      <View style={styles.choiceColumn}>
        {prompt.choices.map((choice) => (
          <Pressable key={choice} onPress={() => onAnswer(prompt, choice)} style={({ pressed }) => [styles.choiceButton, pressed && styles.choiceButtonPressed]}>
            <Text style={styles.choiceButtonText}>{choice}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ScoreChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.scoreChip}>
      <Text style={styles.scoreChipLabel}>{label}</Text>
      <Text style={styles.scoreChipValue}>{value}</Text>
    </View>
  );
}

function advanceAfterTaskPrompt(session: PersistedSession, bundle: CourseBundle, run: PersistedSession["run"]): PersistedSession {
  const currentTask = bundle.tasks[session.taskIndex];
  const currentPrompts = currentTask ? buildMachineCheckedPrompts(currentTask) : [];

  if (session.promptIndex + 1 < currentPrompts.length) {
    return {
      ...session,
      run,
      promptIndex: session.promptIndex + 1
    };
  }

  return advanceToNextTask({
    ...session,
    run
  });
}

function advanceToNextTask(session: PersistedSession): PersistedSession {
  const bundle = getBundleByUnitId(session.unitId);

  if (!bundle) {
    return session;
  }

  if (session.taskIndex + 1 < bundle.tasks.length) {
    return {
      ...session,
      taskIndex: session.taskIndex + 1,
      promptIndex: 0,
      phase: "task"
    };
  }

  return {
    ...session,
    phase: "review",
    reviewIndex: 0,
    reviewRevealed: false,
    promptIndex: 0
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6efe1"
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 56,
    gap: 24
  },
  loadingWrap: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 10
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2a1f"
  },
  loadingBody: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5f5444"
  },
  hero: {
    backgroundColor: "#203a2f",
    borderRadius: 28,
    padding: 24,
    gap: 14,
    shadowColor: "#1c150f",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10
    }
  },
  sessionHero: {
    backgroundColor: "#9ec1a3",
    borderRadius: 28,
    padding: 24,
    gap: 14
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#d8e6d2"
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    color: "#fff8ee"
  },
  sessionTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#132119"
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#e8eddc"
  },
  sessionSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#203126"
  },
  heroStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  statPill: {
    minWidth: 108,
    backgroundColor: "rgba(255, 248, 238, 0.12)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4
  },
  statLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#d5e2d1"
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff8ee"
  },
  section: {
    gap: 14
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1f2a1f"
  },
  unitCard: {
    backgroundColor: "#fff9f1",
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#eadcc6"
  },
  lockedCard: {
    opacity: 0.64
  },
  unitHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  unitSequence: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: "#896d4e"
  },
  unitTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1c2a1f"
  },
  unitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700"
  },
  badgeUnlocked: {
    backgroundColor: "#d8ecd6",
    color: "#2b6035"
  },
  badgeLocked: {
    backgroundColor: "#f1e0cf",
    color: "#8a6547"
  },
  unitGoal: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4f463b"
  },
  unitFocusLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#84694d"
  },
  unitFocusBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#5f5444"
  },
  scoreboardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  scoreChip: {
    backgroundColor: "#f2eadf",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 96,
    gap: 2
  },
  scoreChipLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#7a6b59"
  },
  scoreChipValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2a1f"
  },
  primaryButton: {
    backgroundColor: "#ca5d2e",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center"
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff7ef"
  },
  secondaryButton: {
    backgroundColor: "#efe3d0",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center"
  },
  secondaryButtonPressed: {
    opacity: 0.92
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#654a31"
  },
  disabledButton: {
    backgroundColor: "#c2b6a9"
  },
  feedbackBanner: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17321f"
  },
  card: {
    backgroundColor: "#fffaf2",
    borderRadius: 24,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#ece0ce"
  },
  taskCard: {
    backgroundColor: "#1f2d27",
    borderRadius: 24,
    padding: 20,
    gap: 8
  },
  summaryCard: {
    backgroundColor: "#fff2d8",
    borderRadius: 24,
    padding: 22,
    gap: 14
  },
  supportCard: {
    backgroundColor: "#f4ecde",
    borderRadius: 20,
    padding: 18,
    gap: 8
  },
  kyrgyzLine: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1f2a1f"
  },
  transliteration: {
    fontSize: 16,
    color: "#7c6d58"
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2a1f"
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 23,
    color: "#5b5145"
  },
  taskLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#d9c7ab"
  },
  taskSubheading: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#d9c7ab",
    marginTop: 4
  },
  criteriaLine: {
    fontSize: 15,
    lineHeight: 22,
    color: "#ece0ce"
  },
  supportKind: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#8b6944"
  },
  choiceColumn: {
    gap: 10,
    marginTop: 8
  },
  choiceButton: {
    backgroundColor: "#f1e3cf",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  choiceButtonPressed: {
    backgroundColor: "#e7d4b7"
  },
  choiceButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3b2f21"
  },
  answerLine: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#42382d"
  },
  summaryLead: {
    fontSize: 18,
    lineHeight: 26,
    color: "#3f3427"
  }
});