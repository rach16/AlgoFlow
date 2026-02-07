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
    java: `// Java implementation coming soon`,
  },
  defaultInput: { a: 1, b: 2 },
  run: runSumOfTwoIntegers,
};
