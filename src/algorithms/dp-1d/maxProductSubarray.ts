import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMaxProductSubarray(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({ state: { nums: [], result: 0 }, highlights: [], message: 'Empty array. Result: 0', codeLine: 1 });
    return steps;
  }

  // Track both max and min products (because negative * negative = positive)
  const dpMax: (number | null)[] = new Array(n).fill(null);
  const dpMin: (number | null)[] = new Array(n).fill(null);
  const dpLabels = Array.from({ length: n }, (_, i) => `${i}`);

  steps.push({
    state: { nums: [...nums], dp: [...dpMax], dpLabels, result: null },
    highlights: [],
    message: `Find maximum product subarray in [${nums.join(', ')}]. Track both max and min (negatives can flip).`,
    codeLine: 1,
  });

  let curMax = nums[0];
  let curMin = nums[0];
  let result = nums[0];
  dpMax[0] = curMax;
  dpMin[0] = curMin;

  steps.push({
    state: { nums: [...nums], dp: [...dpMax], dpLabels, dpHighlights: [0], result, curMax, curMin },
    highlights: [0],
    message: `Initialize: curMax = ${curMax}, curMin = ${curMin}, result = ${result}`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 1; i < n; i++) {
    const candidates = [nums[i], nums[i] * curMax, nums[i] * curMin];

    steps.push({
      state: { nums: [...nums], dp: [...dpMax], dpLabels, dpHighlights: [i - 1], dpSecondary: [i], result, curMax, curMin },
      highlights: [i],
      pointers: { i },
      message: `nums[${i}] = ${nums[i]}. Candidates: nums[i]=${nums[i]}, nums[i]*curMax=${nums[i]}*${curMax}=${nums[i] * curMax}, nums[i]*curMin=${nums[i]}*${curMin}=${nums[i] * curMin}`,
      codeLine: 5,
      action: 'compare',
    });

    const tempMax = Math.max(...candidates);
    curMin = Math.min(...candidates);
    curMax = tempMax;
    dpMax[i] = curMax;
    dpMin[i] = curMin;

    if (curMax > result) {
      result = curMax;
      steps.push({
        state: { nums: [...nums], dp: [...dpMax], dpLabels, dpHighlights: [i], result, curMax, curMin },
        highlights: [i],
        pointers: { i },
        message: `curMax = ${curMax}, curMin = ${curMin}. New best result = ${result}`,
        codeLine: 7,
        action: 'found',
      });
    } else {
      steps.push({
        state: { nums: [...nums], dp: [...dpMax], dpLabels, dpHighlights: [i], result, curMax, curMin },
        highlights: [i],
        pointers: { i },
        message: `curMax = ${curMax}, curMin = ${curMin}. Result stays ${result}`,
        codeLine: 7,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], dp: [...dpMax], dpLabels, result },
    highlights: [],
    message: `Maximum product subarray: ${result}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const maxProductSubarray: Algorithm = {
  id: 'max-product-subarray',
  name: 'Maximum Product Subarray',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'DP — track both curMax and curMin (negatives can flip)',
  description:
    'Given an integer array nums, find a subarray that has the largest product, and return the product. The test cases are generated so that the answer will fit in a 32-bit integer.',
  problemUrl: 'https://leetcode.com/problems/maximum-product-subarray/',
  code: {
    python: `def maxProduct(nums):
    result = nums[0]
    curMax, curMin = 1, 1
    for n in nums:
        candidates = [n, n * curMax, n * curMin]
        curMax = max(candidates)
        curMin = min(candidates)
        result = max(result, curMax)
    return result`,
    javascript: `function maxProduct(nums) {
    let result = nums[0];
    let curMax = 1, curMin = 1;
    for (const n of nums) {
        const candidates = [n, n * curMax, n * curMin];
        curMax = Math.max(...candidates);
        curMin = Math.min(...candidates);
        result = Math.max(result, curMax);
    }
    return result;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [2, 3, -2, 4],
  run: runMaxProductSubarray,
};
