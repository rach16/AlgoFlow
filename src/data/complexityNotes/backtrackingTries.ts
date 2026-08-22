import type { ComplexityNote } from '../complexityTypes';

/**
 * Complexity derivations for the backtracking and trie categories.
 *
 * Backtracking framing: the bound is the SHAPE OF THE SEARCH TREE.
 *
 *     branches ^ depth  =  number of nodes,  x  the cost of the work at a node
 *
 * and separately, "how many solutions are there" x "what does it cost to write one out".
 * Most of these problems are output-bound: 2 to the n subsets, n! permutations,
 * C(n, k) combinations. When the answer is exponential the algorithm has to be, and
 * pruning is a constant-factor win rather than a change of class.
 *
 * Trie framing: name the number of words and the word length separately, every time.
 * The headline is that insert and search are O(word length) no matter how many words
 * are stored — the count of stored words never enters the bound.
 */
export const backtrackingTriesNotes: Record<string, ComplexityNote> = {
  // ============================================================================
  // backtracking
  // ============================================================================

  'subsets:iterative-cascading': {
    time: [
      'n is the length of nums, and the outer loop runs once per element.',
      'Before element i the result holds 2 to the i subsets, and the comprehension copies every one of them to append the new element.',
      'Those copies cost up to O(n) each, and the sizes form a geometric series 1 + 2 + 4 + ... + 2 to the (n-1), which sums to 2 to the n.',
      'O(n x 2 to the n).',
    ],
    space: [
      'The result list is not merely the output here, it is the working array: every round is built out of the previous one.',
      'It ends holding 2 to the n subsets, so O(2 to the n) lists — or O(n x 2 to the n) if you count individual elements.',
    ],
    gotcha:
      'The doubling is both the trick and the cost: 2 to the n is the SIZE OF THE ANSWER, so nothing can do better. Unlike the backtracking version you cannot claim O(n) auxiliary space, because the growing result is the algorithm state.',
  },

  'combination-sum:bottom-up-dp': {
    time: [
      'Two sizes: n candidate values and the target amount T. Never collapse them into one n.',
      'The outer two loops are one pass per candidate x one pass per amount, so n x T cells are touched.',
      'At each cell the inner loop walks every combination already stored at dp[t - c] and copies it with the new candidate appended, at O(k) per copy for combinations of length k.',
      'O(n x T x k), where that last factor is really "how much combination data sits in one cell" — so like the backtracking version this is ultimately output-bound.',
    ],
    space: [
      'dp has T+1 cells and every cell holds the full list of combinations that reach that amount.',
      'O(T x k), again meaning "T cells x the combinations inside each one".',
    ],
    gotcha:
      'This builds every intermediate answer for every amount below the target, and almost all of them are thrown away. Backtracking only ever holds one path, which is why its space is O(target) instead of the whole table.',
  },
  'combination-sum:optimal': {
    time: [
      'Two sizes: n candidates and the target T. The sort at the top is O(n log n) and is dominated by everything below it.',
      'Every recursive call subtracts a candidate of at least 1 from remaining, so the tree is at most T levels deep.',
      'Each node branches over up to n candidates and passes i unchanged, so the nodes correspond to non-decreasing candidate sequences summing to at most T.',
      'That count grows exponentially in T, and a completed combination costs a further O(T) to copy out.',
      'O(2 to the target), which is a loose ceiling on that sequence count.',
    ],
    space: [
      'Recursion depth is bounded by the target, since every level consumes at least 1 of it.',
      'The current path holds at most that many candidates, so O(target) auxiliary, excluding the result list.',
    ],
    gotcha:
      'Sorting plus the break when candidates[i] > remaining is what makes this usable, but it is a constant-factor win only. The worst case is unchanged: a candidate set of small numbers prunes almost nothing.',
  },

  'permutations:iterative-insertion': {
    time: [
      'n is the length of nums, and the outer loop runs once per element.',
      'After k elements perms holds k! lists, and each one is expanded into k+1 new lists by inserting the next element at every position.',
      'Each new list is built by slicing and concatenating, O(k) work, so round k costs k! x (k+1) x O(k).',
      'Factorials grow fast enough that the final round dominates the sum: O(n x n!).',
    ],
    space: [
      'Two whole levels are alive at once: the level being read and the level being built.',
      'The last level holds n! lists of n elements, so O(n x n!) — the output is the working set and cannot be excluded.',
    ],
    gotcha:
      'Same time class as backtracking, far worse space. Backtracking holds one path of n elements; this holds an entire factorial-sized level in memory before it can start the next one.',
  },
  'permutations:optimal': {
    time: [
      'n is the length of nums. There are n! complete permutations: n choices for the first slot, n-1 for the next, and so on.',
      'Every node loops over all n indices and skips the used ones, so O(n) work per node.',
      'Copying a finished permutation into the result is another O(n), and there are n! of those copies.',
      'The leaves dominate the internal nodes: O(n x n!).',
    ],
    space: [
      'Recursion is n deep, plus a used array of n booleans and a current path of at most n elements.',
      'O(n) auxiliary, not counting the n! permutations in the output.',
    ],
    gotcha:
      'The n in O(n x n!) is not the branching factor, it is the cost of writing one finished permutation out. n! is the number of answers, so the algorithm is output-bound and no cleverness removes the factorial.',
  },

  'subsets-ii:iterative-cascading-dedup': {
    time: [
      'n is the length of nums. The sort is O(n log n) and is dwarfed by what follows.',
      'Each element extends either the whole result or, for a repeated value, only the subsets created in the previous round.',
      'The result at most doubles per element, so there are at most 2 to the n subsets and each is copied at O(n).',
      'O(n x 2 to the n) — duplicates only ever make the real count smaller.',
    ],
    space: [
      'The result list holds every distinct subset and doubles as the working array.',
      'At most 2 to the n subsets, so O(2 to the n).',
    ],
    gotcha:
      'prev_size is the whole dedup mechanism: a repeated value may only extend the subsets that the previous copy of that value created. Without it the same subset gets generated several times.',
  },
  'subsets-ii:optimal': {
    time: [
      'n is the length of nums, sorted first at O(n log n) so that equal values sit next to each other.',
      'The tree has one node per subset the code is willing to emit, at most 2 to the n of them since each element is in or out.',
      'Each node appends a copy of the current path, which costs O(n).',
      'O(n x 2 to the n).',
    ],
    space: [
      'Recursion depth is at most n and the current path holds at most n values.',
      'O(n) auxiliary, excluding the exponential result list.',
    ],
    gotcha:
      'The skip condition is i > start, not i > 0. A duplicate is skipped at the same level but still allowed deeper down, which is how [2,2] is generated while a second [2] is not.',
  },

  'combination-sum-ii:iterative-explicit-stack': {
    time: [
      'n is the number of candidates, sorted first at O(n log n). Each candidate is used at most once, so the search space is the subsets of candidates.',
      'That is at most 2 to the n frames popped, and each pop loops over the remaining candidates.',
      'Every push builds combo + [candidates[i]], a fresh copy costing up to O(n).',
      'Counted exactly that is O(n x 2 to the n); the tab quotes the looser O(2 to the n), which drops the per-combination copy.',
    ],
    space: [
      'The stack holds only the unexpanded siblings along the current path — at most n per level over at most n levels — but each frame carries its own copy of the combination.',
      'The result list is the large allocation, holding up to 2 to the n combinations, so O(2 to the n).',
    ],
    gotcha:
      'Turning recursion into an explicit stack saves nothing here. Instead of one shared path that is pushed and popped, every frame carries a full copy of its combination.',
  },
  'combination-sum-ii:optimal': {
    time: [
      'n is the number of candidates and target the goal sum; the sort is O(n log n) and is dominated.',
      'i + 1 is passed down, so each candidate is used at most once and the tree explores subsets: at most 2 to the n nodes.',
      'Each node loops over the remaining candidates at O(1) per check, and a completed combination is copied at O(n).',
      'That is O(n x 2 to the n) counted exactly, quoted as O(2 to the n) once the copy factor is dropped.',
    ],
    space: [
      'Recursion depth is bounded by how many candidates can fit under the target, so at most min(n, target) levels.',
      'The current path is the same size, giving O(target) auxiliary, excluding the output.',
    ],
    gotcha:
      'Two similar-looking lines do different jobs. The break when candidates[i] > remaining is pruning and only buys speed; the skip when i > start and the value repeats is correctness, and removing it emits duplicate combinations.',
  },

  'word-search:iterative-dfs-stack': {
    time: [
      'Three sizes: m rows, n columns, and L the length of the word.',
      'Every cell matching the first letter becomes a seed frame, so there are up to m x n starting points.',
      'From each, the search branches 4 ways per letter to a depth of L, giving up to 4 to the L paths.',
      'Each frame also copies its path and scans it for the current cell, both O(L), so the exact count is O(m x n x 4 to the L x L).',
      'The tab drops that trailing L: O(m x n x 4 to the L).',
    ],
    space: [
      'Every frame carries its own path list of up to L cells, which is what makes this version expensive.',
      'The live stack is the m x n seed frames plus the unexpanded siblings along one root-to-leaf path, three per level over L levels.',
      'That is O(m x n + L squared) in reality; the quoted O(4 to the L x L) is a pessimistic "whole frontier at once" reading that a depth-first stack never reaches.',
    ],
    gotcha:
      'Path-as-a-copy is the flaw. The recursive version marks the board in place and restores it, so it needs O(L) space and O(1) visited checks; here every frame pays O(L) to copy the path and O(L) to search it.',
  },
  'word-search:optimal': {
    time: [
      'Three sizes: m rows, n columns, and L the length of the word.',
      'The outer double loop tries every cell as a starting point: m x n searches.',
      'Each search has at most 4 directions per letter and stops at depth L, so at most 4 to the L paths per start (really 3 to the L, since you never step back the way you came).',
      'O(m x n x 4 to the L).',
    ],
    space: [
      'Only the recursion stack, one frame per letter matched, so at most L deep.',
      'Visited marking writes "#" into the board itself rather than allocating a set, so O(L).',
    ],
    gotcha:
      'It is not O(m x n) just because the grid is scanned once. Each cell launches a fresh exponential search, so grid size and word length multiply rather than add.',
  },

  'palindrome-partitioning:dp-table-dfs': {
    time: [
      'n is the length of s.',
      'Filling isPal is a double loop over start and end: n squared cells, each decided in O(1) from a shorter entry already computed.',
      'The search then has one node per prefix that splits cleanly into palindromes, at most 2 to the n, since each of the n-1 gaps is either a cut or not.',
      'Every palindrome test is now a single table lookup, and emitting a finished partition costs O(n).',
      'O(n squared) for the table plus O(n x 2 to the n) for the search, so O(n x 2 to the n).',
    ],
    space: [
      'The isPal table is n x n booleans: O(n squared).',
      'Recursion depth and the current path add O(n), which is dominated.',
    ],
    gotcha:
      'The table does not change the class, it changes what the n in O(n x 2 to the n) pays for. Here it pays only for copying an answer out; in the on-the-fly version it also pays to re-check palindromes.',
  },
  'palindrome-partitioning:optimal': {
    time: [
      'n is the length of s. There are n-1 gaps between characters and each is either cut or not, so at most 2 to the (n-1) partitions.',
      'The recursion has one node per valid palindrome prefix, bounded by that same 2 to the n.',
      'At each node the loop slices a candidate substring and two-pointer checks it, O(n) per candidate.',
      'The standard accounting is 2 to the n partitions x O(n) to build and copy each: O(n x 2 to the n).',
    ],
    space: [
      'Recursion is at most n deep, one level per cut.',
      'The pieces in current hold at most n characters in total, so O(n) auxiliary, excluding the exponential result.',
    ],
    gotcha:
      'It is tempting to charge the O(n) palindrome check at every one of the 2 to the n nodes and answer O(n squared x 2 to the n). The numerous nodes are the deep ones, and they have almost no suffix left to check, so the work decays geometrically and O(n x 2 to the n) holds.',
  },

  'letter-combinations:iterative-bfs-product': {
    time: [
      'n is the number of digits; each digit maps to 3 letters, or 4 for 7 and 9.',
      'Every round replaces result with its cross product against the current digit letters, multiplying its size by 3 or 4.',
      'After n rounds there are at most 4 to the n combinations, and each string is rebuilt by concatenation in every round.',
      'O(4 to the n) counting combinations, O(n x 4 to the n) counting the characters actually copied.',
    ],
    space: [
      'Two full levels are alive during the comprehension: the old result and the new one.',
      'The final level holds up to 4 to the n strings of length n, so O(4 to the n) strings.',
    ],
    gotcha:
      'combo + letter creates a new string each round instead of extending one, so a combination of length n is rebuilt n times. That is where the extra factor of n hides.',
  },
  'letter-combinations:optimal': {
    time: [
      'n is the number of digits. Each level of the tree branches over the 3 or 4 letters of one digit.',
      'Branching 4 to a depth of n gives at most 4 to the n leaves, one per combination.',
      'Every leaf joins the current path into a string, which is O(n).',
      'O(4 to the n) leaves, or O(n x 4 to the n) if you charge for building each string.',
    ],
    space: [
      'The current path holds one letter per digit and recursion is n deep.',
      'O(n) auxiliary, excluding the 4 to the n results.',
    ],
    gotcha:
      'The exponential base is the letters per digit, not the input size: 3 to the n for most digits and 4 only where 7 and 9 appear. 4 to the n is the ceiling, 3 to the n is closer to typical.',
  },

  'n-queens:bitmask': {
    time: [
      'n is the board size, and exactly one queen goes in each row, so the tree is n levels deep.',
      'Row 0 has n legal columns, row 1 at most n-1, row 2 at most n-2: multiplying those bounds the tree at n! nodes.',
      'Per candidate the bit tricks isolate the lowest free column in O(1), so a node costs only as much as the columns it tries.',
      'Recording a solution copies the whole board, O(n squared), but only at the leaves. O(n!).',
    ],
    space: [
      'The three masks are single integers and recursion is n deep, so the search state itself is O(n).',
      'But board is an n x n grid alive for the whole run, so the honest total is O(n squared) auxiliary, excluding the result list.',
    ],
    gotcha:
      'The masks replace three hash sets with three integers — a real constant-factor and cache win, and no change to n! whatsoever. The n x n board is still allocated, so this version is not asymptotically lighter than the hash-set one.',
  },
  'n-queens:optimal': {
    time: [
      'n is the board size, and exactly one queen goes in each row, so the recursion is n levels deep.',
      'Level 0 tries n columns, level 1 at most n-1 remaining columns, and so on: the product is bounded by n!.',
      'At each node the loop runs n times and every check is three O(1) set lookups.',
      'Emitting a solution joins n rows of n characters, O(n squared), and only happens at leaves. O(n!).',
    ],
    space: [
      'The board is n x n characters: O(n squared).',
      'The three sets hold at most one entry per placed row, O(n), and recursion is n deep.',
      'O(n squared), dominated by the board, excluding the output.',
    ],
    gotcha:
      'n! bounds the TREE, not the number of solutions — there are only 92 solutions for n = 8. Diagonal conflicts kill most branches immediately, which is why n-queens runs at all, but pruning cannot improve the worst-case bound.',
  },

  'subset-xor-total:bit-math-or': {
    time: [
      'n is the length of nums, and one pass ORs every value together.',
      'Each OR is a single machine-word operation, O(1), and the final shift by n-1 is O(1) too.',
      'O(n).',
    ],
    space: [
      'One accumulator integer, no matter how long nums is.',
      'O(1).',
    ],
    gotcha:
      'The identity is the whole solution: any bit set in some element is set in exactly half of the 2 to the n subset XORs, so the answer is (OR of all) x 2 to the (n-1). Recognising it turns an exponential enumeration into a single pass.',
  },
  'subset-xor-total:optimal': {
    time: [
      'n is the length of nums, and each call decides include-or-exclude for one index.',
      'Two branches per level to a depth of n gives 2 to the n leaves and about 2 to the (n+1) nodes overall.',
      'Per node the work is one XOR or one addition, O(1) — nothing is copied or allocated.',
      'O(2 to the n).',
    ],
    space: [
      'Recursion is n deep and each frame holds only an index and a running XOR.',
      'O(n) for the call stack.',
    ],
    gotcha:
      'This is the rare backtracking problem with no n factor on the exponential, because it only carries the running XOR and never materialises a subset. Compare Subsets at O(n x 2 to the n), where that n is purely the cost of copying each subset out.',
  },

  'combinations:iterative-odometer': {
    time: [
      'Two sizes: n values to choose from and k slots to fill. The number of answers is C(n, k).',
      'The loop emits exactly one combination per iteration, so it runs C(n, k) times.',
      'Each iteration copies the combo at O(k), then rolls the odometer: scanning back for a slot below its ceiling and refilling to the right, each at most k steps.',
      'C(n, k) iterations x O(k) each = O(k x C(n, k)).',
    ],
    space: [
      'One combo array of k values, reused in place.',
      'O(k) auxiliary, not counting the C(n, k) combinations in the output.',
    ],
    gotcha:
      'No recursion and no wasted nodes: every iteration produces an answer. The backtracking version also visits internal nodes that produce nothing, which is the same order here but not free.',
  },
  'combinations:optimal': {
    time: [
      'Two sizes: n is the range of values and k the size of each combination, so there are C(n, k) answers.',
      'The leaves of the tree are exactly those C(n, k) combinations, and each is copied out at O(k).',
      'The internal nodes are the shorter increasing prefixes, and there are the sum of C(n, j) over j below k of them.',
      'For the usual case of k at most n/2 that sum is the same order as C(n, k), so O(k x C(n, k)).',
    ],
    space: [
      'Recursion is k deep, since every level adds exactly one number.',
      'The current path holds k values: O(k) auxiliary, excluding the output.',
    ],
    gotcha:
      'This version omits the "not enough numbers left" prune, so it still walks prefixes that can never reach length k — badly visible when k is close to n. Stopping the loop at n - (k - len(current)) + 1 makes the node count genuinely proportional to C(n, k).',
  },

  'permutations-ii:frequency-counter': {
    time: [
      'n is the length of nums and d the number of distinct values, with d at most n.',
      'Each node loops over the d counter keys instead of the n positions, so branching is by value rather than by index.',
      'A value at count zero is skipped, so every leaf is a distinct permutation — at most n! of them, fewer whenever there are duplicates.',
      'Each leaf copies a permutation of length n, giving O(n x n!) as the worst case (all values distinct).',
    ],
    space: [
      'The counter holds d entries, the current path holds n values, and recursion is n deep.',
      'O(n) auxiliary, excluding the output list.',
    ],
    gotcha:
      'Decrementing and restoring the count makes duplicates impossible rather than merely filtered: there is no wasted branch to skip. Same bound as sort-plus-used, strictly less work done.',
  },
  'permutations-ii:optimal': {
    time: [
      'n is the length of nums; the sort is O(n log n), puts equal values next to each other, and is dominated by everything after it.',
      'The tree is n levels deep and each node loops over all n indices, skipping used ones and duplicate twins.',
      'The leaves are the distinct permutations: n! divided by the product of the duplicate counts factorial, so at most n!.',
      'Each leaf copies n values, so O(n x n!) worst case, reached when every value is distinct.',
    ],
    space: [
      'A used array of n booleans, a current path of n values, and n frames of recursion.',
      'O(n) auxiliary, not counting the permutations returned.',
    ],
    gotcha:
      'The skip needs the "and not used[i - 1]" clause. Drop it and you also prune legitimate branches where the earlier twin is already placed, losing permutations instead of just duplicates.',
  },

  'matchsticks-to-square:bitmask-dp': {
    time: [
      'n is the number of matchsticks. A state is a subset of sticks already placed, so there are 2 to the n states.',
      'Because every side has the same target, the only extra information a state needs is how much is on the side in progress — that is what the modulo stores in dp[mask].',
      'Each reachable state tries adding each of the n unused sticks, O(1) per attempt.',
      '2 to the n states x O(n) work per state = O(n x 2 to the n).',
    ],
    space: [
      'One dp array with a slot per subset of the n sticks.',
      'O(2 to the n).',
    ],
    gotcha:
      'This beats the O(4 to the n) backtracking bound because it never re-explores a subset. The trade is memory: 2 to the n integers must be allocated up front, so around n = 30 the DP runs out of memory while pruned backtracking still finishes.',
  },
  'matchsticks-to-square:optimal': {
    time: [
      'n is the number of matchsticks and there are exactly 4 sides.',
      'Each stick is assigned to one of the 4 sides, so the tree is n deep with branching 4: up to 4 to the n leaves.',
      'Per node the work is a comparison and an addition per side, O(1) since 4 is a constant.',
      'O(4 to the n).',
    ],
    space: [
      'The sides array is exactly 4 counters, which is O(1), plus recursion n deep.',
      'O(n) for the call stack.',
    ],
    gotcha:
      'Sorting descending and skipping a side whose running total equals the previous side are pruning, not complexity. They cut the constant enormously — big sticks fail fast, interchangeable sides get tried once — but the worst case is still 4 to the n.',
  },

  'partition-k-equal-subsets:bitmask-dp': {
    time: [
      'n is the count of numbers and k the number of buckets. A state is which numbers are already placed: 2 to the n states.',
      'Since every bucket has the same target, the amount in the bucket in progress is all the extra state needed, which is what dp[mask] modulo target holds.',
      'Each reachable state tries each of the n unplaced numbers at O(1).',
      'O(n x 2 to the n), with k entering only through the target value total / k.',
    ],
    space: [
      'A dp array with one slot per subset of the n numbers.',
      'O(2 to the n).',
    ],
    gotcha:
      'k has vanished from the bound and that is the point: the mask plus one running remainder pins down the whole partial assignment, so the DP never has to know which bucket it is on.',
  },
  'partition-k-equal-subsets:optimal': {
    time: [
      'n is the count of numbers and k the number of buckets, each of which must reach total / k.',
      'Filling one bucket is a search over subsets of the remaining numbers, so at most 2 to the n nodes.',
      'When a bucket closes the search restarts for the next one, and there are k buckets to close.',
      'O(k x 2 to the n).',
    ],
    space: [
      'A used array of n booleans plus recursion at most n + k deep, since each level either places a number or closes a bucket.',
      'O(n) auxiliary.',
    ],
    gotcha:
      'Three prunes stack up here — the descending sort, the current + nums[i] > target cut, and the duplicate skip — and not one of them changes O(k x 2 to the n). They are the difference between milliseconds and hours at the same worst-case bound.',
  },

  'n-queens-ii:hash-set-diagonals': {
    time: [
      'n is the board size; one queen per row means n levels of recursion.',
      'The first row has n candidate columns, the second at most n-1, and so on, so the product bounds the tree at n! nodes.',
      'Each candidate is checked with three O(1) set lookups: col, row + col and row - col.',
      'Counting a solution is a single increment, so the leaves add nothing extra. O(n!).',
    ],
    space: [
      'Three sets holding at most one entry per placed row, O(n), plus n frames of recursion.',
      'O(n) — there is no board to store, because only the count is wanted.',
    ],
    gotcha:
      'The two diagonal identities are the trick. Cells on one diagonal share row - col and cells on the other share row + col, which turns an O(n) diagonal scan into a single O(1) lookup.',
  },
  'n-queens-ii:optimal': {
    time: [
      'n is the board size and the recursion is n rows deep, one queen per row.',
      'free is the complement of the three attack masks, so its set bits are exactly the safe columns in this row.',
      'The while loop isolates one bit at a time with free & -free, O(1) per candidate, and the number of safe columns still shrinks row by row: bounded by n!.',
      'O(n!).',
    ],
    space: [
      'Three integers per frame, and no board or sets at all.',
      'Recursion depth n, so O(n).',
    ],
    gotcha:
      'Shifting diag1 left and diag2 right on the way down is what keeps the masks O(1) to maintain: the attack pattern moves with the row instead of being recomputed. Same n! as the hash-set version, several times faster in practice.',
  },

  'word-break-ii:dp-breakpoints-reconstruct': {
    time: [
      'n is the length of s. The first phase is a double loop over end i and start j, so O(n squared) pairs.',
      'Each pair slices s[j:i] and hashes it into the word set, and both of those read the whole substring — so the phase is O(n cubed) as written, or O(n squared x L) if you cap the slice at the longest dictionary word L.',
      'The second phase walks the breakpoint lists and joins one string per sentence, O(n) per sentence.',
      'The number of sentences can be exponential in n, so the total is O(n squared + output) with the output term dominating whenever the answer is large.',
    ],
    space: [
      'dp is n+1 lists of start indices, and a position can have O(n) of them: O(n squared).',
      'The result holds every sentence, each O(n) long, so O(n squared + output).',
    ],
    gotcha:
      'The reachable array is what makes this beat naive backtracking: a start index only enters dp[i] if the prefix before it is itself breakable, so reconstruction never walks into a dead end. The exponential that remains is the answer, not wasted search.',
  },
  'word-break-ii:optimal': {
    time: [
      'n is the length of s, and backtrack is memoised on start, so there are only n distinct subproblems.',
      'Each subproblem scans every end position, slicing s[start:end] and hashing it: O(n) candidates x O(n) per substring, so O(n squared) per start (the tab counts the substring check as O(1) and quotes O(n squared) overall).',
      'But every sentence returned by a subproblem is re-concatenated with the current word by its caller, at O(n) per sentence.',
      'The number of sentences can reach 2 to the (n-1) — an s of one repeated letter with that letter and its double in the dictionary — so the time is output-bound.',
      'O(n squared + 2 to the n).',
    ],
    space: [
      'The memo holds one list per start index, and those lists together hold every sentence of every suffix.',
      'O(n squared + output), where the output term is the honest dominant one.',
    ],
    gotcha:
      'Memoisation bounds the number of distinct SUBPROBLEMS at n but cannot bound the ANSWER. When the output is exponential the algorithm must be too — the memo only stops you from recomputing the same exponential list twice.',
  },

  // ============================================================================
  // tries
  // ============================================================================

  'implement-trie:prefix-hash-sets': {
    time: [
      'Two sizes: N words stored and L the length of the word in hand.',
      'insert adds the word, then adds all L of its prefixes; prefix i is a fresh string of length i, so building them costs 1 + 2 + ... + L = O(L squared).',
      'search and startsWith are one set lookup each — but hashing the query reads all L of its characters, so each is O(L), not the O(1) the tab claims.',
      'O(L squared) per insert, O(L) per lookup.',
    ],
    space: [
      'The prefixes set stores every prefix of every word: N words x L prefixes x up to L characters each.',
      'O(N x L squared).',
    ],
    gotcha:
      'The stated O(1) lookup is the classic hash-map illusion. Hashing a key of length L is O(L), exactly the same as walking L trie nodes — so the trie does not win on lookup speed. It wins on insert cost and on space, where O(N x L) beats O(N x L squared).',
  },
  'implement-trie:optimal': {
    time: [
      'Two sizes: N words inserted and m the length of the word being operated on (the tab writes this bound as O(n), where that n is m).',
      'insert, search and startsWith all walk one node per character of that word: m steps.',
      'Each step is one hash-map lookup on a children map holding at most 26 entries, so O(1).',
      'O(m) per operation — and crucially independent of N, which never appears in the bound at all.',
    ],
    space: [
      'One node per distinct prefix across all inserted words, so O(total characters inserted), at worst O(N x m) when no two words share a prefix.',
      'Each node carries a children map bounded by the alphabet, so the 26 is a constant factor on node size, not a factor of n.',
    ],
    gotcha:
      'The value of a trie is what is NOT in the bound. A list of words costs O(N x m) per search; the trie costs O(m) whether it holds ten words or ten million. Shared prefixes are a space bonus, not the reason for the time bound.',
  },

  'add-search-words:length-buckets': {
    time: [
      'Two sizes: N words added and L the length of the query.',
      'addWord appends the word to the bucket for its length: O(1).',
      'search scans every word in the same-length bucket, comparing character by character with "." matching anything.',
      'That is O(N x L) per search in the worst case, where all N words happen to have the query length.',
    ],
    space: [
      'Every word is stored exactly once across the buckets.',
      'O(N x L) characters.',
    ],
    gotcha:
      'Bucketing by length is a genuine win and is why this is workable at all, but it is a constant-factor filter, not a change of class. Search still scans a list, so its cost grows with how many words you have stored.',
  },
  'add-search-words:optimal': {
    time: [
      'Two sizes: m is the length of the pattern and N the number of words added, so the trie has at most N x m nodes (the tab writes the bound as O(n), where n is the pattern length in the no-wildcard case).',
      'addWord walks or creates one node per character: O(m).',
      'A search with no dots follows exactly one child per character: O(m), independent of how many words are stored.',
      'Each dot forks into every child of the current node, so an all-dots pattern visits every trie node down to depth m.',
      'O(m) for a concrete pattern, up to O(N x m) — the size of the trie — when the wildcards force a full walk.',
    ],
    space: [
      'The trie holds one node per distinct prefix: O(N x m) worst case, less when words share prefixes.',
      'The wildcard DFS recurses one frame per pattern character, adding O(m).',
    ],
    gotcha:
      'A bare O(m) is only true when the pattern has no dots. Each dot multiplies the branching by up to 26, so k dots cost up to 26 to the k node visits — bounded, in the end, by the size of the trie itself.',
  },

  'word-search-ii:per-word-dfs': {
    time: [
      'Four sizes: W words, m rows, n columns, and L the longest word length.',
      'Each word gets its own complete grid search: m x n starting cells, and up to 4 to the L paths from each.',
      'Nothing is shared between words, so the per-word cost simply multiplies by W.',
      'O(W x m x n x 4 to the L).',
    ],
    space: [
      'Only the recursion stack, at most L frames, since visited marking overwrites the board in place and restores it afterwards.',
      'O(L) auxiliary, excluding the result list.',
    ],
    gotcha:
      'Two words sharing a prefix each re-walk that prefix across the whole grid from scratch. That redundancy, not the exponential, is what the trie version removes — it deletes the W factor entirely.',
  },
  'word-search-ii:optimal': {
    time: [
      'Four sizes: W words, L the longest word, and m x n for the grid.',
      'Building the trie inserts every word character by character: O(W x L), dwarfed by the search.',
      'The grid search starts once per cell, and each step must find board[r][c] among the current node children — a prefix no word continues stops that branch immediately.',
      'Branching is 4 per step and depth cannot exceed L, because past L characters no trie node remains to walk into.',
      'O(m x n x 4 to the L) — one search covering all W words instead of one search per word.',
    ],
    space: [
      'The trie is one node per distinct prefix of the word list: O(W x L) worst case.',
      'The visited set holds only the current path, at most L cells, and recursion is L deep.',
    ],
    gotcha:
      'The trie does not improve the 4 to the L, it removes the W. What it buys is early termination: the DFS abandons a direction the instant no stored word continues that way, while the per-word version keeps walking until the letters actually disagree.',
  },

  'extra-characters-in-string:hash-set-dp': {
    time: [
      'Three sizes: n is the length of s, m the number of dictionary words, and L the longest word length.',
      'dp[i] is "fewest extra characters in s from i onward", so there are n+1 states, filled right to left.',
      'Filling one state scans every end j, and each check slices s[i:j+1] and hashes it — O(length) to build the slice and O(length) to hash it, not O(1).',
      'n states x n end positions x O(L) per substring check = O(n squared x L).',
    ],
    space: [
      'The word set stores every dictionary word: O(m x L) characters.',
      'The dp array is n+1 integers.',
      'O(m x L + n).',
    ],
    gotcha:
      'The hidden cost is s[i:j+1]. It reads like a free index expression and it is a copy plus a hash over the whole substring. That one L factor is the entire reason the trie version exists.',
  },
  'extra-characters-in-string:optimal': {
    time: [
      'Three sizes: n is the length of s, m the number of dictionary words, and L the longest word length.',
      'Building the trie walks every character of every word once: O(m x L).',
      'The DP still has n states and still scans forward from each one, but it now walks the trie one node per character instead of slicing a substring.',
      'Each step is a single child lookup, O(1), and the loop breaks the moment no child matches — so a state costs O(n) instead of O(n x L).',
      'O(n squared) for the DP plus O(m x L) to build it: O(n squared + m x L).',
    ],
    space: [
      'The trie holds one node per distinct prefix of the dictionary: O(m x L).',
      'The dp array is n+1 integers, so O(m x L + n) in total.',
    ],
    gotcha:
      'The trie replaces hashing a substring with a walk that reuses the previous step. Same states, same scan, but the per-check L disappears — and the break on a missing child usually ends the inner loop long before j reaches n.',
  },
};
