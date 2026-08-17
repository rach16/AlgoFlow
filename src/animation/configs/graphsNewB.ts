import { createConfig, graphsTemplate } from '../templates';

const t = graphsTemplate;

export const graphsNewBConfigs = [
  createConfig(t, {
    algorithmId: 'course-schedule-iv',
    title: 'Course Schedule IV',
    subtitle: 'Floyd-Warshall transitive closure of prerequisites',
    codeSnippet: `def checkIfPrerequisite(numCourses, prerequisites, queries):
    reach = [[False] * numCourses for _ in range(numCourses)]
    for a, b in prerequisites:
        reach[a][b] = True

    for k in range(numCourses):
        for i in range(numCourses):
            for j in range(numCourses):
                if reach[i][k] and reach[k][j]:
                    reach[i][j] = True

    return [reach[u][v] for u, v in queries]`,
  }),
  createConfig(t, {
    algorithmId: 'accounts-merge',
    title: 'Accounts Merge',
    subtitle: 'Union-Find over shared emails',
    codeSnippet: `def accountsMerge(accounts):
    parent = {}
    owner = {}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for name, *emails in accounts:
        for e in emails:
            parent.setdefault(e, e)
            owner[e] = name
        for e in emails[1:]:
            union(emails[0], e)

    groups = defaultdict(list)
    for e in parent:
        groups[find(e)].append(e)

    return [[owner[root]] + sorted(emails)
            for root, emails in groups.items()]`,
  }),
  createConfig(t, {
    algorithmId: 'evaluate-division',
    title: 'Evaluate Division',
    subtitle: 'Multiply edge ratios along a DFS path',
    codeSnippet: `def calcEquation(equations, values, queries):
    graph = defaultdict(dict)
    for (a, b), v in zip(equations, values):
        graph[a][b] = v
        graph[b][a] = 1 / v

    def dfs(src, dst, product, visited):
        if src not in graph or dst not in graph:
            return -1.0
        if src == dst:
            return product
        visited.add(src)
        for nei, w in graph[src].items():
            if nei not in visited:
                res = dfs(nei, dst, product * w, visited)
                if res != -1.0:
                    return res
        return -1.0

    return [dfs(a, b, 1.0, set()) for a, b in queries]`,
  }),
  createConfig(t, {
    algorithmId: 'minimum-height-trees',
    title: 'Minimum Height Trees',
    subtitle: 'Peel leaf layers inward to the centroids',
    codeSnippet: `def findMinHeightTrees(n, edges):
    if n == 1:
        return [0]
    adj = [set() for _ in range(n)]
    for a, b in edges:
        adj[a].add(b)
        adj[b].add(a)

    leaves = [i for i in range(n) if len(adj[i]) == 1]
    remaining = n
    while remaining > 2:
        remaining -= len(leaves)
        new_leaves = []
        for leaf in leaves:
            nei = adj[leaf].pop()
            adj[nei].remove(leaf)
            if len(adj[nei]) == 1:
                new_leaves.append(nei)
        leaves = new_leaves
    return leaves`,
  }),
];
