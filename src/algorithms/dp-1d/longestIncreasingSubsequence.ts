import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLongestIncreasingSubsequence(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({ state: { nums: [], dp: [], result: 0 }, highlights: [], message: 'Empty array. Result: 0', codeLine: 1 });
    return steps;
  }

  // dp[i] = length of LIS ending at index i
  const dp: (number | null)[] = new Array(n).fill(null);
  const dpLabels = Array.from({ length: n }, (_, i) => `${nums[i]}`);

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
    highlights: [],
    message: `Find length of longest increasing subsequence in [${nums.join(', ')}]`,
    codeLine: 1,
  });

  // Initialize all dp values to 1 (each element is a subsequence of length 1)
  for (let i = 0; i < n; i++) {
    dp[i] = 1;
  }
  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
    highlights: Array.from({ length: n }, (_, i) => i),
    message: `Initialize: every element has LIS of at least 1`,
    codeLine: 2,
    action: 'insert',
  });

  let maxLen = 1;

  for (let i = 1; i < n; i++) {
    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], result: maxLen },
      highlights: [i],
      pointers: { i },
      message: `Computing dp[${i}] for nums[${i}] = ${nums[i]}`,
      codeLine: 4,
      action: 'visit',
    });

    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        steps.push({
          state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [j, i], result: maxLen },
          highlights: [j, i],
          pointers: { i, j },
          message: `nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}: dp[${i}] = max(dp[${i}], dp[${j}]+1) = max(${dp[i]}, ${(dp[j] as number) + 1})`,
          codeLine: 6,
          action: 'compare',
        });

        if ((dp[j] as number) + 1 > (dp[i] as number)) {
          dp[i] = (dp[j] as number) + 1;

          steps.push({
            state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], result: maxLen },
            highlights: [i],
            pointers: { i },
            message: `dp[${i}] updated to ${dp[i]}`,
            codeLine: 6,
            action: 'insert',
          });
        }
      }
    }

    if ((dp[i] as number) > maxLen) {
      maxLen = dp[i] as number;
      steps.push({
        state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], result: maxLen },
        highlights: [i],
        message: `New longest: LIS ending at index ${i} has length ${maxLen}`,
        codeLine: 7,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result: maxLen },
    highlights: [],
    message: `Length of longest increasing subsequence: ${maxLen}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const longestIncreasingSubsequence: Algorithm = {
  id: 'longest-increasing-subsequence',
  name: 'Longest Increasing Subsequence',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[i] = LIS ending at i, check all j < i',
  description:
    'Given an integer array nums, return the length of the longest strictly increasing subsequence.',
  problemUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
  code: {
    python: `def lengthOfLIS(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i],
                            dp[j] + 1)
    return max(dp)`,
    javascript: `function lengthOfLIS(nums) {
    const dp = new Array(nums.length).fill(1);
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i],
                                 dp[j] + 1);
            }
        }
    }
    return Math.max(...dp);
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [10, 9, 2, 5, 3, 7, 101, 18],
  run: runLongestIncreasingSubsequence,
};
