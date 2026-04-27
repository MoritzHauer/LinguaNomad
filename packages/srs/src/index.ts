export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface ReviewState {
  dueAt: string;
  intervalDays: number;
  reviewCount: number;
  lapseCount: number;
  lastReviewedAt?: string;
}

const NEXT_INTERVALS: Record<ReviewRating, number> = {
  again: 0,
  hard: 1,
  good: 3,
  easy: 7
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function createInitialReviewState(now = new Date()): ReviewState {
  return {
    dueAt: now.toISOString(),
    intervalDays: 0,
    reviewCount: 0,
    lapseCount: 0
  };
}

export function scheduleNextReview(
  state: ReviewState,
  rating: ReviewRating,
  now = new Date()
): ReviewState {
  const baseInterval = NEXT_INTERVALS[rating];
  const intervalDays =
    rating === "again"
      ? 0
      : Math.max(baseInterval, Math.ceil(state.intervalDays * growthFactorFor(rating)));

  return {
    dueAt: addDays(now, intervalDays).toISOString(),
    intervalDays,
    reviewCount: state.reviewCount + 1,
    lapseCount: rating === "again" ? state.lapseCount + 1 : state.lapseCount,
    lastReviewedAt: now.toISOString()
  };
}

function growthFactorFor(rating: ReviewRating): number {
  switch (rating) {
    case "again":
      return 0;
    case "hard":
      return 1.2;
    case "good":
      return 2.0;
    case "easy":
      return 3.0;
  }
}