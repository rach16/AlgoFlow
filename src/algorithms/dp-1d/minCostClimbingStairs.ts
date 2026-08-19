import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMinCostClimbingStairs(input: unknown): AlgorithmStep[] {
  const cost = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = cost.length;

  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => `${i}`);

  steps.push({
    state: { nums: [...cost], dp: [...dp], dpLabels, result: null },
    highlights: [],
    message: `Find minimum cost to climb stairs with costs [${cost.join(', ')}]`,
    codeLine: 1,
  });

  // Base cases: can start from step 0 or step 1
  dp[0] = 0;
  steps.push({
    state: { nums: [...cost], dp: [...dp], dpLabels, dpHighlights: [0], result: null },
    highlights: [],
    message: `Base case: dp[0] = 0 (no cost to stand at step 0)`,
    codeLine: 2,
    action: 'insert',
  });

  dp[1] = 0;
  steps.push({
    state: { nums: [...cost], dp: [...dp], dpLabels, dpHighlights: [1], result: null },
    highlights: [],
    message: `Base case: dp[1] = 0 (no cost to stand at step 1)`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 2; i <= n; i++) {
    const fromOne = (dp[i - 1] as number) + cost[i - 1];
    const fromTwo = (dp[i - 2] as number) + cost[i - 2];

    steps.push({
      state: { nums: [...cost], dp: [...dp], dpLabels, dpHighlights: [i - 1, i - 2], dpSecondary: [i], result: null },
      highlights: [i - 1, i - 2],
      message: `dp[${i}] = min(dp[${i - 1}] + cost[${i - 1}], dp[${i - 2}] + cost[${i - 2}]) = min(${dp[i - 1]} + ${cost[i - 1]}, ${dp[i - 2]} + ${cost[i - 2]}) = min(${fromOne}, ${fromTwo})`,
      codeLine: 5,
      action: 'compare',
    });

    dp[i] = Math.min(fromOne, fromTwo);

    steps.push({
      state: { nums: [...cost], dp: [...dp], dpLabels, dpHighlights: [i], result: null },
      highlights: [],
      message: `dp[${i}] = ${dp[i]}`,
      codeLine: 5,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...cost], dp: [...dp], dpLabels, dpHighlights: [n], result: dp[n] },
    highlights: [],
    message: `Minimum cost to reach top: ${dp[n]}`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

function runMinCostClimbingStairsReverse(input: unknown): AlgorithmStep[] {
  const cost = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = cost.length;

  // Work on a copy so we can show the array mutating in place
  const work: number[] = [...cost];
  const dpLabels = Array.from({ length: n }, (_, i) => `${i}`);

  steps.push({
    state: { nums: [...cost], dp: [...work], dpLabels, result: null },
    highlights: [],
    message: `Reverse in-place DP: walk BACKWARD from the top, folding future costs into each step. cost[i] becomes "total cost to reach the top starting from step ${'i'}"`,
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...cost], dp: [...work], dpLabels, dpHighlights: [n - 2, n - 1], result: null },
    highlights: [n - 2, n - 1],
    message: `The last two steps need no lookahead: from step ${n - 2} or ${n - 1} you can jump straight to the top, paying only your own cost`,
    codeLine: 2,
  });

  for (let i = n - 3; i >= 0; i--) {
    const fromNext = work[i + 1];
    const fromSkip = work[i + 2];

    steps.push({
      state: { nums: [...cost], dp: [...work], dpLabels, dpHighlights: [i + 1, i + 2], dpSecondary: [i], result: null },
      highlights: [i],
      pointers: { i },
      message: `Step ${i}: after paying ${cost[i]}, jump 1 (total ${fromNext}) or jump 2 (total ${fromSkip})? Take the cheaper: min(${fromNext}, ${fromSkip}) = ${Math.min(fromNext, fromSkip)}`,
      codeLine: 3,
      action: 'compare',
    });

    work[i] += Math.min(fromNext, fromSkip);

    steps.push({
      state: { nums: [...cost], dp: [...work], dpLabels, dpHighlights: [i], result: null },
      highlights: [i],
      pointers: { i },
      message: `cost[${i}] updated in place: ${cost[i]} + ${Math.min(fromNext, fromSkip)} = ${work[i]} — the full price of starting at step ${i}`,
      codeLine: 3,
      action: 'insert',
    });
  }

  const result = Math.min(work[0], work[1]);
  steps.push({
    state: { nums: [...cost], dp: [...work], dpLabels, dpHighlights: [work[0] <= work[1] ? 0 : 1], result },
    highlights: [work[0] <= work[1] ? 0 : 1],
    message: `We may start at step 0 or 1: min(${work[0]}, ${work[1]}) = ${result}. Minimum cost to reach the top: ${result}`,
    codeLine: 4,
    action: 'found',
  });

  return steps;
}

export const minCostClimbingStairs: Algorithm = {
  id: 'min-cost-climbing-stairs',
  name: 'Min Cost Climbing Stairs',
  category: '1-D DP',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[i] = cost[i] + min(dp[i-1], dp[i-2])',
  description:
    'You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps. You can either start from the step with index 0, or the step with index 1. Return the minimum cost to reach the top of the floor.',
  problemUrl: 'https://leetcode.com/problems/min-cost-climbing-stairs/',
  code: {
    python: `def minCostClimbingStairs(cost):
    n = len(cost)
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 0
    for i in range(2, n + 1):
        dp[i] = min(dp[i-1] + cost[i-1],
                     dp[i-2] + cost[i-2])
    return dp[n]`,
    javascript: `function minCostClimbingStairs(cost) {
    const n = cost.length;
    const dp = new Array(n + 1).fill(0);
    dp[0] = 0;
    dp[1] = 0;
    for (let i = 2; i <= n; i++) {
        dp[i] = Math.min(dp[i-1] + cost[i-1],
                         dp[i-2] + cost[i-2]);
    }
    return dp[n];
}`,
    java: `public int minCostClimbingStairs(int[] cost) {
    int n = cost.length;
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 0;
    for (int i = 2; i <= n; i++) {
        dp[i] = Math.min(dp[i-1] + cost[i-1],
                         dp[i-2] + cost[i-2]);
    }
    return dp[n];
}`,
  },
  defaultInput: [10, 15, 20],
  run: runMinCostClimbingStairs,
  optimalApproachName: 'Bottom-Up DP',
  approaches: [
    {
      id: 'reverse-in-place',
      name: 'In-Place Reverse DP',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of building a separate dp array forward, walk backward from the top and fold min(next, skip) into the cost array itself — no extra memory at all.',
      code: {
        python: `def minCostClimbingStairs(cost):
    for i in range(len(cost) - 3, -1, -1):
        cost[i] += min(cost[i + 1], cost[i + 2])
    return min(cost[0], cost[1])`,
        javascript: `function minCostClimbingStairs(cost) {
    for (let i = cost.length - 3; i >= 0; i--) {
        cost[i] += Math.min(cost[i + 1], cost[i + 2]);
    }
    return Math.min(cost[0], cost[1]);
}`,
        java: `public int minCostClimbingStairs(int[] cost) {
    for (int i = cost.length - 3; i >= 0; i--) {
        cost[i] += Math.min(cost[i + 1], cost[i + 2]);
    }
    return Math.min(cost[0], cost[1]);
}`,
      },
      run: runMinCostClimbingStairsReverse,
      lineExplanations: {
        python: {
          1: 'Define function taking cost array',
          2: 'Walk backward from the third-to-last step (the last two already reach the top directly)',
          3: 'Fold the cheaper onward path into this step: cost[i] becomes the total cost from step i to the top',
          4: 'Start at step 0 or step 1 — return the cheaper total',
        },
        javascript: {
          1: 'Define function taking cost array',
          2: 'Walk backward from the third-to-last step (the last two already reach the top directly)',
          3: 'Fold the cheaper onward path into this step: cost[i] becomes the total cost from step i to the top',
          5: 'Start at step 0 or step 1 — return the cheaper total',
        },
        java: {
          1: 'Define method taking cost array',
          2: 'Walk backward from the third-to-last step (the last two already reach the top directly)',
          3: 'Fold the cheaper onward path into this step: cost[i] becomes the total cost from step i to the top',
          5: 'Start at step 0 or step 1 — return the cheaper total',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking cost array',
      2: 'Get number of steps',
      3: 'Create DP array of size n+1 for top of stairs',
      4: 'Base case: no cost to stand on step 0',
      5: 'Base case: no cost to stand on step 1',
      6: 'Fill DP table from step 2 to top',
      7: 'Min cost from one step or two steps back',
      8: 'Consider cost of stepping from i-2',
      9: 'Return minimum cost to reach the top',
    },
    javascript: {
      1: 'Define function taking cost array',
      2: 'Get number of steps',
      3: 'Create DP array of size n+1 filled with 0',
      4: 'Base case: no cost to stand on step 0',
      5: 'Base case: no cost to stand on step 1',
      6: 'Fill DP table from step 2 to top',
      7: 'Min cost from one step or two steps back',
      8: 'Consider cost of stepping from i-2',
      10: 'Return minimum cost to reach the top',
    },
    java: {
      1: 'Define method taking cost array',
      2: 'Get number of steps',
      3: 'Create DP array of size n+1',
      4: 'Base case: no cost to stand on step 0',
      5: 'Base case: no cost to stand on step 1',
      6: 'Fill DP table from step 2 to top',
      7: 'Min cost from one step or two steps back',
      8: 'Consider cost of stepping from i-2',
      10: 'Return minimum cost to reach the top',
    },
  },
};
