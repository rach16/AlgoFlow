import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runIntegerBreak(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];

  // dp[i] = largest product obtainable by breaking i into 2+ positive parts
  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => `${i}`);

  steps.push({
    state: { dp: [...dp], dpLabels, n, result: null },
    highlights: [],
    message: `Break ${n} into at least two positive parts and maximize their product. dp[i] = best product for i, built from smaller answers`,
    codeLine: 1,
  });

  for (let i = 0; i <= n; i++) dp[i] = 0;
  if (n >= 1) dp[1] = 1;
  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: n >= 1 ? [1] : [], n, result: null },
    highlights: n >= 1 ? [1] : [],
    message: `Seed dp[1] = 1: a lone 1 cannot be split further, but it is worth 1 as a factor inside a bigger product`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 2; i <= n; i++) {
    steps.push({
      state: { dp: [...dp], dpLabels, dpSecondary: [i], n, result: null },
      highlights: [i],
      pointers: { i },
      message: `i = ${i}: split off a first part j, then either stop at (${i} − j) or break it further into dp[${i} − j]`,
      codeLine: 4,
      action: 'visit',
    });

    for (let j = 1; j < i; j++) {
      const stopHere = j * (i - j);
      const breakMore = j * (dp[i - j] as number);
      const candidate = Math.max(stopHere, breakMore);
      const before = dp[i] as number;
      if (candidate > before) {
        dp[i] = candidate;
        const winner = breakMore > stopHere ? `${j} × dp[${i - j}] = ${j} × ${dp[i - j]}` : `${j} × ${i - j}`;
        steps.push({
          state: {
            dp: [...dp],
            dpLabels,
            dpHighlights: [i - j],
            dpSecondary: [i],
            n,
            result: null,
          },
          highlights: [i],
          pointers: { i, j },
          message: `j = ${j}: best of (${j}×${i - j} = ${stopHere}) and (${j}×dp[${i - j}] = ${breakMore}) is ${candidate} via ${winner} — dp[${i}] rises ${before} → ${candidate}`,
          codeLine: 6,
          action: 'insert',
        });
      }
    }
  }

  steps.push({
    state: { dp: [...dp], dpLabels, dpHighlights: [n], n, result: dp[n] },
    highlights: [n],
    message: `Result: the maximum product from breaking ${n} is ${dp[n]}`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

function runIntegerBreakMath(input: unknown): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let n = input as number;
  const original = n;
  const factors: number[] = [];

  steps.push({
    state: { nums: [], result: null },
    highlights: [],
    message: `Math shortcut: for a fixed sum, 3s beat every other factor (3×3 = 9 > 2×2×2 = 8 for the same sum 6), so peel off as many 3s as possible`,
    codeLine: 1,
  });

  if (n <= 3) {
    steps.push({
      state: { nums: [1, n - 1], result: n - 1 },
      highlights: [0, 1],
      message: `n = ${n} ≤ 3 must be split into at least two parts, so the best possible is 1 × ${n - 1} = ${n - 1}`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  let result = 1;
  steps.push({
    state: { nums: [], result: null },
    highlights: [],
    message: `Start with product = 1 and a remaining sum of ${n}. Never let the remainder drop below 2 — a leftover 1 would waste a whole unit`,
    codeLine: 4,
  });

  while (n > 4) {
    result *= 3;
    n -= 3;
    factors.push(3);
    steps.push({
      state: { nums: [...factors], result: null },
      highlights: [factors.length - 1],
      pointers: { remaining: n },
      message: `Peel off a 3: product = ${result}, remaining sum = ${n}. Stop at 4 because 4 is better left whole (2×2 = 4) than split as 3 + 1 (3×1 = 3)`,
      codeLine: 6,
      action: 'push',
    });
  }

  factors.push(n);
  result *= n;
  steps.push({
    state: { nums: [...factors], result },
    highlights: [factors.length - 1],
    message: `Remaining ${n} (which is 2, 3, or 4) becomes the last factor: ${factors.join(' × ')} = ${result}`,
    codeLine: 8,
    action: 'insert',
  });

  steps.push({
    state: { nums: [...factors], result },
    highlights: factors.map((_, i) => i),
    message: `Result: ${original} = ${factors.join(' + ')} gives the maximum product ${result} — found in O(n/3) steps with no DP table at all`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const integerBreak: Algorithm = {
  id: 'integer-break',
  name: 'Integer Break',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[i] = max over j of j·(i-j) and j·dp[i-j]',
  description:
    'Given an integer n, break it into the sum of k positive integers with k >= 2, and maximize the product of those integers. Return the maximum product you can get.',
  problemUrl: 'https://leetcode.com/problems/integer-break/',
  code: {
    python: `def integerBreak(n):
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        for j in range(1, i):
            dp[i] = max(dp[i], j * (i - j), j * dp[i - j])
    return dp[n]`,
    javascript: `function integerBreak(n) {
    const dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        for (let j = 1; j < i; j++) {
            dp[i] = Math.max(dp[i], j * (i - j), j * dp[i - j]);
        }
    }
    return dp[n];
}`,
    java: `public static int integerBreak(int n) {
    int[] dp = new int[n + 1];
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        for (int j = 1; j < i; j++) {
            dp[i] = Math.max(dp[i],
                    Math.max(j * (i - j), j * dp[i - j]));
        }
    }
    return dp[n];
}`,
  },
  defaultInput: 8,
  run: runIntegerBreak,
  optimalApproachName: 'Bottom-Up DP',
  approaches: [
    {
      id: 'math-threes',
      name: 'Math (Peel Off 3s)',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Skip the table entirely: for any fixed sum the product is maximized by using as many 3s as possible, leaving a final remainder of 2, 3, or 4.',
      code: {
        python: `def integerBreak(n):
    if n <= 3:
        return n - 1
    result = 1
    while n > 4:
        result *= 3
        n -= 3
    return result * n`,
        javascript: `function integerBreak(n) {
    if (n <= 3) return n - 1;
    let result = 1;
    while (n > 4) {
        result *= 3;
        n -= 3;
    }
    return result * n;
}`,
        java: `public static int integerBreak(int n) {
    if (n <= 3) return n - 1;
    int result = 1;
    while (n > 4) {
        result *= 3;
        n -= 3;
    }
    return result * n;
}`,
      },
      run: runIntegerBreakMath,
      lineExplanations: {
        python: {
          1: 'Define function taking n',
          2: 'Small n must still be split into two parts',
          3: 'Best split of 2 or 3 is 1 × (n-1)',
          4: 'Running product of the factors chosen so far',
          5: 'Keep peeling 3s while more than 4 remains',
          6: 'Each 3 multiplies into the product',
          7: 'Shrink the remaining sum by 3',
          8: 'Whatever is left (2, 3, or 4) is the final factor',
        },
        javascript: {
          1: 'Define function taking n',
          2: 'Small n must still be split: best is 1 × (n-1)',
          3: 'Running product of the factors chosen so far',
          4: 'Keep peeling 3s while more than 4 remains',
          5: 'Each 3 multiplies into the product',
          6: 'Shrink the remaining sum by 3',
          8: 'Whatever is left (2, 3, or 4) is the final factor',
        },
        java: {
          1: 'Define method taking n',
          2: 'Small n must still be split: best is 1 × (n-1)',
          3: 'Running product of the factors chosen so far',
          4: 'Keep peeling 3s while more than 4 remains',
          5: 'Each 3 multiplies into the product',
          6: 'Shrink the remaining sum by 3',
          8: 'Whatever is left (2, 3, or 4) is the final factor',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking n',
      2: 'dp[i] = best product from breaking i into 2+ parts',
      3: 'Seed dp[1] = 1 so it can serve as a factor',
      4: 'Solve every value from 2 up to n',
      5: 'Try each first part j',
      6: 'Either stop at (i-j) or break it further into dp[i-j]',
      7: 'dp[n] is the maximum product for n',
    },
    javascript: {
      1: 'Define function taking n',
      2: 'dp[i] = best product from breaking i into 2+ parts',
      3: 'Seed dp[1] = 1 so it can serve as a factor',
      4: 'Solve every value from 2 up to n',
      5: 'Try each first part j',
      6: 'Either stop at (i-j) or break it further into dp[i-j]',
      9: 'dp[n] is the maximum product for n',
    },
    java: {
      1: 'Define method taking n',
      2: 'dp[i] = best product from breaking i into 2+ parts',
      3: 'Seed dp[1] = 1 so it can serve as a factor',
      4: 'Solve every value from 2 up to n',
      5: 'Try each first part j',
      6: 'Compare against the current best for i',
      7: 'Either stop at (i-j) or break it further into dp[i-j]',
      10: 'dp[n] is the maximum product for n',
    },
  },
};
