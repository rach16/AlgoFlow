import type { ComplexityNote } from '../complexityTypes';

/**
 * Complexity derivations for the Two Pointers, Sliding Window and Binary Search categories.
 *
 * Three recurring arguments run through this file, and each note leans on one of them:
 *
 *  - Two pointers converging: two moving parts, but between them they cover each index
 *    ONCE in total, so the loop is O(n) and not O(n squared).
 *  - Sliding window amortisation: the left pointer only ever moves forward, so it spends a
 *    total budget of n moves across the whole run. That is why the inner while is not nested cost.
 *  - Binary search: halving a range of size n takes log base 2 of n steps. When the search is
 *    over an ANSWER RANGE rather than the array, the log is over the value range, not n.
 */
export const pointersSearchNotes: Record<string, ComplexityNote> = {
  // ================================================================================
  // TWO POINTERS
  // ================================================================================

  'valid-palindrome:optimal': {
    time: [
      'n is the length of s.',
      'First a cleaning pass keeps only alphanumeric characters and lowercases them: n iterations of O(1) work.',
      'Then left starts at 0 and right at the end, and they step toward each other one index per iteration.',
      'Together the two pointers cover each character at most once, so the squeeze is O(n), not O(n squared) — there are two pointers but only n indices to share between them.',
      'Two sequential passes add rather than multiply: O(n) + O(n) = O(n).',
    ],
    space: [
      'The pointer scan itself needs only two integers.',
      'But the cleaning step builds a new string, which is O(n).',
      'O(1) only if you skip non-alphanumeric characters inline instead of pre-cleaning.',
    ],
    gotcha:
      'The stated O(1) space assumes the in-place variant where the loop itself skips punctuation with two extra while-loops. The moment you write a cleaned copy first, space is O(n). Say which version you are describing.',
  },
  'valid-palindrome:reversed-string': {
    time: [
      'n is the length of s.',
      'Cleaning is one pass of n characters; reversing with a slice copies n characters; the equality compare walks up to n characters.',
      'Three sequential linear passes, so O(3n) = O(n).',
    ],
    space: [
      'Two full-length strings are allocated: the cleaned one and its reverse.',
      'O(n).',
    ],
    gotcha:
      'Same time class as the two-pointer version, so people call them equivalent. They are not: this one pays O(n) space for the reversed copy, and it always reads the entire string instead of bailing at the first mismatch.',
  },

  'two-sum-ii:optimal': {
    time: [
      'n is the length of numbers, which is already sorted.',
      'l starts at index 0 and r at the last index. Every iteration either raises l or lowers r by one.',
      'The gap between them starts at n-1 and shrinks by at least 1 per iteration, so there are at most n iterations.',
      'Each iteration is one addition and one comparison, O(1).',
      'O(n).',
    ],
    space: ['Two indices and one running sum.', 'A fixed number of scalars, so O(1).'],
    gotcha:
      'Two pointers moving in a while loop reads like a nested loop, but the two of them share one budget of n indices — every step permanently removes an index from consideration. That is the whole reason the squeeze is linear.',
  },
  'two-sum-ii:binary-search': {
    time: [
      'n is the length of numbers.',
      'The outer loop fixes each index i in turn: n iterations.',
      'For each i, a binary search over the suffix looks for the complement, halving that range each step: O(log n).',
      'Nested loops multiply, so n x log n = O(n log n).',
    ],
    space: ['Only the loop indices and the lo/hi/mid bounds.', 'O(1).'],
    gotcha:
      'This is strictly worse than the two-pointer squeeze, which is O(n) on the same input. Binary search is the reflex when you see "sorted", but here the sortedness gives you something better: a converging squeeze that reuses information the binary search throws away every iteration.',
  },

  'three-sum:hash-set': {
    time: [
      'n is the length of nums.',
      'The sort is O(n log n) and happens once, up front.',
      'The outer loop fixes the first element: n iterations.',
      'Inside, a fresh set is built while j walks the rest of the array: O(n) per outer iteration.',
      'Nested loops multiply: n x n = O(n squared), which dominates the O(n log n) sort.',
    ],
    space: [
      'A new seen set per outer iteration, holding up to n values.',
      'O(n) auxiliary, not counting the output list of triplets.',
    ],
    gotcha:
      'Same O(n squared) time as the two-pointer version but O(n) space instead of O(1). The set is rebuilt from scratch on every outer iteration, so the allocations are not free even though they do not change the bound.',
  },

  'container-with-most-water:optimal': {
    time: [
      'n is the length of height.',
      'l begins at 0 and r at n-1. Each iteration moves at least one of them inward by one index.',
      'The window can shrink at most n-1 times before the pointers meet, so there are at most n iterations.',
      'Each iteration is a min, a multiply and a max: O(1).',
      'O(n).',
    ],
    space: ['Two pointers and the running best area.', 'O(1).'],
    gotcha:
      'The greedy step is what makes one pass enough: moving the TALLER wall inward can never help, because width shrinks and the height is still capped by the shorter wall. So discarding the shorter side loses no candidate, and each index is retired exactly once.',
  },
  'container-with-most-water:brute-force-pairs': {
    time: [
      'n is the length of height.',
      'The outer loop picks the left wall: n iterations. The inner loop picks every wall to its right.',
      'The inner loop starts at l+1, so the total pair count is n(n-1)/2.',
      'That is n squared / 2, and constants drop: O(n squared).',
    ],
    space: ['Only the loop indices and the best area seen.', 'O(1).'],
    gotcha:
      'Starting the inner loop at l+1 instead of 0 halves the work but does not change the class. n squared / 2 is still O(n squared) — dropping constants means the shape of the curve is identical.',
  },

  'trapping-rain-water:prefix-max-arrays': {
    time: [
      'n is the length of height.',
      'One left-to-right pass fills leftMax, one right-to-left pass fills rightMax, one final pass sums the trapped water.',
      'Three sequential passes over n elements. Sequential work adds: O(3n) = O(n).',
    ],
    space: [
      'Two auxiliary arrays of n integers each, leftMax and rightMax.',
      'O(2n) = O(n).',
    ],
    gotcha:
      'Identical time class to the two-pointer version, so the two are often called interchangeable. The difference is entirely in space: O(n) here versus O(1) there. When two approaches share a time bound, space is the tiebreaker you should be naming out loud.',
  },

  'reverse-string:optimal': {
    time: [
      'n is the length of the character array s.',
      'left and right start at the ends and move one step inward per iteration, so they meet after about n/2 iterations.',
      'Each iteration is a single swap, O(1).',
      'n/2 swaps, and constants drop: O(n).',
    ],
    space: ['Two indices; every swap happens inside the existing array.', 'O(1).'],
    gotcha:
      'Doing only n/2 iterations does not make this O(n/2) as a distinct class — constants drop, so it is O(n). What the halving does buy you is a real 2x constant factor, which matters in practice and never in Big-O.',
  },
  'reverse-string:recursion': {
    time: [
      'n is the length of s.',
      'Each call performs one swap and then recurses once with the pointers one step closer.',
      'The pointers close by 2 per call, so there are about n/2 calls, each doing O(1) work.',
      'O(n).',
    ],
    space: [
      'Every pending recursive call holds a stack frame, and none returns until the innermost one does.',
      'Depth is n/2, so O(n) stack space.',
    ],
    gotcha:
      'Same time as the iterative loop, worse space. This is the cleanest demonstration that recursion is never free: the algorithm allocates nothing, yet it still costs O(n) because n/2 frames are alive at once.',
  },

  'valid-palindrome-ii:optimal': {
    time: [
      'n is the length of s.',
      'The outer squeeze moves left and right inward, covering each index at most once: O(n).',
      'On the first mismatch it builds two substrings and compares each to its own reverse. Slicing copies, so that is O(n), and it happens at most ONCE.',
      'Sequential work adds: O(n) for the squeeze + O(n) for the single check = O(n).',
    ],
    space: [
      'The mismatch branch slices out two substrings and reverses them, each up to n characters.',
      'O(n).',
    ],
    gotcha:
      'The slice-and-reverse looks like it might run inside the loop and make this quadratic. It cannot: the function RETURNS on the first mismatch, so the O(n) copy happens once. The price is O(n) space, which the two-index helper version avoids entirely.',
  },
  'valid-palindrome-ii:helper-greedy-check': {
    time: [
      'n is the length of s.',
      'The outer two-pointer squeeze covers each index at most once: O(n).',
      'On the first mismatch it calls the helper at most twice, and each helper is itself a two-pointer scan of at most n characters: O(n).',
      'Because the function returns immediately after those calls, that O(n) is paid once, not per iteration.',
      'O(n) + O(n) = O(n).',
    ],
    space: [
      'The helper works on index pairs into the original string and copies nothing.',
      'O(1).',
    ],
    gotcha:
      'People answer O(n squared) here, reasoning "a linear check inside a linear loop". The early return is what saves it: control leaves the loop the instant the helper is invoked, so the inner scan runs at most twice over the entire call.',
  },

  'merge-strings-alternately:optimal': {
    time: [
      'm is the length of word1 and n the length of word2. There are two sizes here, so do not collapse them into one n.',
      'The interleaving while loop runs min(m, n) times, appending two characters per iteration.',
      'Then the leftover tail of whichever string is longer is appended in one slice: O(|m - n|).',
      'Every character of both inputs is copied exactly once, so O(m + n).',
    ],
    space: [
      'The merged list holds all m + n characters, and the final join copies them again.',
      'O(m + n) — which is unavoidable, since the answer is that long.',
    ],
    gotcha:
      'Answering O(n) hides the fact that the two strings can differ wildly in length. O(m + n) is the honest bound: if word1 has a million characters and word2 has one, a single n tells the interviewer nothing.',
  },
  'merge-strings-alternately:single-index-loop': {
    time: [
      'm is the length of word1, n the length of word2.',
      'The loop runs max(m, n) times, with two bounds checks and up to two appends per iteration.',
      'max(m, n) is within a factor of 2 of m + n, so the class is the same: O(m + n).',
    ],
    space: ['The output buffer holds m + n characters.', 'O(m + n).'],
    gotcha:
      'max(m, n) and m + n look like different bounds but are the same class, since max(m, n) <= m + n <= 2 x max(m, n). Constant factors between two sizes drop just like constant factors on one.',
  },

  'merge-sorted-array:optimal': {
    time: [
      'm is the number of live elements in nums1, n the length of nums2.',
      'The write index k starts at m + n - 1 and decreases by exactly one per iteration.',
      'The loop ends when j falls below 0, so it runs at most m + n times, doing one compare and one write each.',
      'O(m + n).',
    ],
    space: [
      'Three indices, and every write lands in the space nums1 already reserved.',
      'O(1) auxiliary — the output is the input buffer, so nothing new is allocated.',
    ],
    gotcha:
      'Filling from the BACK is what makes O(1) space possible. Merging forward would overwrite nums1 elements before reading them, forcing a copy; going backward, k is always at or beyond both read pointers, so no live value is ever clobbered.',
  },
  'merge-sorted-array:merge-into-copy': {
    time: [
      'm live elements in nums1, n in nums2.',
      'The main merge loop consumes one element per iteration, and the two drain loops consume whatever is left: m + n elements total across all three.',
      'Then a final copy-back writes m + n slots.',
      'Sequential passes add: O(m + n).',
    ],
    space: ['A scratch list holding all m + n merged values.', 'O(m + n).'],
    gotcha:
      'Same time as the backward version, but O(m + n) space instead of O(1). Since the problem hands you nums1 already padded to length m + n, the scratch array is pure waste — that padding is a hint about the intended space bound.',
  },

  'remove-duplicates-sorted-array:optimal': {
    time: [
      'n is the length of nums.',
      'The fast pointer makes exactly one pass from index 1 to n-1: n-1 iterations.',
      'slow only advances when a new distinct value is found, so it never causes extra iterations.',
      'One compare and at most one write per iteration, O(1).',
      'O(n).',
    ],
    space: [
      'Two indices, and all writes overwrite existing slots.',
      'O(1) in place.',
    ],
    gotcha:
      'The two pointers here move at DIFFERENT speeds in the same direction, unlike the converging pattern. The bound still comes from the same observation: fast visits each index once, so whatever slow does, it can only lag behind — no index is read twice.',
  },
  'remove-duplicates-sorted-array:neighbour-count-scan': {
    time: [
      'n is the length of nums.',
      'One pass from index 1 to n-1, comparing each element to the raw neighbour nums[i-1].',
      'O(1) per step, so O(n).',
    ],
    space: ['One write index, all writes in place.', 'O(1).'],
    gotcha:
      'Comparing against nums[i-1] rather than nums[slow] happens to work only because the input is SORTED, so duplicates are adjacent. On unsorted input this silently produces the wrong answer while the slow/fast version would too — sortedness is load-bearing for both.',
  },

  'rotate-array:optimal': {
    time: [
      'n is the length of nums.',
      'k is reduced modulo n first, so no element is ever moved more than necessary.',
      'Three reversals run in sequence: the whole array (n/2 swaps), the first k elements (k/2 swaps), the remaining n-k (about (n-k)/2 swaps).',
      'Total swaps is about n/2 + n/2 = n. Sequential reversals add rather than multiply.',
      'O(n).',
    ],
    space: [
      'Every reversal is a two-pointer swap inside the original array.',
      'O(1).',
    ],
    gotcha:
      'Three passes over the array is still O(n), not O(3n) as a separate class. Constants drop. The reason to prefer this over the extra-array version is entirely the O(1) space, not any speed difference.',
  },
  'rotate-array:extra-array-modulo': {
    time: [
      'n is the length of nums.',
      'One pass places each element at its rotated index (i + k) % n: n iterations of O(1) work.',
      'Then copying the result back into nums is another n writes.',
      'O(n) + O(n) = O(n).',
    ],
    space: ['A full result array of n elements.', 'O(n).'],
    gotcha:
      'Reducing k modulo n is not an optimisation, it is a correctness fix: without it the index arithmetic can still work but a naive shift-by-one-k-times version would do O(n x k) work. That single modulo caps the problem at one rotation.',
  },

  'four-sum:optimal': {
    time: [
      'n is the length of nums.',
      'The sort is O(n log n) and runs once, before anything else.',
      'The outer loop fixes the first number: n iterations. The second loop fixes the second: n iterations.',
      'Inside those, l and r converge from the two ends, covering each remaining index once: O(n).',
      'Two nested fixed loops times a linear squeeze multiply: n x n x n = O(n cubed).',
      'O(n cubed) dominates the O(n log n) sort, so the answer is O(n cubed).',
    ],
    space: [
      'Four indices plus the running total; the sort is in place.',
      'O(1) auxiliary, not counting the output list of quadruplets.',
    ],
    gotcha:
      'The pattern generalises: kSum with a two-pointer base case is O(n to the (k-1)). 3Sum fixes one number and squeezes, giving n squared; 4Sum fixes two, giving n cubed. Also, do not multiply the sort in — it happens once, sequentially, so it is dominated rather than compounded.',
  },
  'four-sum:ksum-recursion': {
    time: [
      'n is the length of nums, k the tuple size (4 here).',
      'The sort is O(n log n), once, up front.',
      'Each recursive level runs a loop over up to n candidates and recurses with k reduced by one, so the call tree has k-2 nested looping levels above the base case.',
      'The base case at k = 2 is a two-pointer squeeze over the remaining range: O(n).',
      'That is n to the (k-2) loop levels times O(n) at the bottom = O(n to the (k-1)), so O(n cubed) for k = 4.',
    ],
    space: [
      'Recursion depth is k, a constant for a fixed k, but each level accumulates partial result lists.',
      'O(n) for the recursion frames and the intermediate lists they hold, excluding the final output.',
    ],
    gotcha:
      'Same O(n cubed) as the hand-rolled double loop, but this version generalises to any k with no new code. The trade is O(n) space for the intermediate lists each level builds, versus O(1) for the flat version.',
  },

  'boats-to-save-people:optimal': {
    time: [
      'n is the number of people.',
      'The sort is O(n log n) and dominates everything after it.',
      'The two-pointer pass then moves l up or r down every iteration — r decreases unconditionally — so it runs at most n times: O(n).',
      'Sequential work adds, so O(n log n) + O(n) = O(n log n).',
    ],
    space: ['Two pointers and a boat counter; the sort is in place.', 'O(1) if the sort sorts in place.'],
    gotcha:
      'Do not multiply the sort into the scan. The sort runs ONCE before the loop, so the two costs add and the larger one wins — O(n log n), never O(n squared log n). Here the sort is also the reason the greedy pairing is correct, not just a preprocessing convenience.',
  },
  'boats-to-save-people:counting-sort': {
    time: [
      'n is the number of people, limit the maximum weight a boat can carry.',
      'Building the count array is one pass over n people: O(n).',
      'The pointer loop scans l upward and r downward across the limit + 1 buckets, and each of the n people is boarded at most once.',
      'Bucket scanning contributes O(limit) and boarding contributes O(n), and they add: O(n + limit).',
    ],
    space: ['A count array with one slot per possible weight, so limit + 1 slots.', 'O(limit).'],
    gotcha:
      'This beats O(n log n) only when limit is small relative to n log n — counting sort trades the comparison-sort lower bound for a dependency on the VALUE RANGE. With a huge limit and few people it is far worse, which is why it is not the default.',
  },

  // ================================================================================
  // SLIDING WINDOW
  // ================================================================================

  'best-time-to-buy-sell-stock:min-price-tracking': {
    time: [
      'n is the number of prices.',
      'A single pass visits each price once, with one comparison against the running minimum and one subtraction.',
      'O(1) per price, so O(n).',
    ],
    space: [
      'Two scalars: the cheapest price seen and the best profit seen.',
      'A fixed count regardless of n, so O(1).',
    ],
    gotcha:
      'This is a degenerate sliding window: the left edge is just "the cheapest day so far", so it never needs to move backward and no explicit shrink loop is required. One variable replaces the entire window.',
  },

  'longest-substring-without-repeating:hash-set-shrink': {
    time: [
      'n is the length of s.',
      'The right pointer advances exactly n times, once per iteration of the for loop.',
      'The inner while removes characters from the left, and left only ever moves FORWARD — it never resets — so across the whole run it advances at most n times.',
      'That is a total budget of n left-moves shared across all n outer iterations, so the inner while is amortised O(1) per step, not O(n) per step.',
      'At most 2n pointer moves in total: O(n).',
    ],
    space: [
      'The set holds only the characters currently inside the window.',
      'Bounded by the window size n and by the alphabet size m, so O(min(n, m)).',
    ],
    gotcha:
      'A while inside a for is the shape that makes people say O(n squared). Apply the budget test: can the inner loop do heavy work on EVERY outer iteration, or is it spending from a pool refilled only n times in total? Here it is a pool, so it is amortised.',
  },

  'longest-repeating-character-replacement:optimal': {
    time: [
      'n is the length of s.',
      'The right pointer moves forward exactly n times.',
      'When the window becomes invalid, left advances by one — and left never moves backward, so its total travel over the whole run is at most n.',
      'Each step is a hash-map update and a max over a bounded alphabet: O(1).',
      'At most 2n pointer moves, so O(n).',
    ],
    space: [
      'The count map holds one entry per distinct character in the window.',
      'Capped at 26 for uppercase input — a constant, so O(1).',
    ],
    gotcha:
      'max_freq is never decreased when the window shrinks, which looks like a bug. It is deliberate: a stale-high max_freq can only make the window look MORE valid, and the answer is a maximum, so it can never be beaten by an invalid window. Recomputing it would add an O(26) factor for nothing.',
  },
  'longest-repeating-character-replacement:binary-search-length': {
    time: [
      'n is the length of s.',
      'The answer is a length between 1 and n, and validity is monotonic: if a window of length L works, so does every shorter one. That is what licenses a binary search over the length.',
      'Binary search over the range 1..n takes log base 2 of n iterations.',
      'Each iteration calls valid(mid), which slides a FIXED-width window across the whole string: O(n) per call.',
      'Nested, so n x log n = O(n log n).',
    ],
    space: [
      'One count map per valid() call, holding at most one entry per distinct character.',
      'O(m) for alphabet size m, which is O(1) for a fixed 26-letter alphabet.',
    ],
    gotcha:
      'This is strictly worse than the O(n) variable-width window, and it is worth knowing why: the plain sliding window discovers the best length while it scans, so it never has to guess and re-verify. Binary-search-on-the-answer earns its log factor only when there is no single-pass check.',
  },

  'permutation-in-string:optimal': {
    time: [
      'm is the length of s1, n the length of s2.',
      'Building s1_count is O(m); seeding the first window is another O(m).',
      'The main loop then slides a FIXED-width window once across s2: at most n iterations, each doing one map decrement and one increment.',
      'The dictionary equality check inside the loop compares at most 26 keys, so it is O(1), not O(m).',
      'O(m) + O(n) x O(1) = O(m + n), reported as O(n) since m <= n whenever an answer is possible.',
    ],
    space: [
      'Two maps, each holding at most one entry per distinct lowercase letter.',
      'Capped at 26 entries, so O(1).',
    ],
    gotcha:
      'The map-equality comparison inside the loop is what people miss. If the alphabet were unbounded it would be O(m) per step and the whole thing would be O(n x m). It is O(1) only because the map can hold at most 26 keys.',
  },
  'permutation-in-string:match-counter-array': {
    time: [
      'm is the length of s1, n the length of s2.',
      'Seeding the two 26-slot arrays is O(m), and the initial matches count is a fixed 26 comparisons: O(1).',
      'The slide then runs at most n times, and each step updates exactly two buckets and adjusts the matches counter with a constant number of comparisons: O(1).',
      'Crucially there is no per-step 26-slot rescan — matches is maintained incrementally.',
      'O(m + n), reported as O(n).',
    ],
    space: ['Two fixed int[26] arrays, allocated regardless of input size.', 'O(1).'],
    gotcha:
      'Same asymptotic bound as the hash-map version but a genuinely lower constant: array indexing beats hashing, and keeping a running matches counter replaces a 26-key comparison with a couple of integer checks. Big-O cannot see the difference; a benchmark can.',
  },

  'minimum-window-substring:optimal': {
    time: [
      'n is the length of s and m the length of t. Name both — the two strings are independent sizes.',
      'Building t_count is one pass over t: O(m).',
      'The right pointer then advances exactly n times.',
      'The inner while shrinks from the left, and left only ever moves forward, so its total travel across the whole run is at most n. That budget is what keeps the nested while from being quadratic.',
      'O(m) for the setup plus O(2n) for the two pointers, and sequential work adds: O(m + n).',
    ],
    space: [
      'Two maps: t_count with one entry per distinct character of t, and window_count with the characters currently in the window.',
      'O(m) for t_count, and O(min(n, alphabet)) for the window, so O(m) dominates for a bounded alphabet.',
    ],
    gotcha:
      'Two mistakes live here. First, calling it O(n) and dropping t entirely — the setup pass over t is real, so it is O(m + n). Second, reading the inner while as nesting: left has a total budget of n forward moves, so the whole scan is amortised linear.',
  },
  'minimum-window-substring:filtered-string': {
    time: [
      'n is the length of s, m the length of t.',
      'Building t_count is O(m). Building the filtered list scans all of s once: O(n).',
      'The sliding window then runs over the filtered list, whose length is at most n, with left again bounded to n total forward moves: O(n) amortised.',
      'Sequential phases add: O(m + n).',
    ],
    space: [
      'The filtered list of (index, char) pairs, which can be as large as n when every character of s appears in t.',
      'Plus the two count maps, O(m). Together O(m + n).',
    ],
    gotcha:
      'Filtering is a constant-factor win, not a complexity win: when t contains most of the alphabet, filtered is nearly as long as s and you have paid O(n) extra space for nothing. It only pays off when t is tiny relative to s.',
  },

  'sliding-window-maximum:optimal': {
    time: [
      'n is the length of nums, k the window width.',
      'The outer loop runs n times, once per index.',
      'The back-popping while looks like it could be O(k) every step, but each index is pushed exactly once and popped at most once, so total pops across the entire run is at most n.',
      'The front removal drops at most one stale index per iteration.',
      'O(n) outer iterations plus O(n) total pops = O(n).',
    ],
    space: [
      'The deque holds only indices inside the current window, in decreasing value order.',
      'At most k of them, so O(k).',
    ],
    gotcha:
      'This is the amortised argument again, budgeted per element rather than per window. Note also that a real deque is required: with a plain list, removing from the FRONT is O(k) because everything shifts, which would push this to O(n x k). Use collections.deque or an index pointer.',
  },
  'sliding-window-maximum:max-heap-lazy-removal': {
    time: [
      'n is the length of nums.',
      'Every element is pushed onto the heap exactly once, and each push is O(log n) because the heap can hold all n entries.',
      'Stale entries are popped lazily from the top; each entry is popped at most once, at O(log n) each.',
      'n pushes and at most n pops, each O(log n): O(n log n).',
    ],
    space: [
      'Nothing is evicted eagerly, so the heap can accumulate all n (value, index) pairs.',
      'O(n), not O(k).',
    ],
    gotcha:
      'Lazy deletion is what costs you here on BOTH axes: the heap grows to n instead of k, and every operation pays log n instead of the deque O(1). The heap version is easier to reason about; the deque version is why this problem is considered hard.',
  },

  'contains-duplicate-ii:optimal': {
    time: [
      'n is the length of nums, k the index-distance limit.',
      'One pass over n indices.',
      'Per index: at most one set removal (of the element that just fell out of the window), one lookup and one insert — O(1) average each.',
      'O(n).',
    ],
    space: [
      'The set holds only the last k + 1 elements, since anything older is removed immediately.',
      'O(min(n, k)), usually written O(k).',
    ],
    gotcha:
      'The eviction guard on the index distance is what caps space at k rather than n. Drop it and the set grows to hold every element — still correct for this problem only if you also compare indices, which is exactly the other approach.',
  },
  'contains-duplicate-ii:last-seen-index-map': {
    time: [
      'n is the length of nums.',
      'One pass over n elements, with one map lookup and one map write per element: O(1) average each.',
      'O(n).',
    ],
    space: [
      'The map stores the last index of every distinct value ever seen, and nothing is ever evicted.',
      'O(n) when all elements are distinct.',
    ],
    gotcha:
      'Same O(n) time as the fixed-window set, but O(n) space instead of O(k). It stores history it will never consult again — any entry more than k indices old can no longer produce a match. That observation is the whole optimisation.',
  },

  'min-size-subarray-sum:optimal': {
    time: [
      'n is the length of nums.',
      'The right pointer advances exactly n times, adding one element to the running total each step.',
      'The inner while shrinks from the left while the sum still meets the target, and left only ever moves forward — at most n moves across the entire run.',
      'Each element is therefore added once and subtracted at most once: a total budget of 2n operations spread over n outer iterations.',
      'O(n).',
    ],
    space: ['A running total, a left index and the best length.', 'O(1).'],
    gotcha:
      'The while inside the for is the classic false quadratic. Also note this window is only valid because the values are non-negative: with negatives, extending the window could lower the sum, so shrinking from the left would no longer be safe and the monotonic argument collapses.',
  },
  'min-size-subarray-sum:prefix-sum-binary-search': {
    time: [
      'n is the length of nums.',
      'Building the prefix array is one pass: O(n).',
      'Then for each of the n + 1 start positions, a binary search over the prefix array finds the earliest end whose sum reaches the target: O(log n) each.',
      'The loop and the binary search nest, so n x log n = O(n log n), which dominates the O(n) prefix build.',
    ],
    space: ['A prefix array of n + 1 sums.', 'O(n).'],
    gotcha:
      'Binary search on the prefix array requires it to be SORTED, which is only guaranteed because all values are non-negative. One negative number breaks monotonicity and this approach silently returns wrong answers. It is also a log factor slower than the plain window.',
  },

  'find-k-closest-elements:optimal': {
    time: [
      'n is the length of arr, k the number of elements to return.',
      'Instead of searching for a value, the binary search picks the WINDOW START, so the search range is 0..n-k, of size n-k.',
      'Halving that range takes log base 2 of (n-k) steps, each an O(1) comparison of the two window edges.',
      'Then slicing out the k results costs O(k).',
      'O(log(n - k) + k) — and the O(k) term is just the cost of writing the answer.',
    ],
    space: [
      'Two indices during the search.',
      'O(1) auxiliary, not counting the k-element output slice.',
    ],
    gotcha:
      'The insight is what you binary-search OVER. The answer is a contiguous window, so there are only n-k possible starts, and the predicate "is the left edge worse than the element k past it" is monotonic across them. Searching for x itself would only get you a starting point, not the answer.',
  },
  'find-k-closest-elements:two-pointer-shrink': {
    time: [
      'n is the length of arr, k the result size.',
      'The window starts at the full array, width n, and every iteration discards exactly one element from whichever end is farther from x.',
      'It stops when the width reaches k, so it runs exactly n - k times, doing O(1) work each.',
      'O(n - k).',
    ],
    space: ['Two indices and nothing else allocated during the shrink.', 'O(1) auxiliary, excluding the output slice.'],
    gotcha:
      'O(n - k) beats O(log(n - k) + k) when k is large — if k is close to n, this barely loops at all while the binary search still pays O(k) to build the answer. Neither bound dominates the other; which wins depends on k relative to n.',
  },

  // ================================================================================
  // BINARY SEARCH
  // ================================================================================

  'binary-search:linear-scan': {
    time: [
      'n is the length of nums.',
      'One pass from the front, stopping early once an element exceeds the target — possible only because the array is sorted.',
      'The early exit helps on average but not in the worst case, where the target is at the end or absent past everything.',
      'O(n).',
    ],
    space: ['One loop index, and no allocation of any kind.', 'O(1).'],
    gotcha:
      'The early break is a constant-factor improvement, not a complexity one: it still scans O(n) in the worst case. Compare the scale — at n = 1,000,000 the linear scan does a million comparisons and binary search does about 20. That gap is what log n buys.',
  },

  'search-2d-matrix:optimal': {
    time: [
      'The matrix has m rows and n columns.',
      'The first binary search halves the ROW range to find the row whose first and last values bracket the target: log base 2 of m steps.',
      'The second binary search halves that row: log base 2 of n steps.',
      'The two searches are sequential, so they add: log m + log n.',
      'And log m + log n = log(m x n), so O(log(m x n)).',
    ],
    space: ['Bounds for each search, both iterative.', 'O(1).'],
    gotcha:
      'log m + log n = log(m x n) is a logarithm identity, not an approximation — the two forms are the same bound written differently. It is also why treating the matrix as one flattened sorted array of m x n elements and running a single binary search gives an identical bound.',
  },
  'search-2d-matrix:staircase-search': {
    time: [
      'm rows and n columns.',
      'Starting from the top-right corner, each comparison either moves left one column or down one row — never back.',
      'Columns can only be exhausted n times and rows m times, so the walk takes at most m + n steps of O(1) work.',
      'O(m + n).',
    ],
    space: ['A row index and a column index.', 'O(1).'],
    gotcha:
      'O(m + n) sounds close to O(log(m x n)) but is exponentially worse. On a 1000 x 1000 matrix that is up to 2000 steps versus about 20. The staircase wins on generality — it works when only rows and columns are sorted, with no global ordering — not on speed.',
  },

  'koko-eating-bananas:optimal': {
    time: [
      'n is the number of piles, and m is max(piles) — the largest possible answer.',
      'The binary search is over SPEEDS, not over the array. The candidate range is 1..m, so halving it takes log base 2 of m steps.',
      'Each candidate speed requires a full feasibility check: sum the hours over all n piles, O(n).',
      'O(n log m) — note the log is over the VALUE RANGE m, not the array length n.',
    ],
    space: ['A few scalars for the bounds and the hour count.', 'O(1).'],
    gotcha:
      'The distinction learners miss: this is "binary search on the answer", so the log is over the range of possible answers, not over n. Calling it O(log n) is wrong — n and m are unrelated, and a single pile of a billion bananas gives a tiny n and a huge m.',
  },
  'koko-eating-bananas:linear-scan-speeds': {
    time: [
      'n is the number of piles, m is max(piles).',
      'The loop tries every speed from 1 upward until one is fast enough, so it can run up to m times.',
      'Each attempt sums the hours across all n piles: O(n).',
      'Nested, so O(n x m).',
    ],
    space: ['The candidate speed and an hour counter.', 'O(1).'],
    gotcha:
      'Compare with the binary-search version: O(n x m) versus O(n log m). Feasibility is MONOTONIC — if speed k finishes in time, so does every faster speed — and monotonicity over a range is exactly the precondition that lets you binary search instead of scan.',
  },

  'find-min-rotated-sorted:optimal': {
    time: [
      'n is the length of nums.',
      'Each iteration either shrinks the range to one side of mid or breaks out because the remaining range is already sorted.',
      'When it shrinks, it discards half the remaining elements, so the range goes n, n/2, n/4, ...',
      'You can only halve n about log base 2 of n times before reaching a single element.',
      'O(log n).',
    ],
    space: ['Two bounds, a mid and the running minimum.', 'O(1).'],
    gotcha:
      'A rotated array is not sorted, so plain binary search on the value fails. What still works is that one half of any split is ALWAYS sorted, and comparing nums[mid] to nums[left] identifies which — that check is what preserves the halving.',
  },
  'find-min-rotated-sorted:linear-scan-inflection': {
    time: [
      'n is the length of nums.',
      'One pass looking for the single position where a value drops below its predecessor.',
      'The rotation point can be anywhere, including the last index, so the worst case reads every element.',
      'O(n).',
    ],
    space: ['One loop index, comparing values already in the array.', 'O(1).'],
    gotcha:
      'This is the answer that works and gets rejected. The problem is filed under binary search precisely because the O(log n) version exists — if you can state why one half is always sorted, you can find the drop without visiting every element.',
  },

  'search-rotated-sorted:optimal': {
    time: [
      'n is the length of nums.',
      'Each iteration computes mid, decides which side is the sorted one, and discards half the range.',
      'Halving n repeatedly takes log base 2 of n steps.',
      'The extra branching only adds a constant number of comparisons per step, so it does not change the class.',
      'O(log n).',
    ],
    space: ['Left, right and mid.', 'O(1).'],
    gotcha:
      'The nested if-else looks like it costs more than a plain binary search. It does not: it is a fixed number of comparisons per iteration, and the iteration COUNT is what the log measures. Extra work per step matters only if it grows with n.',
  },
  'search-rotated-sorted:find-pivot-then-search': {
    time: [
      'n is the length of nums.',
      'Phase 1 binary-searches for the pivot, halving the range each step: O(log n).',
      'Phase 2 binary-searches the sorted half containing the target: another O(log n).',
      'Two sequential binary searches add: log n + log n = 2 log n, and constants drop.',
      'O(log n).',
    ],
    space: ['Bounds for both phases, both iterative.', 'O(1).'],
    gotcha:
      'Two binary searches instead of one is still O(log n) — 2 log n drops its constant just like 2n does. The one-pass version is not asymptotically better, only tidier; pick whichever you can write correctly under pressure.',
  },

  'time-based-key-value:optimal': {
    time: [
      'n is the number of values stored under a single key.',
      'set appends to the end of that key list, so it is O(1) — and because timestamps arrive in increasing order, the list stays sorted for free.',
      'get binary-searches that sorted list for the largest timestamp not exceeding the query, halving the range each step.',
      'O(log n) per get, O(1) per set.',
    ],
    space: [
      'Every (value, timestamp) pair ever set is retained, across all keys.',
      'O(n) total for n set calls.',
    ],
    gotcha:
      'Binary search is legal here only because timestamps are guaranteed strictly increasing, which keeps each list sorted without ever sorting it. If they could arrive out of order you would need a sorted structure and set would stop being O(1).',
  },
  'time-based-key-value:linear-scan-timestamps': {
    time: [
      'n is the number of values stored under one key.',
      'set is an append: O(1).',
      'get walks the list backward from the newest entry until it finds a timestamp at or below the query.',
      'A query near the oldest timestamp forces a scan of everything, so O(n) per get.',
    ],
    space: ['All n stored pairs are retained.', 'O(n).'],
    gotcha:
      'Scanning backward is a real heuristic — recent queries stop almost immediately — but the WORST case is still O(n). Big-O describes the worst case unless you say otherwise, so "it is usually fast" does not change the bound.',
  },

  'median-two-sorted-arrays:optimal': {
    time: [
      'm and n are the lengths of the two arrays. Two independent sizes, so name both.',
      'The code first swaps so that A is the SHORTER array.',
      'The binary search then runs over cut positions in A only: the range is 0..len(A), of size min(m, n).',
      'Halving that range takes log base 2 of min(m, n) steps, and each step is a constant number of boundary comparisons.',
      'O(log(min(m, n))).',
    ],
    space: [
      'The four boundary values and the search bounds; no array is copied, only the references are swapped.',
      'O(1).',
    ],
    gotcha:
      'The min is the point. Choosing a cut in A fully DETERMINES the cut in B, since the two must together hold exactly half the elements — so only one array needs searching, and you pick the smaller one. Searching the larger array gives O(log(max(m, n))), which is correct but needlessly worse.',
  },
  'median-two-sorted-arrays:merge-two-pointers': {
    time: [
      'm and n are the two array lengths.',
      'The loop advances one step per iteration and stops once it has consumed half the combined elements.',
      'That is (m + n)/2 + 1 iterations of O(1) work, and constants drop.',
      'O(m + n).',
    ],
    space: [
      'Two indices and the last two values seen — no merged array is ever materialised.',
      'O(1).',
    ],
    gotcha:
      'Stopping at the halfway point does not change the class: (m + n)/2 is still O(m + n). This version does earn O(1) space by not building the merged array, but the whole reason the problem is famous is the O(log(min(m, n))) requirement, which this cannot meet.',
  },

  'search-insert-position:optimal': {
    time: [
      'n is the length of nums.',
      'The range starts at width n and each iteration sets either lo or hi to mid, discarding half of it.',
      'Halving n until the range is empty takes log base 2 of n steps.',
      'O(log n).',
    ],
    space: ['Two bounds and a mid.', 'O(1).'],
    gotcha:
      'The half-open form (hi starts at len(nums), the loop runs while lo < hi) is the lower-bound template, and it is worth memorising: it converges on the first index whose value is >= target, which is the insert position, so the found and not-found cases need no separate handling.',
  },
  'search-insert-position:linear-scan-insert': {
    time: [
      'n is the length of nums.',
      'One pass returning at the first element >= target, falling through to n if none exists.',
      'Worst case, when the target belongs at the end, every element is read.',
      'O(n).',
    ],
    space: ['One loop index and no allocation.', 'O(1).'],
    gotcha:
      'Correct, and O(n) rather than O(log n). The array being sorted is precisely the precondition binary search needs — leaving it unused is the mistake this problem is testing for.',
  },

  'guess-number:optimal': {
    time: [
      'n is the size of the guessing range, 1..n.',
      'Each guess eliminates half the remaining candidates, since the API says whether the answer is higher or lower.',
      'Halving n until one candidate remains takes log base 2 of n steps.',
      'O(log n), which is also the number of API calls — the real cost metric here.',
    ],
    space: ['Two bounds and a mid.', 'O(1).'],
    gotcha:
      'Note what n is: the size of the VALUE RANGE, not an array length. There is no array at all. Binary search needs only a monotonic yes/no oracle over an ordered range, which is what makes the same technique work on answer spaces.',
  },
  'guess-number:ternary-search-guess': {
    time: [
      'n is the size of the range.',
      'Each iteration splits the range into thirds and discards at least one third, so the range shrinks by a factor of 3 per iteration.',
      'That is log base 3 of n iterations rather than log base 2 of n.',
      'But each iteration makes TWO guess() calls instead of one, so the API call count is 2 x log base 3 of n, which is about 1.26 x log base 2 of n — worse than plain binary search.',
      'O(log n) either way, since log base 3 of n = log base 2 of n / log base 2 of 3 and that divisor is a constant.',
    ],
    space: ['The bounds and two midpoints.', 'O(1).'],
    gotcha:
      'The base of a logarithm is a constant factor, so O(log base 3 of n) and O(log n) are the SAME class — changing the base cannot improve the bound. Worse, splitting into thirds needs two probes per round, so it makes more API calls than halving. More splits is not better.',
  },

  'sqrt-x:optimal': {
    time: [
      'x is the input VALUE, not an array length — there is no array here.',
      'The candidate range is 1..x/2, so its width is proportional to x.',
      'Each iteration squares the midpoint and discards half the range, so the count is log base 2 of x.',
      'O(log x).',
    ],
    space: ['The bounds, a mid and the best answer so far.', 'O(1).'],
    gotcha:
      'O(log x) is measured in the value of x, and that makes it deceptive: the number of BITS in x is about log x, so in terms of input length this is linear, not logarithmic. Say "log of the value" rather than "log of the input" so the distinction is explicit.',
  },
  'sqrt-x:newtons-method': {
    time: [
      'x is the input value.',
      'The iteration r = (r + x/r)/2 starts at r = x, and while r is far above the true root it roughly HALVES each step — that phase takes about log base 2 of x steps.',
      'Once r gets near the root, convergence becomes quadratic and the remaining error squares away in a handful more steps.',
      'The halving phase dominates: O(log x), the same class as binary search but with a much smaller constant in practice.',
    ],
    space: ['A single running estimate.', 'O(1).'],
    gotcha:
      'People quote Newton as O(log log x) from the quadratic convergence. That only describes the ENDGAME — starting from r = x you first need about log x halvings just to reach the region where quadratic convergence applies, so the honest overall bound is O(log x).',
  },

  'capacity-to-ship-packages:optimal': {
    time: [
      'n is the number of packages. The candidate capacities run from max(weights) to sum(weights), so the range width is sum - max.',
      'This is binary search on the ANSWER: each iteration halves that value range, giving log base 2 of (sum - max) iterations.',
      'Each candidate capacity needs a full feasibility greedy pass over all n weights: O(n).',
      'O(n log(sum - max)) — the log is over the VALUE RANGE of capacities, not over n.',
    ],
    space: ['The bounds plus a running load and day count.', 'O(1).'],
    gotcha:
      'Calling this O(n log n) is the standard error. n and the weight range are unrelated: ten packages weighing a billion each give a tiny n and an enormous range. The bounds max(weights) and sum(weights) are also not arbitrary — below the max no single package fits, and above the sum one day always suffices.',
  },
  'capacity-to-ship-packages:linear-scan-capacity': {
    time: [
      'n is the number of packages; the capacity range has width sum - max.',
      'The loop increments the capacity by one and re-tests, so it can try every value in that range: up to sum - max attempts.',
      'Each attempt is a greedy pass over all n weights: O(n).',
      'O(n x (sum - max)).',
    ],
    space: ['A candidate capacity, a load and a day count.', 'O(1).'],
    gotcha:
      'The gap between this and the binary-search version is the difference between a range and its logarithm: for a range of a million, that is a million feasibility passes versus about 20. The enabling property is monotonicity — if capacity c ships in time, so does every larger capacity.',
  },

  'search-rotated-sorted-ii:optimal': {
    time: [
      'n is the length of nums, which may contain duplicates.',
      'Normally each iteration identifies the sorted half and discards the other, halving the range: log base 2 of n steps.',
      'But when nums[left] == nums[mid] == nums[right], neither half can be identified, and the code can only shrink the range by ONE from each end.',
      'With an input like [1,1,1,1,2,1,1,1] that degenerate branch fires repeatedly, so the range shrinks linearly.',
      'O(log n) average, O(n) worst case.',
    ],
    space: ['Two bounds and a mid.', 'O(1).'],
    gotcha:
      'Never give a bare O(log n) here. Duplicates destroy the guarantee that one half is sorted, and the ambiguous case degrades to a linear scan — an all-equal array is the exact worst case. State both bounds: O(log n) average, O(n) worst.',
  },
  'search-rotated-sorted-ii:linear-scan-duplicates': {
    time: [
      'n is the length of nums.',
      'One pass comparing every element to the target, with no reliance on ordering.',
      'O(n).',
    ],
    space: ['Nothing beyond the loop variable.', 'O(1).'],
    gotcha:
      'The uncomfortable truth is that this MATCHES the binary-search version in the worst case, since duplicates already push that to O(n). Binary search still wins on typical input — it is O(log n) average — but the worst-case guarantee is identical.',
  },

  'split-array-largest-sum:optimal': {
    time: [
      'n is the length of nums, k the number of subarrays. The candidate answers run from max(nums) to sum(nums).',
      'This is binary search on the ANSWER: halve that value range each iteration, giving log base 2 of (sum) iterations.',
      'Each candidate limit needs one greedy pass counting how many pieces it forces: O(n).',
      'O(n log(sum)) — the log is over the SUM OF THE VALUES, not over n or k.',
    ],
    space: [
      'The bounds plus a piece count and a running total inside the greedy check.',
      'O(1).',
    ],
    gotcha:
      'Notice that k does not appear in the bound at all. It is only used inside the O(1) comparison of the piece count against k, so it changes which answer you converge on, not how long converging takes. And as always with binary-search-on-the-answer, the log is over the value range, not the array length.',
  },
  'split-array-largest-sum:interval-dp': {
    time: [
      'n is the length of nums, k the number of subarrays.',
      'The DP table has one state per (prefix length i, pieces used j): n x k states.',
      'Filling each state loops over every possible previous split point p, which is up to n options, each costing O(1) thanks to the prefix sums.',
      'States times work per state: (n x k) x n = O(n squared x k).',
    ],
    space: [
      'A DP table of (n + 1) x (k + 1) entries, plus an O(n) prefix-sum array.',
      'O(n x k).',
    ],
    gotcha:
      'This is the honest DP and it is dramatically worse than binary search on the answer: O(n squared x k) time and O(n x k) space against O(n log(sum)) and O(1). The lesson is a general one — when the answer is a single number with a monotonic feasibility test, searching the answer space beats enumerating the state space.',
  },

  'find-in-mountain-array:optimal': {
    time: [
      'n is the length of arr.',
      'The first binary search finds the peak by comparing each mid to its neighbour, halving the range: O(log n).',
      'The second searches the ascending left half in the usual direction: O(log n).',
      'The third searches the descending right half with the comparison reversed: O(log n).',
      'Three sequential binary searches add rather than multiply: 3 log n, and constants drop.',
      'O(log n).',
    ],
    space: ['Bounds for each search; all three are iterative.', 'O(1).'],
    gotcha:
      'Three binary searches is still O(log n) — 3 log n and log n are the same class, because constants drop. If the interviewer is counting API calls to the mountain array, the constant matters practically; the asymptotic bound does not change.',
  },
  'find-in-mountain-array:linear-peak-scan': {
    time: [
      'n is the length of arr.',
      'Walking up to the peak one index at a time is O(n) on its own, since the peak can sit at the far end.',
      'The two ordered scans that follow each read up to n elements, with an early break once values overshoot the target.',
      'Sequential linear phases add: O(n).',
    ],
    space: ['One loop index across all three scan phases.', 'O(1).'],
    gotcha:
      'The early breaks make this fast on friendly input but leave the bound at O(n). The peak scan is the real problem — the neighbour comparison arr[mid] < arr[mid+1] is monotonic across the array, which is exactly what lets binary search find the peak in O(log n) instead.',
  },
};
