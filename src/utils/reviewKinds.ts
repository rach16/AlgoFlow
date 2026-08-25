/**
 * What can enter the review queue, in one table.
 *
 * WHY THIS EXISTS. The queue started out holding problems, then grew behavioral stories under a
 * `story:` id, then test-design exercises under `design:`. Each addition meant a new prefix
 * helper, a new branch in ReviewPage's row renderer, and a new clause in the audience filter —
 * three edits in three files to add one kind, with nothing checking they agreed. At three kinds
 * that was tolerable; at seven it is a copy-paste factory.
 *
 * So a kind is now a row in KINDS, and everything else derives from it: the id namespace, the
 * queue row's label and colour, whether the audience filter applies, and where the item lives.
 * Adding a section to the queue is one entry here plus a <ReviewControl> on its page.
 *
 * ON THE PREFIXES. `story:` and `design:` are load-bearing strings, not names — they are already
 * in users' localStorage under `algoflow-progress`, and changing one would orphan every review
 * scheduled against it. They stay exactly as they were.
 *
 * ON ALGORITHMS. Problems are deliberately not a kind. Their review id is the bare algorithm id
 * with no prefix, which is what makes every prefixed id unambiguous, and their queue row is
 * clickable in a way the others are not — it opens the visualizer. parseReviewId returns null for
 * them and the caller treats that as "this is a problem".
 */

import type { AppView } from '../components/layout/navigation';
import { AI_QA } from '../data/aiTesting';
import { BUILD_EXERCISES } from '../data/buildExercises';
import { CRAFT_REVIEW_TOPICS } from '../data/craft';
import { FLAKE_SCENARIOS } from '../data/flakeScenarios';
import { SQL_EXERCISES } from '../data/sqlExercises';
import { EXERCISES } from '../data/testDesign';
import type { Story } from './stories';

export type ReviewKindId = 'story' | 'design' | 'sql' | 'build' | 'ai' | 'craft' | 'flake';

/** Everything a queue row needs that is not in the ReviewRecord itself. */
export interface ReviewKind {
  id: ReviewKindId;
  /** The id namespace, including its colon. Persisted — see the note above. */
  prefix: string;
  /** What kind of thing this is, shown on the queue row. */
  label: string;
  /** What you are being asked to do with it when it comes back up. */
  action: string;
  /** Tailwind background for the row's dot. Distinct per kind so the queue reads at a glance. */
  dot: string;
  /** Where the item lives, so the queue can eventually send you there. */
  view: AppView;
  /**
   * Whether the audience filter ("who asks this") applies. It is about who asks a *coding*
   * question, so it applies to no kind here — but making that a field rather than a hardcoded
   * list in ReviewPage means a future kind that does want filtering can just say so.
   */
  audienceFiltered: boolean;
  /** Display title from the item id. The queue stores ids, not items. */
  titleFor: (itemId: string, ctx: ReviewTitleContext) => string;
}

/** Runtime data some titles need. Stories are user-authored, so they cannot be looked up statically. */
export interface ReviewTitleContext {
  stories: Story[];
}

/** The fallback when an item has been removed from the data since it was rated. */
const gone = (what: string) => `A removed ${what}`;

export const KINDS: ReviewKind[] = [
  {
    id: 'design',
    prefix: 'design:',
    label: 'Test design',
    action: 'enumerate it again from scratch',
    dot: 'bg-teal-400',
    view: 'testdesign',
    audienceFiltered: false,
    titleFor: (id) => EXERCISES.find((e) => e.id === id)?.title ?? gone('exercise'),
  },
  {
    id: 'story',
    prefix: 'story:',
    label: 'Behavioral story',
    action: 'retell it out loud',
    dot: 'bg-purple-400',
    view: 'behavioral',
    audienceFiltered: false,
    titleFor: (id, { stories }) => {
      const story = stories.find((s) => s.id === id);
      if (!story) return 'A deleted story';
      return story.title.trim() || 'Untitled story';
    },
  },
  {
    id: 'sql',
    prefix: 'sql:',
    label: 'SQL',
    action: 'write the query again from the prompt',
    dot: 'bg-amber-400',
    view: 'sql',
    audienceFiltered: false,
    titleFor: (id) => SQL_EXERCISES.find((e) => e.id === id)?.title ?? gone('query'),
  },
  {
    id: 'build',
    prefix: 'build:',
    label: 'Build round',
    action: 'build it again in twenty minutes',
    dot: 'bg-sky-400',
    view: 'build',
    audienceFiltered: false,
    titleFor: (id) => BUILD_EXERCISES.find((e) => e.id === id)?.title ?? gone('exercise'),
  },
  {
    id: 'ai',
    prefix: 'ai:',
    label: 'AI in testing',
    action: 'answer it out loud before revealing',
    dot: 'bg-fuchsia-400',
    view: 'ai',
    audienceFiltered: false,
    titleFor: (id) => AI_QA.find((qa) => aiQuestionId(qa.question) === id)?.question ?? gone('question'),
  },
  {
    id: 'craft',
    prefix: 'craft:',
    label: 'Tooling craft',
    action: 'reproduce the ranking and its reasons',
    dot: 'bg-lime-400',
    view: 'craft',
    audienceFiltered: false,
    titleFor: (id) => CRAFT_REVIEW_TOPICS.find((t) => t.id === id)?.title ?? gone('topic'),
  },
  {
    id: 'flake',
    prefix: 'flake:',
    label: 'Flake lab',
    action: 'explain the race and its fix',
    dot: 'bg-rose-400',
    view: 'flake',
    audienceFiltered: false,
    titleFor: (id) => FLAKE_SCENARIOS.find((s) => s.id === id)?.title ?? gone('scenario'),
  },
];

const BY_ID = new Map(KINDS.map((k) => [k.id, k]));

export function kind(id: ReviewKindId): ReviewKind {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`No review kind "${id}"`);
  return found;
}

/** Namespace an item id so it cannot collide with an algorithm id or another kind's item. */
export const reviewId = (kindId: ReviewKindId, itemId: string): string =>
  `${kind(kindId).prefix}${itemId}`;

/**
 * Split a queue id back into its kind and item. Returns null for an unprefixed id, which is how
 * an algorithm is represented — so null means "a problem", not "malformed".
 */
export function parseReviewId(id: string): { kind: ReviewKind; itemId: string } | null {
  for (const k of KINDS) {
    if (id.startsWith(k.prefix)) return { kind: k, itemId: id.slice(k.prefix.length) };
  }
  return null;
}

/**
 * The AI questions have no ids of their own — they are prose in a list. Deriving a stable id from
 * the question text keeps the data file free of bookkeeping, at the cost that rewording a question
 * orphans its schedule. That is the right trade here: a reworded question is a different question,
 * and its old schedule was about the old one.
 */
export const aiQuestionId = (question: string): string =>
  question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
