import { createConfig, dp2dTemplate } from '../templates';

const t = dp2dTemplate;

export const dp2dNewConfigs = [
  createConfig(t, {
    algorithmId: 'unique-paths-ii',
    title: 'Unique Paths II',
    subtitle: 'Count grid paths around obstacles',
    codeSnippet: `def uniquePathsWithObstacles(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = 1 if grid[0][0] == 0 else 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 1:
                dp[i][j] = 0
                continue
            if i > 0:
                dp[i][j] += dp[i-1][j]
            if j > 0:
                dp[i][j] += dp[i][j-1]
    return dp[m-1][n-1]`,
  }),
  createConfig(t, {
    algorithmId: 'minimum-path-sum',
    title: 'Minimum Path Sum',
    subtitle: 'Cheapest route through a cost grid',
    codeSnippet: `def minPathSum(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = grid[0][0]
    for j in range(1, n):
        dp[0][j] = dp[0][j-1] + grid[0][j]
    for i in range(1, m):
        dp[i][0] = dp[i-1][0] + grid[i][0]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
    return dp[m-1][n-1]`,
  }),
  createConfig(t, {
    algorithmId: 'last-stone-weight-ii',
    title: 'Last Stone Weight II',
    subtitle: 'Split stones into two nearly equal halves',
    codeSnippet: `def lastStoneWeightII(stones):
    total = sum(stones)
    half = total // 2
    dp = [[False] * (half + 1) for _ in range(len(stones) + 1)]
    dp[0][0] = True
    for i in range(1, len(stones) + 1):
        for j in range(half + 1):
            dp[i][j] = dp[i-1][j]
            if j >= stones[i-1] and dp[i-1][j - stones[i-1]]:
                dp[i][j] = True
    best = max(j for j in range(half + 1) if dp[len(stones)][j])
    return total - 2 * best`,
  }),
  createConfig(t, {
    algorithmId: 'stone-game',
    title: 'Stone Game',
    subtitle: 'Interval DP on the score difference',
    codeSnippet: `def stoneGame(piles):
    n = len(piles)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = piles[i]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = max(piles[i] - dp[i+1][j],
                           piles[j] - dp[i][j-1])
    return dp[0][n-1] > 0`,
  }),
  createConfig(t, {
    algorithmId: 'stone-game-ii',
    title: 'Stone Game II',
    subtitle: 'Memoized game search over (index, M)',
    codeSnippet: `def stoneGameII(piles):
    n = len(piles)
    suffix = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix[i] = suffix[i+1] + piles[i]
    memo = {}
    def dfs(i, m):
        if i >= n:
            return 0
        if i + 2 * m >= n:
            return suffix[i]
        if (i, m) in memo:
            return memo[(i, m)]
        best = 0
        for x in range(1, 2 * m + 1):
            best = max(best, suffix[i] - dfs(i + x, max(m, x)))
        memo[(i, m)] = best
        return best
    return dfs(0, 1)`,
  }),
];
