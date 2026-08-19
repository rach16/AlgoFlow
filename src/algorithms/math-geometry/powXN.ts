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

function runPowXNIterative(input: unknown): AlgorithmStep[] {
  const { x, n } = input as PowInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      nums: [x],
      count: n,
      result: `Computing ${x}^${n} iteratively`,
    },
    highlights: [],
    message: `Iterative binary exponentiation: read the bits of ${n} (binary ${Math.abs(n).toString(2)}) from right to left, squaring the base each bit and multiplying it in when the bit is 1. No recursion stack.`,
    codeLine: 1,
  });

  let base = x;
  let exp = n;

  if (exp < 0) {
    base = 1 / base;
    exp = -exp;

    steps.push({
      state: {
        nums: [base],
        count: exp,
        result: `Negative exponent: base -> 1/${x} = ${base}`,
      },
      highlights: [],
      message: `Negative exponent: invert the base (x -> 1/x) and make the exponent positive. ${x}^${n} = (1/${x})^${exp}.`,
      codeLine: 3,
      action: 'visit',
    });
  }

  let result = 1;
  let iteration = 0;

  steps.push({
    state: {
      nums: [base],
      count: exp,
      result: `result = 1, base = ${base}, exp = ${exp} (binary ${exp.toString(2)})`,
    },
    highlights: [],
    message: `Start with result = 1. Each loop pass consumes one bit of the exponent.`,
    codeLine: 5,
    action: 'visit',
  });

  while (exp > 0 && iteration < 40) {
    const bit = exp % 2;

    if (bit === 1) {
      const prev = result;
      result *= base;

      steps.push({
        state: {
          nums: [base],
          count: exp,
          result: `Bit 1: result = ${prev} * ${base} = ${result}`,
        },
        highlights: [],
        message: `Lowest bit of ${exp} (binary ${exp.toString(2)}) is 1 — this power of the base belongs in the answer: result = ${prev} * ${base} = ${result}.`,
        codeLine: 8,
        action: 'insert',
      });
    } else {
      steps.push({
        state: {
          nums: [base],
          count: exp,
          result: `Bit 0: result stays ${result}`,
        },
        highlights: [],
        message: `Lowest bit of ${exp} (binary ${exp.toString(2)}) is 0 — skip the multiply; result stays ${result}.`,
        codeLine: 7,
        action: 'compare',
      });
    }

    const prevBase = base;
    base *= base;
    exp = Math.floor(exp / 2);

    steps.push({
      state: {
        nums: [base],
        count: exp,
        result: `base = ${prevBase}^2 = ${base}, exp -> ${exp}`,
      },
      highlights: [],
      message: `Square the base for the next bit (${prevBase}^2 = ${base}) and halve the exponent to ${exp}.`,
      codeLine: 10,
      action: 'swap',
    });

    iteration++;
  }

  steps.push({
    state: {
      nums: [x],
      count: n,
      result: `${x}^${n} = ${result}`,
    },
    highlights: [],
    message: `Exponent exhausted. ${x}^${n} = ${result} — computed in ~log2(${Math.abs(n) || 1}) squarings instead of ${Math.abs(n)} multiplications.`,
    codeLine: 11,
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
  spaceComplexity: 'O(log n)',
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
    java: `public static double myPow(double x, int n) {
    if (n == 0) return 1.0;
    if (n == Integer.MIN_VALUE) {
        return myPow(x * x, n / 2);
    }
    if (n < 0) {
        x = 1 / x;
        n = -n;
    }
    double result = 1.0;
    while (n > 0) {
        if ((n & 1) == 1) {
            result *= x;
        }
        x *= x;
        n >>= 1;
    }
    return result;
}`,
  },
  defaultInput: { x: 2.0, n: 10 },
  run: runPowXN,
  optimalApproachName: 'Recursive Fast Exponentiation',
  approaches: [
    {
      id: 'iterative-binary-exponentiation',
      name: 'Iterative Binary Exponentiation',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description:
        'Same square-and-multiply idea as the recursion, but driven by the bits of n in a loop — no call stack, and each bit of the exponent is processed exactly once.',
      code: {
        python: `def myPow(x, n):
    if n < 0:
        x = 1 / x
        n = -n
    result = 1.0
    while n > 0:
        if n % 2 == 1:
            result *= x
        x *= x
        n //= 2
    return result`,
        javascript: `function myPow(x, n) {
    if (n < 0) {
        x = 1 / x;
        n = -n;
    }
    let result = 1;
    while (n > 0) {
        if (n % 2 === 1) {
            result *= x;
        }
        x *= x;
        n = Math.floor(n / 2);
    }
    return result;
}`,
        java: `public static double myPow(double x, int n) {
    long e = n;
    if (e < 0) {
        x = 1 / x;
        e = -e;
    }
    double result = 1.0;
    while (e > 0) {
        if ((e & 1) == 1) {
            result *= x;
        }
        x *= x;
        e >>= 1;
    }
    return result;
}`,
      },
      run: runPowXNIterative,
      lineExplanations: {
        python: {
          1: 'Define function taking base x and exponent n',
          2: 'Negative exponent?',
          3: 'Invert the base: x^(-n) = (1/x)^n',
          4: 'Work with a positive exponent',
          5: 'Accumulator starts at 1 (empty product)',
          6: 'Loop once per bit of the exponent',
          7: 'Is the lowest bit of n set?',
          8: 'This power of the base belongs in the answer',
          9: 'Square the base — it now represents the next bit',
          10: 'Shift the exponent right by one bit',
          11: 'All bits consumed: result holds x^n',
        },
        javascript: {
          1: 'Define function taking base x and exponent n',
          2: 'Negative exponent?',
          3: 'Invert the base: x^(-n) = (1/x)^n',
          4: 'Work with a positive exponent',
          6: 'Accumulator starts at 1 (empty product)',
          7: 'Loop once per bit of the exponent',
          8: 'Is the lowest bit of n set?',
          9: 'This power of the base belongs in the answer',
          11: 'Square the base — it now represents the next bit',
          12: 'Shift the exponent right by one bit',
          14: 'All bits consumed: result holds x^n',
        },
        java: {
          1: 'Define method taking base x and exponent n',
          2: 'Copy n into a long so -Integer.MIN_VALUE cannot overflow',
          3: 'Negative exponent?',
          4: 'Invert the base: x^(-n) = (1/x)^n',
          5: 'Work with a positive exponent',
          7: 'Accumulator starts at 1 (empty product)',
          8: 'Loop once per bit of the exponent',
          9: 'Is the lowest bit set (bitwise AND)?',
          10: 'This power of the base belongs in the answer',
          12: 'Square the base — it now represents the next bit',
          13: 'Shift the exponent right by one bit',
          15: 'All bits consumed: result holds x^n',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking base x and exponent n',
      2: 'Base case: any number to power 0 is 1',
      3: 'Return 1',
      4: 'Handle negative exponent via reciprocal',
      5: 'Return 1 / x^|n|',
      6: 'Even exponent: use x^n = (x^(n/2))^2',
      7: 'Compute half power recursively',
      8: 'Square the half result',
      10: 'Odd exponent: x^n = x * x^(n-1)',
    },
    javascript: {
      1: 'Define function taking base x and exponent n',
      2: 'Base case: any number to power 0 is 1',
      3: 'Handle negative exponent via reciprocal',
      4: 'Even exponent: compute half then square',
      5: 'Compute half power recursively',
      6: 'Return half squared',
      8: 'Odd exponent: x * x^(n-1)',
    },
    java: {
      1: 'Define method taking base x and exponent n',
      2: 'Base case: any number to power 0 is 1.0',
      3: 'Handle Integer.MIN_VALUE overflow case',
      4: 'Square base and halve exponent',
      6: 'Handle negative exponent',
      7: 'Invert base for negative power',
      8: 'Make exponent positive',
      10: 'Initialize result accumulator',
      11: 'Iterative binary exponentiation loop',
      12: 'If current bit is 1, multiply result',
      13: 'Multiply result by current base',
      15: 'Square the base for next bit',
      16: 'Shift exponent right by one bit',
      18: 'Return computed power',
    },
  },
};
