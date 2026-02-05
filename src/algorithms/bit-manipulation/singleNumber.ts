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
  },
  defaultInput: [2, 2, 1],
  run: runSingleNumber,
};
