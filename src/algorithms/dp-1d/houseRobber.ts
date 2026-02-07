import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runHouseRobber(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({
      state: { nums: [], dp: [], result: 0 },
      highlights: [],
      message: 'Empty array, nothing to rob. Result: 0',
      codeLine: 1,
    });
    return steps;
  }

  const dp: (number | null)[] = new Array(n).fill(null);
  const dpLabels = Array.from({ length: n }, (_, i) => `${i}`);

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
    highlights: [],
    message: `Find max amount robbing houses with values [${nums.join(', ')}] (cannot rob adjacent)`,
    codeLine: 1,
  });

  dp[0] = nums[0];
  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [0], result: null },
    highlights: [0],
    message: `Base case: dp[0] = nums[0] = ${nums[0]} (rob first house)`,
    codeLine: 3,
    action: 'insert',
  });

  if (n >= 2) {
    dp[1] = Math.max(nums[0], nums[1]);
    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [1], result: null },
      highlights: [0, 1],
      message: `Base case: dp[1] = max(nums[0], nums[1]) = max(${nums[0]}, ${nums[1]}) = ${dp[1]}`,
      codeLine: 4,
      action: 'insert',
    });
  }

  for (let i = 2; i < n; i++) {
    const robCurrent = (dp[i - 2] as number) + nums[i];
    const skipCurrent = dp[i - 1] as number;

    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i - 2, i - 1], dpSecondary: [i], result: null },
      highlights: [i],
      message: `dp[${i}] = max(dp[${i - 1}], dp[${i - 2}] + nums[${i}]) = max(${skipCurrent}, ${dp[i - 2]} + ${nums[i]}) = max(${skipCurrent}, ${robCurrent})`,
      codeLine: 6,
      action: 'compare',
    });

    dp[i] = Math.max(robCurrent, skipCurrent);

    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], result: null },
      highlights: [i],
      message: `dp[${i}] = ${dp[i]}${dp[i] === robCurrent ? ' (rob this house)' : ' (skip this house)'}`,
      codeLine: 6,
      action: 'insert',
    });
  }

  const result = dp[n - 1];
  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [n - 1], result },
    highlights: [n - 1],
    message: `Maximum amount that can be robbed: ${result}`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const houseRobber: Algorithm = {
  id: 'house-robber',
  name: 'House Robber',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'DP — rob or skip: dp[i] = max(dp[i-1], dp[i-2] + nums[i])',
  description:
    'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems connected, so if two adjacent houses were broken into on the same night, it will alert the police. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.',
  problemUrl: 'https://leetcode.com/problems/house-robber/',
  code: {
    python: `def rob(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
    for i in range(2, len(nums)):
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    return dp[-1]`,
    javascript: `function rob(nums) {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    const dp = new Array(nums.length).fill(0);
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    for (let i = 2; i < nums.length; i++) {
        dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i]);
    }
    return dp[nums.length - 1];
}`,
    java: `public int rob(int[] nums) {
    if (nums.length == 0) return 0;
    if (nums.length == 1) return nums[0];
    int[] dp = new int[nums.length];
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    for (int i = 2; i < nums.length; i++) {
        dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i]);
    }
    return dp[nums.length - 1];
}`,
  },
  defaultInput: [1, 2, 3, 1],
  run: runHouseRobber,
};
