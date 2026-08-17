import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary32(n: number): string {
  return (n >>> 0).toString(2).padStart(32, '0');
}

function runReverseBits(input: unknown): AlgorithmStep[] {
  let n = (input as number) >>> 0;
  const original = n;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      bits: [{ value: original, bits: toBinary32(original), label: 'input' }],
      bits2: [{ value: 0, bits: toBinary32(0), label: 'result' }],
      bitHighlights: [],
      bitSecondary: [],
      result: `Reversing bits of ${original}`,
    },
    highlights: [],
    message: `Reverse all 32 bits of ${original}. Binary: ${toBinary32(original)}.`,
    codeLine: 1,
  } as AlgorithmStep);

  let result = 0;

  for (let i = 0; i < 32; i++) {
    const bit = n & 1;
    result = (result << 1) | bit;
    n = n >>> 1;

    // Only show every few steps to keep visualization manageable
    if (i < 8 || i >= 28 || i % 4 === 0) {
      steps.push({
        state: {
          bits: [{ value: n, bits: toBinary32(original).split('').reverse().slice(i + 1).reverse().join('').padStart(32, '0'), label: `remaining (bit ${i})` }],
          bits2: [{ value: result >>> 0, bits: toBinary32(result >>> 0), label: 'result so far' }],
          bitHighlights: [0],
          bitSecondary: [],
          result: `Bit ${i}: extracted ${bit}`,
        },
        highlights: [],
        message: `Bit ${i}: extract LSB = ${bit}. Shift result left, add bit. Result so far: ${result >>> 0}.`,
        codeLine: 3,
        action: 'visit',
      } as AlgorithmStep);
    }
  }

  const finalResult = result >>> 0;

  steps.push({
    state: {
      bits: [{ value: original, bits: toBinary32(original), label: 'original' }],
      bits2: [{ value: finalResult, bits: toBinary32(finalResult), label: 'reversed' }],
      bitHighlights: [],
      bitSecondary: [],
      result: `Reversed: ${finalResult}`,
    },
    highlights: [],
    message: `Done! ${original} (${toBinary32(original)}) reversed = ${finalResult} (${toBinary32(finalResult)}).`,
    codeLine: 5,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runReverseBitsDivideConquer(input: unknown): AlgorithmStep[] {
  const original = (input as number) >>> 0;
  let n = original;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      bits: [{ value: original, bits: toBinary32(original), label: 'input' }],
      bits2: [{ value: original, bits: toBinary32(original), label: 'working value' }],
      bitHighlights: [],
      bitSecondary: [],
      result: `Reversing bits of ${original}`,
    },
    highlights: [],
    message: `Divide & conquer: swap the two 16-bit halves, then swap bytes inside each half, then nibbles, pairs, and single bits — 5 swaps total instead of a 32-step loop.`,
    codeLine: 1,
  } as AlgorithmStep);

  const stages: { apply: (v: number) => number; label: string; explain: string; codeLine: number }[] = [
    {
      apply: (v) => ((v >>> 16) | (v << 16)) >>> 0,
      label: 'swap 16-bit halves',
      explain: 'Swap the top and bottom 16-bit halves',
      codeLine: 2,
    },
    {
      apply: (v) => ((((v & 0xff00ff00) >>> 8) | ((v & 0x00ff00ff) << 8)) >>> 0),
      label: 'swap bytes',
      explain: 'Within each 16-bit half, swap the two bytes',
      codeLine: 3,
    },
    {
      apply: (v) => ((((v & 0xf0f0f0f0) >>> 4) | ((v & 0x0f0f0f0f) << 4)) >>> 0),
      label: 'swap nibbles',
      explain: 'Within each byte, swap the two 4-bit nibbles',
      codeLine: 4,
    },
    {
      apply: (v) => ((((v & 0xcccccccc) >>> 2) | ((v & 0x33333333) << 2)) >>> 0),
      label: 'swap bit pairs',
      explain: 'Within each nibble, swap the two 2-bit pairs',
      codeLine: 5,
    },
    {
      apply: (v) => ((((v & 0xaaaaaaaa) >>> 1) | ((v & 0x55555555) << 1)) >>> 0),
      label: 'swap adjacent bits',
      explain: 'Finally, swap every pair of adjacent bits',
      codeLine: 6,
    },
  ];

  for (let s = 0; s < stages.length; s++) {
    const before = n;
    n = stages[s].apply(n);

    steps.push({
      state: {
        bits: [{ value: before, bits: toBinary32(before), label: `before: ${stages[s].label}` }],
        bits2: [{ value: n, bits: toBinary32(n), label: `after: ${stages[s].label}` }],
        bitHighlights: [0],
        bitSecondary: [],
        result: `Stage ${s + 1}/5: ${stages[s].label}`,
      },
      highlights: [],
      message: `Stage ${s + 1}: ${stages[s].explain}. ${toBinary32(before)} -> ${toBinary32(n)}.`,
      codeLine: stages[s].codeLine,
      action: 'swap',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      bits: [{ value: original, bits: toBinary32(original), label: 'original' }],
      bits2: [{ value: n, bits: toBinary32(n), label: 'reversed' }],
      bitHighlights: [],
      bitSecondary: [],
      result: `Reversed: ${n}`,
    },
    highlights: [],
    message: `Done! ${original} (${toBinary32(original)}) reversed = ${n} (${toBinary32(n)}). Every bit reached its mirror position in just 5 masked swaps.`,
    codeLine: 7,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const reverseBits: Algorithm = {
  id: 'reverse-bits',
  name: 'Reverse Bits',
  category: 'Bit Manipulation',
  difficulty: 'Easy',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(1)',
  pattern: 'Bit Shift — extract LSB, shift into result from left',
  description:
    'Reverse bits of a given 32 bits unsigned integer.',
  problemUrl: 'https://leetcode.com/problems/reverse-bits/',
  code: {
    python: `def reverseBits(n):
    result = 0
    for i in range(32):
        bit = n & 1
        result = (result << 1) | bit
        n >>= 1
    return result`,
    javascript: `function reverseBits(n) {
    let result = 0;
    for (let i = 0; i < 32; i++) {
        const bit = n & 1;
        result = (result << 1) | bit;
        n >>>= 1;
    }
    return result >>> 0;
}`,
    java: `public static int reverseBits(int n) {
    int result = 0;
    for (int i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>= 1;
    }
    return result;
}`,
  },
  defaultInput: 43261596,
  run: runReverseBits,
  optimalApproachName: 'Bit-by-Bit Shift',
  approaches: [
    {
      id: 'divide-and-conquer-masks',
      name: 'Divide & Conquer Masks',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      description:
        'Reverses all 32 bits in just 5 masked swap operations (halves, bytes, nibbles, pairs, single bits) instead of looping over each bit.',
      code: {
        python: `def reverseBits(n):
    n = ((n >> 16) | (n << 16)) & 0xFFFFFFFF
    n = ((n & 0xFF00FF00) >> 8) | ((n & 0x00FF00FF) << 8)
    n = ((n & 0xF0F0F0F0) >> 4) | ((n & 0x0F0F0F0F) << 4)
    n = ((n & 0xCCCCCCCC) >> 2) | ((n & 0x33333333) << 2)
    n = ((n & 0xAAAAAAAA) >> 1) | ((n & 0x55555555) << 1)
    return n`,
        javascript: `function reverseBits(n) {
    n = (n >>> 16) | (n << 16);
    n = ((n & 0xFF00FF00) >>> 8) | ((n & 0x00FF00FF) << 8);
    n = ((n & 0xF0F0F0F0) >>> 4) | ((n & 0x0F0F0F0F) << 4);
    n = ((n & 0xCCCCCCCC) >>> 2) | ((n & 0x33333333) << 2);
    n = ((n & 0xAAAAAAAA) >>> 1) | ((n & 0x55555555) << 1);
    return n >>> 0;
}`,
        java: `public static int reverseBits(int n) {
    n = (n >>> 16) | (n << 16);
    n = ((n & 0xFF00FF00) >>> 8) | ((n & 0x00FF00FF) << 8);
    n = ((n & 0xF0F0F0F0) >>> 4) | ((n & 0x0F0F0F0F) << 4);
    n = ((n & 0xCCCCCCCC) >>> 2) | ((n & 0x33333333) << 2);
    n = ((n & 0xAAAAAAAA) >>> 1) | ((n & 0x55555555) << 1);
    return n;
}`,
      },
      run: runReverseBitsDivideConquer,
      lineExplanations: {
        python: {
          1: 'Define function taking 32-bit integer n',
          2: 'Swap the two 16-bit halves (mask keeps it within 32 bits)',
          3: 'Swap the two bytes inside each 16-bit half',
          4: 'Swap the two nibbles inside each byte',
          5: 'Swap the two bit-pairs inside each nibble',
          6: 'Swap every pair of adjacent bits',
          7: 'All bits are now mirrored — return the result',
        },
        javascript: {
          1: 'Define function taking 32-bit integer n',
          2: 'Swap the two 16-bit halves (>>> avoids sign extension)',
          3: 'Swap the two bytes inside each 16-bit half',
          4: 'Swap the two nibbles inside each byte',
          5: 'Swap the two bit-pairs inside each nibble',
          6: 'Swap every pair of adjacent bits',
          7: 'Return as unsigned 32-bit integer',
        },
        java: {
          1: 'Define method taking 32-bit integer n',
          2: 'Swap the two 16-bit halves (>>> avoids sign extension)',
          3: 'Swap the two bytes inside each 16-bit half',
          4: 'Swap the two nibbles inside each byte',
          5: 'Swap the two bit-pairs inside each nibble',
          6: 'Swap every pair of adjacent bits',
          7: 'All bits are now mirrored — return the result',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking 32-bit integer n',
      2: 'Initialize result to 0',
      3: 'Loop through all 32 bits',
      4: 'Extract the least significant bit of n',
      5: 'Shift result left and add extracted bit',
      6: 'Right-shift n to process next bit',
      7: 'Return the reversed 32-bit integer',
    },
    javascript: {
      1: 'Define function taking 32-bit integer n',
      2: 'Initialize result to 0',
      3: 'Loop through all 32 bits',
      4: 'Extract the least significant bit of n',
      5: 'Shift result left and add extracted bit',
      6: 'Unsigned right-shift n to process next bit',
      8: 'Return result as unsigned 32-bit integer',
    },
    java: {
      1: 'Define method taking 32-bit integer n',
      2: 'Initialize result to 0',
      3: 'Loop through all 32 bits',
      4: 'Shift result left and OR with LSB of n',
      5: 'Right-shift n to process next bit',
      7: 'Return the reversed 32-bit integer',
    },
  },
};
