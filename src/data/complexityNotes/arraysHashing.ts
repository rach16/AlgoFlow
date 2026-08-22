import type { ComplexityNote } from '../complexityTypes';

export const arraysHashingNotes: Record<string, ComplexityNote> = {
  // ---- two sizes: how many strings, and how long each one is ----------------------
  'group-anagrams:optimal': {
    time: [
      'There are two sizes here: n is the number of strings, k the length of the longest string. Never collapse them into one n.',
      'The outer loop runs n times, once per string.',
      'Inside, sorting one string of length k costs O(k log k), and hashing the sorted tuple costs O(k).',
      'Nested, so n x O(k log k) = O(n x k log k).',
    ],
    space: [
      'The map holds every input string plus one key of length k per group.',
      'That is O(n x k) — the characters have to live somewhere.',
    ],
    gotcha:
      'The stated O(n x k) drops the log k from the sort. Be precise: sorting each key makes this O(n x k log k), which is exactly why the counting-array variant (O(n x k)) is the faster key.',
  },
  'group-anagrams:char-count-key': {
    time: [
      'n is the number of strings, k the length of the longest string.',
      'For each of the n strings we walk its characters once to fill a 26-slot count array: O(k).',
      'Converting that fixed 26-slot array into a tuple key is O(26) = O(1), and hashing it is the same constant.',
      'n x O(k) = O(n x k).',
    ],
    space: [
      'The map stores all n strings, grouped, plus one 26-length key per group.',
      'O(n x k) for the strings themselves; the keys add only O(1) each.',
    ],
    gotcha:
      'This beats the sorted-key version because counting is O(k) while sorting is O(k log k). The 26-slot array is what buys that — it only works because the alphabet is bounded.',
  },

  // ---- when you do not need a full ordering ---------------------------------------
  'top-k-frequent:optimal': {
    time: [
      'n is the length of nums.',
      'The counting pass is n iterations of O(1) map work: O(n).',
      'Building the buckets walks the distinct keys, at most n of them: O(n).',
      'The final scan walks the n+1 buckets and touches each number at most once, so it is O(n) even though it is a loop inside a loop.',
      'Three sequential O(n) phases add, not multiply: O(n).',
    ],
    space: [
      'The count map holds up to n distinct numbers, and the bucket array has n+1 slots holding n numbers between them.',
      'O(n).',
    ],
    gotcha:
      'The nested for-in-for at the end looks quadratic. It is not: the buckets partition the distinct numbers, so the inner loop bodies total at most n executions across all n+1 outer iterations.',
  },
  'top-k-frequent:sort-by-frequency': {
    time: [
      'Counting frequencies is one pass, O(n).',
      'Sorting the distinct keys by count is O(d log d) for d distinct values, and d can be as large as n.',
      'The sort dominates the counting pass, and sequential work adds rather than multiplying: O(n log n).',
    ],
    space: ['The count map plus the sorted key list, both up to n entries: O(n).'],
    gotcha:
      'A full sort produces a total ordering you never asked for — you only need the top k. That wasted ordering is the whole log n factor, and bucket sort deletes it.',
  },

  // ---- encoding: the cost is total characters, not string count -------------------
  'encode-decode-strings:optimal': {
    time: [
      'Let n be the total number of characters across all strings, and let there be s strings.',
      'Encode appends each string once plus a short length prefix, so it touches each character a constant number of times: O(n).',
      'Decode scans forward to each # to read a length, then jumps straight over that many characters. No character is examined twice.',
      'Both directions are O(n).',
    ],
    space: [
      'Only the index cursors i and j are held; the encoded string and the decoded list are the outputs.',
      'O(1) auxiliary, not counting the output.',
    ],
    gotcha:
      'The reason to length-prefix rather than delimit is correctness, not speed: any delimiter can appear inside the data. A length says exactly how many characters to take, so no character in the payload needs interpreting.',
  },
  'encode-decode-strings:escape-delimiter': {
    time: [
      'n is the total number of characters across all strings.',
      'Encode calls replace on each string, which scans it once and doubles any slash: O(n) across all strings.',
      'Decode advances i by one or two positions every iteration and never rewinds, so it makes at most n iterations of O(1) work.',
      'O(n) each way.',
    ],
    space: [
      'A running current-string buffer plus the index; the encoded string and decoded list are outputs.',
      'O(1) auxiliary, excluding the output.',
    ],
    gotcha:
      'Same O(n) class as length-prefixing, but the escaped output can be up to twice as long when the data is all slashes. Big-O hides that constant, and it is a real cost on the wire.',
  },

  // ---- same time class, different space -------------------------------------------
  'product-except-self:prefix-suffix-arrays': {
    time: [
      'n is the length of nums.',
      'Three separate passes: one left-to-right filling prefix, one right-to-left filling suffix, one multiplying them into res.',
      'Sequential passes add: O(n) + O(n) + O(n) = O(3n) = O(n).',
    ],
    space: [
      'Two full arrays of length n, prefix and suffix, on top of the result.',
      'O(n) auxiliary.',
    ],
    gotcha:
      'Identical O(n) time to the optimal version — the only difference is space. The optimal one notices that prefix and suffix are each read exactly once in order, so a single scalar can replace each array.',
  },

  // ---- when the input size is fixed by the problem --------------------------------
  'valid-sudoku:optimal': {
    time: [
      'The board is always 9 x 9. There is no n that grows.',
      'The nested loops run 81 times, and each iteration does three set lookups and three inserts, O(1) each.',
      '81 x O(1) is a constant, so O(1).',
    ],
    space: [
      'Nine row sets, nine column sets and nine box sets, each holding at most 9 digits.',
      'At most 81 stored values, a fixed ceiling: O(1).',
    ],
    gotcha:
      'This is the one place where O(1) is honest for a whole grid scan: the 9 is baked into the problem statement. Generalise to an N x N sudoku and the same code is O(N squared) time and space.',
  },
  'valid-sudoku:bitmask': {
    time: [
      'Still exactly 81 cells, since the board size is fixed by the problem.',
      'Each cell does three AND tests and three OR writes on machine integers, O(1) each with no hashing.',
      'O(1) — the same class as the hash-set version, with a much smaller constant.',
    ],
    space: [
      'Three arrays of nine integers, where each integer packs the nine possible digits into nine bits.',
      '27 integers regardless of input: O(1).',
    ],
    gotcha:
      'The win is not the complexity class, it is the constant factor: a bitmask replaces set hashing with a single machine instruction. Both are O(1); only one is fast.',
  },

  // ---- linear because each element is a start exactly once ------------------------
  'longest-consecutive:optimal': {
    time: [
      'n is the length of nums.',
      'The outer loop runs once per distinct number, at most n iterations.',
      'The inner while only runs when num-1 is absent, so it only fires at the START of a run — and it then walks that run once.',
      'Every number is walked by at most one inner while across the whole execution, so all the inner whiles together cost O(n).',
      'O(n) outer + O(n) total inner work = O(n).',
    ],
    space: ['The set holds every distinct number, up to n of them: O(n).'],
    gotcha:
      'The while inside the for reads as O(n squared). The num-1 guard is what saves it: each consecutive run is walked from its smallest element only, so the runs partition the input and their lengths sum to n.',
  },
  'longest-consecutive:sorting': {
    time: [
      'Sorting nums is O(n log n) and dominates.',
      'Then one pass comparing each element to the previous one, skipping duplicates: O(n).',
      'O(n log n) + O(n) = O(n log n).',
    ],
    space: [
      'Only the two length counters; the sort is in-place.',
      'O(1), or O(log n) if you count the sort stack.',
    ],
    gotcha:
      'This is the honest O(1)-space alternative, and it mutates the input to get there. The hash-set version buys the log n factor back with O(n) memory — that trade is the point of showing both.',
  },

  // ---- output-dominated linear work ----------------------------------------------
  'concatenation-of-array:optimal': {
    time: [
      'n is the length of nums.',
      'Two sequential loops, each n iterations, each doing one O(1) append.',
      'Sequential work adds: O(n) + O(n) = O(n).',
    ],
    space: [
      'The answer array holds 2n elements.',
      'O(n) — and here the output cannot be excluded, because producing it IS the problem.',
    ],
    gotcha:
      'You cannot do better than O(n) on this one, because the answer has 2n entries and every one has to be written. When the output size is linear, so is the floor on time.',
  },
  'concatenation-of-array:modulo-single-pass': {
    time: [
      'One loop of 2n iterations over a pre-sized array.',
      'Each iteration is one modulo and one array write, O(1).',
      '2n x O(1) = O(n) — the constant 2 drops.',
    ],
    space: ['One array of 2n slots, allocated up front: O(n).'],
    gotcha:
      'Identical O(n) to the two-pass version, so neither is asymptotically better. Pre-sizing the array does avoid the repeated growth an append-based list does under the hood, which is a constant-factor win only.',
  },

  // ---- S is total characters, not string count -----------------------------------
  'longest-common-prefix:optimal': {
    time: [
      'Let S be the total number of characters across all strings, and let there be s strings.',
      'The outer loop walks the characters of the first string; the inner loop checks that position in every other string.',
      'It returns the moment any string disagrees, so in the worst case (all strings identical) it compares every character of every string exactly once.',
      'That is O(S) — bounded by the total input size, not by s x the longest string.',
    ],
    space: [
      'Only the loop indices and the character being compared; the returned slice is the output.',
      'O(1) auxiliary.',
    ],
    gotcha:
      'Do not answer O(n x m). The correct bound is O(S) for S total characters, and in practice it is far below that because one short or mismatching string stops the scan immediately.',
  },
  'longest-common-prefix:binary-search-length': {
    time: [
      'Let S be the total characters across all strings and m the length of the SHORTEST string.',
      'The answer length lives somewhere in 0..m, and each iteration halves that range: log base 2 of m iterations.',
      'Each iteration tests a candidate prefix against every string, which costs up to O(S).',
      'A loop with a check inside multiplies: O(S log m).',
    ],
    space: [
      'The candidate prefix slice, at most m characters.',
      'O(1) if you treat the slice as a view, O(m) if it is a copy — Python slicing copies.',
    ],
    gotcha:
      'This is asymptotically WORSE than plain vertical scanning, by a factor of log m. It is worth knowing as a pattern (binary searching an answer rather than an index), not as the solution to this problem.',
  },

  // ---- in-place partition, order not preserved ------------------------------------
  'remove-element:optimal': {
    time: [
      'n is the length of nums.',
      'One pass with the read pointer i covering every index once.',
      'Per index: one comparison and at most one write, O(1).',
      'O(n).',
    ],
    space: ['One write index k; everything happens inside the caller array.', 'O(1).'],
    gotcha:
      'The two pointers never form a nested loop — k only advances when i does, and never independently. That is why this is one pass, not two.',
  },
  'remove-element:swap-with-end': {
    time: [
      'The while loop is not a simple for, so count what changes: each iteration either advances i or decrements n.',
      'i can only rise n times and n can only fall n times, so the loop body runs at most n times total.',
      'Each body is one comparison plus at most one copy, O(1).',
      'O(n).',
    ],
    space: ['Two indices, i and the shrinking logical length n.', 'O(1).'],
    gotcha:
      'Same O(n) as the two-pointer version but with fewer writes when matches are rare, since untouched elements are never copied. The cost is that it scrambles the order of the kept elements.',
  },

  // ---- O(1) space by cancellation ------------------------------------------------
  'majority-element:optimal': {
    time: [
      'n is the length of nums.',
      'A single pass of n iterations.',
      'Each iteration compares the element to the current candidate and adds or subtracts one from a counter: O(1).',
      'O(n).',
    ],
    space: [
      'Exactly two variables: the candidate and its running count.',
      'O(1) — no map, no matter how many distinct values the array holds.',
    ],
    gotcha:
      'The O(1) is the whole reason Boyer-Moore exists, and it depends on the guarantee that a strict majority EXISTS. Drop that guarantee and the surviving candidate is only a candidate: you need a second verification pass to check it actually appears more than n/2 times.',
  },
  'majority-element:hash-map-counting': {
    time: [
      'One pass over n elements.',
      'Each iteration is a map read, a map write and a comparison against n/2, O(1) on average.',
      'O(n) — and it often returns early, since the majority element must cross n/2 before the array ends.',
    ],
    space: [
      'The map holds one entry per distinct value, up to n of them when the majority element appears late.',
      'O(n).',
    ],
    gotcha:
      'Same O(n) time as Boyer-Moore, so the interview question is never about time. It is about the O(n) versus O(1) space gap, which is the only thing separating these two.',
  },

  // ---- average vs worst, and what a load factor is -------------------------------
  'design-hash-set:optimal': {
    time: [
      'Let n be the number of keys stored and k the number of buckets (1000 here).',
      'Hashing a key is O(1); it selects one bucket.',
      'Scanning that bucket for the key is linear in the bucket length. With keys spread evenly, a bucket holds about n/k entries — the load factor.',
      'O(n/k) average per operation, which is O(1) as long as k grows with n.',
      'Worst case every key hashes to the same bucket and each operation degrades to a full O(n) scan.',
    ],
    space: [
      'k bucket lists exist even when empty, plus the n stored keys spread across them.',
      'O(n + k).',
    ],
    gotcha:
      'Do not say a bare O(1). With k FIXED at 1000 and n unbounded, n/k grows without limit, so this is O(n/k) average and O(n) worst case. Real hash tables get true O(1) average by resizing k when the load factor crosses a threshold.',
  },
  'design-hash-set:boolean-array': {
    time: [
      'The key range is fixed by the problem at 0..1,000,000.',
      'Every operation is a single indexed read or write into a pre-allocated array — no hashing, no scanning, no collisions.',
      'O(1) worst case per operation, not just average.',
    ],
    space: [
      'One boolean per possible key, allocated whether or not that key is ever used.',
      'O(range) — about a million entries even for a set holding three elements.',
    ],
    gotcha:
      'This is the extreme end of the time-space trade: it beats bucket chaining on worst-case time by paying O(range) memory up front. It only works because the range is small and known; widen the keys to 64-bit integers and the array cannot be allocated at all.',
  },
  'design-hash-map:optimal': {
    time: [
      'Let n be the number of stored pairs and k the bucket count (1000 here).',
      'The modulo hash picks one bucket in O(1).',
      'put, get and remove then walk that bucket comparing keys, so the cost is the bucket length.',
      'Under an even spread a bucket holds n/k pairs, so O(n/k) average per operation.',
      'All keys colliding into one bucket makes every operation an O(n) walk — that is the worst case.',
    ],
    space: [
      'k bucket lists plus one [key, value] pair per stored entry.',
      'O(n + k).',
    ],
    gotcha:
      'Note that put has to SCAN the bucket before appending, to overwrite an existing key rather than duplicate it. That is why put is O(n/k) too, not O(1) — a blind append would be constant but would corrupt the map.',
  },
  'design-hash-map:direct-address-array': {
    time: [
      'The problem fixes the key range at 0..1,000,000, so an array can be indexed by the key itself.',
      'put, get and remove are each one array access with no hash and no collision handling.',
      'O(1) worst case per operation.',
    ],
    space: [
      'One slot per possible key, all million of them, regardless of how many are in use.',
      'O(range).',
    ],
    gotcha:
      'The sentinel -1 for absent keys is the hidden catch: it silently breaks if -1 is a legal VALUE. Direct addressing gets its O(1) by assuming both a bounded key range and a value you can reserve as "empty".',
  },

  // ---- linear sorts: only possible because the values are bounded -----------------
  'sort-colors:optimal': {
    time: [
      'n is the length of nums.',
      'The loop condition is mid <= high, and each iteration either advances mid or decrements high — the gap between them always shrinks by one.',
      'So the body runs at most n times, each doing one comparison and at most one swap.',
      'O(n) in a single pass.',
    ],
    space: ['Three indices: low, mid and high. The swaps are in-place.', 'O(1).'],
    gotcha:
      'Beating the O(n log n) comparison-sort floor is only legal because there are exactly three possible values. This is not a general sort; it is a three-way partition, and it works for the same reason counting sort does.',
  },
  'sort-colors:counting-sort': {
    time: [
      'One pass to tally the three counts: O(n).',
      'Then a nested-looking rewrite loop — but the outer loop runs exactly 3 times and the inner bodies total counts[0] + counts[1] + counts[2] = n writes.',
      'So the rewrite is O(n), not O(3n squared).',
      'O(n) + O(n) = O(n), across two passes.',
    ],
    space: ['A fixed three-element count array, independent of n.', 'O(1).'],
    gotcha:
      'The nested loop is bounded by the counts, not by n each time — the inner iterations sum to n over the whole outer loop. The real distinction from Dutch National Flag is passes: two here, one there, same complexity class.',
  },

  // ---- divide and conquer: depth x work per level ---------------------------------
  'sort-an-array:optimal': {
    time: [
      'n is the length of nums.',
      'Each call splits the range in half, so the recursion tree has log base 2 of n levels before the ranges reach size 1.',
      'Every level merges a total of n elements: the merges at one level cover disjoint ranges that together span the whole array, and each merge step is one comparison and one append.',
      'log n levels x O(n) work per level = O(n log n).',
      'That bound holds for every input — there is no bad case.',
    ],
    space: [
      'The merged buffer at the top level holds n elements, and the recursion stack is log n frames deep.',
      'O(n) dominates O(log n), so O(n).',
    ],
    gotcha:
      'Merge sort trades space for a guarantee: it is O(n log n) always, where quicksort is O(n log n) only on average. When you are asked for a sort with no worst case, this is the answer — and the O(n) buffer is what you pay for it.',
  },
  'sort-an-array:quick-sort': {
    time: [
      'n is the length of nums.',
      'One partition pass compares every element in the range to the pivot: O(range length).',
      'With balanced pivots the range halves each time, giving log n levels of O(n) partitioning: O(n log n).',
      'This code takes the LAST element as pivot. On already-sorted input every partition peels off one element, so the levels are n, n-1, n-2, ... which sums to O(n squared).',
      'O(n log n) average, O(n squared) worst case.',
    ],
    space: [
      'Partitioning is in-place, so only the recursion stack counts.',
      'Depth is log n when the splits are balanced — but the same degenerate pivots that give O(n squared) time push the stack to O(n).',
      'O(log n) average, O(n) worst case.',
    ],
    gotcha:
      'Never state a bare O(n log n) for quicksort. Name the worst case AND its trigger: a fixed pivot choice like nums[hi] makes sorted input the adversary, which is precisely why real implementations pick a random or median-of-three pivot.',
  },

  // ---- build cost and query cost are different bounds -----------------------------
  'range-sum-query-2d:optimal': {
    time: [
      'm is the number of rows, n the number of columns, and there are TWO bounds to state because the constructor and the query are different operations.',
      'The constructor fills one cell of the (m+1) x (n+1) prefix table per matrix cell, each from three already-computed neighbours: O(m x n) once.',
      'sumRegion then reads exactly four table entries and combines them with three additions and subtractions.',
      'O(m x n) to build, O(1) per query.',
    ],
    space: [
      'A prefix table with (m+1) x (n+1) entries, padded by one row and column so the corner lookups never need bounds checks.',
      'O(m x n).',
    ],
    gotcha:
      'Answering with one number is the mistake. A design problem is judged on the amortised picture: paying O(m x n) once so that q queries cost O(q) instead of O(q x m x n) is the entire trade, and you have to say both halves for it to make sense.',
  },
  'range-sum-query-2d:row-prefix-sums': {
    time: [
      'm rows, n columns, and again two separate bounds.',
      'The constructor accumulates one running sum per cell, so building all m row-prefix arrays is O(m x n).',
      'sumRegion loops over the rows in the query rectangle, doing O(1) subtraction per row.',
      'O(m x n) to build, O(rows in the query) per query — up to O(m) when the rectangle spans the whole matrix.',
    ],
    space: [
      'One prefix array of n+1 entries per row.',
      'O(m x n), the same as the 2D table.',
    ],
    gotcha:
      'Same build cost and same memory as the full 2D prefix sum, yet queries are O(m) instead of O(1). This variant is strictly worse — it exists to show that the second dimension of prefixing is free, so there is no reason not to take it.',
  },

  // ---- greedy: summing the ups -----------------------------------------------------
  'buy-sell-stock-ii:optimal': {
    time: [
      'n is the length of prices.',
      'One pass from index 1 to n-1.',
      'Per index: one comparison with the previous price and at most one addition, O(1).',
      'O(n).',
    ],
    space: ['A single running profit total.', 'O(1).'],
    gotcha:
      'It looks wrong to add up every one-day gain when the problem talks about buying and selling. It is not: holding across a rise from day i to day j is arithmetically identical to summing the consecutive daily deltas between them, so the greedy sum captures every multi-day gain too.',
  },
  'buy-sell-stock-ii:peak-valley': {
    time: [
      'n is the length of prices.',
      'Three nested-looking loops, but every one of them only ever does i += 1 — and i never decreases or resets.',
      'i therefore advances at most n times across the entire execution, so the total work is O(n), not O(n squared).',
      'O(n).',
    ],
    space: ['The index plus the current valley, peak and profit.', 'O(1).'],
    gotcha:
      'The while-inside-while makes this look quadratic. It is the classic amortised shape: a single monotonically increasing pointer with a total budget of n moves, however the loops are nested around it.',
  },

  // ---- generalising the voting trick ----------------------------------------------
  'majority-element-ii:optimal': {
    time: [
      'n is the length of nums.',
      'The voting pass is one loop of n iterations, each doing a constant number of comparisons and counter updates.',
      'Then the verification counts occurrences of at most TWO candidates, which is at most 2 extra full passes: O(2n).',
      'Sequential passes add: O(n) + O(n) = O(n).',
    ],
    space: [
      'Two candidates and two counters, four variables in total.',
      'O(1) — the count of variables is fixed by the n/3 threshold, not by the input.',
    ],
    gotcha:
      'The verification pass is not optional here, unlike in the n/2 version. Strictly more than n/3 means at most two such elements can exist, but nothing guarantees any do — the voting phase always leaves two candidates, and only the recount proves whether they qualify.',
  },
  'majority-element-ii:hash-map-count': {
    time: [
      'One pass over n elements building the count map, O(1) per element.',
      'Then one pass over the map, which has at most n entries, filtering those above n/3.',
      'O(n) + O(n) = O(n).',
    ],
    space: [
      'One map entry per distinct value, up to n of them when every element is unique.',
      'O(n).',
    ],
    gotcha:
      'Time is identical to Boyer-Moore, so this is never the wrong ANSWER — it is the wrong answer to the follow-up "now do it in O(1) space". Reach for voting only when that constraint is stated.',
  },

  // ---- the prefix-sum map: turning a search into a lookup -------------------------
  'subarray-sum-equals-k:optimal': {
    time: [
      'n is the length of nums.',
      'One pass over nums: n iterations.',
      'Per element, the running sum is updated, ONE map lookup asks how many earlier prefixes equal running - k, and one map write records the current prefix. All O(1) on average.',
      'n iterations x O(1) = O(n).',
    ],
    space: [
      'The map holds one entry per distinct prefix sum, up to n+1 of them.',
      'O(n).',
    ],
    gotcha:
      'The insight is that a subarray summing to k is exactly a PAIR of prefix sums differing by k. The quadratic version searches for the partner by scanning all earlier prefixes; the map already knows how many there are, so an O(n) search per element becomes an O(1) lookup. The seed 0:1 is what lets a subarray starting at index 0 be counted.',
  },
  'subarray-sum-equals-k:cumulative-array': {
    time: [
      'n is the length of nums.',
      'Building the prefix array is one pass, O(n).',
      'Then every (start, end) pair is tested: the outer loop runs n times and the inner loop runs up to n times.',
      'Nested loops multiply: n x n / 2 pairs, and constants drop, so O(n squared).',
    ],
    space: ['The prefix array of n+1 sums.', 'O(n).'],
    gotcha:
      'The prefix array already made each subarray sum O(1) to evaluate — that is a real win over recomputing sums, which would be O(n cubed). But it does not remove the pair enumeration, and the pair enumeration is the quadratic part.',
  },

  // ---- amortised, in place, and why the range matters ----------------------------
  'first-missing-positive:optimal': {
    time: [
      'n is the length of nums.',
      'The outer for runs n times, and the inner while swaps whenever nums[i] is in 1..n but sitting in the wrong slot.',
      'Every swap places at least one value at its final correct index, and a correctly placed value is never moved again — so there are at most n swaps across the ENTIRE run.',
      'That makes the total inner work O(n) amortised, not O(n) per outer iteration.',
      'A second pass finds the first index whose value is not i+1: O(n). Total O(n).',
    ],
    space: [
      'The input array is used as its own hash table: value v belongs at index v-1.',
      'O(1) auxiliary — the only allocations are the loop indices.',
    ],
    gotcha:
      'The while inside the for is the trap; people answer O(n squared). Name the budget: each swap permanently fixes one element, so all the whiles together can run at most n times. The other half of the trick is knowing the answer must lie in 1..n+1, which is what makes an in-place index-as-key encoding possible at all.',
  },
  'first-missing-positive:hash-set-probe': {
    time: [
      'n is the length of nums.',
      'Building the set from nums is one pass, O(n).',
      'The probe loop tries 1, 2, 3, ... and stops at the first absent value. It can run at most n+1 times, because n numbers cannot cover 1..n+1.',
      'Each probe is one O(1) set lookup, so O(n) + O(n) = O(n).',
    ],
    space: ['The set holds every distinct value in nums, up to n entries.', 'O(n).'],
    gotcha:
      'This is the easy O(n) time answer and it is correct — the interview asks for O(1) SPACE. Once you see that the answer is capped at n+1, the set is redundant: the array has n slots, which is exactly enough to record which of 1..n are present.',
  },

  // ---- stable overwrite vs swap ---------------------------------------------------
  'move-zeroes:optimal': {
    time: [
      'n is the length of nums.',
      'One pass with the read pointer covering every index once.',
      'Per index: one comparison and at most one swap, both O(1). The write pointer only ever advances alongside it, never independently.',
      'O(n).',
    ],
    space: ['Two indices, read and write, swapping in place.', 'O(1).'],
    gotcha:
      'Swapping does redundant work when there are no zeros — every element is swapped with itself. Same O(n), but the overwrite-and-pad variant writes each element at most once, which is the better constant.',
  },
  'move-zeroes:count-then-fill': {
    time: [
      'n is the length of nums.',
      'The first pass copies each non-zero forward: n iterations of O(1).',
      'The second while fills the remaining tail with zeros, running once per zero, which is at most n times total.',
      'The two loops are sequential and their iterations sum to at most 2n: O(n).',
    ],
    space: ['One insert index; both loops write into the caller array.', 'O(1).'],
    gotcha:
      'Two passes but not two full passes — the second loop only covers the tail, so together the loops touch about n+z positions for z zeros. Two sequential loops are still O(n); sequential work adds.',
  },

  // ---- two passes, and what O(1) means for an alphabet ---------------------------
  'first-unique-character:optimal': {
    time: [
      'n is the length of s.',
      'The first pass counts each character, n iterations of O(1) map work.',
      'The second pass walks s again and returns at the first character whose count is 1: up to n iterations of O(1).',
      'Sequential passes add: O(n) + O(n) = O(n).',
    ],
    space: [
      'The map holds one entry per DISTINCT character, capped at 26 for lowercase input.',
      'A constant ceiling, so O(1).',
    ],
    gotcha:
      'Two passes are necessary, not lazy. One pass cannot know a character is unique until the whole string has been read, and the second pass over the ORIGINAL string is what recovers the earliest index — iterating the map instead would lose the ordering.',
  },
  'first-unique-character:count-array-26': {
    time: [
      'Same two-pass structure as the map version: n counting iterations then up to n scanning iterations.',
      'Each step is an index computation and an array access, O(1) with no hashing.',
      'O(n), with a smaller constant factor than the hash map.',
    ],
    space: [
      'A fixed 26-slot array, allocated at that size whether s has 1 character or a million.',
      'O(1).',
    ],
    gotcha:
      'The O(1) is not because 26 is small; it is because 26 does not grow with n. Feed this arbitrary Unicode and the assumption collapses — the array indexing would be wrong, and the honest map bound is O(min(n, alphabet size)).',
  },

  // ---- two inputs, two sizes -----------------------------------------------------
  'intersection-of-two-arrays:optimal': {
    time: [
      'There are two inputs: n is the length of nums1 and m the length of nums2. Do not collapse them.',
      'Counting the smaller array into a map is one pass over it, O(1) per element.',
      'Then one pass over the larger array, doing one map read and one decrement each.',
      'Two sequential passes over different arrays add: O(n + m).',
    ],
    space: [
      'The map holds the distinct values of the SMALLER array, which is why the code swaps the arguments when nums1 is longer.',
      'O(min(n, m)).',
    ],
    gotcha:
      'The counts matter, not just membership. A plain set would return each shared value once; this problem wants each element as many times as it appears in both, which is why the map stores counts and decrements them as they are consumed.',
  },
  'intersection-of-two-arrays:sort-two-pointers': {
    time: [
      'n is the length of nums1, m the length of nums2.',
      'Sorting each array costs O(n log n) and O(m log m) respectively, and those dominate.',
      'The merge-style walk then advances one pointer per comparison, so together they make at most n + m moves: O(n + m).',
      'Sequential work adds and the linear walk is dominated by the sorts: O(n log n + m log m).',
    ],
    space: [
      'No auxiliary structure — the sorts are in-place and only the two indices are held.',
      'O(1), excluding the output list.',
    ],
    gotcha:
      'Asymptotically worse than the hash-map version, and it mutates both inputs. It wins on space, and it is the approach you want when the arrays arrive already sorted or are too large to fit in memory at once.',
  },
};
