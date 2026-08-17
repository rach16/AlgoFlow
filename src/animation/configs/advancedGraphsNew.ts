import { createConfig, advancedGraphsTemplate } from '../templates';

const t = advancedGraphsTemplate;

export const advancedGraphsNewConfigs = [
  createConfig(t, {
    algorithmId: 'path-with-minimum-effort',
    title: 'Path With Minimum Effort',
    subtitle: 'Dijkstra where path cost is a max, not a sum',
    codeSnippet: `def minimumEffortPath(heights):
    rows, cols = len(heights), len(heights[0])
    effort = [[float('inf')] * cols for _ in range(rows)]
    effort[0][0] = 0
    heap = [(0, 0, 0)]

    while heap:
        e, r, c = heapq.heappop(heap)
        if (r, c) == (rows - 1, cols - 1):
            return e
        if e > effort[r][c]:
            continue
        for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                diff = abs(heights[nr][nc] - heights[r][c])
                nxt = max(e, diff)
                if nxt < effort[nr][nc]:
                    effort[nr][nc] = nxt
                    heapq.heappush(heap, (nxt, nr, nc))
    return 0`,
  }),
  createConfig(t, {
    algorithmId: 'critical-pseudo-critical-edges',
    title: 'Find Critical and Pseudo-Critical Edges in MST',
    subtitle: 'Kruskal baseline, then exclude and force each edge',
    codeSnippet: `def findCriticalAndPseudoCriticalEdges(n, edges):
    indexed = [(w, u, v, i) for i, (u, v, w) in enumerate(edges)]
    indexed.sort()

    def mst(skip=-1, force=-1):
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        total, used = 0, 0
        if force >= 0:
            w, u, v, _ = indexed[force]
            parent[find(u)] = find(v)
            total, used = w, 1
        for j, (w, u, v, _) in enumerate(indexed):
            if j == skip or j == force:
                continue
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[ru] = rv
                total += w
                used += 1
        return total if used == n - 1 else float('inf')

    base = mst()
    critical, pseudo = [], []
    for j in range(len(indexed)):
        if mst(skip=j) > base:
            critical.append(indexed[j][3])
        elif mst(force=j) == base:
            pseudo.append(indexed[j][3])
    return [critical, pseudo]`,
  }),
  createConfig(t, {
    algorithmId: 'build-matrix-with-conditions',
    title: 'Build a Matrix With Conditions',
    subtitle: 'Two independent topological sorts, then place each value',
    codeSnippet: `def buildMatrix(k, rowConditions, colConditions):
    def topo(conditions):
        adj = defaultdict(list)
        for a, b in conditions:
            adj[a].append(b)
        state = [0] * (k + 1)
        order = []

        def dfs(node):
            if state[node] == 1:
                return False
            if state[node] == 2:
                return True
            state[node] = 1
            for nxt in adj[node]:
                if not dfs(nxt):
                    return False
            state[node] = 2
            order.append(node)
            return True

        for node in range(1, k + 1):
            if not dfs(node):
                return []
        return order[::-1]

    rowOrder = topo(rowConditions)
    colOrder = topo(colConditions)
    if not rowOrder or not colOrder:
        return []

    pos = {v: i for i, v in enumerate(colOrder)}
    matrix = [[0] * k for _ in range(k)]
    for i, v in enumerate(rowOrder):
        matrix[i][pos[v]] = v
    return matrix`,
  }),
  createConfig(t, {
    algorithmId: 'gcd-traversal',
    title: 'Greatest Common Divisor Traversal',
    subtitle: 'Union each number with its prime factors',
    codeSnippet: `def canTraverseAllPairs(nums):
    if len(nums) == 1:
        return True
    if 1 in nums:
        return False

    parent = {}

    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    for i, num in enumerate(nums):
        d = 2
        while d * d <= num:
            if num % d == 0:
                union(i, ('p', d))
                while num % d == 0:
                    num //= d
            d += 1
        if num > 1:
            union(i, ('p', num))

    root = find(0)
    return all(find(i) == root for i in range(len(nums)))`,
  }),
];
