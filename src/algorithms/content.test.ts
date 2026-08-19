/**
 * Content contract tests.
 *
 * These exist because three real rendering bugs shipped in this app, all with the same
 * shape: an algorithm emitted `state` that the view components could not read, and
 * nothing failed — the animation just silently rendered nothing.
 *
 *   - Bit Manipulation emitted `bits` as an array of rows; VisualizerPage read it as a
 *     single object, so every bit problem drew an unlabeled 00000000.
 *   - Ten tree files set `treeHighlights` at the step level instead of inside `state`,
 *     so those highlights were dropped.
 *   - validSudoku emitted `matrixHighlights` as {row, col} objects where MatrixView
 *     destructures [row, col] tuples.
 *
 * `AlgorithmStep.state` is typed `Record<string, unknown>`, so the compiler cannot catch
 * any of that. This suite enforces the contract at the test boundary instead: it executes
 * every approach of every problem and asserts the emitted state is actually renderable.
 */

import { describe, it, expect } from 'vitest';
import { categories, getAllAlgorithms, getAlgorithmById } from './index';
import { getAnimationConfig } from '../animation/configs';
import { getApproaches, OPTIMAL_APPROACH_ID } from '../utils/approaches';
import { COMPLEXITY_NOTES, COMPLEXITY_METHOD, noteKey } from '../data/complexity';
import type { Algorithm, AlgorithmStep } from '../types/algorithm';

const algorithms = getAllAlgorithms();
const LANGUAGES = ['python', 'javascript', 'java'] as const;
const ACTIONS = new Set([
  'compare', 'swap', 'insert', 'delete', 'found', 'visit', 'push', 'pop',
]);

/** Every state key VisualizerPage actually reads. Anything else is silently ignored,
 *  which is exactly how the bugs above hid — so an unknown key is a test failure. */
const KNOWN_STATE_KEYS = new Set([
  'nums', 'chars',
  'hashMap', 'seen', 'stack', 'queue', 'count', 'sCount', 'tCount',
  'linkedList', 'linkedList2', 'linkedListHighlights', 'linkedListSecondary', 'linkedListPointers',
  'tree', 'tree2', 'treeHighlights', 'treeSecondary', 'treePointers',
  'graph', 'graphHighlights', 'graphSecondary', 'graphVisitedEdges', 'graphDirected',
  'matrix', 'matrixHighlights', 'matrixSecondary',
  'dp', 'dpLabels', 'dpHighlights', 'dpSecondary', 'dp2d',
  'intervals', 'intervalHighlights', 'intervalSecondary', 'resultIntervals',
  'bits', 'bits2', 'bitHighlights', 'bitSecondary',
  'result',
]);

/**
 * Algorithms freely put extra scalars in `state` to build message text (`left`, `mid`,
 * `depth`, `area`, ...). Those are harmless — the views ignore unknown keys.
 *
 * So rather than maintain an ever-growing allow-list, this suite only rejects unknown keys
 * that are *near-misses* of a real view key. That is the case worth catching: `treeHighlight`
 * (missing the s) or `matrixHighlghts` looks intentional, does nothing, and is invisible
 * without a test.
 */
function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

/**
 * A likely typo of a view key. Deliberately conservative:
 *  - a case-only difference is always a typo (`treehighlights`)
 *  - otherwise the key must be long (>= 8 chars, i.e. a compound view key like
 *    `treeHighlights`) and within edit distance 2
 *
 * Short scalars (`lo`, `hi`, `mid`) and intentional numbered siblings (`nums1`, `text2`)
 * must not trip this, which is why the length floor and the trailing-digit exemption exist.
 */
function nearMissOfKnownKey(key: string): string | null {
  if (KNOWN_STATE_KEYS.has(key)) return null;
  for (const known of KNOWN_STATE_KEYS) {
    if (key.toLowerCase() === known.toLowerCase()) return known;
  }
  if (key.length < 8 || /\d$/.test(key)) return null;
  for (const known of KNOWN_STATE_KEYS) {
    if (known.length < 8) continue;
    if (Math.abs(key.length - known.length) <= 2 && editDistance(key, known) <= 2) return known;
  }
  return null;
}

/** `id` fields are render identities assigned while building the view state, not part of
 *  the answer — two approaches can legitimately number the same nodes differently. */
function stripRenderIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripRenderIds);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([k]) => k !== 'id')
        .map(([k, v]) => [k, stripRenderIds(v)])
    );
  }
  return value;
}

/** Order-insensitive comparison for results that are collections — several problems
 *  legitimately enumerate subsets/permutations/combinations in a different order per
 *  approach, and the order is not part of the answer. */
function canonicalResult(result: unknown): string {
  const cleaned = stripRenderIds(result);
  if (Array.isArray(cleaned)) {
    return JSON.stringify([...cleaned].map((r) => JSON.stringify(r)).sort());
  }
  return JSON.stringify(cleaned);
}

const isNumberPair = (v: unknown): boolean =>
  Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number');

/** MatrixView normalizes both [row, col] tuples and {row, col} objects, so both are
 *  in-contract; anything else silently matches no cell. */
const isCellRef = (v: unknown): boolean =>
  isNumberPair(v) ||
  (typeof v === 'object' &&
    v !== null &&
    typeof (v as { row?: unknown }).row === 'number' &&
    typeof (v as { col?: unknown }).col === 'number');

/** Per-key structural checks. Each one corresponds to something a view destructures. */
const SHAPE_CHECKS: Record<string, (v: unknown) => string | null> = {
  nums: (v) => (Array.isArray(v) ? null : 'must be an array'),
  chars: (v) => (Array.isArray(v) ? null : 'must be an array'),
  // MatrixView accepts [row, col] tuples or {row, col} objects; nothing else matches a cell
  matrixHighlights: (v) =>
    Array.isArray(v) && v.every(isCellRef) ? null : 'must be [row, col] pairs or {row, col} objects',
  matrixSecondary: (v) =>
    Array.isArray(v) && v.every(isCellRef) ? null : 'must be [row, col] pairs or {row, col} objects',
  matrix: (v) => (Array.isArray(v) && v.every(Array.isArray) ? null : 'must be a 2-D array'),
  dp2d: (v) => (Array.isArray(v) && v.every(Array.isArray) ? null : 'must be a 2-D array'),
  dp: (v) => (Array.isArray(v) ? null : 'must be an array'),
  // BitView needs a numeric `value` per row; an array-of-rows and a single row are both
  // accepted by the page, but every row must carry a usable number (Bit Manipulation bug)
  bits: (v) => {
    const rows = Array.isArray(v) ? v : [v];
    for (const r of rows) {
      if (typeof r !== 'object' || r === null) return 'rows must be objects';
      const value = (r as { value?: unknown }).value;
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 'every row needs a finite numeric `value`';
      }
    }
    return null;
  },
  tree: (v) =>
    Array.isArray(v) && v.every((n) => n === null || (typeof n === 'object' && n !== null && 'id' in (n as object)))
      ? null
      : 'must be an array of {val, id} nodes (or nulls for gaps)',
  linkedList: (v) =>
    Array.isArray(v) && v.every((n) => typeof n === 'object' && n !== null && 'id' in (n as object))
      ? null
      : 'must be an array of {val, id} nodes',
  graph: (v) => {
    if (typeof v !== 'object' || v === null) return 'must be an object';
    const g = v as { nodes?: unknown; edges?: unknown };
    if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) return 'needs `nodes` and `edges` arrays';
    // GraphView normalizes bare ids into {id, label}, so both are in-contract — but a node
    // must still be identifiable, otherwise it cannot be positioned or highlighted.
    const identifiable = (n: unknown) =>
      typeof n === 'string' ||
      typeof n === 'number' ||
      (typeof n === 'object' && n !== null && 'id' in (n as object));
    if (!g.nodes.every(identifiable)) return 'nodes must be an id or an {id, label} object';
    if (!g.edges.every((e) => typeof e === 'object' && e !== null && 'from' in (e as object) && 'to' in (e as object))) {
      return 'edges need `from` and `to`';
    }
    return null;
  },
  intervals: (v) =>
    Array.isArray(v) && v.every(isNumberPair) ? null : 'must be an array of [start, end] number pairs',
  resultIntervals: (v) =>
    Array.isArray(v) && v.every(isNumberPair) ? null : 'must be an array of [start, end] number pairs',
};

/** Run one approach and return its steps, or throw with a useful label. */
function runApproach(algorithm: Algorithm, approachId: string): AlgorithmStep[] {
  const approach = getApproaches(algorithm).find((a) => a.id === approachId);
  if (!approach) throw new Error(`no approach ${approachId} on ${algorithm.id}`);
  return approach.run(algorithm.defaultInput);
}

/** (algorithm, approachId, label) for every runnable variant in the app. */
const variants = algorithms.flatMap((algorithm) =>
  getApproaches(algorithm).map((a) => ({
    algorithm,
    approachId: a.id,
    label: `${algorithm.id} / ${a.id}`,
  }))
);

describe('catalogue', () => {
  it('exposes a non-trivial number of problems', () => {
    expect(algorithms.length).toBeGreaterThanOrEqual(250);
  });

  it('has unique algorithm ids', () => {
    const seen = new Map<string, number>();
    for (const a of algorithms) seen.set(a.id, (seen.get(a.id) ?? 0) + 1);
    expect([...seen].filter(([, n]) => n > 1).map(([id]) => id)).toEqual([]);
  });

  it('every algorithm is reachable via getAlgorithmById', () => {
    const unreachable = algorithms.filter((a) => getAlgorithmById(a.id)?.id !== a.id);
    expect(unreachable.map((a) => a.id)).toEqual([]);
  });

  it('every category is non-empty and uniquely identified', () => {
    expect(categories.filter((c) => c.algorithms.length === 0).map((c) => c.id)).toEqual([]);
    expect(new Set(categories.map((c) => c.id)).size).toBe(categories.length);
  });
});

describe.each(algorithms.map((a) => [a.id, a] as const))('%s — metadata', (_id, algorithm) => {
  it('has the fields the UI renders', () => {
    expect(algorithm.name.trim()).not.toBe('');
    expect(algorithm.category.trim()).not.toBe('');
    expect(['Easy', 'Medium', 'Hard']).toContain(algorithm.difficulty);
    expect(algorithm.description.trim().length).toBeGreaterThan(20);
    expect(algorithm.timeComplexity.trim()).not.toBe('');
    expect(algorithm.spaceComplexity.trim()).not.toBe('');
  });

  it('uses the em-dash pattern separator that utils/patterns.ts splits on', () => {
    // getPatternName() does pattern.split(' — ')[0]; without the separator the whole
    // string becomes its own bucket and the Patterns view fragments.
    expect(algorithm.pattern).toContain(' — ');
  });

  it('links to a real LeetCode problem', () => {
    expect(algorithm.problemUrl ?? '').toMatch(/^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/?$/);
  });

  it('does not label its main solution "Optimal"', () => {
    // A generic label teaches nothing; every problem should name its technique.
    expect(algorithm.optimalApproachName).toBeTruthy();
    expect(algorithm.optimalApproachName).not.toBe('Optimal');
  });

  it('offers at least one alternate approach', () => {
    expect(getApproaches(algorithm).length).toBeGreaterThanOrEqual(2);
  });

  it('has an animation config, so the Animate button is not a dead link', () => {
    // VisualizerPage renders the Animate button unconditionally; without a config
    // /animate/:id shows "Algorithm Not Found".
    expect(getAnimationConfig(algorithm.id), `missing animation config`).toBeDefined();
  });
});

describe.each(variants.map((v) => [v.label, v] as const))('%s — approach', (_label, variant) => {
  const { algorithm, approachId } = variant;
  const approach = getApproaches(algorithm).find((a) => a.id === approachId)!;

  it('has code in all three languages', () => {
    for (const lang of LANGUAGES) {
      expect(approach.code[lang]?.trim(), `${lang} missing`).toBeTruthy();
    }
  });

  it('states its own complexity', () => {
    expect(approach.timeComplexity.trim()).not.toBe('');
    expect(approach.spaceComplexity.trim()).not.toBe('');
  });

  it('does not collide with the reserved approach id', () => {
    const extra = algorithm.approaches ?? [];
    expect(extra.map((a) => a.id)).not.toContain(OPTIMAL_APPROACH_ID);
    expect(new Set(extra.map((a) => a.id)).size).toBe(extra.length);
  });

  it('keeps lineExplanations within the real line count of each language', () => {
    if (!approach.lineExplanations) return;
    for (const lang of LANGUAGES) {
      const lineCount = approach.code[lang].split('\n').length;
      const outOfRange = Object.keys(approach.lineExplanations[lang] ?? {})
        .map(Number)
        .filter((n) => n < 1 || n > lineCount);
      expect(outOfRange, `${lang} keys out of 1..${lineCount}`).toEqual([]);
    }
  });

  it('produces steps for its default input', () => {
    const steps = runApproach(algorithm, approachId);
    expect(steps.length).toBeGreaterThan(0);
  });

  it('emits steps the playback controls can render', () => {
    const pythonLines = approach.code.python.split('\n').length;
    for (const [i, step] of runApproach(algorithm, approachId).entries()) {
      expect(typeof step.codeLine, `step ${i}: codeLine`).toBe('number');
      // codeLine is keyed to the Python source by repo convention; out-of-range means
      // the highlight lands on nothing.
      expect(step.codeLine, `step ${i}: codeLine ${step.codeLine} outside 1..${pythonLines}`)
        .toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeLessThanOrEqual(pythonLines);
      expect(step.message?.trim(), `step ${i}: empty message`).toBeTruthy();
      expect(Array.isArray(step.highlights), `step ${i}: highlights`).toBe(true);
      if (step.action !== undefined) expect(ACTIONS).toContain(step.action);
    }
  });

  it('has no state key that looks like a typo of a real view key', () => {
    const typos = new Set<string>();
    for (const step of runApproach(algorithm, approachId)) {
      if (Array.isArray(step.state)) continue; // legacy bare-array state
      for (const key of Object.keys(step.state ?? {})) {
        const near = nearMissOfKnownKey(key);
        if (near) typos.add(`${key} (did you mean ${near}?)`);
      }
    }
    expect([...typos], 'a near-miss key renders nothing and fails silently').toEqual([]);
  });

  it('emits state values shaped the way the view components destructure them', () => {
    const problems: string[] = [];
    for (const [i, step] of runApproach(algorithm, approachId).entries()) {
      if (Array.isArray(step.state)) continue;
      const state = (step.state ?? {}) as Record<string, unknown>;
      for (const [key, check] of Object.entries(SHAPE_CHECKS)) {
        if (state[key] === undefined || state[key] === null) continue;
        const problem = check(state[key]);
        if (problem) problems.push(`step ${i}: ${key} ${problem}`);
      }
    }
    expect(problems.slice(0, 5)).toEqual([]);
  });

  it('does not mutate defaultInput, so replay and approach-switching stay correct', () => {
    // The store re-runs run(input) on every approach switch and input change; an
    // in-place algorithm that mutates its argument corrupts every later run.
    const before = JSON.stringify(algorithm.defaultInput);
    runApproach(algorithm, approachId);
    expect(JSON.stringify(algorithm.defaultInput), 'defaultInput was mutated').toBe(before);
  });

  it('is deterministic across runs', () => {
    const a = runApproach(algorithm, approachId);
    const b = runApproach(algorithm, approachId);
    expect(b.length).toBe(a.length);
    expect(b.at(-1)?.message).toBe(a.at(-1)?.message);
  });
});

describe('approaches agree', () => {
  it.each(algorithms.filter((a) => (a.approaches ?? []).length > 0).map((a) => [a.id, a] as const))(
    '%s — every approach reaches the same answer',
    (_id, algorithm) => {
      const finals = getApproaches(algorithm).map((a) => {
        const steps = a.run(algorithm.defaultInput);
        const result = (steps.at(-1)?.state as Record<string, unknown> | undefined)?.result;
        return { id: a.id, result: result === undefined ? undefined : canonicalResult(result) };
      });
      // Only compare where every approach actually reports a result; a few design-style
      // problems deliberately end without one.
      const withResult = finals.filter((f) => f.result !== undefined);
      if (withResult.length < 2) return;
      const distinct = new Set(withResult.map((f) => f.result));
      expect([...distinct], `approaches disagree: ${JSON.stringify(withResult)}`).toHaveLength(1);
    }
  );
});

describe('animation configs', () => {
  const configured = algorithms
    .map((a) => ({ id: a.id, config: getAnimationConfig(a.id) }))
    .filter((c) => c.config);

  it('covers every algorithm', () => {
    expect(configured.length).toBe(algorithms.length);
  });

  it.each(configured.map((c) => [c.id, c] as const))('%s — config is renderable', (id, { config }) => {
    expect(config!.algorithmId).toBe(id);
    expect(config!.title.trim()).not.toBe('');
    expect(config!.codeSnippet.trim()).not.toBe('');
    expect(config!.flowPhases.length).toBeGreaterThan(0);
  });

  it.each(configured.map((c) => [c.id, c] as const))(
    '%s — template mappers survive every step',
    (id, { config }) => {
      const algorithm = getAlgorithmById(id)!;
      const steps = algorithm.run(algorithm.defaultInput);
      const phaseIds = new Set(config!.flowPhases.map((p) => p.id));
      steps.forEach((step, i) => {
        // These run on the /animate page; a throw here is a white screen there.
        const phase = config!.mapStepToPhase(step, i, steps.length);
        expect(phaseIds, `step ${i}: phase "${phase}" is not in flowPhases`).toContain(phase);
        expect(Array.isArray(config!.mapInputState(step))).toBe(true);
        config!.extractDSState(step);
      });
    }
  );
});

describe('complexity derivations', () => {
  // A note keyed to a misspelled algorithm or approach id renders nowhere and is invisible
  // without this check — the same silent-failure shape as the state-key bugs above.
  it('every note key resolves to a real algorithm and approach', () => {
    const valid = new Set(
      algorithms.flatMap((a) => getApproaches(a).map((ap) => noteKey(a.id, ap.id)))
    );
    const orphans = Object.keys(COMPLEXITY_NOTES).filter((k) => !valid.has(k));
    expect(orphans, 'note keys matching no (algorithm, approach) pair').toEqual([]);
  });

  it.each(Object.entries(COMPLEXITY_NOTES))('%s — derivation is substantive', (_key, note) => {
    expect(note.time.length, 'needs at least two time steps to be a derivation').toBeGreaterThanOrEqual(2);
    expect(note.space.length).toBeGreaterThanOrEqual(1);
    // The last step of each list is the conclusion ("O(n).") and is meant to be terse.
    // Everything leading up to it has to actually carry an argument.
    for (const list of [note.time, note.space]) {
      for (const step of list.slice(0, -1)) {
        expect(step.trim().length, `reasoning step too short to explain anything: ${step}`)
          .toBeGreaterThan(15);
      }
      expect(list.at(-1)!.trim().length, 'conclusion must not be empty').toBeGreaterThan(3);
    }
    if (note.gotcha) expect(note.gotcha.trim().length).toBeGreaterThan(30);
  });

  it('the method reference is present and structured', () => {
    expect(COMPLEXITY_METHOD.length).toBeGreaterThanOrEqual(5);
    expect(new Set(COMPLEXITY_METHOD.map((s) => s.id)).size).toBe(COMPLEXITY_METHOD.length);
    for (const section of COMPLEXITY_METHOD) {
      expect(section.title.trim()).not.toBe('');
      expect(section.intro.trim().length).toBeGreaterThan(20);
      // a section with neither rows nor prose would render as an empty accordion
      expect((section.rows?.length ?? 0) + (section.notes?.length ?? 0)).toBeGreaterThan(0);
    }
  });
});
