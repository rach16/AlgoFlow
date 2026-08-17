import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary(n: number, width: number = 8): string {
  if (n < 0) return (n >>> 0).toString(2).slice(-width);
  return n.toString(2).padStart(width, '0');
}

function runSingleNumber(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      nums: [...nums],
      bits: [{ value: 0, bits: toBinary(0), label: 'result' }],
      bitHighlights: [],
      result: 'Finding single number using XOR...',
    },
    highlights: [],
    message: `XOR all numbers. Duplicates cancel out (a ^ a = 0), leaving the single number.`,
    codeLine: 1,
  } as AlgorithmStep);

  let result = 0;

  for (let i = 0; i < nums.length; i++) {
    const prev = result;
    result ^= nums[i];

    steps.push({
      state: {
        nums: [...nums],
        bits: [
          { value: prev, bits: toBinary(prev), label: `prev result` },
          { value: nums[i], bits: toBinary(nums[i]), label: `nums[${i}]` },
          { value: result, bits: toBinary(result), label: `XOR result` },
        ],
        bitHighlights: [2],
        result: `XOR result so far: ${result}`,
      },
      highlights: [i],
      pointers: { i },
      message: `${prev} XOR ${nums[i]} = ${result}  (${toBinary(prev)} ^ ${toBinary(nums[i])} = ${toBinary(result)}).`,
      codeLine: 3,
      action: 'compare',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      nums: [...nums],
      bits: [{ value: result, bits: toBinary(result), label: 'single number' }],
      bitHighlights: [0],
      result: `Single number: ${result}`,
    },
    highlights: [],
    message: `Done! The single number is ${result}.`,
    codeLine: 5,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runSingleNumberHashMap(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const counts = new Map<number, number>();

  const countsToBits = () =>
    [...counts.entries()].map(([value, count]) => ({
      value,
      bits: toBinary(value),
      label: `${value}: seen ${count}x`,
    }));

  steps.push({
    state: {
      nums: [...nums],
      bits: [],
      bitHighlights: [],
      result: 'Counting occurrences of each number...',
    },
    highlights: [],
    message: `Count how often each number appears in a hash map, then scan for the one with count 1. Uses O(n) extra space, unlike XOR.`,
    codeLine: 2,
  } as AlgorithmStep);

  for (let i = 0; i < nums.length; i++) {
    counts.set(nums[i], (counts.get(nums[i]) ?? 0) + 1);
    const entryIndex = [...counts.keys()].indexOf(nums[i]);

    steps.push({
      state: {
        nums: [...nums],
        bits: countsToBits(),
        bitHighlights: [entryIndex],
        result: `counts[${nums[i]}] = ${counts.get(nums[i])}`,
      },
      highlights: [i],
      pointers: { i },
      message: `nums[${i}] = ${nums[i]}: increment its count to ${counts.get(nums[i])}. ${counts.get(nums[i]) === 2 ? 'This value is now a confirmed duplicate.' : 'First time seeing this value.'}`,
      codeLine: 4,
      action: 'insert',
    } as AlgorithmStep);
  }

  const entries = [...counts.entries()];
  for (let j = 0; j < entries.length; j++) {
    const [value, count] = entries[j];
    if (count === 1) {
      steps.push({
        state: {
          nums: [...nums],
          bits: countsToBits(),
          bitHighlights: [j],
          result: `Single number: ${value}`,
        },
        highlights: [],
        message: `Scan the map: ${value} has count 1 — every other number appears twice. The single number is ${value}.`,
        codeLine: 7,
        action: 'found',
      } as AlgorithmStep);
      return steps;
    }
    steps.push({
      state: {
        nums: [...nums],
        bits: countsToBits(),
        bitHighlights: [j],
        result: `Checking counts...`,
      },
      highlights: [],
      message: `Scan the map: ${value} has count ${count} — it is a duplicate, keep scanning.`,
      codeLine: 6,
      action: 'compare',
    } as AlgorithmStep);
  }

  return steps;
}

export const singleNumber: Algorithm = {
  id: 'single-number',
  name: 'Single Number',
  category: 'Bit Manipulation',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'XOR — a ^ a = 0, so all pairs cancel out',
  description:
    'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.',
  problemUrl: 'https://leetcode.com/problems/single-number/',
  code: {
    python: `def singleNumber(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
    javascript: `function singleNumber(nums) {
    let result = 0;
    for (const num of nums) {
        result ^= num;
    }
    return result;
}`,
    java: `public static int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}`,
  },
  defaultInput: [2, 2, 1],
  run: runSingleNumber,
  optimalApproachName: 'XOR Accumulation',
  approaches: [
    {
      id: 'hash-map-counting',
      name: 'Hash Map Counting',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Count occurrences of every number in a hash map, then scan for the one with count 1 — more intuitive than XOR but needs O(n) extra space.',
      code: {
        python: `def singleNumber(nums):
    counts = {}
    for num in nums:
        counts[num] = counts.get(num, 0) + 1
    for num, count in counts.items():
        if count == 1:
            return num`,
        javascript: `function singleNumber(nums) {
    const counts = new Map();
    for (const num of nums) {
        counts.set(num, (counts.get(num) || 0) + 1);
    }
    for (const [num, count] of counts) {
        if (count === 1) return num;
    }
}`,
        java: `public static int singleNumber(int[] nums) {
    Map<Integer, Integer> counts = new HashMap<>();
    for (int num : nums) {
        counts.merge(num, 1, Integer::sum);
    }
    for (Map.Entry<Integer, Integer> e : counts.entrySet()) {
        if (e.getValue() == 1) return e.getKey();
    }
    return -1;
}`,
      },
      run: runSingleNumberHashMap,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Create empty hash map for value -> occurrence count',
          3: 'First pass: visit every number',
          4: 'Increment the count for this value (default 0 if unseen)',
          5: 'Second pass: walk the (value, count) pairs',
          6: 'Look for the value that appeared exactly once',
          7: 'Return it — everything else appeared twice',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Create empty Map for value -> occurrence count',
          3: 'First pass: visit every number',
          4: 'Increment the count for this value (default 0 if unseen)',
          6: 'Second pass: walk the [value, count] entries',
          7: 'Return the value that appeared exactly once',
        },
        java: {
          1: 'Define method taking nums array',
          2: 'Create empty HashMap for value -> occurrence count',
          3: 'First pass: visit every number',
          4: 'merge() increments the count, starting at 1 if unseen',
          6: 'Second pass: walk the map entries',
          7: 'Return the value that appeared exactly once',
          9: 'Unreachable when input is valid (exactly one single)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Initialize result to 0 (XOR identity: 0 ^ x = x)',
      3: 'Loop through every number in the array',
      4: 'XOR result with current number — duplicates cancel out (a ^ a = 0)',
      5: 'Only the single number remains after all XORs',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Initialize result to 0 (XOR identity: 0 ^ x = x)',
      3: 'Loop through every number in the array',
      4: 'XOR result with current number — duplicates cancel out (a ^ a = 0)',
      6: 'Only the single number remains after all XORs',
    },
    java: {
      1: 'Define function taking nums array',
      2: 'Initialize result to 0 (XOR identity: 0 ^ x = x)',
      3: 'Loop through every number in the array',
      4: 'XOR result with current number — duplicates cancel out (a ^ a = 0)',
      6: 'Only the single number remains after all XORs',
    },
  },
};
