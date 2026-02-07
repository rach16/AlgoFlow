import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface TargetSumInput {
  nums: number[];
  target: number;
}

function runTargetSum(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as TargetSumInput;
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const totalSum = nums.reduce((a, b) => a + b, 0);

  steps.push({
    state: { nums: [...nums], result: null, target },
    highlights: [],
    message: `Find ways to assign +/- to [${nums.join(', ')}] to reach target ${target}`,
    codeLine: 1,
  });

  // Transform: sum of positives P, sum of negatives N
  // P - N = target, P + N = totalSum => P = (target + totalSum) / 2
  if ((target + totalSum) % 2 !== 0 || target + totalSum < 0) {
    steps.push({
      state: { nums: [...nums], result: 0, target },
      highlights: [],
      message: `(target + totalSum) = ${target + totalSum} is odd or negative. No valid assignment. Result: 0`,
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  const subsetTarget = (target + totalSum) / 2;

  steps.push({
    state: { nums: [...nums], result: null, target },
    highlights: [],
    message: `Transform to subset sum: find subsets summing to (${target} + ${totalSum}) / 2 = ${subsetTarget}`,
    codeLine: 3,
  });

  // dp2d[i][j] = number of ways to get sum j using first i numbers
  const dp2d: number[][] = Array.from({ length: n + 1 }, () => new Array(subsetTarget + 1).fill(0));
  dp2d[0][0] = 1;

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[0, 0]] as [number, number][],
      nums: [...nums], result: null, target,
    },
    highlights: [],
    message: `Base case: dp[0][0] = 1 (one way to make sum 0 with no elements)`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 1; i <= n; i++) {
    const num = nums[i - 1];

    steps.push({
      state: { dp2d: dp2d.map(r => [...r]), nums: [...nums], result: null, target },
      highlights: [i - 1],
      message: `Processing nums[${i - 1}] = ${num}`,
      codeLine: 6,
      action: 'visit',
    });

    for (let j = 0; j <= subsetTarget; j++) {
      // Don't include nums[i-1]
      dp2d[i][j] = dp2d[i - 1][j];

      if (j >= num) {
        dp2d[i][j] += dp2d[i - 1][j - num];

        if (dp2d[i - 1][j - num] > 0) {
          steps.push({
            state: {
              dp2d: dp2d.map(r => [...r]),
              matrixHighlights: [[i - 1, j], [i - 1, j - num]] as [number, number][],
              matrixSecondary: [[i, j]] as [number, number][],
              nums: [...nums], result: null, target,
            },
            highlights: [i - 1],
            message: `dp[${i}][${j}] = dp[${i - 1}][${j}] + dp[${i - 1}][${j}-${num}] = ${dp2d[i - 1][j]} + ${dp2d[i - 1][j - num]} = ${dp2d[i][j]}`,
            codeLine: 8,
            action: 'insert',
          });
        }
      } else if (dp2d[i][j] > 0) {
        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i, j]] as [number, number][],
            nums: [...nums], result: null, target,
          },
          highlights: [],
          message: `dp[${i}][${j}] = ${dp2d[i][j]} (coin ${num} > sum ${j}, carry forward)`,
          codeLine: 7,
          action: 'insert',
        });
      }
    }
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[n, subsetTarget]] as [number, number][],
      nums: [...nums], result: dp2d[n][subsetTarget], target,
    },
    highlights: [],
    message: `Number of ways to assign +/- to reach ${target}: ${dp2d[n][subsetTarget]}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const targetSum: Algorithm = {
  id: 'target-sum',
  name: 'Target Sum',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n·sum)',
  spaceComplexity: 'O(sum)',
  pattern: 'DP / 0-1 Knapsack — subset sum to (total + target) / 2',
  description:
    'You are given an integer array nums and an integer target. You want to build an expression out of nums by adding one of the symbols \'+\' and \'-\' before each integer in nums and then concatenate all the integers. Return the number of different expressions that you can build, which evaluates to target.',
  problemUrl: 'https://leetcode.com/problems/target-sum/',
  code: {
    python: `def findTargetSumWays(nums, target):
    total = sum(nums)
    if (target + total) % 2 or target + total < 0:
        return 0
    subsetSum = (target + total) // 2
    dp = [[0]*(subsetSum+1)
          for _ in range(len(nums)+1)]
    dp[0][0] = 1
    for i in range(1, len(nums)+1):
        for j in range(subsetSum+1):
            dp[i][j] = dp[i-1][j]
            if j >= nums[i-1]:
                dp[i][j] += dp[i-1][j-nums[i-1]]
    return dp[len(nums)][subsetSum]`,
    javascript: `function findTargetSumWays(nums, target) {
    const total = nums.reduce((a, b) => a + b, 0);
    if ((target + total) % 2 || target + total < 0)
        return 0;
    const subsetSum = (target + total) / 2;
    const dp = Array.from(
        {length: nums.length+1},
        () => new Array(subsetSum+1).fill(0));
    dp[0][0] = 1;
    for (let i = 1; i <= nums.length; i++) {
        for (let j = 0; j <= subsetSum; j++) {
            dp[i][j] = dp[i-1][j];
            if (j >= nums[i-1])
                dp[i][j] += dp[i-1][j-nums[i-1]];
        }
    }
    return dp[nums.length][subsetSum];
}`,
    java: `public int findTargetSumWays(int[] nums, int target) {
    int total = 0;
    for (int num : nums) total += num;
    if ((target + total) % 2 != 0 || target + total < 0) return 0;
    int subsetSum = (target + total) / 2;
    int[][] dp = new int[nums.length + 1][subsetSum + 1];
    dp[0][0] = 1;
    for (int i = 1; i <= nums.length; i++) {
        for (int j = 0; j <= subsetSum; j++) {
            dp[i][j] = dp[i - 1][j];
            if (j >= nums[i - 1]) {
                dp[i][j] += dp[i - 1][j - nums[i - 1]];
            }
        }
    }
    return dp[nums.length][subsetSum];
}`,
  },
  defaultInput: { nums: [1, 1, 1, 1, 1], target: 3 },
  run: runTargetSum,
};
