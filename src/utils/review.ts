/**
 * Spaced repetition scheduling.
 *
 * A Leitner box system: each problem sits in a box (its `streak`), and the box decides how far
 * out the next review lands. Rating it well moves it up a box, rating it badly sends it back to
 * the start. Deliberately simpler than SM-2 — no ease factors to tune, and the whole schedule is
 * explainable in one sentence, which matters for a tool you are using on yourself.
 *
 * Every function takes `now` explicitly rather than calling Date.now() internally, so the
 * behaviour is testable without mocking the clock.
 */

export type Confidence = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewRecord {
  /** epoch ms of the most recent rating */
  lastReviewed: number;
  /** epoch ms when this becomes due again */
  dueAt: number;
  /** Leitner box index — how many boxes up it has climbed */
  streak: number;
  /** the most recent rating, for display */
  last: Confidence;
  /** total times rated, so the UI can show effort not just position */
  reviews: number;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Box index -> days until the next review. The last entry is the ceiling. */
export const INTERVALS_DAYS = [1, 3, 7, 16, 35, 75] as const;

export const CONFIDENCE_META: {
  id: Confidence;
  label: string;
  hint: string;
  accent: string;
}[] = [
  { id: 'again', label: 'Again', hint: 'Could not solve it — back to tomorrow', accent: 'bg-red-500/20 text-red-300 hover:bg-red-500/30' },
  { id: 'hard', label: 'Hard', hint: 'Got there, but it was a struggle', accent: 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' },
  { id: 'good', label: 'Good', hint: 'Solved it with some thought', accent: 'bg-green-500/20 text-green-300 hover:bg-green-500/30' },
  { id: 'easy', label: 'Easy', hint: 'Immediate — push it far out', accent: 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' },
];

/** How the rating moves you between boxes. */
function nextStreak(current: number, confidence: Confidence): number {
  switch (confidence) {
    case 'again':
      return 0; // straight back to the first box
    case 'hard':
      return Math.max(0, current); // hold position
    case 'good':
      return current + 1;
    case 'easy':
      return current + 2; // skip a box
  }
}

const intervalDays = (streak: number): number =>
  INTERVALS_DAYS[Math.min(streak, INTERVALS_DAYS.length - 1)];

/** Apply a rating and return the updated record. */
export function applyRating(
  existing: ReviewRecord | undefined,
  confidence: Confidence,
  now: number
): ReviewRecord {
  const streak = nextStreak(existing?.streak ?? 0, confidence);
  // 'hard' deliberately shortens the interval rather than repeating it, so a struggle comes
  // back sooner than a clean pass at the same box.
  const days = confidence === 'hard' ? Math.max(1, Math.round(intervalDays(streak) / 2)) : intervalDays(streak);
  return {
    lastReviewed: now,
    dueAt: now + days * DAY_MS,
    streak,
    last: confidence,
    reviews: (existing?.reviews ?? 0) + 1,
  };
}

export const isDue = (record: ReviewRecord, now: number): boolean => record.dueAt <= now;

/**
 * Whole days until due; negative means overdue by that many days.
 *
 * Rounds rather than ceils. `now` is quantised to the minute by useNow, so a gap that is exactly
 * three days reads as 3.0004 days — and ceil would report "in 4 days" for something scheduled
 * three days out.
 */
export const daysUntilDue = (record: ReviewRecord, now: number): number =>
  Math.round((record.dueAt - now) / DAY_MS);

/** Human-readable due state, e.g. "due today", "3 days overdue", "in 7 days". */
export function dueLabel(record: ReviewRecord, now: number): string {
  const d = daysUntilDue(record, now);
  if (d <= 0) return d === 0 ? 'due today' : `${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'} overdue`;
  if (d === 1) return 'due tomorrow';
  return `in ${d} days`;
}
