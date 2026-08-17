import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary(n: number, width: number = 8): string {
  return (n >>> 0).toString(2).padStart(width, '0').slice(-width);
}

function runBitwiseAndNumbersRange(input: unknown): AlgorithmStep[] {
  const { left: origLeft, right: origRight } = input as { left: number; right: number };
  let left = origLeft;
  let right = origRight;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      bits: [
        { value: left, bits: toBinary(left), label: `left = ${left}` },
        { value: right, bits: toBinary(right), label: `right = ${right}` },
      ],
      bitHighlights: [],
      result: `ANDing every number in [${origLeft}, ${origRight}]`,
    },
    highlights: [],
    message: `AND of a whole range keeps only the bits that are 1 in EVERY number. Any bit that flips somewhere inside the range gets zeroed, so the answer is just the common binary prefix of ${origLeft} and ${origRight}, padded with zeros.`,
    codeLine: 1,
  } as AlgorithmStep);

  let shift = 0;
  const guard = 40;

  while (left < right && shift < guard) {
    steps.push({
      state: {
        bits: [
          { value: left, bits: toBinary(left), label: `left = ${left}` },
          { value: right, bits: toBinary(right), label: `right = ${right}` },
        ],
        bitHighlights: [0],
        result: `left (${left}) != right (${right}) — prefix not reached yet`,
      },
      highlights: [],
      message: `${left} < ${right}, so the range still spans a change in bit 0: somewhere between them that bit is 0. Drop bit 0 from both by shifting right.`,
      codeLine: 3,
      action: 'compare',
    } as AlgorithmStep);

    left >>= 1;
    right >>= 1;
    shift++;

    steps.push({
      state: {
        bits: [
          { value: left, bits: toBinary(left), label: `left = ${left}` },
          { value: right, bits: toBinary(right), label: `right = ${right}` },
        ],
        bitHighlights: [],
        result: `shift = ${shift}`,
      },
      highlights: [],
      message: `After shifting: left = ${left} (${toBinary(left)}), right = ${right} (${toBinary(right)}). shift = ${shift} — that many low bits are now known to be 0 in the answer.`,
      codeLine: 6,
      action: 'swap',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      bits: [
        { value: left, bits: toBinary(left), label: `common prefix = ${left}` },
      ],
      bitHighlights: [],
      result: `Common prefix ${toBinary(left)} found after ${shift} shift${shift === 1 ? '' : 's'}`,
    },
    highlights: [],
    message: `left == right == ${left}: the two ends finally agree, so ${toBinary(left)} is the shared prefix of every number in the range.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  const answer = left << shift;

  steps.push({
    state: {
      bits: [
        { value: answer, bits: toBinary(answer), label: `answer = ${answer}` },
      ],
      bitHighlights: [],
      result: `Bitwise AND of [${origLeft}, ${origRight}] = ${answer}`,
    },
    highlights: [],
    message: `Shift the prefix back left ${shift} place${shift === 1 ? '' : 's'}: ${left} << ${shift} = ${answer} (${toBinary(answer)}). Every AND from ${origLeft} to ${origRight} equals ${answer}.`,
    codeLine: 7,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runBitwiseAndNumbersRangeKernighan(input: unknown): AlgorithmStep[] {
  const { left: origLeft, right: origRight } = input as { left: number; right: number };
  const left = origLeft;
  let right = origRight;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      bits: [
        { value: left, bits: toBinary(left), label: `left = ${left}` },
        { value: right, bits: toBinary(right), label: `right = ${right}` },
      ],
      bitHighlights: [],
      result: `Clearing low set bits of right until it drops to or below left`,
    },
    highlights: [],
    message: `Brian Kernighan's trick: n & (n - 1) erases the LOWEST set bit of n. Keep erasing low set bits of right until right <= left — what survives is exactly the shared prefix.`,
    codeLine: 1,
  } as AlgorithmStep);

  let iterations = 0;
  const guard = 40;

  while (left < right && iterations < guard) {
    const lowest = right & -right;
    const lowestPos = Math.log2(lowest);

    steps.push({
      state: {
        bits: [
          { value: left, bits: toBinary(left), label: `left = ${left}` },
          { value: right, bits: toBinary(right), label: `right = ${right}` },
        ],
        bitHighlights: [lowestPos],
        result: `right (${right}) still above left (${left})`,
      },
      highlights: [],
      message: `right = ${right} (${toBinary(right)}) is still greater than left = ${left}, so its lowest set bit (position ${lowestPos}) cannot survive the AND — clear it with right & (right - 1).`,
      codeLine: 2,
      action: 'compare',
    } as AlgorithmStep);

    const before = right;
    right &= right - 1;
    iterations++;

    steps.push({
      state: {
        bits: [
          { value: left, bits: toBinary(left), label: `left = ${left}` },
          { value: right, bits: toBinary(right), label: `right = ${right}` },
        ],
        bitHighlights: [],
        result: `right = ${right}`,
      },
      highlights: [],
      message: `${before} & ${before - 1} = ${right} (${toBinary(before)} -> ${toBinary(right)}). One set bit gone — this loop runs once per set bit, not once per bit position.`,
      codeLine: 3,
      action: 'delete',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      bits: [{ value: right, bits: toBinary(right), label: `answer = ${right}` }],
      bitHighlights: [],
      result: `Bitwise AND of [${origLeft}, ${origRight}] = ${right}`,
    },
    highlights: [],
    message: `right = ${right} <= left = ${left}, so no more bits can be dropped. Answer: ${right} (${toBinary(right)}) — same result as the shift method, in ${iterations} step${iterations === 1 ? '' : 's'}.`,
    codeLine: 4,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const bitwiseAndNumbersRange: Algorithm = {
  id: 'bitwise-and-numbers-range',
  name: 'Bitwise AND of Numbers Range',
  category: 'Bit Manipulation',
  difficulty: 'Medium',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Bit Shift — strip differing low bits to find the common prefix',
  description:
    'Given two integers left and right that represent the range [left, right], return the bitwise AND of all numbers in this range, inclusive. The answer is the common binary prefix of left and right followed by zeros.',
  problemUrl: 'https://leetcode.com/problems/bitwise-and-of-numbers-range/',
  code: {
    python: `def rangeBitwiseAnd(left, right):
    shift = 0
    while left < right:
        left >>= 1
        right >>= 1
        shift += 1
    return left << shift`,
    javascript: `function rangeBitwiseAnd(left, right) {
    let shift = 0;
    while (left < right) {
        left >>= 1;
        right >>= 1;
        shift++;
    }
    return left << shift;
}`,
    java: `public static int rangeBitwiseAnd(int left, int right) {
    int shift = 0;
    while (left < right) {
        left >>= 1;
        right >>= 1;
        shift++;
    }
    return left << shift;
}`,
  },
  defaultInput: { left: 9, right: 15 },
  run: runBitwiseAndNumbersRange,
  optimalApproachName: 'Common Prefix by Shifting',
  approaches: [
    {
      id: 'brian-kernighan-clear-low-bits',
      name: "Brian Kernighan's Trick",
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description:
        "Instead of shifting both ends one position at a time, repeatedly clear the lowest set bit of right with right & (right - 1) until it drops to left — it iterates once per set bit rather than once per bit position.",
      code: {
        python: `def rangeBitwiseAnd(left, right):
    while left < right:
        right &= right - 1
    return right`,
        javascript: `function rangeBitwiseAnd(left, right) {
    while (left < right) {
        right &= right - 1;
    }
    return right;
}`,
        java: `public static int rangeBitwiseAnd(int left, int right) {
    while (left < right) {
        right &= right - 1;
    }
    return right;
}`,
      },
      run: runBitwiseAndNumbersRangeKernighan,
      lineExplanations: {
        python: {
          1: 'Define function taking the range bounds left and right',
          2: 'Keep going while right is still above left',
          3: 'right & (right - 1) erases the lowest set bit of right',
          4: 'Once right <= left, right holds the shared prefix — the answer',
        },
        javascript: {
          1: 'Define function taking the range bounds left and right',
          2: 'Keep going while right is still above left',
          3: 'right & (right - 1) erases the lowest set bit of right',
          5: 'Once right <= left, right holds the shared prefix — the answer',
        },
        java: {
          1: 'Define method taking the range bounds left and right',
          2: 'Keep going while right is still above left',
          3: 'right & (right - 1) erases the lowest set bit of right',
          5: 'Once right <= left, right holds the shared prefix — the answer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the range bounds left and right',
      2: 'Count how many low bits we discard',
      3: 'While the ends differ, their low bits are not shared',
      4: 'Drop the lowest bit of left',
      5: 'Drop the lowest bit of right',
      6: 'Remember that one more low bit is zero in the answer',
      7: 'Shift the common prefix back, padding with shift zeros',
    },
    javascript: {
      1: 'Define function taking the range bounds left and right',
      2: 'Count how many low bits we discard',
      3: 'While the ends differ, their low bits are not shared',
      4: 'Drop the lowest bit of left',
      5: 'Drop the lowest bit of right',
      6: 'Remember that one more low bit is zero in the answer',
      8: 'Shift the common prefix back, padding with shift zeros',
    },
    java: {
      1: 'Define method taking the range bounds left and right',
      2: 'Count how many low bits we discard',
      3: 'While the ends differ, their low bits are not shared',
      4: 'Drop the lowest bit of left',
      5: 'Drop the lowest bit of right',
      6: 'Remember that one more low bit is zero in the answer',
      8: 'Shift the common prefix back, padding with shift zeros',
    },
  },
};
