import { createConfig, graphsTemplate } from '../templates';

const t = graphsTemplate;

export const graphsConfigs = [
  createConfig(t, {
    algorithmId: 'number-of-islands',
    title: 'Number of Islands',
    subtitle: 'Count connected land regions',
    codeSnippet: `def numIslands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    visited = set()
    islands = 0
    def bfs(r, c):
        q = deque([(r, c)])
        visited.add((r, c))
        while q:
            row, col = q.popleft()
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = row+dr, col+dc
                if (0<=nr<rows and 0<=nc<cols and
                    grid[nr][nc]=='1' and (nr,nc) not in visited):
                    q.append((nr, nc))
                    visited.add((nr, nc))
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1' and (r,c) not in visited:
                bfs(r, c)
                islands += 1
    return islands`,
  }),
  createConfig(t, {
    algorithmId: 'max-area-of-island',
    title: 'Max Area of Island',
    subtitle: 'Find largest island area',
    codeSnippet: `def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    visited = set()
    def dfs(r, c):
        if (r < 0 or r >= rows or c < 0 or c >= cols or
            grid[r][c] == 0 or (r,c) in visited):
            return 0
        visited.add((r, c))
        return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1)
    return max((dfs(r,c) for r in range(rows) for c in range(cols)), default=0)`,
  }),
  createConfig(t, {
    algorithmId: 'clone-graph',
    title: 'Clone Graph',
    subtitle: 'Deep copy undirected graph',
    codeSnippet: `def cloneGraph(node):
    if not node: return None
    oldToNew = {}
    def dfs(node):
        if node in oldToNew:
            return oldToNew[node]
        copy = Node(node.val)
        oldToNew[node] = copy
        for nei in node.neighbors:
            copy.neighbors.append(dfs(nei))
        return copy
    return dfs(node)`,
  }),
  createConfig(t, {
    algorithmId: 'walls-and-gates',
    title: 'Walls and Gates',
    subtitle: 'Fill rooms with distance to nearest gate',
    codeSnippet: `def wallsAndGates(rooms):
    ROWS, COLS = len(rooms), len(rooms[0])
    visited = set()
    q = deque()
    for r in range(ROWS):
        for c in range(COLS):
            if rooms[r][c] == 0:
                q.append((r, c))
                visited.add((r, c))
    dist = 0
    while q:
        for _ in range(len(q)):
            r, c = q.popleft()
            rooms[r][c] = dist
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = r+dr, c+dc
                if (0<=nr<ROWS and 0<=nc<COLS and
                    (nr,nc) not in visited and rooms[nr][nc] != -1):
                    visited.add((nr, nc))
                    q.append((nr, nc))
        dist += 1`,
  }),
  createConfig(t, {
    algorithmId: 'rotting-oranges',
    title: 'Rotting Oranges',
    subtitle: 'Min time for all oranges to rot',
    codeSnippet: `def orangesRotting(grid):
    q = deque()
    fresh = 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == 2:
                q.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    time = 0
    while q and fresh > 0:
        for _ in range(len(q)):
            r, c = q.popleft()
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = r+dr, c+dc
                if 0<=nr<len(grid) and 0<=nc<len(grid[0]) and grid[nr][nc]==1:
                    grid[nr][nc] = 2
                    q.append((nr, nc))
                    fresh -= 1
        time += 1
    return time if fresh == 0 else -1`,
  }),
  createConfig(t, {
    algorithmId: 'pacific-atlantic-water-flow',
    title: 'Pacific Atlantic Water Flow',
    subtitle: 'Find cells that flow to both oceans',
    codeSnippet: `def pacificAtlantic(heights):
    ROWS, COLS = len(heights), len(heights[0])
    pac, atl = set(), set()
    def dfs(r, c, visit, prevHeight):
        if ((r,c) in visit or r<0 or c<0 or r==ROWS or c==COLS or
            heights[r][c] < prevHeight):
            return
        visit.add((r, c))
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            dfs(r+dr, c+dc, visit, heights[r][c])
    for c in range(COLS):
        dfs(0, c, pac, heights[0][c])
        dfs(ROWS-1, c, atl, heights[ROWS-1][c])
    for r in range(ROWS):
        dfs(r, 0, pac, heights[r][0])
        dfs(r, COLS-1, atl, heights[r][COLS-1])
    return list(pac & atl)`,
  }),
  createConfig(t, {
    algorithmId: 'surrounded-regions',
    title: 'Surrounded Regions',
    subtitle: 'Capture surrounded O regions',
    codeSnippet: `def solve(board):
    ROWS, COLS = len(board), len(board[0])
    def capture(r, c):
        if r<0 or c<0 or r==ROWS or c==COLS or board[r][c]!='O':
            return
        board[r][c] = 'T'
        capture(r+1,c); capture(r-1,c)
        capture(r,c+1); capture(r,c-1)
    for r in range(ROWS):
        for c in range(COLS):
            if board[r][c]=='O' and (r in [0,ROWS-1] or c in [0,COLS-1]):
                capture(r, c)
    for r in range(ROWS):
        for c in range(COLS):
            if board[r][c] == 'O': board[r][c] = 'X'
            elif board[r][c] == 'T': board[r][c] = 'O'`,
  }),
  createConfig(t, {
    algorithmId: 'course-schedule',
    title: 'Course Schedule',
    subtitle: 'Can finish all courses (cycle detection)',
    codeSnippet: `def canFinish(numCourses, prerequisites):
    preMap = {i: [] for i in range(numCourses)}
    for crs, pre in prerequisites:
        preMap[crs].append(pre)
    visited = set()
    def dfs(crs):
        if crs in visited:
            return False
        if preMap[crs] == []:
            return True
        visited.add(crs)
        for pre in preMap[crs]:
            if not dfs(pre):
                return False
        visited.remove(crs)
        preMap[crs] = []
        return True
    for c in range(numCourses):
        if not dfs(c):
            return False
    return True`,
  }),
  createConfig(t, {
    algorithmId: 'course-schedule-ii',
    title: 'Course Schedule II',
    subtitle: 'Topological sort of courses',
    codeSnippet: `def findOrder(numCourses, prerequisites):
    preMap = {i: [] for i in range(numCourses)}
    for crs, pre in prerequisites:
        preMap[crs].append(pre)
    output = []
    visited, cycle = set(), set()
    def dfs(crs):
        if crs in cycle: return False
        if crs in visited: return True
        cycle.add(crs)
        for pre in preMap[crs]:
            if not dfs(pre): return False
        cycle.remove(crs)
        visited.add(crs)
        output.append(crs)
        return True
    for c in range(numCourses):
        if not dfs(c): return []
    return output`,
  }),
  createConfig(t, {
    algorithmId: 'graph-valid-tree',
    title: 'Graph Valid Tree',
    subtitle: 'Check if undirected graph is tree',
    codeSnippet: `def validTree(n, edges):
    if len(edges) != n - 1:
        return False
    adj = {i: [] for i in range(n)}
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited = set()
    def dfs(node, parent):
        if node in visited:
            return False
        visited.add(node)
        for nei in adj[node]:
            if nei == parent: continue
            if not dfs(nei, node): return False
        return True
    return dfs(0, -1) and len(visited) == n`,
  }),
  createConfig(t, {
    algorithmId: 'connected-components',
    title: 'Number of Connected Components',
    subtitle: 'Count connected components in graph',
    codeSnippet: `def countComponents(n, edges):
    parent = list(range(n))
    rank = [1] * n
    def find(n):
        while n != parent[n]:
            parent[n] = parent[parent[n]]
            n = parent[n]
        return n
    def union(n1, n2):
        p1, p2 = find(n1), find(n2)
        if p1 == p2: return 0
        if rank[p1] > rank[p2]:
            parent[p2] = p1
            rank[p1] += rank[p2]
        else:
            parent[p1] = p2
            rank[p2] += rank[p1]
        return 1
    res = n
    for u, v in edges:
        res -= union(u, v)
    return res`,
  }),
  createConfig(t, {
    algorithmId: 'redundant-connection',
    title: 'Redundant Connection',
    subtitle: 'Find edge that makes cycle',
    codeSnippet: `def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))
    rank = [1] * (len(edges) + 1)
    def find(n):
        while n != parent[n]:
            parent[n] = parent[parent[n]]
            n = parent[n]
        return n
    def union(n1, n2):
        p1, p2 = find(n1), find(n2)
        if p1 == p2: return False
        if rank[p1] > rank[p2]:
            parent[p2] = p1
        else:
            parent[p1] = p2
            if rank[p1] == rank[p2]:
                rank[p2] += 1
        return True
    for u, v in edges:
        if not union(u, v):
            return [u, v]`,
  }),
  createConfig(t, {
    algorithmId: 'word-ladder',
    title: 'Word Ladder',
    subtitle: 'Shortest transformation sequence',
    codeSnippet: `def ladderLength(beginWord, endWord, wordList):
    if endWord not in wordList: return 0
    nei = defaultdict(list)
    wordList.append(beginWord)
    for word in wordList:
        for j in range(len(word)):
            pattern = word[:j] + '*' + word[j+1:]
            nei[pattern].append(word)
    visited = set([beginWord])
    q = deque([beginWord])
    res = 1
    while q:
        for _ in range(len(q)):
            word = q.popleft()
            if word == endWord: return res
            for j in range(len(word)):
                pattern = word[:j] + '*' + word[j+1:]
                for neiWord in nei[pattern]:
                    if neiWord not in visited:
                        visited.add(neiWord)
                        q.append(neiWord)
        res += 1
    return 0`,
  }),
];
