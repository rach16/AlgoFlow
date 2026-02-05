import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runClimbingStairs(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];

  // dp[i] = number of ways to reach step i
  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => `${i}`);

  steps.push({
    state: { dp: [...dp], dpLabels, n, result: null },
    highlights: [],
    message: `Find number of distinct ways to climb ${n} stairs (1 or 2 steps at a time)`,
    codeLine: 1,
  });

  // Base cases
  dp[0] = 1;
  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [0], n, result: null },
    highlights: [0],
    message: `Base case: dp[0] = 1 (one way to stay at ground)`,
    codeLine: 2,
    action: 'insert',
  });

  dp[1] = 1;
  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [1], n, result: null },
    highlights: [1],
    message: `Base case: dp[1] = 1 (one way to reach step 1)`,
    codeLine: 3,
    action: 'insert',
  });

  // Fill DP table
  for (let i = 2; i <= n; i++) {
    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [i - 1, i - 2], dpSecondary: [i], n, result: null },
      highlights: [i],
      message: `Computing dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]}`,
      codeLine: 5,
      action: 'compare',
    });

    dp[i] = (dp[i - 1] as number) + (dp[i - 2] as number);

    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [i], n, result: null },
      highlights: [i],
      message: `dp[${i}] = ${dp[i]}`,
      codeLine: 5,
      action: 'insert',
    });
  }

  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [n], n, result: dp[n] },
    highlights: [n],
    message: `Result: ${dp[n]} distinct ways to climb ${n} stairs`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const climbingStairs: Algorithm = {
  id: 'climbing-stairs',
  name: 'Climbing Stairs',
  category: '1-D DP',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'DP — dp[i] = dp[i-1] + dp[i-2], like Fibonacci',
  description:
    'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
  problemUrl: 'https://leetcode.com/problems/climbing-stairs/',
  code: {
    python: `def climbStairs(n):
    if n <= 1:
        return 1
    dp = [0] * (n + 1)
    dp[0], dp[1] = 1, 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,
    javascript: `function climbStairs(n) {
    if (n <= 1) return 1;
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;
    dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`,
  },
  defaultInput: 5,
  run: runClimbingStairs,
};
