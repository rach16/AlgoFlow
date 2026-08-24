import { describe, it, expect } from 'vitest';
import {
  AI_QA,
  EVAL_CARDS,
  EVAL_GROUPS,
  MUTANTS,
  MUTATION_SPEC,
  MUTATION_SUBJECT,
  MUTATION_SUITES,
  MUTATION_VERDICT,
  POSITIONS,
  TASK_CALLS,
  TOOL_CLAIMS,
  VERIFICATION_DEBT,
} from './aiTesting';

describe('the position on using AI', () => {
  it('offers exactly one answer that lands, and says what the others cost', () => {
    expect(POSITIONS.filter((p) => p.verdict === 'good')).toHaveLength(1);
    expect(POSITIONS.filter((p) => p.verdict === 'bad').length).toBeGreaterThanOrEqual(2);
    for (const position of POSITIONS) {
      expect(position.answer.length, position.id).toBeGreaterThan(40);
      expect(position.problem.length, position.id).toBeGreaterThan(120);
    }
  });

  // A split with nothing on one side is an attitude, not a position — which is the specific
  // failure the page argues against, so the data must not commit it.
  it('names tasks on both sides of the line', () => {
    expect(TASK_CALLS.filter((t) => t.hand).length).toBeGreaterThanOrEqual(4);
    expect(TASK_CALLS.filter((t) => !t.hand).length).toBeGreaterThanOrEqual(3);
    for (const task of TASK_CALLS) {
      expect(task.why.length, task.id).toBeGreaterThan(80);
    }
    expect(new Set(TASK_CALLS.map((t) => t.id)).size).toBe(TASK_CALLS.length);
  });

  it('explains verification debt and what to do about it', () => {
    for (const field of ['definition', 'why', 'tell'] as const) {
      expect(VERIFICATION_DEBT[field].length, field).toBeGreaterThan(200);
    }
    expect(VERIFICATION_DEBT.fixes.length).toBeGreaterThanOrEqual(4);
    for (const fix of VERIFICATION_DEBT.fixes) {
      expect(fix.body.length, fix.id).toBeGreaterThan(100);
    }
  });

  // Each tool card has to carry both halves. A card with only a catch is a sneer, and a card with
  // only a use case is a sales pitch; both lose the room.
  it('gives every tool claim a mechanism, a catch and a case where it wins', () => {
    for (const tool of TOOL_CLAIMS) {
      for (const field of ['how', 'catch', 'goodFor', 'say'] as const) {
        expect(tool[field].length, `${tool.id}.${field}`).toBeGreaterThan(80);
      }
    }
    expect(new Set(TOOL_CLAIMS.map((t) => t.id)).size).toBe(TOOL_CLAIMS.length);
  });

  it('answers the questions the position invites', () => {
    expect(AI_QA.length).toBeGreaterThanOrEqual(5);
    for (const qa of AI_QA) {
      expect(qa.answer.length, qa.question).toBeGreaterThan(300);
    }
  });
});

describe('testing AI features', () => {
  it('puts every eval card in a declared group, and leaves no group empty', () => {
    const groupIds = new Set(EVAL_GROUPS.map((g) => g.id));
    expect(groupIds.size).toBe(EVAL_GROUPS.length);
    for (const card of EVAL_CARDS) {
      expect(groupIds.has(card.group), card.id).toBe(true);
    }
    for (const group of EVAL_GROUPS) {
      expect(
        EVAL_CARDS.filter((c) => c.group === group.id).length,
        `group "${group.id}" has no cards`
      ).toBeGreaterThan(0);
    }
  });

  it('pairs every card with a concrete practice rather than only a concept', () => {
    expect(EVAL_CARDS.length).toBeGreaterThanOrEqual(10);
    for (const card of EVAL_CARDS) {
      expect(card.body.length, card.id).toBeGreaterThan(200);
      expect(card.practice.length, card.id).toBeGreaterThan(120);
    }
    expect(new Set(EVAL_CARDS.map((c) => c.id)).size).toBe(EVAL_CARDS.length);
  });
});

describe('mutation lab', () => {
  it('mutates lines that exist in the subject', () => {
    const lines = MUTATION_SUBJECT.split('\n');
    for (const mutant of MUTANTS) {
      const line = lines[mutant.line - 1];
      expect(line, `mutant ${mutant.id} points at line ${mutant.line}`).toBeDefined();
      // The numbered gutter is part of the string, so the line must actually start with its number.
      expect(line.trimStart().startsWith(String(mutant.line)), mutant.id).toBe(true);
      expect(
        line.includes(mutant.original) || mutant.original.split('\n').every((f) => line.includes(f)),
        `mutant ${mutant.id}: "${mutant.original}" is not on line ${mutant.line}`
      ).toBe(true);
    }
    expect(new Set(MUTANTS.map((m) => m.id)).size).toBe(MUTANTS.length);
  });

  it('only ever credits a kill to a suite that exists', () => {
    const suiteIds = new Set(MUTATION_SUITES.map((s) => s.id));
    for (const mutant of MUTANTS) {
      for (const id of mutant.killedBy) {
        expect(suiteIds.has(id), `mutant ${mutant.id} killed by unknown suite "${id}"`).toBe(true);
      }
      expect(new Set(mutant.killedBy).size, mutant.id).toBe(mutant.killedBy.length);
    }
  });

  // An equivalent mutant is unkillable by definition. One listed as killed would quietly inflate
  // a score the page presents as measured rather than illustrative.
  it('never lets an equivalent mutant be killed', () => {
    for (const mutant of MUTANTS.filter((m) => m.equivalent)) {
      expect(mutant.killedBy, mutant.id).toEqual([]);
    }
    expect(MUTANTS.some((m) => m.equivalent)).toBe(true);
  });

  // The whole demonstration rests on both suites reaching identical coverage and different
  // mutation scores. If a future edit flattens either half, the page stops making its argument.
  it('separates the suites on mutation score and not on coverage', () => {
    expect(MUTATION_SUITES.length).toBe(2);
    expect(new Set(MUTATION_SUITES.map((s) => s.coverage)).size).toBe(1);

    const killable = MUTANTS.filter((m) => !m.equivalent);
    const scores = MUTATION_SUITES.map((s) => ({
      id: s.id,
      killed: killable.filter((m) => m.killedBy.includes(s.id)).length,
    }));

    const generated = scores.find((s) => s.id === 'generated')!;
    const spec = scores.find((s) => s.id === 'spec')!;
    expect(spec.killed).toBe(killable.length);
    expect(generated.killed).toBeLessThan(killable.length / 2);
  });

  // Every mutant the generated suite misses is missed for a stated reason. "It just does not"
  // is the shape of an argument nobody can check.
  it('explains every survivor', () => {
    for (const mutant of MUTANTS) {
      const survivesSomewhere = MUTATION_SUITES.some((s) => !mutant.killedBy.includes(s.id));
      if (survivesSomewhere) {
        expect(mutant.escapes.length, `mutant ${mutant.id} survives unexplained`).toBeGreaterThan(80);
      }
      expect(mutant.meaning.length, mutant.id).toBeGreaterThan(30);
      // The collapsed row shows only the label, so it has to say what changed on its own and
      // still fit the row. Dropping round2() is the case that proves the point: as a code
      // fragment the mutated line is indistinguishable from the original.
      expect(mutant.label.length, mutant.id).toBeGreaterThan(10);
      expect(mutant.label.length, mutant.id).toBeLessThan(42);
      expect(mutant.label, mutant.id).not.toBe(mutant.mutated);
    }
  });

  it('states the rules the spec suite was written from', () => {
    expect(MUTATION_SPEC.length).toBeGreaterThanOrEqual(3);
    for (const rule of MUTATION_SPEC) expect(rule.length).toBeGreaterThan(60);
    for (const suite of MUTATION_SUITES) {
      expect(suite.tests.length, suite.id).toBeGreaterThan(200);
      expect(suite.origin.length, suite.id).toBeGreaterThan(120);
      expect(suite.verdict.length, suite.id).toBeGreaterThan(120);
    }
    for (const field of ['coverage', 'score', 'cost', 'say'] as const) {
      expect(MUTATION_VERDICT[field].length, field).toBeGreaterThan(100);
    }
  });
});
