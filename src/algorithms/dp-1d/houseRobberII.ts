import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function robRange(nums: number[], start: number, end: number, steps: AlgorithmStep[], label: string): number {
  const len = end - start + 1;
  if (len === 0) return 0;
  if (len === 1) return nums[start];

  const dp: (number | null)[] = new Array(len).fill(null);
  const dpLabels = Array.from({ length: len }, (_, i) => `${start + i}`);

  dp[0] = nums[start];
  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [0], result: null, phase: label },
    highlights: [start],
    message: `[${label}] Base case: dp[0] = nums[${start}] = ${nums[start]}`,
    codeLine: 5,
    action: 'insert',
  });

  if (len >= 2) {
    dp[1] = Math.max(nums[start], nums[start + 1]);
    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [1], result: null, phase: label },
      highlights: [start, start + 1],
      message: `[${label}] Base case: dp[1] = max(${nums[start]}, ${nums[start + 1]}) = ${dp[1]}`,
      codeLine: 6,
      action: 'insert',
    });
  }

  for (let i = 2; i < len; i++) {
    const robCurrent = (dp[i - 2] as number) + nums[start + i];
    const skipCurrent = dp[i - 1] as number;

    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i - 2, i - 1], dpSecondary: [i], result: null, phase: label },
      highlights: [start + i],
      message: `[${label}] dp[${i}] = max(dp[${i - 1}], dp[${i - 2}] + nums[${start + i}]) = max(${skipCurrent}, ${dp[i - 2]} + ${nums[start + i]})`,
      codeLine: 8,
      action: 'compare',
    });

    dp[i] = Math.max(robCurrent, skipCurrent);

    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], result: null, phase: label },
      highlights: [start + i],
      message: `[${label}] dp[${i}] = ${dp[i]}`,
      codeLine: 8,
      action: 'insert',
    });
  }

  return dp[len - 1] as number;
}

function runHouseRobberII(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: { nums: [...nums], result: null },
    highlights: [],
    message: `Houses arranged in a circle: [${nums.join(', ')}]. Cannot rob first and last together.`,
    codeLine: 1,
  });

  if (n === 0) {
    steps.push({ state: { nums: [], result: 0 }, highlights: [], message: 'No houses. Result: 0', codeLine: 2 });
    return steps;
  }
  if (n === 1) {
    steps.push({
      state: { nums: [...nums], result: nums[0] },
      highlights: [0],
      message: `Only one house. Result: ${nums[0]}`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  // Rob houses 0..n-2 (exclude last)
  steps.push({
    state: { nums: [...nums], result: null, phase: 'Range 1' },
    highlights: Array.from({ length: n - 1 }, (_, i) => i),
    message: `Phase 1: Rob houses 0 to ${n - 2} (exclude last house)`,
    codeLine: 4,
  });
  const result1 = robRange(nums, 0, n - 2, steps, 'Range 0..' + (n - 2));

  // Rob houses 1..n-1 (exclude first)
  steps.push({
    state: { nums: [...nums], result: null, phase: 'Range 2' },
    highlights: Array.from({ length: n - 1 }, (_, i) => i + 1),
    message: `Phase 2: Rob houses 1 to ${n - 1} (exclude first house)`,
    codeLine: 4,
  });
  const result2 = robRange(nums, 1, n - 1, steps, 'Range 1..' + (n - 1));

  const result = Math.max(result1, result2);
  steps.push({
    state: { nums: [...nums], result },
    highlights: [],
    message: `Result: max(${result1}, ${result2}) = ${result}`,
    codeLine: 5,
    action: 'found',
  });

  return steps;
}

export const houseRobberII: Algorithm = {
  id: 'house-robber-ii',
  name: 'House Robber II',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'DP — run House Robber twice: skip first or skip last',
  description:
    'All houses are arranged in a circle. That means the first house is the neighbor of the last one. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.',
  problemUrl: 'https://leetcode.com/problems/house-robber-ii/',
  code: {
    python: `def rob(nums):
    if len(nums) == 0: return 0
    if len(nums) == 1: return nums[0]
    def robRange(start, end):
        dp1, dp2 = 0, 0
        for i in range(start, end + 1):
            dp1, dp2 = dp2, max(dp2, dp1 + nums[i])
        return dp2
    return max(robRange(0, len(nums)-2),
               robRange(1, len(nums)-1))`,
    javascript: `function rob(nums) {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    function robRange(start, end) {
        let dp1 = 0, dp2 = 0;
        for (let i = start; i <= end; i++) {
            const temp = Math.max(dp2, dp1 + nums[i]);
            dp1 = dp2;
            dp2 = temp;
        }
        return dp2;
    }
    return Math.max(robRange(0, nums.length-2),
                    robRange(1, nums.length-1));
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [2, 3, 2],
  run: runHouseRobberII,
};
