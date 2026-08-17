import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary(n: number, width: number = 8): string {
  return (n >>> 0).toString(2).padStart(width, '0').slice(-width);
}

function runMinimumArrayEnd(input: unknown): AlgorithmStep[] {
  const { n, x } = input as { n: number; x: number };
  const steps: AlgorithmStep[] = [];

  let result = x;
  let remaining = n - 1;
  let bit = 0;

  steps.push({
    state: {
      bits: [
        { value: x, bits: toBinary(x), label: `x = ${x}` },
        { value: n - 1, bits: toBinary(n - 1), label: `n - 1 = ${n - 1}` },
      ],
      bitHighlights: [],
      result: `Building the smallest possible nums[${n - 1}] from x = ${x}`,
    },
    highlights: [],
    message: `Every element must AND down to x, so every 1-bit of x is locked ON in all ${n} numbers. The only freedom is in the ZERO bits of x — those form a counter. The ${n}th smallest value writes the number ${n - 1} into those free slots.`,
    codeLine: 1,
  } as AlgorithmStep);

  const guard = 32;

  while (remaining > 0 && bit < guard) {
    const xBit = (x >> bit) & 1;

    if (xBit === 1) {
      steps.push({
        state: {
          bits: [
            { value: x, bits: toBinary(x), label: `x = ${x}` },
            { value: remaining, bits: toBinary(remaining), label: `remaining = ${remaining}` },
            { value: result, bits: toBinary(result), label: `result = ${result}` },
          ],
          bitHighlights: [bit],
          result: `bit ${bit} of x is 1 — locked, skip it`,
        },
        highlights: [],
        pointers: { bit },
        message: `Bit ${bit} of x is 1, so it is already forced to 1 in every element. No room to store a counter bit here — move to bit ${bit + 1} without consuming any of remaining.`,
        codeLine: 6,
        action: 'visit',
      } as AlgorithmStep);
      bit++;
      continue;
    }

    const takeBit = remaining & 1;

    steps.push({
      state: {
        bits: [
          { value: x, bits: toBinary(x), label: `x = ${x}` },
          { value: remaining, bits: toBinary(remaining), label: `remaining = ${remaining}` },
          { value: result, bits: toBinary(result), label: `result = ${result}` },
        ],
        bitHighlights: [bit],
        result: `bit ${bit} of x is 0 — free slot`,
      },
      highlights: [],
      pointers: { bit },
      message: `Bit ${bit} of x is 0 — a free slot. The lowest remaining bit of the counter is ${takeBit}, so slot ${bit} takes ${takeBit}.`,
      codeLine: 7,
      action: 'compare',
    } as AlgorithmStep);

    if (takeBit === 1) {
      result |= 1 << bit;
    }
    remaining >>= 1;

    steps.push({
      state: {
        bits: [
          { value: x, bits: toBinary(x), label: `x = ${x}` },
          { value: remaining, bits: toBinary(remaining), label: `remaining = ${remaining}` },
          { value: result, bits: toBinary(result), label: `result = ${result}` },
        ],
        bitHighlights: takeBit === 1 ? [bit] : [],
        result: `result = ${result}, remaining = ${remaining}`,
      },
      highlights: [],
      pointers: { bit },
      message: takeBit === 1
        ? `Set bit ${bit}: result |= 1 << ${bit} gives ${result} (${toBinary(result)}). Shift the counter right — ${remaining} left to place.`
        : `Counter bit was 0, so slot ${bit} stays 0. Shift the counter right — ${remaining} left to place.`,
      codeLine: takeBit === 1 ? 8 : 9,
      action: takeBit === 1 ? 'insert' : 'visit',
    } as AlgorithmStep);

    bit++;
  }

  steps.push({
    state: {
      bits: [
        { value: x, bits: toBinary(x), label: `x = ${x}` },
        { value: result, bits: toBinary(result), label: `answer = ${result}` },
      ],
      bitHighlights: [],
      result: `Minimum possible nums[${n - 1}] = ${result}`,
    },
    highlights: [],
    message: `Counter fully placed. Every 1-bit of x survived and the bits of ${n - 1} sit in x's zero slots, so the smallest possible last element is ${result} (${toBinary(result)}).`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runMinimumArrayEndSimulation(input: unknown): AlgorithmStep[] {
  const { n, x } = input as { n: number; x: number };
  const steps: AlgorithmStep[] = [];

  let result = x;

  steps.push({
    state: {
      bits: [{ value: x, bits: toBinary(x), label: `nums[0] = x = ${x}` }],
      bitHighlights: [],
      nums: [x],
      result: `Starting the chain at nums[0] = ${x}`,
    },
    highlights: [0],
    message: `Simpler to reason about, slower to run: build the array one element at a time. The smallest legal next value after v is (v + 1) | x — add 1 to go strictly up, then OR with x to restore every required bit.`,
    codeLine: 2,
  } as AlgorithmStep);

  const chain: number[] = [x];
  const guard = 60;

  for (let i = 1; i < n && i <= guard; i++) {
    const before = result;
    const incremented = before + 1;
    result = incremented | x;
    chain.push(result);

    steps.push({
      state: {
        bits: [
          { value: before, bits: toBinary(before), label: `nums[${i - 1}] = ${before}` },
          { value: result, bits: toBinary(result), label: `nums[${i}] = ${result}` },
        ],
        bitHighlights: [],
        nums: [...chain],
        result: `nums[${i}] = ${result}`,
      },
      highlights: [chain.length - 1],
      pointers: { i },
      message: `nums[${i}] = (${before} + 1) | ${x} = ${incremented} | ${x} = ${result}. ${incremented === result ? 'The +1 already had every bit of x.' : `The OR put back the bits of x that the +1 knocked out (${toBinary(incremented)} -> ${toBinary(result)}).`}`,
      codeLine: 4,
      action: 'insert',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      bits: [{ value: result, bits: toBinary(result), label: `answer = ${result}` }],
      bitHighlights: [],
      nums: [...chain],
      result: `Minimum possible nums[${n - 1}] = ${result}`,
    },
    highlights: [chain.length - 1],
    message: `The full chain is [${chain.join(', ')}] and its AND is ${x}, so the answer is ${result}. Correct, but this walks all n elements — the bit-distribution method jumps straight to the answer in O(log n).`,
    codeLine: 5,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const minimumArrayEnd: Algorithm = {
  id: 'minimum-array-end',
  name: 'Minimum Array End',
  category: 'Bit Manipulation',
  difficulty: 'Medium',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Bit Manipulation — write the bits of n-1 into the zero bits of x',
  description:
    'You are given two integers n and x. Construct an array nums of size n of positive integers that is strictly increasing and whose bitwise AND of all elements equals x. Return the minimum possible value of nums[n - 1].',
  problemUrl: 'https://leetcode.com/problems/minimum-array-end/',
  code: {
    python: `def minEnd(n, x):
    result = x
    remaining = n - 1
    bit = 0
    while remaining:
        if ((x >> bit) & 1) == 0:
            if remaining & 1:
                result |= 1 << bit
            remaining >>= 1
        bit += 1
    return result`,
    javascript: `function minEnd(n, x) {
    let result = BigInt(x);
    let remaining = BigInt(n - 1);
    let bit = 0n;
    while (remaining > 0n) {
        if (((BigInt(x) >> bit) & 1n) === 0n) {
            if (remaining & 1n) result |= 1n << bit;
            remaining >>= 1n;
        }
        bit++;
    }
    return result;
}`,
    java: `public static long minEnd(int n, int x) {
    long result = x;
    long xBits = x;
    long remaining = n - 1;
    int bit = 0;
    while (remaining > 0) {
        if (((xBits >> bit) & 1) == 0) {
            if ((remaining & 1) == 1) result |= 1L << bit;
            remaining >>= 1;
        }
        bit++;
    }
    return result;
}`,
  },
  defaultInput: { n: 6, x: 5 },
  run: runMinimumArrayEnd,
  optimalApproachName: 'Bit Distribution',
  approaches: [
    {
      id: 'or-increment-simulation',
      name: 'OR + Increment Simulation',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Build the array element by element with the greedy step nums[i] = (nums[i-1] + 1) | x — far easier to see why it works, but it takes n iterations instead of the log n of the bit-distribution method.',
      code: {
        python: `def minEnd(n, x):
    result = x
    for _ in range(n - 1):
        result = (result + 1) | x
    return result`,
        javascript: `function minEnd(n, x) {
    let result = BigInt(x);
    const bx = BigInt(x);
    for (let i = 1; i < n; i++) {
        result = (result + 1n) | bx;
    }
    return result;
}`,
        java: `public static long minEnd(int n, int x) {
    long result = x;
    for (int i = 1; i < n; i++) {
        result = (result + 1) | x;
    }
    return result;
}`,
      },
      run: runMinimumArrayEndSimulation,
      lineExplanations: {
        python: {
          1: 'Define function taking n and x',
          2: 'The first (smallest) element must be exactly x',
          3: 'Produce the remaining n - 1 elements in order',
          4: '+1 makes it strictly larger; | x restores every required bit',
          5: 'The last value produced is nums[n - 1]',
        },
        javascript: {
          1: 'Define function taking n and x',
          2: 'BigInt because the answer can exceed 32 bits',
          3: 'Cache x as a BigInt for the OR inside the loop',
          4: 'Produce the remaining n - 1 elements in order',
          5: '+1 makes it strictly larger; | x restores every required bit',
          7: 'The last value produced is nums[n - 1]',
        },
        java: {
          1: 'Define method taking n and x',
          2: 'The first (smallest) element must be exactly x',
          3: 'Produce the remaining n - 1 elements in order',
          4: '+1 makes it strictly larger; | x restores every required bit',
          6: 'The last value produced is nums[n - 1]',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking n and x',
      2: 'Start from x — every 1-bit of x is mandatory in all elements',
      3: 'There are n - 1 steps above the smallest element x',
      4: 'Scan bit positions from the least significant upward',
      5: 'Stop as soon as the whole counter has been placed',
      6: 'Only bits where x is 0 are free to hold counter bits',
      7: 'Check the lowest bit still left in the counter',
      8: 'Write that 1 into this free slot',
      9: 'Consume it — shift the counter right',
      10: 'Move to the next bit position either way',
      11: 'x plus the embedded counter is the minimal last element',
    },
    javascript: {
      1: 'Define function taking n and x',
      2: 'BigInt because the answer can exceed 32 bits',
      3: 'The counter to embed is n - 1',
      4: 'Scan bit positions from the least significant upward',
      5: 'Stop as soon as the whole counter has been placed',
      6: 'Only bits where x is 0 are free to hold counter bits',
      7: 'If the lowest counter bit is 1, set this free slot',
      8: 'Consume that counter bit',
      10: 'Move to the next bit position either way',
      12: 'x plus the embedded counter is the minimal last element',
    },
    java: {
      1: 'Define method taking n and x',
      2: 'Start from x — every 1-bit of x is mandatory in all elements',
      3: 'Widen x to long so shifts past bit 31 behave',
      4: 'The counter to embed is n - 1',
      5: 'Scan bit positions from the least significant upward',
      6: 'Stop as soon as the whole counter has been placed',
      7: 'Only bits where x is 0 are free to hold counter bits',
      8: 'If the lowest counter bit is 1, set this free slot',
      9: 'Consume that counter bit',
      11: 'Move to the next bit position either way',
      13: 'x plus the embedded counter is the minimal last element',
    },
  },
};
