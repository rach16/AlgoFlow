import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMaximumSubarray(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], result: 'Finding maximum subarray...' },
    highlights: [],
    message: `Kadane's algorithm: find the contiguous subarray with the largest sum.`,
    codeLine: 1,
  });

  let maxSum = nums[0];
  let curSum = 0;
  let bestStart = 0;
  let bestEnd = 0;
  let curStart = 0;

  for (let i = 0; i < nums.length; i++) {
    if (curSum < 0) {
      curSum = 0;
      curStart = i;

      steps.push({
        state: { nums: [...nums], result: `Max sum: ${maxSum}` },
        highlights: [i],
        pointers: { i, start: curStart },
        message: `Current sum was negative. Reset to 0, start new subarray at index ${i}.`,
        codeLine: 3,
        action: 'visit',
      });
    }

    curSum += nums[i];

    // Highlight current subarray
    const subHighlights: number[] = [];
    for (let j = curStart; j <= i; j++) subHighlights.push(j);

    steps.push({
      state: { nums: [...nums], result: `Max sum: ${maxSum}, Current sum: ${curSum}` },
      highlights: subHighlights,
      pointers: { i, start: curStart },
      message: `Add nums[${i}] = ${nums[i]}. Current subarray sum = ${curSum}.`,
      codeLine: 5,
      action: 'visit',
    });

    if (curSum > maxSum) {
      maxSum = curSum;
      bestStart = curStart;
      bestEnd = i;

      const bestHighlights: number[] = [];
      for (let j = bestStart; j <= bestEnd; j++) bestHighlights.push(j);

      steps.push({
        state: { nums: [...nums], result: `Max sum: ${maxSum}` },
        highlights: bestHighlights,
        pointers: { i, start: bestStart, end: bestEnd },
        message: `New maximum! sum = ${maxSum} from index ${bestStart} to ${bestEnd}.`,
        codeLine: 6,
        action: 'found',
      });
    }
  }

  const finalHighlights: number[] = [];
  for (let j = bestStart; j <= bestEnd; j++) finalHighlights.push(j);

  steps.push({
    state: { nums: [...nums], result: `Maximum subarray sum: ${maxSum}` },
    highlights: finalHighlights,
    pointers: { start: bestStart, end: bestEnd },
    message: `Done! Maximum subarray sum = ${maxSum} (indices ${bestStart} to ${bestEnd}).`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

function runMaximumSubarrayDP(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;
  const dp: number[] = new Array(n).fill(0);
  dp[0] = nums[0];

  steps.push({
    state: { nums: [...nums], result: 'Building dp table...' },
    highlights: [],
    message: `DP formulation: dp[i] = best subarray sum ENDING at index i. At each i, either extend the previous subarray or start fresh.`,
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...nums], result: `dp: [${dp.join(', ')}]` },
    highlights: [0],
    pointers: { i: 0 },
    message: `Base case: dp[0] = nums[0] = ${nums[0]} — the only subarray ending at index 0 is [${nums[0]}] itself.`,
    codeLine: 4,
    action: 'insert',
  });

  let best = dp[0];
  let bestIdx = 0;

  for (let i = 1; i < n; i++) {
    const restart = nums[i];
    const extend = dp[i - 1] + nums[i];
    dp[i] = Math.max(restart, extend);
    const extended = extend >= restart;
    if (dp[i] > best) {
      best = dp[i];
      bestIdx = i;
    }

    steps.push({
      state: { nums: [...nums], result: `dp: [${dp.slice(0, i + 1).join(', ')}]` },
      highlights: [i],
      secondary: [i - 1],
      pointers: { i },
      message: `dp[${i}] = max(${restart}, ${dp[i - 1]} + ${nums[i]}) = ${dp[i]} — ${extended ? `extending the subarray ending at ${i - 1} is worth it` : `dp[${i - 1}] = ${dp[i - 1]} is negative baggage, so start fresh at index ${i}`}.`,
      codeLine: 6,
      action: 'compare',
    });
  }

  steps.push({
    state: { nums: [...nums], result: `Maximum subarray sum: ${best}` },
    highlights: [bestIdx],
    pointers: { best: bestIdx },
    message: `Answer = max over all dp values = ${best} (best subarray ends at index ${bestIdx}). Kadane's algorithm is exactly this dp collapsed to O(1) space.`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const maximumSubarray: Algorithm = {
  id: 'maximum-subarray',
  name: 'Maximum Subarray',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Kadane Algorithm — reset running sum if negative',
  description:
    'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
  problemUrl: 'https://leetcode.com/problems/maximum-subarray/',
  code: {
    python: `def maxSubArray(nums):
    maxSub = nums[0]
    curSum = 0
    for n in nums:
        if curSum < 0:
            curSum = 0
        curSum += n
        maxSub = max(maxSub, curSum)
    return maxSub`,
    javascript: `function maxSubArray(nums) {
    let maxSub = nums[0];
    let curSum = 0;
    for (const n of nums) {
        if (curSum < 0) curSum = 0;
        curSum += n;
        maxSub = Math.max(maxSub, curSum);
    }
    return maxSub;
}`,
    java: `public static int maxSubArray(int[] nums) {
    int maxSub = nums[0];
    int curSum = 0;
    for (int n : nums) {
        if (curSum < 0) curSum = 0;
        curSum += n;
        maxSub = Math.max(maxSub, curSum);
    }
    return maxSub;
}`,
  },
  defaultInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
  run: runMaximumSubarray,
  optimalApproachName: "Kadane's Algorithm",
  approaches: [
    {
      id: 'dp-tabulation',
      name: 'Dynamic Programming',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        "Instead of Kadane's implicit reset, build an explicit dp table where dp[i] is the best subarray sum ending at i, then take the max over the table.",
      code: {
        python: `def maxSubArray(nums):
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    for i in range(1, n):
        dp[i] = max(nums[i], dp[i - 1] + nums[i])
    return max(dp)`,
        javascript: `function maxSubArray(nums) {
    const n = nums.length;
    const dp = new Array(n);
    dp[0] = nums[0];
    for (let i = 1; i < n; i++) {
        dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
    }
    return Math.max(...dp);
}`,
        java: `public static int maxSubArray(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    dp[0] = nums[0];
    int best = nums[0];
    for (int i = 1; i < n; i++) {
        dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
        best = Math.max(best, dp[i]);
    }
    return best;
}`,
      },
      run: runMaximumSubarrayDP,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'n = number of elements',
          3: 'dp[i] will hold the best subarray sum ending at index i',
          4: 'Base case: the only subarray ending at 0 is nums[0] itself',
          5: 'Fill the dp table left to right',
          6: 'Either start fresh at i, or extend the best subarray ending at i-1',
          7: 'The answer is the best value over all ending positions',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'n = number of elements',
          3: 'Allocate dp: best subarray sum ending at each index',
          4: 'Base case: the only subarray ending at 0 is nums[0] itself',
          5: 'Fill the dp table left to right',
          6: 'Either start fresh at i, or extend the best subarray ending at i-1',
          8: 'The answer is the best value over all ending positions',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'n = number of elements',
          3: 'Allocate dp: best subarray sum ending at each index',
          4: 'Base case: the only subarray ending at 0 is nums[0] itself',
          5: 'Track the running best answer as we fill dp',
          6: 'Fill the dp table left to right',
          7: 'Either start fresh at i, or extend the best subarray ending at i-1',
          8: 'Update the best answer seen so far',
          10: 'Return the maximum subarray sum',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Initialize max subarray sum with first element',
      3: 'Initialize current running sum to zero',
      4: 'Iterate through each number',
      5: 'Reset running sum if it went negative',
      6: 'Reset current sum to zero',
      7: 'Add current number to running sum',
      8: 'Update max if current sum is larger',
      9: 'Return the maximum subarray sum',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Initialize max subarray sum with first element',
      3: 'Initialize current running sum to zero',
      4: 'Iterate through each number',
      5: 'Reset running sum if it went negative',
      6: 'Add current number to running sum',
      7: 'Update max if current sum is larger',
      9: 'Return the maximum subarray sum',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Initialize max subarray sum with first element',
      3: 'Initialize current running sum to zero',
      4: 'Iterate through each number',
      5: 'Reset running sum if it went negative',
      6: 'Add current number to running sum',
      7: 'Update max if current sum is larger',
      9: 'Return the maximum subarray sum',
    },
  },
};
