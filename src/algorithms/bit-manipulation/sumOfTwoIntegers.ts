import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary(n: number, width: number = 8): string {
  return (n >>> 0).toString(2).padStart(width, '0').slice(-width);
}

function runSumOfTwoIntegers(input: unknown): AlgorithmStep[] {
  const { a: origA, b: origB } = input as { a: number; b: number };
  let a = origA;
  let b = origB;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      bits: [
        { value: a, bits: toBinary(a), label: `a = ${a}` },
        { value: b, bits: toBinary(b), label: `b = ${b}` },
      ],
      bitHighlights: [],
      result: `Computing ${a} + ${b} without + operator`,
    },
    highlights: [],
    message: `Add ${a} + ${b} using only bit operations. XOR for sum without carry, AND + shift for carry.`,
    codeLine: 1,
  } as AlgorithmStep);

  let iteration = 0;
  const maxIter = 20;

  while (b !== 0 && iteration < maxIter) {
    const carry = (a & b) << 1;
    const sum = a ^ b;

    steps.push({
      state: {
        bits: [
          { value: a, bits: toBinary(a), label: `a = ${a}` },
          { value: b, bits: toBinary(b), label: `b = ${b}` },
          { value: sum, bits: toBinary(sum), label: `a XOR b = ${sum}` },
          { value: carry, bits: toBinary(carry), label: `(a AND b) << 1 = ${carry}` },
        ],
        bitHighlights: [2, 3],
        result: `Iteration ${iteration + 1}: sum=${sum}, carry=${carry}`,
      },
      highlights: [],
      message: `Iter ${iteration + 1}: a XOR b = ${sum} (sum bits), (a AND b) << 1 = ${carry} (carry bits).`,
      codeLine: 3,
      action: 'compare',
    } as AlgorithmStep);

    a = sum;
    b = carry;

    steps.push({
      state: {
        bits: [
          { value: a, bits: toBinary(a), label: `a = ${a}` },
          { value: b, bits: toBinary(b), label: `b (carry) = ${b}` },
        ],
        bitHighlights: [],
        result: `a = ${a}, b = ${b}`,
      },
      highlights: [],
      message: `Update: a = ${a}, b = ${b}. ${b === 0 ? 'No carry left!' : 'Continue...'}`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    iteration++;
  }

  steps.push({
    state: {
      bits: [
        { value: a, bits: toBinary(a), label: `result = ${a}` },
      ],
      bitHighlights: [0],
      result: `${origA} + ${origB} = ${a}`,
    },
    highlights: [],
    message: `Done! ${origA} + ${origB} = ${a} (no + operator used).`,
    codeLine: 7,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runSumOfTwoIntegersRecursive(input: unknown): AlgorithmStep[] {
  const { a: origA, b: origB } = input as { a: number; b: number };
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      bits: [
        { value: origA, bits: toBinary(origA), label: `a = ${origA}` },
        { value: origB, bits: toBinary(origB), label: `b = ${origB}` },
      ],
      bitHighlights: [],
      result: `Computing getSum(${origA}, ${origB}) recursively`,
    },
    highlights: [],
    message: `Same XOR/carry idea, expressed as recursion: getSum(a, b) = getSum(a ^ b, (a & b) << 1), bottoming out when the carry b reaches 0.`,
    codeLine: 1,
  } as AlgorithmStep);

  let a = origA;
  let b = origB;
  let depth = 0;
  const maxDepth = 20;

  while (depth < maxDepth) {
    if (b === 0) {
      steps.push({
        state: {
          bits: [
            { value: a, bits: toBinary(a), label: `a = ${a}` },
            { value: 0, bits: toBinary(0), label: 'b = 0 (base case)' },
          ],
          bitHighlights: [1],
          result: `Base case at depth ${depth}: return ${a}`,
        },
        highlights: [],
        message: `Depth ${depth}: b = 0, base case reached — no carry left, so a = ${a} is the final sum. The recursion unwinds, passing ${a} back up.`,
        codeLine: 3,
        action: 'found',
      } as AlgorithmStep);
      break;
    }

    const partial = a ^ b;
    const carry = (a & b) << 1;

    steps.push({
      state: {
        bits: [
          { value: a, bits: toBinary(a), label: `a = ${a}` },
          { value: b, bits: toBinary(b), label: `b = ${b}` },
          { value: partial, bits: toBinary(partial), label: `a XOR b = ${partial}` },
          { value: carry, bits: toBinary(carry), label: `(a AND b) << 1 = ${carry}` },
        ],
        bitHighlights: [2, 3],
        result: `Depth ${depth}: partial=${partial}, carry=${carry}`,
      },
      highlights: [],
      message: `Depth ${depth}: partial sum = ${a} XOR ${b} = ${partial}, carry = (${a} AND ${b}) << 1 = ${carry}.`,
      codeLine: 5,
      action: 'compare',
    } as AlgorithmStep);

    steps.push({
      state: {
        bits: [
          { value: partial, bits: toBinary(partial), label: `next a = ${partial}` },
          { value: carry, bits: toBinary(carry), label: `next b = ${carry}` },
        ],
        bitHighlights: [],
        result: `Recurse: getSum(${partial}, ${carry})`,
      },
      highlights: [],
      message: `Recurse: getSum(${partial}, ${carry}) — each call pushes carries one bit left, so the carry must hit 0.`,
      codeLine: 7,
      action: 'push',
    } as AlgorithmStep);

    a = partial;
    b = carry;
    depth++;
  }

  steps.push({
    state: {
      bits: [{ value: a, bits: toBinary(a), label: `result = ${a}` }],
      bitHighlights: [0],
      result: `${origA} + ${origB} = ${a}`,
    },
    highlights: [],
    message: `Done! ${origA} + ${origB} = ${a}, computed with ${depth} recursive call${depth === 1 ? '' : 's'} and no + operator.`,
    codeLine: 4,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const sumOfTwoIntegers: Algorithm = {
  id: 'sum-of-two-integers',
  name: 'Sum of Two Integers',
  category: 'Bit Manipulation',
  difficulty: 'Medium',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(1)',
  pattern: 'Bit Manipulation — XOR for sum, AND+shift for carry',
  description:
    'Given two integers a and b, return the sum of the two integers without using the operators + and -.',
  problemUrl: 'https://leetcode.com/problems/sum-of-two-integers/',
  code: {
    python: `def getSum(a, b):
    mask = 0xFFFFFFFF
    while b & mask:
        carry = (a & b) << 1
        a = a ^ b
        b = carry
    return a if b == 0 else a & mask`,
    javascript: `function getSum(a, b) {
    while (b !== 0) {
        const carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;
}`,
    java: `public static int getSum(int a, int b) {
    while (b != 0) {
        int carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;
}`,
  },
  defaultInput: { a: 1, b: 2 },
  run: runSumOfTwoIntegers,
  optimalApproachName: 'Iterative XOR + Carry',
  approaches: [
    {
      id: 'recursive-xor-carry',
      name: 'Recursive XOR + Carry',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      description:
        'Expresses the same XOR/carry adder as recursion — getSum(a ^ b, (a & b) << 1) — with the carry hitting 0 as the base case, instead of an explicit while loop.',
      code: {
        python: `def getSum(a, b):
    MASK = 0xFFFFFFFF
    if b == 0:
        return a if a <= 0x7FFFFFFF else ~(a ^ MASK)
    partial = (a ^ b) & MASK
    carry = ((a & b) << 1) & MASK
    return getSum(partial, carry)`,
        javascript: `function getSum(a, b) {
    if (b === 0) {
        return a;
    }
    const partial = a ^ b;
    const carry = (a & b) << 1;
    return getSum(partial, carry);
}`,
        java: `public static int getSum(int a, int b) {
    if (b == 0) {
        return a;
    }
    int partial = a ^ b;
    int carry = (a & b) << 1;
    return getSum(partial, carry);
}`,
      },
      run: runSumOfTwoIntegersRecursive,
      lineExplanations: {
        python: {
          1: 'Define recursive function taking integers a, b',
          2: 'Mask to simulate 32-bit overflow (Python ints are unbounded)',
          3: 'Base case: no carry left to add',
          4: 'Convert back to a signed 32-bit value if needed',
          5: 'XOR adds each bit pair, ignoring carries',
          6: 'AND finds carry positions; shift moves them left one place',
          7: 'Recurse: add the partial sum and the carries',
        },
        javascript: {
          1: 'Define recursive function taking integers a, b',
          2: 'Base case: no carry left to add',
          3: 'a holds the completed sum',
          5: 'XOR adds each bit pair, ignoring carries',
          6: 'AND finds carry positions; shift moves them left one place',
          7: 'Recurse: add the partial sum and the carries',
        },
        java: {
          1: 'Define recursive method taking integers a, b',
          2: 'Base case: no carry left to add',
          3: 'a holds the completed sum',
          5: 'XOR adds each bit pair, ignoring carries',
          6: 'AND finds carry positions; shift moves them left one place',
          7: 'Recurse: add the partial sum and the carries',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking two integers a, b',
      2: 'Mask to simulate 32-bit overflow',
      3: 'Loop while there are carry bits',
      4: 'Compute carry: AND then shift left',
      5: 'Compute sum without carry using XOR',
      6: 'Set b to carry for next iteration',
      7: 'Handle negative numbers via mask',
    },
    javascript: {
      1: 'Define function taking two integers a, b',
      2: 'Loop while there are carry bits',
      3: 'Compute carry: AND then shift left',
      4: 'Compute sum without carry using XOR',
      5: 'Set b to carry for next iteration',
      7: 'Return final sum stored in a',
    },
    java: {
      1: 'Define function taking two integers a, b',
      2: 'Loop while there are carry bits',
      3: 'Compute carry: AND then shift left',
      4: 'Compute sum without carry using XOR',
      5: 'Set b to carry for next iteration',
      7: 'Return final sum stored in a',
    },
  },
};
