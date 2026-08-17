import { createConfig, dp1dTemplate } from '../templates';

const t = dp1dTemplate;

export const dp1dNewConfigs = [
  createConfig(t, {
    algorithmId: 'tribonacci',
    title: 'N-th Tribonacci Number',
    subtitle: 'Three rolling variables, O(1) space',
    codeSnippet: `def tribonacci(n):
    if n == 0:
        return 0
    if n < 3:
        return 1
    a, b, c = 0, 1, 1
    for i in range(3, n + 1):
        a, b, c = b, c, a + b + c
    return c`,
  }),
  createConfig(t, {
    algorithmId: 'combination-sum-iv',
    title: 'Combination Sum IV',
    subtitle: 'Count ordered combinations, totals loop outside',
    codeSnippet: `def combinationSum4(nums, target):
    dp = [0] * (target + 1)
    dp[0] = 1
    for total in range(1, target + 1):
        for num in nums:
            if num <= total:
                dp[total] += dp[total - num]
    return dp[target]`,
  }),
  createConfig(t, {
    algorithmId: 'perfect-squares',
    title: 'Perfect Squares',
    subtitle: 'Fewest squares summing to n',
    codeSnippet: `def numSquares(n):
    dp = [float('inf')] * (n + 1)
    dp[0] = 0
    for target in range(1, n + 1):
        s = 1
        while s * s <= target:
            dp[target] = min(dp[target], dp[target - s*s] + 1)
            s += 1
    return dp[n]`,
  }),
  createConfig(t, {
    algorithmId: 'integer-break',
    title: 'Integer Break',
    subtitle: 'Maximize the product of the parts',
    codeSnippet: `def integerBreak(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        for j in range(1, i):
            dp[i] = max(dp[i], j * (i - j), j * dp[i - j])
    return dp[n]`,
  }),
  createConfig(t, {
    algorithmId: 'stone-game-iii',
    title: 'Stone Game III',
    subtitle: 'Suffix DP on the score difference',
    codeSnippet: `def stoneGameIII(stoneValue):
    n = len(stoneValue)
    dp = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        dp[i] = float('-inf')
        take = 0
        for k in range(3):
            if i + k < n:
                take += stoneValue[i + k]
                dp[i] = max(dp[i], take - dp[i + k + 1])
    if dp[0] > 0:
        return "Alice"
    if dp[0] < 0:
        return "Bob"
    return "Tie"`,
  }),
];
