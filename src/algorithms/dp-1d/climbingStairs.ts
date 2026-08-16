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

function runClimbingStairsFibonacci(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];

  // Display array so the viewer can see the sequence build, but the
  // algorithm itself only ever stores two variables.
  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => `${i}`);

  steps.push({
    state: { dp: [...dp], dpLabels, n, result: null },
    highlights: [],
    message: `Climbing Stairs is Fibonacci in disguise — we only ever need the last TWO answers, so two variables replace the whole DP array`,
    codeLine: 1,
  });

  if (n <= 1) {
    dp[n] = 1;
    steps.push({
      state: { dp: [...dp], dpLabels, n, result: 1 },
      highlights: [n],
      message: `n = ${n} ≤ 1: exactly one way. Result: 1`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  let prev2 = 1;
  let prev1 = 1;
  dp[0] = 1;
  dp[1] = 1;

  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [0, 1], n, result: null },
    highlights: [0, 1],
    message: `Initialize prev2 = 1 (ways to step 0) and prev1 = 1 (ways to step 1) — these two variables are our entire "memory"`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 2; i <= n; i++) {
    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [i - 2, i - 1], dpSecondary: [i], n, result: null },
      highlights: [i],
      message: `Step ${i}: ways = prev1 + prev2 = ${prev1} + ${prev2} — same recurrence as the DP array, but computed from just two variables`,
      codeLine: 6,
      action: 'compare',
    });

    const cur = prev1 + prev2;
    prev2 = prev1;
    prev1 = cur;
    dp[i] = cur;

    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [i], n, result: null },
      highlights: [i],
      message: `ways(${i}) = ${cur}. Slide the window: prev2 ← ${prev2}, prev1 ← ${prev1}. Older values are no longer needed`,
      codeLine: 6,
      action: 'insert',
    });
  }

  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [n], n, result: prev1 },
    highlights: [n],
    message: `Result: ${prev1} distinct ways — computed with O(1) memory instead of an O(n) array`,
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
    java: `public int climbStairs(int n) {
    if (n <= 1) return 1;
    int[] dp = new int[n + 1];
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`,
  },
  defaultInput: 5,
  run: runClimbingStairs,
  optimalApproachName: 'Bottom-Up DP',
  approaches: [
    {
      id: 'fibonacci-variables',
      name: 'Fibonacci Variables',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Same recurrence as the DP array, but since dp[i] only depends on the previous two values, two rolling variables replace the entire table.',
      code: {
        python: `def climbStairs(n):
    if n <= 1:
        return 1
    prev2, prev1 = 1, 1
    for i in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1`,
        javascript: `function climbStairs(n) {
    if (n <= 1) return 1;
    let prev2 = 1, prev1 = 1;
    for (let i = 2; i <= n; i++) {
        const cur = prev1 + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
        java: `public int climbStairs(int n) {
    if (n <= 1) return 1;
    int prev2 = 1, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int cur = prev1 + prev2;
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
      },
      run: runClimbingStairsFibonacci,
      lineExplanations: {
        python: {
          1: 'Define function taking n (number of stairs)',
          2: 'Edge case: 0 or 1 stairs has exactly 1 way',
          3: 'Return 1 for the trivial cases',
          4: 'Two variables hold ways(i-2) and ways(i-1) — the only history needed',
          5: 'Walk up the stairs from step 2 to n',
          6: 'New answer = sum of the two previous; slide both variables forward',
          7: 'prev1 now holds ways(n)',
        },
        javascript: {
          1: 'Define function taking n (number of stairs)',
          2: 'Edge case: 0 or 1 stairs has exactly 1 way',
          3: 'Two variables hold ways(i-2) and ways(i-1) — the only history needed',
          4: 'Walk up the stairs from step 2 to n',
          5: 'New answer = sum of the two previous answers',
          6: 'Slide the window: prev2 takes prev1',
          7: 'prev1 takes the newly computed value',
          9: 'prev1 now holds ways(n)',
        },
        java: {
          1: 'Define method taking n (number of stairs)',
          2: 'Edge case: 0 or 1 stairs has exactly 1 way',
          3: 'Two variables hold ways(i-2) and ways(i-1) — the only history needed',
          4: 'Walk up the stairs from step 2 to n',
          5: 'New answer = sum of the two previous answers',
          6: 'Slide the window: prev2 takes prev1',
          7: 'prev1 takes the newly computed value',
          9: 'prev1 now holds ways(n)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking n (number of stairs)',
      2: 'Edge case: 0 or 1 stairs has exactly 1 way',
      4: 'Create DP array of size n+1, initialized to 0',
      5: 'Base cases: 1 way to reach step 0 and step 1',
      6: 'Fill in each step from 2 up to n',
      7: 'Ways to reach step i = ways from (i-1) + ways from (i-2)',
      8: 'Answer is the number of ways to reach step n',
    },
    javascript: {
      1: 'Define function taking n (number of stairs)',
      2: 'Edge case: 0 or 1 stairs has exactly 1 way',
      3: 'Create DP array of size n+1, initialized to 0',
      4: 'Base case: 1 way to reach step 0',
      5: 'Base case: 1 way to reach step 1',
      6: 'Fill in each step from 2 up to n',
      7: 'Ways to reach step i = ways from (i-1) + ways from (i-2)',
      9: 'Answer is the number of ways to reach step n',
    },
    java: {
      1: 'Define function taking n (number of stairs)',
      2: 'Edge case: 0 or 1 stairs has exactly 1 way',
      3: 'Create DP array of size n+1',
      4: 'Base case: 1 way to reach step 0',
      5: 'Base case: 1 way to reach step 1',
      6: 'Fill in each step from 2 up to n',
      7: 'Ways to reach step i = ways from (i-1) + ways from (i-2)',
      9: 'Answer is the number of ways to reach step n',
    },
  },
};
