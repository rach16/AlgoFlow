import { describe, it, expect } from 'vitest';
import {
  STAR_FIELDS,
  coverageFor,
  emptyStory,
  isComplete,
  isStoryReviewId,
  storyIdFromReviewId,
  storyReviewId,
  storyTitleFor,
  summariseCoverage,
  type Story,
} from './stories';
import {
  CORE_PRINCIPLES,
  LEADERSHIP_PRINCIPLES,
  STORIES_PER_PRINCIPLE,
  principleById,
} from '../data/leadershipPrinciples';

const full = (over: Partial<Story> = {}): Story => ({
  id: 'x',
  title: 'A story',
  situation: 's',
  task: 't',
  action: 'a',
  result: 'r',
  principles: ['ownership'],
  updatedAt: 0,
  ...over,
});

describe('leadership principles content', () => {
  it('covers all sixteen', () => {
    expect(LEADERSHIP_PRINCIPLES).toHaveLength(16);
  });

  it('has unique ids and names', () => {
    expect(new Set(LEADERSHIP_PRINCIPLES.map((p) => p.id)).size).toBe(16);
    expect(new Set(LEADERSHIP_PRINCIPLES.map((p) => p.name)).size).toBe(16);
  });

  it('marks exactly the seven most-reported as core', () => {
    expect(CORE_PRINCIPLES).toHaveLength(7);
    expect(CORE_PRINCIPLES.map((p) => p.id).sort()).toEqual(
      [
        'bias-for-action',
        'customer-obsession',
        'deliver-results',
        'dive-deep',
        'earn-trust',
        'have-backbone',
        'ownership',
      ].sort()
    );
  });

  it('gives every principle something to write from', () => {
    for (const p of LEADERSHIP_PRINCIPLES) {
      expect(p.probing.length, p.id).toBeGreaterThan(40);
      expect(p.prompts.length, p.id).toBeGreaterThanOrEqual(3);
      expect(p.antiPatterns.length, p.id).toBeGreaterThanOrEqual(3);
      for (const text of [...p.prompts, ...p.antiPatterns]) {
        expect(text.trim(), p.id).not.toBe('');
      }
    }
  });

  it('gives every core principle a worked example with all four STAR parts', () => {
    for (const p of CORE_PRINCIPLES) {
      expect(p.example, p.id).toBeDefined();
      for (const field of STAR_FIELDS) {
        // Long enough to actually demonstrate the level of specificity expected.
        expect(p.example?.[field.key].length, `${p.id}.${field.key}`).toBeGreaterThan(60);
      }
    }
  });

  it('resolves a principle by id, and does not invent one', () => {
    expect(principleById('ownership')?.name).toBe('Ownership');
    expect(principleById('not-a-principle')).toBeUndefined();
  });
});

describe('isComplete', () => {
  it('accepts a story with a title and all four parts', () => {
    expect(isComplete(full())).toBe(true);
  });

  it('rejects a story missing any single part', () => {
    expect(isComplete(full({ title: '' }))).toBe(false);
    for (const field of STAR_FIELDS) {
      expect(isComplete(full({ [field.key]: '' })), field.key).toBe(false);
    }
  });

  it('does not count whitespace as content', () => {
    expect(isComplete(full({ action: '   \n  ' }))).toBe(false);
  });

  it('treats a fresh story as incomplete', () => {
    expect(isComplete(emptyStory('a', 0))).toBe(false);
  });
});

describe('coverageFor', () => {
  it('returns a row per principle, in the declared order', () => {
    const rows = coverageFor([]);
    expect(rows.map((r) => r.principle.id)).toEqual(LEADERSHIP_PRINCIPLES.map((p) => p.id));
  });

  it('counts only complete stories towards coverage', () => {
    const draft = full({ id: 'd', result: '', principles: ['ownership'] });
    const done = full({ id: 'c', principles: ['ownership'] });
    const row = coverageFor([draft, done]).find((r) => r.principle.id === 'ownership')!;
    expect(row.stories).toHaveLength(2);
    expect(row.ready).toBe(1);
    expect(row.met).toBe(false);
  });

  it('meets a principle at the target', () => {
    const stories = [full({ id: '1' }), full({ id: '2' })];
    const row = coverageFor(stories).find((r) => r.principle.id === 'ownership')!;
    expect(row.ready).toBe(STORIES_PER_PRINCIPLE);
    expect(row.met).toBe(true);
  });

  it('lets one story cover several principles at once, which is the whole point', () => {
    const shared = full({ principles: ['ownership', 'dive-deep', 'deliver-results'] });
    const rows = coverageFor([shared]);
    for (const id of ['ownership', 'dive-deep', 'deliver-results']) {
      expect(rows.find((r) => r.principle.id === id)!.ready, id).toBe(1);
    }
    expect(rows.find((r) => r.principle.id === 'frugality')!.ready).toBe(0);
  });
});

describe('summariseCoverage', () => {
  it('reports nothing covered for no stories', () => {
    const s = summariseCoverage([]);
    expect(s).toMatchObject({ coreMet: 0, coreTotal: 7, allMet: 0, allTotal: 16 });
    expect(s.uncovered).toHaveLength(16);
  });

  it('separates core progress from overall progress', () => {
    const stories = [
      full({ id: '1', principles: ['ownership'] }),
      full({ id: '2', principles: ['ownership'] }),
      full({ id: '3', principles: ['frugality'] }),
      full({ id: '4', principles: ['frugality'] }),
    ];
    const s = summariseCoverage(stories);
    expect(s.coreMet).toBe(1); // ownership
    expect(s.allMet).toBe(2); // ownership + frugality
  });

  it('lists what has nothing attached, so the UI can say where to start', () => {
    const s = summariseCoverage([full({ principles: ['ownership'] })]);
    expect(s.uncovered.map((p) => p.id)).not.toContain('ownership');
    expect(s.uncovered).toHaveLength(15);
  });

  it('counts drafts separately from finished stories', () => {
    const s = summariseCoverage([full({ id: '1' }), full({ id: '2', action: '' })]);
    expect(s.storiesWritten).toBe(2);
    expect(s.storiesComplete).toBe(1);
  });
});

describe('story review ids', () => {
  it('namespaces a story id so it cannot collide with an algorithm id', () => {
    expect(storyReviewId('abc')).toBe('story:abc');
    expect(isStoryReviewId('story:abc')).toBe(true);
    expect(isStoryReviewId('two-sum')).toBe(false);
  });

  it('round-trips', () => {
    const id = crypto.randomUUID();
    expect(storyIdFromReviewId(storyReviewId(id))).toBe(id);
  });
});

describe('storyTitleFor', () => {
  it('uses the title when there is one', () => {
    expect(storyTitleFor([full({ id: 'a', title: 'Flaky checkout' })], 'a')).toBe('Flaky checkout');
  });

  it('falls back for an untitled story rather than rendering blank', () => {
    expect(storyTitleFor([full({ id: 'a', title: '  ' })], 'a')).toBe('Untitled story');
  });

  it('says so when the story is gone, rather than dropping the queue entry silently', () => {
    expect(storyTitleFor([], 'missing')).toBe('A deleted story');
  });
});
