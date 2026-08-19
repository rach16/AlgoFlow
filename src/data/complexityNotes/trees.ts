import type { ComplexityNote } from '../complexity';

/**
 * Trees. The time answer is almost always O(n) — every node once. The lesson in this
 * category is SPACE: recursion costs O(h) and h is only log n when the tree is balanced,
 * an explicit stack costs the same O(h) rather than O(1), BFS costs O(w) for the widest
 * level, and exactly one traversal here (Morris) is genuinely O(1).
 */
export const treesNotes: Record<string, ComplexityNote> = {
  // ---- BFS costs O(w), DFS costs O(h) — opposite shapes are the bad case ----------
  'invert-binary-tree:iterative-bfs': {
    time: [
      'n is the number of nodes in the tree.',
      'Each node is enqueued once and dequeued once. The work per node is one pointer swap and two null checks, O(1).',
      'O(n).',
    ],
    space: [
      'The queue holds one level at a time, so its size is bounded by w, the maximum width of the tree.',
      'For a full tree the bottom level alone holds about n/2 nodes, so w is O(n).',
      'O(n) worst case — but O(1) for a list-shaped tree, where every level has exactly one node.',
    ],
    gotcha:
      'BFS space is O(w), DFS space is O(h), and they are opposites. The balanced tree that makes recursion cheap (h = log n) is precisely the tree that makes the queue expensive (w = n/2), and the degenerate list that blows up recursion is the one BFS handles in O(1).',
  },
  'invert-binary-tree:optimal': {
    time: [
      'n is the number of nodes. The recursion reaches every node exactly once.',
      'Per node: one swap and two recursive calls, no loop.',
      'Branches x depth is the wrong count here — the call tree IS the input tree, so it is O(n).',
    ],
    space: [
      'Nothing is allocated; the only cost is the call stack, which holds one frame per node on the current root-to-node path.',
      'That is O(h) for height h.',
      'h = log n only if the tree is balanced. A tree that is one long chain gives h = n, so O(n).',
    ],
    gotcha:
      'The swap must happen before or after both recursive calls consistently — swapping between them inverts twice. Complexity-wise, note that this mutates in place and returns the same root, so there is no O(n) output allocation to argue about.',
  },

  // ---- level counting: same O(n) time, queue instead of stack ---------------------
  'max-depth-binary-tree:bfs-level-counting': {
    time: [
      'n is the number of nodes.',
      'The outer while runs once per level, and the inner for consumes exactly the nodes queued for that level.',
      'Summed over all levels the inner loop runs n times in total — the levels partition the nodes, they do not multiply.',
      'O(n).',
    ],
    space: [
      'The queue holds at most one full level, so O(w) for the maximum width w.',
      'The bottom level of a full tree is about n/2 nodes, so O(n) in the worst case.',
    ],
    gotcha:
      'The nested loop looks quadratic and is not: range(len(queue)) is snapshotted before the level is processed, so each node is counted in exactly one iteration of exactly one level. Also note this version has no recursion at all, which is the actual reason to prefer it — it cannot blow the call stack on a 100,000-node chain.',
  },

  // ---- recomputing a subroutine per node: the O(n x h) shape ----------------------
  'diameter-binary-tree:brute-force-heights': {
    time: [
      'n is the number of nodes, h the height.',
      'diameterOfBinaryTree visits every node once, and at each node it calls height() on both children.',
      'height() is itself a full traversal of that subtree, so the cost at a node is proportional to the size of its subtree.',
      'Summing subtree sizes over all nodes gives O(n x h): each node is counted once for every ancestor it has.',
      'For a chain h = n, so O(n squared). For a balanced tree h = log n, so O(n log n).',
    ],
    space: [
      'Two recursions nest: the outer diameter recursion is O(h) deep, and the height() call inside it is another O(h).',
      'They do not overlap in a way that multiplies — O(h) + O(h) = O(h).',
    ],
    gotcha:
      'The stated O(n squared) is the worst case, and the honest general bound is O(n x h). The waste is precise: height() at the root recomputes every height that height() at its children already computed. The fix is not a faster height function, it is returning the height on the way back up so it is computed once.',
  },
  'diameter-binary-tree:optimal': {
    time: [
      'n is the number of nodes. dfs is called once per node.',
      'Per call: two recursive calls plus a constant amount of max and addition work, O(1).',
      'O(n) — one traversal, no recomputation.',
    ],
    space: ['The call stack, one frame per level on the current path: O(h).', 'Balanced gives O(log n), a one-sided chain gives O(n).'],
    gotcha:
      'This is the return-one-thing-track-another pattern and it does not change the bound. dfs RETURNS the height of the subtree while UPDATING a diameter captured outside it. Two quantities, still one visit per node, still O(n) — carrying a second value costs nothing asymptotically.',
  },

  // ---- the same O(n x h) trap, on a boolean ---------------------------------------
  'balanced-binary-tree:top-down-recursion': {
    time: [
      'n is the number of nodes, h the height.',
      'isBalanced touches each node once, and at each node calls height() on both children — a full traversal of that subtree.',
      'So the cost at a node is proportional to its subtree size, and the total is the sum of all subtree sizes: O(n x h).',
      'O(n squared) for a chain-shaped tree, O(n log n) for a balanced one.',
    ],
    space: [
      'The isBalanced recursion is O(h) deep, and the height() call it makes is another O(h) on top of the current frame.',
      'O(h) overall, since the two depths add rather than multiply.',
    ],
    gotcha:
      'Height is recomputed once per ancestor, which is where the extra factor of h comes from — not from anything quadratic in the code you can point at. This is the clearest example in the category of a bound you can only find by asking what the helper costs, not by counting visible loops.',
  },
  'balanced-binary-tree:optimal': {
    time: [
      'n is the number of nodes.',
      'dfs visits each node once and returns its height, so no height is ever computed twice.',
      'The -1 sentinel short-circuits as soon as an imbalance is found, which only helps — the worst case is still a full traversal.',
      'O(n).',
    ],
    space: ['One stack frame per level on the current path: O(h).', 'O(log n) if balanced, O(n) if the tree is a chain — and this is the input on which a recursive solution actually overflows.'],
    gotcha:
      'Overloading the return value (a real height, or -1 meaning "already unbalanced") is what removes the repeated work. Same traversal, same O(h) space, but O(n) instead of O(n x h) — the improvement comes entirely from what the function returns.',
  },

  // ---- an explicit stack is O(h), not O(1) ---------------------------------------
  'same-tree:iterative-stack-of-pairs': {
    time: [
      'n is the number of nodes in the SMALLER tree — any structural mismatch returns False immediately, so we never explore past it.',
      'Each pair is pushed once and popped once, and the work per pop is two null checks and one value comparison, O(1).',
      'O(n).',
    ],
    space: [
      'Walking down the left spine, each pop removes one pair and pushes two, a net gain of one per level.',
      'So the stack holds O(h) pairs, not O(n) — it mirrors exactly what the call stack would have held.',
      'O(h), which is O(n) for a chain-shaped tree — the worst case the stated bound refers to.',
    ],
    gotcha:
      'Going iterative does not make this O(1) space. The explicit stack replaces the call stack frame for frame; you have moved the memory from the runtime to the heap. The only thing you gained is that the heap will not StackOverflow at depth 10,000.',
  },
  'same-tree:optimal': {
    time: [
      'n is the number of nodes in the smaller tree, since the first structural difference returns False.',
      'Each recursive call compares one pair of nodes in O(1) and fans out to the two child pairs.',
      'Two identical trees mean visiting all n pairs: O(n).',
    ],
    space: ['One frame per level of the shared path: O(h).', 'h = log n only when the trees are balanced; two identical chains give h = n and O(n).'],
    gotcha:
      'The Python and short-circuits, so a mismatch high in the tree returns without exploring below it. That makes the BEST case very fast but does not change the worst case, and Big-O describes the worst case unless you say otherwise.',
  },

  // ---- two trees, two sizes: never collapse them into one n -----------------------
  'subtree-of-another-tree:serialize-string-matching': {
    time: [
      'm is the number of nodes in root, n the number in subRoot. Two inputs, two sizes.',
      'Serialising each tree visits every node once, producing strings of length O(m) and O(n).',
      'The substring search then runs in O(m + n) with a linear-time matcher (Python str.__contains__ uses a two-way algorithm; KMP if you write it yourself).',
      'O(m + n).',
    ],
    space: [
      'The two serialised strings, O(m) and O(n) characters.',
      'Plus the serialisation recursion, O(h) — dominated by the strings.',
      'O(m + n).',
    ],
    gotcha:
      'Two hidden costs. First, this serialize builds its result by string concatenation, and each concatenation copies — as written that is O(m x h), not O(m). Append to a list and join once to get the real O(m). Second, the stated O(m + n) assumes a linear-time substring search; a naive character-by-character matcher is O(m x n), which would throw away the entire advantage over the brute force.',
  },
  'subtree-of-another-tree:optimal': {
    time: [
      'm is the number of nodes in root, n the number in subRoot.',
      'isSubtree tries every one of the m nodes as a candidate starting point.',
      'At each candidate, isSameTree compares node by node until it disagrees — up to O(n) work.',
      'The two are nested, so they multiply: O(m x n).',
    ],
    space: [
      'Two recursions nest: the isSubtree descent is O(h of root) deep, and the isSameTree it launches is O(h of subRoot) on top.',
      'O(h) overall, adding the two heights rather than multiplying them.',
    ],
    gotcha:
      'It is tempting to say the comparisons are cheap because most fail on the first node. On average yes, but a tree of 5000 identical values makes every comparison run to full depth, and that adversarial input is what the O(m x n) bound describes.',
  },

  // ---- BST descent: h, not n -----------------------------------------------------
  'lowest-common-ancestor-bst:recursive-descent': {
    time: [
      'h is the height of the BST. n does not appear in this bound, which is the whole point.',
      'At each node one comparison decides to go left, go right, or stop — we never explore both children.',
      'So we touch at most one node per level, h levels: O(h).',
      'O(log n) for a balanced BST, O(n) for a BST that degenerated into a sorted chain.',
    ],
    space: [
      'No allocation, but each descent step leaves a pending stack frame.',
      'O(h) — and unlike a full traversal this is the ONLY cost, so it is pure waste.',
    ],
    gotcha:
      'People answer O(n) because it is a tree problem. It is O(h): the BST ordering lets you discard an entire subtree at every step, exactly like binary search. Say O(h), then add "which is log n if balanced" rather than assuming balance.',
  },
  'lowest-common-ancestor-bst:optimal': {
    time: [
      'h is the height of the tree.',
      'The while loop takes one step down per iteration, deciding by comparing p and q against the current value.',
      'At most h steps: O(h), i.e. O(log n) balanced and O(n) for a fully skewed BST.',
    ],
    space: [
      'One pointer, reassigned in place. No stack, no queue, no allocation.',
      'O(1) — genuinely constant, not O(1) amortised or O(1)-because-bounded.',
    ],
    gotcha:
      'This is the payoff of tail recursion: the recursive version does nothing after the recursive call returns, so the frame holds no information worth keeping. Rewriting it as a loop drops O(h) space to O(1). That transformation only works when the recursive call is the last thing that happens.',
  },

  // ---- same traversal, different container, different space ----------------------
  'level-order-traversal:dfs-by-depth': {
    time: [
      'n is the number of nodes.',
      'Each node is visited once. The work per node is a length check and one amortised O(1) list append.',
      'The depth == len(result) test is what creates each level list exactly once, and it costs O(1).',
      'O(n).',
    ],
    space: [
      'The call stack is O(h) — one frame per level of the current path.',
      'O(h) auxiliary, not counting the output, which necessarily holds all n values.',
    ],
    gotcha:
      'A DFS produces level-order output here, which surprises people. Indexing by depth is what does it: the order you VISIT in and the order you STORE in are independent. And the space is O(h), which beats the O(w) queue on a wide tree — a real reason to pick DFS for this.',
  },
  'level-order-traversal:optimal': {
    time: [
      'n is the number of nodes.',
      'The outer while runs once per level; the inner for runs exactly len(queue) times, the count of nodes on that level.',
      'Levels partition the nodes, so the inner body executes n times in total, not levels x n.',
      'O(n).',
    ],
    space: [
      'The queue holds at most one level plus the next being built, so O(w) for the maximum width w.',
      'A full tree has about n/2 nodes on its last level, so O(n) worst case.',
    ],
    gotcha:
      'Snapshotting len(queue) before the inner loop is the entire trick — it freezes the level boundary before children are appended. Drop it and you get a flat traversal instead of grouped levels. Note also that a deque is required: popping from the front of a plain list is O(n) and would make the whole thing O(n squared).',
  },

  'right-side-view:dfs-right-first': {
    time: [
      'n is the number of nodes.',
      'Every node is visited once — we cannot skip the left subtree, because it may be deeper than the right one and own the rightmost node of a lower level.',
      'Per node: one comparison of depth against len(result), O(1).',
      'O(n).',
    ],
    space: [
      'Only the recursion stack: O(h).',
      'Output is O(h) too — one value per level — which is unusual: here the ANSWER is small even though the input is large.',
    ],
    gotcha:
      'Visiting right before left is not an optimisation, it is what makes the first node seen at each depth the correct one. It also does not let you prune: a left subtree extending below the right one still contributes, so this stays O(n) rather than O(h).',
  },
  'right-side-view:optimal': {
    time: [
      'n is the number of nodes; the level-by-level loop consumes each exactly once.',
      'Per node: a dequeue, one assignment to rightmost, and up to two enqueues — O(1).',
      'O(n).',
    ],
    space: [
      'The queue holds one level, so O(w), which is O(n) for the bottom level of a full tree.',
      'The result itself is only O(h), one entry per level.',
    ],
    gotcha:
      'The output is O(h) but the working memory is O(w) — a tiny answer computed with a large queue. That gap is exactly why the DFS alternative (O(h) space) is worth knowing: same O(n) time, and it never materialises a whole level.',
  },

  'count-good-nodes:iterative-bfs': {
    time: [
      'n is the number of nodes.',
      'Each node is enqueued and dequeued once, carrying the maximum seen on its path with it.',
      'Per node: one comparison and one max — O(1). No node ever rescans its ancestors.',
      'O(n).',
    ],
    space: [
      'The queue holds (node, pathMax) pairs for at most one level: O(w).',
      'O(n) worst case, since the widest level of a full tree is about n/2.',
    ],
    gotcha:
      'The naive reading of this problem is "for each node, walk up to the root and compare" — that is O(n x h). Pushing the running maximum into the queue alongside the node makes it O(n). Whether that maximum rides in a queue entry or in a recursion parameter is a space choice (O(w) vs O(h)), not a time one.',
  },
  'count-good-nodes:optimal': {
    time: [
      'n is the number of nodes.',
      'dfs is called once per node; the path maximum arrives as a parameter, so there is no upward walk.',
      'One comparison and one max per node: O(n).',
    ],
    space: [
      'Only the call stack: O(h) frames, each holding a node reference and one integer.',
      'O(log n) if the tree is balanced, O(n) if it is a chain. The parameter adds a constant per frame, not a new term.',
    ],
    gotcha:
      'Passing state DOWN as a parameter costs nothing extra — it rides in a frame that already exists. Contrast with the bottom-up problems in this category, which return state UP. Choosing the direction is usually the whole insight for a tree problem.',
  },

  'validate-bst:inorder-traversal': {
    time: [
      'n is the number of nodes.',
      'A standard inorder traversal reaches each node once, and the check per node is one comparison against the previously visited value.',
      'Early exit on a violation only helps; the worst case (a valid BST) is the full traversal.',
      'O(n).',
    ],
    space: [
      'The recursion stack, O(h). No list of values is materialised — a single prev scalar carries the only state needed.',
      'O(h): O(log n) balanced, O(n) for a chain.',
    ],
    gotcha:
      'The version that collects every value into a list and then checks it is sorted is also O(n) time but O(n) space. Keeping just prev is the same algorithm at O(h) space. Also: the comparison must be strict (<=) or duplicate values slip through.',
  },
  'validate-bst:optimal': {
    time: [
      'n is the number of nodes.',
      'Each node is visited once, and validating it is two comparisons against the (lower, upper) window inherited from its ancestors.',
      'The window is computed in O(1) at each step rather than re-derived from the subtree, so there is no hidden factor.',
      'O(n).',
    ],
    space: [
      'The recursion stack holds O(h) frames, each carrying two bound values — a constant per frame.',
      'O(h), so O(log n) for a balanced tree and O(n) for a degenerate one.',
    ],
    gotcha:
      'The classic wrong solution compares each node only to its immediate children. That is O(n) too and simply incorrect — a node can beat its parent while violating its grandparent. Threading (lower, upper) down the recursion is what fixes it, at zero asymptotic cost.',
  },

  'kth-smallest-bst:recursive-inorder': {
    time: [
      'n is the number of nodes in the BST, k the rank requested.',
      'The traversal completes before the k-th element is read, so all n nodes are visited regardless of how small k is.',
      'O(n) — and note this is O(n) even for k = 1, which is the weakness of this version.',
    ],
    space: [
      'The values list holds all n keys: O(n).',
      'Plus the recursion stack, O(h), which is dominated by the list.',
      'O(n).',
    ],
    gotcha:
      'Both bounds are worse than necessary and for the same reason: the traversal is not allowed to stop. The iterative version is O(h + k) time and O(h) space precisely because it can return mid-traversal, which a recursion that appends to a list cannot do cleanly.',
  },
  'kth-smallest-bst:optimal': {
    time: [
      'n is the number of nodes, h the height, k the requested rank.',
      'The first inner while walks the left spine to the smallest node: up to h pushes.',
      'After that, each iteration pops one node and pushes only the left spine of its right child. Each node is pushed at most once and popped at most once, so the pushes are amortised.',
      'We stop at the k-th pop, so the total work is the initial descent plus k amortised steps: O(h + k).',
    ],
    space: [
      'The stack holds the path from the root to the current node: O(h).',
      'O(log n) for a balanced BST, O(n) for a skewed one — and this is a stack you allocated, so it is the same cost as the recursion it replaced.',
    ],
    gotcha:
      'Two things people get wrong. The bound is O(h + k), not O(k) — you must climb down to the smallest element before the first result exists. And this is not O(1) space just because there is no recursion: the explicit stack is exactly as big as the call stack would have been.',
  },

  // ---- slicing copies, and that is the whole difference --------------------------
  'construct-from-preorder-inorder:array-slicing': {
    time: [
      'n is the number of nodes, equal to the length of both arrays.',
      'One node is built per call, so there are n calls.',
      'Each call does inorder.index(rootVal), an O(n) linear scan, and then builds four slices — each of which COPIES, another O(n).',
      'O(n) work at each of n nodes: O(n squared) for a skewed tree. (For a balanced tree the slices halve each level, giving O(n log n).)',
    ],
    space: [
      'Every pending call holds its own copies of the sliced arrays.',
      'Down a skewed recursion the live slices are of size n, n-1, n-2, ..., which sums to O(n squared).',
      'O(n squared) worst case; O(n) for a balanced tree, where the path sizes n, n/2, n/4 form a geometric series.',
    ],
    gotcha:
      'The code looks linear — one node per call, nothing nested. The quadratic factor is entirely inside preorder[1:mid+1] and inorder[:mid], because slicing allocates and copies. Any time you recurse on a slice instead of on index bounds, expect an extra factor of n in both time and space.',
  },
  'construct-from-preorder-inorder:optimal': {
    time: [
      'n is the number of nodes.',
      'Building inorderMap is one pass: O(n).',
      'Then build() is called once per node and once per empty subtree, and each call does an O(1) map lookup and an O(1) index bump instead of a scan or a slice.',
      'O(n) + O(n) = O(n) — the two phases are sequential, so they add.',
    ],
    space: [
      'The hash map holds one entry per value: O(n).',
      'The recursion is O(h) on top of that, dominated by the map.',
      'O(n) auxiliary, not counting the tree being returned (which is itself O(n) nodes).',
    ],
    gotcha:
      'Two separate fixes are doing the work here, and people credit only one. The map removes the O(n) index() scan. Passing (left, right) index bounds removes the O(n) slice copy. Fix only the first and you are still O(n squared).',
  },

  'max-path-sum:iterative-postorder': {
    time: [
      'n is the number of nodes.',
      'Each node is pushed twice — once unvisited to schedule its children, once visited to combine their results — so there are at most 2n pops.',
      'Work per pop is a constant number of dict reads, max calls and additions, O(1) average.',
      'O(n).',
    ],
    space: [
      'The gain dict stores a value for every node processed, so it grows to O(n) — this is the real cost and it is genuinely linear.',
      'The stack itself is only O(h), since each level adds a constant number of entries.',
      'O(n), driven by the memo dict rather than the stack.',
    ],
    gotcha:
      'This is O(n) space where the recursive version is O(h), and the extra memory buys nothing but stack safety. The reason is that an explicit post-order loop has nowhere to keep a child result except an external map — the recursive version keeps it in a local variable inside the frame it already had.',
  },
  'max-path-sum:optimal': {
    time: [
      'n is the number of nodes; dfs runs once per node.',
      'Per node: two recursive calls, two max-with-zero clamps, one addition and one comparison against the running best — O(1).',
      'O(n). Tracking a global maximum while also returning a value does not add a second traversal.',
    ],
    space: [
      'Only the call stack: O(h) frames, each holding two local gains.',
      'O(log n) balanced, O(n) for a chain — and on a 30,000-node chain this is the version that overflows.',
    ],
    gotcha:
      'The key structural point is that dfs returns something DIFFERENT from what it records. It returns the best downward path (one child only, since a path cannot fork and continue), while recording the best bent path through the node (both children). One value up, another aside, and it is still one visit per node: O(n).',
  },

  'serialize-deserialize:bfs-level-order': {
    time: [
      'n is the number of nodes.',
      'serialize dequeues each real node once and also emits an "N" for each null child; a binary tree with n nodes has n+1 null links, so the output holds about 2n+1 tokens.',
      'deserialize splits that string once and then makes one pass, attaching two children per dequeued node.',
      'Both directions are O(n).',
    ],
    space: [
      'The token list and the resulting string are both O(n).',
      'The queue is O(w) for the widest level, which is itself O(n) for a full tree.',
      'O(n).',
    ],
    gotcha:
      'The nulls are not a rounding error — they roughly double the output, and forgetting to emit them makes the encoding ambiguous. Note the O(n) here counts the string you must produce; there is no O(1)-auxiliary version of a problem whose answer is a serialisation of the whole input.',
  },
  'serialize-deserialize:optimal': {
    time: [
      'n is the number of nodes.',
      'serialize appends one token per node plus one "N" per null link — about 2n+1 appends, each amortised O(1) — then a single join over the whole list.',
      'deserialize consumes those tokens strictly left to right, one index advance per token, building each node in O(1).',
      'O(n) each way.',
    ],
    space: [
      'The token list and the joined string are O(n) — unavoidable, since the string IS the answer.',
      'The recursion adds O(h) on both sides, dominated by the O(n) string.',
      'O(n).',
    ],
    gotcha:
      'Building the string with res.append(...) and one join at the end is deliberate. Doing s += token inside the traversal can be O(n squared), because strings are immutable and each += may copy everything accumulated so far. This is the single most common way to accidentally make a linear serialisation quadratic.',
  },

  // ---- the only genuinely O(1) traversal in the category --------------------------
  'inorder-traversal:morris-threading': {
    time: [
      'n is the number of nodes.',
      'The inner while that walks to the in-order predecessor looks like it makes this O(n x h).',
      'It does not: that walk follows right-child links, and each such link is traversed at most twice overall — once to create the thread, once to find it again and cut it.',
      'The tree has n-1 links, so the total walking work is bounded by about 2n regardless of how the loops nest.',
      'O(n), amortised over the whole run.',
    ],
    space: [
      'No stack, no queue, no recursion. The temporary thread pred.right = curr is stored in a pointer the tree already owns.',
      'Two local pointers, curr and pred.',
      'O(1) auxiliary — the only truly constant-space in-order traversal, excluding the output list.',
    ],
    gotcha:
      'The price is that it MUTATES the input tree while running. Every thread is cut again on the second visit so the tree is restored by the end, but mid-traversal the structure is temporarily wrong — which rules it out if anything else can read the tree concurrently, and makes it a poor choice when h is small enough that O(h) was never a problem.',
  },
  'inorder-traversal:optimal': {
    time: [
      'n is the number of nodes.',
      'The nested while loops look quadratic. Count pushes instead: each node is pushed exactly once and popped exactly once.',
      'That caps the total loop iterations at 2n, so the work is amortised O(1) per node.',
      'O(n).',
    ],
    space: [
      'The stack holds the chain of ancestors from the root down to the current node — nothing more.',
      'O(h): O(log n) for a balanced tree, O(n) for a chain, where the stack holds every node at once.',
    ],
    gotcha:
      'Do not call this O(1) space because there is no recursion. The stack you allocated holds exactly what the call stack would have held, frame for frame: it is still O(h). Morris traversal is the one that reaches genuine O(1), and it needs pointer surgery on the tree to get there.',
  },

  'preorder-traversal:recursive-dfs': {
    time: [
      'n is the number of nodes; dfs is invoked once per node (plus once per null child, which is still O(n) calls).',
      'Per call: one amortised O(1) append and two recursive calls.',
      'O(n).',
    ],
    space: [
      'The call stack: one frame per node on the current root-to-node path, so O(h).',
      'h = log n only for a balanced tree; a right-leaning chain gives h = n and O(n) frames.',
      'O(h) auxiliary, excluding the result list, which must hold all n values.',
    ],
    gotcha:
      'Traversal order does not change any bound — preorder, inorder and postorder are all O(n) time and O(h) space. Only the position of the append moves. What DOES change the bound is switching to a queue (O(w)) or to threading (O(1)).',
  },
  'preorder-traversal:optimal': {
    time: [
      'n is the number of nodes.',
      'Each node is pushed exactly once and popped exactly once; the while loop therefore runs exactly n times.',
      'Per iteration: one append and up to two pushes, O(1).',
      'O(n).',
    ],
    space: [
      'Going down the left spine, each pop removes one node and pushes two, a net growth of one per level — so the stack tops out at about h+1 entries.',
      'O(h), the same as the recursion it replaces. Balanced gives O(log n), a chain gives O(n).',
    ],
    gotcha:
      'Right child pushed before left is what makes the output preorder — the stack reverses the push order. And the space is still O(h), not O(1): people assume a hand-rolled stack is cheaper than recursion, when it is the identical amount of memory in a different place.',
  },

  'postorder-traversal:recursive-dfs': {
    time: [
      'n is the number of nodes, each visited once.',
      'The append happens after both recursive calls, but the number of calls is unchanged.',
      'O(n).',
    ],
    space: [
      'One stack frame per level of the current path: O(h).',
      'O(log n) if balanced, O(n) if the tree is one long chain.',
      'O(h) auxiliary, not counting the n-element result list.',
    ],
    gotcha:
      'Post-order is the shape behind most bottom-up tree problems (heights, diameter, pruning) precisely because the children are finished before the parent runs. That structural fact, not the complexity, is why it is worth recognising — the bound is the same O(n) / O(h) as every other traversal.',
  },
  'postorder-traversal:optimal': {
    time: [
      'n is the number of nodes.',
      'The stack loop is exactly the preorder loop with the child push order flipped: n pushes, n pops, O(1) each.',
      'Then result[::-1] is one more pass over n values.',
      'Sequential steps add: O(n) + O(n) = O(n).',
    ],
    space: [
      'The stack itself is O(h), the same net-one-per-level argument as preorder.',
      'But result[::-1] allocates a second n-element list, so as written there is an O(n) copy on top.',
      'O(h) auxiliary only if you reverse the list in place instead; otherwise count the O(n) copy.',
    ],
    gotcha:
      'Root-right-left, reversed, gives left-right-root. It is a genuinely clever trick with a real cost people skip: the slice reversal is a full O(n) allocation. Reversing in place (or prepending to a deque) keeps the auxiliary space at O(h) and matches the stated bound.',
  },

  'insert-into-bst:recursive-insert': {
    time: [
      'h is the height of the BST; n does not appear.',
      'One comparison per level decides left or right, and we never look at the other subtree.',
      'The descent ends at a null child, so at most h+1 calls: O(h).',
      'O(log n) for a balanced BST, O(n) for one that has degenerated into a sorted chain.',
    ],
    space: [
      'No allocation beyond the single new node, but every level of the descent leaves a pending frame waiting to reassign root.left or root.right.',
      'O(h) — which for a BST built from already-sorted input means O(n) frames for a single insert.',
    ],
    gotcha:
      'Answering O(log n) assumes a balance nothing guarantees. Insert 1..n in order into a plain BST and you get a chain: every subsequent insert is O(n), and n inserts total O(n squared). That failure mode is the entire reason AVL and red-black trees exist.',
  },
  'insert-into-bst:optimal': {
    time: [
      'h is the height of the tree.',
      'The while loop advances one level per iteration and stops at the first missing child.',
      'At most h iterations, each O(1): O(h), so O(log n) balanced and O(n) skewed.',
    ],
    space: [
      'A single curr pointer plus the new node itself.',
      'O(1) auxiliary — nothing is stored per level, because the reattachment is done directly through curr.left or curr.right.',
    ],
    gotcha:
      'The recursive version needs O(h) space only to rebuild the parent links on the way out (root.left = insertIntoBST(...)). Writing the child pointer directly while you are still standing at the parent removes that need entirely, dropping O(h) to O(1) with no change in time.',
  },

  'delete-node-bst:iterative-parent-pointer': {
    time: [
      'h is the height of the BST.',
      'The first while descends to the target node: at most h steps.',
      'In the two-children case, a second walk finds the in-order successor by going right once then left as far as possible — also at most h steps.',
      'Two sequential descents add, not multiply: O(h) + O(h) = O(h), which is O(log n) balanced and O(n) skewed.',
    ],
    space: [
      'Four pointers: parent, cur, p and succ. Nothing scales with the tree.',
      'O(1) auxiliary — the parent pointer is exactly what replaces the stack frame that recursion would have used to reattach the child.',
    ],
    gotcha:
      'Copying the successor value into cur and then deleting the successor node instead of the target is what keeps this O(h). The successor has at most one child by construction (it has no left child), so the second deletion is the easy case and never recurses further.',
  },
  'delete-node-bst:optimal': {
    time: [
      'h is the height of the BST.',
      'The recursion descends one level per call to find the key: O(h).',
      'When the node has two children we walk right-then-left to the successor (O(h)) and then call deleteNode again on the right subtree to remove it (another O(h)).',
      'Those are sequential descents down the same tree, so they add: O(h), not O(h squared).',
    ],
    space: [
      'One frame per level of the descent, held open so root.left / root.right can be reassigned on the way back up: O(h).',
      'The recursive re-deletion of the successor happens inside the deepest frame, so the depths add rather than nest multiplicatively — still O(h).',
    ],
    gotcha:
      'The second deleteNode call inside the two-children branch looks like it could recurse forever or square the cost. It cannot: the successor is the leftmost node of the right subtree, so it has no left child, and its removal hits a one-child base case immediately.',
  },

  'house-robber-iii:memoized-recursion': {
    time: [
      'n is the number of nodes; each node is one distinct DP state.',
      'Without the memo this is exponential, because a node is reached both as a child and as a grandchild and each path recomputes it.',
      'With the memo each node computes its answer once. Every node is then requested a constant number of times (by its parent and its grandparent), so total requests are O(n).',
      'States x O(1) work per state = O(n).',
    ],
    space: [
      'The memo dict holds one entry per node: O(n).',
      'Plus O(h) recursion frames, dominated by the dict.',
      'O(n).',
    ],
    gotcha:
      'Skipping the memo is the classic error and it is not a small one: the take branch recurses to grandchildren while the skip branch recurses to children, so the same subtree is solved along two different routes. Memoising collapses that overlap to one solve per node, which is the whole DP idea applied to a tree instead of an array.',
  },
  'house-robber-iii:optimal': {
    time: [
      'n is the number of nodes.',
      'dfs is called exactly once per node — the (with, without) pair carries everything a parent could need, so there is no reason to reach a grandchild.',
      'Per call: two recursive calls and a constant number of max and add operations, O(1).',
      'O(n), with no memo table needed.',
    ],
    space: [
      'The recursion stack, one frame per level holding two small tuples: O(h).',
      'O(log n) for a balanced tree, O(n) for a chain.',
    ],
    gotcha:
      'Same O(n) time as the memoised version but O(h) space instead of O(n) — and the improvement comes from the return TYPE, not from any change to the traversal. Returning both answers (rob this node, skip this node) removes the overlap the memo existed to patch over.',
  },

  'delete-leaves-given-value:iterative-postorder-stack': {
    time: [
      'n is the number of nodes.',
      'Each node is pushed at most twice — once to schedule its children, once to be re-examined after they are done — so at most 2n pops.',
      'Per pop: constant pointer checks and at most one pointer write, O(1).',
      'O(n) for the whole cascade, in a single pass.',
    ],
    space: [
      'Descending the left spine, each pop pushes a constant number of entries, so the stack holds O(h) triples.',
      'O(h) — the same as the recursion it replaces, since the (node, parent, visited) triple is just an unrolled frame.',
    ],
    gotcha:
      'The visited flag is the whole mechanism: it is what makes this post-order rather than pre-order, and post-order is what makes the cascade work. A node can only be judged a leaf AFTER its children have had their chance to disappear. Get the order wrong and you delete one layer per run instead of all of them.',
  },
  'delete-leaves-given-value:optimal': {
    time: [
      'n is the number of nodes.',
      'Both recursive calls happen before the leaf test, so each node is examined exactly once, after its subtrees are final.',
      'Per node: two null checks and one value comparison, O(1).',
      'O(n) — one pass handles arbitrarily deep cascades, because a parent is only judged once its children are gone.',
    ],
    space: [
      'The recursion stack: O(h) frames, each waiting to reassign root.left or root.right.',
      'O(log n) balanced, O(n) for a chain of target values — which is exactly the input that makes the cascade longest.',
    ],
    gotcha:
      'The tempting wrong answer is O(n x h): repeat a leaf-stripping pass until nothing changes. Post-order makes one pass sufficient, because the children of a node are already finished by the time it is tested. Reversing the order to pre-order really does force the repeated-pass version.',
  },

  // ---- a grid input: n is the side, so the input itself is n squared --------------
  'construct-quad-tree:prefix-sum-uniformity': {
    time: [
      'n is the SIDE LENGTH of the grid, so the input holds n squared cells. Say which one n is here — it is the difference between two whole complexity classes.',
      'Building the (n+1) x (n+1) prefix table is one pass over all cells: O(n squared).',
      'After that, total(r, c, k) answers "is this square uniform?" in O(1) with four table lookups, no matter how big the square is.',
      'The quad tree has at most about (4/3) x n squared nodes (worst case, every leaf a single cell), and each build() call is O(1).',
      'O(n squared) — linear in the size of the input, which is the best possible.',
    ],
    space: [
      'The prefix table is (n+1) squared integers: O(n squared).',
      'Recursion depth is only log base 2 of n, since the square halves each level — negligible beside the table.',
      'O(n squared), and the returned quad tree can be O(n squared) nodes as well.',
    ],
    gotcha:
      'O(n squared) sounds worse than it is: you cannot read an n x n grid in less than n squared steps, so this is a LINEAR algorithm in disguise. The prefix table is what removes the log n factor from the naive version, by making the uniformity test O(1) instead of proportional to the area being tested.',
  },
  'construct-quad-tree:optimal': {
    time: [
      'n is the side length of the grid; the input has n squared cells.',
      'Each build(r, c, k) scans its whole k x k square to test uniformity, then splits into four squares of side k/2.',
      'At recursion level i there are up to 4 to the i squares, each of area (n / 2 to the i) squared — so every level scans about n squared cells in total.',
      'The side halves each level, so there are log base 2 of n levels.',
      'n squared per level x log n levels = O(n squared log n).',
    ],
    space: [
      'No table is built; the only cost is the recursion, which is log base 2 of n deep because the square halves at every step.',
      'O(log n) auxiliary, excluding the quad tree being returned (which can itself hold O(n squared) nodes).',
    ],
    gotcha:
      'The log n factor comes from re-scanning the same cells at every level of the recursion — a cell inside a non-uniform region is examined once per ancestor square that contains it. The prefix-sum alternative trades O(n squared) space for the O(1) uniformity test and removes that factor. Note too that this loop has no early break, so it always pays the full k squared even after finding a mismatch; adding a break helps real inputs but not the worst case.',
  },
};
