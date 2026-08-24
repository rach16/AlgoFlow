import { describe, it, expect } from 'vitest';
import { SQL_EXERCISES, SQL_KINDS, SQL_TABLES } from './sqlExercises';
import { BUILD_EXERCISES } from './buildExercises';

describe('sql fixture', () => {
  it('gives every table columns, rows and a reason to exist', () => {
    expect(SQL_TABLES.length).toBeGreaterThanOrEqual(5);
    for (const table of SQL_TABLES) {
      expect(table.columns.length, table.name).toBeGreaterThan(0);
      expect(table.rows.length, table.name).toBeGreaterThan(0);
      expect(table.note.length, table.name).toBeGreaterThan(40);
      for (const row of table.rows) {
        expect(row.length, `${table.name} row width`).toBe(table.columns.length);
      }
    }
    expect(new Set(SQL_TABLES.map((t) => t.name)).size).toBe(SQL_TABLES.length);
  });

  // Three exercises turn on a NULL being present in the data rather than merely discussed. If a
  // future reseed removes them, those exercises still render and quietly stop demonstrating
  // anything.
  it('actually contains the NULLs the exercises depend on', () => {
    const nulls = SQL_TABLES.flatMap((t) =>
      t.rows.some((r) => r.includes(null)) ? [t.name] : []
    );
    expect(nulls).toContain('users');
    expect(nulls).toContain('blocked_users');
    expect(nulls).toContain('job_runs');
  });
});

describe('sql exercises', () => {
  it('covers both kinds and keeps ids unique', () => {
    expect(SQL_EXERCISES.length).toBeGreaterThanOrEqual(12);
    expect(new Set(SQL_EXERCISES.map((e) => e.id)).size).toBe(SQL_EXERCISES.length);
    for (const kind of SQL_KINDS) {
      expect(
        SQL_EXERCISES.filter((e) => e.kind === kind.id).length,
        `no exercises of kind "${kind.id}"`
      ).toBeGreaterThanOrEqual(4);
    }
  });

  /**
   * The load-bearing property of the whole section. Each exercise claims a naive query and a
   * correct one disagree; if they return the same rows there is no lesson, only two queries. This
   * caught four exercises when the fixture was first seeded.
   */
  it('makes every naive query actually disagree with its correct one', () => {
    for (const exercise of SQL_EXERCISES) {
      expect(
        JSON.stringify(exercise.naive.result.rows),
        `${exercise.id}: the naive and correct queries return identical rows, so nothing is demonstrated`
      ).not.toEqual(JSON.stringify(exercise.correct.result.rows));
    }
  });

  it('keeps every result set rectangular and matched to its columns', () => {
    for (const exercise of SQL_EXERCISES) {
      for (const side of ['naive', 'correct'] as const) {
        const { columns, rows } = exercise[side].result;
        for (const row of rows) {
          expect(row.length, `${exercise.id}.${side}`).toBe(columns.length);
        }
        // An empty result is a legitimate outcome — it is the answer to two of these — but a
        // non-empty one has to name its columns or the table renders headerless.
        if (rows.length > 0) expect(columns.length, `${exercise.id}.${side}`).toBeGreaterThan(0);
      }
    }
  });

  it('gives every correct query rows to show', () => {
    for (const exercise of SQL_EXERCISES) {
      expect(
        exercise.correct.result.rows.length,
        `${exercise.id}: the correct query finds nothing, so the fixture does not contain the anomaly`
      ).toBeGreaterThan(0);
    }
  });

  it('explains the failure, the mechanism and the answer', () => {
    for (const exercise of SQL_EXERCISES) {
      expect(exercise.prompt.length, exercise.id).toBeGreaterThan(60);
      expect(exercise.whyWrong.length, exercise.id).toBeGreaterThan(150);
      expect(exercise.mechanism.length, exercise.id).toBeGreaterThan(120);
      expect(exercise.say.length, exercise.id).toBeGreaterThan(120);
      for (const side of ['naive', 'correct'] as const) {
        expect(exercise[side].sql.trim().endsWith(';'), `${exercise.id}.${side}`).toBe(true);
      }
    }
  });
});

describe('build exercises', () => {
  it('gives every exercise a prompt, follow-ups and its mistakes', () => {
    expect(BUILD_EXERCISES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(BUILD_EXERCISES.map((e) => e.id)).size).toBe(BUILD_EXERCISES.length);
    for (const exercise of BUILD_EXERCISES) {
      expect(exercise.prompt.length, exercise.id).toBeGreaterThan(60);
      expect(exercise.assessed.length, exercise.id).toBeGreaterThan(150);
      expect(exercise.followUps.length, exercise.id).toBeGreaterThanOrEqual(3);
      expect(exercise.mistakes.length, exercise.id).toBeGreaterThanOrEqual(4);
      for (const mistake of exercise.mistakes) {
        expect(mistake.length, exercise.id).toBeGreaterThan(50);
      }
    }
  });

  // A solution nothing asserts against is a snippet. The checks are the reason to trust the code
  // on the page, so an exercise without them is worse than one without a solution.
  it('names the assertions each solution passed', () => {
    for (const exercise of BUILD_EXERCISES) {
      expect(exercise.checks.length, exercise.id).toBeGreaterThan(0);
      for (const check of exercise.checks) {
        expect(check.length, exercise.id).toBeGreaterThan(20);
      }
    }
    expect(BUILD_EXERCISES.flatMap((e) => e.checks).length).toBeGreaterThanOrEqual(14);
  });

  /**
   * The page's central claim is that these are testable without sleeping, and the habit that makes
   * that true is injecting the clock or the sleep. Three of these are about timing; all three have
   * to take it as a parameter, or the claim is decoration.
   */
  it('injects the clock in every solution that depends on time', () => {
    for (const id of ['retry', 'ratelimit']) {
      const exercise = BUILD_EXERCISES.find((e) => e.id === id)!;
      expect(exercise.solution, id).toMatch(/\b(now|sleep)\s*=/);
    }
  });

  it('ships solutions that are code rather than prose', () => {
    for (const exercise of BUILD_EXERCISES) {
      expect(exercise.solution.length, exercise.id).toBeGreaterThan(150);
      expect(exercise.solution, exercise.id).toMatch(/(function|=>)/);
    }
  });
});
