/**
 * Who actually asks a problem.
 *
 * The three kinds of employer that hire SDETs run genuinely different loops, and a site covering
 * all three is only useful if it can say which is which. Tagging every problem means the week
 * before a big-tech loop you can revise that set and nothing else, instead of working through a
 * pile with no signal about what to skip.
 *
 * WHERE THESE RULES COME FROM. Round structures reported for Amazon, Google (SETI), Meta, Apple
 * and Microsoft, cross-referenced with agency screen reports. Nobody publishes per-question
 * frequency data, so these are derivation rules over category and difficulty — deliberately
 * coarse, explainable, and overridable per problem. Treat them as "who is likely to ask this",
 * not as measurement.
 */

export type AudienceId = 'big-tech' | 'staffing' | 'startup';

export interface Audience {
  id: AudienceId;
  label: string;
  /** Shown as the filter's tooltip — says what the audience is, not what the filter does. */
  blurb: string;
}

export const AUDIENCES: Audience[] = [
  {
    id: 'big-tech',
    label: 'Big tech',
    blurb:
      'Amazon, Google, Meta, Apple, Microsoft. Coding is the gate and it sits at LeetCode-medium; Hard shows up in the core categories.',
  },
  {
    id: 'staffing',
    label: 'Staffing',
    blurb:
      'Agency and contract screens. Easy string and array work, often over the phone, with little or no data-structure depth.',
  },
  {
    id: 'startup',
    label: 'Startup',
    blurb:
      'Practical coding over theory. Easy to medium across the common structures, and rarely the heavy dynamic programming or graph work.',
  },
];

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/**
 * The only categories whose Hard problems sit below big tech's radar. Everywhere else a Hard is
 * fair game — Dijkstra, edit distance and Word Search II are all classic big-tech questions, so
 * listing "categories that DO ask Hard" would have meant listing almost everything.
 */
const BIG_TECH_SKIPS_HARD_IN = new Set(['math-geometry', 'bit-manipulation']);

/** Categories that turn up in agency phone screens at all. The rest never do. */
const SCREEN_CATEGORIES = new Set([
  'arrays-hashing',
  'two-pointers',
  'sliding-window',
  'stack',
  'linked-list',
  'trees',
]);

/** Theory-heavy categories startups tend not to screen on. */
const DEEP_CATEGORIES = new Set([
  'dp-2d',
  'advanced-graphs',
  'tries',
  'math-geometry',
  'bit-manipulation',
]);

/**
 * Per-problem overrides, for anything the coarse rules get wrong.
 *
 * Add an entry when a specific problem is reported at an employer the rules would exclude, or is
 * clearly beyond one. An explicit list is the right shape here: the rules stay simple and the
 * exceptions stay visible and reviewable, rather than being smuggled into the rules as special
 * cases nobody can audit.
 */
export const AUDIENCE_OVERRIDES: Record<string, AudienceId[]> = {};

/**
 * The audiences likely to ask a problem.
 *
 * Note that big tech comes out broad, and that is a true statement rather than a broken rule:
 * its coding rounds really do range across the whole catalogue. The narrow audiences are where
 * the filter earns its keep — 'staffing' is a short list you can actually work through before a
 * phone screen. For a tighter big-tech list, the Coding round tab's three tiers already exist.
 *
 * The fallback should almost never fire; it exists so a future rule change cannot leave a problem
 * belonging to nobody and silently unreachable under every filter.
 */
export function deriveAudiences(
  algorithmId: string,
  categoryId: string,
  difficulty: Difficulty
): AudienceId[] {
  const override = AUDIENCE_OVERRIDES[algorithmId];
  if (override) return [...override];

  const audiences: AudienceId[] = [];

  if (difficulty !== 'Hard' || !BIG_TECH_SKIPS_HARD_IN.has(categoryId)) {
    audiences.push('big-tech');
  }
  if (difficulty === 'Easy' && SCREEN_CATEGORIES.has(categoryId)) {
    audiences.push('staffing');
  }
  if (difficulty !== 'Hard' && !DEEP_CATEGORIES.has(categoryId)) {
    audiences.push('startup');
  }

  return audiences.length > 0 ? audiences : ['big-tech'];
}
