import { createConfig, dp2dTemplate } from '../templates';

const t = dp2dTemplate;

export const dp2dConfigs = [
  createConfig(t, {
    algorithmId: 'unique-paths',
    title: 'Unique Paths',
    subtitle: 'Count paths in grid',
    codeSnippet: `def uniquePaths(m, n):
    row = [1] * n
    for i in range(m - 1):
        newRow = [1] * n
        for j in range(n - 2, -1, -1):
            newRow[j] = newRow[j+1] + row[j]
        row = newRow
    return row[0]`,
  }),
  createConfig(t, {
    algorithmId: 'longest-common-subsequence',
    title: 'Longest Common Subsequence',
    subtitle: 'Find LCS of two strings',
    codeSnippet: `def longestCommonSubsequence(text1, text2):
    dp = [[0] * (len(text2)+1) for _ in range(len(text1)+1)]
    for i in range(len(text1)-1, -1, -1):
        for j in range(len(text2)-1, -1, -1):
            if text1[i] == text2[j]:
                dp[i][j] = 1 + dp[i+1][j+1]
            else:
                dp[i][j] = max(dp[i+1][j], dp[i][j+1])
    return dp[0][0]`,
  }),
  createConfig(t, {
    algorithmId: 'buy-sell-stock-cooldown',
    title: 'Best Time to Buy/Sell Stock with Cooldown',
    subtitle: 'Max profit with cooldown period',
    codeSnippet: `def maxProfit(prices):
    dp = {}
    def dfs(i, buying):
        if i >= len(prices):
            return 0
        if (i, buying) in dp:
            return dp[(i, buying)]
        if buying:
            buy = dfs(i+1, False) - prices[i]
            cooldown = dfs(i+1, True)
            dp[(i, buying)] = max(buy, cooldown)
        else:
            sell = dfs(i+2, True) + prices[i]
            cooldown = dfs(i+1, False)
            dp[(i, buying)] = max(sell, cooldown)
        return dp[(i, buying)]
    return dfs(0, True)`,
  }),
  createConfig(t, {
    algorithmId: 'coin-change-ii',
    title: 'Coin Change II',
    subtitle: 'Count ways to make amount',
    codeSnippet: `def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]`,
  }),
  createConfig(t, {
    algorithmId: 'target-sum',
    title: 'Target Sum',
    subtitle: 'Count ways to reach target with +/-',
    codeSnippet: `def findTargetSumWays(nums, target):
    dp = {0: 1}
    for n in nums:
        newDp = {}
        for s, count in dp.items():
            newDp[s + n] = newDp.get(s + n, 0) + count
            newDp[s - n] = newDp.get(s - n, 0) + count
        dp = newDp
    return dp.get(target, 0)`,
  }),
  createConfig(t, {
    algorithmId: 'interleaving-string',
    title: 'Interleaving String',
    subtitle: 'Check if s3 is interleave of s1, s2',
    codeSnippet: `def isInterleave(s1, s2, s3):
    if len(s1) + len(s2) != len(s3):
        return False
    dp = [[False]*(len(s2)+1) for _ in range(len(s1)+1)]
    dp[len(s1)][len(s2)] = True
    for i in range(len(s1), -1, -1):
        for j in range(len(s2), -1, -1):
            if i < len(s1) and s1[i] == s3[i+j] and dp[i+1][j]:
                dp[i][j] = True
            if j < len(s2) and s2[j] == s3[i+j] and dp[i][j+1]:
                dp[i][j] = True
    return dp[0][0]`,
  }),
  createConfig(t, {
    algorithmId: 'longest-increasing-path-matrix',
    title: 'Longest Increasing Path in Matrix',
    subtitle: 'DFS + memoization on matrix',
    codeSnippet: `def longestIncreasingPath(matrix):
    ROWS, COLS = len(matrix), len(matrix[0])
    dp = {}
    def dfs(r, c, prevVal):
        if (r < 0 or r == ROWS or c < 0 or c == COLS or
            matrix[r][c] <= prevVal):
            return 0
        if (r, c) in dp:
            return dp[(r, c)]
        res = 1
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            res = max(res, 1 + dfs(r+dr, c+dc, matrix[r][c]))
        dp[(r, c)] = res
        return res
    return max(dfs(r,c,-1) for r in range(ROWS) for c in range(COLS))`,
  }),
  createConfig(t, {
    algorithmId: 'distinct-subsequences',
    title: 'Distinct Subsequences',
    subtitle: 'Count subsequences of s matching t',
    codeSnippet: `def numDistinct(s, t):
    dp = {}
    def dfs(i, j):
        if j == len(t): return 1
        if i == len(s): return 0
        if (i, j) in dp: return dp[(i, j)]
        dp[(i, j)] = dfs(i+1, j)
        if s[i] == t[j]:
            dp[(i, j)] += dfs(i+1, j+1)
        return dp[(i, j)]
    return dfs(0, 0)`,
  }),
  createConfig(t, {
    algorithmId: 'edit-distance',
    title: 'Edit Distance',
    subtitle: 'Min operations to convert word1 to word2',
    codeSnippet: `def minDistance(word1, word2):
    dp = [[0]*(len(word2)+1) for _ in range(len(word1)+1)]
    for i in range(len(word1)+1):
        dp[i][len(word2)] = len(word1) - i
    for j in range(len(word2)+1):
        dp[len(word1)][j] = len(word2) - j
    for i in range(len(word1)-1, -1, -1):
        for j in range(len(word2)-1, -1, -1):
            if word1[i] == word2[j]:
                dp[i][j] = dp[i+1][j+1]
            else:
                dp[i][j] = 1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])
    return dp[0][0]`,
  }),
  createConfig(t, {
    algorithmId: 'burst-balloons',
    title: 'Burst Balloons',
    subtitle: 'Max coins from bursting balloons',
    codeSnippet: `def maxCoins(nums):
    nums = [1] + nums + [1]
    dp = {}
    def dfs(l, r):
        if l > r: return 0
        if (l, r) in dp: return dp[(l, r)]
        dp[(l, r)] = 0
        for i in range(l, r + 1):
            coins = nums[l-1] * nums[i] * nums[r+1]
            coins += dfs(l, i-1) + dfs(i+1, r)
            dp[(l, r)] = max(dp[(l, r)], coins)
        return dp[(l, r)]
    return dfs(1, len(nums) - 2)`,
  }),
  createConfig(t, {
    algorithmId: 'regex-matching',
    title: 'Regular Expression Matching',
    subtitle: 'Match string with . and * patterns',
    codeSnippet: `def isMatch(s, p):
    dp = {}
    def dfs(i, j):
        if (i, j) in dp: return dp[(i, j)]
        if j == len(p): return i == len(s)
        match = i < len(s) and (s[i] == p[j] or p[j] == '.')
        if j + 1 < len(p) and p[j+1] == '*':
            dp[(i,j)] = dfs(i, j+2) or (match and dfs(i+1, j))
        else:
            dp[(i,j)] = match and dfs(i+1, j+1)
        return dp[(i, j)]
    return dfs(0, 0)`,
  }),
];
