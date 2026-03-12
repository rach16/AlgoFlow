import { createConfig, dp1dTemplate } from '../templates';

const t = dp1dTemplate;

export const dp1dConfigs = [
  createConfig(t, {
    algorithmId: 'climbing-stairs',
    title: 'Climbing Stairs',
    subtitle: 'Count ways to climb n stairs',
    codeSnippet: `def climbStairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,
  }),
  createConfig(t, {
    algorithmId: 'min-cost-climbing-stairs',
    title: 'Min Cost Climbing Stairs',
    subtitle: 'Minimum cost to reach top',
    codeSnippet: `def minCostClimbingStairs(cost):
    for i in range(2, len(cost)):
        cost[i] += min(cost[i-1], cost[i-2])
    return min(cost[-1], cost[-2])`,
  }),
  createConfig(t, {
    algorithmId: 'house-robber',
    title: 'House Robber',
    subtitle: 'Max rob without adjacent houses',
    codeSnippet: `def rob(nums):
    rob1, rob2 = 0, 0
    for n in nums:
        temp = max(n + rob1, rob2)
        rob1 = rob2
        rob2 = temp
    return rob2`,
  }),
  createConfig(t, {
    algorithmId: 'house-robber-ii',
    title: 'House Robber II',
    subtitle: 'Circular house robber',
    codeSnippet: `def rob(nums):
    if len(nums) == 1:
        return nums[0]
    def helper(nums):
        rob1, rob2 = 0, 0
        for n in nums:
            temp = max(n + rob1, rob2)
            rob1 = rob2
            rob2 = temp
        return rob2
    return max(helper(nums[1:]), helper(nums[:-1]))`,
  }),
  createConfig(t, {
    algorithmId: 'longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    subtitle: 'Find longest palindrome in string',
    codeSnippet: `def longestPalindrome(s):
    result = ''
    for i in range(len(s)):
        for l, r in [(i, i), (i, i+1)]:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                if r - l + 1 > len(result):
                    result = s[l:r+1]
                l -= 1
                r += 1
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'palindromic-substrings',
    title: 'Palindromic Substrings',
    subtitle: 'Count all palindromic substrings',
    codeSnippet: `def countSubstrings(s):
    count = 0
    for i in range(len(s)):
        for l, r in [(i, i), (i, i+1)]:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                count += 1
                l -= 1
                r += 1
    return count`,
  }),
  createConfig(t, {
    algorithmId: 'decode-ways',
    title: 'Decode Ways',
    subtitle: 'Count decodings of digit string',
    codeSnippet: `def numDecodings(s):
    dp = {len(s): 1}
    for i in range(len(s) - 1, -1, -1):
        if s[i] == '0':
            dp[i] = 0
        else:
            dp[i] = dp[i + 1]
        if (i + 1 < len(s) and
            (s[i] == '1' or (s[i] == '2' and s[i+1] in '0123456'))):
            dp[i] += dp[i + 2]
    return dp[0]`,
  }),
  createConfig(t, {
    algorithmId: 'coin-change',
    title: 'Coin Change',
    subtitle: 'Fewest coins to make amount',
    codeSnippet: `def coinChange(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], 1 + dp[a - c])
    return dp[amount] if dp[amount] != amount + 1 else -1`,
  }),
  createConfig(t, {
    algorithmId: 'max-product-subarray',
    title: 'Maximum Product Subarray',
    subtitle: 'Max product of contiguous subarray',
    codeSnippet: `def maxProduct(nums):
    result = max(nums)
    curMin, curMax = 1, 1
    for n in nums:
        vals = (n, n * curMax, n * curMin)
        curMax, curMin = max(vals), min(vals)
        result = max(result, curMax)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'word-break',
    title: 'Word Break',
    subtitle: 'Can string be segmented into words',
    codeSnippet: `def wordBreak(s, wordDict):
    dp = [False] * (len(s) + 1)
    dp[len(s)] = True
    for i in range(len(s) - 1, -1, -1):
        for w in wordDict:
            if i + len(w) <= len(s) and s[i:i+len(w)] == w:
                dp[i] = dp[i + len(w)]
            if dp[i]:
                break
    return dp[0]`,
  }),
  createConfig(t, {
    algorithmId: 'longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence',
    subtitle: 'Find LIS length',
    codeSnippet: `def lengthOfLIS(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
  }),
  createConfig(t, {
    algorithmId: 'partition-equal-subset-sum',
    title: 'Partition Equal Subset Sum',
    subtitle: 'Can array be split into equal sums',
    codeSnippet: `def canPartition(nums):
    if sum(nums) % 2:
        return False
    target = sum(nums) // 2
    dp = set([0])
    for n in nums:
        newDp = set()
        for t in dp:
            newDp.add(t + n)
            newDp.add(t)
        dp = newDp
    return target in dp`,
  }),
];
