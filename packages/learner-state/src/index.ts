export interface ScoringRules {
  correctAnswerPoints: number;
  retryCorrectAnswerPoints: number;
  incorrectAnswerPenalty: number;
  streakBonusStep: number;
  maxStreakBonus: number;
  perfectLessonBonus: number;
}

export interface LearnerHighScores {
  bestLessonRunScores: Record<string, number>;
  bestUnitTotals: Record<string, number>;
  bestGlobalTotalPoints: number;
}

export interface UnitProgress {
  totalPoints: number;
  completedRuns: number;
  bestLessonRunScore: number;
  lastCompletedAt?: string;
}

export interface LearnerProfile {
  totalPoints: number;
  currentCorrectAnswerStreak: number;
  longestCorrectAnswerStreak: number;
  completedUnitIds: string[];
  unitProgress: Record<string, UnitProgress>;
  highScores: LearnerHighScores;
}

export interface LessonRunState {
  unitId: string;
  score: number;
  answeredPrompts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentCorrectAnswerStreak: number;
  longestCorrectAnswerStreak: number;
  hadRetryCorrectAnswer: boolean;
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  usedRetry?: boolean;
}

export interface AnswerOutcome {
  pointsAwarded: number;
  streakAfterAnswer: number;
  longestStreakAfterAnswer: number;
}

export interface LessonCompletionSummary {
  scoreAwarded: number;
  unitTotalPoints: number;
  bestLessonRunScore: number;
  bestUnitTotal: number;
  bestGlobalTotalPoints: number;
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  correctAnswerPoints: 12,
  retryCorrectAnswerPoints: 8,
  incorrectAnswerPenalty: 0,
  streakBonusStep: 2,
  maxStreakBonus: 10,
  perfectLessonBonus: 10
};

export function createInitialLearnerProfile(): LearnerProfile {
  return {
    totalPoints: 0,
    currentCorrectAnswerStreak: 0,
    longestCorrectAnswerStreak: 0,
    completedUnitIds: [],
    unitProgress: {},
    highScores: {
      bestLessonRunScores: {},
      bestUnitTotals: {},
      bestGlobalTotalPoints: 0
    }
  };
}

export function createLessonRunState(
  unitId: string,
  startingStreak = 0
): LessonRunState {
  return {
    unitId,
    score: 0,
    answeredPrompts: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    currentCorrectAnswerStreak: startingStreak,
    longestCorrectAnswerStreak: startingStreak,
    hadRetryCorrectAnswer: false
  };
}

export function applyAnswerEvaluation(
  run: LessonRunState,
  evaluation: AnswerEvaluation,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): {
  run: LessonRunState;
  outcome: AnswerOutcome;
} {
  const nextStreak = evaluation.isCorrect ? run.currentCorrectAnswerStreak + 1 : 0;
  const nextLongest = Math.max(run.longestCorrectAnswerStreak, nextStreak);
  const basePoints = evaluation.isCorrect
    ? evaluation.usedRetry
      ? rules.retryCorrectAnswerPoints
      : rules.correctAnswerPoints
    : 0;
  const streakBonus = evaluation.isCorrect
    ? Math.min(
        Math.max(nextStreak - 1, 0) * rules.streakBonusStep,
        rules.maxStreakBonus
      )
    : 0;
  const pointsAwarded = Math.max(basePoints + streakBonus - rules.incorrectAnswerPenalty, 0);

  return {
    run: {
      ...run,
      score: run.score + pointsAwarded,
      answeredPrompts: run.answeredPrompts + 1,
      correctAnswers: run.correctAnswers + (evaluation.isCorrect ? 1 : 0),
      incorrectAnswers: run.incorrectAnswers + (evaluation.isCorrect ? 0 : 1),
      currentCorrectAnswerStreak: nextStreak,
      longestCorrectAnswerStreak: nextLongest,
      hadRetryCorrectAnswer: run.hadRetryCorrectAnswer || Boolean(evaluation.usedRetry)
    },
    outcome: {
      pointsAwarded,
      streakAfterAnswer: nextStreak,
      longestStreakAfterAnswer: nextLongest
    }
  };
}

export function completeLessonRun(
  profile: LearnerProfile,
  run: LessonRunState,
  completedAt = new Date().toISOString(),
  rules: ScoringRules = DEFAULT_SCORING_RULES
): {
  profile: LearnerProfile;
  summary: LessonCompletionSummary;
} {
  const perfectBonus =
    run.answeredPrompts > 0 && run.incorrectAnswers === 0 && !run.hadRetryCorrectAnswer
      ? rules.perfectLessonBonus
      : 0;
  const awardedScore = run.score + perfectBonus;
  const previousUnitProgress = profile.unitProgress[run.unitId] ?? {
    totalPoints: 0,
    completedRuns: 0,
    bestLessonRunScore: 0
  };
  const unitTotalPoints = previousUnitProgress.totalPoints + awardedScore;
  const bestLessonRunScore = Math.max(previousUnitProgress.bestLessonRunScore, awardedScore);
  const nextTotalPoints = profile.totalPoints + awardedScore;
  const completedUnitIds = profile.completedUnitIds.includes(run.unitId)
    ? profile.completedUnitIds
    : [...profile.completedUnitIds, run.unitId];

  return {
    profile: {
      ...profile,
      totalPoints: nextTotalPoints,
      currentCorrectAnswerStreak: run.currentCorrectAnswerStreak,
      longestCorrectAnswerStreak: Math.max(
        profile.longestCorrectAnswerStreak,
        run.longestCorrectAnswerStreak
      ),
      completedUnitIds,
      unitProgress: {
        ...profile.unitProgress,
        [run.unitId]: {
          totalPoints: unitTotalPoints,
          completedRuns: previousUnitProgress.completedRuns + 1,
          bestLessonRunScore,
          lastCompletedAt: completedAt
        }
      },
      highScores: {
        bestLessonRunScores: {
          ...profile.highScores.bestLessonRunScores,
          [run.unitId]: Math.max(profile.highScores.bestLessonRunScores[run.unitId] ?? 0, awardedScore)
        },
        bestUnitTotals: {
          ...profile.highScores.bestUnitTotals,
          [run.unitId]: Math.max(profile.highScores.bestUnitTotals[run.unitId] ?? 0, unitTotalPoints)
        },
        bestGlobalTotalPoints: Math.max(profile.highScores.bestGlobalTotalPoints, nextTotalPoints)
      }
    },
    summary: {
      scoreAwarded: awardedScore,
      unitTotalPoints,
      bestLessonRunScore,
      bestUnitTotal: Math.max(profile.highScores.bestUnitTotals[run.unitId] ?? 0, unitTotalPoints),
      bestGlobalTotalPoints: Math.max(profile.highScores.bestGlobalTotalPoints, nextTotalPoints)
    }
  };
}

export function isUnitUnlocked(
  unlocksAfterUnitId: string | undefined,
  completedUnitIds: string[]
): boolean {
  if (!unlocksAfterUnitId) {
    return true;
  }

  return completedUnitIds.includes(unlocksAfterUnitId);
}