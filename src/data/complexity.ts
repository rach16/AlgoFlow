import type { ComplexityNote, MethodSection } from './complexityTypes';
export { noteKey } from './complexityTypes';
export type { ComplexityNote, MethodSection } from './complexityTypes';

/**
 * Complexity derivations.
 *
 * Two kinds of content live here:
 *
 *  1. COMPLEXITY_METHOD — how to derive complexity at all. This is the transferable part:
 *     the counting rules, the code shapes that map to each class, the costs people miss,
 *     and how to sanity-check an answer. It does not depend on any particular problem.
 *
 *  2. COMPLEXITY_NOTES — the per-problem, per-approach derivation. Keyed
 *     `${algorithmId}:${approachId}` (approachId is `optimal` for the main solution).
 *     Each note walks from "what is n" to the stated bound, rather than asserting it.
 *
 * A missing note is not an error — the UI falls back to showing just the bound. That keeps
 * the two datasets independent so notes can be filled in incrementally.
 */

import { arraysHashingNotes } from './complexityNotes/arraysHashing';
import { treesNotes } from './complexityNotes/trees';
import { graphsNotes } from './complexityNotes/graphs';
import { dpNotes } from './complexityNotes/dp';
import { stackLinkedListNotes } from './complexityNotes/stackLinkedList';
import { pointersSearchNotes } from './complexityNotes/pointersSearch';
import { backtrackingTriesNotes } from './complexityNotes/backtrackingTries';
import { heapIntervalsNotes } from './complexityNotes/heapIntervals';
import { greedyMathBitsNotes } from './complexityNotes/greedyMathBits';

export const COMPLEXITY_METHOD: MethodSection[] = [
  {
    id: 'the-rule',
    title: 'The whole rule, in one line',
    intro:
      'Count how many operations run as a function of the input size, then throw away everything that stops mattering as the input grows.',
    rows: [
      { left: 'Define n', right: 'Say what n *is* first — array length, string length, number of nodes, number of edges. Half of all confusion is not naming n.' },
      { left: 'Count operations', right: 'How many times does the innermost work happen, in terms of n?' },
      { left: 'Drop constants', right: '3n becomes O(n). Two separate passes over the array is still O(n), not O(2n).' },
      { left: 'Keep only the dominant term', right: 'n² + n becomes O(n²). For large n the n is noise.' },
    ],
    notes: [
      'Big-O is an upper bound on growth, not a measure of speed. O(n) is not "fast" — it means doubling the input roughly doubles the work. That is the only claim being made.',
      'This is why constants are dropped: a 100-step O(n) algorithm can easily beat a 1-step O(n log n) one at n = 50. Big-O describes the shape of the curve, not where it sits.',
    ],
  },
  {
    id: 'shapes',
    title: 'Code shape → cost',
    intro:
      'Almost every interview answer comes from recognising one of these shapes. Read the code and match it.',
    rows: [
      { left: 'One loop over the input', right: 'O(n) — the workhorse. A single pass.' },
      { left: 'Two loops one after the other', right: 'O(n) still. Sequential work ADDS, and O(n) + O(n) = O(2n) = O(n).' },
      { left: 'A loop inside a loop, both over n', right: 'O(n²) — nested work MULTIPLIES. This is the brute-force signature.' },
      { left: 'Inner loop starts at i (not 0)', right: 'Still O(n²). It runs n(n-1)/2 times, which is n²/2, and constants drop.' },
      { left: 'Halving the range each step', right: 'O(log n) — binary search. You can only halve n about log₂n times before hitting 1.' },
      { left: 'Sort, then one pass', right: 'O(n log n) — the sort dominates. The pass is free by comparison.' },
      { left: 'A loop over n, doing a binary search inside', right: 'O(n log n) — n iterations × log n each.' },
      { left: 'Two pointers moving toward each other', right: 'O(n) — together they cover each element once, even though there are two of them.' },
      { left: 'Sliding window, each element enters and leaves once', right: 'O(n) — not O(n²), even with a nested-looking while.' },
      { left: 'Every subset / every permutation', right: 'O(2ⁿ) / O(n!) — the exponential shapes. Backtracking lives here.' },
      { left: 'Grid traversal visiting each cell once', right: 'O(m·n) — say rows × columns, not "n²", unless the grid is square.' },
      { left: 'Graph traversal (BFS/DFS)', right: 'O(V + E) — every vertex once, every edge once. Two different sizes, so name both.' },
    ],
  },
  {
    id: 'recursion',
    title: 'Recursion: draw the tree',
    intro:
      'For recursive code, stop counting loops and count the call tree instead: how many branches per call, and how deep does it go?',
    rows: [
      { left: 'branches ^ depth', right: 'The rough number of calls. Two recursive calls, depth n → 2ⁿ.' },
      { left: 'Binary tree traversal', right: 'O(n) — the tree has n nodes and you visit each once. Depth does not multiply here.' },
      { left: 'Recurse on half each time', right: 'O(log n) depth — binary search written recursively.' },
      { left: 'Fibonacci, naively', right: 'O(2ⁿ) — two calls per level, depth n, and the same subproblems recomputed constantly.' },
      { left: 'Same, with memoisation', right: 'O(n) — each distinct subproblem is solved once. Memoisation collapses the tree into the number of distinct states.' },
    ],
    notes: [
      'That last row is the whole idea behind dynamic programming: the bound becomes "number of distinct states × cost to fill one state". For a 2-D DP table that is usually O(m·n) states × O(1) work = O(m·n).',
      'Recursion always costs space too, even when it allocates nothing: every pending call holds a stack frame. Depth is the space bound.',
    ],
  },
  {
    id: 'amortised',
    title: 'Amortised: when a nested loop is still O(n)',
    intro:
      'Sometimes an inner while-loop looks like it makes things quadratic, but cannot actually run that often. Count the TOTAL work across the whole run, then divide.',
    notes: [
      'A monotonic stack is the classic case. The outer loop runs n times and there is a while-loop inside popping the stack — that looks like O(n²). But each element is pushed exactly once and popped at most once, so the total number of pops across the entire run is at most n. Total work O(n), over n iterations, so O(1) amortised per step and O(n) overall.',
      'The test to apply: can the inner loop do a lot of work on *every* outer iteration, or is it spending from a budget that gets refilled only n times in total? If it is a budget, you are amortised.',
      'Sliding window is the same argument — the left pointer only ever moves forward, so across the whole run it advances at most n times.',
    ],
  },
  {
    id: 'hidden',
    title: 'Costs hiding in one-liners',
    intro:
      'This is where most wrong answers come from. These all look like a single cheap operation and are not.',
    rows: [
      { left: 'sorted(x) / arr.sort()', right: 'O(n log n). Still true when tucked inside a comprehension or a key= function.' },
      { left: 'x in myList / arr.includes(x)', right: 'O(n) — a scan. Inside a loop that is O(n²). This is the single most common trap.' },
      { left: 'x in mySet / x in myDict', right: 'O(1) average. THIS is why you convert a list to a set first.' },
      { left: 'arr[1:] or arr[:-1] (slicing)', right: 'O(n) — it copies. Recursing on a slice turns an O(n) algorithm into O(n²).' },
      { left: 's += char in a loop', right: 'Can be O(n²) — strings are immutable, so each += may rebuild the whole string. Collect into a list and join.' },
      { left: 'min(arr) / max(arr) / sum(arr)', right: 'O(n) each. Calling max() inside a loop over the same array is O(n²).' },
      { left: 'list.insert(0, x) / list.pop(0)', right: 'O(n) — everything shifts. Use a deque for O(1) at both ends.' },
      { left: 'set(a) & set(b)', right: 'O(len(a) + len(b)) to build, then O(min) to intersect. Cheap, but not free.' },
      { left: 'heapq.heappush / heappop', right: 'O(log n) each, not O(1). n pushes is O(n log n).' },
      { left: 'Building a heap from a list', right: 'heapify is O(n), which is better than n individual pushes.' },
    ],
  },
  {
    id: 'space',
    title: 'Space: what actually counts',
    intro:
      'Space is the extra memory you allocate that grows with the input. The convention is to count auxiliary space and exclude the input itself.',
    rows: [
      { left: 'A few variables / pointers', right: 'O(1) — a fixed number of them, no matter how big n is.' },
      { left: 'A fixed-size array like int[26]', right: 'O(1). 26 does not grow with n. This surprises people, but the definition is "bounded by a constant".' },
      { left: 'A hash map that can hold every element', right: 'O(n) — worst case every input is distinct.' },
      { left: 'A hash map over a fixed alphabet', right: 'O(1) — at most 26 or 128 keys regardless of n.' },
      { left: 'Recursion, depth d', right: 'O(d) for the call stack. Balanced tree → O(log n). Skewed tree or linked list → O(n).' },
      { left: 'A 2-D DP table', right: 'O(m·n). Often reducible to O(n) by keeping only the previous row.' },
      { left: 'The output you must return', right: 'Conventionally NOT counted — but say so out loud. "O(1) auxiliary, not counting the output array" is the answer that sounds senior.' },
      { left: 'In-place, but you sorted first', right: 'O(log n) or O(n) — sorting itself needs space. Timsort is O(n), quicksort is O(log n) for the stack.' },
    ],
  },
  {
    id: 'sanity',
    title: 'Sanity-checking your answer',
    intro:
      'Two quick tests that catch most mistakes before you commit to a bound out loud.',
    notes: [
      'Scale the input and predict. If n goes from 10 to 100, O(n) work goes up 10×, O(n log n) about 13×, O(n²) 100×, O(2ⁿ) is already hopeless. Trace roughly how many times your innermost line runs at both sizes and see which curve it matches.',
      'Find the innermost statement and ask how many times it executes in total. That count, in terms of n, IS your time complexity — everything else is bookkeeping around it.',
      'Then state it as a sentence, not a symbol: "we touch each element once and each lookup is constant, so O(n) time; the map can hold every element, so O(n) space". If you can say the sentence, you understand the bound.',
    ],
  },
];

/**
 * Per-problem derivations, keyed `${algorithmId}:${approachId}`.
 * `optimal` is the approach id of each algorithm's main solution.
 */
/** Hand-written exemplars, one per distinct pattern. These are the reference for voice and
 *  depth; the per-category files under ./complexityNotes follow them. */
const CORE_NOTES: Record<string, ComplexityNote> = {
  // ---- single-pass hash map, and the sort+two-pointer contrast -------------------
  'two-sum:optimal': {
    time: [
      'n is the length of nums.',
      'One pass over nums, so n iterations.',
      'Inside the loop the only real work is a hash-map lookup and an insert — O(1) each on average.',
      'n iterations x O(1) = O(n).',
    ],
    space: [
      'The map can end up holding every element before a match is found.',
      'That is n entries, so O(n).',
    ],
    gotcha:
      'The brute force is O(n squared) purely because `complement in nums` scans the list. Swapping that list for a hash map is the entire optimisation: an O(n) lookup becomes O(1).',
  },
  'two-sum:sort-two-pointers': {
    time: [
      'Sorting the (value, index) pairs is O(n log n) — this dominates everything else.',
      'The two-pointer squeeze then moves left and right toward each other, covering each element at most once: O(n).',
      'Sequential steps add, so O(n log n) + O(n) = O(n log n).',
    ],
    space: [
      'We build an array of n (value, index) pairs so the original indices survive the sort.',
      'That is O(n), even though the pointer scan itself needs nothing.',
    ],
    gotcha:
      'Slower than the hash map, so why learn it? Because this squeeze is the pattern behind 3Sum, 4Sum and Container With Most Water — and on already-sorted input it needs no extra space at all.',
  },

  // ---- O(1) space: what "constant" actually means ---------------------------------
  'valid-anagram:optimal': {
    time: [
      'n is the length of each string — we return early if the lengths differ.',
      'One pass reading both strings at the same index: n iterations.',
      'Each iteration does two hash-map updates, O(1) each.',
      'Then a final scan of the map, which holds at most 26 keys for lowercase input, so O(1).',
      'Total O(n).',
    ],
    space: [
      'The map holds one entry per DISTINCT character.',
      'For lowercase a-z that is capped at 26 — a constant, so O(1).',
    ],
    gotcha:
      'That O(1) only holds because the alphabet is bounded. For arbitrary Unicode it is O(k) for k distinct characters, i.e. O(min(n, alphabet size)). Interviewers do push on this.',
  },
  'valid-anagram:count-array': {
    time: [
      'Same structure as the hash-map version: a single pass of n iterations.',
      'Array indexing is O(1) with no hashing, so the constant factor is lower — but the class is identical, O(n).',
    ],
    space: [
      'A fixed int[26], allocated no matter how large n is.',
      '26 is a constant, so O(1).',
    ],
    gotcha:
      'This is the clearest example of O(1) meaning "bounded by a constant", not "small". A 26-slot array is O(1). A million-slot array is also O(1). Neither grows with n.',
  },

  // ---- time-for-space trade, stated explicitly ------------------------------------
  'contains-duplicate:optimal': {
    time: [
      'One pass over n elements.',
      'Each step is a set lookup and possibly an insert: O(1) on average.',
      'O(n) total.',
    ],
    space: ['The set holds all n elements when there is no duplicate, so O(n).'],
    gotcha:
      'Average case, not worst. Adversarial hash collisions can degrade each lookup to O(n), making the whole thing quadratic. In an interview, say "O(n) average".',
  },
  'contains-duplicate:sorting': {
    time: [
      'The sort is O(n log n) and dominates.',
      'Then one pass comparing each element to its neighbour: O(n).',
      'O(n log n) + O(n) = O(n log n).',
    ],
    space: [
      'Nothing is allocated — we only compare adjacent pairs.',
      'O(1) if the sort is in-place, which is language-dependent: Java Arrays.sort on primitives is in-place, Python sorted() copies.',
    ],
    gotcha:
      'Slower than the hash set but uses no extra memory. That is the actual lesson: you are trading time for space, and which one you want depends on the constraint you are given.',
  },

  // ---- carrying state forward instead of looking back ----------------------------
  'best-time-to-buy-sell-stock:optimal': {
    time: [
      'One pass over n prices.',
      'Per price: one comparison against the running minimum and one subtraction — O(1).',
      'O(n) total.',
    ],
    space: [
      'Two numbers: the cheapest price so far, and the best profit so far.',
      'A fixed count regardless of n, so O(1).',
    ],
    gotcha:
      'Brute force checks every (buy, sell) pair: O(n squared). The insight that collapses it to O(n) is that you never need to look backward — the best buy price for today is just the minimum seen so far, which one variable can carry.',
  },

  // ---- amortised: why a nested while is still linear ------------------------------
  'longest-substring-without-repeating:optimal': {
    time: [
      'The right pointer moves forward exactly n times.',
      'The left pointer also only ever moves forward, so across the whole run it advances at most n times.',
      'Both pointers together make at most 2n moves — the nested-looking while loop is amortised, not quadratic.',
      'O(n).',
    ],
    space: [
      'The map holds the characters currently inside the window.',
      'Bounded by both the window size (n) and the alphabet size (m), so O(min(n, m)).',
    ],
    gotcha:
      'The while inside the for makes this look like O(n squared). It is not: left never resets or moves backward, so it spends a total budget of n moves. That amortised argument is the whole point of the sliding-window pattern.',
  },
  'daily-temperatures:optimal': {
    time: [
      'The outer loop runs n times.',
      'The inner while pops from the stack, which looks like it could make this O(n squared).',
      'But each index is pushed exactly once and popped at most once, so total pops across the entire run is at most n.',
      'O(n) outer + O(n) pops = O(n).',
    ],
    space: [
      'The stack can hold every index in the worst case — a strictly decreasing series.',
      'O(n).',
    ],
    gotcha:
      'This is the canonical amortised question. The answer that lands names the budget: "each element is pushed once and popped at most once, so the pops total n across the whole run".',
  },

  // ---- halving, and why recursion changes the space bound -------------------------
  'binary-search:optimal': {
    time: [
      'Each iteration discards half the remaining range.',
      'Starting from n you can halve only until you reach 1: n, n/2, n/4, and so on.',
      'That takes log base 2 of n steps, so O(log n).',
    ],
    space: ['Three indices: lo, hi and mid.', 'The iterative form allocates nothing, so O(1).'],
    gotcha:
      'Written recursively it is still O(log n) time but O(log n) SPACE, because every pending call holds a stack frame. Same algorithm, different space bound.',
  },

  // ---- sequential vs nested: the most common mistake ------------------------------
  'three-sum:optimal': {
    time: [
      'The sort is O(n log n).',
      'Then the outer loop fixes each first element: n iterations.',
      'For each of those, a two-pointer squeeze scans the rest: O(n).',
      'Nested loops multiply: n x n = O(n squared).',
      'O(n squared) dominates O(n log n), so the answer is O(n squared).',
    ],
    space: [
      'Nothing beyond the pointers.',
      'O(1) auxiliary, not counting the output list of triplets.',
    ],
    gotcha:
      'People answer O(n squared log n) by multiplying the sort in. The sort happens ONCE, before the loops — sequential work adds, so it is dominated, not multiplied.',
  },

  // ---- DP: states x work per state ------------------------------------------------
  'climbing-stairs:optimal': {
    time: ['One loop from 2 to n: n iterations.', 'Each step is a single addition, O(1).', 'O(n).'],
    space: [
      'Only the previous two values are ever needed.',
      'Two variables, so O(1) — the full DP array is unnecessary.',
    ],
    gotcha:
      'Naive recursion is O(2 to the n) because it recomputes the same subproblems exponentially often. Memoising drops it to O(n); noticing you only need the last two values drops space from O(n) to O(1).',
  },
  'coin-change:optimal': {
    time: [
      'Let n be the number of coin denominations and A the target amount.',
      'The outer loop fills every amount from 1 to A: A iterations.',
      'For each amount we try every coin: n iterations.',
      'Nested, so O(n x A).',
    ],
    space: ['A DP array with one slot per amount from 0 to A, so O(A).'],
    gotcha:
      'This is pseudo-polynomial: A is the VALUE of the input, not its length. Adding one digit to the amount multiplies the work tenfold, which is why this is not truly polynomial.',
  },
  'unique-paths:optimal': {
    time: [
      'Fill one DP cell per grid position: m x n cells.',
      'Each cell is one addition of the cell above and the cell to the left, O(1).',
      'O(m x n).',
    ],
    space: [
      'Only the previous row is needed to compute the current one.',
      'One row of n values, so O(n) — down from O(m x n) for the full table.',
    ],
    gotcha:
      'There is also a pure-maths answer: the count is the binomial coefficient C(m+n-2, m-1), computable in O(min(m, n)) time and O(1) space. The table is the teachable version; the identity is the fast one.',
  },
  // ---- grids and graphs: name every size ------------------------------------------
  'number-of-islands:optimal': {
    time: [
      'The outer scan visits each of the m x n cells once.',
      'Each DFS marks cells as visited, so no cell is ever explored twice.',
      'Total work is proportional to the number of cells, not cells x islands: O(m x n).',
    ],
    space: [
      'The DFS recursion stack, worst case where the entire grid is one island.',
      'Depth can reach m x n, so O(m x n).',
    ],
    gotcha:
      'It is tempting to multiply by the number of islands. You cannot — visited-marking means every cell is touched a constant number of times overall, however the islands are arranged.',
  },
  'course-schedule:optimal': {
    time: [
      'V is the number of courses, E the number of prerequisite pairs. Name both — there is no single n here.',
      'Building the adjacency list touches each edge once: O(E).',
      'The traversal visits each course once and walks each edge once: O(V + E).',
    ],
    space: [
      'The adjacency list stores every edge, O(E). The visited/state array is O(V).',
      'Together O(V + E).',
    ],
    gotcha:
      'Answering O(n squared) is the usual error. Only a DENSE graph has E close to V squared, and most inputs are sparse — so the honest bound keeps V and E separate.',
  },

  // ---- when the output itself is exponential --------------------------------------
  'subsets:optimal': {
    time: [
      'There are 2 to the n subsets, since each of the n elements is either in or out.',
      'Building each subset costs up to O(n) to copy it into the output.',
      'O(n x 2 to the n).',
    ],
    space: [
      'Recursion depth is n, and the current path holds at most n elements.',
      'O(n) auxiliary — the exponential output itself is conventionally excluded.',
    ],
    gotcha:
      'The 2 to the n is not pessimism, it is the SIZE OF THE ANSWER. You cannot enumerate 2 to the n subsets in less than that time. When the output is exponential, the algorithm must be too.',
  },

  // ---- average vs worst case ------------------------------------------------------
  'kth-largest-element:optimal': {
    time: [
      'Quickselect partitions around a pivot, then recurses into ONLY the side containing k.',
      'On average each partition halves the remaining range: n + n/2 + n/4 + ... which sums to about 2n.',
      'Worst case, with consistently terrible pivots, each partition removes only one element: n + (n-1) + (n-2) + ... = O(n squared). A random pivot makes that vanishingly unlikely.',
      'O(n) average, O(n squared) worst case.',
    ],
    space: ['Partitioning is in-place and the iterative form keeps no stack, so O(1).'],
    gotcha:
      'Never say a bare "O(n)" here. Say "O(n) average, O(n squared) worst case" — quickselect being average-case is the entire reason the guaranteed O(n log k) min-heap alternative exists.',
  },

  // ---- when the sort is the answer ------------------------------------------------
  'merge-intervals:optimal': {
    time: [
      'Sorting by start time is O(n log n).',
      'Then one linear sweep merging adjacent overlaps: O(n).',
      'The sort dominates: O(n log n).',
    ],
    space: [
      'The output list, which holds all n intervals when nothing overlaps.',
      'O(n) — or O(log n) auxiliary if you exclude the output and count only the sort stack.',
    ],
    gotcha:
      'Nearly every intervals problem is O(n log n) for this reason: the sort is the expensive part and the logic is a cheap single pass. Spotting that lets you state the bound before writing any code.',
  },

  // ---- height, not node count -----------------------------------------------------
  'max-depth-binary-tree:optimal': {
    time: ['Every node is visited exactly once.', 'O(n) for n nodes.'],
    space: [
      'The recursion stack holds one frame per level on the current path.',
      'That is O(h) for height h.',
      'A balanced tree gives h = log n, so O(log n). A degenerate list-shaped tree gives h = n, so O(n).',
    ],
    gotcha:
      'O(h) is the precise space answer, and h ranges from log n to n depending on tree SHAPE. Saying "O(log n)" assumes a balance you were never promised.',
  },

  // ---- O(1) by construction -------------------------------------------------------
  'lru-cache:optimal': {
    time: [
      'get: one hash-map lookup, O(1), plus unlinking and relinking a node, O(1).',
      'put: one map write plus a constant number of pointer updates, O(1).',
      'Both operations are O(1) worst case, not amortised.',
    ],
    space: [
      'The map and the linked list each hold at most `capacity` entries.',
      'O(capacity), usually written O(n).',
    ],
    gotcha:
      'The doubly linked list exists purely so eviction and reordering are O(1). With a plain array you would scan to find the least-recently-used entry — O(n) per operation, defeating the point of a cache.',
  },

  // ---- same time class, different space -------------------------------------------
  'trapping-rain-water:optimal': {
    time: ['Two pointers move inward and together cover each index exactly once.', 'O(n).'],
    space: ['Four scalars: two pointers and two running maxima.', 'O(1).'],
    gotcha:
      'The prefix/suffix-array version is also O(n) time but O(n) space. Identical time class, different space — exactly the comparison the two approach tabs exist to show.',
  },
  'product-except-self:optimal': {
    time: [
      'One left-to-right pass building prefix products, one right-to-left pass folding in suffix products.',
      'Two sequential passes add: O(n) + O(n) = O(n).',
    ],
    space: [
      'The result array doubles as the accumulator and only a single running product is carried.',
      'O(1) auxiliary, excluding the output array.',
    ],
    gotcha:
      'That O(1) depends on not counting the output. If the interviewer counts it, the honest answer is O(n) — always state which convention you are using.',
  },
};

/**
 * The public registry. Composed from the hand-written exemplars plus one file per category,
 * so parallel authoring never touches a shared object. Later spreads win on key collision,
 * which cannot happen in practice — each file owns a disjoint set of (algorithm, approach)
 * pairs, and the test suite asserts every key resolves to a real one.
 */
export const COMPLEXITY_NOTES: Record<string, ComplexityNote> = {
  ...CORE_NOTES,
  ...arraysHashingNotes,
  ...treesNotes,
  ...graphsNotes,
  ...dpNotes,
  ...stackLinkedListNotes,
  ...pointersSearchNotes,
  ...backtrackingTriesNotes,
  ...heapIntervalsNotes,
  ...greedyMathBitsNotes,
};
