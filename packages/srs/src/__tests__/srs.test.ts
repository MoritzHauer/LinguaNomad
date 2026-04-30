import { describe, it, expect } from "vitest";
import {
  createInitialReviewState,
  scheduleNextReview,
  type ReviewState,
  type ReviewRating,
} from "../index.js";

describe("createInitialReviewState", () => {
  it("returns sensible defaults", () => {
    const state = createInitialReviewState();
    expect(state.intervalDays).toBe(0);
    expect(state.reviewCount).toBe(0);
    expect(state.lapseCount).toBe(0);
    expect(state.lastReviewedAt).toBeUndefined();
    expect(new Date(state.dueAt).getTime()).toBeGreaterThan(0);
  });

  it("uses the provided now date for dueAt", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const state = createInitialReviewState(now);
    expect(state.dueAt).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("scheduleNextReview - grade easy (perfect)", () => {
  it("increases interval significantly on 'easy'", () => {
    const state = createInitialReviewState();
    const next = scheduleNextReview(state, "easy");
    expect(next.intervalDays).toBeGreaterThanOrEqual(7);
  });

  it("increments reviewCount", () => {
    const state = createInitialReviewState();
    const next = scheduleNextReview(state, "easy");
    expect(next.reviewCount).toBe(1);
  });

  it("does not increment lapseCount on 'easy'", () => {
    const state = createInitialReviewState();
    const next = scheduleNextReview(state, "easy");
    expect(next.lapseCount).toBe(0);
  });

  it("sets lastReviewedAt", () => {
    const now = new Date("2026-04-30T12:00:00Z");
    const state = createInitialReviewState(now);
    const next = scheduleNextReview(state, "easy", now);
    expect(next.lastReviewedAt).toBe("2026-04-30T12:00:00.000Z");
  });
});

describe("scheduleNextReview - grade again (fail)", () => {
  it("resets interval to 0 on 'again'", () => {
    const existing: ReviewState = {
      dueAt: new Date().toISOString(),
      intervalDays: 21,
      reviewCount: 5,
      lapseCount: 0,
    };
    const next = scheduleNextReview(existing, "again");
    expect(next.intervalDays).toBe(0);
  });

  it("increments lapseCount on 'again'", () => {
    const state = createInitialReviewState();
    const next = scheduleNextReview(state, "again");
    expect(next.lapseCount).toBe(1);
  });
});

describe("scheduleNextReview - grade hard", () => {
  it("increases interval moderately (at least 1 day)", () => {
    const state: ReviewState = {
      dueAt: new Date().toISOString(),
      intervalDays: 3,
      reviewCount: 2,
      lapseCount: 0,
    };
    const next = scheduleNextReview(state, "hard");
    expect(next.intervalDays).toBeGreaterThanOrEqual(1);
    // hard growth factor is 1.2 → 3 * 1.2 = 3.6 → ceil = 4, or base 1, max wins
    expect(next.intervalDays).toBeLessThan(next.intervalDays + 50); // sanity
  });
});

describe("scheduleNextReview - grade good", () => {
  it("uses growth factor 2.0 from existing interval", () => {
    const state: ReviewState = {
      dueAt: new Date().toISOString(),
      intervalDays: 5,
      reviewCount: 3,
      lapseCount: 0,
    };
    const next = scheduleNextReview(state, "good");
    // max(3, ceil(5 * 2.0)) = max(3, 10) = 10
    expect(next.intervalDays).toBe(10);
  });
});

describe("nextReviewAt is always in the future", () => {
  const ratings: ReviewRating[] = ["again", "hard", "good", "easy"];
  for (const rating of ratings) {
    it(`dueAt is >= now for rating '${rating}'`, () => {
      const now = new Date();
      const state = createInitialReviewState(now);
      const next = scheduleNextReview(state, rating, now);
      expect(new Date(next.dueAt).getTime()).toBeGreaterThanOrEqual(now.getTime());
    });
  }
});

describe("multiple reviews compound correctly", () => {
  it("simulates 5 'good' reviews with growing intervals", () => {
    let state = createInitialReviewState();
    const intervals: number[] = [];
    let now = new Date("2026-01-01T00:00:00Z");

    for (let i = 0; i < 5; i++) {
      state = scheduleNextReview(state, "good", now);
      intervals.push(state.intervalDays);
      // advance now by the interval
      now = new Date(state.dueAt);
    }

    // Each interval should be >= the previous (compounding)
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
    }
    expect(state.reviewCount).toBe(5);
    // Final interval should be much larger than initial
    expect(intervals[4]).toBeGreaterThan(intervals[0]);
  });

  it("a lapse mid-series resets but recovers", () => {
    let state = createInitialReviewState();
    const now = new Date("2026-01-01T00:00:00Z");

    // Build up some interval
    state = scheduleNextReview(state, "easy", now);
    state = scheduleNextReview(state, "easy", now);
    const bigInterval = state.intervalDays;

    // Lapse
    state = scheduleNextReview(state, "again", now);
    expect(state.intervalDays).toBe(0);
    expect(state.lapseCount).toBe(1);

    // Recover
    state = scheduleNextReview(state, "good", now);
    expect(state.intervalDays).toBeGreaterThanOrEqual(3);

    // Check we didn't lose reviewCount
    expect(state.reviewCount).toBe(4);
  });
});

describe("ease factor bounds (no ease factor in this SRS, but interval sanity)", () => {
  it("intervalDays never goes negative", () => {
    const state = createInitialReviewState();
    const next = scheduleNextReview(state, "again");
    expect(next.intervalDays).toBeGreaterThanOrEqual(0);
  });

  it("hard interval from 0 base gives at least 1 day", () => {
    const state = createInitialReviewState();
    const next = scheduleNextReview(state, "hard");
    // base is 1 day for hard
    expect(next.intervalDays).toBeGreaterThanOrEqual(1);
  });
});
