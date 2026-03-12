import { createConfig, advancedGraphsTemplate } from '../templates';

const t = advancedGraphsTemplate;

export const advancedGraphsConfigs = [
  createConfig(t, {
    algorithmId: 'reconstruct-itinerary',
    title: 'Reconstruct Itinerary',
    subtitle: 'Euler path from flight tickets',
    codeSnippet: `def findItinerary(tickets):
    adj = defaultdict(list)
    for src, dst in sorted(tickets, reverse=True):
        adj[src].append(dst)
    result = []
    def dfs(src):
        while adj[src]:
            dfs(adj[src].pop())
        result.append(src)
    dfs('JFK')
    return result[::-1]`,
  }),
  createConfig(t, {
    algorithmId: 'min-cost-connect-points',
    title: 'Min Cost to Connect All Points',
    subtitle: 'Minimum spanning tree (Prim\'s)',
    codeSnippet: `def minCostConnectPoints(points):
    N = len(points)
    adj = {i: [] for i in range(N)}
    for i in range(N):
        for j in range(i+1, N):
            dist = abs(points[i][0]-points[j][0]) + abs(points[i][1]-points[j][1])
            adj[i].append([dist, j])
            adj[j].append([dist, i])
    res = 0
    visited = set()
    minH = [[0, 0]]
    while len(visited) < N:
        cost, i = heapq.heappop(minH)
        if i in visited: continue
        res += cost
        visited.add(i)
        for neiCost, nei in adj[i]:
            if nei not in visited:
                heapq.heappush(minH, [neiCost, nei])
    return res`,
  }),
  createConfig(t, {
    algorithmId: 'network-delay-time',
    title: 'Network Delay Time',
    subtitle: 'Dijkstra\'s shortest path',
    codeSnippet: `def networkDelayTime(times, n, k):
    edges = defaultdict(list)
    for u, v, w in times:
        edges[u].append((v, w))
    minHeap = [(0, k)]
    visited = set()
    t = 0
    while minHeap:
        w1, n1 = heapq.heappop(minHeap)
        if n1 in visited: continue
        visited.add(n1)
        t = max(t, w1)
        for n2, w2 in edges[n1]:
            if n2 not in visited:
                heapq.heappush(minHeap, (w1 + w2, n2))
    return t if len(visited) == n else -1`,
  }),
  createConfig(t, {
    algorithmId: 'swim-in-rising-water',
    title: 'Swim in Rising Water',
    subtitle: 'Min time to swim from (0,0) to (n-1,n-1)',
    codeSnippet: `def swimInWater(grid):
    N = len(grid)
    visited = set([(0, 0)])
    minH = [(grid[0][0], 0, 0)]
    while minH:
        t, r, c = heapq.heappop(minH)
        if r == N-1 and c == N-1:
            return t
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r+dr, c+dc
            if 0<=nr<N and 0<=nc<N and (nr,nc) not in visited:
                visited.add((nr, nc))
                heapq.heappush(minH, (max(t, grid[nr][nc]), nr, nc))`,
  }),
  createConfig(t, {
    algorithmId: 'alien-dictionary',
    title: 'Alien Dictionary',
    subtitle: 'Topological sort of alien alphabet',
    codeSnippet: `def alienOrder(words):
    adj = {c: set() for w in words for c in w}
    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i+1]
        minLen = min(len(w1), len(w2))
        if len(w1) > len(w2) and w1[:minLen] == w2[:minLen]:
            return ""
        for j in range(minLen):
            if w1[j] != w2[j]:
                adj[w1[j]].add(w2[j])
                break
    visited = {}
    result = []
    def dfs(c):
        if c in visited:
            return visited[c]
        visited[c] = True
        for nei in adj[c]:
            if dfs(nei):
                return True
        visited[c] = False
        result.append(c)
    for c in adj:
        if dfs(c):
            return ""
    return "".join(result[::-1])`,
  }),
  createConfig(t, {
    algorithmId: 'cheapest-flights-k-stops',
    title: 'Cheapest Flights Within K Stops',
    subtitle: 'Bellman-Ford with k stops limit',
    codeSnippet: `def findCheapestPrice(n, flights, src, dst, k):
    prices = [float('inf')] * n
    prices[src] = 0
    for i in range(k + 1):
        tmpPrices = prices[:]
        for s, d, p in flights:
            if prices[s] == float('inf'):
                continue
            if prices[s] + p < tmpPrices[d]:
                tmpPrices[d] = prices[s] + p
        prices = tmpPrices
    return prices[dst] if prices[dst] != float('inf') else -1`,
  }),
];
