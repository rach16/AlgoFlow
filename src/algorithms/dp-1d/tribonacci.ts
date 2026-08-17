import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runTribonacci(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];

  // Display array so the viewer can watch the sequence grow, even though the
  // algorithm itself only ever keeps three variables alive.
  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => `T${i}`);

  steps.push({
    state: { dp: [...dp], dpLabels, n, result: null },
    highlights: [],
    message: `Tribonacci: every term is the sum of the previous THREE terms. Only three values are ever needed, so three rolling variables replace the whole table`,
    codeLine: 1,
  });

  if (n === 0) {
    dp[0] = 0;
    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [0], n, result: 0 },
      highlights: [0],
      message: `n = 0: T0 = 0 by definition. Result: 0`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  if (n < 3) {
    dp[n] = 1;
    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [n], n, result: 1 },
      highlights: [n],
      message: `n = ${n}: T1 and T2 are both seeded to 1. Result: 1`,
      codeLine: 5,
      action: 'found',
    });
    return steps;
  }

  let a = 0;
  let b = 1;
  let c = 1;
  dp[0] = 0;
  dp[1] = 1;
  dp[2] = 1;

  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [0, 1, 2], n, result: null },
    highlights: [0, 1, 2],
    message: `Seed the three variables: a = T0 = 0, b = T1 = 1, c = T2 = 1 — this trio is the algorithm's entire memory`,
    codeLine: 6,
    action: 'insert',
  });

  for (let i = 3; i <= n; i++) {
    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [i - 3, i - 2, i - 1], dpSecondary: [i], n, result: null },
      highlights: [i],
      message: `T${i} = T${i - 3} + T${i - 2} + T${i - 1} = ${a} + ${b} + ${c} = ${a + b + c}`,
      codeLine: 8,
      action: 'compare',
    });

    const next = a + b + c;
    a = b;
    b = c;
    c = next;
    dp[i] = next;

    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [i], n, result: null },
      highlights: [i],
      message: `T${i} = ${next}. Slide the window forward: a ← ${a}, b ← ${b}, c ← ${c}. Anything older is dropped`,
      codeLine: 8,
      action: 'insert',
    });
  }

  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [n], n, result: c },
    highlights: [n],
    message: `Result: T${n} = ${c}, computed in O(n) time with only O(1) memory`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runTribonacciDpArray(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];

  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => `T${i}`);

  steps.push({
    state: { dp: [...dp], dpLabels, n, result: null },
    highlights: [],
    message: `Keep the whole table: dp[i] stores T(i) so every previous answer stays readable — the classic bottom-up form of the same recurrence`,
    codeLine: 1,
  });

  if (n === 0) {
    dp[0] = 0;
    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [0], n, result: 0 },
      highlights: [0],
      message: `n = 0: T0 = 0 by definition. Result: 0`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  if (n < 3) {
    dp[n] = 1;
    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [n], n, result: 1 },
      highlights: [n],
      message: `n = ${n}: T1 = T2 = 1. Result: 1`,
      codeLine: 5,
      action: 'found',
    });
    return steps;
  }

  for (let i = 0; i <= n; i++) dp[i] = 0;
  steps.push({
    state: { dp: [...dp], dpLabels, n, result: null },
    highlights: [],
    message: `Allocate dp of size ${n + 1}, all zeros — dp[0] = 0 is already the correct base case`,
    codeLine: 6,
  });

  dp[1] = 1;
  dp[2] = 1;
  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [0, 1, 2], n, result: null },
    highlights: [0, 1, 2],
    message: `Base cases written: dp[0] = 0, dp[1] = 1, dp[2] = 1`,
    codeLine: 7,
    action: 'insert',
  });

  for (let i = 3; i <= n; i++) {
    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [i - 3, i - 2, i - 1], dpSecondary: [i], n, result: null },
      highlights: [i],
      message: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] + dp[${i - 3}] = ${dp[i - 1]} + ${dp[i - 2]} + ${dp[i - 3]}`,
      codeLine: 9,
      action: 'compare',
    });

    dp[i] = (dp[i - 1] as number) + (dp[i - 2] as number) + (dp[i - 3] as number);

    steps.push({
      state: { dp: [...dp], dpLabels, dpHighlights: [i], n, result: null },
      highlights: [i],
      message: `dp[${i}] = ${dp[i]} — stored in the table, and it stays there for later reads`,
      codeLine: 9,
      action: 'insert',
    });
  }

  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [n], n, result: dp[n] },
    highlights: [n],
    message: `Result: dp[${n}] = ${dp[n]}. Same O(n) time as the rolling version, but O(n) space for the table`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const tribonacci: Algorithm = {
  id: 'tribonacci',
  name: 'N-th Tribonacci Number',
  category: '1-D DP',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'DP — T(n) = T(n-1) + T(n-2) + T(n-3) with three rolling variables',
  description:
    'The Tribonacci sequence is defined by T0 = 0, T1 = 1, T2 = 1, and T(n+3) = T(n) + T(n+1) + T(n+2) for n >= 0. Given an integer n, return the value of T(n).',
  problemUrl: 'https://leetcode.com/problems/n-th-tribonacci-number/',
  code: {
    python: `def tribonacci(n):
    if n == 0:
        return 0
    if n < 3:
        return 1
    a, b, c = 0, 1, 1
    for i in range(3, n + 1):
        a, b, c = b, c, a + b + c
    return c`,
    javascript: `function tribonacci(n) {
    if (n === 0) return 0;
    if (n < 3) return 1;
    let a = 0, b = 1, c = 1;
    for (let i = 3; i <= n; i++) {
        const next = a + b + c;
        a = b;
        b = c;
        c = next;
    }
    return c;
}`,
    java: `public static int tribonacci(int n) {
    if (n == 0) return 0;
    if (n < 3) return 1;
    int a = 0, b = 1, c = 1;
    for (int i = 3; i <= n; i++) {
        int next = a + b + c;
        a = b;
        b = c;
        c = next;
    }
    return c;
}`,
  },
  defaultInput: 7,
  run: runTribonacci,
  optimalApproachName: 'Rolling Variables',
  approaches: [
    {
      id: 'dp-array-table',
      name: 'DP Array',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Fill an explicit dp table instead of rolling three variables — identical recurrence, but every intermediate Tribonacci value stays available afterwards.',
      code: {
        python: `def tribonacci(n):
    if n == 0:
        return 0
    if n < 3:
        return 1
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 1
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2] + dp[i-3]
    return dp[n]`,
        javascript: `function tribonacci(n) {
    if (n === 0) return 0;
    if (n < 3) return 1;
    const dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    dp[2] = 1;
    for (let i = 3; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2] + dp[i-3];
    }
    return dp[n];
}`,
        java: `public static int tribonacci(int n) {
    if (n == 0) return 0;
    if (n < 3) return 1;
    int[] dp = new int[n + 1];
    dp[1] = 1;
    dp[2] = 1;
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2] + dp[i-3];
    }
    return dp[n];
}`,
      },
      run: runTribonacciDpArray,
      lineExplanations: {
        python: {
          1: 'Define function taking n (which Tribonacci term to compute)',
          2: 'Base case check for T0',
          3: 'T0 is defined as 0',
          4: 'Base case check for T1 and T2',
          5: 'Both T1 and T2 are defined as 1',
          6: 'Allocate a table of size n+1, zero-filled (dp[0] = 0 is already correct)',
          7: 'Write the remaining two base cases',
          8: 'Fill the table from index 3 upward',
          9: 'Each term is the sum of the previous three table entries',
          10: 'dp[n] holds the answer, and the whole sequence is still available',
        },
        javascript: {
          1: 'Define function taking n (which Tribonacci term to compute)',
          2: 'Base case: T0 = 0',
          3: 'Base case: T1 = T2 = 1',
          4: 'Allocate a table of size n+1, zero-filled',
          5: 'Base case dp[1] = 1',
          6: 'Base case dp[2] = 1',
          7: 'Fill the table from index 3 upward',
          8: 'Each term is the sum of the previous three table entries',
          10: 'dp[n] holds the answer',
        },
        java: {
          1: 'Define method taking n (which Tribonacci term to compute)',
          2: 'Base case: T0 = 0',
          3: 'Base case: T1 = T2 = 1',
          4: 'Allocate an int array of size n+1 (zero-initialized)',
          5: 'Base case dp[1] = 1',
          6: 'Base case dp[2] = 1',
          7: 'Fill the table from index 3 upward',
          8: 'Each term is the sum of the previous three table entries',
          10: 'dp[n] holds the answer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking n (which Tribonacci term to compute)',
      2: 'Base case check for T0',
      3: 'T0 is defined as 0',
      4: 'Base case check for T1 and T2',
      5: 'Both T1 and T2 are defined as 1',
      6: 'Three variables hold T(i-3), T(i-2), T(i-1) — the only history the recurrence needs',
      7: 'Walk forward from index 3 to n',
      8: 'Sum the three, then shift all three variables one step forward',
      9: 'c now holds T(n)',
    },
    javascript: {
      1: 'Define function taking n (which Tribonacci term to compute)',
      2: 'Base case: T0 = 0',
      3: 'Base case: T1 = T2 = 1',
      4: 'Three variables hold T(i-3), T(i-2), T(i-1)',
      5: 'Walk forward from index 3 to n',
      6: 'Next term is the sum of the previous three',
      7: 'Shift: a takes b',
      8: 'Shift: b takes c',
      9: 'Shift: c takes the freshly computed term',
      11: 'c now holds T(n)',
    },
    java: {
      1: 'Define method taking n (which Tribonacci term to compute)',
      2: 'Base case: T0 = 0',
      3: 'Base case: T1 = T2 = 1',
      4: 'Three variables hold T(i-3), T(i-2), T(i-1)',
      5: 'Walk forward from index 3 to n',
      6: 'Next term is the sum of the previous three',
      7: 'Shift: a takes b',
      8: 'Shift: b takes c',
      9: 'Shift: c takes the freshly computed term',
      11: 'c now holds T(n)',
    },
  },
};
