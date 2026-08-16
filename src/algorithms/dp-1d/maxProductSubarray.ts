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

function runMaxProductPrefixSuffix(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({ state: { nums: [], result: 0 }, highlights: [], message: 'Empty array. Result: 0', codeLine: 1 });
    return steps;
  }

  // dp shows the running prefix product at each index
  const dp: (number | null)[] = new Array(n).fill(null);
  const dpLabels = Array.from({ length: n }, (_, i) => `${i}`);

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result: null },
    highlights: [],
    message: `Key insight: the best subarray always touches the start or end of a zero-free stretch — an unpaired negative can only hurt one side. So scan running products from BOTH directions`,
    codeLine: 1,
  });

  let result = nums[0];
  let prefix = 0;
  let suffix = 0;

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, prefix, suffix, result },
    highlights: [0],
    message: `Initialize result = nums[0] = ${result}; prefix and suffix products start at 0 (0 means "reset to 1 before multiplying")`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 0; i < n; i++) {
    const prevPrefix = prefix;
    const prevSuffix = suffix;
    prefix = (prefix === 0 ? 1 : prefix) * nums[i];
    suffix = (suffix === 0 ? 1 : suffix) * nums[n - 1 - i];
    dp[i] = prefix;

    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], prefix, suffix, result },
      highlights: [i],
      secondary: [n - 1 - i],
      pointers: { i, j: n - 1 - i },
      message: `Forward: prefix ${prevPrefix === 0 ? '(reset)' : prevPrefix} × ${nums[i]} = ${prefix}. Backward: suffix ${prevSuffix === 0 ? '(reset)' : prevSuffix} × ${nums[n - 1 - i]} = ${suffix}`,
      codeLine: 6,
      action: 'compare',
    });

    const best = Math.max(prefix, suffix);
    if (best > result) {
      result = best;
      steps.push({
        state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], prefix, suffix, result },
        highlights: [i],
        secondary: [n - 1 - i],
        message: `New best: result = max(prefix ${prefix}, suffix ${suffix}) = ${result}`,
        codeLine: 8,
        action: 'found',
      });
    } else {
      steps.push({
        state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], prefix, suffix, result },
        highlights: [i],
        secondary: [n - 1 - i],
        message: `max(prefix ${prefix}, suffix ${suffix}) = ${best} does not beat result = ${result}`,
        codeLine: 8,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, result },
    highlights: [],
    message: `Maximum product subarray: ${result} — every zero-free stretch was scanned from both ends, so no candidate was missed`,
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
    java: `public int maxProduct(int[] nums) {
    int result = nums[0];
    int curMax = 1, curMin = 1;
    for (int n : nums) {
        int temp = Math.max(n, Math.max(n * curMax, n * curMin));
        curMin = Math.min(n, Math.min(n * curMax, n * curMin));
        curMax = temp;
        result = Math.max(result, curMax);
    }
    return result;
}`,
  },
  defaultInput: [2, 3, -2, 4],
  run: runMaxProductSubarray,
  optimalApproachName: 'Min/Max Tracking',
  approaches: [
    {
      id: 'prefix-suffix-scan',
      name: 'Prefix & Suffix Products',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of tracking min and max at every step, scan running products from both ends (resetting at zeros) — the best subarray always touches one end of a zero-free stretch.',
      code: {
        python: `def maxProduct(nums):
    n = len(nums)
    result = nums[0]
    prefix, suffix = 0, 0
    for i in range(n):
        prefix = (prefix or 1) * nums[i]
        suffix = (suffix or 1) * nums[n - 1 - i]
        result = max(result, prefix, suffix)
    return result`,
        javascript: `function maxProduct(nums) {
    const n = nums.length;
    let result = nums[0];
    let prefix = 0, suffix = 0;
    for (let i = 0; i < n; i++) {
        prefix = (prefix || 1) * nums[i];
        suffix = (suffix || 1) * nums[n - 1 - i];
        result = Math.max(result, Math.max(prefix, suffix));
    }
    return result;
}`,
        java: `public int maxProduct(int[] nums) {
    int n = nums.length;
    int result = nums[0];
    int prefix = 0, suffix = 0;
    for (int i = 0; i < n; i++) {
        prefix = (prefix == 0 ? 1 : prefix) * nums[i];
        suffix = (suffix == 0 ? 1 : suffix) * nums[n - 1 - i];
        result = Math.max(result, Math.max(prefix, suffix));
    }
    return result;
}`,
      },
      run: runMaxProductPrefixSuffix,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Length of the array',
          3: 'Best product seen so far',
          4: 'Running products from the left and from the right',
          5: 'One pass drives both scans simultaneously',
          6: 'Multiply prefix by the next left element (a zero resets the run to 1)',
          7: 'Multiply suffix by the next right element (mirrored index)',
          8: 'Best subarray touches an end of some zero-free stretch — check both runs',
          9: 'Return the maximum product found',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Length of the array',
          3: 'Best product seen so far',
          4: 'Running products from the left and from the right',
          5: 'One pass drives both scans simultaneously',
          6: 'Multiply prefix by the next left element (a zero resets the run to 1)',
          7: 'Multiply suffix by the next right element (mirrored index)',
          8: 'Best subarray touches an end of some zero-free stretch — check both runs',
          10: 'Return the maximum product found',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'Length of the array',
          3: 'Best product seen so far',
          4: 'Running products from the left and from the right',
          5: 'One pass drives both scans simultaneously',
          6: 'Multiply prefix by the next left element (a zero resets the run to 1)',
          7: 'Multiply suffix by the next right element (mirrored index)',
          8: 'Best subarray touches an end of some zero-free stretch — check both runs',
          10: 'Return the maximum product found',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Init result with first element',
      3: 'Track running max and min products',
      4: 'Iterate through each number',
      5: 'Compute all candidate products',
      6: 'Update curMax from candidates',
      7: 'Update curMin from candidates',
      8: 'Update global result if curMax is larger',
      9: 'Return maximum product found',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Init result with first element',
      3: 'Track running max and min products',
      4: 'Iterate through each number',
      5: 'Compute all candidate products',
      6: 'Update curMax from candidates',
      7: 'Update curMin from candidates',
      8: 'Update global result if curMax is larger',
      10: 'Return maximum product found',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Init result with first element',
      3: 'Track running max and min products',
      4: 'Iterate through each number',
      5: 'Compute new max from n, n*curMax, n*curMin',
      6: 'Compute new min from n, n*curMax, n*curMin',
      7: 'Store new max (computed before min update)',
      8: 'Update global result if curMax is larger',
      10: 'Return maximum product found',
    },
  },
};
