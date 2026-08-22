import { describe, it, expect } from 'vitest';
import {
  applyRating, isDue, daysUntilDue, dueLabel, INTERVALS_DAYS, DAY_MS,
  type ReviewRecord, type Confidence,
} from './review';

// A fixed instant, so nothing here depends on the wall clock.
const T0 = 1_700_000_000_000;
const days = (n: number) => n * DAY_MS;

describe('applyRating', () => {
  it('schedules a first "good" one box up', () => {
    const r = applyRating(undefined, 'good', T0);
    expect(r.streak).toBe(1);
    expect(r.reviews).toBe(1);
    expect(r.dueAt).toBe(T0 + days(INTERVALS_DAYS[1]));
  });

  it('sends "again" back to the first box regardless of how high it was', () => {
    let r = applyRating(undefined, 'easy', T0);   // jump to box 2
    r = applyRating(r, 'easy', T0);               // box 4
    expect(r.streak).toBe(4);
    r = applyRating(r, 'again', T0);
    expect(r.streak).toBe(0);
    expect(r.dueAt).toBe(T0 + days(INTERVALS_DAYS[0]));
  });

  it('holds position on "hard" but comes back sooner than a clean pass', () => {
    const good = applyRating(applyRating(undefined, 'good', T0), 'good', T0);
    const hard = applyRating(applyRating(undefined, 'good', T0), 'hard', T0);
    expect(hard.streak).toBe(1);            // held
    expect(good.streak).toBe(2);            // advanced
    // the struggle returns sooner, which is the whole point of a separate 'hard'
    expect(hard.dueAt).toBeLessThan(good.dueAt);
  });

  it('never schedules anything less than a day out', () => {
    const confidences: Confidence[] = ['again', 'hard', 'good', 'easy'];
    for (const c of confidences) {
      const r = applyRating(undefined, c, T0);
      expect(r.dueAt - T0).toBeGreaterThanOrEqual(days(1));
    }
  });

  it('caps the interval at the last box instead of growing forever', () => {
    let r: ReviewRecord | undefined;
    for (let i = 0; i < 20; i++) r = applyRating(r, 'easy', T0);
    const maxDays = INTERVALS_DAYS[INTERVALS_DAYS.length - 1];
    expect(r!.dueAt).toBe(T0 + days(maxDays));
  });

  it('counts every rating, including ones that reset the streak', () => {
    let r = applyRating(undefined, 'good', T0);
    r = applyRating(r, 'again', T0);
    r = applyRating(r, 'good', T0);
    expect(r.reviews).toBe(3);
    expect(r.last).toBe('good');
  });

  it('advances the interval monotonically across consecutive "good" ratings', () => {
    let r = applyRating(undefined, 'good', T0);
    let prev = r.dueAt - T0;
    for (let i = 0; i < 4; i++) {
      r = applyRating(r, 'good', T0);
      const gap = r.dueAt - T0;
      expect(gap).toBeGreaterThanOrEqual(prev);
      prev = gap;
    }
  });
});

describe('due calculations', () => {
  const rec = (dueAt: number): ReviewRecord =>
    ({ lastReviewed: T0, dueAt, streak: 1, last: 'good', reviews: 1 });

  it('treats the exact due instant as due', () => {
    expect(isDue(rec(T0), T0)).toBe(true);
  });

  it('is not due one millisecond early', () => {
    expect(isDue(rec(T0 + 1), T0)).toBe(false);
  });

  it('reports overdue as a negative day count', () => {
    expect(daysUntilDue(rec(T0 - days(3)), T0)).toBe(-3);
  });

  it('labels the states a learner actually sees', () => {
    expect(dueLabel(rec(T0), T0)).toBe('due today');
    expect(dueLabel(rec(T0 - days(1)), T0)).toBe('1 day overdue');
    expect(dueLabel(rec(T0 - days(5)), T0)).toBe('5 days overdue');
    expect(dueLabel(rec(T0 + days(1)), T0)).toBe('due tomorrow');
    expect(dueLabel(rec(T0 + days(7)), T0)).toBe('in 7 days');
  });
});

describe('due labels survive a slightly stale clock', () => {
  // useNow quantises `now` down to the minute, so the gap to dueAt is a fraction over a whole
  // number of days. Ceil reported "in 4 days" for a 3-day schedule; this pins the fix.
  it('reports the scheduled number of days, not one more', () => {
    const scheduled = applyRating(undefined, 'good', T0); // 3 days out
    const staleNow = T0 - 30_000; // 30s behind, as minute-quantising produces
    expect(dueLabel(scheduled, staleNow)).toBe('in 3 days');
  });

  it('still says due today at the moment it ripens', () => {
    const scheduled = applyRating(undefined, 'again', T0); // 1 day out
    expect(dueLabel(scheduled, scheduled.dueAt)).toBe('due today');
  });
});
