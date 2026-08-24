import { describe, it, expect } from 'vitest';
import {
  CI_CARDS,
  FRAMEWORKS,
  FRAMEWORK_VERDICT,
  LOCATORS,
  POM_MISTAKES,
  POM_PRINCIPLE,
  VERDICT_META,
  WAITS,
} from './craft';
import { FLAKE_SCENARIOS } from './flakeScenarios';

describe('craft reference', () => {
  it('gives every wait strategy a verdict, code and a failure mode', () => {
    for (const wait of WAITS) {
      expect(VERDICT_META[wait.verdict], wait.id).toBeDefined();
      expect(wait.code.length, wait.id).toBeGreaterThan(10);
      expect(wait.breaks.length, wait.id).toBeGreaterThan(80);
      expect(wait.say.length, wait.id).toBeGreaterThan(40);
    }
    expect(new Set(WAITS.map((w) => w.id)).size).toBe(WAITS.length);
  });

  // The page's claim is that waits are listed worst to best, so the data has to actually be
  // ordered that way — a reordering that broke the argument would otherwise pass unnoticed.
  it('orders waits from worst to best', () => {
    const rank = { never: 0, careful: 1, good: 2, best: 3 };
    const verdicts = WAITS.map((w) => rank[w.verdict]);
    expect(verdicts).toEqual([...verdicts].sort((a, b) => a - b));
    expect(WAITS[0].verdict).toBe('never');
    expect(WAITS.at(-1)!.verdict).toBe('best');
  });

  it('ranks locators 1..n with no ties and both syntaxes', () => {
    const ranks = LOCATORS.map((l) => l.rank);
    expect(ranks).toEqual(LOCATORS.map((_, i) => i + 1));
    for (const locator of LOCATORS) {
      expect(locator.playwright.length, locator.id).toBeGreaterThan(10);
      expect(locator.selenium.length, locator.id).toBeGreaterThan(10);
      expect(locator.resilience.length, locator.id).toBeGreaterThan(80);
    }
  });

  it('carries the page-object argument and its failure modes', () => {
    expect(POM_PRINCIPLE.worth.length).toBeGreaterThan(80);
    expect(POM_PRINCIPLE.cost.length).toBeGreaterThan(80);
    expect(POM_PRINCIPLE.modern.length).toBeGreaterThan(80);
    expect(POM_MISTAKES.length).toBeGreaterThanOrEqual(4);
    for (const card of POM_MISTAKES) {
      expect(card.problem.length, card.id).toBeGreaterThan(80);
      expect(card.fix.length, card.id).toBeGreaterThan(40);
    }
  });

  it('gives every CI card a concrete rule rather than only prose', () => {
    expect(CI_CARDS.length).toBeGreaterThanOrEqual(5);
    for (const card of CI_CARDS) {
      expect(card.body.length, card.id).toBeGreaterThan(120);
      expect(card.rule.length, card.id).toBeGreaterThan(30);
    }
  });

  it('compares frameworks on the same axes and commits to an answer', () => {
    expect(FRAMEWORKS.length).toBe(3);
    for (const framework of FRAMEWORKS) {
      for (const field of ['waits', 'parallel', 'reach', 'debugging', 'pick', 'cost'] as const) {
        expect(framework[field].length, `${framework.id}.${field}`).toBeGreaterThan(20);
      }
    }
    expect(FRAMEWORK_VERDICT.length).toBeGreaterThan(200);
  });
});

describe('flake scenarios', () => {
  it('has a broken and a fixed run for every scenario', () => {
    expect(FLAKE_SCENARIOS.length).toBeGreaterThanOrEqual(5);
    for (const scenario of FLAKE_SCENARIOS) {
      expect(scenario.broken.length, scenario.id).toBeGreaterThanOrEqual(4);
      expect(scenario.fixed.length, scenario.id).toBeGreaterThanOrEqual(4);
      expect(scenario.code.broken.length, scenario.id).toBeGreaterThan(20);
      expect(scenario.code.fixed.length, scenario.id).toBeGreaterThan(20);
    }
    expect(new Set(FLAKE_SCENARIOS.map((s) => s.id)).size).toBe(FLAKE_SCENARIOS.length);
  });

  // The timeline renders one row per lane and places each step in its lane's row. A step naming a
  // lane that does not exist would simply never be drawn — an invisible hole in the animation.
  it('only ever puts a step in a lane the scenario declares', () => {
    for (const scenario of FLAKE_SCENARIOS) {
      const lanes = new Set(scenario.lanes.map((l) => l.id));
      expect(lanes.size, scenario.id).toBe(scenario.lanes.length);
      for (const step of [...scenario.broken, ...scenario.fixed]) {
        expect(lanes.has(step.lane), `${scenario.id}: ${step.label} -> ${step.lane}`).toBe(true);
      }
    }
  });

  it('uses every declared lane in both runs', () => {
    for (const scenario of FLAKE_SCENARIOS) {
      for (const run of ['broken', 'fixed'] as const) {
        const used = new Set(scenario[run].map((s) => s.lane));
        for (const lane of scenario.lanes) {
          expect(used.has(lane.id), `${scenario.id}.${run} never uses ${lane.id}`).toBe(true);
        }
      }
    }
  });

  it('runs its clock forwards', () => {
    for (const scenario of FLAKE_SCENARIOS) {
      for (const run of ['broken', 'fixed'] as const) {
        const times = scenario[run].map((s) => s.at);
        expect(times, `${scenario.id}.${run}`).toEqual([...times].sort((a, b) => a - b));
        expect(times[0], `${scenario.id}.${run}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  // The whole point of the pairing: the broken run has to end in a failure and the fixed run in a
  // success, or the animation is not making the argument the page says it makes.
  it('ends the broken run in failure and the fixed run in success', () => {
    for (const scenario of FLAKE_SCENARIOS) {
      expect(scenario.broken.at(-1)!.tone, `${scenario.id}.broken`).toBe('fail');
      expect(scenario.fixed.at(-1)!.tone, `${scenario.id}.fixed`).toBe('win');
      expect(scenario.fixed.some((s) => s.tone === 'fail'), scenario.id).toBe(false);
    }
  });

  it('explains the symptom, the mechanism, the fix and the intermittency', () => {
    for (const scenario of FLAKE_SCENARIOS) {
      for (const field of ['symptom', 'why', 'fix', 'intermittent'] as const) {
        expect(scenario[field].length, `${scenario.id}.${field}`).toBeGreaterThan(100);
      }
      for (const step of [...scenario.broken, ...scenario.fixed]) {
        expect(step.note.length, `${scenario.id}: ${step.label}`).toBeGreaterThan(40);
        expect(step.label.length, scenario.id).toBeLessThan(32);
      }
    }
  });
});
