import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPartitionEqualSubsetSum(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  const totalSum = nums.reduce((a, b) => a + b, 0);

  steps.push({
    state: { nums: [...nums], result: null },
    highlights: [],
    message: `Can [${nums.join(', ')}] be partitioned into two subsets with equal sum? Total sum = ${totalSum}`,
    codeLine: 1,
  });

  if (totalSum % 2 !== 0) {
    steps.push({
      state: { nums: [...nums], result: false },
      highlights: [],
      message: `Sum ${totalSum} is odd, cannot partition equally. Result: false`,
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  const target = totalSum / 2;

  steps.push({
    state: { nums: [...nums], result: null },
    highlights: [],
    message: `Need to find a subset that sums to ${target} (half of ${totalSum})`,
    codeLine: 3,
  });

  // dp[j] = can we make sum j?
  const dp: (string | null)[] = new Array(target + 1).fill(null);
  const dpLabels = Array.from({ length: target + 1 }, (_, i) => `${i}`);

  dp[0] = 'T';
  for (let i = 1; i <= target; i++) dp[i] = 'F';

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [0], result: null },
    highlights: [],
    message: `Initialize: dp[0] = true (empty subset sums to 0), rest false`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 0; i < n; i++) {
    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
      highlights: [i],
      pointers: { num: i },
      message: `Processing nums[${i}] = ${nums[i]}`,
      codeLine: 6,
      action: 'visit',
    });

    // Iterate backwards to avoid using same element twice
    for (let j = target; j >= nums[i]; j--) {
      if (dp[j - nums[i]] === 'T' && dp[j] === 'F') {
        steps.push({
          state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [j - nums[i]], dpSecondary: [j], result: null },
          highlights: [i],
          pointers: { num: i, sum: j },
          message: `dp[${j}] = dp[${j}] || dp[${j} - ${nums[i]}] = dp[${j}] || dp[${j - nums[i]}] = F || T = T`,
          codeLine: 8,
          action: 'compare',
        });

        dp[j] = 'T';

        steps.push({
          state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [j], result: null },
          highlights: [i],
          pointers: { num: i, sum: j },
          message: `dp[${j}] = true (can make sum ${j} by including ${nums[i]})`,
          codeLine: 8,
          action: 'insert',
        });

        if (j === target) {
          steps.push({
            state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [target], result: true },
            highlights: [],
            message: `Found! dp[${target}] = true. Can partition into two equal subsets.`,
            codeLine: 10,
            action: 'found',
          });
          return steps;
        }
      }
    }
  }

  const result = dp[target] === 'T';
  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [target], result },
    highlights: [],
    message: `dp[${target}] = ${dp[target]}. ${result ? 'Can' : 'Cannot'} partition into two equal subsets.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const partitionEqualSubsetSum: Algorithm = {
  id: 'partition-equal-subset-sum',
  name: 'Partition Equal Subset Sum',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n·sum)',
  spaceComplexity: 'O(sum)',
  pattern: 'DP / 0-1 Knapsack — can subset sum to total/2?',
  description:
    'Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal.',
  problemUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/',
  code: {
    python: `def canPartition(nums):
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for num in nums:
        for j in range(target, num - 1, -1):
            dp[j] = dp[j] or dp[j - num]
    return dp[target]`,
    javascript: `function canPartition(nums) {
    const total = nums.reduce((a, b) => a + b, 0);
    if (total % 2 !== 0) return false;
    const target = total / 2;
    const dp = new Array(target + 1).fill(false);
    dp[0] = true;
    for (const num of nums) {
        for (let j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }
    return dp[target];
}`,
  },
  defaultInput: [1, 5, 11, 5],
  run: runPartitionEqualSubsetSum,
};
