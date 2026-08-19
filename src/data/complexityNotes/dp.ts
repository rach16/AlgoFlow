import type { ComplexityNote } from '../complexity';

/**
 * Complexity derivations for the 1-D and 2-D dynamic programming categories.
 *
 * The framing used throughout: a DP bound is
 *
 *     number of distinct states  x  work to fill one state
 *
 * Naming the state is the whole job. Once you can say "a state is (index, remaining amount)",
 * counting how many of those exist and what each one costs is mechanical.
 */
export const dpNotes: Record<string, ComplexityNote> = {
  // ============================================================================
  // dp-1d
  // ============================================================================

  'climbing-stairs:fibonacci-variables': {
    time: [
      'A state here is "how many ways to reach step i", so there are n distinct states.',
      'The loop visits each state once and does one addition per state: O(1) work.',
      'n states x O(1) each = O(n).',
    ],
    space: [
      'Only prev1 and prev2 are kept, because state i depends on exactly i-1 and i-2.',
      'Two numbers regardless of n, so O(1).',
    ],
    gotcha:
      'The state count is what makes this linear, not the loop. Naive recursion explores the same states over and over and costs O(2 to the n); the state count never changed, only how many times each state got recomputed.',
  },

  'min-cost-climbing-stairs:optimal': {
    time: [
      'n is the number of steps. A state is "cheapest cost to stand on step i", giving n+1 states.',
      'Each state is filled by comparing two already-known predecessors: one min of two sums, O(1).',
      '(n+1) states x O(1) work = O(n).',
    ],
    space: [
      'This version allocates the whole dp array of n+1 slots, so as written it is O(n).',
      'Only dp[i-1] and dp[i-2] are ever read, so two rolling variables give the O(1) quoted bound.',
    ],
    gotcha:
      'The recurrence pays the cost of the step you LEAVE, not the one you arrive at, so dp[i] uses cost[i-1] and cost[i-2]. Getting that off by one does not change the complexity, but it is the bug people actually hit.',
  },

  'min-cost-climbing-stairs:reverse-in-place': {
    time: [
      'Same n states as the array version, walked from the back instead of the front.',
      'Each position does one min of two neighbours it has already finalised: O(1).',
      'n states x O(1) = O(n).',
    ],
    space: [
      'The cost array itself is reused as the DP table, so nothing new is allocated.',
      'O(1) auxiliary - at the price of destroying the caller input.',
    ],
    gotcha:
      'This is O(1) only because it mutates the input. If the caller still needs the original costs you have to copy it first, and the copy puts you back at O(n).',
  },

  'house-robber:optimal': {
    time: [
      'n is the number of houses. A state is "best loot from the first i houses", so n states.',
      'Each state is one max between "skip house i" and "rob it plus dp[i-2]": O(1).',
      'n states x O(1) each = O(n).',
    ],
    space: [
      'This form allocates a dp array of length n, so strictly it is O(n).',
      'The recurrence reaches back only two slots, so two variables reproduce it in O(1) - which is the rolling-variables approach.',
    ],
    gotcha:
      'Brute force over every valid subset of non-adjacent houses is exponential. The collapse to O(n) comes from noticing the answer for prefix i depends on only two earlier answers, so the number of distinct states is n rather than 2 to the n.',
  },

  'house-robber:rolling-variables': {
    time: [
      'One pass over n houses, one state per house as before.',
      'Per house: one addition, one max, two assignments - a fixed number of operations.',
      'O(n).',
    ],
    space: [
      'rob1 and rob2 hold the two previous answers, and nothing else is allocated.',
      'O(1).',
    ],
    gotcha:
      'Identical time class to the array version - the array was never what made it O(n). Dropping it changes only the space bound, from O(n) to O(1).',
  },

  'house-robber-ii:optimal': {
    time: [
      'n is the number of houses arranged in a circle.',
      'The circle is broken by solving two linear subproblems: houses 0..n-2 and houses 1..n-1.',
      'Each subproblem is the linear house-robber scan, O(n) states x O(1) work.',
      'Two sequential O(n) passes add rather than multiply: O(n).',
    ],
    space: [
      'Each pass carries two rolling variables and they are not kept between passes.',
      'O(1).',
    ],
    gotcha:
      'People expect the circular version to cost more than the linear one. It does not - running the same linear DP twice is 2n work, and constants drop. The wrap-around is handled by excluding one endpoint per pass, not by extra state.',
  },

  'house-robber-ii:top-down-memoization': {
    time: [
      'A state is the starting index i inside one of the two ranges, so O(n) distinct states per range.',
      'Each state does one max over two recursive results, both O(1) once memoised.',
      'Two ranges x O(n) states x O(1) work = O(n).',
    ],
    space: [
      'A memo dictionary with up to n entries, per range.',
      'On top of that the recursion nests one frame per index, so the call stack is O(n) deep.',
      'O(n) either way.',
    ],
    gotcha:
      'Memoised recursion and the bottom-up scan have the SAME time bound, because they visit the same set of states. What differs is space: the bottom-up version needs no stack, while this one pays O(n) frames on top of the memo and can actually blow the stack on a large input.',
  },

  'longest-palindromic-substring:optimal': {
    time: [
      'n is the length of s. There are 2n-1 possible centres: n single characters and n-1 gaps between them.',
      'From each centre the two pointers expand outward while the characters match, at most n/2 steps.',
      '2n centres x O(n) expansion = O(n squared).',
    ],
    space: [
      'Only l, r and the best-so-far bookkeeping are kept.',
      'O(1) auxiliary, not counting the returned substring itself.',
    ],
    gotcha:
      'Two subtleties. First, you need both odd and even centres - checking only single-character centres misses "abba". Second, the s[l:r+1] slice inside the loop is an O(n) copy, but it only runs when the best length strictly increases, which can happen at most n times, so it does not change the O(n squared) total.',
  },

  'longest-palindromic-substring:dp-table': {
    time: [
      'A state is the pair (i, j) asking "is s[i..j] a palindrome", so there are about n squared / 2 states.',
      'Each state is answered in O(1) from one already-computed state: s[i] == s[j] and dp[i+1][j-1].',
      'O(n squared) states x O(1) work = O(n squared).',
    ],
    space: [
      'A full n x n boolean table, all of it live because the loops index it by length.',
      'O(n squared).',
    ],
    gotcha:
      'Same time class as expand-around-centre but n squared times more memory. That is the whole point of showing both: identical bound, and the table buys you nothing here. The iteration must go by increasing length, because dp[i][j] depends on the shorter interval inside it.',
  },

  'palindromic-substrings:optimal': {
    time: [
      'n is the length of s, and there are 2n-1 centres to try (n odd, n-1 even).',
      'Each centre expands outward while characters match, bounded by O(n) steps.',
      '2n centres x O(n) each = O(n squared).',
    ],
    space: ['Two pointers and a counter, nothing allocated per centre.', 'O(1).'],
    gotcha:
      'The count is the number of times the expansion succeeds, which is why this needs no table at all - every successful expansion IS one more palindromic substring. There can be O(n squared) of them, so O(n squared) time is also the size of the thing being counted.',
  },

  'palindromic-substrings:dp-table': {
    time: [
      'A state is the interval (i, j), so the state count is O(n squared).',
      'Filling one state is a character comparison plus one table lookup: O(1).',
      'O(n squared) states x O(1) = O(n squared).',
    ],
    space: ['An n x n boolean table.', 'O(n squared).'],
    gotcha:
      'The loop order matters more than the complexity: i descends and j ascends from i, which guarantees dp[i+1][j-1] is already filled. Get the order wrong and you read zeros - same bound, wrong answer.',
  },

  'decode-ways:optimal': {
    time: [
      'n is the length of the digit string. A state is "number of decodings of the first i characters", so n+1 states.',
      'Each state adds at most two predecessors after checking a one-digit and a two-digit slice: O(1).',
      '(n+1) states x O(1) work = O(n).',
    ],
    space: [
      'As written it allocates a dp array of n+1 entries, so O(n).',
      'Only dp[i-1] and dp[i-2] are read, so two variables reduce that to the quoted O(1).',
    ],
    gotcha:
      'This is Fibonacci with validity rules bolted on, and it stays O(n) for exactly the same reason. The int(s[i-2:i]) slice is a two-character slice, so it is O(1) - a slice is only expensive when its length grows with n.',
  },

  'decode-ways:top-down-memoization': {
    time: [
      'A state is the suffix start index i, so there are n+1 distinct states.',
      'Each state does a constant amount of work: one digit check, one two-digit range check, two lookups.',
      'n states x O(1) each = O(n).',
    ],
    space: [
      'The memo holds one entry per index, O(n).',
      'The recursion descends one frame per character before anything returns, another O(n).',
      'O(n).',
    ],
    gotcha:
      'Without the memo this is O(2 to the n) - two branches per position, depth n. The memo does not reduce the number of states, it stops each state being recomputed. Same time bound as the bottom-up version, worse space because of the stack.',
  },

  'coin-change:bfs-level-order': {
    time: [
      'n is the number of coin denominations and A the target amount. Two sizes, never collapse them.',
      'The graph has one node per reachable amount from 0 to A, and the visited array guarantees each is enqueued at most once.',
      'Dequeuing a node tries all n coins: O(n) work per node.',
      'A nodes x O(n) edges each = O(n x A).',
    ],
    space: [
      'A visited array of A+1 booleans, plus a queue that can hold up to A amounts at once.',
      'O(A).',
    ],
    gotcha:
      'Same bound as the DP table, because it is the same state space walked in a different order - the states are the amounts either way. BFS gets the minimum coin count for free from the level number, since every edge has weight 1. Drop the visited check and it degenerates into exponential re-exploration.',
  },

  'max-product-subarray:optimal': {
    time: [
      'n is the length of nums. A state is the pair (max product ending here, min product ending here).',
      'There are n positions, and each is computed from the previous pair with three multiplications and two comparisons: O(1).',
      'n states x O(1) work = O(n).',
    ],
    space: [
      'curMax, curMin and the running result - three numbers.',
      'O(1).',
    ],
    gotcha:
      'The reason you track the MINIMUM too is that a negative number turns the smallest product into the largest. That doubles the state per position, not the complexity - 2 x O(1) is still O(1). Brute force over all subarrays would be O(n squared).',
  },

  'max-product-subarray:prefix-suffix-scan': {
    time: [
      'One loop of n iterations that advances a prefix product and a suffix product simultaneously.',
      'Per iteration: two multiplications and one three-way max, all O(1).',
      'O(n).',
    ],
    space: ['Two running products and the result.', 'O(1).'],
    gotcha:
      'The (prefix or 1) idiom resets the running product to 1 after a zero, which is what makes a single pass legal - zeros cut the array into independent segments. Same O(n) as the min/max version with less state, but it leans on a Python truthiness trick that does not port cleanly.',
  },

  'word-break:optimal': {
    time: [
      'n is the length of s and m the length of the longest dictionary word.',
      'A state is "can s[0..i) be segmented", so there are n+1 states.',
      'Filling one state tries every split point j < i: up to n candidates, each needing a slice and a hash of the candidate substring, O(m).',
      'n states x n split points x O(m) per check = O(n squared x m).',
    ],
    space: [
      'A boolean dp array of n+1 entries, O(n), plus the word set holding the dictionary.',
      'O(n) for the DP, and the set is O(total dictionary characters).',
    ],
    gotcha:
      'The s[j:i] slice is not free - it copies and then hashes, which is where the m comes from. Since a slice can be as long as n, a literal reading of this code is O(n cubed); the quoted O(n squared x m) is what you get once you stop testing candidates longer than the longest word.',
  },

  'word-break:bfs-over-indices': {
    time: [
      'n is the length of s, m the longest word length. Nodes are the indices 0..n, so n+1 states.',
      'The visited set means each index is expanded at most once, exactly like the DP filling each cell once.',
      'Expanding an index scans every end position and slices-and-hashes: O(n) candidates x O(m).',
      'O(n squared x m) - the same bound as the table, reached by walking the states in BFS order.',
    ],
    space: [
      'The queue and visited set each hold at most n+1 indices, O(n), plus the word set.',
      'O(n) auxiliary.',
    ],
    gotcha:
      'The visited set is doing the memoisation here. Remove it and identical indices get re-expanded through different paths, and the running time goes exponential - a BFS without visited-marking is not a BFS.',
  },

  'longest-increasing-subsequence:optimal': {
    time: [
      'n is the length of nums. A state is "length of the longest increasing subsequence ENDING at index i", so n states.',
      'Filling state i scans every earlier index j to find the best extendable predecessor: O(n) work.',
      'n states x O(n) work per state = O(n squared).',
    ],
    space: ['One dp array of n lengths.', 'O(n).'],
    gotcha:
      'Defining the state as "ending at i" rather than "using the first i elements" is what makes the recurrence work, because it pins down the last element being compared. Note the answer is max(dp), not dp[-1] - the longest subsequence need not end at the final element.',
  },

  'longest-increasing-subsequence:binary-search-patience': {
    time: [
      'n is the length of nums. Each element is processed exactly once, so n iterations.',
      'Per element, a binary search over the tails array finds the first tail >= num.',
      'tails never exceeds length n, so each search is O(log n) - the log comes from halving that array, not from anything about nums.',
      'n elements x O(log n) per search = O(n log n).',
    ],
    space: ['The tails array, at most n entries when the whole input is increasing.', 'O(n).'],
    gotcha:
      'tails is NOT a longest increasing subsequence - only its LENGTH is correct, and its contents are usually not a real subsequence of the input. The trick is that overwriting a tail with a smaller value never shortens what can be built later. This is the O(n squared) DP replaced by a different state definition, which is why the derivation looks nothing alike.',
  },

  'partition-equal-subset-sum:optimal': {
    time: [
      'n is the number of items and S the target, which is half the total sum.',
      'A state is "is sum j reachable using the first i numbers", so the state count is n x S.',
      'Each state is one OR of two already-known booleans: O(1).',
      'n x S states x O(1) work = O(n x S).',
    ],
    space: [
      'A single boolean array of S+1 entries, reused across all n items.',
      'O(S).',
    ],
    gotcha:
      'This bound is pseudo-polynomial, not polynomial. S is the VALUE of the input, not its length - a sum written with one more digit multiplies the work by ten while the input grew by one character. Subset-sum is NP-complete precisely because of this distinction. The inner loop must also run DOWNWARD, or one number gets used twice.',
  },

  'partition-equal-subset-sum:reachable-sums-set': {
    time: [
      'n is the count of numbers and S the target half-sum.',
      'The set of reachable sums can never exceed S+1 distinct values, since anything above target is discarded.',
      'For each of the n numbers we iterate the whole set: O(S) work per number.',
      'n x O(S) = O(n x S), the same product as the boolean array.',
    ],
    space: [
      'Two sets of reachable sums, each capped at S+1 entries.',
      'O(S).',
    ],
    gotcha:
      'The set version is often assumed to be faster because it only holds sums that are actually reachable. Worst case that is all of them, so the bound is identical to the array - and hashing makes the constant factor worse. Same pseudo-polynomial caveat: S is a value, not a length.',
  },

  'tribonacci:optimal': {
    time: [
      'A state is T(i), and there are n+1 of them.',
      'Each state is one addition of the previous three: O(1).',
      'n states x O(1) = O(n).',
    ],
    space: [
      'Three variables a, b, c, because the recurrence reaches back exactly three places.',
      'O(1).',
    ],
    gotcha:
      'Naive recursion is O(3 to the n) - three branches per call, depth n. The number of distinct states was always n; recursion just visited each one an exponential number of times. Widening the window from Fibonacci two to Tribonacci three changes the constant, not the class.',
  },

  'tribonacci:dp-array-table': {
    time: [
      'The same n+1 states, filled left to right.',
      'One addition of three neighbours per state, O(1).',
      'O(n).',
    ],
    space: ['A dp array with one slot per index up to n.', 'O(n).'],
    gotcha:
      'Identical time to the rolling-variables version - the array does not cost extra time, only extra space. Keep the array when you need to query many values or reconstruct a path; drop it when you only want the last one.',
  },

  'combination-sum-iv:optimal': {
    time: [
      'n is the number of distinct numbers, T the target. Name both.',
      'A state is a remaining total from 0 to T, so T+1 states.',
      'Filling one state sums dp[total - num] over all n numbers: O(n) work.',
      'T states x O(n) work = O(T x n).',
    ],
    space: ['One dp array of T+1 counts.', 'O(T).'],
    gotcha:
      'Pseudo-polynomial again: T is a value, so the work scales with the magnitude of the target rather than with the input length. Also note the loop order - target outside, numbers inside - is what counts PERMUTATIONS. Swap them and you count combinations instead, which is a different problem with the same complexity.',
  },

  'combination-sum-iv:top-down-memo': {
    time: [
      'A state is the remaining amount, giving T+1 distinct states.',
      'Each state loops over all n numbers once, then is cached forever: O(n) per state.',
      'T x O(n) = O(T x n), identical to the bottom-up bound because the state set is identical.',
    ],
    space: [
      'The memo holds up to T+1 entries.',
      'Recursion depth is at most T divided by the smallest number, so O(T) stack frames sit on top of that.',
      'O(T).',
    ],
    gotcha:
      'Top-down only touches the states that are actually reachable, which can be far fewer in practice - but the worst-case bound is the same T x n. The real difference is the O(T) call stack, which the bottom-up loop does not pay.',
  },

  'perfect-squares:optimal': {
    time: [
      'n is the target number. A state is "fewest squares summing to target", one per value from 0 to n.',
      'Filling one state tries every perfect square not exceeding it, and there are about square root of n of those.',
      'n states x O(square root of n) work per state = O(n x square root of n).',
    ],
    space: ['A dp array of n+1 entries.', 'O(n).'],
    gotcha:
      'The work per state is NOT constant here, and that is the whole reason this is not O(n). Count the inner while loop: it runs while s x s <= target, which is square root of target times. Also pseudo-polynomial - n is the value being decomposed, not a length.',
  },

  'perfect-squares:bfs-level-order': {
    time: [
      'n is the target. Nodes are the remainders 0..n, and visited-marking enqueues each at most once.',
      'Expanding a node subtracts every perfect square below n: O(square root of n) edges per node.',
      'n nodes x O(square root of n) edges = O(n x square root of n) - the same state space as the table.',
    ],
    space: [
      'A visited array of n+1 booleans and a queue that can hold O(n) remainders.',
      'O(n).',
    ],
    gotcha:
      'BFS wins in practice because it stops at the first level that reaches zero, and the answer is famously at most 4 by Lagrange, so it usually explores a tiny fraction of the graph. The worst-case bound is unchanged - early exit does not improve big-O.',
  },

  'integer-break:optimal': {
    time: [
      'n is the integer being split. A state is "largest product for the value i", so n states.',
      'Filling state i tries every first part j from 1 to i-1: O(n) split points.',
      'n states x O(n) splits = O(n squared).',
    ],
    space: ['A dp array of n+1 products.', 'O(n).'],
    gotcha:
      'The j x (i - j) term covers stopping at two parts and the j x dp[i-j] term covers splitting further - you need both, because dp[i-j] can be smaller than i-j itself for tiny values. Missing one does not change the O(n squared), just the answer.',
  },

  'integer-break:math-threes': {
    time: [
      'n is the integer. The loop peels 3 off n each iteration, so it runs about n/3 times.',
      'Each iteration is one multiplication and one subtraction, O(1) for machine-size values.',
      'O(n).',
    ],
    space: ['A single running product.', 'O(1).'],
    gotcha:
      'This encodes a proof, not a search: 3s maximise the product, and you peel down to a remainder of 2, 3 or 4 rather than 1. It reads like O(1) maths but the loop is genuinely O(n) as written - and the product itself grows exponentially, so on arbitrary-precision integers even the multiplications stop being O(1).',
  },

  'stone-game-iii:optimal': {
    time: [
      'n is the number of stones. A state is the suffix start index i, so n+1 states.',
      'Filling one state tries taking 1, 2 or 3 stones - a fixed 3 options, so O(1) work.',
      'n states x O(1) work = O(n).',
    ],
    space: ['A dp array over suffix positions, n+1 entries.', 'O(n).'],
    gotcha:
      'The state stores a score DIFFERENCE, not a score, which is what keeps it one-dimensional - you do not need to track whose turn it is because the recurrence negates the opponent result. Trying to store both players scores would double the state and confuse the derivation for no gain.',
  },

  'stone-game-iii:top-down-memo': {
    time: [
      'A state is the index i, so n+1 states, each computed at most once thanks to the memo.',
      'Each state evaluates the same 3 choices: O(1) work.',
      'O(n) - identical to the bottom-up bound, since the state set is the same.',
    ],
    space: [
      'The memo holds up to n entries.',
      'Recursion can nest one frame per stone before unwinding, so the stack adds O(n).',
      'O(n).',
    ],
    gotcha:
      'Without the memo this is O(3 to the n) - three branches, depth n. Memoising collapses the call tree to the number of distinct states. The bottom-up suffix loop is the same O(n) time but avoids the O(n) recursion stack entirely.',
  },

  // ============================================================================
  // dp-2d
  // ============================================================================

  'unique-paths:math-combination': {
    time: [
      'The answer is the binomial coefficient C(m+n-2, m-1), because every path is a fixed multiset of downs and rights.',
      'The loop multiplies and divides k times where k = min(m, n) - 1.',
      'O(min(m, n)) - no table, no states.',
    ],
    space: ['One running numerator, updated in place.', 'O(1).'],
    gotcha:
      'The interleaved multiply-then-divide keeps the running value an exact integer and small, which is why this beats computing three factorials. This is the one grid-DP problem with a closed form; do not expect the trick to generalise to unique-paths-ii, where obstacles destroy the symmetry the identity relies on.',
  },

  'longest-common-subsequence:optimal': {
    time: [
      'm is the length of text1 and n the length of text2. Two sizes, so never write n squared.',
      'A state is the pair (i, j) meaning "LCS of the first i and first j characters": (m+1) x (n+1) states.',
      'Filling one state is one character comparison and a max of two neighbours: O(1).',
      'O(m x n) states x O(1) work = O(m x n).',
    ],
    space: ['The full (m+1) x (n+1) table is allocated and kept.', 'O(m x n).'],
    gotcha:
      'Keep the whole table only if you need to RECONSTRUCT the subsequence by walking backward from dp[m][n]. If you only want the length, the table is waste - see the rolling-array approach.',
  },

  'longest-common-subsequence:rolling-1d-array': {
    time: [
      'Same m x n states as the table version - the state count does not change when you shrink storage.',
      'Each state still does one comparison and one max, O(1), with prev holding the diagonal value.',
      'O(m x n).',
    ],
    space: [
      'Only one row of n+1 values plus the single saved diagonal, because dp[i][j] reads only row i-1 and the current row to its left.',
      'O(n) as written, or O(min(m, n)) if you make the shorter string the inner loop.',
    ],
    gotcha:
      'The prev variable is the whole trick: overwriting dp[j] in place destroys dp[i-1][j-1], the diagonal, so it must be stashed before the write. Same time, 1/m the memory, and you give up the ability to reconstruct the actual subsequence.',
  },

  'buy-sell-stock-cooldown:optimal': {
    time: [
      'n is the number of prices. A state is (day, holding or not), which is 2n states - a constant factor of 2, not a second dimension.',
      'Each day updates three running values with a couple of maxes: O(1) work.',
      'O(n) states x O(1) = O(n).',
    ],
    space: [
      'Three scalars: hold, sold and rest, each carrying one state forward.',
      'O(1).',
    ],
    gotcha:
      'The cooldown is what forces the third state - after selling you cannot buy the next day, so "rest" has to be tracked separately from "sold". Adding a state to the machine multiplies the work by a constant, which is why a 2-state or 3-state machine is still plain O(n).',
  },

  'buy-sell-stock-cooldown:top-down-memo-dfs': {
    time: [
      'A state is the tuple (i, buying), so there are 2n distinct states.',
      'Each state does a constant amount of work - two recursive lookups and a max - once memoised.',
      '2n states x O(1) each = O(n).',
    ],
    space: [
      'The memo holds up to 2n entries, O(n).',
      'The recursion nests up to n frames deep before the base case returns.',
      'O(n).',
    ],
    gotcha:
      'Same time bound as the state machine, because both enumerate the same 2n states. The difference is entirely space: this pays O(n) for the memo plus O(n) for the stack, where the iterative version needs three variables.',
  },

  'coin-change-ii:optimal': {
    time: [
      'n is the number of coin denominations and A the target amount.',
      'A state is (first i coins considered, amount j), so the state count is n x A.',
      'Each state adds two already-computed values - skip this coin, or use it again: O(1).',
      'O(n x A) states x O(1) work = O(n x amount).',
    ],
    space: [
      'This version allocates the whole (n+1) x (A+1) table, which is O(n x amount).',
      'Row i reads only row i-1 and itself, so one rolling row gives the quoted O(amount).',
    ],
    gotcha:
      'Pseudo-polynomial: A is the VALUE of the amount, not the length of the input, so an amount with one extra digit is ten times the work. The coin loop must be OUTSIDE the amount loop, otherwise you count orderings and get the permutation answer instead of combinations.',
  },

  'coin-change-ii:one-d-knapsack': {
    time: [
      'Same n x A state space as the table - one state per (coin prefix, amount) pair.',
      'Each state is a single addition, O(1), with the row being overwritten in place.',
      'O(n x amount).',
    ],
    space: ['A single array of A+1 counts, reused for every coin.', 'O(amount).'],
    gotcha:
      'The inner loop runs UPWARD here, unlike 0/1 knapsack. That is deliberate: reading dp[j - coin] after it has already been updated for this same coin is exactly what allows a coin to be reused. Direction of the inner loop is the difference between bounded and unbounded knapsack, at no cost in complexity.',
  },

  'target-sum:optimal': {
    time: [
      'n is the number of items and S the derived subset target (target + total) / 2.',
      'The problem is rewritten as counting subsets summing to S, so a state is (first i numbers, sum j): n x S states.',
      'Each state adds at most two predecessors: O(1) work.',
      'O(n x S) states x O(1) = O(n x sum).',
    ],
    space: [
      'The code allocates a full (n+1) x (S+1) table, so O(n x sum) as written.',
      'Each row depends only on the previous one, so a single rolling array reaches the quoted O(sum).',
    ],
    gotcha:
      'Pseudo-polynomial: S is a value derived from the numbers themselves, so the table grows with their magnitude rather than with n. The parity guard matters too - if target + total is odd there is no valid subset, and skipping that check means indexing a half-integer.',
  },

  'target-sum:one-d-subset-sum': {
    time: [
      'The same n x S state space, held in one array instead of a grid.',
      'One addition per state, O(1).',
      'O(n x sum).',
    ],
    space: ['One array of S+1 counts.', 'O(sum).'],
    gotcha:
      'The inner loop descends from S to num because this is 0/1 knapsack - each number may be used once. Iterate upward and you would be reading a value already updated for this same number, counting it twice. Same bound, wrong answer.',
  },

  'interleaving-string:optimal': {
    time: [
      'm is the length of s1 and n the length of s2; s3 must be m+n long or the answer is immediately false.',
      'A state is (i characters of s1 used, j of s2 used), which pins down position i+j-1 in s3: (m+1) x (n+1) states.',
      'Each state is two boolean checks against already-filled neighbours: O(1).',
      'O(m x n) states x O(1) work = O(m x n).',
    ],
    space: ['The full (m+1) x (n+1) boolean table.', 'O(m x n).'],
    gotcha:
      'The index into s3 is not a third dimension - it is forced to i+j-1 by the other two, which is why the state is 2-D and not 3-D. Miss that and you convince yourself the problem is O(m x n x (m+n)). The greedy "take whichever character matches" approach fails outright when both match.',
  },

  'interleaving-string:rolling-1d-dp': {
    time: [
      'Same (m+1) x (n+1) states, walked row by row.',
      'Constant work per state: dp[j] combines the old dp[j] (the row above) with dp[j-1] (already updated on this row).',
      'O(m x n).',
    ],
    space: [
      'One boolean row of n+1 entries, because a state depends only on the cell above and the cell to its left.',
      'O(n).',
    ],
    gotcha:
      'dp[0] must be updated at the start of every row, since the first column tracks "s1 only so far" and it decays to false as soon as a character mismatches. Forgetting it silently keeps a stale true and passes small tests.',
  },

  'longest-increasing-path-matrix:optimal': {
    time: [
      'm rows and n columns, so m x n cells. A state is a cell (r, c) and its answer is the longest increasing path starting there.',
      'The memo means each cell is computed exactly once no matter how many cells point at it.',
      'Computing one cell looks at its 4 neighbours: O(1) work, since 4 is a constant.',
      'O(m x n) states x O(1) work = O(m x n).',
    ],
    space: [
      'The memo holds one entry per cell, O(m x n).',
      'The DFS stack can be as deep as the longest strictly increasing path, which is up to m x n cells.',
      'O(m x n).',
    ],
    gotcha:
      'No visited set is needed here, unlike ordinary grid DFS. Paths must strictly increase, so the graph is acyclic and you can never revisit a cell on the current path. Without the memo the same subpaths get recomputed and the bound is exponential.',
  },

  'longest-increasing-path-matrix:topological-peeling': {
    time: [
      'The grid has m x n cells and at most 4 x m x n directed edges, one per strictly-increasing neighbour pair.',
      'Building the out-degree table touches every cell and its 4 neighbours: O(m x n).',
      'Peeling processes each cell once and decrements along each incoming edge once: O(m x n) again.',
      'Sequential phases add, so O(m x n).',
    ],
    space: [
      'The out-degree grid is O(m x n) and the frontier queue can hold O(m x n) cells.',
      'O(m x n).',
    ],
    gotcha:
      'Same bound as memoised DFS, and the honest reason to prefer it is that it has no recursion stack to overflow on a large grid. The layer count IS the answer because peeling in topological order means a cell only leaves once every cell it can reach has already left.',
  },

  'distinct-subsequences:optimal': {
    time: [
      'm is the length of s and n the length of t.',
      'A state is (i characters of s consumed, j characters of t matched), giving (m+1) x (n+1) states.',
      'Filling one state is one character comparison and at most one addition: O(1).',
      'O(m x n) states x O(1) work = O(m x n).',
    ],
    space: ['The full (m+1) x (n+1) table of counts.', 'O(m x n).'],
    gotcha:
      'The count can be astronomically large even though the table is small - the number of matching subsequences is exponential in m while the DP that counts them is O(m x n). DP counts answers without enumerating them, which is exactly why the bound is polynomial.',
  },

  'distinct-subsequences:top-down-memo': {
    time: [
      'A state is the pair (i, j), so the state count is again O(m x n).',
      'Each state does one comparison plus two memo lookups: O(1).',
      'O(m x n) - the same bound as bottom-up, because it is the same state set.',
    ],
    space: [
      'The memo dictionary can hold one entry per (i, j) pair: O(m x n).',
      'Recursion depth is bounded by m+n, since every call advances i or both indices.',
      'O(m x n), dominated by the memo.',
    ],
    gotcha:
      'The recursion is what people get wrong, not the complexity: dfs(i+1, j) is taken ALWAYS - skipping s[i] is always allowed - and dfs(i+1, j+1) is added only on a match. Both branches advance i, which is why the depth is O(m+n) and not exponential.',
  },

  'edit-distance:optimal': {
    time: [
      'm is the length of word1 and n the length of word2.',
      'A state is (i, j) meaning "edit distance between the two prefixes", so (m+1) x (n+1) states.',
      'Each state is one comparison and a min over three neighbours - insert, delete, replace: O(1).',
      'O(m x n) states x O(1) work = O(m x n).',
    ],
    space: ['The full (m+1) x (n+1) table of distances.', 'O(m x n).'],
    gotcha:
      'The three-way min is three specific neighbours, not a search - so work per state is O(1), not O(n). People who see min() and assume a scan talk themselves into O(m x n x something). Keep the table only if you need to reconstruct the actual edit script.',
  },

  'edit-distance:rolling-rows': {
    time: [
      'Identical m x n state space, filled one row at a time.',
      'Constant work per state: a min over prev[j], prev[j-1] and curr[j-1].',
      'O(m x n).',
    ],
    space: [
      'Two rows of n+1 integers are live at once - the previous row and the one being built.',
      '2(n+1) is O(n), down from O(m x n).',
    ],
    gotcha:
      'The reason one row suffices is structural: dp[i][j] reads only row i-1 and the cell to its immediate left. Nothing ever reaches back two rows, so rows older than one are dead. That single observation is the whole rolling-row optimisation, and it applies to every DP whose recurrence looks only one row back.',
  },

  'burst-balloons:optimal': {
    time: [
      'n is the number of balloons, plus two sentinel 1s at the ends.',
      'A state is an open interval (left, right), so the state count is O(n squared) - roughly n choose 2 pairs.',
      'Filling one state tries every k strictly inside the interval as the LAST balloon burst: O(n) split points.',
      'O(n squared) intervals x O(n) splits = O(n cubed).',
    ],
    space: ['An n x n table over intervals.', 'O(n squared).'],
    gotcha:
      'The state must be "k is burst LAST in this interval", not first. Bursting last is what makes the two sides independent - the neighbours of k are then exactly the interval endpoints, which do not move. That reframing is the entire problem; the O(n cubed) then falls out as intervals x split points.',
  },

  'burst-balloons:top-down-memo': {
    time: [
      'A state is the interval pair (l, r), so O(n squared) distinct states.',
      'Each state loops over every split point k between l and r: O(n) work.',
      'O(n squared) x O(n) = O(n cubed), the same bound as bottom-up because the states are the same.',
    ],
    space: [
      'The memo holds up to O(n squared) intervals.',
      'Recursion depth is O(n), since each call shrinks the interval by at least one - dominated by the memo.',
      'O(n squared).',
    ],
    gotcha:
      'Top-down is easier to get right here because you do not have to reason about filling intervals in increasing-length order - the recursion enforces it. Identical complexity, and the O(n) stack is invisible next to the O(n squared) memo.',
  },

  'regex-matching:optimal': {
    time: [
      'm is the length of s and n the length of the pattern p.',
      'A state is (i characters of s matched, j characters of p consumed), so (m+1) x (n+1) states.',
      'Each state is a constant number of checks: is p[j-1] a star, does the preceding pattern char match s[i-1], plus two table reads.',
      'O(m x n) states x O(1) work = O(m x n).',
    ],
    space: ['The full (m+1) x (n+1) boolean table.', 'O(m x n).'],
    gotcha:
      'The star case is what looks expensive and is not. "Star matches zero occurrences" is dp[i][j-2] and "star matches one more" is dp[i-1][j] - two lookups, not a loop over how many characters the star consumed. Writing that loop is the classic mistake and turns O(m x n) into O(m squared x n).',
  },

  'regex-matching:top-down-memo': {
    time: [
      'A state is the pair (i, j) of positions in s and p, so O(m x n) states.',
      'Each state resolves in constant work once the two recursive calls are memoised.',
      'O(m x n) - identical to bottom-up, because both enumerate the same (i, j) grid.',
    ],
    space: [
      'The memo can hold one entry per (i, j) pair: O(m x n).',
      'Recursion depth is O(m + n), since every call advances i or j - dominated by the memo.',
      'O(m x n).',
    ],
    gotcha:
      'Unmemoised, the star branching makes this exponential - dfs(i, j+2) and dfs(i+1, j) both spawn full subtrees over overlapping positions. The memo does not shrink the state set, it just stops each state being recomputed. Note dfs(i+1, j) keeps j fixed, which is how a star consumes many characters without a loop.',
  },

  'unique-paths-ii:optimal': {
    time: [
      'm rows and n columns. A state is a cell, so m x n states.',
      'Each cell sums the cell above and the cell to the left, or is zeroed if it holds an obstacle: O(1).',
      'O(m x n) states x O(1) work = O(m x n).',
    ],
    space: ['A full m x n table of path counts.', 'O(m x n).'],
    gotcha:
      'The closed-form binomial trick from unique-paths does not survive obstacles - once cells can be blocked, the count is no longer a symmetric choice of moves and you genuinely need the table. An obstacle in the first row or column must zero out everything after it, which falls out naturally from dp[i][j] = 0.',
  },

  'unique-paths-ii:rolling-row-1d': {
    time: [
      'Same m x n states, one row of the grid at a time.',
      'Per cell: either zero it for an obstacle or add the value to its left, O(1).',
      'O(m x n).',
    ],
    space: [
      'One row of n counts, because a cell needs only the row above (already in dp[j]) and its left neighbour (already updated).',
      'O(n).',
    ],
    gotcha:
      'The in-place update is doing double duty: before the write dp[j] is the cell ABOVE, after it is the cell to the LEFT for the next column. Reading it in the wrong order breaks everything. Space drops from O(m x n) to O(n) with no change in time.',
  },

  'minimum-path-sum:optimal': {
    time: [
      'm rows, n columns. A state is a cell holding "cheapest sum to reach here", so m x n states.',
      'The first row and column are prefix sums, then every interior cell is one min of two neighbours plus its own value: O(1).',
      'O(m x n) states x O(1) work = O(m x n).',
    ],
    space: ['A full m x n table.', 'O(m x n).'],
    gotcha:
      'Greedy - always step toward the smaller neighbour - fails, because a cheap next step can lead into an expensive region. That is the signature of a problem that needs DP: locally optimal choices do not compose. The complexity is the easy part.',
  },

  'minimum-path-sum:rolling-row-1d': {
    time: [
      'The same m x n states, computed row by row.',
      'One min of two values plus one addition per cell: O(1).',
      'O(m x n).',
    ],
    space: [
      'A single row of n sums, since a cell reads only the value above it and the value to its left.',
      'O(n).',
    ],
    gotcha:
      'dp[0] has to be accumulated separately at the top of each row - the leftmost column has no left neighbour, so it is a running total down the first column. This is the same rolling-row argument as everywhere else: nothing reaches back two rows, so only one row must survive.',
  },

  'last-stone-weight-ii:optimal': {
    time: [
      'n is the number of stones and T their total weight. The problem reduces to finding the reachable subset sum closest to T/2.',
      'A state is (first i stones, sum j) for j up to T/2, so the state count is n x T/2.',
      'Each state is one boolean carry-forward plus one lookup: O(1).',
      'O(n x T) states x O(1) work = O(n x total).',
    ],
    space: [
      'The code keeps the whole (n+1) x (T/2+1) boolean table.',
      'O(n x total) as written; a single rolling row would make it O(total).',
    ],
    gotcha:
      'Pseudo-polynomial - total is a VALUE summed from the stones, not an input length, so ten stones of weight a million cost far more than ten stones of weight ten. The reduction is the insight: every stone ends up on one side of the final subtraction, so smashing stones is just partitioning them into two piles.',
  },

  'last-stone-weight-ii:reachable-sums-set': {
    time: [
      'n is the stone count and T the total weight.',
      'The set of reachable subset sums can never exceed T+1 distinct values, so it is bounded by the total, not by 2 to the n.',
      'Each of the n stones rebuilds the set by iterating all of it: O(T) work per stone.',
      'n x O(T) = O(n x total).',
    ],
    space: ['The set of reachable sums, capped at T+1 entries.', 'O(total).'],
    gotcha:
      'This looks like it enumerates all 2 to the n subsets, and it would if sums were distinct - the bound comes entirely from sums COLLIDING into at most T+1 buckets. Same pseudo-polynomial caveat: T is a magnitude, so the set can be enormous even for a handful of stones.',
  },

  'stone-game:optimal': {
    time: [
      'n is the number of piles. A state is the interval (i, j) of piles still on the table, so O(n squared) states.',
      'Filling one state is a max over exactly two choices - take the left pile or the right one: O(1) work.',
      'O(n squared) states x O(1) work = O(n squared).',
    ],
    space: ['An n x n table over intervals.', 'O(n squared).'],
    gotcha:
      'Contrast this with burst-balloons: both are interval DPs with O(n squared) states, but there the work per state was O(n) split points and here it is 2 fixed choices - hence O(n squared) rather than O(n cubed). Storing the score DIFFERENCE is what avoids a "whose turn is it" dimension.',
  },

  'stone-game:parity-math': {
    time: [
      'The two strided slices each sum about n/2 elements.',
      'Two linear passes, and sequential work adds rather than multiplying.',
      'O(n).',
    ],
    space: [
      'piles[0::2] and piles[1::2] each materialise a list of about n/2 elements.',
      'O(n) as written; summing with a strided index instead of a slice makes it the quoted O(1).',
    ],
    gotcha:
      'The answer is literally always true, so O(1) is achievable - the parity argument is a proof, not a computation. With an even number of piles the two ends always have opposite parity, so Alice can commit to all even indices or all odd ones and take whichever group is larger. Do not offer this in an interview without being able to prove it; the O(n squared) interval DP is the answer they want.',
  },

  'stone-game-ii:optimal': {
    time: [
      'n is the number of piles. A state is the pair (index i, current multiplier M), and M is bounded by n, so the state count is O(n squared).',
      'This is the important step: the state is 2-D even though the input is a flat array.',
      'Filling one state tries every x from 1 to 2M, which is O(n) options in the worst case.',
      'O(n squared) states x O(n) work per state = O(n cubed).',
    ],
    space: [
      'The memo holds one entry per (i, M) pair, O(n squared), plus an O(n) suffix-sum array.',
      'Recursion depth is O(n) and is dominated by the memo.',
      'O(n squared).',
    ],
    gotcha:
      'The whole derivation hinges on realising M is part of the state. Answer "O(n) states" and the O(n cubed) bound looks impossible; once you see the state is (i, M) it is just O(n squared) states x O(n) choices. The suffix-sum array is what keeps each choice O(1) instead of re-summing the remaining piles.',
  },

  'stone-game-ii:bottom-up-table': {
    time: [
      'Same state space: (i, M) pairs with both indices bounded by n, so O(n squared) states.',
      'Each state loops over up to 2M candidate moves: O(n) work.',
      'O(n squared) x O(n) = O(n cubed), identical to the memoised version.',
    ],
    space: [
      'An (n+1) x (n+1) table plus the O(n) suffix sums.',
      'O(n squared), and unlike the recursion there is no stack on top.',
    ],
    gotcha:
      'Both loops must descend, because dp[i][M] reads dp[i+x][...] for larger indices. Filling forward reads zeros and quietly returns a wrong answer. The suffix sums must be precomputed too - computing sum(piles[i:]) inside the inner loop would add a factor of n and make this O(n to the fourth).',
  },
};
