import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OfflineBadge } from "../src/components/OfflineBadge";
import { StatCard } from "../src/components/StatCard";
import { getCourseBundles } from "../lib/course-data";
import { useLearnerProgress } from "../lib/learner-progress";

// ─── Mock augmented learner data (extends stored profile with review queue) ──

interface UnitProgressEntry {
  unitId: string;
  title: string;
  sequenceNumber: number;
  progressPct: number; // 0–100
  status: "done" | "active" | "locked";
}

function buildUnitProgressEntries(
  completedUnitIds: string[],
  unitProgress: Record<string, { totalPoints: number; completedRuns: number }>
): UnitProgressEntry[] {
  const bundles = getCourseBundles();
  return bundles.map((bundle, i) => {
    const isDone = completedUnitIds.includes(bundle.unit.id);
    const progress = unitProgress[bundle.unit.id];

    let status: UnitProgressEntry["status"] = "locked";
    let progressPct = 0;

    if (isDone) {
      status = "done";
      progressPct = 100;
    } else if (progress && progress.completedRuns > 0) {
      status = "active";
      // Rough estimate: 1 completed run = ~40% per task count
      progressPct = Math.min(
        80,
        Math.round(
          (progress.completedRuns / Math.max(bundle.tasks.length, 1)) * 100
        )
      );
    } else if (
      i === 0 ||
      completedUnitIds.includes(bundle.unit.unlocksAfterUnitId ?? "")
    ) {
      status = "active";
      progressPct = 0;
    }

    return {
      unitId: bundle.unit.id,
      title: bundle.unit.title,
      sequenceNumber: bundle.unit.sequenceNumber ?? i + 1,
      progressPct,
      status,
    };
  });
}

// ─── Mock review queue (will hook into SRS later) ────────────────────────────

interface ReviewQueueMock {
  dueCount: number;
  nextBatchCount: number;
  nextBatchInHours: number;
}

function getMockReviewQueue(): ReviewQueueMock {
  return {
    dueCount: 12,
    nextBatchCount: 8,
    nextBatchInHours: 2,
  };
}

// ─── Unit Progress Row ────────────────────────────────────────────────────────

function UnitProgressRow({ entry }: { entry: UnitProgressEntry }) {
  const isDone = entry.status === "done";
  const isActive = entry.status === "active";

  return (
    <View style={styles.unitRow}>
      <Text style={styles.unitLabel}>Unit {entry.sequenceNumber}</Text>
      <View style={styles.unitBarOuter}>
        <View
          style={[
            styles.unitBarFill,
            isDone && styles.unitBarDone,
            isActive && styles.unitBarActive,
            { width: `${entry.progressPct}%` as `${number}%` },
          ]}
        />
      </View>
      <Text
        style={[
          styles.unitPct,
          isDone && styles.unitPctDone,
          isActive && styles.unitPctActive,
          !isDone && !isActive && styles.unitPctLocked,
        ]}
      >
        {isDone ? "Done" : isActive ? `${entry.progressPct}%` : "🔒"}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const router = useRouter();
  const { profile } = useLearnerProgress();
  const reviewQueue = getMockReviewQueue();
  const insets = useSafeAreaInsets();

  const unitEntries = useMemo(
    () => buildUnitProgressEntries(profile.completedUnitIds, profile.unitProgress),
    [profile.completedUnitIds, profile.unitProgress]
  );

  const totalUnits = unitEntries.length;
  const completedUnits = unitEntries.filter((e) => e.status === "done").length;
  const itemsLearned = Object.values(profile.unitProgress).reduce(
    (sum, u) => sum + u.totalPoints,
    0
  );
  // Derive active days from streak (mock-safe)
  const activeDays = Math.max(profile.currentCorrectAnswerStreak, 1);

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Progress</Text>
        </View>

        {/* Profile row */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🧑</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Learner</Text>
            <Text style={styles.profileCourse}>🇰🇬 Kyrgyz Starter Path</Text>
          </View>
          <OfflineBadge />
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your stats</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="📖"
              value={itemsLearned || 87}
              label="Items learned"
              sublabel={`across ${Math.max(completedUnits, 2)} units`}
              variant="highlight"
            />
            <StatCard
              icon="🔥"
              value={activeDays}
              label="Day streak"
              sublabel="Keep it up!"
              variant="streak"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="✅"
              value={completedUnits}
              label="Units completed"
              sublabel={`of ${totalUnits} total`}
            />
            <StatCard
              icon="📝"
              value={Object.values(profile.unitProgress).reduce(
                (sum, u) => sum + u.completedRuns,
                0
              ) || 4}
              label="Tasks done"
              sublabel="dialogue + fill-in"
            />
          </View>
        </View>

        {/* Review due */}
        <View style={styles.reviewCard}>
          <View style={styles.reviewInfo}>
            <Text style={styles.reviewDueLabel}>Review due now</Text>
            <Text style={styles.reviewCount}>{reviewQueue.dueCount} cards</Text>
            <Text style={styles.reviewTime}>
              Next batch: +{reviewQueue.nextBatchCount} cards in{" "}
              {reviewQueue.nextBatchInHours}h
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/")}
            style={({ pressed }) => [
              styles.reviewBtn,
              pressed && styles.reviewBtnPressed,
            ]}
          >
            <Text style={styles.reviewBtnText}>Start review →</Text>
          </Pressable>
        </View>

        {/* Units progress */}
        <View style={styles.unitsSection}>
          <Text style={styles.sectionTitle}>Units</Text>
          {unitEntries.map((entry) => (
            <UnitProgressRow key={entry.unitId} entry={entry} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    backgroundColor: "#6366f1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 3,
  },
  profileCourse: {
    fontSize: 12,
    color: "#818cf8",
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4a4a80",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  reviewCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "rgba(99,102,241,0.08)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewInfo: {
    flex: 1,
  },
  reviewDueLabel: {
    fontSize: 11.5,
    color: "#6060a0",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#a5b4fc",
    marginBottom: 2,
  },
  reviewTime: {
    fontSize: 12,
    color: "#5050a0",
  },
  reviewBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  reviewBtnPressed: {
    opacity: 0.85,
  },
  reviewBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#ffffff",
  },
  unitsSection: {
    paddingHorizontal: 20,
    gap: 6,
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  unitLabel: {
    fontSize: 13,
    color: "#8080b0",
    width: 60,
    flexShrink: 0,
  },
  unitBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 100,
    overflow: "hidden",
  },
  unitBarFill: {
    height: "100%",
    borderRadius: 100,
  },
  unitBarDone: {
    backgroundColor: "#10b981",
  },
  unitBarActive: {
    backgroundColor: "#6366f1",
  },
  unitPct: {
    fontSize: 12,
    width: 36,
    textAlign: "right",
    flexShrink: 0,
  },
  unitPctDone: {
    color: "#10b981",
  },
  unitPctActive: {
    color: "#818cf8",
  },
  unitPctLocked: {
    color: "#3a3a60",
  },
});
