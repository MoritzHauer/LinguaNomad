import { isUnitUnlocked } from '@linguanomad/learner-state';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCourseBundles } from '../../lib/course-data';
import { useLearnerProgress } from '../../lib/learner-progress';
import { colors } from '../../src/theme/colors';

interface ReviewUnitSummary {
  id: string;
  title: string;
  sequenceNumber: number;
  reviewSeedCount: number;
  unlocked: boolean;
  completed: boolean;
}

export default function ReviewHomeScreen() {
  const router = useRouter();
  const { isHydrated, profile } = useLearnerProgress();

  const reviewUnits = useMemo<ReviewUnitSummary[]>(() => {
    return getCourseBundles()
      .map((bundle) => {
        const completed = profile.completedUnitIds.includes(bundle.unit.id);

        return {
          id: bundle.unit.id,
          title: bundle.unit.title,
          sequenceNumber: bundle.unit.sequenceNumber ?? 0,
          reviewSeedCount: bundle.reviewSeeds.length,
          unlocked: isUnitUnlocked(bundle.unit.unlocksAfterUnitId, profile.completedUnitIds),
          completed,
        };
      })
      .filter((unit) => unit.unlocked)
      .sort((left, right) => left.sequenceNumber - right.sequenceNumber);
  }, [profile.completedUnitIds]);

  const featuredUnit = reviewUnits.find((unit) => unit.completed) ?? reviewUnits[0];
  const availableCards = reviewUnits.reduce((sum, unit) => {
    if (!unit.completed) {
      return sum;
    }

    return sum + unit.reviewSeedCount;
  }, 0);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your review queue…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Offline review</Text>
          <Text style={styles.title}>Keep Kyrgyz active between lessons</Text>
          <Text style={styles.subtitle}>
            Review is available for units you have already completed. Start with the latest finished unit or revisit any unlocked material.
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{availableCards}</Text>
              <Text style={styles.statLabel}>cards ready</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{reviewUnits.length}</Text>
              <Text style={styles.statLabel}>units unlocked</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!featuredUnit}
            onPress={() => {
              if (featuredUnit) {
                router.push(`/review/${featuredUnit.id}`);
              }
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              !featuredUnit && styles.primaryButtonDisabled,
              pressed && featuredUnit && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {featuredUnit
                ? `Start Unit ${featuredUnit.sequenceNumber} Review`
                : 'Finish your first lesson to unlock review'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Unlocked units</Text>
          <Text style={styles.sectionSubtitle}>Choose a completed unit to review now.</Text>
        </View>

        {reviewUnits.map((unit) => {
          const ctaLabel = unit.completed ? 'Review now' : 'Finish lesson first';

          return (
            <View key={unit.id} style={styles.unitCard}>
              <View style={styles.unitMeta}>
                <Text style={styles.unitBadge}>Unit {unit.sequenceNumber}</Text>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.unitDescription}>
                  {unit.reviewSeedCount} review cards · {unit.completed ? 'ready to practice' : 'locked until completion'}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={!unit.completed}
                onPress={() => router.push(`/review/${unit.id}`)}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  !unit.completed && styles.secondaryButtonDisabled,
                  pressed && unit.completed && styles.secondaryButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    !unit.completed && styles.secondaryButtonTextDisabled,
                  ]}
                >
                  {ctaLabel}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 18,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.2)',
    gap: 14,
  },
  eyebrow: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: colors.border,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    gap: 4,
    paddingTop: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  unitCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  unitMeta: {
    gap: 5,
  },
  unitBadge: {
    color: colors.accentSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  unitTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  unitDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(129,140,248,0.14)',
  },
  secondaryButtonDisabled: {
    backgroundColor: 'rgba(71,85,105,0.28)',
  },
  secondaryButtonPressed: {
    opacity: 0.88,
  },
  secondaryButtonText: {
    color: colors.accentSoft,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButtonTextDisabled: {
    color: colors.textDim,
  },
});