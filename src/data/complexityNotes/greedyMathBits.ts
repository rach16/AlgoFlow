import type { ComplexityNote } from '../complexity';

/**
 * Derivations for Greedy, Math & Geometry, and Bit Manipulation.
 *
 * Three recurring themes, one per category:
 *  - Greedy: the O(n) bound comes from a local rule being provably optimal, so no decision is
 *    ever revisited. The interesting content is in the space column and the gotcha.
 *  - Math & Geometry: n is usually a VALUE or a dimension, not an element count. Say which.
 *  - Bit Manipulation: everything is O(1) for fixed-width integers, or O(b) / O(log n) if the
 *    bit width counts as an input size. Name the convention every single time.
 */
export const greedyMathBitsNotes: Record<string, ComplexityNote> = {
  // ============================== GREEDY ==========================================
  'maximum-subarray:optimal': {
    time: [
      'n is the length of nums.',
      'One pass over nums, and the loop body is a comparison, an addition and a max — all O(1).',
      'The greedy rule is what keeps it to a single pass: a running sum that has gone negative can never help any later subarray, so it is reset to 0 and never reconsidered.',
      'O(n).',
    ],
    space: [
      'Two numbers: the running sum and the best sum seen so far.',
      'O(1).',
    ],
    gotcha:
      'Brute force sums every (start, end) pair for O(n squared). Kadane escapes that because the best subarray ending at i is either the one ending at i-1 extended or nums[i] alone — a purely local decision, so nothing needs remembering or revisiting.',
  },
  'maximum-subarray:dp-tabulation': {
    time: [
      'n is the length of nums, and dp[i] holds the best subarray sum ENDING at index i.',
      'The loop fills n-1 cells, each with one max of two candidates: O(1) per cell.',
      'The closing max(dp) is a second sequential pass over n values, and sequential work adds rather than multiplies.',
      'O(n).',
    ],
    space: [
      'A dp array with one slot per index, so O(n).',
      'Same time class as Kadane, n times the memory.',
    ],
    gotcha:
      'This is Kadane written out longhand — the recurrence is identical. Noticing that dp[i] only ever reads dp[i-1] is what collapses the array into a single variable and the space from O(n) to O(1).',
  },

  'jump-game:optimal': {
    time: [
      'n is the length of nums.',
      'One backward walk from index n-2 down to 0, so n-1 iterations.',
      'Each iteration is one addition and one comparison against the current goal: O(1).',
      'O(n).',
    ],
    space: ['A single integer, the goal index.', 'O(1).'],
    gotcha:
      'The DP version asks "can I reach the end from i?" for every i and is O(n squared). Moving the goal leftward is provably safe instead: if i can reach the old goal, reaching i is exactly as good as reaching the goal, so the subproblem is REPLACED rather than stored.',
  },
  'jump-game:greedy-forward': {
    time: [
      'n is the length of nums.',
      'One forward pass of n iterations, each doing one comparison and one max.',
      'maxReach only ever moves forward and no index is examined twice, so there is no inner loop over the jump length.',
      'O(n).',
    ],
    space: ['maxReach and the loop index.', 'O(1).'],
    gotcha:
      'Simulating every jump from every index — the obvious reading of the problem — is O(n squared). Tracking only the farthest reachable index works because reachability is a prefix property: if index i is reachable at all, so is every index before it.',
  },

  'jump-game-ii:optimal': {
    time: [
      'n is the length of nums.',
      'The outer while advances a window [left, right] one BFS level at a time; the inner for scans that window to find the farthest reach.',
      'Because left is set to right + 1 each round, the windows are disjoint and together cover the array exactly once.',
      'So the inner for runs n times in total across ALL outer iterations, not n times per iteration.',
      'O(n).',
    ],
    space: ['Three integers: left, right and the jump count.', 'O(1).'],
    gotcha:
      'The nested loop looks quadratic and is not. Each index belongs to exactly one BFS level, so it is scanned once in the whole run — the same disjoint-window argument that makes sliding windows linear.',
  },
  'jump-game-ii:dp-min-jumps': {
    time: [
      'n is the length of nums.',
      'The outer loop visits each index once; for index i the inner loop relaxes every index in the reachable range i+1 .. i+nums[i].',
      'That range can be as long as n, so with large jump values the inner work is O(n) per index.',
      'Nested work multiplies: O(n squared).',
    ],
    space: ['A dp array of n minimum-jump counts, so O(n).'],
    gotcha:
      'The greedy is O(n) on the same input, and it is worth saying why it wins: DP re-relaxes dp[j] from every i that can reach j, while the greedy observes that the FIRST level to reach j is already optimal, so each index is settled once and never touched again.',
  },

  'gas-station:optimal': {
    time: [
      'n is the number of stations.',
      'The sum(gas) versus sum(cost) feasibility check is two passes, O(n) each.',
      'The main loop is a third pass accumulating the running tank and resetting the candidate start whenever it goes negative.',
      'Three sequential passes add rather than multiply, so O(n).',
    ],
    space: ['A running total and a candidate start index.', 'O(1).'],
    gotcha:
      'Trying all n starts and simulating n stations each is O(n squared). The single pass is justified by a prefix argument: if the tank goes negative at station i, no start between the old candidate and i can work either, so a whole block of candidates is eliminated at once instead of being tested.',
  },
  'gas-station:prefix-minimum': {
    time: [
      'n is the number of stations.',
      'One pass builds the running prefix sum of gas[i] - cost[i] and remembers where that prefix hits its minimum.',
      'Each iteration is one subtraction and one comparison: O(1).',
      'O(n).',
    ],
    space: [
      'The running total, the minimum seen so far and the start index — the prefix sums are never stored as an array.',
      'O(1).',
    ],
    gotcha:
      'This view is the PROOF the one-pass greedy quietly relies on: starting immediately after the global minimum of the prefix curve guarantees every later partial sum is non-negative, so exactly one candidate start ever needs checking.',
  },

  'hand-of-straights:optimal': {
    time: [
      'n is the number of cards and d the number of distinct values, with d <= n.',
      'Building the counter is O(n); sorting the distinct keys is O(d log d).',
      'For each start value that still has cards the inner loop takes groupSize steps, and it consumes all the groups beginning at that value in one batch.',
      'So a triggered start does groupSize steps of work while consuming at least groupSize cards, which caps the total inner work at O(n).',
      'The sort dominates the linear work: O(n log n).',
    ],
    space: [
      'The counter holds one entry per distinct value, plus the sorted key list.',
      'O(d), which is O(n) when every card is distinct.',
    ],
    gotcha:
      'This is not O(n). The greedy has to always begin from the smallest remaining card, and that ordering requirement is exactly what puts a log into the bound — the sort is not incidental, it is what makes the greedy correct.',
  },
  'hand-of-straights:min-heap': {
    time: [
      'n is the number of cards, d the number of distinct values.',
      'heapify over the d distinct values is O(d) — building a heap in bulk is cheaper than d individual pushes, which would be O(d log d).',
      'Each outer while iteration forms one group of groupSize cards, so there are n / groupSize iterations doing groupSize work each: O(n) total.',
      'Each distinct value is popped at most once and each pop is O(log d): O(d log d).',
      'O(n + d log d), usually written O(n log n).',
    ],
    space: [
      'The counter and the heap each hold one entry per distinct value.',
      'O(d), up to O(n).',
    ],
    gotcha:
      'Do not charge a log to every card. Only the heap pops are logarithmic and there are at most d of them, so the heap contributes O(d log d) rather than O(n log n) on its own.',
  },

  'merge-triplets:optimal': {
    time: [
      'n is the number of triplets.',
      'One pass over the triplets; each one is screened against target with three comparisons and then scanned by a loop of exactly 3.',
      'Three is a fixed size, not a second input dimension, so the per-triplet work is O(1).',
      'O(n).',
    ],
    space: [
      'The good set can only ever hold the indices 0, 1 and 2 — at most three entries.',
      'O(1).',
    ],
    gotcha:
      'The inner loop over the triplet tempts people into answering O(n squared). A triplet is always length 3, so it is a constant factor on an O(n) pass. Only loop bounds that grow with the input create a second dimension.',
  },
  'merge-triplets:merged-maxima': {
    time: [
      'n is the number of triplets.',
      'One pass, and for each triplet that survives the screen, three max operations against the accumulator.',
      'Constant work per triplet, so O(n).',
    ],
    space: ['A single merged triplet of three numbers.', 'O(1).'],
    gotcha:
      'Skipping any triplet that exceeds the target in any position is required for correctness, not speed — and it is also why one unordered pass suffices: the surviving maxima can be folded in any order and still land on the same result.',
  },

  'partition-labels:optimal': {
    time: [
      'n is the length of s.',
      'The first pass records the last index of every character: n iterations of O(1) map writes.',
      'The second pass extends the current partition end to the furthest last-index seen and cuts when i catches up to it.',
      'Two sequential passes add: O(n).',
    ],
    space: [
      'The lastIndex map holds one entry per DISTINCT character, capped at 26 for lowercase input.',
      'O(1) because the alphabet is bounded — for an unbounded alphabet it is O(k) for k distinct characters.',
    ],
    gotcha:
      'That O(1) space is only true for a fixed alphabet, so say so. And the cut is greedy-safe because a partition can never end before the last occurrence of any character it contains, which makes the earliest legal cut always optimal.',
  },
  'partition-labels:interval-merging': {
    time: [
      'n is the length of s.',
      'One pass builds a first and last index for each distinct character: O(n).',
      'The intervals are then sorted — but there is at most one interval per distinct character, so at most 26 of them for lowercase input.',
      'Sorting a bounded number of items is O(1), so the character scan is what dominates: O(n).',
    ],
    space: [
      'Two maps and an interval list, each with one entry per distinct character.',
      'O(1) for a 26-letter alphabet.',
    ],
    gotcha:
      'The sort here does NOT make this O(n log n). It sorts intervals, not characters, and there are at most 26 intervals. Any sort whose size is bounded by the alphabet rather than by the input is a constant.',
  },

  'valid-parenthesis-string:optimal': {
    time: [
      'n is the length of s.',
      'One pass, and each character updates two counters and does two comparisons: O(1).',
      'O(n).',
    ],
    space: [
      'Two integers, lo and hi — the smallest and largest possible open-bracket count.',
      'O(1).',
    ],
    gotcha:
      'Trying every interpretation of each star is O(3 to the n), and memoised DP over (index, open count) is O(n squared). Carrying the interval [lo, hi] works because the set of reachable open-counts is always CONTIGUOUS, so two numbers describe it exactly.',
  },
  'valid-parenthesis-string:two-pass': {
    time: [
      'n is the length of s.',
      'The forward pass treats every star as an open bracket; the backward pass treats every star as a close bracket.',
      'Each pass is n iterations of constant counter work, and sequential passes add.',
      'O(n).',
    ],
    space: ['One counter per pass.', 'O(1).'],
    gotcha:
      'Two passes over n is O(n), not O(2n) — constants drop. The non-obvious part is that these two extreme assignments are jointly sufficient: if both extremes survive, every intermediate assignment does too.',
  },

  'lemonade-change:optimal': {
    time: [
      'n is the number of bills.',
      'One pass, and each bill is resolved by a fixed number of counter comparisons and decrements: O(1).',
      'O(n).',
    ],
    space: ['Two counters, one for fives and one for tens.', 'O(1).'],
    gotcha:
      'The greedy choice is paying a 20 with a ten plus a five before resorting to three fives. Fives are strictly more useful (they make change for both a 10 and a 20), so spending the less flexible bill first is provably safe — which is why no search and no backtracking is needed.',
  },
  'lemonade-change:drawer-simulation': {
    time: [
      'n is the number of bills, and the drawer is a plain list that grows toward n entries.',
      'For each bill the membership test and the remove call each scan the drawer linearly, and the sort at the end of the loop body touches every element again.',
      'That is O(n) work inside a loop that runs n times.',
      'O(n squared) — the stated O(n log n) undercounts, because the sort runs once per bill rather than once overall.',
    ],
    space: [
      'The drawer list holds one entry per bill kept, up to n of them.',
      'O(n).',
    ],
    gotcha:
      'This is the version to reject out loud. Keeping a sorted container of individual bills buys nothing when only two denominations exist — replacing the list with two integer counters is what drops it to O(n) time and O(1) space.',
  },

  'max-sum-circular-subarray:optimal': {
    time: [
      'n is the length of nums.',
      'A single loop runs two Kadane recurrences side by side — the maximum-sum subarray and the minimum-sum subarray — plus a running total.',
      'Each iteration is a fixed handful of max, min and add operations: O(1).',
      'Two Kadanes in one loop is a constant factor, not a second dimension, and constants drop.',
      'O(n).',
    ],
    space: [
      'Five scalars: two running sums, two best sums and the array total.',
      'O(1).',
    ],
    gotcha:
      'The insight the bound rests on is that a WRAPPING subarray is the complement of a non-wrapping one, so total minus the minimum subarray covers the circular case with no extra traversal. Also handle the all-negative case: the complement would be empty, which is not allowed.',
  },
  'max-sum-circular-subarray:prefix-deque': {
    time: [
      'n is the length of nums.',
      'The array is conceptually doubled, so the prefix-sum array has 2n + 1 entries — a constant factor on n.',
      'The loop over those 2n positions maintains a monotonic deque of candidate prefix minima.',
      'Each index is pushed once and popped at most once, so the inner while is amortised O(1) despite looking nested.',
      'O(n).',
    ],
    space: [
      'The prefix array of 2n + 1 sums, plus a deque holding at most n + 1 indices.',
      'O(n).',
    ],
    gotcha:
      'The while inside the for is the usual amortisation trap: total pops are bounded by total pushes, which is 2n. Same time class as the two-Kadane version, but O(n) space instead of O(1).',
  },

  'longest-turbulent-subarray:optimal': {
    time: [
      'n is the length of arr.',
      'One pass comparing each element with its predecessor and updating two run lengths: the run ending on an up-step and the run ending on a down-step.',
      'Each iteration is one comparison and two assignments: O(1).',
      'O(n).',
    ],
    space: ['Two run-length counters and the best answer.', 'O(1).'],
    gotcha:
      'Checking every subarray for turbulence is O(n squared) or worse. Two counters suffice because a turbulent run ending at i must extend exactly one of the two runs ending at i-1 — the state needed from the past is two numbers, not a window.',
  },
  'longest-turbulent-subarray:sliding-window-signs': {
    time: [
      'n is the length of arr.',
      'One pass with an anchor marking the start of the current turbulent run.',
      'The anchor only ever moves forward, so nothing is rescanned: each index is examined a constant number of times.',
      'O(n).',
    ],
    space: ['The anchor index, the comparison sign and the best length.', 'O(1).'],
    gotcha:
      'It looks like the window could be re-measured from scratch on every break. It cannot — the anchor jumps forward to i rather than sliding back, so the total movement of both ends across the whole run is bounded by n.',
  },

  'jump-game-vii:optimal': {
    time: [
      'n is the length of s.',
      'One pass filling dp[i], which records whether index i is reachable.',
      'The naive form checks every j in the window [i - maxJump, i - minJump], which is O(n) per index and O(n squared) overall.',
      'Here a running count of the reachable indices inside that window is maintained with one add and one subtract per step — O(1) instead of a rescan.',
      'O(n).',
    ],
    space: ['A boolean dp array of length n.', 'O(n).'],
    gotcha:
      'The running count is doing a prefix-sum job: it turns a range query per index from O(n) into O(1). Without it this is quadratic, so the sliding count is the whole algorithm rather than a tidy-up.',
  },
  'jump-game-vii:bfs-ranges': {
    time: [
      'n is the length of s.',
      'BFS over indices, with a farthest pointer that prevents any index being enqueued twice.',
      'Each index therefore enters the queue at most once, and the ranges scanned by the inner for are disjoint, so their total length across the whole run is bounded by n.',
      'O(n).',
    ],
    space: ['The queue holds reachable indices, up to n of them.', 'O(n).'],
    gotcha:
      'Without the farthest pointer, overlapping jump ranges make the same indices be scanned again and again and the BFS degrades to O(n squared). That monotone pointer is the only thing keeping it linear.',
  },

  'dota2-senate:optimal': {
    time: [
      'n is the number of senators.',
      'Building the two index queues is one pass, O(n).',
      'Each round of the main loop pops one senator from each queue and re-queues exactly one of them, so every round permanently eliminates exactly one senator.',
      'At most n - 1 eliminations can happen, so the loop runs O(n) rounds of O(1) work.',
      'O(n).',
    ],
    space: ['Two deques holding all n indices between them.', 'O(n).'],
    gotcha:
      'The round-robin looks like it could cycle forever. Count eliminations instead of rounds: one senator is removed for good per round, which caps the rounds at n - 1. Adding n to the re-queued index is what preserves the circular order.',
  },
  'dota2-senate:pending-ban-counters': {
    time: [
      'n is the number of senators.',
      'Each pass scans the whole people list — banned senators are overwritten with a placeholder but never removed, so every pass costs a full O(n) regardless of how many are left.',
      'The passes repeat until one party is wiped out, and the pass count grows logarithmically: doubling n adds roughly one pass, because the accumulated pending bans eliminate a constant fraction of the losing side each round.',
      'O(n) per pass x O(log n) passes = O(n log n), so the stated O(n) is optimistic.',
    ],
    space: ['A mutable copy of the senate string plus a few counters.', 'O(n).'],
    gotcha:
      'This is easy to mis-bound as O(n) because each pass looks linear and the outer loop looks like it runs twice. It runs about log n times and the scan never shrinks. The two-queue version is the one that is genuinely O(n).',
  },

  'candy:optimal': {
    time: [
      'n is the number of children.',
      'The left-to-right pass enforces the constraint against the left neighbour: n iterations of O(1).',
      'The right-to-left pass enforces it against the right neighbour, taking a max so the first pass is not undone.',
      'The closing sum over the array is a third O(n) pass, and sequential passes add.',
      'O(n).',
    ],
    space: ['A candies array with one count per child, so O(n).'],
    gotcha:
      'Two passes are necessary because each child is constrained in both directions and no single sweep can satisfy both at once. Taking max on the second pass rather than overwriting is the step people get wrong.',
  },
  'candy:slope-counting': {
    time: [
      'n is the number of children.',
      'One pass classifying each step as up, flat or down and maintaining the current run lengths.',
      'Each iteration is one comparison plus constant arithmetic on the running totals: O(1).',
      'O(n).',
    ],
    space: [
      'Four integers: the running total, the up-run length, the down-run length and the last peak height.',
      'O(1) — no per-child array is ever allocated.',
    ],
    gotcha:
      'Same O(n) time as the two-pass version but O(1) space, because the total is accumulated while walking the slopes instead of being summed from an array at the end. The peak adjustment — deciding whether the peak belongs to the up-run or the down-run — is where the off-by-one lives.',
  },

  // ============================== MATH & GEOMETRY ==================================
  'rotate-image:optimal': {
    time: [
      'n is the SIDE LENGTH of the square matrix, so the input holds n squared cells.',
      'The transpose loops over the upper triangle only: n(n-1)/2 swaps, which is O(n squared) once the half is dropped.',
      'Reversing each of the n rows costs O(n) per row, another O(n squared).',
      'Sequential, so O(n squared) — and that is LINEAR in the input SIZE, since the input is n squared cells and each is touched a constant number of times.',
    ],
    space: [
      'Every swap and reverse happens in place; nothing proportional to the matrix is allocated.',
      'O(1).',
    ],
    gotcha:
      'O(n squared) sounds quadratic and wasteful. It is not: n is a dimension here, not an element count, and n squared is exactly the number of cells. Whenever n is a side length, say so before quoting the bound.',
  },
  'rotate-image:layer-by-layer-rotation': {
    time: [
      'n is the side length, so the matrix has n squared cells.',
      'The outer loop walks n/2 concentric layers, and the inner loop walks the cells along one side of the current layer.',
      'Each inner iteration performs a 4-way cyclic swap, O(1), and every cell belongs to exactly one 4-cycle.',
      'The total number of cycles is n squared / 4, so O(n squared).',
    ],
    space: ['One temporary value to hold the corner during the 4-way rotation.', 'O(1).'],
    gotcha:
      'The layers shrink, which tempts people into guessing something sub-quadratic. Sum the layer sizes and you get every cell exactly once — the shrinking only changes the constant factor, never the class.',
  },

  'spiral-matrix:optimal': {
    time: [
      'm is the number of rows and n the number of columns. Keep them separate unless the matrix is square.',
      'Four directional loops run inside a while, each walking one edge of a boundary that shrinks after every edge.',
      'Every cell is appended exactly once and never revisited, so the inner iterations total m x n across the whole run.',
      'O(m x n).',
    ],
    space: [
      'Four boundary indices and no visited grid.',
      'O(1) auxiliary, not counting the output list, which necessarily holds all m x n values.',
    ],
    gotcha:
      'State the convention out loud: counting the output makes this O(m x n) space, and the claim being made is about AUXILIARY space. Constant auxiliary space is precisely what boundary shrinking buys over a visited grid.',
  },
  'spiral-matrix:direction-vectors': {
    time: [
      'm rows, n columns.',
      'The loop runs exactly m x n times — once per cell, by construction.',
      'Each step appends a value, marks it visited, and does at most two bounds checks before possibly turning: O(1).',
      'O(m x n).',
    ],
    space: ['A visited grid the same shape as the input, so O(m x n).'],
    gotcha:
      'Same time as the boundary version with O(m x n) extra space instead of O(1). That is the entire trade: the visited grid stores information the four boundary indices can derive for free.',
  },

  'set-matrix-zeroes:optimal': {
    time: [
      'm rows, n columns.',
      'The first nested sweep records each zero as a marker in row 0 and column 0: m x n cells.',
      'The second nested sweep reads those markers and writes the zeroes: another m x n.',
      'The two edge fixups are O(n) and O(m), and sequential work adds.',
      'O(m x n).',
    ],
    space: [
      'The markers live in the matrix itself; only two booleans for the first row and column are allocated.',
      'O(1).',
    ],
    gotcha:
      'Zeroing a row the moment you see a zero is wrong rather than slow — the new zeroes trigger further zeroing. Every correct solution therefore needs two sweeps, and the only real question is where the markers are stored.',
  },
  'set-matrix-zeroes:row-col-sets': {
    time: [
      'm rows, n columns.',
      'One nested sweep collects the indices of zero rows and zero columns: m x n cells visited.',
      'A second nested sweep rewrites any cell whose row or column is in a set, with O(1) average set lookups.',
      'O(m x n).',
    ],
    space: [
      'One set of row indices (at most m) and one of column indices (at most n).',
      'O(m + n).',
    ],
    gotcha:
      'O(m + n) and O(m x n) are wildly different, and the difference is the point: the sets hold one entry per row and per column, not per cell. Adding the sizes rather than multiplying them is what makes this cheap.',
  },

  'happy-number:optimal': {
    time: [
      'n is the VALUE of the input number, so it has about log base 10 of n digits.',
      'The first digit-square sum reads every digit: O(log n).',
      'After one step the value is at most 81 times the digit count, which for any 32-bit input is under 1000 — so every later step reads only 3 or 4 digits, O(1).',
      'From there the sequence either reaches 1 or enters one fixed small cycle, and the number of steps before that is bounded by a constant.',
      'The first step dominates: O(log n).',
    ],
    space: [
      'The set stores the values seen, and after the first step every value is small.',
      'Only a fixed, tiny set of values below the shrink threshold is ever reachable, so O(1).',
    ],
    gotcha:
      'The step count looks unbounded, and "it depends how long the cycle is" is the usual answer. It is bounded because the digit-square sum collapses any large number in one step and can never grow past a few hundred afterwards — so only a constant number of distinct states exists.',
  },
  'happy-number:floyd-cycle-detection': {
    time: [
      'n is the VALUE of the input.',
      'Same shrink argument: the first digit-square sum costs O(log n), and every later one is O(1) because the value has already collapsed below a few hundred.',
      'Floyd advances the fast pointer at twice the speed, which is a constant factor on a constant number of steps.',
      'O(log n).',
    ],
    space: [
      'Two integers, slow and fast, with no set at all.',
      'O(1) — genuinely constant, independent of how large the reachable state space is.',
    ],
    gotcha:
      'Both versions are O(1) space for different reasons. The set version depends on only a few hundred values being reachable; Floyd holds two numbers whatever happens. If the state space were large, only Floyd would still be constant.',
  },

  'plus-one:optimal': {
    time: [
      'n is the NUMBER OF DIGITS, not the value of the number.',
      'The loop walks right to left and breaks as soon as the carry stops, so the typical case ends after one iteration.',
      'The worst case is all nines, where the carry ripples through every digit: n iterations of O(1) arithmetic.',
      'O(n) worst case.',
    ],
    space: [
      'Digits are updated in place and only a carry is allocated.',
      'O(1) auxiliary — the all-nines case does prepend a leading 1, which grows the output array by one.',
    ],
    gotcha:
      'n is the digit count. A 100-digit number has n = 100, not n = 10 to the 100. Confusing the VALUE of a number with the LENGTH of its representation is the single most common error in this whole category.',
  },
  'plus-one:rightmost-non-nine': {
    time: [
      'n is the number of digits.',
      'Scan right to left for the first digit below 9, increment it and return, zeroing every 9 passed on the way.',
      'The scan length is the number of trailing nines plus one, which is at most n.',
      'O(n) worst case, O(1) when the last digit is not a 9.',
    ],
    space: [
      'Writes are in place; a new array is built only in the all-nines case.',
      'O(1) auxiliary.',
    ],
    gotcha:
      'Both versions are O(n) worst case even though they usually return after a single step. Big-O describes the worst case unless you explicitly attach the word "average" or "amortised" to it.',
  },

  'pow-x-n:optimal': {
    time: [
      'n is the VALUE of the exponent, not the size of any collection.',
      'An even exponent is halved directly, and an odd exponent becomes even after one step, so the exponent at least halves every two calls.',
      'You can only halve n about log base 2 of n times before reaching 0.',
      'O(log n) multiplications.',
    ],
    space: [
      'Every pending recursive call holds a stack frame, and the recursion is as deep as the number of halvings.',
      'O(log n) for the call stack — the stated O(1) only describes the iterative version.',
    ],
    gotcha:
      'Two traps. First, n is the exponent VALUE: n = 2 to the 31 needs only about 31 multiplications, which is why this crushes the O(n) loop. Second, recursion is not free — same time class as the iterative form, but O(log n) space instead of O(1).',
  },
  'pow-x-n:iterative-binary-exponentiation': {
    time: [
      'n is the VALUE of the exponent.',
      'Each iteration halves n with an integer divide and squares the running base.',
      'That gives log base 2 of n iterations, each doing at most two multiplications.',
      'O(log n).',
    ],
    space: [
      'A result accumulator and the running base.',
      'O(1) — no call stack, which is the concrete advantage over the recursive form.',
    ],
    gotcha:
      'The loop is really reading the binary representation of the exponent: a multiply into the result happens exactly on its set bits. That is why the count is log n, and why the technique is called binary exponentiation.',
  },

  'multiply-strings:optimal': {
    time: [
      'm is the length of num1 and n the length of num2 — two independent sizes, so never collapse them.',
      'Nested loops pair every digit of num1 with every digit of num2: m x n single-digit products.',
      'Each product is added straight into positions i+j and i+j+1 with constant carry arithmetic: O(1).',
      'The closing join over m + n slots is O(m + n) and is dominated.',
      'O(m x n).',
    ],
    space: [
      'A result array with m + n slots, which is the largest the product can be.',
      'O(m + n).',
    ],
    gotcha:
      'This is schoolbook multiplication, and O(m x n) is the unavoidable cost of the digit-by-digit grid at this level (Karatsuba beats it asymptotically and is not what is being asked). The actual trick is that no partial product is ever stored: each digit product lands directly in its final position.',
  },
  'multiply-strings:partial-products-addition': {
    time: [
      'm is the length of num1, n the length of num2.',
      'For each of the n digits of num2 a partial product about m digits long is built, which is O(m x n) across all of them.',
      'But each partial product is then string-added into a running total whose length grows toward m + n, so the n additions cost O(n x (m + n)).',
      'Adding the two parts: O(m x n + n squared).',
    ],
    space: [
      'The running total and the current partial product, each at most m + n digits.',
      'O(m + n).',
    ],
    gotcha:
      'The extra n squared term comes entirely from re-adding into a growing total n separate times. The position-array version avoids it by accumulating every digit product in place, which is why it is a strictly better O(m x n).',
  },

  'detect-squares:optimal': {
    time: [
      'n is the number of add calls made so far. add is O(1): one map increment and one list append.',
      'count scans the full list of stored points: n iterations.',
      'Each iteration tests the diagonal condition and, when it holds, multiplies two O(1) map lookups for the other two corners.',
      'O(n) per count query.',
    ],
    space: [
      'A frequency map keyed by point plus a list of every point added.',
      'O(n).',
    ],
    gotcha:
      'Treating each stored point as the OPPOSITE corner of the diagonal is what makes one pass enough — the other two corners are then fully determined, so there is no nested loop over pairs of points. Enumerating pairs would be O(n squared) per query.',
  },
  'detect-squares:column-buckets': {
    time: [
      'add is O(1): one map increment and one append into the bucket for that x-coordinate.',
      'For count, let k be the number of points recorded on the query x-coordinate — duplicates included, since add appends every time.',
      'The loop walks those k points, and for each one checks the two candidate opposite corners with O(1) map lookups.',
      'O(k) per count, O(1) per add.',
    ],
    space: [
      'One map entry per distinct point, plus one list entry per add call.',
      'O(n) for n add calls.',
    ],
    gotcha:
      'k is not n, and that gap is the whole optimisation: bucketing by x means you only scan points that could share a vertical edge with the query, not every point ever added. Note the bucket stores duplicates, so k counts repeated adds too.',
  },

  'excel-sheet-column-title:optimal': {
    time: [
      'n is the VALUE of columnNumber, not the length of any string.',
      'Each iteration peels off one base-26 digit by dividing by 26.',
      'The number of digits produced is log base 26 of n, and each costs O(1).',
      'O(log n).',
    ],
    space: [
      'The result list holds one character per base-26 digit.',
      'O(log n), which is exactly the size of the output — so O(1) auxiliary if the output is excluded.',
    ],
    gotcha:
      'The decrement before each digit is the actual problem: this numbering is 1-indexed with no zero digit, so A is 1 and Z is 26 rather than 0 through 25. It changes correctness, not complexity, but it is where every wrong answer comes from.',
  },
  'excel-sheet-column-title:recursive-base-26': {
    time: [
      'n is the VALUE of columnNumber.',
      'One recursive call per base-26 digit, so the depth is log base 26 of n.',
      'Each level does one divide, one modulo and one string concatenation of the prefix built so far.',
      'The concatenations copy O(log n) characters in total, so the depth dominates nothing and the answer stays O(log n).',
    ],
    space: [
      'One stack frame per digit, O(log n), plus the intermediate strings being built.',
      'O(log n).',
    ],
    gotcha:
      'String concatenation inside a recursion can silently add a factor, because each level copies the prefix. Here the prefix is only log n characters so the class is unchanged — but the same pattern over an n-character string turns O(n) into O(n squared).',
  },

  'gcd-of-strings:optimal': {
    time: [
      'm is the length of str1 and n the length of str2.',
      'The test comparing str1 + str2 with str2 + str1 builds and compares two strings of length m + n: O(m + n).',
      'Euclid on the two LENGTHS is O(log(min(m, n))) modulo steps, since each step at least halves one argument — dominated by the concatenation.',
      'The final slice copies at most min(m, n) characters.',
      'O(m + n).',
    ],
    space: ['The two concatenated strings, m + n characters each.', 'O(m + n).'],
    gotcha:
      'People expect a search over candidate prefix lengths. The concatenation test proves a common divisor string EXISTS, and once it does its length must be gcd(m, n) — so the answer is a single slice, and the only logarithmic part is Euclid on two integers.',
  },
  'gcd-of-strings:candidate-prefix-scan': {
    time: [
      'm is the length of str1 and n the length of str2.',
      'The loop tries every candidate length from min(m, n) down to 1, so up to min(m, n) candidates are considered.',
      'Candidates that do not divide both lengths are rejected in O(1); each surviving one is repeated out to length m and to length n and compared, which is O(m + n).',
      'Nested, so O(min(m, n) x (m + n)).',
    ],
    space: [
      'The repeated candidate strings, up to m + n characters.',
      'O(m + n).',
    ],
    gotcha:
      'Only common divisors of the two lengths are actually expanded, and there are few of those in practice. But the bound must still be stated as O(min(m, n)) candidates, because the cheap divisibility filter itself runs that many times.',
  },

  'transpose-matrix:optimal': {
    time: [
      'm is the number of rows and n the number of columns; the matrix need not be square.',
      'Nested loops visit each of the m x n cells exactly once and write it to the mirrored position in the new matrix.',
      'Each write is O(1).',
      'O(m x n).',
    ],
    space: [
      'A brand new n x m matrix.',
      'O(m x n) — here the output IS the space cost, and for a non-square matrix it cannot be avoided.',
    ],
    gotcha:
      'The in-place diagonal swap only works when m equals n, because transposing a non-square matrix changes its shape and there is nowhere to put the extra cells. That is why the general answer allocates and its space is O(m x n) rather than O(1).',
  },
  'transpose-matrix:in-place-diagonal-swap': {
    time: [
      'n is the SIDE LENGTH of the square matrix, which therefore holds n squared cells.',
      'The inner loop starts at i + 1, so only the upper triangle is visited: n(n-1)/2 swaps.',
      'Halving is a constant factor, so O(n squared) — again, linear in the number of cells.',
    ],
    space: ['Swaps happen in place with no second matrix.', 'O(1).'],
    gotcha:
      'Starting the inner loop at i + 1 is required for correctness, not speed: looping from 0 would swap every pair twice and hand back the original matrix. The bound is O(n squared) either way.',
  },

  'roman-to-integer:optimal': {
    time: [
      'n is the length of the roman numeral string.',
      'The while advances by 2 when the next two characters form a subtractive pair, and by 1 otherwise.',
      'Either way the index only moves forward, so there are at most n iterations, each doing fixed-size dictionary lookups.',
      'O(n).',
    ],
    space: [
      'Two lookup tables with a fixed 6 and 7 entries.',
      'O(1) — the tables do not grow with the input.',
    ],
    gotcha:
      'The two-character slice looks like it might cost O(n). It is a fixed length of 2, so it is O(1). Slicing is only linear when the slice LENGTH grows with the input.',
  },
  'roman-to-integer:subtract-if-smaller-than-next': {
    time: [
      'n is the length of s.',
      'One pass over the characters, each doing a single lookahead comparison and one add or subtract.',
      'Every dictionary lookup is against a 7-entry table, so O(1).',
      'O(n).',
    ],
    space: ['One fixed value table and a running total.', 'O(1).'],
    gotcha:
      'A hash map with a constant number of keys is O(1) space, not O(n). The test is whether the structure grows with the input, and a 7-symbol numeral alphabet never does.',
  },

  'insert-gcd-linked-list:optimal': {
    time: [
      'n is the number of nodes and M the largest node value — two independent sizes.',
      'The loop visits each adjacent pair once, so n - 1 iterations.',
      'Each iteration computes one gcd, and Euclid needs O(log(min(a, b))) modulo steps because each step at least halves one argument.',
      'O(n log M).',
    ],
    space: [
      'Pointers only — the new nodes are spliced into the existing list rather than copied.',
      'O(1) auxiliary, not counting the n - 1 nodes the problem requires be inserted.',
    ],
    gotcha:
      'Do not call gcd O(1). Euclid is logarithmic in the VALUES, so the honest bound names M alongside n — this is a two-size problem in the same way a graph problem has both V and E.',
  },
  'insert-gcd-linked-list:collect-values-rebuild': {
    time: [
      'n is the number of nodes and M the largest value.',
      'One pass copies all n values into a list: O(n).',
      'A second pass rebuilds the chain, computing one gcd per adjacent pair at O(log M) each.',
      'Sequential passes add, and the gcd work dominates the copy: O(n log M).',
    ],
    space: [
      'The values list holds all n numbers, and every node is freshly allocated instead of reused.',
      'O(n).',
    ],
    gotcha:
      'Same time class as the splice version with O(n) space instead of O(1). Whenever a linked-list solution opens by copying values into an array, that copy IS the space cost — ask whether pointer surgery could avoid it.',
  },

  // ============================== BIT MANIPULATION ==================================
  'single-number:optimal': {
    time: [
      'n is the length of nums.',
      'One pass XORing every element into a single accumulator.',
      'XOR on a fixed-width integer is one machine operation, O(1) — no hashing, no comparison.',
      'O(n).',
    ],
    space: [
      'One integer accumulator.',
      'O(1) — genuinely constant, with nothing that grows with n.',
    ],
    gotcha:
      'The bound rests on two XOR facts: x ^ x is 0 and x ^ 0 is x. Every duplicated value cancels itself out regardless of ORDER, which is why an unordered single pass suffices and no bookkeeping is needed at all.',
  },
  'single-number:hash-map-counting': {
    time: [
      'n is the length of nums.',
      'One pass counting occurrences, with O(1) average map operations: O(n).',
      'A second pass over the map, which holds at most n entries: O(n).',
      'Sequential passes add, so O(n).',
    ],
    space: [
      'The map holds one entry per distinct value, which is about n/2 + 1 of them here.',
      'O(n).',
    ],
    gotcha:
      'Same O(n) time as XOR but O(n) space, and the problem explicitly demands constant space. A good example of hitting the stated time bound while still failing the constraint that was asked for.',
  },

  'number-of-1-bits:optimal': {
    time: [
      'Name the convention first: for a fixed-width 32-bit integer this is O(1), because the width is a constant. If the bit width b counts as an input size it is O(b) worst case.',
      'Each iteration of n &= n - 1 clears exactly the lowest set bit.',
      'So the loop body runs exactly once per SET bit — at most 32 times for a 32-bit input, and often far fewer.',
      'O(set bits), which is O(1) at fixed width.',
    ],
    space: ['A single counter.', 'O(1).'],
    gotcha:
      'The difference from the shift version is the entire point of learning this trick: shifting runs 32 times regardless, Kernighan runs once per set bit. Both are O(1) at fixed width, so big-O hides the win completely — here the constant factor IS the answer.',
  },
  'number-of-1-bits:bit-by-bit-shift': {
    time: [
      'Say which convention you are using: O(1) for a fixed 32-bit integer, or O(b) if the bit width b is treated as an input size.',
      'The loop shifts n right until it becomes 0, so it runs once per bit position up to the highest set bit.',
      'That is at most 32 iterations for a 32-bit value, each doing one mask and one shift.',
      'O(32) = O(1) at fixed width.',
    ],
    space: ['One counter plus the shifting copy of n.', 'O(1).'],
    gotcha:
      'Answering O(log n) is also defensible, where n is the VALUE — the number of bits is log base 2 of n. Once the width is fixed the two claims are the same thing. What is not acceptable is quoting a bound without saying which of the two you mean.',
  },

  'counting-bits:optimal': {
    time: [
      'n is the VALUE of the input, and the answer has n + 1 entries — so the output size is itself linear in n.',
      'The loop fills every index from 1 to n exactly once.',
      'Each cell reuses the already-computed answer for i >> 1 (i with its last bit dropped) and adds back that last bit: two O(1) operations.',
      'O(n).',
    ],
    space: [
      'A dp array of n + 1 counts, which is exactly the required output.',
      'O(n), or O(1) auxiliary beyond the output.',
    ],
    gotcha:
      'Counting each value independently is O(n log n): n values times up to log n bits each. The DP is O(n) because i >> 1 is a strictly smaller index that has already been solved, so each value costs O(1) instead of a fresh bit scan.',
  },
  'counting-bits:dp-lowbit': {
    time: [
      'n is the VALUE of the input.',
      'One pass over the indices 1 to n.',
      'Each cell reads dp at i & (i - 1), which is i with its lowest set bit cleared and therefore a smaller, already-filled index, then adds 1.',
      'One array read and one addition per value: O(n).',
    ],
    space: [
      'The dp array of n + 1 entries, which is the output.',
      'O(n).',
    ],
    gotcha:
      'Both recurrences are O(n) and differ only in which smaller subproblem they reuse. Either works for the same reason: the dependency is always a SMALLER index, so one forward pass never reads an unfilled cell.',
  },

  'reverse-bits:optimal': {
    time: [
      'The input is a fixed 32-bit integer, so the bit width is a constant rather than an input size.',
      'The loop runs exactly 32 times, pulling the low bit off n and shifting it into the result.',
      'Each iteration is a mask, two shifts and an or: O(1).',
      'O(32) = O(1). If you insist on counting the width b, write O(b).',
    ],
    space: ['The result accumulator and the shifting input.', 'O(1).'],
    gotcha:
      'Exactly 32 iterations every time, even for the input 0 — there is no early exit, because every bit position must be placed. That is why the divide-and-conquer version with its 5 masked swaps is a real constant-factor win.',
  },
  'reverse-bits:divide-and-conquer-masks': {
    time: [
      'Fixed 32-bit width again, so this is O(1) by that convention, or O(log b) if the width b is counted.',
      'Each line swaps blocks of one size: halves, then bytes, then nibbles, then pairs, then single bits.',
      'Halving the block size each step means log base 2 of 32 = 5 steps, and each step masks and shifts the whole word at once.',
      'O(5) = O(1), against 32 iterations for the bit-by-bit loop.',
    ],
    space: [
      'The value is transformed in place through a chain of expressions.',
      'O(1).',
    ],
    gotcha:
      'Same O(1) as the loop with roughly six times fewer operations. The pattern is worth recognising as divide and conquer on a word: the hardware acts on all 32 bits at once, so halving the block size gives log b steps instead of b.',
  },

  'missing-number:optimal': {
    time: [
      'n is the length of nums, whose values are 0..n with exactly one omitted.',
      'One pass, XORing both the index i and the value nums[i] into an accumulator seeded with n.',
      'Each iteration is two XORs, O(1).',
      'O(n).',
    ],
    space: ['A single accumulator.', 'O(1).'],
    gotcha:
      'Genuinely O(1) space, and unlike the sum formula it cannot overflow — every intermediate stays inside 32 bits. Every number in 0..n appears once as an index-or-seed and once as a value except the missing one, so everything else cancels.',
  },
  'missing-number:gauss-sum-formula': {
    time: [
      'n is the length of nums.',
      'The expected total comes from the closed form n(n+1)/2, which is O(1) arithmetic with no loop at all.',
      'Summing the actual array is one pass, O(n), and that is the only linear work in the function.',
      'O(n).',
    ],
    space: ['Two integers, the expected total and the actual total.', 'O(1).'],
    gotcha:
      'The formula is O(1) but the sum is not, so the whole thing is O(n) — do not claim O(1) for the function. The real hazard is overflow: for large n the sum can exceed a 32-bit int, which is exactly the failure mode the XOR version does not have.',
  },

  'sum-of-two-integers:optimal': {
    time: [
      'The inputs are fixed-width 32-bit integers, so the bit width is a constant and this is O(1) by that convention.',
      'Each round computes the sum without carries as a ^ b, and the carry as (a & b) << 1, then repeats with the carry as the new b.',
      'The carry shifts one position further left every round, so it runs out of bits after at most 32 rounds.',
      'O(32) = O(1), or O(b) if the width b is counted as an input size.',
    ],
    space: ['Two working values and a mask.', 'O(1).'],
    gotcha:
      'The round count is bounded by the WIDTH, not by the magnitude of the numbers, because a carry moves strictly leftward and can never come back. The masking exists only because Python integers are arbitrary-precision and must be forced back into 32 bits.',
  },
  'sum-of-two-integers:recursive-xor-carry': {
    time: [
      'Fixed 32-bit width, so the bit count is a constant and the bound is O(1) by that convention.',
      'One recursive call per carry-propagation round, with the carry shifted one bit further left each time.',
      'The carry is exhausted after at most 32 rounds, each doing a fixed number of masks and shifts.',
      'O(1) at fixed width, O(b) if the width counts.',
    ],
    space: [
      'One stack frame per round, so up to about 32 frames.',
      'O(1) at fixed width — but it is O(b) frames, where the iterative version uses none.',
    ],
    gotcha:
      'A recursion depth capped at 32 is O(1) space, and it is worth saying WHY: the depth depends on the bit width, not on any input count. If the width were treated as a size you would have to write O(b) here and O(1) for the iterative form.',
  },

  'reverse-integer:optimal': {
    time: [
      'n is the VALUE of x, so it has about log base 10 of n digits.',
      'The loop pops one digit per iteration with a modulo and an integer divide.',
      'That is one O(1) iteration per digit, so log base 10 of n iterations.',
      'O(log n) — capped at 10 iterations for a 32-bit int, which is why some sources simply call it O(1).',
    ],
    space: ['A result accumulator and a sign.', 'O(1) — no string is ever built.'],
    gotcha:
      'The overflow check has to happen BEFORE the multiply, not after: once result * 10 + digit has overflowed the value is already wrong. It costs nothing asymptotically and is the entire difficulty of the problem.',
  },
  'reverse-integer:string-reversal': {
    time: [
      'n is the VALUE of x, with about log base 10 of n digits.',
      'Converting to a string walks the digits, the slice reverses them, and the parse back reads them again — each is linear in the digit count.',
      'Three sequential linear passes over log n digits, and sequential work adds.',
      'O(log n).',
    ],
    space: [
      'The digit string and its reversed copy, each about log n characters.',
      'O(log n) — strictly worse than the arithmetic version.',
    ],
    gotcha:
      'Same time class, but this one allocates. It also cannot detect overflow part-way through: it must build the full reversed value and then range-check it, which only works because the language has arbitrary-precision integers.',
  },

  'bitwise-and-numbers-range:optimal': {
    time: [
      'n is the VALUE of right, whose bit length is about log base 2 of n.',
      'Both endpoints are shifted right until they are equal, which strips exactly the bit positions where they differ.',
      'Each shift removes one bit, so there are at most log base 2 of n iterations of O(1) work.',
      'O(log n), which is O(1) at a fixed 32-bit width.',
    ],
    space: ['The shift count and the two shifted endpoints.', 'O(1).'],
    gotcha:
      'Looping from left to right and ANDing is O(n) in the VALUE — hopeless for a range like 0 to two billion. The reduction is seeing that any bit position where the endpoints differ must be 0 somewhere in the range, so the answer is just the common binary prefix.',
  },
  'bitwise-and-numbers-range:brian-kernighan-clear-low-bits': {
    time: [
      'n is the VALUE of right, so about log base 2 of n bits.',
      'Each iteration of right &= right - 1 clears the lowest set bit of right.',
      'It repeats until right is no longer above left, and since each iteration clears one set bit there are at most log base 2 of n of them.',
      'O(log n).',
    ],
    space: ['Nothing beyond the two endpoints.', 'O(1).'],
    gotcha:
      'Both versions are logarithmic in the VALUE of the endpoints and completely independent of the range LENGTH — which is the surprising part. A range spanning a billion numbers costs the same as one spanning ten.',
  },

  'add-binary:optimal': {
    time: [
      'm is the length of a and n the length of b — two separate sizes, so do not collapse them into one n.',
      'The loop walks both strings from the right at once and keeps going while either index is valid or a carry remains.',
      'That is max(m, n) iterations, plus at most one extra for a final carry, each doing constant digit arithmetic.',
      'The reverse-and-join at the end is another O(max(m, n)), which adds rather than multiplies.',
      'O(max(m, n)).',
    ],
    space: [
      'The result list holds max(m, n) + 1 characters, which is the output.',
      'O(max(m, n)) counting the output, O(1) auxiliary without it — only a carry is carried.',
    ],
    gotcha:
      'Write max(m, n), not n. Adding a 2-digit number to a 10000-digit one costs the longer one, and collapsing two independent lengths into a single n hides that.',
  },
  'add-binary:xor-and-carry-loop': {
    time: [
      'm is the length of a and n the length of b.',
      'Parsing both strings into integers reads every character: O(m + n).',
      'Each round computes x ^ y and the shifted carry, and the carry moves one bit further left each round, so there are at most max(m, n) rounds.',
      'With machine-word integers each round is O(1), giving the stated O(max(m, n)).',
      'With arbitrary-precision integers each round touches all max(m, n) bits, so a full carry ripple is O(max(m, n) squared) — the stated bound assumes fixed-width arithmetic.',
    ],
    space: [
      'The two parsed integers, each about max(m, n) bits, plus the final binary string.',
      'O(max(m, n)).',
    ],
    gotcha:
      'This looks slicker than the two-pointer loop and is actually worse: it depends on the language having big integers, and a long carry ripple re-touches every bit on every round. Interviewers generally treat parsing the whole string into an int as sidestepping the problem.',
  },

  'minimum-array-end:optimal': {
    time: [
      'n is the number of array elements — a VALUE read from the input, not the length of a collection. x is the required AND mask.',
      'The n - 1 increments above x have to be distributed into the ZERO bit positions of x, lowest position first.',
      'The loop walks bit positions and consumes one bit of n - 1 at each position where x has a 0, so it stops once all log base 2 of n bits of n - 1 are placed.',
      'O(log n) iterations of constant work — the positions scanned are bounded by log n plus the set bits of x, itself capped by the word width.',
    ],
    space: ['The running result, the remaining count and the bit index.', 'O(1).'],
    gotcha:
      'n here is a magnitude that can be 10 to the 8 or larger, so an O(n) simulation is far too slow while O(log n) is about 30 steps. The insight is that the k-th smallest valid value is x with the bits of k written into its free (zero) positions, in order.',
  },
  'minimum-array-end:or-increment-simulation': {
    time: [
      'n is the number of array elements, and it is a VALUE read from the input rather than a collection size.',
      'The loop runs n - 1 times, each step doing one increment and one OR to snap the value back to a legal one.',
      'Each step is O(1), so O(n).',
    ],
    space: ['One running result.', 'O(1).'],
    gotcha:
      'O(n) sounds acceptable until you notice n is a magnitude: with n up to 10 to the 8 this is a hundred million iterations. Whenever the input is a NUMBER rather than a collection, O(n) is pseudo-polynomial and the intended answer is usually the bit-level O(log n) one.',
  },
};
