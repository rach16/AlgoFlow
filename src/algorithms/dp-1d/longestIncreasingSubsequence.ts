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
    java: `public int lengthOfLIS(int[] nums) {
    int[] dp = new int[nums.length];
    Arrays.fill(dp, 1);
    int maxLen = 1;
    for (int i = 1; i < nums.length; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}`,
  },
  defaultInput: [10, 9, 2, 5, 3, 7, 101, 18],
  run: runLongestIncreasingSubsequence,
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Init DP: each element is a subsequence of 1',
      3: 'Check each element as potential LIS end',
      4: 'Compare with all previous elements',
      5: 'If nums[j] < nums[i], can extend LIS',
      6: 'Update dp[i] to max of current or dp[j]+1',
      7: 'Continue max computation on next line',
      8: 'Return the longest LIS found in dp',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Init DP: each element is a subsequence of 1',
      3: 'Check each element as potential LIS end',
      4: 'Compare with all previous elements',
      5: 'If nums[j] < nums[i], can extend LIS',
      6: 'Update dp[i] to max of current or dp[j]+1',
      7: 'Continue max computation on next line',
      11: 'Return the longest LIS found in dp',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Init DP array for each index',
      3: 'Fill all with 1 (min subsequence length)',
      4: 'Track overall maximum LIS length',
      5: 'Check each element as potential LIS end',
      6: 'Compare with all previous elements',
      7: 'If nums[j] < nums[i], can extend LIS',
      8: 'Update dp[i] to max of current or dp[j]+1',
      11: 'Update maxLen if dp[i] is new best',
      13: 'Return the longest LIS found',
    },
  },
};
