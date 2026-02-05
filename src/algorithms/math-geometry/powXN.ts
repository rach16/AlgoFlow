import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface PowInput {
  x: number;
  n: number;
}

function runPowXN(input: unknown): AlgorithmStep[] {
  const { x, n } = input as PowInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      nums: [x],
      count: n,
      result: `Computing ${x}^${n}`,
    },
    highlights: [],
    message: `Compute ${x}^${n} using binary exponentiation (fast power). O(log n) time.`,
    codeLine: 1,
  });

  function helper(base: number, exp: number): number {
    if (exp === 0) {
      steps.push({
        state: {
          nums: [base],
          count: exp,
          result: `base^0 = 1`,
        },
        highlights: [],
        message: `Exponent = 0. Return 1.`,
        codeLine: 3,
        action: 'found',
      });
      return 1;
    }

    if (exp < 0) {
      steps.push({
        state: {
          nums: [base],
          count: exp,
          result: `Negative exp: compute 1/(${base}^${-exp})`,
        },
        highlights: [],
        message: `Negative exponent. Compute 1 / (${base}^${-exp}).`,
        codeLine: 4,
        action: 'visit',
      });
      return 1 / helper(base, -exp);
    }

    if (exp % 2 === 0) {
      const half = helper(base, exp / 2);

      steps.push({
        state: {
          nums: [base],
          count: exp,
          result: `${base}^${exp} = (${base}^${exp / 2})^2 = ${half}^2 = ${half * half}`,
        },
        highlights: [],
        message: `Even: ${base}^${exp} = (${base}^${exp / 2})^2 = ${half}^2 = ${half * half}.`,
        codeLine: 6,
        action: 'compare',
      });

      return half * half;
    } else {
      const sub = helper(base, exp - 1);

      steps.push({
        state: {
          nums: [base],
          count: exp,
          result: `${base}^${exp} = ${base} * ${base}^${exp - 1} = ${base} * ${sub} = ${base * sub}`,
        },
        highlights: [],
        message: `Odd: ${base}^${exp} = ${base} * ${base}^${exp - 1} = ${base} * ${sub} = ${base * sub}.`,
        codeLine: 8,
        action: 'compare',
      });

      return base * sub;
    }
  }

  const result = helper(x, n);

  steps.push({
    state: {
      nums: [x],
      count: n,
      result: `${x}^${n} = ${result}`,
    },
    highlights: [],
    message: `Done! ${x}^${n} = ${result}.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const powXN: Algorithm = {
  id: 'pow-x-n',
  name: 'Pow(x, n)',
  category: 'Math & Geometry',
  difficulty: 'Medium',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Exponentiation — square and multiply',
  description:
    'Implement pow(x, n), which calculates x raised to the power n (i.e., x^n).',
  problemUrl: 'https://leetcode.com/problems/powx-n/',
  code: {
    python: `def myPow(x, n):
    if n == 0:
        return 1
    if n < 0:
        return 1 / myPow(x, -n)
    if n % 2 == 0:
        half = myPow(x, n // 2)
        return half * half
    else:
        return x * myPow(x, n - 1)`,
    javascript: `function myPow(x, n) {
    if (n === 0) return 1;
    if (n < 0) return 1 / myPow(x, -n);
    if (n % 2 === 0) {
        const half = myPow(x, n / 2);
        return half * half;
    }
    return x * myPow(x, n - 1);
}`,
  },
  defaultInput: { x: 2.0, n: 10 },
  run: runPowXN,
};
