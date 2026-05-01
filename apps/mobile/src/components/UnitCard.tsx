import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';

export type UnitState = 'completed' | 'active' | 'upcoming' | 'locked';

export interface UnitCardProps extends Omit<PressableProps, 'style'> {
  unitNumber: number;
  title: string;
  communicationGoal: string;
  itemCount: number;
  taskCount: number;
  /** 0–100 */
  progressPercent?: number;
  state: UnitState;
  style?: StyleProp<ViewStyle>;
}

export function UnitCard({
  unitNumber,
  title,
  communicationGoal,
  itemCount,
  taskCount,
  progressPercent = 0,
  state,
  style,
  onPress,
  ...rest
}: UnitCardProps) {
  const isInteractive = state === 'active' || state === 'completed';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!isInteractive}
      onPress={isInteractive ? onPress : undefined}
      style={({ pressed }) => [
        styles.card,
        state === 'active' && styles.cardActive,
        state === 'completed' && styles.cardCompleted,
        state === 'locked' && styles.cardLocked,
        pressed && isInteractive && styles.cardPressed,
        style,
      ]}
      {...rest}
    >
      {/* Top accent bar for active unit */}
      {state === 'active' && <View style={styles.activeBar} />}

      <View style={styles.row}>
        {/* Unit number badge */}
        <View style={[styles.badge, badgeStyleFor(state)]}>
          {state === 'completed' ? (
            <Text style={[styles.badgeCheck, styles.badgeTextCompleted]}>✓</Text>
          ) : state === 'locked' ? (
            <Text style={styles.badgeTextLocked}>{unitNumber}</Text>
          ) : (
            <Text style={[styles.badgeNum, state === 'active' ? styles.badgeTextActive : styles.badgeTextUpcoming]}>
              {unitNumber}
            </Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.goal} numberOfLines={1}>
            {communicationGoal}
          </Text>

          {/* Meta chips */}
          <View style={styles.metaRow}>
            {state === 'completed' && (
              <View style={[styles.chip, styles.chipSuccess]}>
                <Text style={[styles.chipText, styles.chipTextSuccess]}>✓ Complete</Text>
              </View>
            )}
            {state === 'active' && (
              <View style={[styles.chip, styles.chipAccent]}>
                <Text style={[styles.chipText, styles.chipTextAccent]}>In progress</Text>
              </View>
            )}
            {state === 'upcoming' && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{`Unlocks after Unit ${unitNumber - 1}`}</Text>
              </View>
            )}
            <View style={styles.chip}>
              <Text style={styles.chipText}>{itemCount} items</Text>
            </View>
            {taskCount > 0 && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{taskCount} {taskCount === 1 ? 'task' : 'tasks'}</Text>
              </View>
            )}
          </View>

          {/* Progress bar for active unit */}
          {state === 'active' && progressPercent > 0 && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` as `${number}%` }]} />
            </View>
          )}
        </View>

        {/* Lock icon */}
        {state === 'locked' && (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
      </View>
    </Pressable>
  );
}

function badgeStyleFor(state: UnitState): StyleProp<ViewStyle> {
  switch (state) {
    case 'completed': return styles.badgeCompleted;
    case 'active': return styles.badgeActive;
    case 'upcoming': return styles.badgeUpcoming;
    case 'locked': return styles.badgeLocked;
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  cardActive: {
    borderColor: 'rgba(99,102,241,0.4)',
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  cardCompleted: {
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  cardLocked: {
    opacity: 0.45,
  },
  cardPressed: {
    opacity: 0.85,
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeCompleted: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  badgeActive: {
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  badgeUpcoming: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  badgeLocked: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  badgeCheck: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  badgeNum: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  badgeTextCompleted: {
    color: colors.success,
  },
  badgeTextActive: {
    color: colors.accentSoft,
  },
  badgeTextUpcoming: {
    color: '#5050a0',
  },
  badgeTextLocked: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    color: '#3a3a60',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e2f0',
    marginBottom: 2,
  },
  goal: {
    fontSize: 12,
    color: '#7070a0',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipSuccess: {
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  chipAccent: {
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  chipText: {
    fontSize: 11,
    color: '#5a5a90',
  },
  chipTextSuccess: {
    color: colors.success,
  },
  chipTextAccent: {
    color: colors.accentSoft,
  },
  progressTrack: {
    marginTop: 8,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 100,
  },
  lockIcon: {
    fontSize: 18,
    flexShrink: 0,
  },
});
