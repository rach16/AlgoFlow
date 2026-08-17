import { createConfig, graphsTemplate } from '../templates';

const t = graphsTemplate;

export const graphsNewAConfigs = [
  createConfig(t, {
    algorithmId: 'island-perimeter',
    title: 'Island Perimeter',
    subtitle: 'Four sides per land cell, minus two per shared edge',
    codeSnippet: `def islandPerimeter(grid):
    rows, cols = len(grid), len(grid[0])
    perimeter = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                perimeter += 4
                if r > 0 and grid[r - 1][c] == 1:
                    perimeter -= 2
                if c > 0 and grid[r][c - 1] == 1:
                    perimeter -= 2
    return perimeter`,
  }),
  createConfig(t, {
    algorithmId: 'verifying-alien-dictionary',
    title: 'Verifying an Alien Dictionary',
    subtitle: 'Rank letters by alien order, then compare adjacent words',
    codeSnippet: `def isAlienSorted(words, order):
    index = {c: i for i, c in enumerate(order)}
    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        for j in range(len(w1)):
            if j == len(w2):
                return False
            if w1[j] != w2[j]:
                if index[w1[j]] > index[w2[j]]:
                    return False
                break
    return True`,
  }),
  createConfig(t, {
    algorithmId: 'find-town-judge',
    title: 'Find the Town Judge',
    subtitle: 'One signed score per person: only the judge nets n-1',
    codeSnippet: `def findJudge(n, trust):
    score = [0] * (n + 1)
    for a, b in trust:
        score[a] -= 1
        score[b] += 1
    for i in range(1, n + 1):
        if score[i] == n - 1:
            return i
    return -1`,
  }),
  createConfig(t, {
    algorithmId: 'open-the-lock',
    title: 'Open the Lock',
    subtitle: 'BFS over wheel states, skipping deadends',
    codeSnippet: `def openLock(deadends, target):
    dead = set(deadends)
    if "0000" in dead:
        return -1
    if target == "0000":
        return 0
    queue = deque(["0000"])
    seen = {"0000"}
    turns = 0
    while queue:
        turns += 1
        for _ in range(len(queue)):
            combo = queue.popleft()
            for i in range(4):
                d = int(combo[i])
                for nd in ((d + 1) % 10, (d - 1) % 10):
                    nxt = combo[:i] + str(nd) + combo[i+1:]
                    if nxt in seen or nxt in dead:
                        continue
                    if nxt == target:
                        return turns
                    seen.add(nxt)
                    queue.append(nxt)
    return -1`,
  }),
];
