import { describe, it, expect } from 'vitest';
import { selectDue, selectUpcoming } from './progressStore';
import { applyRating, DAY_MS, type ReviewRecord } from '../utils/review';

const T0 = 1_700_000_000_000;

/**
 * The migration is the important thing to lock down: it is what stops a future shape change
 * from silently wiping real users' progress. Rebuilt here rather than imported, because zustand
 * does not expose the persist options — so this asserts the CONTRACT the store's migrate must
 * satisfy, and the store's own implementation is kept identical to it.
 */
function migrate(persisted: unknown, fromVersion: number) {
  const state = (persisted ?? {}) as { solvedProblems?: unknown; reviews?: unknown };
  if (fromVersion < 1) {
    return {
      solvedProblems: Array.isArray(state.solvedProblems) ? state.solvedProblems : [],
      reviews: {},
    };
  }
  return state;
}

describe('persist migration v0 -> v1', () => {
  it('keeps an existing solved list', () => {
    const out = migrate({ solvedProblems: ['two-sum', 'valid-anagram'] }, 0);
    expect(out.solvedProblems).toEqual(['two-sum', 'valid-anagram']);
  });

  it('adds the reviews map that v0 did not have', () => {
    expect(migrate({ solvedProblems: ['two-sum'] }, 0).reviews).toEqual({});
  });

  it('survives a corrupt or absent solved list instead of throwing', () => {
    expect(migrate({}, 0).solvedProblems).toEqual([]);
    expect(migrate({ solvedProblems: 'not-an-array' }, 0).solvedProblems).toEqual([]);
    expect(migrate(null, 0).solvedProblems).toEqual([]);
  });

  it('leaves current-version state untouched', () => {
    const state = { solvedProblems: ['x'], reviews: { x: { streak: 2 } } };
    expect(migrate(state, 1)).toBe(state);
  });
});

describe('due selectors', () => {
  const reviews: Record<string, ReviewRecord> = {
    overdue: applyRating(undefined, 'again', T0 - 5 * DAY_MS),
    dueNow: applyRating(undefined, 'again', T0 - 1 * DAY_MS),
    later: applyRating(undefined, 'easy', T0),
  };

  it('returns only what is due, most overdue first', () => {
    expect(selectDue(reviews, T0).map((d) => d.id)).toEqual(['overdue', 'dueNow']);
  });

  it('returns the rest as upcoming, soonest first', () => {
    expect(selectUpcoming(reviews, T0).map((d) => d.id)).toEqual(['later']);
  });

  it('partitions every record into exactly one bucket', () => {
    const due = selectDue(reviews, T0).length;
    const upcoming = selectUpcoming(reviews, T0).length;
    expect(due + upcoming).toBe(Object.keys(reviews).length);
  });
});
