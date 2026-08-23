import {
  LEADERSHIP_PRINCIPLES,
  STORIES_PER_PRINCIPLE,
  type LeadershipPrinciple,
} from '../data/leadershipPrinciples';

/**
 * A STAR story, in your own words.
 *
 * One story usually serves several principles — a flaky-test root cause is Dive Deep and often
 * Ownership and Deliver Results too — so `principles` is a list. Surfacing that overlap is the
 * point: it is what turns "twenty-one stories" into something like eight or nine real ones.
 */
export interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  principles: string[];
  updatedAt: number;
}

export const STAR_FIELDS = [
  { key: 'situation', label: 'Situation', hint: 'Where and when. One or two sentences — this is the part people over-tell.' },
  { key: 'task', label: 'Task', hint: 'What was on you specifically, and what made it hard.' },
  { key: 'action', label: 'Action', hint: 'What you did. First person singular. This should be the longest part.' },
  { key: 'result', label: 'Result', hint: 'The outcome, with a number. And what you would do differently.' },
] as const;

export type StarField = (typeof STAR_FIELDS)[number]['key'];

export function emptyStory(id: string, now: number, principles: string[] = []): Story {
  return {
    id,
    title: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    principles,
    updatedAt: now,
  };
}

/** A story counts as usable once it has a title and something in every STAR field. */
export function isComplete(story: Story): boolean {
  return (
    story.title.trim() !== '' && STAR_FIELDS.every((f) => story[f.key].trim() !== '')
  );
}

export interface PrincipleCoverage {
  principle: LeadershipPrinciple;
  stories: Story[];
  /** Complete stories only — a half-written draft does not cover a principle. */
  ready: number;
  target: number;
  met: boolean;
}

export function coverageFor(stories: Story[]): PrincipleCoverage[] {
  return LEADERSHIP_PRINCIPLES.map((principle) => {
    const attached = stories.filter((s) => s.principles.includes(principle.id));
    const ready = attached.filter(isComplete).length;
    return {
      principle,
      stories: attached,
      ready,
      target: STORIES_PER_PRINCIPLE,
      met: ready >= STORIES_PER_PRINCIPLE,
    };
  });
}

export interface CoverageSummary {
  /** Across the seven principles reported most often. */
  coreMet: number;
  coreTotal: number;
  /** Across all sixteen. */
  allMet: number;
  allTotal: number;
  /** Principles with nothing attached at all — where to start. */
  uncovered: LeadershipPrinciple[];
  storiesWritten: number;
  storiesComplete: number;
}

export function summariseCoverage(stories: Story[]): CoverageSummary {
  const coverage = coverageFor(stories);
  const core = coverage.filter((c) => c.principle.core);
  return {
    coreMet: core.filter((c) => c.met).length,
    coreTotal: core.length,
    allMet: coverage.filter((c) => c.met).length,
    allTotal: coverage.length,
    uncovered: coverage.filter((c) => c.ready === 0).map((c) => c.principle),
    storiesWritten: stories.length,
    storiesComplete: stories.filter(isComplete).length,
  };
}

/**
 * Review ids for stories are namespaced, so one queue can hold both problems and stories without
 * a story id ever colliding with an algorithm id.
 */
export const STORY_REVIEW_PREFIX = 'story:';

export const storyReviewId = (storyId: string): string => `${STORY_REVIEW_PREFIX}${storyId}`;

export const isStoryReviewId = (id: string): boolean => id.startsWith(STORY_REVIEW_PREFIX);

export const storyIdFromReviewId = (id: string): string =>
  id.slice(STORY_REVIEW_PREFIX.length);

/** A story's display title from its id — the review queue holds ids, not stories. */
export function storyTitleFor(stories: Story[], storyId: string): string {
  const story = stories.find((s) => s.id === storyId);
  if (!story) return 'A deleted story';
  return story.title.trim() || 'Untitled story';
}
