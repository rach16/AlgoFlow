import { describe, it, expect } from 'vitest';
import {
  DRILL_PRESETS,
  OUTCOME_META,
  pickProblems,
  formatClock,
  remainingMs,
  summarise,
  mostRecent,
  type ActiveSession,
  type CompletedSession,
  type DrillOutcome,
} from './drill';
import type { AlgorithmMeta } from '../algorithms/manifestTypes';

const meta = (id: string): AlgorithmMeta =>
  ({ id, name: id, category: 'c', difficulty: 'Medium' }) as AlgorithmMeta;

const pool = ['a', 'b', 'c', 'd', 'e'].map(meta);

const session = (over: Partial<ActiveSession> = {}): ActiveSession => ({
  problemIds: ['a', 'b'],
  index: 0,
  codeById: {},
  startedAt: 1_000_000,
  limitMs: 45 * 60_000,
  ...over,
});

const completed = (
  outcomes: DrillOutcome[],
  finishedAt = 2_000_000
): CompletedSession => ({
  startedAt: finishedAt - 1000,
  finishedAt,
  limitMs: 45 * 60_000,
  attempts: outcomes.map((outcome, i) => ({ id: `p${i}`, code: '', outcome })),
});

describe('presets', () => {
  it('has unique ids and sane numbers', () => {
    expect(new Set(DRILL_PRESETS.map((p) => p.id)).size).toBe(DRILL_PRESETS.length);
    for (const p of DRILL_PRESETS) {
      expect(p.problems, p.id).toBeGreaterThan(0);
      expect(p.minutes, p.id).toBeGreaterThan(0);
      expect(p.source.length, p.id).toBeGreaterThan(20);
    }
  });

  it('offers the reported Meta format, which is the point of the feature', () => {
    const meta45 = DRILL_PRESETS.find((p) => p.problems === 2 && p.minutes === 45);
    expect(meta45).toBeDefined();
  });

  it('describes every outcome the grading UI offers', () => {
    expect(OUTCOME_META.map((o) => o.id)).toEqual(['solved', 'partial', 'missed']);
    for (const o of OUTCOME_META) expect(o.hint.length, o.id).toBeGreaterThan(10);
  });
});

describe('pickProblems', () => {
  it('picks the requested number', () => {
    expect(pickProblems(pool, 2, () => 0)).toHaveLength(2);
  });

  it('never repeats a problem', () => {
    const picked = pickProblems(pool, 5, () => 0.999);
    expect(new Set(picked.map((p) => p.id)).size).toBe(picked.length);
  });

  it('returns what it can when the pool is smaller than asked for', () => {
    expect(pickProblems(pool.slice(0, 2), 5, () => 0)).toHaveLength(2);
  });

  it('handles an empty pool without throwing', () => {
    expect(pickProblems([], 2, () => 0)).toEqual([]);
  });

  it('stays in range when rand returns exactly 1, which Math.random never does but a stub might', () => {
    const picked = pickProblems(pool, 3, () => 1);
    expect(picked.every((p) => p !== undefined)).toBe(true);
    expect(picked).toHaveLength(3);
  });

  it('draws only from the pool', () => {
    const ids = pool.map((p) => p.id);
    for (const p of pickProblems(pool, 3, () => 0.5)) expect(ids).toContain(p.id);
  });

  it('does not mutate the pool', () => {
    const before = pool.map((p) => p.id);
    pickProblems(pool, 3, () => 0.5);
    expect(pool.map((p) => p.id)).toEqual(before);
  });
});

describe('formatClock', () => {
  it('formats minutes and seconds', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(45 * 60_000)).toBe('45:00');
    expect(formatClock(65_000)).toBe('1:05');
  });

  it('pads seconds', () => {
    expect(formatClock(61_000)).toBe('1:01');
  });

  it('marks overtime with a sign rather than wrapping to a positive number', () => {
    expect(formatClock(-65_000)).toBe('-1:05');
  });

  it('does not round a partial second up into the display', () => {
    expect(formatClock(1999)).toBe('0:01');
  });
});

describe('remainingMs', () => {
  it('counts down from the limit', () => {
    const s = session();
    expect(remainingMs(s, s.startedAt)).toBe(s.limitMs);
    expect(remainingMs(s, s.startedAt + 60_000)).toBe(s.limitMs - 60_000);
  });

  it('goes negative in overtime rather than clamping', () => {
    const s = session();
    expect(remainingMs(s, s.startedAt + s.limitMs + 5_000)).toBe(-5_000);
  });

  it('freezes once finished, so the summary does not keep ticking', () => {
    const s = session({ finishedAt: 1_000_000 + 60_000 });
    expect(remainingMs(s, 9_999_999)).toBe(s.limitMs - 60_000);
  });
});

describe('summarise', () => {
  it('reports zeroes for no history without dividing by zero', () => {
    expect(summarise([])).toEqual({
      sessions: 0, attempted: 0, solved: 0, partial: 0, missed: 0, rate: 0,
    });
  });

  it('counts across sessions', () => {
    const stats = summarise([
      completed(['solved', 'missed']),
      completed(['solved', 'partial']),
    ]);
    expect(stats).toMatchObject({ sessions: 2, attempted: 4, solved: 2, partial: 1, missed: 1 });
  });

  it('rates only fully solved attempts, so partial credit cannot inflate it', () => {
    expect(summarise([completed(['solved', 'partial'])]).rate).toBe(0.5);
    expect(summarise([completed(['partial', 'partial'])]).rate).toBe(0);
    expect(summarise([completed(['solved', 'solved'])]).rate).toBe(1);
  });
});

describe('mostRecent', () => {
  it('returns newest first', () => {
    const older = completed(['solved'], 1_000);
    const newer = completed(['solved'], 9_000);
    expect(mostRecent([older, newer], 5).map((s) => s.finishedAt)).toEqual([9_000, 1_000]);
  });

  it('respects the limit', () => {
    const many = [1, 2, 3, 4].map((n) => completed(['solved'], n * 1000));
    expect(mostRecent(many, 2)).toHaveLength(2);
  });

  it('does not mutate the input order', () => {
    const a = completed(['solved'], 1_000);
    const b = completed(['solved'], 9_000);
    const input = [a, b];
    mostRecent(input, 2);
    expect(input[0].finishedAt).toBe(1_000);
  });
});
