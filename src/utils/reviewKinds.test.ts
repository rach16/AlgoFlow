import { describe, it, expect } from 'vitest';
import { metaCategories } from '../algorithms/manifest';
import { AI_QA } from '../data/aiTesting';
import { BUILD_EXERCISES } from '../data/buildExercises';
import { CRAFT_REVIEW_TOPICS } from '../data/craft';
import { FLAKE_SCENARIOS } from '../data/flakeScenarios';
import { SQL_EXERCISES } from '../data/sqlExercises';
import { EXERCISES } from '../data/testDesign';
import { KINDS, aiQuestionId, parseReviewId, reviewId, type ReviewTitleContext } from './reviewKinds';

const ctx: ReviewTitleContext = { stories: [] };

describe('review kinds', () => {
  it('gives every kind a unique id, prefix, label and dot', () => {
    for (const field of ['id', 'prefix', 'label', 'dot'] as const) {
      const values = KINDS.map((k) => k[field]);
      expect(new Set(values).size, `duplicate ${field}`).toBe(KINDS.length);
    }
    for (const kind of KINDS) {
      expect(kind.action.length, kind.id).toBeGreaterThan(10);
    }
  });

  /**
   * The prefixes are persisted in localStorage under `algoflow-progress`. Renaming one silently
   * orphans every review already scheduled against it — the entries stay in the store, stop
   * matching a kind, and get rendered as though they were algorithm ids. These two shipped before
   * the registry existed and are the ones with real data behind them.
   */
  it('does not rename a prefix that is already in users’ storage', () => {
    expect(KINDS.find((k) => k.id === 'story')!.prefix).toBe('story:');
    expect(KINDS.find((k) => k.id === 'design')!.prefix).toBe('design:');
  });

  // A prefix without its colon would make `sql` a prefix of `sqlfoo`, and parseReviewId returns
  // the first match — so one kind could swallow another's ids.
  it('ends every prefix with a colon and never prefixes another prefix', () => {
    for (const kind of KINDS) {
      expect(kind.prefix.endsWith(':'), kind.id).toBe(true);
      for (const other of KINDS) {
        if (other === kind) continue;
        expect(other.prefix.startsWith(kind.prefix), `${other.id} shadows ${kind.id}`).toBe(false);
      }
    }
  });

  it('round-trips an item id through its kind', () => {
    for (const kind of KINDS) {
      const id = reviewId(kind.id, 'some-item');
      const parsed = parseReviewId(id);
      expect(parsed?.kind.id, kind.id).toBe(kind.id);
      expect(parsed?.itemId, kind.id).toBe('some-item');
    }
  });

  /**
   * The one property the whole queue depends on: an unprefixed id is a problem. If any algorithm
   * id ever started with a kind's prefix, that problem would render as the wrong kind of thing and
   * lose its link to the visualizer.
   */
  it('claims no real algorithm id', () => {
    const algorithmIds = metaCategories.flatMap((c) => c.algorithms.map((a) => a.id));
    expect(algorithmIds.length).toBeGreaterThan(200);
    for (const id of algorithmIds) {
      expect(parseReviewId(id), `"${id}" parses as a non-problem`).toBeNull();
    }
  });

  it('resolves a real title for every item of every kind', () => {
    const items: Record<string, string[]> = {
      design: EXERCISES.map((e) => e.id),
      sql: SQL_EXERCISES.map((e) => e.id),
      build: BUILD_EXERCISES.map((e) => e.id),
      craft: CRAFT_REVIEW_TOPICS.map((t) => t.id),
      flake: FLAKE_SCENARIOS.map((s) => s.id),
      ai: AI_QA.map((qa) => aiQuestionId(qa.question)),
    };
    for (const [kindId, ids] of Object.entries(items)) {
      const kind = KINDS.find((k) => k.id === kindId)!;
      expect(ids.length, kindId).toBeGreaterThan(0);
      for (const id of ids) {
        const title = kind.titleFor(id, ctx);
        expect(title.length, `${kindId}:${id}`).toBeGreaterThan(0);
        expect(title, `${kindId}:${id} resolved to the missing-item fallback`).not.toMatch(
          /^A removed /
        );
      }
    }
  });

  // Rating something, then having it deleted from the data, must not blank the queue row.
  it('says so when an item is gone rather than rendering nothing', () => {
    for (const kind of KINDS) {
      const title = kind.titleFor('definitely-not-a-real-id', ctx);
      expect(title.length, kind.id).toBeGreaterThan(0);
    }
  });

  it('names a story, and handles untitled and deleted ones', () => {
    const story = KINDS.find((k) => k.id === 'story')!;
    const base = {
      id: 'a',
      principles: [],
      situation: '',
      task: '',
      action: '',
      result: '',
      updatedAt: 0,
    };
    expect(story.titleFor('a', { stories: [{ ...base, title: 'Flaky checkout' }] })).toBe(
      'Flaky checkout'
    );
    expect(story.titleFor('a', { stories: [{ ...base, title: '  ' }] })).toBe('Untitled story');
    expect(story.titleFor('a', { stories: [] })).toBe('A deleted story');
  });
});

describe('aiQuestionId', () => {
  it('is stable, url-safe and unique across the question bank', () => {
    const ids = AI_QA.map((qa) => aiQuestionId(qa.question));
    expect(new Set(ids).size).toBe(AI_QA.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
      expect(id.startsWith('-') || id.endsWith('-')).toBe(false);
    }
  });
});
