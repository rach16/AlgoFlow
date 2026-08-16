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

function runHouseRobberIIMemo(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: { nums: [...nums], result: null },
    highlights: [],
    message: `Circular street: house 0 and house ${n - 1} are neighbors. Solve two overlapping LINEAR problems with memoized recursion, then take the better`,
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
      message: `Only one house — no circle constraint. Result: ${nums[0]}`,
      codeLine: 4,
      action: 'found',
    });
    return steps;
  }

  function robRangeMemo(start: number, end: number, label: string): number {
    const memo: (number | null)[] = new Array(n).fill(null);
    const dpLabels = Array.from({ length: n }, (_, i) => `${i}`);

    function robFrom(i: number): number {
      if (i > end) return 0;
      if (memo[i] !== null) {
        steps.push({
          state: { nums: [...nums], dp: [...memo], dpLabels, dpHighlights: [i], result: null, phase: label },
          highlights: [i],
          pointers: { i },
          message: `[${label}] robFrom(${i}) memo hit = ${memo[i]} — recursion never solves the same house twice`,
          codeLine: 9,
          action: 'found',
        });
        return memo[i] as number;
      }

      steps.push({
        state: { nums: [...nums], dp: [...memo], dpLabels, dpSecondary: [i], result: null, phase: label },
        highlights: [i],
        pointers: { i },
        message: `[${label}] robFrom(${i}): rob house ${i} ($${nums[i]}) and jump to ${i + 2}, or skip to ${i + 1}?`,
        codeLine: 10,
        action: 'visit',
      });

      const robIt = nums[i] + robFrom(i + 2);
      const skipIt = robFrom(i + 1);
      memo[i] = Math.max(robIt, skipIt);

      steps.push({
        state: { nums: [...nums], dp: [...memo], dpLabels, dpHighlights: [i], result: null, phase: label },
        highlights: [i],
        pointers: { i },
        message: `[${label}] memo[${i}] = max(rob: ${robIt}, skip: ${skipIt}) = ${memo[i]}`,
        codeLine: 10,
        action: 'insert',
      });

      return memo[i] as number;
    }

    return robFrom(start);
  }

  steps.push({
    state: { nums: [...nums], result: null, phase: 'Range 1' },
    highlights: Array.from({ length: n - 1 }, (_, i) => i),
    message: `Case 1: exclude the LAST house — recurse over houses 0..${n - 2}`,
    codeLine: 13,
  });
  const result1 = robRangeMemo(0, n - 2, `Houses 0..${n - 2}`);

  steps.push({
    state: { nums: [...nums], result: null, phase: 'Range 2' },
    highlights: Array.from({ length: n - 1 }, (_, i) => i + 1),
    message: `Case 2: exclude the FIRST house — recurse over houses 1..${n - 1}`,
    codeLine: 13,
  });
  const result2 = robRangeMemo(1, n - 1, `Houses 1..${n - 1}`);

  const result = Math.max(result1, result2);
  steps.push({
    state: { nums: [...nums], result },
    highlights: [],
    message: `Result: max(${result1}, ${result2}) = ${result} — every valid plan skips house 0 or house ${n - 1}, so the two cases cover everything`,
    codeLine: 13,
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
    java: `public int rob(int[] nums) {
    if (nums.length == 0) return 0;
    if (nums.length == 1) return nums[0];
    return Math.max(robRange(nums, 0, nums.length-2),
                    robRange(nums, 1, nums.length-1));
}

private int robRange(int[] nums, int start, int end) {
    int dp1 = 0, dp2 = 0;
    for (int i = start; i <= end; i++) {
        int temp = Math.max(dp2, dp1 + nums[i]);
        dp1 = dp2;
        dp2 = temp;
    }
    return dp2;
}`,
  },
  defaultInput: [2, 3, 2],
  run: runHouseRobberII,
  optimalApproachName: 'Two-Pass Rolling DP',
  approaches: [
    {
      id: 'top-down-memoization',
      name: 'Top-Down Memoization',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Same two-range split, but each range is solved by recursion — robFrom(i) = max(rob house i and jump 2, skip to i+1) — with a memo so each house is computed once.',
      code: {
        python: `def rob(nums):
    n = len(nums)
    if n == 1:
        return nums[0]
    def robFrom(i, end, memo):
        if i > end:
            return 0
        if i in memo:
            return memo[i]
        memo[i] = max(nums[i] + robFrom(i + 2, end, memo),
                      robFrom(i + 1, end, memo))
        return memo[i]
    return max(robFrom(0, n - 2, {}), robFrom(1, n - 1, {}))`,
        javascript: `function rob(nums) {
    const n = nums.length;
    if (n === 1) return nums[0];
    function robFrom(i, end, memo) {
        if (i > end) return 0;
        if (memo.has(i)) return memo.get(i);
        const best = Math.max(nums[i] + robFrom(i + 2, end, memo),
                              robFrom(i + 1, end, memo));
        memo.set(i, best);
        return best;
    }
    return Math.max(robFrom(0, n - 2, new Map()),
                    robFrom(1, n - 1, new Map()));
}`,
        java: `public int rob(int[] nums) {
    int n = nums.length;
    if (n == 1) return nums[0];
    Integer[] memo1 = new Integer[n];
    Integer[] memo2 = new Integer[n];
    return Math.max(robFrom(nums, 0, n - 2, memo1),
                    robFrom(nums, 1, n - 1, memo2));
}

private int robFrom(int[] nums, int i, int end, Integer[] memo) {
    if (i > end) return 0;
    if (memo[i] != null) return memo[i];
    memo[i] = Math.max(nums[i] + robFrom(nums, i + 2, end, memo),
                       robFrom(nums, i + 1, end, memo));
    return memo[i];
}`,
      },
      run: runHouseRobberIIMemo,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Number of houses in the circle',
          3: 'Single house: no adjacency constraint',
          4: 'Just rob it',
          5: 'robFrom(i) = best loot from house i to end',
          6: 'Ran past the range end',
          7: 'Nothing left to rob',
          8: 'Memo hit: this house was already solved',
          9: 'Return the cached answer',
          10: 'Choose: rob house i and jump two ahead...',
          11: '...or skip to the next house — take the max',
          12: 'Return the memoized best for house i',
          13: 'Best of excluding the last house vs excluding the first',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Number of houses in the circle',
          3: 'Single house: no adjacency constraint, rob it',
          4: 'robFrom(i) = best loot from house i to end',
          5: 'Past the range end: nothing left to rob',
          6: 'Memo hit: return the cached answer',
          7: 'Choose: rob house i and jump two ahead...',
          8: '...or skip to the next house — take the max',
          9: 'Cache the answer for house i',
          10: 'Return the best for this suffix',
          12: 'Case 1: exclude the last house',
          13: 'Case 2: exclude the first house — take the max',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'Number of houses in the circle',
          3: 'Single house: no adjacency constraint, rob it',
          4: 'Separate memo for the first range',
          5: 'Separate memo for the second range',
          6: 'Case 1: exclude the last house',
          7: 'Case 2: exclude the first house — take the max',
          10: 'robFrom(i) = best loot from house i to end',
          11: 'Past the range end: nothing left to rob',
          12: 'Memo hit: return the cached answer',
          13: 'Choose: rob house i and jump two ahead...',
          14: '...or skip to the next house — take the max',
          15: 'Return the memoized best for house i',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Handle edge case: no houses',
      3: 'Handle edge case: single house',
      4: 'Define helper to rob a linear range',
      5: 'Track two previous max values',
      6: 'Iterate through houses in range',
      7: 'Choose max of robbing or skipping current',
      8: 'Return max loot for this range',
      9: 'Return best of excluding first or last house',
      10: 'Second range excludes first house',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Handle edge case: no houses',
      3: 'Handle edge case: single house',
      4: 'Define helper to rob a linear range',
      5: 'Track two previous max values',
      6: 'Iterate through houses in range',
      7: 'Choose max of robbing or skipping current',
      8: 'Shift previous values forward',
      9: 'Store new max in dp2',
      11: 'Return max loot for this range',
      13: 'Return best of excluding first or last house',
      14: 'Second range excludes first house',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Handle edge case: no houses',
      3: 'Handle edge case: single house',
      4: 'Return best of excluding first or last house',
      5: 'Second range excludes first house',
      8: 'Define helper to rob a linear range',
      9: 'Track two previous max values',
      10: 'Iterate through houses in range',
      11: 'Choose max of robbing or skipping current',
      12: 'Shift previous values forward',
      13: 'Store new max in dp2',
      15: 'Return max loot for this range',
    },
  },
};
