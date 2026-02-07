import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary(n: number, width: number = 8): string {
  return (n >>> 0).toString(2).padStart(width, '0');
}

function runMissingNumber(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: {
      nums: [...nums],
      bits: [{ value: 0, bits: toBinary(0), label: 'XOR result' }],
      bitHighlights: [],
      result: `Finding missing number in [0..${n}]`,
    },
    highlights: [],
    message: `Array has ${n} numbers from range [0..${n}]. Find the missing one using XOR.`,
    codeLine: 1,
  } as AlgorithmStep);

  let xorResult = n; // Start with n (since array has indices 0..n-1 but range is 0..n)

  steps.push({
    state: {
      nums: [...nums],
      bits: [{ value: xorResult, bits: toBinary(xorResult), label: `start with n=${n}` }],
      bitHighlights: [0],
      result: `XOR result: ${xorResult}`,
    },
    highlights: [],
    message: `Initialize XOR result with n = ${n} (${toBinary(n)}).`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  for (let i = 0; i < n; i++) {
    // XOR with index
    const beforeIndex = xorResult;
    xorResult ^= i;

    steps.push({
      state: {
        nums: [...nums],
        bits: [
          { value: beforeIndex, bits: toBinary(beforeIndex), label: 'prev' },
          { value: i, bits: toBinary(i), label: `index ${i}` },
          { value: xorResult, bits: toBinary(xorResult), label: 'after XOR index' },
        ],
        bitHighlights: [2],
        result: `XOR result: ${xorResult}`,
      },
      highlights: [i],
      pointers: { i },
      message: `XOR with index ${i}: ${beforeIndex} ^ ${i} = ${xorResult}.`,
      codeLine: 4,
      action: 'compare',
    } as AlgorithmStep);

    // XOR with nums[i]
    const beforeNum = xorResult;
    xorResult ^= nums[i];

    steps.push({
      state: {
        nums: [...nums],
        bits: [
          { value: beforeNum, bits: toBinary(beforeNum), label: 'prev' },
          { value: nums[i], bits: toBinary(nums[i]), label: `nums[${i}]=${nums[i]}` },
          { value: xorResult, bits: toBinary(xorResult), label: 'after XOR nums[i]' },
        ],
        bitHighlights: [2],
        result: `XOR result: ${xorResult}`,
      },
      highlights: [i],
      pointers: { i },
      message: `XOR with nums[${i}]=${nums[i]}: ${beforeNum} ^ ${nums[i]} = ${xorResult}.`,
      codeLine: 5,
      action: 'compare',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      nums: [...nums],
      bits: [{ value: xorResult, bits: toBinary(xorResult), label: 'missing number' }],
      bitHighlights: [0],
      result: `Missing number: ${xorResult}`,
    },
    highlights: [],
    message: `Done! Missing number = ${xorResult}. All paired values cancel out via XOR.`,
    codeLine: 7,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const missingNumber: Algorithm = {
  id: 'missing-number',
  name: 'Missing Number',
  category: 'Bit Manipulation',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'XOR or Math — sum(0..n) - sum(array) = missing',
  description:
    'Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.',
  problemUrl: 'https://leetcode.com/problems/missing-number/',
  code: {
    python: `def missingNumber(nums):
    result = len(nums)
    for i in range(len(nums)):
        result ^= i
        result ^= nums[i]
    return result`,
    javascript: `function missingNumber(nums) {
    let result = nums.length;
    for (let i = 0; i < nums.length; i++) {
        result ^= i;
        result ^= nums[i];
    }
    return result;
}`,
    java: `public static int missingNumber(int[] nums) {
    int result = nums.length;
    for (int i = 0; i < nums.length; i++) {
        result ^= i;
        result ^= nums[i];
    }
    return result;
}`,
  },
  defaultInput: [3, 0, 1],
  run: runMissingNumber,
};
