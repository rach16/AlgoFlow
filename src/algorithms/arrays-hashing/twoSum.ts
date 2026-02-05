import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface TwoSumInput {
  nums: number[];
  target: number;
}

function runTwoSum(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as TwoSumInput;
  const steps: AlgorithmStep[] = [];
  const hashMap: Record<number, number> = {};

  // Initial state
  steps.push({
    state: { nums: [...nums], hashMap: {}, target },
    highlights: [],
    message: `Looking for two numbers that sum to ${target}`,
    codeLine: 1,
  });

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    // Show current element
    steps.push({
      state: { nums: [...nums], hashMap: { ...hashMap }, target },
      highlights: [i],
      pointers: { i },
      message: `Checking nums[${i}] = ${nums[i]}. Complement needed: ${target} - ${nums[i]} = ${complement}`,
      codeLine: 3,
      action: 'visit',
    });

    // Check if complement exists
    if (complement in hashMap) {
      const j = hashMap[complement];
      steps.push({
        state: { nums: [...nums], hashMap: { ...hashMap }, target, result: [j, i] },
        highlights: [j, i],
        pointers: { i, j },
        message: `Found! nums[${j}] + nums[${i}] = ${nums[j]} + ${nums[i]} = ${target}`,
        codeLine: 4,
        action: 'found',
      });
      return steps;
    }

    // Add to hashmap
    hashMap[nums[i]] = i;
    steps.push({
      state: { nums: [...nums], hashMap: { ...hashMap }, target },
      highlights: [i],
      pointers: { i },
      message: `Add ${nums[i]} -> index ${i} to hashmap`,
      codeLine: 6,
      action: 'insert',
    });
  }

  // No solution found
  steps.push({
    state: { nums: [...nums], hashMap: { ...hashMap }, target },
    highlights: [],
    message: 'No solution found',
    codeLine: 7,
  });

  return steps;
}

export const twoSum: Algorithm = {
  id: 'two-sum',
  name: 'Two Sum',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map — store complement, check on each pass',
  description:
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
  problemUrl: 'https://leetcode.com/problems/two-sum/',
  code: {
    python: `def twoSum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hashmap:
            return [hashmap[complement], i]
        hashmap[num] = i
    return []`,
    javascript: `function twoSum(nums, target) {
    const hashmap = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (complement in hashmap) {
            return [hashmap[complement], i];
        }
        hashmap[nums[i]] = i;
    }
    return [];
}`,
  },
  defaultInput: { nums: [2, 7, 11, 15], target: 9 },
  run: runTwoSum,
};
