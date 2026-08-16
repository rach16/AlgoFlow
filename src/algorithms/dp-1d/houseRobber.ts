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

function runHouseRobberRolling(input: unknown): AlgorithmStep[] {
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

  // Display array: dp[i] = best loot considering houses 0..i (what rob2 holds after house i)
  const dp: (number | null)[] = new Array(n).fill(null);
  const dpLabels = Array.from({ length: n }, (_, i) => `${i}`);

  let rob1 = 0; // best loot up to two houses back
  let rob2 = 0; // best loot up to the previous house

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, rob1, rob2, result: null },
    highlights: [],
    message: `The DP array only ever looks back two cells — so keep just two variables: rob1 (best two houses back) and rob2 (best so far). Start both at 0`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    const withCurrent = rob1 + nums[i];
    const withoutCurrent = rob2;

    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpSecondary: [i], rob1, rob2, result: null },
      highlights: [i],
      pointers: { i },
      message: `House ${i} ($${nums[i]}): rob it → rob1 + ${nums[i]} = ${withCurrent}, or skip it → rob2 = ${withoutCurrent}`,
      codeLine: 4,
      action: 'compare',
    });

    const newRob = Math.max(withCurrent, withoutCurrent);
    rob1 = rob2;
    rob2 = newRob;
    dp[i] = newRob;

    steps.push({
      state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [i], rob1, rob2, result: null },
      highlights: [i],
      pointers: { i },
      message: `Best through house ${i} = ${newRob}${newRob === withCurrent && withCurrent !== withoutCurrent ? ' (rob it)' : ' (skip it)'}. Shift window: rob1 ← ${rob1}, rob2 ← ${rob2}`,
      codeLine: 6,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], dp: [...dp], dpLabels, dpHighlights: [n - 1], result: rob2 },
    highlights: [n - 1],
    message: `Maximum loot: ${rob2} — identical recurrence to the DP array, using O(1) memory`,
    codeLine: 7,
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
  optimalApproachName: 'Bottom-Up DP (Array)',
  approaches: [
    {
      id: 'rolling-variables',
      name: 'Rolling Variables',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'The DP array only ever reads the previous two entries, so two rolling variables (rob1, rob2) replace the whole array — same recurrence, O(1) space.',
      code: {
        python: `def rob(nums):
    rob1, rob2 = 0, 0
    for n in nums:
        newRob = max(rob1 + n, rob2)
        rob1 = rob2
        rob2 = newRob
    return rob2`,
        javascript: `function rob(nums) {
    let rob1 = 0, rob2 = 0;
    for (const n of nums) {
        const newRob = Math.max(rob1 + n, rob2);
        rob1 = rob2;
        rob2 = newRob;
    }
    return rob2;
}`,
        java: `public int rob(int[] nums) {
    int rob1 = 0, rob2 = 0;
    for (int n : nums) {
        int newRob = Math.max(rob1 + n, rob2);
        rob1 = rob2;
        rob2 = newRob;
    }
    return rob2;
}`,
      },
      run: runHouseRobberRolling,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'rob1 = best two houses back, rob2 = best so far (both 0 before any house)',
          3: 'Walk down the street, one house at a time',
          4: 'Rob this house (rob1 + n) or skip it (rob2) — take the better',
          5: 'Shift the window: rob1 becomes the old rob2',
          6: 'rob2 becomes the new best',
          7: 'rob2 holds the max loot over all houses',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'rob1 = best two houses back, rob2 = best so far (both 0 before any house)',
          3: 'Walk down the street, one house at a time',
          4: 'Rob this house (rob1 + n) or skip it (rob2) — take the better',
          5: 'Shift the window: rob1 becomes the old rob2',
          6: 'rob2 becomes the new best',
          8: 'rob2 holds the max loot over all houses',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'rob1 = best two houses back, rob2 = best so far (both 0 before any house)',
          3: 'Walk down the street, one house at a time',
          4: 'Rob this house (rob1 + n) or skip it (rob2) — take the better',
          5: 'Shift the window: rob1 becomes the old rob2',
          6: 'rob2 becomes the new best',
          8: 'rob2 holds the max loot over all houses',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Handle edge case: empty array',
      3: 'Return 0 for no houses',
      4: 'Handle edge case: single house',
      5: 'Return only house value',
      6: 'Init DP array same size as nums',
      7: 'Base case: rob first house',
      8: 'Base case: best of first two houses',
      9: 'Fill DP from house 2 onward',
      10: 'Choose max of skipping or robbing current',
      11: 'Return max loot from last house',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Handle edge case: empty array',
      3: 'Handle edge case: single house',
      4: 'Init DP array same size as nums',
      5: 'Base case: rob first house',
      6: 'Base case: best of first two houses',
      7: 'Fill DP from house 2 onward',
      8: 'Choose max of skipping or robbing current',
      10: 'Return max loot from last house',
    },
    java: {
      1: 'Define method taking nums array',
      2: 'Handle edge case: empty array',
      3: 'Handle edge case: single house',
      4: 'Init DP array same size as nums',
      5: 'Base case: rob first house',
      6: 'Base case: best of first two houses',
      7: 'Fill DP from house 2 onward',
      8: 'Choose max of skipping or robbing current',
      10: 'Return max loot from last house',
    },
  },
};
