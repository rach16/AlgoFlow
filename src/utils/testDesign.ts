import {
  DIMENSIONS,
  DIMENSION_BY_ID,
  EXERCISES,
  type Dimension,
  type DimensionId,
  type DesignExercise,
} from '../data/testDesign';

/**
 * Scoring for the enumerate-then-compare exercises.
 *
 * The number that matters here is not how many cases you produced. It is which DIMENSIONS you
 * never reached — a candidate who lists twenty happy-path variations scores worse than one who
 * lists eight spread across boundaries, failure and concurrency. `blindSpots` is therefore the
 * output this whole phase exists to produce, and it only gets meaningful once you have attempted
 * several exercises: one attempt tells you about one subject, four tell you about you.
 *
 * Everything here is pure and takes its inputs explicitly, so it tests without a clock or a DOM.
 */

export interface DesignAttempt {
  exerciseId: string;
  /** Your list, verbatim. Kept so a second attempt can be read against the first. */
  notes: string;
  /** Expected-case ids you judged you had. Self-scored — nothing here reads your prose. */
  checked: string[];
  startedAt: number;
  finishedAt: number;
}

export interface ActiveDesignAttempt {
  exerciseId: string;
  notes: string;
  startedAt: number;
  /** Set when the reference list is revealed. Enumeration is over at that moment. */
  revealedAt?: number;
  checked: string[];
}

/** How many cases you actually wrote. One per non-empty line; bullets and numbering allowed. */
export function countCases(notes: string): number {
  return notes
    .split('\n')
    .map((line) => line.replace(/^[\s\-*·•\d.)]+/, '').trim())
    .filter((line) => line !== '').length;
}

export interface DimensionScore {
  dimension: Dimension;
  hit: number;
  total: number;
}

export interface AttemptScore {
  hit: number;
  total: number;
  mustHit: number;
  mustTotal: number;
  creditHit: number;
  creditTotal: number;
  /** 0–1 over every expected case. */
  recall: number;
  /** 0–1 over the `must` cases only — the floor a competent answer is expected to clear. */
  mustRecall: number;
  /** Only the dimensions this exercise actually covers, in the canonical order. */
  byDimension: DimensionScore[];
  /** Dimensions the exercise covers that you reached zero cases in. */
  missed: Dimension[];
}

/**
 * A checked id that no longer exists in the exercise is ignored rather than counted.
 *
 * The reference lists are editable data, and an attempt saved before an edit will otherwise
 * score against cases that are gone — inflating recall, or pushing it over 100%.
 */
export function scoreAttempt(exercise: DesignExercise, checked: string[]): AttemptScore {
  const valid = new Set(exercise.expected.map((c) => c.id));
  const got = new Set(checked.filter((id) => valid.has(id)));

  const must = exercise.expected.filter((c) => c.tier === 'must');
  const credit = exercise.expected.filter((c) => c.tier === 'credit');

  const present = new Set(exercise.expected.map((c) => c.dimension));
  const byDimension = DIMENSIONS.filter((d) => present.has(d.id)).map((dimension) => {
    const cases = exercise.expected.filter((c) => c.dimension === dimension.id);
    return {
      dimension,
      hit: cases.filter((c) => got.has(c.id)).length,
      total: cases.length,
    };
  });

  const total = exercise.expected.length;
  const mustHit = must.filter((c) => got.has(c.id)).length;

  return {
    hit: got.size,
    total,
    mustHit,
    mustTotal: must.length,
    creditHit: credit.filter((c) => got.has(c.id)).length,
    creditTotal: credit.length,
    recall: total === 0 ? 0 : got.size / total,
    mustRecall: must.length === 0 ? 0 : mustHit / must.length,
    byDimension,
    missed: byDimension.filter((d) => d.hit === 0).map((d) => d.dimension),
  };
}

export interface BlindSpot {
  dimension: Dimension;
  hit: number;
  total: number;
  recall: number;
  /** How many attempted exercises put this dimension in front of you. */
  exercises: number;
}

/**
 * Recall per dimension across every attempt, worst first.
 *
 * Dimensions you have not been asked about yet are left out entirely — reporting 0% for something
 * never tested would read as a weakness rather than as an absence of data.
 */
export function blindSpots(attempts: DesignAttempt[]): BlindSpot[] {
  const totals = new Map<DimensionId, { hit: number; total: number; exercises: number }>();

  for (const attempt of attempts) {
    const exercise = EXERCISES.find((e) => e.id === attempt.exerciseId);
    if (!exercise) continue; // an exercise that has since been removed
    const score = scoreAttempt(exercise, attempt.checked);
    for (const { dimension, hit, total } of score.byDimension) {
      const running = totals.get(dimension.id) ?? { hit: 0, total: 0, exercises: 0 };
      running.hit += hit;
      running.total += total;
      running.exercises += 1;
      totals.set(dimension.id, running);
    }
  }

  return [...totals.entries()]
    .map(([id, { hit, total, exercises }]) => ({
      dimension: DIMENSION_BY_ID[id],
      hit,
      total,
      recall: total === 0 ? 0 : hit / total,
      exercises,
    }))
    .sort((a, b) => a.recall - b.recall || b.total - a.total);
}

/** The most recent attempt per exercise — the history keeps every attempt, the list shows the last. */
export function latestByExercise(attempts: DesignAttempt[]): Map<string, DesignAttempt> {
  const latest = new Map<string, DesignAttempt>();
  for (const attempt of attempts) {
    const held = latest.get(attempt.exerciseId);
    if (!held || attempt.finishedAt > held.finishedAt) latest.set(attempt.exerciseId, attempt);
  }
  return latest;
}

export interface DesignSummary {
  attempted: number;
  exercises: number;
  /** Mean recall over the latest attempt at each exercise. 0 when nothing is attempted. */
  recall: number;
  totalAttempts: number;
}

export function summarise(attempts: DesignAttempt[]): DesignSummary {
  const latest = [...latestByExercise(attempts).values()];
  const recalls = latest.map((attempt) => {
    const exercise = EXERCISES.find((e) => e.id === attempt.exerciseId);
    return exercise ? scoreAttempt(exercise, attempt.checked).recall : 0;
  });
  return {
    attempted: latest.length,
    exercises: EXERCISES.length,
    recall: recalls.length === 0 ? 0 : recalls.reduce((a, b) => a + b, 0) / recalls.length,
    totalAttempts: attempts.length,
  };
}

/**
 * Review ids for exercises are namespaced the same way stories are, so one queue holds problems,
 * stories and exercises without any id ever colliding with an algorithm id.
 */
export const DESIGN_REVIEW_PREFIX = 'design:';

export const designReviewId = (exerciseId: string): string =>
  `${DESIGN_REVIEW_PREFIX}${exerciseId}`;

export const isDesignReviewId = (id: string): boolean => id.startsWith(DESIGN_REVIEW_PREFIX);

export const exerciseIdFromReviewId = (id: string): string =>
  id.slice(DESIGN_REVIEW_PREFIX.length);

/** An exercise's title from its id — the review queue holds ids, not exercises. */
export function exerciseTitleFor(exerciseId: string): string {
  return EXERCISES.find((e) => e.id === exerciseId)?.title ?? 'A removed exercise';
}
