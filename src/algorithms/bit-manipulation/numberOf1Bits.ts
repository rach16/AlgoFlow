import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary(n: number, width: number = 32): string {
  return (n >>> 0).toString(2).padStart(width, '0');
}

function runNumberOf1Bits(input: unknown): AlgorithmStep[] {
  let n = (input as number) >>> 0; // Ensure unsigned
  const original = n;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      bits: [{ value: original, bits: toBinary(original), label: 'input' }],
      bitHighlights: [],
      count: 0,
      result: `Counting 1-bits in ${original}`,
    },
    highlights: [],
    message: `Count the number of 1-bits in ${original} (binary: ${toBinary(original)}). Use n & (n-1) trick.`,
    codeLine: 1,
  } as AlgorithmStep);

  let count = 0;

  while (n !== 0) {
    const before = n;
    n = n & (n - 1); // Remove lowest set bit
    count++;

    // Find which bit was removed
    const removed = before ^ n;
    const bitPos = Math.log2(removed);

    steps.push({
      state: {
        bits: [
          { value: before, bits: toBinary(before), label: `before` },
          { value: before - 1, bits: toBinary(before - 1), label: `n - 1` },
          { value: n, bits: toBinary(n), label: `n & (n-1)` },
        ],
        bitHighlights: [2],
        count,
        result: `1-bits found: ${count}`,
      },
      highlights: [],
      message: `n & (n-1): removed bit at position ${bitPos}. n = ${n}. Count = ${count}.`,
      codeLine: 3,
      action: 'visit',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      bits: [{ value: original, bits: toBinary(original), label: 'input' }],
      bitHighlights: [0],
      count,
      result: `Number of 1-bits: ${count}`,
    },
    highlights: [],
    message: `Done! ${original} has ${count} set bits (1-bits).`,
    codeLine: 5,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const numberOf1Bits: Algorithm = {
  id: 'number-of-1-bits',
  name: 'Number of 1 Bits',
  category: 'Bit Manipulation',
  difficulty: 'Easy',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(1)',
  pattern: 'Bit Trick — n & (n-1) removes lowest set bit',
  description:
    'Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).',
  problemUrl: 'https://leetcode.com/problems/number-of-1-bits/',
  code: {
    python: `def hammingWeight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count`,
    javascript: `function hammingWeight(n) {
    let count = 0;
    while (n) {
        n &= n - 1;
        count++;
    }
    return count;
}`,
  },
  defaultInput: 11,
  run: runNumberOf1Bits,
};
