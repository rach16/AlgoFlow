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

function runNumberOf1BitsShiftCheck(input: unknown): AlgorithmStep[] {
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
    message: `Inspect ${original} (binary: ${toBinary(original)}) one bit at a time: check the last bit with n & 1, then shift right.`,
    codeLine: 1,
  } as AlgorithmStep);

  let count = 0;
  let position = 0;

  while (n !== 0) {
    const bit = n & 1;
    count += bit;
    const before = n;
    n = n >>> 1;

    steps.push({
      state: {
        bits: [
          { value: before, bits: toBinary(before), label: `n (bit ${position})` },
          { value: bit, bits: toBinary(bit), label: `n & 1 = ${bit}` },
          { value: n, bits: toBinary(n), label: `n >> 1` },
        ],
        bitHighlights: [1],
        count,
        result: `1-bits so far: ${count}`,
      },
      highlights: [],
      message: `Bit ${position}: n & 1 = ${bit} — ${bit === 1 ? `it's a 1-bit, count becomes ${count}` : 'a 0-bit, count stays ' + count}. Shift right to expose the next bit.`,
      codeLine: 4,
      action: bit === 1 ? 'found' : 'visit',
    } as AlgorithmStep);

    position++;
  }

  steps.push({
    state: {
      bits: [{ value: original, bits: toBinary(original), label: 'input' }],
      bitHighlights: [0],
      count,
      result: `Number of 1-bits: ${count}`,
    },
    highlights: [],
    message: `n reached 0 after ${position} shifts — no bits left to inspect. ${original} has ${count} set bits. Note: this checks every bit, while n & (n-1) jumps straight between 1-bits.`,
    codeLine: 6,
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
    java: `public static int hammingWeight(int n) {
    int count = 0;
    while (n != 0) {
        n &= n - 1;
        count++;
    }
    return count;
}`,
  },
  defaultInput: 11,
  run: runNumberOf1Bits,
  optimalApproachName: "Brian Kernighan's n & (n-1)",
  approaches: [
    {
      id: 'bit-by-bit-shift',
      name: 'Bit-by-Bit Shift',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      description:
        'Check the last bit with n & 1 and shift right, inspecting every bit — simpler than Brian Kernighan, but loops once per bit instead of once per 1-bit.',
      code: {
        python: `def hammingWeight(n):
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count`,
        javascript: `function hammingWeight(n) {
    let count = 0;
    while (n !== 0) {
        count += n & 1;
        n >>>= 1;
    }
    return count;
}`,
        java: `public static int hammingWeight(int n) {
    int count = 0;
    while (n != 0) {
        count += n & 1;
        n >>>= 1;
    }
    return count;
}`,
      },
      run: runNumberOf1BitsShiftCheck,
      lineExplanations: {
        python: {
          1: 'Define function taking integer n',
          2: 'Initialize count of set bits to 0',
          3: 'Loop until every bit has been shifted out',
          4: 'n & 1 isolates the last bit — add it (1 or 0) to count',
          5: 'Shift right by 1 to expose the next bit',
          6: 'Return total number of 1-bits',
        },
        javascript: {
          1: 'Define function taking integer n',
          2: 'Initialize count of set bits to 0',
          3: 'Loop until every bit has been shifted out',
          4: 'n & 1 isolates the last bit — add it (1 or 0) to count',
          5: 'Unsigned right shift by 1 to expose the next bit',
          7: 'Return total number of 1-bits',
        },
        java: {
          1: 'Define method taking integer n',
          2: 'Initialize count of set bits to 0',
          3: 'Loop until every bit has been shifted out',
          4: 'n & 1 isolates the last bit — add it (1 or 0) to count',
          5: 'Unsigned right shift (>>>) works for negative n too',
          7: 'Return total number of 1-bits',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking integer n',
      2: 'Initialize count of set bits to 0',
      3: 'Loop while n has any set bits',
      4: 'Clear lowest set bit using n & (n-1) trick',
      5: 'Increment count for each cleared bit',
      6: 'Return total number of 1-bits',
    },
    javascript: {
      1: 'Define function taking integer n',
      2: 'Initialize count of set bits to 0',
      3: 'Loop while n has any set bits',
      4: 'Clear lowest set bit using n & (n-1) trick',
      5: 'Increment count for each cleared bit',
      7: 'Return total number of 1-bits',
    },
    java: {
      1: 'Define method taking integer n',
      2: 'Initialize count of set bits to 0',
      3: 'Loop while n has any set bits',
      4: 'Clear lowest set bit using n & (n-1) trick',
      5: 'Increment count for each cleared bit',
      7: 'Return total number of 1-bits',
    },
  },
};
