import { createConfig, backtrackingTemplate } from '../templates';

const t = backtrackingTemplate;

export const backtrackingNewConfigs = [
  createConfig(t, {
    algorithmId: 'subset-xor-total',
    title: 'Sum of All Subset XOR Totals',
    subtitle: 'Include or exclude, XOR down every branch',
    codeSnippet: `def subsetXORSum(nums):
    total = 0

    def backtrack(i, current_xor):
        nonlocal total
        if i == len(nums):
            total += current_xor
            return

        # Include nums[i] in the subset
        backtrack(i + 1, current_xor ^ nums[i])
        # Exclude nums[i] from the subset
        backtrack(i + 1, current_xor)

    backtrack(0, 0)
    return total`,
  }),
  createConfig(t, {
    algorithmId: 'combinations',
    title: 'Combinations',
    subtitle: 'Start index keeps every path increasing',
    codeSnippet: `def combine(n, k):
    result = []

    def backtrack(start, current):
        if len(current) == k:
            result.append(current[:])
            return

        for i in range(start, n + 1):
            current.append(i)
            backtrack(i + 1, current)
            current.pop()

    backtrack(1, [])
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'permutations-ii',
    title: 'Permutations II',
    subtitle: 'Sort, then skip a duplicate whose twin is free',
    codeSnippet: `def permuteUnique(nums):
    nums.sort()
    result = []
    used = [False] * len(nums)

    def backtrack(current):
        if len(current) == len(nums):
            result.append(current[:])
            return

        for i in range(len(nums)):
            if used[i]:
                continue
            # Skip a duplicate whose twin is still unused
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue

            used[i] = True
            current.append(nums[i])
            backtrack(current)
            current.pop()
            used[i] = False

    backtrack([])
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'n-queens-ii',
    title: 'N-Queens II',
    subtitle: 'Three bitmasks count the safe placements',
    codeSnippet: `def totalNQueens(n):
    count = 0

    def backtrack(row, cols, diag1, diag2):
        nonlocal count
        if row == n:
            count += 1
            return

        # A 1 bit in free marks a safe column
        free = ~(cols | diag1 | diag2) & ((1 << n) - 1)
        while free:
            bit = free & -free
            free -= bit
            backtrack(row + 1, cols | bit,
                      (diag1 | bit) << 1, (diag2 | bit) >> 1)

    backtrack(0, 0, 0, 0)
    return count`,
  }),
  createConfig(t, {
    algorithmId: 'matchsticks-to-square',
    title: 'Matchsticks to Square',
    subtitle: 'Four buckets, sorted descending, symmetry pruned',
    codeSnippet: `def makesquare(matchsticks):
    total = sum(matchsticks)
    if total % 4 != 0:
        return False

    side = total // 4
    matchsticks.sort(reverse=True)
    if matchsticks[0] > side:
        return False

    sides = [0] * 4

    def backtrack(i):
        if i == len(matchsticks):
            return True

        for j in range(4):
            if sides[j] + matchsticks[i] > side:
                continue
            # Equal sides are interchangeable
            if j > 0 and sides[j] == sides[j - 1]:
                continue

            sides[j] += matchsticks[i]
            if backtrack(i + 1):
                return True
            sides[j] -= matchsticks[i]

        return False

    return backtrack(0)`,
  }),
  createConfig(t, {
    algorithmId: 'partition-k-equal-subsets',
    title: 'Partition to K Equal Sum Subsets',
    subtitle: 'Fill one bucket to the target before opening the next',
    codeSnippet: `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k != 0:
        return False

    target = total // k
    nums.sort(reverse=True)
    if nums[0] > target:
        return False

    used = [False] * len(nums)

    def backtrack(bucket, start, current):
        if bucket == 0:
            return True
        if current == target:
            # Bucket closed, open the next one
            return backtrack(bucket - 1, 0, 0)

        for i in range(start, len(nums)):
            if used[i] or current + nums[i] > target:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue

            used[i] = True
            if backtrack(bucket, i + 1, current + nums[i]):
                return True
            used[i] = False

        return False

    return backtrack(k, 0, 0)`,
  }),
  createConfig(t, {
    algorithmId: 'word-break-ii',
    title: 'Word Break II',
    subtitle: 'Memoize each suffix so it is segmented once',
    codeSnippet: `def wordBreak(s, wordDict):
    words = set(wordDict)
    memo = {}

    def backtrack(start):
        if start == len(s):
            return [""]
        if start in memo:
            return memo[start]

        sentences = []
        for end in range(start + 1, len(s) + 1):
            word = s[start:end]
            if word not in words:
                continue
            for rest in backtrack(end):
                sentences.append(word if not rest
                                 else word + " " + rest)

        memo[start] = sentences
        return sentences

    return backtrack(0)`,
  }),
];
