import type { ComplexityNote } from '../complexity';

/**
 * Complexity derivations for the Stack and Linked List categories.
 *
 * Two lessons recur and are made explicit rather than asserted:
 *  - Stack: AMORTISED counting. Every monotonic-stack problem has an inner while that looks
 *    quadratic and is linear because each element is pushed once and popped at most once.
 *  - Linked list: O(1) space is the whole game. Pointer-only rewiring is O(1); the array and
 *    hash-set alternates are O(n); recursion is O(n) from the call stack even when it
 *    allocates nothing.
 */
export const stackLinkedListNotes: Record<string, ComplexityNote> = {
  // ================================ STACK =========================================

  'valid-parentheses:optimal': {
    time: [
      'n is the length of s.',
      'One pass over the characters, so n iterations.',
      'Per character: one dictionary membership test, one peek at the top of the stack, and one push or pop — all O(1).',
      'n iterations x O(1) = O(n).',
    ],
    space: [
      'The stack holds the unmatched openers seen so far.',
      'A string of n opening brackets pushes all of them before anything pops, so O(n).',
    ],
    gotcha:
      'People claim O(1) space because "we only track brackets". The stack grows with the input — worst case it holds every character. Only a counter-based solution for ONE bracket type is O(1), and it cannot handle three types.',
  },
  'valid-parentheses:string-replacement': {
    time: [
      'n is the length of s.',
      'Each pass of the while loop runs three replace calls, and each replace scans and rebuilds the whole remaining string: O(n) per pass.',
      'Every pass must delete at least one pair or the loop exits, and there are at most n/2 pairs — so up to O(n) passes.',
      'O(n) passes x O(n) per pass = O(n squared).',
    ],
    space: [
      'Each replace builds a brand-new string, since Python strings are immutable.',
      'One such copy is alive at a time, so O(n).',
    ],
    gotcha:
      'This one really IS quadratic — it is not an amortised false alarm. The reason is the nesting: on "((((...))))" only the innermost pair is adjacent, so each full rescan of the string removes just one pair. The stack version deletes a pair in O(1) by looking only at the top.',
  },

  'min-stack:optimal': {
    time: [
      'n is the number of elements currently in the stack, but no operation ever loops over them.',
      'push appends to two arrays and takes one min of two numbers; pop pops both arrays; top and getMin read the last element.',
      'Every operation is a fixed number of steps, so O(1) each — worst case, not amortised.',
    ],
    space: [
      'Two parallel stacks, each with one entry per pushed element.',
      '2n entries, so O(n).',
    ],
    gotcha:
      'The tempting design is to keep a single minVal variable. It breaks on pop: once the minimum is popped you have no way to recover the previous minimum without scanning, which is O(n). Storing the minimum-at-the-time alongside each element is what buys O(1).',
  },
  'min-stack:single-stack-pairs': {
    time: [
      'Same operation set, same counting: push does one min and one append, pop does one pop, top and getMin index the last pair.',
      'No operation depends on how many elements are stored, so O(1) each.',
    ],
    space: [
      'One stack of (value, minimum-so-far) pairs, one pair per pushed element.',
      'Two numbers x n entries, so O(n) — the same class as two separate stacks.',
    ],
    gotcha:
      'This looks like it halves the memory versus two stacks. It does not — a pair per element is still 2n numbers. The difference is constant-factor and cache locality, not complexity class.',
  },

  'evaluate-reverse-polish-notation:optimal': {
    time: [
      'n is the number of tokens.',
      'One pass over the tokens: n iterations.',
      'An operator token does two pops, one arithmetic operation and one push; an operand does one push. All O(1).',
      'O(n).',
    ],
    space: [
      'The stack holds the operands not yet consumed by an operator.',
      'For valid RPN that is at most about n/2 entries, so O(n).',
    ],
    gotcha:
      'The membership test token in "+-*/" is a scan of a 4-character string, which is O(1) because 4 is a constant. Compare that with x in someList where the list grows with n — that one is O(n) and would make this quadratic.',
  },
  'evaluate-reverse-polish-notation:recursive-from-end': {
    time: [
      'n is the number of tokens.',
      'Each call pops exactly one token from the end of the array, and pop() from the end is O(1).',
      'Every token is popped exactly once across the whole recursion, so there are n calls doing O(1) work each.',
      'O(n).',
    ],
    space: [
      'The recursion depth is the depth of the expression tree encoded by the tokens.',
      'A left-leaning expression like "1 2 + 3 + 4 + ..." nests n/2 deep, so O(n) in the worst case.',
    ],
    gotcha:
      'The right operand is evaluated BEFORE the left, because reading right-to-left encounters the right subtree first. Swapping those two lines silently breaks subtraction and division while leaving the complexity unchanged — a correctness trap, not a cost one.',
  },

  'generate-parentheses:optimal': {
    time: [
      'n is the number of pairs. The number of valid strings is the nth Catalan number, which grows like 4 to the n divided by n to the 1.5.',
      'Backtracking only ever extends a prefix that can still become valid, so no branch is wasted — the call tree has one leaf per answer.',
      'Each completed string costs O(n) to join and copy into the result.',
      'O(4 to the n / square root of n), counting the join into the output.',
    ],
    space: [
      'The recursion depth is 2n, one frame per character placed, and the working list holds at most 2n characters.',
      'O(n) auxiliary, not counting the exponential output list.',
    ],
    gotcha:
      'The naive bound is O(2 to the 2n x n): generate every string of brackets, then validate each. Pruning with the two conditions openCount < n and closeCount < openCount is what replaces 4 to the n with the Catalan number — same exponential family, far fewer leaves, and the exponential is unavoidable because it is the size of the answer.',
  },
  'generate-parentheses:iterative-bfs': {
    time: [
      'Same count of states as the backtracking version: one queue entry per valid prefix, and the answers number about 4 to the n / square root of n.',
      'Each dequeued prefix does O(n) work building one or two extended copies, since strings are immutable and current + "(" copies the prefix.',
      'That gives the same O(4 to the n / square root of n) family as the DFS.',
      'But queue.pop(0) on a Python list shifts every remaining element, and the queue can hold exponentially many prefixes — so as written this adds a factor proportional to the queue length.',
    ],
    space: [
      'BFS holds an entire frontier at once, and the widest level contains exponentially many prefixes of length up to 2n.',
      'O(4 to the n / square root of n) — exponentially worse than the DFS, which only ever holds one path.',
    ],
    gotcha:
      'This is the real lesson of the pair: same time class, catastrophically different space. DFS holds one root-to-leaf path (O(n)); BFS holds a whole level. Also swap the list for collections.deque — pop(0) on a list is O(len), not O(1).',
  },

  'daily-temperatures:reverse-jump': {
    time: [
      'n is the number of temperatures.',
      'The outer loop walks backward n times. The inner while advances j, but never one step at a time: j += result[j] leaps over an entire block whose answer is already known.',
      'Each jump lands on a strictly warmer day than the one before, so the jump chain from any i is bounded by the number of distinct increasing records to its right, and across the whole run the jumps are paid out of the already-computed spans rather than rescanned.',
      'O(n) amortised, the same class as the stack version.',
    ],
    space: [
      'Only the loop indices i and j, plus the result array.',
      'O(1) auxiliary, not counting the output array that the problem requires you to return.',
    ],
    gotcha:
      'This is the stack version turned inside out: the monotonic stack is encoded IN the result array instead of a separate structure, which is why the auxiliary space drops from O(n) to O(1). If you cannot see the amortised argument here, the explicit stack version is the one to say out loud in an interview.',
  },

  'car-fleet:optimal': {
    time: [
      'n is the number of cars.',
      'Zipping and sorting the (position, speed) pairs by position descending is O(n log n) — this dominates.',
      'Then one pass over the sorted pairs: per car, one division and one comparison against the stack top, O(1).',
      'Sequential work adds, so O(n log n) + O(n) = O(n log n).',
    ],
    space: [
      'The sorted array of n pairs, plus a stack that in the worst case (every car its own fleet) holds n arrival times.',
      'O(n).',
    ],
    gotcha:
      'There is no inner while here at all — nothing is ever popped, so this is not the amortised case. The stack is only ever pushed to and its length read, which is why it is really just a counter. The sort is the whole cost, and that is the bound to state before writing any code.',
  },
  'car-fleet:sorted-times-scan': {
    time: [
      'Identical structure: sort n pairs by position descending, O(n log n).',
      'One pass tracking the slowest arrival time seen so far, O(1) per car.',
      'O(n log n) — the sort dominates, exactly as in the stack version.',
    ],
    space: [
      'The sorted pair array is O(n); beyond it only two scalars, fleets and slowest.',
      'O(n) because of the sort input, or O(1) auxiliary if you count only what the scan itself adds.',
    ],
    gotcha:
      'This makes the point that the stack in the "stack" solution was never needed: only its top element and its length were ever read, so one float and one counter replace it. Same O(n log n) time, strictly less auxiliary space.',
  },

  'largest-rectangle-in-histogram:optimal': {
    time: [
      'n is the number of bars.',
      'The outer loop runs n times. The inner while pops taller bars, which makes this look like O(n squared).',
      'But each bar is pushed exactly once and popped at most once, so the total number of pops across the entire run is at most n — the inner loop is spending a budget, not doing fresh work each iteration.',
      'A final drain of the leftover stack costs at most another n.',
      'O(n) outer + O(n) pops + O(n) drain = O(n).',
    ],
    space: [
      'The stack holds (start index, height) pairs and can contain every bar in the worst case — a strictly increasing histogram never pops.',
      'O(n).',
    ],
    gotcha:
      'Name the budget when you answer: "each bar is pushed once and popped at most once, so pops total n across the whole run". Saying just "O(n) because it is a stack" does not show you can tell this apart from the genuinely quadratic string-replacement pattern.',
  },
  'largest-rectangle-in-histogram:divide-and-conquer': {
    time: [
      'n is the number of bars. Each call scans its range to find the minimum bar, which is O(range).',
      'The minimum splits the range and the function recurses on both sides, so this is T(n) = O(n) + T(k) + T(n-k-1) for a split at position k.',
      'When the minimum tends to land near the middle the recursion is log n levels deep with O(n) scanning per level: O(n log n).',
      'When the histogram is sorted, the minimum is always at one end, so each call peels off a single bar: n + (n-1) + (n-2) + ... = O(n squared).',
      'O(n log n) average, O(n squared) worst case.',
    ],
    space: [
      'No allocation, but the recursion depth equals the number of splits.',
      'Balanced splits give O(log n) frames; a sorted histogram gives n nested calls, so O(n) worst case.',
    ],
    gotcha:
      'Never give a bare O(n log n) here — the split point is chosen by the DATA, not by you, so unlike merge sort there is no guarantee of balance. A sorted input degrades it to quadratic. Adding a sparse table or segment tree for range-minimum queries removes the O(n) scan but not the unbalanced recursion.',
  },

  'baseball-game:optimal': {
    time: [
      'n is the number of operations.',
      'One pass over the operations: n iterations.',
      'Each operation is a push, a pop, or a push computed from the top one or two entries — all O(1), because peeking at stack[-1] and stack[-2] does not scan.',
      'The final sum over at most n entries adds another O(n), and sequential work adds.',
      'O(n).',
    ],
    space: [
      'The stack holds one score per surviving record, at most n.',
      'O(n).',
    ],
    gotcha:
      'The "+" case reads the top TWO entries, and this is exactly why an array plus an index works just as well: you only ever need constant-depth access. What you cannot do is O(1) removal from the middle, and nothing here asks for that.',
  },
  'baseball-game:write-index-array': {
    time: [
      'n is the number of operations, and the record array is preallocated to length n so it can never need to grow.',
      'One pass of n iterations, each doing constant work: a comparison, one or two array reads, one array write and an index bump.',
      'Then a sum over the first i entries, O(n).',
      'O(n) — same class as the stack, with a lower constant because there is no dynamic resizing.',
    ],
    space: [
      'One fixed array of length n, allocated up front even if "C" operations shrink the live region.',
      'O(n).',
    ],
    gotcha:
      'The write index i IS the stack pointer — "C" just decrements it, leaving the stale value in place to be overwritten later. Recognising that a stack is an array plus an integer is the transferable idea; the complexity is unchanged.',
  },

  'implement-stack-using-queues:optimal': {
    time: [
      'n is the number of elements currently held.',
      'push appends the new element then rotates the queue n-1 times, moving every older element behind it: O(n) per push.',
      'That rotation leaves the newest element at the FRONT, so pop, top and empty are single queue reads: O(1) each.',
      'O(n) push, O(1) pop/top/empty.',
    ],
    space: [
      'One deque holding every pushed element.',
      'O(n).',
    ],
    gotcha:
      'This is genuinely O(n) per push, NOT amortised O(1) — every single push pays the full rotation, so there is no cheap-most-of-the-time argument to make. That is the opposite of Implement Queue Using Stacks, where the transfer really is amortised. Do not carry the amortised story across.',
  },
  'implement-stack-using-queues:two-queues': {
    time: [
      'push enqueues the new element into the empty queue, then drains all n-1 existing elements behind it, then swaps the two queue references: O(n).',
      'The swap itself is two reference assignments, O(1) — nothing is copied.',
      'pop, top and empty read or remove the front of q1: O(1).',
      'O(n) push, O(1) pop/top/empty.',
    ],
    space: [
      'Two deques, but at most n elements exist in total across both at any moment.',
      'O(n).',
    ],
    gotcha:
      'People assume two queues must be faster than one. Both are O(n) push and the total element movement per push is identical — the single-queue rotation just reuses one buffer. The choice is stylistic.',
  },

  'implement-queue-using-stacks:optimal': {
    time: [
      'n is the number of elements currently held.',
      'push is one append to the input stack: O(1) worst case.',
      'peek refills the output stack ONLY when it is empty, moving every input element across once. A single peek can therefore cost O(n).',
      'But each element is moved from input to output exactly once in its lifetime, so the total transfer cost over m operations is at most m — that budget spread over the operations gives O(1) amortised per pop/peek.',
      'O(1) push, O(1) amortised pop and peek, O(n) for a single unlucky one.',
    ],
    space: [
      'Two stacks, with each element living in exactly one of them.',
      'O(n) total.',
    ],
    gotcha:
      'The distinction IS the question here. Say "O(1) amortised, O(n) worst case for one call" — a bare O(1) is wrong, and a bare O(n) misses the point. It matters in practice too: a real-time system that cannot tolerate one slow call needs the costly-push variant instead.',
  },
  'implement-queue-using-stacks:costly-push': {
    time: [
      'push moves all n existing elements to the helper stack, appends the new one, then moves all n back: 2n moves, so O(n) per push.',
      'That leaves the oldest element on TOP of s1, so pop, peek and empty are single-element reads: O(1) worst case, not amortised.',
      'O(n) push, O(1) pop/peek/empty.',
    ],
    space: [
      'Two stacks; s2 is empty between calls, so at most n elements are stored.',
      'O(n).',
    ],
    gotcha:
      'This is the deliberate mirror of the amortised version: it pays the full transfer on EVERY push to make every read genuinely worst-case O(1). Neither is uniformly better — pick by which operation you cannot afford to have spike.',
  },

  'asteroid-collision:optimal': {
    time: [
      'n is the number of asteroids.',
      'The outer loop runs n times, and the inner while pops surviving right-movers that lose a collision.',
      'Each asteroid is pushed at most once and popped at most once, so total pops across the whole run are bounded by n — the inner while spends a budget rather than rescanning.',
      'O(n) outer + at most n pops = O(n).',
    ],
    space: [
      'The stack holds the survivors, and if no collision ever happens (all right-moving, or all left-moving) that is every asteroid.',
      'O(n).',
    ],
    gotcha:
      'Note the two distinct exits: a pop destroys an asteroid permanently (progress against the budget), while alive = False breaks out without popping (constant work). Both terminate the inner loop, which is why no single outer iteration can spin — the amortised argument needs both.',
  },
  'asteroid-collision:in-place-write-index': {
    time: [
      'Identical counting to the stack version: n outer iterations, and the write index k only ever decreases by destroying an asteroid.',
      'Total decrements of k across the run are bounded by the number of asteroids ever written, which is at most n.',
      'O(n) amortised.',
    ],
    space: [
      'Only the write index k and a couple of scalars — the survivors are written back over the input array.',
      'O(1) auxiliary, though the returned asteroids[:k] slice is itself an O(n) copy; the O(1) claim excludes that output.',
    ],
    gotcha:
      'The O(1) here depends on being allowed to destroy the input, and on not counting the returned slice. If the caller still needs the original array, or you count the output, this is O(n) like the stack version — always say which convention you are using.',
  },

  'online-stock-span:optimal': {
    time: [
      'n is the number of next() calls made over the lifetime of the object.',
      'One call looks like O(n): the while can pop many stored days.',
      'But each price is pushed exactly once and popped at most once, so the total pops over all n calls are bounded by n.',
      'Crucially, a popped entry carries its own span, so absorbing it with span += popped span replaces the whole block it summarised — no re-examination of already-collapsed days.',
      'O(1) amortised per call, O(n) total for n calls.',
    ],
    space: [
      'The stack holds one (price, span) pair per day not yet absorbed, which for strictly decreasing prices is every day.',
      'O(n).',
    ],
    gotcha:
      'Because this is a streaming design problem, the amortised phrasing matters more than usual: state "O(1) amortised per call" rather than O(n), and be ready to say one individual call can pop O(n) entries. The span field is what makes the popping permanent instead of repeated work.',
  },
  'online-stock-span:span-jump-array': {
    time: [
      'n is the number of prices.',
      'The outer loop runs n times, and the inner while walks left — but never one step at a time: j -= span[j] leaps over an entire block already known to be no higher than prices[i].',
      'Each leap absorbs a whole previously computed span, so those days are never revisited; the jumps are paid out of work already done.',
      'O(n) amortised, the same budget argument as the monotonic stack.',
    ],
    space: [
      'The span array itself, one entry per price.',
      'O(n) — it doubles as the answer and as the implicit stack.',
    ],
    gotcha:
      'This is the monotonic stack with the stack ENCODED in the answer array: span[j] plays the role of "how far back does this entry reach", which is exactly what the (price, span) pairs stored. If you understand one, you understand both.',
  },

  'simplify-path:optimal': {
    time: [
      'n is the length of the path string.',
      'The split produces at most n/2 components and their total character count is bounded by n.',
      'One pass over the components: each is compared against "" , "." and ".." (constant-length comparisons) and then pushed or popped, O(1) per component plus the cost of touching its characters.',
      'The final join writes each surviving character once, O(n).',
      'O(n) overall — every character of the input is examined a constant number of times.',
    ],
    space: [
      'The split list holds all components (O(n) characters) and the stack holds the surviving ones (also O(n) worst case, when there is no ".." at all).',
      'O(n).',
    ],
    gotcha:
      'Do not count the component comparisons as O(1) blindly and then forget the characters. A path can be one enormous directory name, so "number of components" and "number of characters" are different sizes — the honest n here is the string length, which bounds both.',
  },
  'simplify-path:in-place-rewrite': {
    time: [
      'Same shape: one split, one pass over the components with constant work each, one join.',
      'The trick is that surviving components are written back into the front of the same parts list at index k, so nothing new is allocated per component.',
      'O(n) in the length of the path.',
    ],
    space: [
      'The split list is unavoidable and is O(n).',
      'Beyond it only the write index k, so O(1) EXTRA — the total is still O(n) because of the split.',
    ],
    gotcha:
      'The advertised win is "O(1) extra", and that phrasing is doing real work: the split already cost O(n), so the asymptotic total is identical to the stack version. This saves a second container, not an order of growth.',
  },

  'decode-string:optimal': {
    time: [
      'n is the length of the encoded string s, and the real driver is L, the length of the DECODED output.',
      'One pass over s: digits accumulate a number, brackets push or pop the two stacks, letters append to cur — all O(1) except the multiply.',
      'The line cur = popped + cur * count physically copies characters, and every character of the final answer is produced by exactly one such copy at each nesting level it sits under.',
      'So the work is proportional to the decoded length, times the nesting depth that re-copies it: O(n x maxRepeat) for a single level of nesting.',
    ],
    space: [
      'The two stacks hold one entry per open bracket, bounded by the nesting depth (at most n/2).',
      'The partial strings held across those frames sum to the decoded length, so O(n) in the stack structure and O(L) counting the strings being built.',
    ],
    gotcha:
      'The stated O(n x maxRepeat) assumes repeats do not nest. They do: "2[3[a]]" multiplies, so the true bound is the product of the k values along the deepest chain, i.e. the output length. Say "linear in the size of the decoded output" — that is always correct and cannot be beaten, because you have to write the answer.',
  },
  'decode-string:recursive-descent': {
    time: [
      'n is the length of s, and each character is consumed by exactly one parse frame — the index i is threaded through returns and never rewound.',
      'So the scanning itself is O(n) total, not O(n) per frame.',
      'The cost is in result += inner * num, which copies the inner string num times, once per enclosing bracket level.',
      'O(n x maxRepeat) for one nesting level, and in general linear in the decoded output length.',
    ],
    space: [
      'One call frame per open bracket, so depth d equals the maximum nesting depth.',
      'O(d) in frames — but each frame also holds its partial result string, so counting those the space is proportional to the decoded output.',
    ],
    gotcha:
      'The two stacks in the iterative version are literally the call stack made explicit: countStack is the num local, stringStack is the result local. Recognising that mapping is why "convert recursion to a stack" is a mechanical transformation, and why both have the same bounds.',
  },

  'max-frequency-stack:optimal': {
    time: [
      'n is the number of push calls made over the object lifetime.',
      'push: one dict read, one dict write, one max of two numbers, one append to the bucket for that frequency — all O(1).',
      'pop: index the bucket at maxFreq, pop its last element, decrement one counter, and possibly decrement maxFreq by exactly one. No scanning, no reordering.',
      'O(1) per operation, worst case.',
    ],
    space: [
      'freq has one entry per distinct value; group stores one copy of a value for each time it was pushed.',
      'Total stored entries equal the number of pushes, so O(n).',
    ],
    gotcha:
      'The subtle claim is that maxFreq only ever needs to drop by ONE when a bucket empties — true because pushes fill frequency buckets contiguously from 1 upward, so there is never a gap to skip. That invariant is what removes the log n; without it you would need a heap or a sorted structure.',
  },
  'max-frequency-stack:max-heap-priority': {
    time: [
      'n is the number of elements currently in the heap, which equals the number of pushes not yet popped.',
      'push does an O(1) dict update then a heappush, which sifts up through the heap height: O(log n).',
      'pop does a heappop, which sifts down the same height: O(log n).',
      'O(log n) per push and pop.',
    ],
    space: [
      'One heap entry per push, never removed until popped, plus one freq entry per distinct value.',
      'O(n).',
    ],
    gotcha:
      'This is the clean comparison the two tabs exist for: the heap is O(log n) per operation, the stack-of-stacks is O(1). The heap is doing more than asked — it maintains a total order over all elements, when all you ever need is the single current maximum frequency, which one integer tracks. Note also that the -order tiebreaker is what makes it a STACK rather than an arbitrary choice among equally frequent values.',
  },

  // ============================== LINKED LIST =====================================

  'reverse-linked-list:optimal': {
    time: [
      'n is the number of nodes.',
      'The while advances curr one node per iteration and stops at null, so exactly n iterations.',
      'Per iteration: three pointer assignments, O(1).',
      'O(n).',
    ],
    space: [
      'Three pointers — prev, curr and next_node — regardless of how long the list is.',
      'O(1). No new nodes are allocated; the existing next fields are rewritten in place.',
    ],
    gotcha:
      'This is the archetype for the whole category: reversing a list needs no extra memory at all, because a linked list IS its pointers. Building a new list or an array of values would be O(n) space for the same O(n) time — strictly worse, and the reason the iterative form is the one to know.',
  },
  'reverse-linked-list:recursive': {
    time: [
      'n is the number of nodes. Each call recurses on head.next, so the recursion bottoms out after n calls.',
      'Each call then does two pointer assignments on the way back up, O(1).',
      'n calls x O(1) = O(n) — identical time to the iterative version.',
    ],
    space: [
      'Nothing is allocated, but every pending call holds a stack frame and the recursion is n deep before it unwinds.',
      'O(n).',
    ],
    gotcha:
      'The mistake is calling this O(1) space because no data structure appears in the code. The call stack is space. A linked list of a million nodes will overflow the stack here while the iterative version uses three pointers — same algorithm, different space bound, and this is the cleanest example of that distinction in the whole set.',
  },

  'merge-two-sorted-lists:optimal': {
    time: [
      'n and m are the lengths of the two lists. Do not collapse them into one n — either can be much longer.',
      'Each iteration of the while advances exactly one of the two pointers, so the loop runs at most n + m times.',
      'The final tail.next = list1 or list2 attaches whatever remains in ONE pointer assignment, without walking it.',
      'O(n + m).',
    ],
    space: [
      'A single dummy node and a tail pointer. The result is built by relinking the existing nodes, not copying them.',
      'O(1).',
    ],
    gotcha:
      'That last line is where people lose the bound: attaching the leftover tail is O(1) because a linked list needs no copying — you just point at it. In the array version of this same merge you would have to copy the remainder, which is O(n).',
  },
  'merge-two-sorted-lists:recursive': {
    time: [
      'Each call consumes exactly one node — it fixes one node as the head of the merged remainder, then recurses on the rest.',
      'So there are at most n + m calls, each doing one comparison and one pointer assignment.',
      'O(n + m) — the same time as the iterative version.',
    ],
    space: [
      'One frame per node consumed, and the recursion does not unwind until a list runs out.',
      'Depth reaches n + m, so O(n + m).',
    ],
    gotcha:
      'The recursion is not tail-recursive as written (the assignment happens after the call returns), so Python cannot flatten it even in principle. Interleaved lists of 5000 nodes each will hit the default recursion limit. The iterative version is O(1) space for the identical logic.',
  },

  'reorder-list:optimal': {
    time: [
      'n is the number of nodes.',
      'Finding the middle with slow/fast: fast advances two per step, so n/2 iterations.',
      'Reversing the second half touches each of its n/2 nodes once. Merging alternates through both halves, another n/2 steps.',
      'Three sequential passes, each O(n), and sequential work adds: O(n).',
    ],
    space: [
      'Only a handful of pointers — slow, fast, prev, first, second and two temporaries.',
      'O(1), because every step rewires existing next fields in place.',
    ],
    gotcha:
      'Three passes is still O(n), not O(3n) or O(n squared) — sequential work adds and constants drop. The reason to do it in three awkward passes rather than one clean one is precisely the space: the array version below is a single elegant pass and costs O(n) memory.',
  },
  'reorder-list:array-of-nodes': {
    time: [
      'One pass collecting all n node references into an array: O(n).',
      'Then a two-pointer squeeze from both ends, rewiring as it goes; the pointers together cover each index once: O(n).',
      'O(n) — the same class as the in-place version, with simpler code.',
    ],
    space: [
      'An array holding one reference per node.',
      'O(n) — this is the entire cost of the readability.',
    ],
    gotcha:
      'The array stores node REFERENCES, not values, which is what lets it rewire the real list rather than rebuild it. It is still O(n) space, and the interviewer asking for "O(1) space" is asking you to replace random access into that array with the find-middle-plus-reverse trick.',
  },

  'remove-nth-from-end:optimal': {
    time: [
      'n is the length of the list (the parameter n in the problem is the offset — name both or you will confuse yourself).',
      'The first loop advances fast by the offset: at most n steps.',
      'The second loop advances both pointers until fast falls off the end: at most n more steps.',
      'Two sequential partial walks, so O(n) — one pass over the list in the sense that no node is visited twice by the same pointer.',
    ],
    space: [
      'A dummy node and two pointers.',
      'O(1).',
    ],
    gotcha:
      'Calling this "one pass" and the alternative "two pass" suggests a factor-of-two win, but both are O(n) and the total pointer movement here is about the same. The real win is that it works on a stream you can only read once. The dummy node exists to handle deleting the head without a special case, not for complexity.',
  },
  'remove-nth-from-end:two-pass-length': {
    time: [
      'First walk counts all n nodes: O(n).',
      'Second walk stops at position length - n - 1, so at most n more steps.',
      'Sequential passes add: O(n) + O(n) = O(n), the identical bound to the two-pointer version.',
    ],
    space: [
      'One counter and one traversal pointer.',
      'O(1) — the same as the one-pass version, which is why this trade is about elegance, not memory.',
    ],
    gotcha:
      'This is the case where the "optimised" alternative does NOT improve either bound. Both are O(n) time and O(1) space. Saying "the two-pointer version is faster" is wrong; say "it needs only a single traversal, which matters for a forward-only stream".',
  },

  'copy-list-random-pointer:optimal': {
    time: [
      'n is the number of nodes.',
      'Pass 1 walks the list creating one new node per original: n iterations, each an O(1) dict insert.',
      'Pass 2 walks again setting next and random by looking each original up in the map: n iterations, O(1) average per lookup.',
      'Two sequential passes: O(n) + O(n) = O(n).',
    ],
    space: [
      'The map holds one old-to-new entry per node.',
      'O(n) — and that is on top of the O(n) output list, which is required by the problem and so not counted as auxiliary.',
    ],
    gotcha:
      'The map is what makes this a single-look problem: without it, resolving one random pointer means finding where that node sits, an O(n) search, and doing it n times is O(n squared). The map converts that search into an O(1) lookup. The two passes are necessary because a random pointer may target a node not yet created.',
  },
  'copy-list-random-pointer:interleaved-nodes': {
    time: [
      'Three sequential passes over the list, each visiting all n nodes once: interleave, assign randoms, detach.',
      'Every step inside each pass is a constant number of pointer reads and writes.',
      'O(n) + O(n) + O(n) = O(n), the same class as the hash-map version.',
    ],
    space: [
      'No map and no auxiliary array — the correspondence between original and copy is encoded by ADJACENCY: the copy of a node is always the node right after it.',
      'O(1) auxiliary, not counting the copied list that must be returned.',
    ],
    gotcha:
      'This is the sharpest O(n)-to-O(1) space win in the category, and it works by storing the mapping in the list structure itself instead of in a dictionary. The price is that it temporarily mutates the input, so it is unusable if the original must stay untouched during the copy.',
  },

  'add-two-numbers:optimal': {
    time: [
      'm and n are the digit counts of the two numbers.',
      'The while runs while either list has digits left or a carry survives, so it runs max(m, n) times, plus at most one extra iteration for a final carry.',
      'Per iteration: two reads, an addition, a divmod and one node allocation — all O(1).',
      'O(max(m, n)).',
    ],
    space: [
      'One new node per output digit, and the answer has max(m, n) or max(m, n) + 1 digits.',
      'O(max(m, n)) — but that IS the output. Auxiliary space is O(1): a dummy, a cursor and the carry.',
    ],
    gotcha:
      'The stated O(max(m,n)) space counts the result list. Say which convention you mean — the algorithm allocates nothing beyond the answer it is required to return, so "O(1) auxiliary" is the honest description of the work it does. Also note the lists are stored least-significant-digit-first, which is why no reversal is needed.',
  },
  'add-two-numbers:recursive': {
    time: [
      'One call per output digit, and the base case fires only when both lists are exhausted AND the carry is zero.',
      'That gives max(m, n) calls, or one more if the final carry produces a new digit, each doing O(1) arithmetic.',
      'O(max(m, n)) — identical to the loop.',
    ],
    space: [
      'The output list is max(m, n) nodes, and on top of that the recursion holds one frame per digit before any of them return.',
      'O(max(m, n)) for the call stack alone, which the iterative version avoids entirely.',
    ],
    gotcha:
      'Here the recursion is genuinely a cost, not just an equal-cost stylistic choice: the iterative version is O(1) auxiliary and this is O(max(m,n)) auxiliary for the same output. Numbers with 10000 digits will hit the recursion limit.',
  },

  'linked-list-cycle:optimal': {
    time: [
      'n is the number of nodes reachable from head.',
      'If there is no cycle, fast falls off the end after n/2 iterations.',
      'If there is a cycle, once slow enters it the gap between the two pointers closes by exactly one per iteration, so they meet within one lap of the cycle — bounded by n iterations total.',
      'O(n).',
    ],
    space: [
      'Two pointers into the existing list.',
      'O(1) — nothing is recorded about which nodes have been seen.',
    ],
    gotcha:
      'The reason it must terminate is the closing gap: fast gains one position on slow per step, so it cannot jump over slow inside the cycle. That argument is what an interviewer is checking; "they eventually meet" without it is hand-waving.',
  },
  'linked-list-cycle:hash-set': {
    time: [
      'One walk visiting each node at most once before either finding a repeat or reaching the end: n iterations.',
      'Each step is a set membership test and an insert, O(1) on average.',
      'O(n) — the same time as Floyd, average case.',
    ],
    space: [
      'The set stores one reference per visited node, and on an acyclic list it ends up holding all of them.',
      'O(n).',
    ],
    gotcha:
      'This works and is easier to explain, and it is exactly what O(1) space buys you nothing of in TIME — both are O(n). The whole reason to learn Floyd is the space column. Note the set stores node identities, not values; a list with duplicate values is not a cycle.',
  },

  'find-duplicate-number:optimal': {
    time: [
      'n is the length of nums, whose values all lie in 1..n-1, so i -> nums[i] is a well-defined function on indices.',
      'Because some value repeats, that functional graph contains a cycle, and index 0 is never a target (values start at 1), so the walk from nums[0] enters the cycle from outside it.',
      'Phase 1 runs Floyd until slow and fast meet: bounded by O(n) steps.',
      'Phase 2 walks two pointers one step at a time to the cycle entrance: another O(n).',
      'O(n).',
    ],
    space: [
      'Four integers used as indices into the existing array. Nothing is allocated and nums is never modified.',
      'O(1).',
    ],
    gotcha:
      'The O(1) space IS the entire reason to prefer this — LeetCode explicitly forbids modifying the array and asks for constant space, which rules out the hash set, the sort, and the negate-in-place trick. Also: the answer is the CYCLE ENTRANCE, not the meeting point, so phase 2 is not optional.',
  },
  'find-duplicate-number:hash-set': {
    time: [
      'One pass over nums, stopping at the first value already seen: at most n iterations.',
      'Each step is a set lookup and an insert, O(1) average.',
      'O(n) average — identical time to Floyd.',
    ],
    space: [
      'The set can hold nearly every distinct value before the duplicate appears.',
      'O(n).',
    ],
    gotcha:
      'Time-identical to Floyd, so if you are asked for this problem you are being asked about SPACE. Offering only this answer means missing the point of the question. It remains the right answer when the constraint is absent, because it is obviously correct.',
  },

  'lru-cache:array-scan': {
    time: [
      'n is the number of entries held, bounded by capacity.',
      'get scans the list to find the key: O(n). The list.pop(i) that follows shifts every later element: another O(n).',
      'put also scans for the key, and on eviction items.pop(0) shifts the entire list: O(n).',
      'O(n) per operation.',
    ],
    space: [
      'One (key, value) pair per cached entry.',
      'O(capacity), usually written O(n) — the same space as the optimal version.',
    ],
    gotcha:
      'Same space, worse time — so this exists purely to show what the hash map plus doubly linked list is FOR. Two separate O(n) costs hide here: finding the key (fixed by the map) and shifting elements on removal (fixed by the linked list, where unlinking is O(1)). You need both structures because each fixes only one of them.',
  },

  'merge-k-sorted-lists:optimal': {
    time: [
      'k is the number of lists and n is the TOTAL number of nodes across all of them. Name both — the bound mixes them.',
      'Each round pairs the lists up and merges each pair, halving the list count: ceil(log base 2 of k) rounds.',
      'Within one round every node is touched at most once by exactly one merge, so a round costs O(n) regardless of how the nodes are distributed.',
      'O(n) per round x log k rounds = O(n log k).',
    ],
    space: [
      'Each merge is the O(1) in-place two-list merge; the only allocation is the merged array of list heads, which starts at k and halves each round.',
      'O(k) — and O(1) auxiliary per merge, since nodes are relinked rather than copied.',
    ],
    gotcha:
      'The log k, not log n, is the whole point: doubling the number of NODES doubles the work linearly, while doubling the number of LISTS adds one round. Naively merging one list at a time is O(n k) because the accumulated list gets rewalked every round — that is the mistake this replaces.',
  },
  'merge-k-sorted-lists:min-heap': {
    time: [
      'k lists, n total nodes.',
      'The heap holds at most k entries — one candidate head per list — so every heappush and heappop costs O(log k), not O(log n).',
      'Every one of the n nodes is pushed once and popped once over the whole run: 2n heap operations.',
      'O(n log k) — the same bound as divide and conquer.',
    ],
    space: [
      'The heap never exceeds one entry per list.',
      'O(k). The output reuses the existing nodes, so nothing else is allocated.',
    ],
    gotcha:
      'Same asymptotic bound as divide and conquer, different constants and different shape: the heap does 2n operations of log k each with real comparison overhead, while the pairwise merge does log k clean linear scans and is usually faster in practice. The heap wins when the input is a STREAM — it does not need all k lists up front. Note the index i in the tuple is a tiebreaker so Python never has to compare two ListNode objects.',
  },

  'reverse-nodes-k-group:optimal': {
    time: [
      'n is the number of nodes, k the group size.',
      'getKth walks k nodes to check a full group exists, then the reversal walks the same k nodes rewiring them: about 2k steps per group.',
      'There are n/k groups, so total work is (n/k) x 2k = 2n.',
      'O(n) — the k cancels, which is why the bound does not depend on the group size.',
    ],
    space: [
      'A dummy node and four pointers (groupPrev, groupNext, prev, curr), reused for every group.',
      'O(1).',
    ],
    gotcha:
      'People answer O(n x k) by multiplying the per-group cost by the node count. The groups PARTITION the list — each node belongs to exactly one — so you multiply k by n/k groups, not by n. Any per-group-then-partition problem has this cancellation.',
  },
  'reverse-nodes-k-group:stack-per-group': {
    time: [
      'Same partition argument: each group pushes k nodes onto a stack and pops k off, so 2k operations per group.',
      'n/k groups x O(k) = O(n).',
      'O(n) — identical time to the in-place version.',
    ],
    space: [
      'A fresh stack per group, holding at most k node references.',
      'O(k) — constant in n, but not O(1), and for k = n it degenerates to O(n).',
    ],
    gotcha:
      'O(k) space is often waved through as "basically constant". It is not: with k = n this is a full O(n) copy, and LeetCode allows k up to the list length. The in-place version is O(1) for every k, which is what makes it the answer to the follow-up question.',
  },

  'reverse-linked-list-ii:optimal': {
    time: [
      'n is the list length; left and right are 1-based positions.',
      'The first loop walks left - 1 nodes to reach the node before the segment.',
      'The second loop runs right - left times, each iteration splicing one node to the front of the segment with three pointer writes.',
      'Both are bounded by n and run sequentially: O(n), and O(right) more precisely.',
    ],
    space: [
      'A dummy node and three pointers, whatever the segment length.',
      'O(1).',
    ],
    gotcha:
      'Head insertion reverses the segment WITHOUT a second pass to reattach it — each node is moved directly into its final place, so prev.next stays correct throughout. The classic three-pointer reversal would need extra bookkeeping afterwards to stitch the segment back in.',
  },
  'reverse-linked-list-ii:collect-values-rewrite': {
    time: [
      'One pass collecting all n values: O(n).',
      'Reversing the slice values[left-1:right] copies and reverses that subrange: O(right - left), bounded by O(n).',
      'One more pass writing the values back into the nodes: O(n).',
      'Three sequential O(n) steps add up to O(n).',
    ],
    space: [
      'An array of all n values, plus the temporary reversed slice.',
      'O(n).',
    ],
    gotcha:
      'This mutates node VALUES instead of pointers, which is a real behavioural difference, not just a cost one: any external reference to a node now sees a different value. If node identity matters (as it does in Reorder List, where the nodes are relinked), value rewriting is not a legal substitute.',
  },

  'design-circular-queue:optimal': {
    time: [
      'k is the fixed capacity, but no operation ever depends on how full the queue is.',
      'enQueue computes one modulo, writes one array slot and bumps a counter; deQueue advances head by one modulo and decrements the counter.',
      'Front, Rear, isEmpty and isFull are single reads and comparisons.',
      'O(1) per operation, worst case.',
    ],
    space: [
      'One array of exactly k slots, allocated up front, plus three integers.',
      'O(k) — and it never grows or reallocates, which is the point of a fixed-capacity queue.',
    ],
    gotcha:
      'Storing head plus size rather than head plus tail is what removes the classic full-versus-empty ambiguity: with two indices, head == tail means either state, so implementations waste a slot or add a flag. The modulo is what makes the array circular; without it deQueue would shift n elements and be O(k).',
  },
  'design-circular-queue:linked-nodes-counter': {
    time: [
      'enQueue appends via the stored tail pointer, deQueue advances head — both a fixed number of pointer writes.',
      'The explicit size counter makes isFull and isEmpty O(1); without it you would have to walk the list to count, which is O(k).',
      'O(1) per operation.',
    ],
    space: [
      'One node per stored element, so at most k nodes, each carrying a value and a next pointer.',
      'O(k) — same class as the array, with a larger constant factor for the pointers and per-node allocation overhead.',
    ],
    gotcha:
      'Same complexity, materially different real-world cost: the array is one contiguous block touched with arithmetic, this allocates and frees a node per operation and scatters them in memory. When two designs tie on big-O, constants and locality decide, and this is a clean example of that.',
  },

  'lfu-cache:optimal': {
    time: [
      'n is the number of entries held, bounded by capacity.',
      'get and put do a constant number of dict operations plus one OrderedDict insert or delete, all O(1).',
      'Eviction picks buckets[min_count].popitem(last=False), the least recently used key at the lowest frequency, in O(1) — no search.',
      'min_count only ever increases by one (when the bucket it names empties during a touch) or resets to 1 on insertion, so maintaining it is O(1) with no scanning.',
      'O(1) per operation, worst case.',
    ],
    space: [
      'Three structures each holding at most one entry per cached key: cache, counts, and the buckets across all frequencies.',
      'O(capacity), written O(n).',
    ],
    gotcha:
      'The bucket structure exists to answer "which key has the lowest frequency, and among those which is oldest" in O(1). It needs TWO orderings at once — by frequency (the bucket keys) and by recency within a frequency (the OrderedDict) — which is why one dictionary or one heap is not enough. The min_count-increases-by-one invariant is the load-bearing claim.',
  },
  'lfu-cache:linear-scan-eviction': {
    time: [
      'get and put on an existing key are pure dict work: O(1).',
      'Eviction calls min over the whole cache with a (frequency, timestamp) key, which examines every entry: O(n) where n is the capacity.',
      'O(1) get and put, O(n) on the eviction path.',
    ],
    space: [
      'One [value, frequency, timestamp] record per cached key, plus a global clock.',
      'O(capacity), written O(n) — the same space as the bucketed version.',
    ],
    gotcha:
      'A full cache evicts on nearly every insertion, so calling this "O(1) with an O(n) edge case" understates it — in steady state the O(n) path is the common path. Same space as the optimal version, so once again the extra structure buys time, not memory. The timestamp is doing the LRU tiebreak that the OrderedDict does for free in the bucketed design.',
  },

  'palindrome-linked-list:optimal': {
    time: [
      'n is the number of nodes.',
      'slow/fast finds the midpoint in n/2 iterations, since fast moves two nodes per step.',
      'Reversing from slow onward touches the second half once: n/2 steps. Comparing the two halves walks n/2 pairs.',
      'Three sequential passes, each O(n): O(n).',
    ],
    space: [
      'Five pointers and no allocation — the second half is reversed in place by rewriting next fields.',
      'O(1).',
    ],
    gotcha:
      'This leaves the list MUTATED, with the second half pointing backwards. A conscientious answer mentions restoring it (one more O(n) reversal) — interviewers do ask. Also note the loop condition compares while right, not while left and right, so an odd-length middle node is naturally ignored.',
  },
  'palindrome-linked-list:copy-to-array': {
    time: [
      'One pass copying all n values into an array: O(n).',
      'Then two pointers closing from both ends, together covering each index once: O(n).',
      'O(n) — identical time to the in-place version.',
    ],
    space: [
      'An array of all n values.',
      'O(n).',
    ],
    gotcha:
      'The array exists solely to buy backward movement — a singly linked list cannot be read from the end, and that is the only reason this problem is not trivial. It also leaves the list untouched, which the in-place version does not. Same time, O(n) versus O(1) space, plus a mutation side effect: that three-way trade is the actual content of this problem.',
  },
};
