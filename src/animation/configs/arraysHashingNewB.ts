import { createConfig, arraysHashingTemplate } from '../templates';

const t = arraysHashingTemplate;

export const arraysHashingNewBConfigs = [
  createConfig(t, {
    algorithmId: 'sort-an-array',
    title: 'Sort an Array',
    subtitle: 'Divide, sort each half, merge back',
    codeSnippet: `def sortArray(nums):
    def merge_sort(lo, hi):
        if lo >= hi:
            return
        mid = (lo + hi) // 2
        merge_sort(lo, mid)
        merge_sort(mid + 1, hi)
        merged = []
        i, j = lo, mid + 1
        while i <= mid and j <= hi:
            if nums[i] <= nums[j]:
                merged.append(nums[i])
                i += 1
            else:
                merged.append(nums[j])
                j += 1
        while i <= mid:
            merged.append(nums[i])
            i += 1
        while j <= hi:
            merged.append(nums[j])
            j += 1
        nums[lo:hi + 1] = merged
    merge_sort(0, len(nums) - 1)
    return nums`,
  }),
  createConfig(t, {
    algorithmId: 'range-sum-query-2d',
    title: 'Range Sum Query 2D - Immutable',
    subtitle: '2D prefix sums answer any rectangle in O(1)',
    codeSnippet: `class NumMatrix:
    def __init__(self, matrix):
        m, n = len(matrix), len(matrix[0])
        self.prefix = [[0] * (n + 1) for _ in range(m + 1)]
        for r in range(m):
            for c in range(n):
                self.prefix[r + 1][c + 1] = (matrix[r][c]
                    + self.prefix[r][c + 1]
                    + self.prefix[r + 1][c]
                    - self.prefix[r][c])

    def sumRegion(self, row1, col1, row2, col2):
        p = self.prefix
        return (p[row2 + 1][col2 + 1] - p[row1][col2 + 1]
                - p[row2 + 1][col1] + p[row1][col1])`,
  }),
  createConfig(t, {
    algorithmId: 'buy-sell-stock-ii',
    title: 'Best Time to Buy And Sell Stock II',
    subtitle: 'Greedily bank every upward price move',
    codeSnippet: `def maxProfit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit`,
  }),
  createConfig(t, {
    algorithmId: 'majority-element-ii',
    title: 'Majority Element II',
    subtitle: 'Boyer-Moore voting with two candidates',
    codeSnippet: `def majorityElement(nums):
    cand1, cand2 = None, None
    count1, count2 = 0, 0
    for num in nums:
        if num == cand1:
            count1 += 1
        elif num == cand2:
            count2 += 1
        elif count1 == 0:
            cand1, count1 = num, 1
        elif count2 == 0:
            cand2, count2 = num, 1
        else:
            count1 -= 1
            count2 -= 1
    res = []
    for c in (cand1, cand2):
        if c is not None and nums.count(c) > len(nums) // 3:
            res.append(c)
    return res`,
  }),
  createConfig(t, {
    algorithmId: 'subarray-sum-equals-k',
    title: 'Subarray Sum Equals K',
    subtitle: 'Count earlier prefix sums in a hash map',
    codeSnippet: `def subarraySum(nums, k):
    prefix_count = {0: 1}
    total = 0
    running = 0
    for num in nums:
        running += num
        total += prefix_count.get(running - k, 0)
        prefix_count[running] = prefix_count.get(running, 0) + 1
    return total`,
  }),
  createConfig(t, {
    algorithmId: 'first-missing-positive',
    title: 'First Missing Positive',
    subtitle: 'Cyclic sort turns the array into its own hash table',
    codeSnippet: `def firstMissingPositive(nums):
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`,
  }),
];
