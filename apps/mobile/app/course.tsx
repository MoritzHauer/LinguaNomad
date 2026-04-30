import { isUnitUnlocked } from '@linguanomad/learner-state';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getCourseBundles } from '../lib/course-data';
import { useLearnerProgress } from '../lib/learner-progress';
import { UnitCard, type UnitState } from '../src/components/UnitCard';
import { colors } from '../src/theme/colors';

interface CourseUnitMeta {
  id: string;
  sequenceNumber: number;
  title: string;
  communicationGoal: string;
  lexemeCount: number;
  taskCount: number;
  unlocksAfterUnitId: string | undefined;
}

// Derive unit list from course bundles — single source of truth
const ALL_UNITS: CourseUnitMeta[] = getCourseBundles()
  .map((b) => ({
    id: b.unit.id,
    sequenceNumber: b.unit.sequenceNumber ?? 0,
    title: b.unit.title,
    communicationGoal: b.unit.communicationGoal,
    lexemeCount: b.lexemes.length,
    taskCount: b.tasks.length,
    unlocksAfterUnitId: b.unit.unlocksAfterUnitId,
  }))
  .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

// All units are now backed by content
const ACTIVE_UNIT_IDS = new Set(ALL_UNITS.map((u) => u.id));

export default function CourseScreen() {
  const router = useRouter();
  const { profile, isHydrated } = useLearnerProgress();

  const completedUnitIds = profile.completedUnitIds;

  const { overallPercent, currentUnitLabel } = useMemo(() => {
    const completedCount = completedUnitIds.length;
    const totalCount = ALL_UNITS.length;
    const pct = Math.round((completedCount / totalCount) * 100);

    // Find the first non-completed unlocked unit
    const activeUnit = ALL_UNITS.find(
      (u) =>
        !completedUnitIds.includes(u.id) &&
        isUnitUnlocked(u.unlocksAfterUnitId, completedUnitIds)
    );
    const label = activeUnit
      ? `Unit ${activeUnit.sequenceNumber} in progress`
      : completedCount === totalCount
      ? 'Course complete!'
      : 'Get started';

    return { overallPercent: pct, currentUnitLabel: label };
  }, [completedUnitIds]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your progress…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Go back"
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.courseLabel}>🇰🇬 Kyrgyz · Beginner</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.iconBtn}><Text style={styles.iconBtnText}>⬇️</Text></View>
            <View style={styles.iconBtn}><Text style={styles.iconBtnText}>⚙️</Text></View>
          </View>
        </View>
        <Text style={styles.courseTitle}>Kyrgyz Starter Path</Text>
        <Text style={styles.courseSubtitle}>
          {ALL_UNITS.length} units · Script, phrases, grammar foundations
        </Text>
      </View>

      {/* Overall progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${overallPercent}%` as `${number}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          <Text style={styles.progressLabelAccent}>{currentUnitLabel}</Text>
          {` · ${overallPercent}% complete`}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Units</Text>

      {/* Unit list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.unitList}
        showsVerticalScrollIndicator={false}
      >
        {ALL_UNITS.map((unit) => {
          const isCompleted = completedUnitIds.includes(unit.id);
          const unlocked = isUnitUnlocked(unit.unlocksAfterUnitId, completedUnitIds);
          const isActive = ACTIVE_UNIT_IDS.has(unit.id) && !isCompleted && unlocked;

          let unitState: UnitState;
          if (isCompleted) {
            unitState = 'completed';
          } else if (unlocked && isActive) {
            unitState = 'active';
          } else if (unlocked) {
            unitState = 'upcoming';
          } else {
            unitState = 'locked';
          }

          // Progress within active unit (from unit-level progress data)
          const unitProgress = profile.unitProgress[unit.id];
          const progressPercent = unitProgress
            ? Math.round((unitProgress.totalPoints / Math.max(unitProgress.totalPoints + 10, 50)) * 100)
            : 0;

          return (
            <UnitCard
              key={unit.id}
              unitNumber={unit.sequenceNumber}
              title={unit.title}
              communicationGoal={unit.communicationGoal}
              itemCount={unit.lexemeCount}
              taskCount={unit.taskCount}
              progressPercent={isActive ? progressPercent : 0}
              state={unitState}
              onPress={() => {
                if (unitState === 'active' || unitState === 'completed') {
                  router.push(`/lesson/${unit.id}`);
                }
              }}
            />
          );
        })}
        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <View style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIcon}>📚</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Learn</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🔁</Text>
          <Text style={styles.navLabel}>Review</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Progress</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backIcon: {
    fontSize: 20,
    color: colors.accentSoft,
    fontWeight: '600',
  },
  courseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 15,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 13,
    color: '#7070a0',
  },
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 0,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 100,
  },
  progressLabel: {
    paddingTop: 6,
    paddingBottom: 12,
    fontSize: 12,
    color: '#5050a0',
  },
  progressLabelAccent: {
    color: colors.accentSoft,
  },
  sectionLabel: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 4,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#404060',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  unitList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 16,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navItemActive: {},
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    color: '#4040a0',
  },
  navLabelActive: {
    color: colors.accentSoft,
  },
});
