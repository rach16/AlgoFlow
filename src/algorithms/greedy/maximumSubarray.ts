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
};
