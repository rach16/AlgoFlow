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

export const minCostClimbingStairs: Algorithm = {
  id: 'min-cost-climbing-stairs',
  name: 'Min Cost Climbing Stairs',
  category: '1-D DP',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
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
};
