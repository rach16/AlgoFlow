import { describe, it, expect } from 'vitest';
import {
  DIMENSIONS,
  DIMENSION_BY_ID,
  EXERCISES,
  METHOD_STEPS,
  type DimensionId,
} from '../data/testDesign';
import { PYRAMID, TECHNIQUES, TESTABILITY_LEVERS, FLAKE_MATH } from '../data/testability';
import {
  blindSpots,
  countCases,
  designReviewId,
  exerciseIdFromReviewId,
  exerciseTitleFor,
  isDesignReviewId,
  latestByExercise,
  scoreAttempt,
  summarise,
  type DesignAttempt,
} from './testDesign';

const login = EXERCISES.find((e) => e.id === 'login')!;
const allIds = (exerciseId: string) =>
  EXERCISES.find((e) => e.id === exerciseId)!.expected.map((c) => c.id);

const attempt = (
  exerciseId: string,
  checked: string[],
  finishedAt = 1_000
): DesignAttempt => ({
  exerciseId,
  notes: '',
  checked,
  startedAt: finishedAt - 500,
  finishedAt,
});

describe('the reference bank', () => {
  it('gives every exercise a prompt, clarifiers, follow-ups and cases', () => {
    for (const exercise of EXERCISES) {
      expect(exercise.prompt.length, exercise.id).toBeGreaterThan(20);
      expect(exercise.clarifiers.length, exercise.id).toBeGreaterThanOrEqual(3);
      expect(exercise.followUps.length, exercise.id).toBeGreaterThanOrEqual(2);
      expect(exercise.expected.length, exercise.id).toBeGreaterThanOrEqual(15);
    }
  });

  it('uses ids that are unique across the whole bank', () => {
    const ids = EXERCISES.flatMap((e) => e.expected.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
  });

  it('tags every case with a dimension that exists', () => {
    const known = new Set<DimensionId>(DIMENSIONS.map((d) => d.id));
    for (const exercise of EXERCISES) {
      for (const c of exercise.expected) {
        expect(known.has(c.dimension), `${c.id} -> ${c.dimension}`).toBe(true);
      }
    }
  });

  // The whole scaffold is only useful if every dimension is actually exercised somewhere —
  // a dimension no exercise covers can never show up as a blind spot.
  it('covers every dimension in at least two exercises', () => {
    for (const dimension of DIMENSIONS) {
      const covering = EXERCISES.filter((e) =>
        e.expected.some((c) => c.dimension === dimension.id)
      );
      expect(covering.length, dimension.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('gives every exercise both a must floor and credit cases', () => {
    for (const exercise of EXERCISES) {
      const must = exercise.expected.filter((c) => c.tier === 'must');
      const credit = exercise.expected.filter((c) => c.tier === 'credit');
      expect(must.length, exercise.id).toBeGreaterThanOrEqual(8);
      expect(credit.length, exercise.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('spreads each exercise across at least seven dimensions', () => {
    for (const exercise of EXERCISES) {
      const used = new Set(exercise.expected.map((c) => c.dimension));
      expect(used.size, exercise.id).toBeGreaterThanOrEqual(7);
    }
  });

  it('indexes every dimension by id', () => {
    for (const dimension of DIMENSIONS) {
      expect(DIMENSION_BY_ID[dimension.id]).toBe(dimension);
    }
  });

  it('carries the method and the reference material', () => {
    expect(METHOD_STEPS.length).toBeGreaterThanOrEqual(4);
    expect(TECHNIQUES.length).toBeGreaterThanOrEqual(6);
    expect(PYRAMID.length).toBeGreaterThanOrEqual(4);
    expect(TESTABILITY_LEVERS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(TECHNIQUES.map((t) => t.id)).size).toBe(TECHNIQUES.length);
    expect(new Set(PYRAMID.map((p) => p.id)).size).toBe(PYRAMID.length);
    expect(new Set(TESTABILITY_LEVERS.map((l) => l.id)).size).toBe(TESTABILITY_LEVERS.length);
  });
});

describe('countCases', () => {
  it('counts non-empty lines', () => {
    expect(countCases('one\ntwo\nthree')).toBe(3);
  });

  it('ignores blank lines and trailing whitespace', () => {
    expect(countCases('one\n\n  \ntwo\n')).toBe(2);
  });

  it('strips bullets and numbering rather than counting them as content', () => {
    expect(countCases('- one\n* two\n1. three\n2) four\n• five')).toBe(5);
    expect(countCases('-\n*\n1.')).toBe(0);
  });

  it('is zero for an empty list', () => {
    expect(countCases('')).toBe(0);
    expect(countCases('   \n  ')).toBe(0);
  });
});

describe('scoreAttempt', () => {
  it('scores nothing checked as zero without dividing by zero', () => {
    const score = scoreAttempt(login, []);
    expect(score.hit).toBe(0);
    expect(score.recall).toBe(0);
    expect(score.mustRecall).toBe(0);
    expect(score.total).toBe(login.expected.length);
  });

  it('scores everything checked as full recall', () => {
    const score = scoreAttempt(login, allIds('login'));
    expect(score.hit).toBe(login.expected.length);
    expect(score.recall).toBe(1);
    expect(score.mustRecall).toBe(1);
    expect(score.missed).toEqual([]);
  });

  it('separates the must floor from the credit cases', () => {
    const musts = login.expected.filter((c) => c.tier === 'must').map((c) => c.id);
    const score = scoreAttempt(login, musts);
    expect(score.mustHit).toBe(musts.length);
    expect(score.mustRecall).toBe(1);
    expect(score.creditHit).toBe(0);
    expect(score.recall).toBeLessThan(1);
  });

  // Attempts outlive edits to the bank, so a stale id must not inflate the score past 100%.
  it('ignores checked ids the exercise no longer contains', () => {
    const score = scoreAttempt(login, [...allIds('login'), 'login-removed-case', 'cart-happy-1']);
    expect(score.hit).toBe(login.expected.length);
    expect(score.recall).toBe(1);
  });

  it('does not double-count a duplicated id', () => {
    const first = login.expected[0].id;
    expect(scoreAttempt(login, [first, first, first]).hit).toBe(1);
  });

  it('reports only the dimensions the exercise covers, in canonical order', () => {
    const score = scoreAttempt(login, []);
    const used = new Set(login.expected.map((c) => c.dimension));
    expect(score.byDimension.map((d) => d.dimension.id)).toEqual(
      DIMENSIONS.filter((d) => used.has(d.id)).map((d) => d.id)
    );
    expect(score.byDimension.reduce((n, d) => n + d.total, 0)).toBe(login.expected.length);
  });

  it('names a dimension as missed only when nothing in it was checked', () => {
    const security = login.expected.filter((c) => c.dimension === 'security');
    const others = login.expected.filter((c) => c.dimension !== 'security').map((c) => c.id);

    const missedSecurity = scoreAttempt(login, others);
    expect(missedSecurity.missed.map((d) => d.id)).toEqual(['security']);

    const oneSecurity = scoreAttempt(login, [...others, security[0].id]);
    expect(oneSecurity.missed).toEqual([]);
  });
});

describe('blindSpots', () => {
  it('is empty with no attempts', () => {
    expect(blindSpots([])).toEqual([]);
  });

  it('leaves out dimensions no attempted exercise covers', () => {
    const spots = blindSpots([attempt('login', [])]);
    const covered = new Set(login.expected.map((c) => c.dimension));
    expect(spots.map((s) => s.dimension.id).sort()).toEqual([...covered].sort());
  });

  it('sorts the weakest dimension first', () => {
    // Everything except concurrency, so concurrency is the sole 0% dimension.
    const except = login.expected
      .filter((c) => c.dimension !== 'concurrency')
      .map((c) => c.id);
    const spots = blindSpots([attempt('login', except)]);
    expect(spots[0].dimension.id).toBe('concurrency');
    expect(spots[0].recall).toBe(0);
    expect(spots.at(-1)!.recall).toBe(1);
  });

  it('accumulates the same dimension across several exercises', () => {
    const spots = blindSpots([attempt('login', []), attempt('cart', [])]);
    const boundary = spots.find((s) => s.dimension.id === 'boundary')!;
    const expected =
      login.expected.filter((c) => c.dimension === 'boundary').length +
      EXERCISES.find((e) => e.id === 'cart')!.expected.filter((c) => c.dimension === 'boundary')
        .length;
    expect(boundary.total).toBe(expected);
    expect(boundary.exercises).toBe(2);
  });

  it('skips an attempt whose exercise has been removed', () => {
    expect(blindSpots([attempt('a-deleted-exercise', ['x'])])).toEqual([]);
  });
});

describe('summarise', () => {
  it('is empty and safe with no attempts', () => {
    const summary = summarise([]);
    expect(summary.attempted).toBe(0);
    expect(summary.recall).toBe(0);
    expect(summary.exercises).toBe(EXERCISES.length);
  });

  // Re-attempting an exercise should show improvement, not average it away with the first try.
  it('counts each exercise once, using the most recent attempt', () => {
    const summary = summarise([
      attempt('login', [], 1_000),
      attempt('login', allIds('login'), 2_000),
    ]);
    expect(summary.attempted).toBe(1);
    expect(summary.totalAttempts).toBe(2);
    expect(summary.recall).toBe(1);
  });

  it('averages across exercises', () => {
    const summary = summarise([attempt('login', []), attempt('cart', allIds('cart'))]);
    expect(summary.attempted).toBe(2);
    expect(summary.recall).toBeCloseTo(0.5, 10);
  });
});

describe('latestByExercise', () => {
  it('keeps the newest attempt per exercise regardless of array order', () => {
    const latest = latestByExercise([
      attempt('login', ['a'], 3_000),
      attempt('login', ['b'], 1_000),
      attempt('cart', ['c'], 2_000),
    ]);
    expect(latest.get('login')!.checked).toEqual(['a']);
    expect(latest.get('cart')!.checked).toEqual(['c']);
    expect(latest.size).toBe(2);
  });
});

describe('review ids', () => {
  it('round-trips an exercise id', () => {
    const id = designReviewId('login');
    expect(isDesignReviewId(id)).toBe(true);
    expect(exerciseIdFromReviewId(id)).toBe('login');
  });

  it('does not claim a problem id or a story id', () => {
    expect(isDesignReviewId('two-sum')).toBe(false);
    expect(isDesignReviewId('story:abc')).toBe(false);
  });

  it('never collides with a real problem id, because those hold no colon', () => {
    expect(designReviewId('login')).toContain(':');
  });

  it('names an exercise, and says so when it is gone', () => {
    expect(exerciseTitleFor('login')).toBe(login.title);
    expect(exerciseTitleFor('nope')).toBe('A removed exercise');
  });
});

describe('flake arithmetic', () => {
  // The claim on the page is that 500 tests at 99% are green under 1% of the time. If that
  // sentence is ever wrong the page is teaching a false thing, so it is asserted rather than
  // trusted.
  it('backs the claim the page makes', () => {
    expect(FLAKE_MATH.greenRate(0.99, 500)).toBeLessThan(0.01);
    expect(FLAKE_MATH.greenRate(0.99, 100)).toBeCloseTo(0.366, 2);
    expect(FLAKE_MATH.greenRate(1, 500)).toBe(1);
    expect(FLAKE_MATH.sizes).toContain(500);
  });
});
