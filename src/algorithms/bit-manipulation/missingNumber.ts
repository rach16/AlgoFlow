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
    codeLine: 6,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runMissingNumberGaussSum(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: {
      nums: [...nums],
      bits: [],
      bitHighlights: [],
      result: `Finding missing number in [0..${n}]`,
    },
    highlights: [],
    message: `Gauss' formula gives the sum 0+1+...+${n} instantly. Whatever the actual array sum falls short by is the missing number.`,
    codeLine: 2,
  } as AlgorithmStep);

  const expected = (n * (n + 1)) / 2;

  steps.push({
    state: {
      nums: [...nums],
      bits: [{ value: expected, bits: toBinary(expected), label: `expected sum = ${expected}` }],
      bitHighlights: [0],
      result: `Expected sum of 0..${n}: ${expected}`,
    },
    highlights: [],
    message: `Expected sum = n(n+1)/2 = ${n} * ${n + 1} / 2 = ${expected}. That's what 0..${n} would add up to with nothing missing.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  let actual = 0;

  for (let i = 0; i < n; i++) {
    const before = actual;
    actual += nums[i];

    steps.push({
      state: {
        nums: [...nums],
        bits: [
          { value: expected, bits: toBinary(expected), label: `expected = ${expected}` },
          { value: actual, bits: toBinary(actual), label: `actual sum so far = ${actual}` },
        ],
        bitHighlights: [1],
        result: `Actual sum: ${actual}`,
      },
      highlights: [i],
      pointers: { i },
      message: `Add nums[${i}] = ${nums[i]}: actual sum = ${before} + ${nums[i]} = ${actual}.`,
      codeLine: 4,
      action: 'visit',
    } as AlgorithmStep);
  }

  const missing = expected - actual;

  steps.push({
    state: {
      nums: [...nums],
      bits: [
        { value: expected, bits: toBinary(expected), label: `expected = ${expected}` },
        { value: actual, bits: toBinary(actual), label: `actual = ${actual}` },
        { value: missing, bits: toBinary(missing), label: `missing = ${missing}` },
      ],
      bitHighlights: [2],
      result: `Missing number: ${missing}`,
    },
    highlights: [],
    message: `Done! Missing number = expected - actual = ${expected} - ${actual} = ${missing}. Every present number cancels; only the absent one leaves a gap.`,
    codeLine: 5,
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
  optimalApproachName: 'XOR Cancellation',
  approaches: [
    {
      id: 'gauss-sum-formula',
      name: 'Gauss Sum Formula',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Computes the expected sum 0+1+...+n with n(n+1)/2 and subtracts the actual array sum — pure arithmetic instead of bitwise cancellation.',
      code: {
        python: `def missingNumber(nums):
    n = len(nums)
    expected = n * (n + 1) // 2
    actual = sum(nums)
    return expected - actual`,
        javascript: `function missingNumber(nums) {
    const n = nums.length;
    const expected = n * (n + 1) / 2;
    let actual = 0;
    for (const num of nums) actual += num;
    return expected - actual;
}`,
        java: `public static int missingNumber(int[] nums) {
    int n = nums.length;
    int expected = n * (n + 1) / 2;
    int actual = 0;
    for (int num : nums) actual += num;
    return expected - actual;
}`,
      },
      run: runMissingNumberGaussSum,
      lineExplanations: {
        python: {
          1: 'Define function taking array of numbers',
          2: 'n = array length, so the full range is [0..n]',
          3: "Gauss' formula: sum of 0..n = n(n+1)/2",
          4: 'Sum what is actually in the array',
          5: 'The shortfall is exactly the missing number',
        },
        javascript: {
          1: 'Define function taking array of numbers',
          2: 'n = array length, so the full range is [0..n]',
          3: "Gauss' formula: sum of 0..n = n(n+1)/2",
          4: 'Initialize running sum of the array',
          5: 'Add every element to the actual sum',
          6: 'The shortfall is exactly the missing number',
        },
        java: {
          1: 'Define method taking array of numbers',
          2: 'n = array length, so the full range is [0..n]',
          3: "Gauss' formula: sum of 0..n = n(n+1)/2",
          4: 'Initialize running sum of the array',
          5: 'Add every element to the actual sum',
          6: 'The shortfall is exactly the missing number',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking array of numbers',
      2: 'Start result with n (array length)',
      3: 'Loop through each index in array',
      4: 'XOR result with index to cancel paired values',
      5: 'XOR result with nums[i] to cancel paired values',
      6: 'Remaining value is the missing number',
    },
    javascript: {
      1: 'Define function taking array of numbers',
      2: 'Start result with n (array length)',
      3: 'Loop through each index in array',
      4: 'XOR result with index to cancel paired values',
      5: 'XOR result with nums[i] to cancel paired values',
      7: 'Remaining value is the missing number',
    },
    java: {
      1: 'Define method taking array of numbers',
      2: 'Start result with n (array length)',
      3: 'Loop through each index in array',
      4: 'XOR result with index to cancel paired values',
      5: 'XOR result with nums[i] to cancel paired values',
      7: 'Remaining value is the missing number',
    },
  },
};
