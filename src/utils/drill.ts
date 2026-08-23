import type { AlgorithmMeta } from '../algorithms/manifestTypes';

/**
 * Timed drill: type the solution cold, on a clock, with nothing helping you.
 *
 * The visualizer teaches why an algorithm works. It does nothing to prepare you to produce one
 * from memory at speed, which is what the coding round actually measures — Meta reportedly gives
 * two problems in 45 minutes on a plain shared editor with no autocomplete, and Apple runs several
 * rounds at SWE difficulty. Those are different skills, and only one of them was covered.
 *
 * Everything here is pure so it can be tested without a clock or a DOM.
 */

export type DrillOutcome = 'solved' | 'partial' | 'missed';

export interface DrillAttempt {
  id: string;
  /** what you typed, kept so the summary can sit it beside the reference solution */
  code: string;
  /** your own call — nothing here executes your code, so honesty is the whole mechanism */
  outcome: DrillOutcome;
}

export interface ActiveSession {
  problemIds: string[];
  index: number;
  /** problem id -> what you have typed so far */
  codeById: Record<string, string>;
  startedAt: number;
  limitMs: number;
  /** set when you stop typing and move to grading; the clock freezes here */
  finishedAt?: number;
}

export interface CompletedSession {
  startedAt: number;
  finishedAt: number;
  limitMs: number;
  attempts: DrillAttempt[];
}

export interface DrillPreset {
  id: string;
  label: string;
  /** where the format comes from, so the numbers are not arbitrary */
  source: string;
  problems: number;
  minutes: number;
}

export const DRILL_PRESETS: DrillPreset[] = [
  {
    id: 'meta',
    label: 'Meta pace',
    source: 'Two problems in 45 minutes, reportedly Meta’s format and the tightest of the five.',
    problems: 2,
    minutes: 45,
  },
  {
    id: 'standard',
    label: 'Standard round',
    source: 'One problem in 35 minutes — the usual shape of a single coding round.',
    problems: 1,
    minutes: 35,
  },
  {
    id: 'warmup',
    label: 'Warm-up',
    source: 'One problem in 20 minutes. Short enough to do daily.',
    problems: 1,
    minutes: 20,
  },
];

export const OUTCOME_META: { id: DrillOutcome; label: string; hint: string }[] = [
  { id: 'solved', label: 'Solved', hint: 'Working solution, in time, without looking anything up' },
  { id: 'partial', label: 'Partial', hint: 'Right idea but incomplete, buggy, or over the clock' },
  { id: 'missed', label: 'Missed', hint: 'Did not get there' },
];

/**
 * A random sample of `count` problems, without repeats.
 *
 * `rand` is injected rather than calling Math.random directly so the picker is testable and so
 * nothing here is impure at render time.
 */
export function pickProblems(
  pool: AlgorithmMeta[],
  count: number,
  rand: () => number = Math.random
): AlgorithmMeta[] {
  const remaining = [...pool];
  const picked: AlgorithmMeta[] = [];
  while (picked.length < count && remaining.length > 0) {
    const i = Math.min(remaining.length - 1, Math.floor(rand() * remaining.length));
    picked.push(remaining.splice(i, 1)[0]);
  }
  return picked;
}

/** mm:ss, and -mm:ss once you are over the limit. */
export function formatClock(ms: number): string {
  const sign = ms < 0 ? '-' : '';
  const total = Math.floor(Math.abs(ms) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Milliseconds left on the clock. Negative once you are into overtime. */
export function remainingMs(session: ActiveSession, now: number): number {
  const elapsed = (session.finishedAt ?? now) - session.startedAt;
  return session.limitMs - elapsed;
}

export interface DrillStats {
  sessions: number;
  attempted: number;
  solved: number;
  partial: number;
  missed: number;
  /** solved / attempted, 0–1. Zero when nothing has been attempted. */
  rate: number;
}

export function summarise(history: CompletedSession[]): DrillStats {
  const attempts = history.flatMap((s) => s.attempts);
  const solved = attempts.filter((a) => a.outcome === 'solved').length;
  return {
    sessions: history.length,
    attempted: attempts.length,
    solved,
    partial: attempts.filter((a) => a.outcome === 'partial').length,
    missed: attempts.filter((a) => a.outcome === 'missed').length,
    rate: attempts.length === 0 ? 0 : solved / attempts.length,
  };
}

/** Newest first, for the history list. */
export function mostRecent(history: CompletedSession[], limit: number): CompletedSession[] {
  return [...history].sort((a, b) => b.finishedAt - a.finishedAt).slice(0, limit);
}
