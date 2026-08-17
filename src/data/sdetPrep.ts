/**
 * SDET interview prep list.
 *
 * SOURCING — read this before trusting the ordering.
 *
 * No company publishes per-question frequency data for SDET loops, so nothing here is a
 * measured statistic. This list is a synthesis of publicly reported SDET interview
 * experiences, SDET-specific prep guides, and company interview pages (Amazon SDET/SDET-I
 * loops, Meta QA Automation "Ninja" coding round, Akamai SDET II reports, plus several
 * SDET-focused DSA question collections). Where those sources agreed, a problem is ranked
 * higher. Treat the tiers as "how consistently this shows up in reports", not as a
 * percentage.
 *
 * What the sources agree on, and why the list looks like this:
 *  - SDET coding rounds skew heavily to Easy and lower-Medium. Hard is rare.
 *  - Strings, hash-map frequency counting, two pointers and basic linked-list/tree work
 *    dominate. Advanced DP and advanced graph algorithms are largely absent.
 *  - Interviewers weight edge-case reasoning, clean compilable code and spoken complexity
 *    analysis more than they weight finding a clever optimum — which is why the `why`
 *    notes below are about what is being probed, not just the technique.
 */

export type SdetTier = 'core' | 'likely' | 'deeper';

export interface SdetEntry {
  /** must match an Algorithm id in src/algorithms */
  id: string;
  tier: SdetTier;
  /** what an SDET interviewer is actually probing with this one */
  why: string;
}

export const SDET_TIERS: {
  id: SdetTier;
  label: string;
  blurb: string;
  accent: string;
}[] = [
  {
    id: 'core',
    label: 'Expect these',
    blurb:
      'The Easy string / array / hash-map / linked-list core. Reported in almost every SDET screen. You should be able to write these cleanly, first try, while talking through edge cases.',
    accent: 'text-green-400',
  },
  {
    id: 'likely',
    label: 'Very likely',
    blurb:
      'Lower-Medium pattern workhorses — two pointers, sliding window, frequency maps, basic traversals and binary search. Common in the second coding round and for SDET II.',
    accent: 'text-yellow-400',
  },
  {
    id: 'deeper',
    label: 'Deeper rounds',
    blurb:
      'Medium problems that show up for senior SDET, platform/infra-test roles, and FAANG loops. Less consistent across reports, but worth having seen.',
    accent: 'text-indigo-400',
  },
];

export const SDET_QUESTIONS: SdetEntry[] = [
  // ---------------------------------------------------------------- core
  {
    id: 'valid-anagram',
    tier: 'core',
    why: 'The canonical SDET string question. Interviewers watch whether you reach for a frequency map instead of sorting, and whether you check lengths first.',
  },
  {
    id: 'two-sum',
    tier: 'core',
    why: 'Asked as a warm-up almost universally. The real test is whether you volunteer the hash-map trade-off rather than settling for the nested loop.',
  },
  {
    id: 'valid-palindrome',
    tier: 'core',
    why: 'Probes character filtering and case handling — exactly the kind of input-sanitisation reasoning test engineers are hired for.',
  },
  {
    id: 'first-unique-character',
    tier: 'core',
    why: 'Named in SDET guides as the go-to hash-map-plus-string-traversal question. Two passes is the expected answer; one pass is a trap.',
  },
  {
    id: 'contains-duplicate',
    tier: 'core',
    why: 'A 30-second screen for whether you know a set is the right container. Often the first thing asked on a phone screen.',
  },
  {
    id: 'reverse-string',
    tier: 'core',
    why: 'Explicitly listed in Amazon SDET question banks. Trivial logic; they are checking in-place two-pointer instinct and off-by-one care.',
  },
  {
    id: 'move-zeroes',
    tier: 'core',
    why: 'A standard SDET array question. The in-place write-index solution is expected, and the stability requirement is the edge case they probe.',
  },
  {
    id: 'palindrome-linked-list',
    tier: 'core',
    why: 'Reported verbatim in Amazon SDET loops, usually with an explicit "without extra space" constraint — which is the entire question.',
  },
  {
    id: 'reverse-linked-list',
    tier: 'core',
    why: 'The pointer-manipulation baseline. If you cannot do prev/curr/next fluently on a whiteboard, most SDET loops stop here.',
  },
  {
    id: 'linked-list-cycle',
    tier: 'core',
    why: 'Tests whether you know fast/slow pointers. A hash-set answer is accepted but they will then ask for O(1) space.',
  },
  {
    id: 'merge-two-sorted-lists',
    tier: 'core',
    why: 'Clean pointer bookkeeping plus the dummy-node idiom. Frequently paired with "now do it without recursion".',
  },
  {
    id: 'merge-sorted-array',
    tier: 'core',
    why: 'The in-place-from-the-back insight. A favourite because the naive front-to-back attempt fails and shows how you recover.',
  },
  {
    id: 'remove-duplicates-sorted-array',
    tier: 'core',
    why: 'Slow/fast pointer basics with an in-place constraint. Commonly asked right after Move Zeroes.',
  },
  {
    id: 'intersection-of-two-arrays',
    tier: 'core',
    why: 'Frequency-map counting with a duplicate-handling twist. Interviewers often follow up with "what if one array is huge and on disk" — a testing-flavoured question.',
  },
  {
    id: 'valid-parentheses',
    tier: 'core',
    why: 'The stack question. Nearly universal, and the empty-string and unmatched-closer cases are what they actually check.',
  },
  {
    id: 'max-depth-binary-tree',
    tier: 'core',
    why: 'The simplest recursion-on-a-tree question, used to confirm you can reason about base cases before anything harder.',
  },
  {
    id: 'invert-binary-tree',
    tier: 'core',
    why: 'Short enough to write under pressure and a clean check of recursive-versus-iterative fluency.',
  },
  {
    id: 'same-tree',
    tier: 'core',
    why: 'Structural comparison plus null handling. Directly analogous to writing a deep-equality assertion, which is why test roles like it.',
  },
  {
    id: 'best-time-to-buy-sell-stock',
    tier: 'core',
    why: 'The single-pass running-minimum idea. Cited in SDET target-problem lists as the first "think, do not brute force" question.',
  },
  {
    id: 'missing-number',
    tier: 'core',
    why: 'Has three valid answers (sum formula, XOR, set) and interviewers use it to see whether you can compare trade-offs out loud.',
  },
  {
    id: 'longest-common-prefix',
    tier: 'core',
    why: 'Vertical scanning with early exit. The empty-array and single-string edge cases are the real content.',
  },
  {
    id: 'roman-to-integer',
    tier: 'core',
    why: 'Pure parsing with a subtractive-pair rule — a small spec to implement exactly, which is close to day-to-day SDET work.',
  },

  // -------------------------------------------------------------- likely
  {
    id: 'group-anagrams',
    tier: 'likely',
    why: 'The natural follow-up to Valid Anagram. Shows whether you can design a hash key rather than just look one up.',
  },
  {
    id: 'longest-substring-without-repeating',
    tier: 'likely',
    why: 'The sliding-window archetype, and the most commonly reported Medium in SDET screens.',
  },
  {
    id: 'top-k-frequent',
    tier: 'likely',
    why: 'Frequency map plus a selection decision (heap, bucket or sort). Good for drawing out complexity discussion.',
  },
  {
    id: 'three-sum',
    tier: 'likely',
    why: 'Sort-then-two-pointers, and the duplicate-skipping logic is where most candidates lose the round.',
  },
  {
    id: 'product-except-self',
    tier: 'likely',
    why: 'The no-division constraint forces the prefix/suffix insight. Asked to see whether a constraint changes your approach.',
  },
  {
    id: 'majority-element',
    tier: 'likely',
    why: 'Accepts a hash-map answer, then they ask for O(1) space to see whether you know Boyer-Moore.',
  },
  {
    id: 'sort-colors',
    tier: 'likely',
    why: 'Dutch National Flag in one pass. A classic "can you do it in a single pass" escalation.',
  },
  {
    id: 'rotate-array',
    tier: 'likely',
    why: 'The three-reversal trick with O(1) space, plus the k > n modulo edge case interviewers always test.',
  },
  {
    id: 'min-stack',
    tier: 'likely',
    why: 'A design-a-data-structure question with an O(1) requirement — very common for SDET because it maps to building test utilities.',
  },
  {
    id: 'implement-queue-using-stacks',
    tier: 'likely',
    why: 'Amortised analysis in miniature. Interviewers ask you to justify why the average case is O(1).',
  },
  {
    id: 'evaluate-reverse-polish-notation',
    tier: 'likely',
    why: 'Stack evaluation plus operand-order and division-truncation details — a small spec to get exactly right.',
  },
  {
    id: 'binary-search',
    tier: 'likely',
    why: 'Expected to be written bug-free from memory, including the overflow-safe midpoint and the loop invariant.',
  },
  {
    id: 'search-2d-matrix',
    tier: 'likely',
    why: 'Index arithmetic on a flattened matrix, or the staircase walk. Tests whether you can map 2-D to 1-D cleanly.',
  },
  {
    id: 'sqrt-x',
    tier: 'likely',
    why: 'Binary search on the answer space rather than an array — the conceptual step that unlocks a whole problem family.',
  },
  {
    id: 'level-order-traversal',
    tier: 'likely',
    why: 'BFS with level boundaries. The "how do you know where a level ends" detail is the point.',
  },
  {
    id: 'diameter-binary-tree',
    tier: 'likely',
    why: 'Requires returning one value while tracking another — the first genuinely tricky recursion most candidates meet.',
  },
  {
    id: 'balanced-binary-tree',
    tier: 'likely',
    why: 'Naive top-down is O(n squared); the bottom-up fix is the discussion they want.',
  },
  {
    id: 'lowest-common-ancestor-bst',
    tier: 'likely',
    why: 'Uses the BST ordering property instead of searching blindly. Checks that you exploit given invariants.',
  },
  {
    id: 'climbing-stairs',
    tier: 'likely',
    why: 'The gentlest DP, usually the only DP that appears in an SDET screen. Rolling variables are the expected finish.',
  },
  {
    id: 'merge-intervals',
    tier: 'likely',
    why: 'Sort-then-sweep, and one of the most frequently reported Mediums across all interview types.',
  },
  {
    id: 'min-size-subarray-sum',
    tier: 'likely',
    why: 'Variable-width sliding window — the shrink condition is what separates a working answer from a stuck one.',
  },
  {
    id: 'longest-consecutive',
    tier: 'likely',
    why: 'Looks like it needs sorting; the set-based O(n) answer is the insight being tested.',
  },
  {
    id: 'spiral-matrix',
    tier: 'likely',
    why: 'Almost no algorithm, all boundary bookkeeping — which is exactly why test-focused interviewers reach for it.',
  },
  {
    id: 'set-matrix-zeroes',
    tier: 'likely',
    why: 'The in-place marker trick, and the first-row/first-column collision is a genuine edge case to reason about.',
  },
  {
    id: 'design-hash-map',
    tier: 'likely',
    why: 'Asked because SDETs are expected to understand the container they use every day, including collision handling and load factor.',
  },
  {
    id: 'subarray-sum-equals-k',
    tier: 'likely',
    why: 'Prefix sums plus a hash map, and negatives break the sliding-window instinct — a good discriminator.',
  },

  // -------------------------------------------------------------- deeper
  {
    id: 'number-of-islands',
    tier: 'deeper',
    why: 'The grid-traversal archetype and one of the most-asked Mediums anywhere. Expect it at FAANG-tier SDET loops.',
  },
  {
    id: 'kth-largest-element',
    tier: 'deeper',
    why: 'Heap versus quickselect is a genuine trade-off conversation, which is why it survives into senior rounds.',
  },
  {
    id: 'rotting-oranges',
    tier: 'deeper',
    why: 'Multi-source BFS with a time dimension. Appears when the interviewer wants a simulation flavour.',
  },
  {
    id: 'clone-graph',
    tier: 'deeper',
    why: 'Reference bookkeeping via a visited map — close to deep-copying object graphs in test fixtures.',
  },
  {
    id: 'course-schedule',
    tier: 'deeper',
    why: 'Cycle detection and topological order, which map directly onto test dependency and build ordering.',
  },
  {
    id: 'lru-cache',
    tier: 'deeper',
    why: 'The most-asked design-a-structure question. Hash map plus doubly linked list, with O(1) required on both operations.',
  },
  {
    id: 'coin-change',
    tier: 'deeper',
    why: 'The DP that actually appears when DP appears at all. Unbounded knapsack in its simplest form.',
  },
  {
    id: 'word-break',
    tier: 'deeper',
    why: 'String DP with a dictionary. Turns up for senior SDET where parsing and validation are part of the job.',
  },
  {
    id: 'house-robber',
    tier: 'deeper',
    why: 'The clearest illustration of a DP recurrence, and reducible to two rolling variables.',
  },
  {
    id: 'max-product-subarray',
    tier: 'deeper',
    why: 'Kadane with a sign twist — negatives make the naive running-max wrong, which is the whole lesson.',
  },
  {
    id: 'validate-bst',
    tier: 'deeper',
    why: 'The obvious per-node check is wrong; you need min/max bounds or an inorder scan. A good correctness-reasoning probe.',
  },
  {
    id: 'kth-smallest-bst',
    tier: 'deeper',
    why: 'Inorder traversal with early exit, and the iterative stack version is usually the follow-up ask.',
  },
  {
    id: 'longest-palindromic-substring',
    tier: 'deeper',
    why: 'Expand-around-centre, including the even-length case that trips most first attempts.',
  },
  {
    id: 'decode-string',
    tier: 'deeper',
    why: 'Nested-structure parsing with two stacks — a realistic stand-in for parsing test output or config.',
  },
  {
    id: 'daily-temperatures',
    tier: 'deeper',
    why: 'The monotonic stack. Worth recognising because the pattern reappears across many harder problems.',
  },
  {
    id: 'sliding-window-maximum',
    tier: 'deeper',
    why: 'Monotonic deque, and the hardest window problem that still shows up in practice.',
  },
  {
    id: 'permutations',
    tier: 'deeper',
    why: 'Backtracking basics — relevant to SDET because generating input combinations is a testing task.',
  },
  {
    id: 'subsets',
    tier: 'deeper',
    why: 'Powerset generation, which is literally what exhaustive test-case enumeration looks like.',
  },
  {
    id: 'first-missing-positive',
    tier: 'deeper',
    why: 'The O(1)-space cyclic-sort trick. Rare, but a strong signal when the interviewer wants to stretch a senior candidate.',
  },
];

/** Topics an SDET loop covers that this app deliberately does not. Shown in the UI so the
 *  list is not mistaken for a complete interview plan. */
export const SDET_NON_DSA_TOPICS = [
  'Selenium / Playwright / Cypress trade-offs',
  'Page Object Model and framework design',
  'REST API testing, status codes, contract tests',
  'Test strategy: unit vs integration vs e2e, the pyramid',
  'Debugging flaky tests, waits and locator strategy',
  'CI/CD pipelines and test parallelisation',
  'SQL for data validation and assertions',
  'Writing test cases for an ambiguous feature',
];

export const SDET_SOURCES: { label: string; url: string }[] = [
  {
    label: 'Amazon SDET interview experience (GeeksforGeeks, Set 128)',
    url: 'https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-set-128-sdet/',
  },
  {
    label: 'Meta QA Automation / SDET interview rounds (PrepnPlaced)',
    url: 'https://www.prepnplaced.com/companies/meta/interview-questions/qa-automation-engineer-sdet',
  },
  {
    label: 'Akamai SDET II interview experience (Taro)',
    url: 'https://www.jointaro.com/interviews/companies/akamai-technologies/experiences/software-development-engineer-in-test-sdet-ii-toronto-ontario-february-1-2024-no-offer-positive-08417d7d/',
  },
  {
    label: 'SDET coding challenges collection (GitHub)',
    url: 'https://github.com/connect-amittSangwan/sdet_coding_challenges',
  },
  {
    label: 'Top SDET interview questions (InterviewBit)',
    url: 'https://www.interviewbit.com/sdet-interview-questions/',
  },
  {
    label: 'Top 20 SDET interview questions (SoftwareTestingHelp)',
    url: 'https://www.softwaretestinghelp.com/sdet-interview-questions-and-answers/',
  },
  {
    label: 'Java coding questions for SDET (Medium, Pragya Singh)',
    url: 'https://medium.com/@pragyas215/most-asked-java-coding-interview-questions-for-sdet-part-2-1f06b08ae002',
  },
  {
    label: 'Top 30 SDET interview questions 2025 (Careerist)',
    url: 'https://www.careerist.com/insights/top-30-sdet-interview-questions-you-need-to-know-in-2025',
  },
];
