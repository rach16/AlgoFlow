import type { ComplexityNote } from '../complexityTypes';

/**
 * Complexity derivations for the Graphs and Advanced Graphs categories.
 *
 * Two habits run through every note here: name V and E separately rather than inventing a
 * single n, and say m x n for grids rather than "n squared". Where a bound only holds because
 * union-find carries both path compression and union by rank, that is stated out loud.
 */
export const graphsNotes: Record<string, ComplexityNote> = {
  // ---- grids: why it is cells, never cells x islands -------------------------------
  'number-of-islands:bfs-flood-fill': {
    time: [
      'm is the number of rows, n the number of columns. There are m x n cells.',
      'The double for-loop touches every cell once to find unvisited land.',
      'Each cell is added to visited at most once, so it enters the queue at most once and is dequeued at most once.',
      'Per dequeue we check 4 fixed neighbours, which is O(1).',
      'O(m x n).',
    ],
    space: [
      'The visited set can hold every land cell, which is up to m x n entries.',
      'The BFS queue holds one frontier, bounded by O(min(m, n)) on a grid, so the visited set dominates.',
      'O(m x n).',
    ],
    gotcha:
      'The stated O(min(m, n)) space is the bound for the QUEUE alone. This code also keeps an explicit visited set, and that set is O(m x n) — the only way to reach O(min(m, n)) overall is to mark visited cells inside the grid itself instead.',
  },
  'max-area-of-island:bfs-flood-fill': {
    time: [
      'The grid has m x n cells and the outer double loop inspects each one.',
      'A cell is inserted into visited at the moment it is enqueued, so it is never enqueued twice.',
      'Total dequeues across every island in the whole run is at most m x n, and each dequeue does 4 constant-time neighbour checks.',
      'O(m x n).',
    ],
    space: [
      'The visited set grows to hold every land cell: up to m x n entries.',
      'O(m x n).',
    ],
    gotcha:
      'The nesting reads like O(m x n) scanning multiplied by O(m x n) flooding. It is not: visited is shared across islands, so the floods together spend a single budget of m x n cells no matter how the islands are arranged.',
  },
  'max-area-of-island:optimal': {
    time: [
      'The grid has m x n cells.',
      'The outer double loop looks at each cell once; a cell that is already in visited returns immediately.',
      'Each dfs call that does real work adds its cell to visited, so at most m x n calls ever get past the guard, and each makes 4 recursive calls.',
      'O(m x n).',
    ],
    space: [
      'The visited set holds up to m x n cells.',
      'The recursion stack is as deep as the longest snake-shaped island, which can also be m x n cells.',
      'O(m x n).',
    ],
    gotcha:
      'DFS and BFS are the same O(m x n) time here. The difference is space CHARACTER, not size: DFS spends it on stack frames, which is what blows Python default recursion limits on a large all-land grid.',
  },

  // ---- V and E, and where the copy of the graph goes -------------------------------
  'clone-graph:bfs-hash-map': {
    time: [
      'V is the number of nodes, E the number of edges. There is no single n here.',
      'Each node is put in oldToNew exactly once, so it is enqueued once and dequeued once: O(V).',
      'For each dequeued node we walk its neighbour list, and summed over all nodes that visits each edge once per endpoint: O(E).',
      'O(V + E).',
    ],
    space: [
      'The oldToNew map holds one entry per original node, O(V), and the queue holds at most V nodes.',
      'O(V) auxiliary — the cloned graph itself is the output and is conventionally excluded.',
    ],
    gotcha:
      'The clone contains V nodes AND E neighbour pointers, so it is O(V + E) of real memory. The O(V) answer is only honest if you say you are excluding the output.',
  },
  'clone-graph:optimal': {
    time: [
      'V is the number of nodes, E the number of edges.',
      'The map lookup at the top of dfs means each node gets cloned exactly once: V bodies execute.',
      'Each body iterates that node undirected neighbours, so across the run every edge is traversed once from each end: O(E).',
      'O(V + E).',
    ],
    space: [
      'The map is O(V), and the recursion stack goes as deep as the longest simple path, which is O(V) in a chain-shaped graph.',
      'O(V) auxiliary, excluding the cloned graph.',
    ],
    gotcha:
      'Putting copy INTO the map before recursing into neighbours is what stops infinite recursion on a cycle. Move that line after the loop and the algorithm never terminates, let alone hits O(V + E).',
  },

  // ---- multi-source BFS vs one flood per source ------------------------------------
  'walls-and-gates:dfs-per-gate': {
    time: [
      'The grid has m x n cells and g is the number of gates.',
      'The outer scan finds each gate, and each gate launches its own DFS across the reachable empty rooms.',
      'One gate flood can touch up to m x n cells, and the floods do not share a visited set — every gate starts over.',
      'g independent floods over the grid multiply: O(m x n x g).',
    ],
    space: [
      'No auxiliary structure is allocated; distances are written into rooms in place.',
      'The recursion stack is the cost, and it can reach one frame per cell on a snake-shaped open grid.',
      'O(m x n).',
    ],
    gotcha:
      'Even O(m x n x g) is optimistic. The only pruning is rooms[r][c] < dist, so a cell is re-entered every time a shorter path reaches it, and a single gate flood can revisit cells repeatedly. That re-entry is exactly what multi-source BFS eliminates.',
  },
  'walls-and-gates:optimal': {
    time: [
      'The grid has m x n cells.',
      'The first double loop seeds the queue with every gate: O(m x n).',
      'A cell is overwritten from INF the instant it is enqueued, so it can never be enqueued a second time.',
      'That caps total dequeues at m x n, each doing 4 constant-time neighbour checks.',
      'O(m x n), independent of the number of gates.',
    ],
    space: [
      'The queue holds the current BFS frontier, which after seeding can be every gate at once and later up to O(m x n) cells.',
      'O(m x n).',
    ],
    gotcha:
      'The g factor disappears because all gates go into ONE queue at distance 0. Every cell is then claimed by whichever gate reaches it first, so no cell is ever processed twice — the g gates cost the same as one.',
  },
  'rotting-oranges:simulation-loop': {
    time: [
      'The grid has m x n cells.',
      'Each pass of the while loop rescans the entire grid to find fresh oranges next to rotten ones: O(m x n) per round.',
      'Each round rots at least one orange or the loop breaks, so there are at most m x n rounds.',
      'Rounds x work per round multiplies: O((m x n) squared).',
    ],
    space: [
      'The infected list for the current round, which is at most every cell.',
      'O(m x n).',
    ],
    gotcha:
      'The wasted work is re-scanning cells that will never change. BFS keeps a frontier so round k only looks at the cells that just rotted — that is what turns the m x n rounds factor into a single amortised pass.',
  },
  'rotting-oranges:optimal': {
    time: [
      'The grid has m x n cells.',
      'The setup loop counts fresh oranges and seeds the queue with every rotten one: O(m x n).',
      'Each fresh orange is flipped to 2 the moment it is enqueued, so no cell enters the queue twice.',
      'Total dequeues across all minutes is bounded by m x n, each with 4 constant-time neighbour checks.',
      'O(m x n).',
    ],
    space: [
      'The queue holds one minute worth of frontier, which in the worst case is most of the grid.',
      'O(m x n).',
    ],
    gotcha:
      'The for _ in range(len(queue)) is not extra work — it is snapshotting the frontier size so one iteration equals one minute. It changes the bookkeeping, not the bound.',
  },
  'pacific-atlantic-water-flow:bfs-from-oceans': {
    time: [
      'The grid has m x n cells.',
      'Two BFS runs, one per ocean. Each seeds O(m + n) border cells and then expands.',
      'Within one run, a cell is added to its visit set before being enqueued, so each of the m x n cells is dequeued at most once.',
      'Two sequential runs add rather than multiply, and the final set intersection is O(m x n).',
      'O(m x n).',
    ],
    space: [
      'Two visit sets, each up to m x n cells, plus a queue bounded by the grid.',
      'O(m x n).',
    ],
    gotcha:
      'Reversing the direction is the trick: instead of asking "can this cell reach an ocean" for all m x n cells separately, you flood inward from the borders once. The naive per-cell search is O(m x n) searches over O(m x n) cells.',
  },
  'pacific-atlantic-water-flow:optimal': {
    time: [
      'The grid has m x n cells.',
      'The border loops launch O(m + n) DFS calls, but they share the pac and atl visit sets.',
      'A cell is added to a visit set the first time it is reached, so at most m x n calls per set do real work.',
      'Two sets means each cell is processed at most twice, and constants drop.',
      'O(m x n).',
    ],
    space: [
      'Two visit sets of up to m x n entries each.',
      'Recursion depth follows the longest non-decreasing path, up to m x n frames.',
      'O(m x n).',
    ],
    gotcha:
      'The two DFS passes are sequential, not nested — so it is O(m x n) + O(m x n) = O(m x n), not squared. The visit sets being separate is why a cell can be touched twice, and 2 is a constant.',
  },
  'surrounded-regions:border-bfs': {
    time: [
      'The grid has m x n cells.',
      'The first double loop finds every border O and marks it T while enqueueing it: O(m x n).',
      'Each cell is repainted to T before being enqueued, so the O test fails forever after and no cell enters the queue twice.',
      'The final double loop rewrites every cell: another O(m x n).',
      'Three sequential passes add, so O(m x n).',
    ],
    space: [
      'The board is modified in place, so the only allocation is the queue.',
      'It can hold most of the grid when the border-connected region is large: O(m x n).',
    ],
    gotcha:
      'The T marker doubles as the visited set, which is why no extra structure is needed. Repainting to T is what makes the reachability test idempotent — without it the queue could revisit cells and the pass would not be linear.',
  },
  'surrounded-regions:optimal': {
    time: [
      'The grid has m x n cells.',
      'Pass 1 scans all cells and starts a DFS from each border O: O(m x n) for the scan.',
      'The DFS repaints each cell it reaches to T, and the guard board[r][c] != O rejects anything already repainted, so total DFS work across every start is bounded by m x n cells.',
      'Pass 2 rewrites every cell: O(m x n).',
      'Sequential passes add: O(m x n).',
    ],
    space: [
      'Nothing is allocated — T is written into the board itself.',
      'The recursion stack is the whole cost, up to one frame per cell for a snaking border region.',
      'O(m x n).',
    ],
    gotcha:
      'This is O(1) auxiliary in the sense that no data structure is built, but it is NOT O(1) space — the call stack is O(m x n). Marking in place saves you a set, not the recursion.',
  },

  // ---- topological sort: V + E, both named -----------------------------------------
  'course-schedule:kahns-bfs-indegree': {
    time: [
      'V is the number of courses, E the number of prerequisite pairs.',
      'Building the adjacency list allocates V empty lists and walks E pairs once: O(V + E).',
      'Seeding the queue scans all V indegrees.',
      'Each course is enqueued at most once (only when its indegree hits 0), and dequeuing it decrements the indegree of each of its outgoing neighbours — so every edge is decremented exactly once across the whole run.',
      'O(V + E).',
    ],
    space: [
      'The adjacency list stores every edge, O(E), and the indegree array plus the queue are O(V) each.',
      'O(V + E).',
    ],
    gotcha:
      'Answering O(V squared) assumes E is close to V squared, which only holds for a dense graph. Keep V and E separate and the bound is honest for the sparse inputs you actually get.',
  },
  'course-schedule-ii:kahns-bfs-indegree': {
    time: [
      'V is the number of courses, E the number of prerequisite pairs.',
      'The build loop walks E pairs to fill adj and indegree: O(V + E).',
      'Every course enters the queue at most once, because it is pushed only at the moment its indegree reaches 0.',
      'Each dequeue walks that course outgoing edges, so the total decrements across the run equal E exactly.',
      'O(V + E).',
    ],
    space: [
      'Adjacency O(E), indegree O(V), queue O(V), order O(V).',
      'O(V + E).',
    ],
    gotcha:
      'The final len(order) == numCourses check is O(1) and is the cycle detection. People assume detecting the cycle needs a second traversal — it does not, a course stuck in a cycle simply never reaches indegree 0.',
  },
  'course-schedule-ii:optimal': {
    time: [
      'V is the number of courses, E the number of prerequisite pairs.',
      'Building the reversed adjacency list is O(V + E).',
      'The visited array gives each course three states, and a course is marked 2 the first time its subtree finishes — so a second dfs on it returns in O(1).',
      'That means at most V bodies execute, and each walks its own edge list, totalling E edge traversals.',
      'O(V + E).',
    ],
    space: [
      'Adjacency O(E) plus the visited array and order list at O(V).',
      'The recursion stack is one frame per course on the current chain, up to V for a long dependency chain.',
      'O(V + E).',
    ],
    gotcha:
      'Without the 2 (done) state this degrades badly: a diamond-shaped dependency graph would re-explore shared subtrees, and repeated re-exploration is what turns a linear DFS exponential. The three-colour marking is the memoisation.',
  },

  // ---- union-find: what alpha(n) actually is ---------------------------------------
  'graph-valid-tree:dfs-connectivity': {
    time: [
      'V is the number of nodes, E the number of edges.',
      'The edge-count check len(edges) != n - 1 is O(1) and rejects anything that cannot be a tree.',
      'Building the undirected adjacency list walks each edge twice: O(V + E).',
      'One DFS from node 0 visits each node once and each edge once from each end: O(V + E).',
      'O(V + E).',
    ],
    space: [
      'Adjacency O(E), visited O(V), and recursion depth up to V for a path-shaped graph.',
      'O(V + E).',
    ],
    gotcha:
      'Because the E = V - 1 check already ran, E is O(V) by the time the DFS starts, so this is really O(V). Two conditions define a tree — exactly V - 1 edges AND connected — and each check is cheap only because the other one is also being made.',
  },
  'graph-valid-tree:optimal': {
    time: [
      'V is the number of nodes, E the number of edges.',
      'One pass over the E edges, calling union once per edge.',
      'find walks up the parent chain while halving it (parent[x] = parent[parent[x]]), and union attaches the shorter tree under the taller by rank.',
      'Path compression plus union by rank keeps every find and union to O(alpha(V)) amortised, where alpha is the inverse Ackermann function — under 5 for any V that fits in memory, so it is effectively constant.',
      'O(V + E), or precisely O(V) to build the arrays plus O(E x alpha(V)) for the unions.',
    ],
    space: [
      'The parent and rank arrays, one slot per node each.',
      'O(V).',
    ],
    gotcha:
      'alpha(V) is not O(1) by definition, it is effectively constant in practice — and it is EARNED by two things together. Path compression alone gives O(log V) amortised; union by rank alone gives O(log V); only both together get you to alpha.',
  },
  'connected-components:dfs-traversal': {
    time: [
      'V is the number of nodes, E the number of edges.',
      'Building the undirected adjacency list touches each edge twice: O(V + E).',
      'The outer loop tries all V starting nodes, but a node already in visited is skipped in O(1).',
      'Across every component, each node is visited once and each edge walked once from each end.',
      'O(V + E).',
    ],
    space: [
      'Adjacency O(E), visited O(V), recursion depth up to V inside one large component.',
      'O(V + E).',
    ],
    gotcha:
      'Multiplying by the number of components is the reflex error. The shared visited set means the components partition the same V + E budget between them — 1 component and 100 components cost the same.',
  },
  'connected-components:optimal': {
    time: [
      'V is the number of nodes, E the number of edges.',
      'Initialising parent and rank is O(V), with no adjacency list built at all.',
      'One pass over E edges, one union each. With path compression in find and union by rank in union, each call is O(alpha(V)) amortised — inverse Ackermann, under 5 for any realistic V, so effectively constant.',
      'O(V + E x alpha(V)), written O(V + E).',
    ],
    space: [
      'Two arrays of length V: parent and rank. No adjacency list, no visited set, no recursion.',
      'O(V).',
    ],
    gotcha:
      'Same time class as the DFS but O(V) space instead of O(V + E), because union-find never materialises the graph. The counter trick (start at n, subtract one per successful union) is why no second pass is needed to count components.',
  },
  'redundant-connection:dfs-cycle-check': {
    time: [
      'n is the number of edges, which for this problem also equals the number of nodes.',
      'The outer loop processes each of the n edges in turn.',
      'Before adding edge (a, b) it runs a fresh DFS to test whether a already reaches b. That DFS is O(V + E) over the graph built so far, which is O(n).',
      'n edges x an O(n) reachability search per edge multiplies: O(n squared).',
    ],
    space: [
      'The adjacency list is O(n), the per-edge visited set is O(n), and recursion depth is up to n.',
      'O(n).',
    ],
    gotcha:
      'The visited set is created fresh for every edge — set() inside the loop. That reset is exactly what union-find avoids: it keeps one persistent structure, so the reachability question becomes a find instead of a search.',
  },
  'redundant-connection:optimal': {
    time: [
      'n is the number of edges (and of nodes).',
      'One pass over the edges, calling union on each until one fails.',
      'union does two finds. Path compression halves the parent chain on every walk, and union by rank keeps trees shallow, so each call is O(alpha(n)) amortised — inverse Ackermann, effectively constant.',
      'O(n x alpha(n)), which is why the stated bound is written O(n).',
    ],
    space: [
      'The parent and rank arrays, one slot per node.',
      'O(n).',
    ],
    gotcha:
      'union returning False IS the cycle detection — both endpoints already share a root, so the edge closes a loop. No traversal happens at all, which is the whole gap between O(n) here and O(n squared) for the DFS version.',
  },

  // ---- bidirectional BFS: better in practice, same worst case ----------------------
  'word-ladder:bidirectional-bfs': {
    time: [
      'n is the number of words in wordList and m the length of each word.',
      'Each word is visited at most once across both frontiers. For a visited word we try m positions x 26 letters, and each candidate costs O(m) to build by slicing.',
      'So the per-word cost is O(m squared) after dropping the constant 26, and n words gives O(n x m squared).',
      'Same asymptotic class as one-directional BFS — meeting in the middle does not change the worst case.',
      'O(n x m squared).',
    ],
    space: [
      'wordSet holds n words of length m, and the two frontiers plus visited hold at most n words.',
      'O(n x m).',
    ],
    gotcha:
      'The win is real but not asymptotic. If the search tree branches b ways per level and the answer is d levels deep, one direction explores about b to the d nodes while two directions explore 2 x b to the d/2 — the square root of the same number. Halving an exponent is a huge constant-factor win inside the same O() class, and the swap that always expands the smaller frontier is what keeps it there.',
  },
  'word-ladder:optimal': {
    time: [
      'n is the number of words in wordList and m the length of each word.',
      'A word joins visited at the moment it is enqueued, so each of the n words is dequeued at most once.',
      'For each dequeued word the loops try m positions x 26 replacement letters, and word[:i] + c + word[i+1:] copies the string, costing O(m).',
      'That is m x 26 x m = O(m squared) per word, times n words.',
      'O(n x m squared).',
    ],
    space: [
      'wordSet, visited and the queue each hold up to n words of length m.',
      'O(n x m).',
    ],
    gotcha:
      'The stated O(m squared x n) space belongs to the OTHER standard solution — the one that precomputes a wildcard pattern map, storing m patterns of length m for each of n words. This code builds candidates on the fly and throws them away, so its space is O(n x m).',
  },

  // ---- when the traversal is not the point ----------------------------------------
  'island-perimeter:dfs-boundary-crossings': {
    time: [
      'The grid has m x n cells.',
      'The scan stops at the first land cell it finds and returns immediately after that one DFS, because the problem guarantees exactly one island.',
      'Finding that cell costs up to O(m x n), and the DFS visits each land cell once, adding 1 for each of the 4 neighbours that is water or off-grid.',
      'O(m x n).',
    ],
    space: [
      'The visited set holds every land cell, up to m x n entries.',
      'Recursion depth follows the island shape, also up to m x n.',
      'O(m x n).',
    ],
    gotcha:
      'Perimeter is counted per BOUNDARY CROSSING, not per cell, which is why the water/off-grid branch increments and the recursive branch does not. Counting cells instead gives the area.',
  },
  'island-perimeter:optimal': {
    time: [
      'The grid has m x n cells and the double loop visits each exactly once.',
      'Per land cell: add 4, then two O(1) checks against the neighbour above and the neighbour to the left.',
      'No recursion, no revisiting, so the innermost work runs m x n times.',
      'O(m x n).',
    ],
    space: [
      'One running integer. No visited set and no call stack.',
      'O(1).',
    ],
    gotcha:
      'Only up and left are checked, not all four. Each shared edge is between exactly one pair of cells, and scanning in row-major order means the later cell of the pair always sees the earlier one — so subtracting 2 once per pair counts every shared edge exactly once. Checking all four directions double-counts.',
  },

  // ---- bounded alphabet again ------------------------------------------------------
  'verifying-alien-dictionary:translate-and-compare': {
    time: [
      'n is the number of words and k the average word length, so n x k characters in total.',
      'Building the index map walks the 26-letter order string: O(1) for a fixed alphabet.',
      'The nested comprehension translates every character of every word into its rank: O(n x k).',
      'Then n - 1 list comparisons, each of which compares up to k ranks: O(n x k).',
      'Sequential passes add, so O(n x k).',
    ],
    space: [
      'The mapped list is a full parallel copy of the input as rank lists: n lists of k integers.',
      'O(n x k).',
    ],
    gotcha:
      'Python list comparison already does lexicographic ordering element by element, which is why the loop body is one line. It is not free — that comparison is O(k), which is where the k in the bound comes from.',
  },
  'verifying-alien-dictionary:optimal': {
    time: [
      'n is the number of words and k the average word length.',
      'The index map is built from the 26-character order string: O(1) for a bounded alphabet.',
      'The outer loop runs n - 1 times, once per adjacent pair.',
      'The inner loop walks at most k characters and breaks at the first difference, so each pair costs O(k).',
      'O(n x k).',
    ],
    space: [
      'Only the rank map, which holds one entry per letter of the alphabet.',
      'At most 26 keys regardless of n or k, so O(1).',
    ],
    gotcha:
      'That O(1) is the same claim as int[26] being constant: bounded by a constant, not small. Compare the translate-first version, which allocates O(n x k) to buy the same O(n x k) time — pure extra space for no asymptotic gain.',
  },

  // ---- n and e are different things -----------------------------------------------
  'find-town-judge:two-degree-arrays': {
    time: [
      'n is the number of people, e the number of trust pairs. These are independent sizes.',
      'Allocating the two degree arrays is O(n).',
      'One pass over the trust list incrementing two counters per pair: O(e).',
      'One pass over the n people testing outdegree 0 and indegree n - 1: O(n).',
      'Sequential work adds: O(n + e).',
    ],
    space: [
      'Two integer arrays of length n + 1.',
      'O(n).',
    ],
    gotcha:
      'No graph is ever built. The judge is defined purely by degrees, so trust is a stream of increments rather than a structure to traverse — that is why there is no V + E adjacency cost here.',
  },
  'find-town-judge:optimal': {
    time: [
      'n is the number of people, e the number of trust pairs.',
      'One array of n + 1 zeros: O(n).',
      'One pass over the e pairs, doing -1 on the truster and +1 on the trusted: O(e).',
      'One pass over the n people looking for a score of exactly n - 1: O(n).',
      'O(n + e).',
    ],
    space: [
      'A single integer array of length n + 1.',
      'O(n).',
    ],
    gotcha:
      'Identical bound to the two-array version — the merge into one net score halves the memory constant, not the class. It works because only the judge can score n - 1: trusted by all n - 1 others and trusting nobody, and no one else can reach that number.',
  },

  // ---- when the state space is fixed ----------------------------------------------
  'open-the-lock:bidirectional-bfs': {
    time: [
      'The state space is every 4-digit combination: 10 to the 4, i.e. 10000 states.',
      'Each state is added to seen once, so it is expanded at most once across the two frontiers.',
      'Expanding a state tries 4 dial positions x 2 directions = 8 neighbours, each costing O(4) to build by string slicing.',
      'So about 10000 x 8 x 4 operations, plus O(D) to build the deadend set for D deadends.',
      'O(10 to the 4 x 4 x 10) as stated — a fixed number, since 4 dials over 10 digits does not grow with the input.',
    ],
    space: [
      'The seen set and the two frontier sets, bounded by the 10000 states, each a 4-character string.',
      'O(10 to the 4), which is constant for this fixed lock size.',
    ],
    gotcha:
      'Bidirectional search does not shrink the state space — worst case still touches all 10000. What it shrinks is the FRONTIER: the branching factor is 8, so meeting halfway means two searches of depth d/2 instead of one of depth d, and 2 x 8 to the d/2 is far smaller than 8 to the d. That is a constant-factor win inside the same bound.',
  },
  'open-the-lock:optimal': {
    time: [
      'There are 10 to the 4 = 10000 possible lock states, and that count is fixed by the problem, not by the input.',
      'A state joins seen the moment it is enqueued, so each state is dequeued at most once.',
      'Per dequeue: 4 positions x 2 turn directions = 8 candidates, each built with O(4) string slicing.',
      'Plus O(D) to load D deadends into a set for O(1) membership tests.',
      'O(10 to the 4 x 4 x 10) as stated, which is a constant plus O(D).',
    ],
    space: [
      'The seen set and the queue, both bounded by the 10000 states.',
      'O(10 to the 4).',
    ],
    gotcha:
      'This is a rare case where the honest answer is "constant, because the state space is fixed". Generalise to d dials with A digits and it becomes O(A to the d x d x A) — the exponential in d is what the concrete 10000 is hiding.',
  },

  // ---- reachability closure: two very different shapes ----------------------------
  'course-schedule-iv:kahns-prereq-sets': {
    time: [
      'V is the number of courses, E the number of prerequisite pairs, q the number of queries.',
      'Standard Kahn traversal: each course dequeued once, each edge relaxed once, so O(V + E) of pure traversal.',
      'But per edge it also does prereqs[nxt] |= prereqs[node], and a prereq set can hold up to V courses — that union is O(V), not O(1).',
      'E edges x O(V) per union gives O(V x E), which dominates the traversal.',
      'Then each of the q queries is one set membership test, O(1) average: O(V x E + q).',
    ],
    space: [
      'V prerequisite sets, each able to hold up to V courses.',
      'O(V squared), plus O(V + E) for the adjacency list and indegree array.',
    ],
    gotcha:
      'The bound hides in |=. It looks like one operation and it is a set union costing O(V) — exactly the kind of one-liner that turns a linear traversal into O(V x E).',
  },
  'course-schedule-iv:optimal': {
    time: [
      'n is the number of courses and q the number of queries.',
      'Seeding the reach matrix from the direct prerequisites is O(E), bounded by O(n squared).',
      'Floyd-Warshall is three nested loops over all n courses: the intermediate k, the source i, the destination j.',
      'The innermost line runs n x n x n times, doing O(1) work each: O(n cubed).',
      'Each query is one O(1) matrix lookup, so O(n cubed + q).',
    ],
    space: [
      'An n x n boolean matrix holding the full transitive closure.',
      'O(n squared).',
    ],
    gotcha:
      'The k loop must be OUTERMOST. It is the induction variable — after iteration k, reach[i][j] is correct for paths using only intermediates 0..k. Swap k inside and the algorithm silently returns wrong answers at the same complexity.',
  },

  // ---- when the sort, not the graph work, is the bottleneck -----------------------
  'accounts-merge:email-graph-dfs': {
    time: [
      'N is the total number of emails across all accounts.',
      'Building the star-shaped adjacency (every email linked to the first email of its account) walks each email once: O(N).',
      'The DFS visits each email once and each adjacency entry once: O(N), since the number of edges built is also O(N).',
      'Then each component is sorted. Component sizes sum to N, and sum of |c| log |c| is at most N log N.',
      'The sort dominates the linear traversal, so O(N log N).',
    ],
    space: [
      'The adjacency map, the owner map, and the visited set each hold up to N emails.',
      'Recursion depth is up to N for one giant merged account.',
      'O(N).',
    ],
    gotcha:
      'Linking every email to emails[0] instead of to each other is what keeps edges at O(N). Linking all pairs within an account would be O(k squared) edges for a k-email account and blow the bound.',
  },
  'accounts-merge:optimal': {
    time: [
      'N is the total number of emails across all accounts.',
      'One pass over all accounts doing a union per email after the first: O(N) unions, each O(alpha(N)) amortised thanks to path compression in find.',
      'Grouping by root calls find once per email: another O(N x alpha(N)).',
      'Then each group is sorted, and the group sizes sum to N, so the sorting totals O(N log N).',
      'O(N x alpha(N) + N log N), and since alpha is effectively constant the log N term dominates: really O(N log N).',
    ],
    space: [
      'The parent map, owner map, and groups map each hold up to N emails.',
      'O(N).',
    ],
    gotcha:
      'Both approaches are O(N log N) because the SORT is the bottleneck, not the merging. That is the honest comparison: union-find replaces an O(N) DFS with an O(N x alpha(N)) pass, which is invisible next to the required sort. The output must be sorted, so neither can beat N log N.',
  },
  'evaluate-division:weighted-union-find': {
    time: [
      'V is the number of distinct variables, E the number of equations, q the number of queries.',
      'One pass over the E equations: two finds and possibly one link each.',
      'find recurses to the root and multiplies weights back down while repointing parent[x] to the root — path compression, so the chain it just walked is flattened.',
      'Each query is two finds plus one division: O(1) work on top of the finds.',
      'O((E + q) x alpha(V)) as stated, i.e. effectively linear in E + q.',
    ],
    space: [
      'The parent and weight maps, one entry per variable, plus recursion depth in find before compression.',
      'O(V).',
    ],
    gotcha:
      'This union does parent[ra] = rb unconditionally — no union by rank. Path compression alone gives O(log V) amortised, not alpha(V); alpha needs both. The stated alpha is the bound for the ranked version, and adding rank here would be a two-line change.',
  },
  'evaluate-division:optimal': {
    time: [
      'V is the number of distinct variables, E the number of equations, q the number of queries.',
      'Building the bidirectional weighted graph walks each equation once: O(E).',
      'Each query runs its OWN DFS with a fresh visited set, which in the worst case walks every vertex and every edge: O(V + E) per query.',
      'q independent searches multiply: O(q x (V + E)).',
    ],
    space: [
      'The graph holds 2 x E directed entries over V vertices: O(V + E).',
      'Plus a per-query visited set and recursion stack of O(V).',
      'O(V + E).',
    ],
    gotcha:
      'The per-query DFS is the cost, and it is thrown away every time — visited=set() is fresh on every call. Weighted union-find keeps the compressed structure between queries, turning O(q x (V + E)) into roughly O(q).',
  },

  // ---- in a tree, E = V - 1 -------------------------------------------------------
  'minimum-height-trees:double-bfs-diameter': {
    time: [
      'V is the number of nodes, E the number of edges. The input is a tree, so E = V - 1 exactly.',
      'Building the adjacency list walks each edge twice: O(V + E).',
      'Two BFS runs, each visiting every node once and every edge once from each end: O(V + E) each, and sequential runs add.',
      'Walking back up the parent pointers covers the diameter path, at most V nodes.',
      'O(V + E), which for a tree is just O(V).',
    ],
    space: [
      'Adjacency O(E), plus the parent, seen and order arrays at O(V) each.',
      'O(V + E), i.e. O(V) for a tree.',
    ],
    gotcha:
      'Two BFS runs are sequential, so they ADD — the bound is O(V + E), not doubled or squared. The reason two are needed is that the first only finds one endpoint of the diameter; you have to walk from that endpoint to find the other.',
  },
  'minimum-height-trees:optimal': {
    time: [
      'V is the number of nodes, E the number of edges, and for a tree E = V - 1.',
      'Building the adjacency sets walks each edge twice: O(V + E).',
      'The while loop peels the current leaf layer. A node joins new_leaves at most once, when its degree drops to 1, so it is peeled at most once.',
      'Each peel does one set pop and one set remove — O(1) each — and removes one edge, so total edge removals is E.',
      'Layers x work per layer does not multiply here; the total is bounded by V peels and E removals: O(V + E).',
    ],
    space: [
      'V adjacency sets holding 2 x E entries in total, plus the leaves lists at O(V).',
      'O(V + E).',
    ],
    gotcha:
      'The nested while-plus-for looks like it could be O(V squared). It is not: each node is peeled exactly once across the entire run, so the inner loop spends a total budget of V, not V per layer. Same amortised argument as a sliding window.',
  },

  // ==== Advanced graphs ============================================================

  // ---- Eulerian path: search vs walk ---------------------------------------------
  'reconstruct-itinerary:dfs-backtracking': {
    time: [
      'E is the number of tickets and d the largest number of tickets leaving any single airport.',
      'Sorting the tickets is O(E log E), which is not where the cost lives.',
      'A valid route uses all E tickets, so the recursion is E levels deep.',
      'At each level we may try up to d outgoing tickets, and a failed branch is undone (route.pop, restore the ticket) and the next one tried — that is a search tree, not one walk.',
      'Exponential in the graph size, quoted as O(E to the d).',
    ],
    space: [
      'The graph holds E tickets, the route holds up to E + 1 airports, and the recursion is E frames deep.',
      'O(E).',
    ],
    gotcha:
      'The exponential only bites when several tickets leave the same airport — with d = 1 there is nothing to backtrack over and this is linear. Hierholzer removes the backtracking entirely by never needing to undo a step, which is the whole reason it is O(E log E).',
  },
  'reconstruct-itinerary:optimal': {
    time: [
      'E is the number of tickets.',
      'Sorting the tickets in reverse so pop() yields the smallest destination is O(E log E).',
      'The inner while walks forward, popping one ticket per step. Each ticket is popped exactly once and never restored, so the total walking across the whole run is E steps.',
      'Each airport is pushed and popped from the stack a bounded number of times, so the outer loop is also O(E).',
      'The sort dominates the linear walk, and sequential work adds: O(E log E).',
    ],
    space: [
      'The graph stores E destinations, and the stack plus the route hold up to E + 1 airports.',
      'O(E).',
    ],
    gotcha:
      'No backtracking happens, so nothing is ever undone — that is what separates O(E log E) from the exponential search. Hierholzer works because a stuck airport must be the END of the tour, so appending it and popping back is always correct rather than a dead end to retry.',
  },

  // ---- MST: the sort is the bill --------------------------------------------------
  'min-cost-connect-points:kruskal-union-find': {
    time: [
      'n is the number of points. Every pair of points is an edge, so E = n(n-1)/2 = O(n squared) — this graph is dense by construction.',
      'The double loop builds all O(n squared) edges with an O(1) Manhattan distance each.',
      'Sorting those edges is O(E log E) = O(n squared x log(n squared)), and log(n squared) = 2 log n, so that is O(n squared x log n).',
      'Then one pass over the sorted edges doing two finds each. With path compression that is O(alpha(n)) amortised per edge — near-linear, O(n squared x alpha(n)) in total.',
      'The sort dominates the near-linear union-find work: O(n squared x log n).',
    ],
    space: [
      'The edge list holds O(n squared) tuples, which dwarfs the O(n) parent array.',
      'O(n squared).',
    ],
    gotcha:
      'The union-find is not the bottleneck and never is in Kruskal — alpha(n) is effectively constant, so the whole algorithm is "sort the edges, then a linear sweep". On a dense graph like this one, materialising and sorting n squared edges is also the space bill, which is why Prim with an adjacency scan wins here.',
  },
  'min-cost-connect-points:optimal': {
    time: [
      'n is the number of points.',
      'The outer loop runs exactly n times, adding one point to the MST per iteration.',
      'Inside, the first inner loop scans all n points to find the cheapest unvisited one: O(n).',
      'The second inner loop scans all n points again to refresh min_cost with distances from the newly added point: O(n).',
      'n iterations x O(n) of scanning = O(n squared). No heap is used, so there is no log factor.',
    ],
    space: [
      'The min_cost array and the visited set, one entry per point each.',
      'O(n).',
    ],
    gotcha:
      'This is dense-graph Prim, and its bound is O(n squared), not O(n squared log n) — the array scan replaces the heap precisely to drop the log. It is also O(n) space, not O(n squared), because the edges are computed on demand from the coordinates instead of being stored. Both stated bounds are for a heap-based Prim over a materialised edge list.',
  },

  // ---- shortest paths: Bellman-Ford vs Dijkstra ----------------------------------
  'network-delay-time:bellman-ford': {
    time: [
      'V is the number of nodes, E the number of edges in times.',
      'The outer loop runs V - 1 rounds. That count is the point: a shortest path in a graph with no negative cycle visits at most V nodes, so it uses at most V - 1 edges, and each round guarantees one more edge of every shortest path is locked in.',
      'Each round relaxes every edge once: O(E).',
      'V - 1 rounds x E relaxations multiplies: O(V x E).',
      'The updated flag lets it stop early when a round changes nothing, but that does not change the worst case.',
    ],
    space: [
      'The dist map, one entry per node. No adjacency list is built — the edge list is scanned directly.',
      'O(V).',
    ],
    gotcha:
      'Why V - 1 and not V? After round k, every shortest path using at most k edges is final. The longest possible shortest path has V - 1 edges, so V - 1 rounds is sufficient AND necessary in the worst case. A V-th round that still improves something proves a negative cycle exists.',
  },
  'network-delay-time:optimal': {
    time: [
      'V is the number of nodes, E the number of edges.',
      'Building the adjacency list is O(E).',
      'Every node is eventually popped, and each pop is O(log(heap size)): that is the V log V term.',
      'Each edge can trigger at most one push when it improves dist, and each push is O(log(heap size)): that is the E log V term. The heap holds at most E entries, and log E is at most log(V squared) = 2 log V, so log V is the right factor.',
      'O((V + E) log V), which for a connected graph with E at least V - 1 simplifies to the stated O(E log V).',
    ],
    space: [
      'The adjacency list is O(V + E), the dist map is O(V), and the heap can hold one entry per pushed relaxation, up to O(E).',
      'O(V + E).',
    ],
    gotcha:
      'The if d > dist[u]: continue line is load-bearing. This is lazy deletion — stale heap entries are left in place and skipped on pop, which is why the heap grows to O(E) rather than O(V). Without it you would need a decrease-key operation that a binary heap does not provide.',
  },

  // ---- binary search on the answer vs Dijkstra on a grid -------------------------
  'swim-in-rising-water:binary-search-dfs': {
    time: [
      'The grid is n x n, so there are n squared cells, and elevations run from 0 to n squared - 1.',
      'Binary search over that value range takes log(n squared) iterations, and log(n squared) = 2 log n, so O(log n) iterations.',
      'Each iteration runs a fresh DFS with a new visited set, touching at most n squared cells with 4 constant-time neighbour checks each: O(n squared).',
      'Iterations x work per iteration multiplies: O(n squared x log n).',
    ],
    space: [
      'The visited set holds up to n squared cells, and the recursion can be n squared frames deep on a snaking reachable region.',
      'O(n squared).',
    ],
    gotcha:
      'The searched range is the ANSWER space (elevation values), not the input. That works only because reachability is monotonic in t: if you can cross at time t you can cross at t + 1. Without that monotonicity, binary search on the answer is invalid regardless of complexity.',
  },
  'swim-in-rising-water:optimal': {
    time: [
      'The grid is n x n, so n squared cells.',
      'A cell is added to visited at push time, so each cell is pushed at most once and popped at most once — the heap sees O(n squared) operations.',
      'Each heappush and heappop is O(log(heap size)), and the heap holds at most n squared entries, so log(n squared) = 2 log n = O(log n).',
      'n squared heap operations x O(log n) each: O(n squared x log n).',
    ],
    space: [
      'The visited set and the heap each hold up to n squared entries.',
      'O(n squared).',
    ],
    gotcha:
      'Same bound as binary search + DFS, reached differently: this pays log n on every one of n squared heap operations, the other pays a full n squared sweep on each of log n rounds. Identical class, and this one stops the instant the target pops instead of finishing every probe.',
  },

  // ---- when the input size, not the graph, is the bound --------------------------
  'alien-dictionary:dfs-topological-sort': {
    time: [
      'C is the total number of characters across all words. V is the number of distinct letters and E the number of ordering constraints.',
      'Building adj walks every character of every word: O(C).',
      'Deriving the constraints compares each adjacent word pair up to min(len) characters, which across all pairs is also O(C).',
      'The DFS itself is O(V + E), but V is capped at 26 letters and E at 26 x 26 = 676 pairs — both constants.',
      'The input scan dominates the bounded graph work: O(C).',
    ],
    space: [
      'The adjacency map holds V letters with up to E edges between them, plus the visited map and result list.',
      'O(V + E), which given the 26-letter alphabet is bounded by a constant — but write it as O(V + E) to show which sizes you counted.',
    ],
    gotcha:
      'Two traps. First, the graph is TINY (at most 26 nodes), so the bound is O(C) for reading the input, not the traversal. Second, the len(w1) > len(w2) prefix check must come before the character loop — abc after ab is invalid ordering, and the character loop alone never notices because it finds no differing character.',
  },
  'alien-dictionary:optimal': {
    time: [
      'C is the total number of characters across all words; V is the distinct letters, E the derived edges.',
      'Building adj and in_degree walks every character: O(C).',
      'Comparing adjacent word pairs to derive the edges costs at most min(len(w1), len(w2)) per pair, O(C) in total.',
      'Kahn traversal is O(V + E), with V at most 26 and E at most 676 — bounded constants.',
      'O(C).',
    ],
    space: [
      'The adjacency map, the in_degree map, the queue and the result, all over at most 26 letters and 676 edges.',
      'O(V + E), constant for a fixed alphabet.',
    ],
    gotcha:
      'The if w2[j] not in adj[w1[j]] guard is not a micro-optimisation. Without it a duplicate constraint increments in_degree twice, that letter never reaches 0, and the algorithm reports a cycle that does not exist. Same complexity, wrong answer.',
  },

  // ---- bounded-hop shortest paths ------------------------------------------------
  'cheapest-flights-k-stops:bfs-level-by-level': {
    time: [
      'V is the number of cities, E the number of flights, K the stop limit.',
      'Building the adjacency list is O(V + E).',
      'The outer while runs at most K + 1 times, one level per allowed hop.',
      'Within one level, an entry is only enqueued when it strictly improves best[v], so the edges scanned per level are bounded by E.',
      'K + 1 levels x O(E) edge scans multiplies: O(E x K).',
    ],
    space: [
      'The adjacency list is O(V + E), and the queue holds the current level, bounded by the entries pushed.',
      'O(V + E).',
    ],
    gotcha:
      'The best[v] pruning is what keeps this bounded — without it a city could be re-enqueued once per incoming path and the queue would grow exponentially. But note the pruning is also slightly wrong-shaped: a costlier path with fewer stops can be discarded, which is why the pure Bellman-Ford version with a per-round snapshot is the safer answer.',
  },
  'cheapest-flights-k-stops:optimal': {
    time: [
      'V is the number of cities, E the number of flights, K the stop limit.',
      'The outer loop runs exactly K + 1 rounds — one per allowed flight, since K stops means at most K + 1 edges.',
      'Each round copies the prices array, O(V), then relaxes every one of the E flights once, O(E).',
      'Rounds x work per round multiplies: O(K x (V + E)), written O(E x K) since E dominates V in any graph with flights.',
    ],
    space: [
      'Two arrays of length V: prices and the per-round temp copy.',
      'O(V). No adjacency list is built — the flight list is scanned directly.',
    ],
    gotcha:
      'The temp = prices[:] snapshot is the entire correctness argument. Relaxing into the live array would let one round chain two flights together, silently using more than K + 1 edges. Round i must read only distances that used at most i - 1 edges.',
  },

  // ---- minimising a maximum: two routes to the same bound ------------------------
  'path-with-minimum-effort:binary-search-bfs': {
    time: [
      'R is the number of rows, C the columns, so R x C cells. H is the largest height in the grid.',
      'Binary search runs over the candidate effort values 0..H, which is O(log H) iterations.',
      'Each iteration runs a fresh BFS with a new seen set: every cell is enqueued at most once with 4 constant-time neighbour checks, so O(R x C).',
      'Iterations x work per iteration: O(R x C x log H).',
    ],
    space: [
      'Per probe, the seen set and the queue each hold up to R x C cells.',
      'O(R x C).',
    ],
    gotcha:
      'The log factor is over the HEIGHT RANGE, not the cell count — so a 3x3 grid with heights up to a million costs more probes than a 1000x1000 grid with heights up to 10. Dijkstra pays log(R x C) instead, which is the same class in practice but bounded by the grid rather than the values.',
  },
  'path-with-minimum-effort:optimal': {
    time: [
      'R is the number of rows, C the columns, so R x C cells.',
      'A cell is pushed only when nxt improves effort[nr][nc], and each improvement is triggered by one of the 4 incoming neighbours, so pushes are O(R x C) after dropping the constant 4.',
      'Every push and pop is O(log(heap size)), and the heap holds O(R x C) entries: O(log(R x C)) each.',
      'O(R x C) heap operations x O(log(R x C)) each: O(R x C x log(R x C)).',
    ],
    space: [
      'The effort table is R x C, and the heap can hold up to O(R x C) stale-and-live entries.',
      'O(R x C).',
    ],
    gotcha:
      'This is Dijkstra with max instead of plus: nxt = max(e, diff) rather than e + diff. The greedy pop order stays valid because max is also monotonic — extending a path never lowers its effort — which is the only property Dijkstra actually requires.',
  },

  // ---- Kruskal, once vs once per edge -------------------------------------------
  'critical-pseudo-critical-edges:equal-weight-bridges': {
    time: [
      'V is the number of nodes, E the number of edges.',
      'Sorting the edge indices by weight is O(E log E).',
      'The outer while walks the sorted order once, splitting it into equal-weight groups — each edge belongs to exactly one group, so the group loops total O(E).',
      'Per group, Tarjan bridge-finding runs on a contracted graph whose edges are just that group: O(group size), and the group sizes sum to E.',
      'The finds and unions are O(alpha(V)) amortised each, O(E x alpha(V)) overall.',
      'O(E log E + E x alpha(V)), and since alpha is effectively constant the sort dominates: O(E log E).',
    ],
    space: [
      'The parent array is O(V); the per-group adjacency, disc, low and result structures are O(V + E) in the worst case.',
      'O(V + E).',
    ],
    gotcha:
      'This is the near-linear solution and it comes from one insight: within a single weight class, an edge is critical exactly when it is a BRIDGE of the contracted graph. That replaces re-running Kruskal per edge with one bridge pass per weight class.',
  },
  'critical-pseudo-critical-edges:optimal': {
    time: [
      'V is the number of nodes, E the number of edges.',
      'The edges are sorted once up front: O(E log E).',
      'One baseline mst() run sweeps all E sorted edges doing two finds each: O(E x alpha(V)).',
      'Then the loop runs over all E edges, and for each one calls mst() again — once with skip=j and possibly once with force=j.',
      'E outer iterations x an O(E x alpha(V)) full Kruskal sweep each multiplies: O(E squared x alpha(V)).',
      'That E squared term dominates the one-time O(E log E) sort.',
    ],
    space: [
      'The indexed edge list is O(E) and each mst() call allocates a fresh parent array of size V.',
      'O(V + E).',
    ],
    gotcha:
      'The cost is E squared because Kruskal is RE-RUN per edge, not because any single run is slow. Note also that the sort happens once, outside the loop — mst() reuses indexed, so the log factor is never multiplied in. Getting that right is the difference between O(E squared) and O(E squared log E).',
  },

  // ---- the output, not the graph, sets the bound --------------------------------
  'build-matrix-with-conditions:kahn-bfs-orderings': {
    time: [
      'k is the number of values to place, R the number of row conditions, C the number of column conditions.',
      'Each topo() call builds an adjacency list over k nodes from its condition list, then runs Kahn: O(k + R) for the rows and O(k + C) for the columns.',
      'Two sequential sorts add rather than multiply: O(k + R + C).',
      'Then allocating and filling the k x k answer matrix is O(k squared) — every cell must be written, most of them zero.',
      'O(k squared + R + C), with the k squared coming entirely from the output size.',
    ],
    space: [
      'The adjacency lists are O(R) and O(C), the indegree arrays and orders are O(k).',
      'The matrix itself is k x k.',
      'O(k squared + R + C).',
    ],
    gotcha:
      'The k squared is the ANSWER, not the algorithm. The graph work is genuinely linear at O(k + R + C) — you cannot do better than k squared overall because a k x k matrix has that many cells to hand back. Say which part of the bound is unavoidable output.',
  },
  'build-matrix-with-conditions:optimal': {
    time: [
      'k is the number of values, R the row conditions, C the column conditions.',
      'Each topo() builds adjacency from its conditions, O(R) or O(C), then DFS-visits each of the k nodes.',
      'The state array marks a node 2 when finished, so a repeat dfs returns in O(1) — at most k bodies execute and each walks its own edge list once.',
      'So the two topological sorts together are O(k + R + C).',
      'Filling the k x k output matrix is O(k squared), which dominates: O(k squared + R + C).',
    ],
    space: [
      'Adjacency O(R) and O(C), state and order arrays O(k), recursion depth up to k for a full chain.',
      'The output matrix is k x k, so O(k squared + R + C).',
    ],
    gotcha:
      'Same bound as Kahn, and the same reason: the k squared is the matrix you must return. The one real difference is space character — DFS adds an O(k) call stack that the BFS version spends on a queue instead.',
  },

  // ---- two separate costs, named separately -------------------------------------
  'gcd-traversal:sieve-grouping-dfs': {
    time: [
      'n is the length of nums and M is max(nums) + 1 — two independent sizes, and the answer needs both.',
      'The smallest-prime-factor sieve marks multiples of each prime up to M: O(M log log M). That is the sieve cost and it depends only on the VALUE range, not on n.',
      'Factorising is separate: with the spf table, each number is reduced by repeated division, and a number below M has at most log base 2 of M prime factors — so O(n x log M) for all n numbers.',
      'The traversal then walks index-to-prime and prime-to-index lists whose total size is the number of prime factors, O(n log M).',
      'Sequential phases add: O(M log log M + n x log M).',
    ],
    space: [
      'The spf array has one slot per value up to M: O(M).',
      'The two maps hold O(n log M) entries in total, and the seen set and stack are O(n).',
      'O(M + n).',
    ],
    gotcha:
      'The traversal as written is not actually linear: primeToIdx[f] is rescanned in full every time an index carrying prime f is popped, so if all n numbers share the factor 2 that inner loop runs n times over an n-element list — O(n squared). The standard fix is to clear primeToIdx[f] after using it once, since every index in it is now in the same component.',
  },
  'gcd-traversal:optimal': {
    time: [
      'n is the length of nums and max is the largest value in it. Two independent sizes.',
      'Factorising is the first cost: for each number, trial division runs d from 2 while d x d <= num, so O(sqrt(max)) per number and O(n x sqrt(max)) in total. No sieve is built.',
      'The union-find is the second, separate cost: each prime factor of each number triggers one union, so O(n log max) unions, each O(alpha(n)) amortised via path compression.',
      'The final all(find(i) == root) check is n more finds: O(n x alpha(n)).',
      'Adding the two phases: O(n x sqrt(max) + n x alpha(n)), and the sqrt(max) factorisation dominates.',
    ],
    space: [
      'The parent map holds one entry per index plus one per distinct prime seen: O(n + P) for P distinct primes.',
      'P is bounded by the number of primes below max, and by n log max in practice.',
      'O(n + P).',
    ],
    gotcha:
      'Two costs, and they must be named separately — the sqrt(max) trial division is about the VALUES and the alpha(n) union-find is about the COUNT. Whichever dominates depends on the input, and O(n x sqrt(max)) is the term that actually hurts: the sieve version trades O(M) space for a log-M factorisation instead.',
  },
};
