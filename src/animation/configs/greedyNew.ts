import { createConfig, greedyTemplate } from '../templates';

const t = greedyTemplate;

export const greedyNewConfigs = [
  createConfig(t, {
    algorithmId: 'lemonade-change',
    title: 'Lemonade Change',
    subtitle: 'Spend the least flexible bill first',
    codeSnippet: `def lemonadeChange(bills):
    five, ten = 0, 0
    for b in bills:
        if b == 5:
            five += 1
        elif b == 10:
            if five == 0:
                return False
            five -= 1
            ten += 1
        else:
            if ten > 0 and five > 0:
                ten -= 1
                five -= 1
            elif five >= 3:
                five -= 3
            else:
                return False
    return True`,
  }),
  createConfig(t, {
    algorithmId: 'max-sum-circular-subarray',
    title: 'Maximum Sum Circular Subarray',
    subtitle: 'Kadane for max and min, total minus min covers the wrap',
    codeSnippet: `def maxSubarraySumCircular(nums):
    total = 0
    curMax, maxSum = 0, nums[0]
    curMin, minSum = 0, nums[0]
    for n in nums:
        curMax = max(curMax + n, n)
        maxSum = max(maxSum, curMax)
        curMin = min(curMin + n, n)
        minSum = min(minSum, curMin)
        total += n
    if maxSum < 0:
        return maxSum
    return max(maxSum, total - minSum)`,
  }),
  createConfig(t, {
    algorithmId: 'longest-turbulent-subarray',
    title: 'Longest Turbulent Subarray',
    subtitle: 'Extend alternating up/down run lengths',
    codeSnippet: `def maxTurbulenceSize(arr):
    up, down = 1, 1
    result = 1
    for i in range(1, len(arr)):
        if arr[i] > arr[i - 1]:
            up = down + 1
            down = 1
        elif arr[i] < arr[i - 1]:
            down = up + 1
            up = 1
        else:
            up = down = 1
        result = max(result, up, down)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'jump-game-vii',
    title: 'Jump Game VII',
    subtitle: 'Sliding-window DP over a prefix count of reachable indices',
    codeSnippet: `def canReach(s, minJump, maxJump):
    n = len(s)
    dp = [False] * n
    dp[0] = True
    pre = 0
    for i in range(1, n):
        if i >= minJump:
            pre += dp[i - minJump]
        if i > maxJump:
            pre -= dp[i - maxJump - 1]
        dp[i] = pre > 0 and s[i] == '0'
    return dp[n - 1]`,
  }),
  createConfig(t, {
    algorithmId: 'dota2-senate',
    title: 'Dota2 Senate',
    subtitle: 'Round-robin queues: ban the nearest opponent',
    codeSnippet: `from collections import deque

def predictPartyVictory(senate):
    n = len(senate)
    radiant = deque()
    dire = deque()
    for i, c in enumerate(senate):
        if c == 'R':
            radiant.append(i)
        else:
            dire.append(i)
    while radiant and dire:
        r = radiant.popleft()
        d = dire.popleft()
        if r < d:
            radiant.append(r + n)
        else:
            dire.append(d + n)
    return "Radiant" if radiant else "Dire"`,
  }),
  createConfig(t, {
    algorithmId: 'candy',
    title: 'Candy',
    subtitle: 'Two passes, one per neighbour constraint',
    codeSnippet: `def candy(ratings):
    n = len(ratings)
    candies = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            candies[i] = candies[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            candies[i] = max(candies[i], candies[i + 1] + 1)
    return sum(candies)`,
  }),
];
