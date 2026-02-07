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
    java: `// Java implementation coming soon`,
  },
  defaultInput: 43261596,
  run: runReverseBits,
};
