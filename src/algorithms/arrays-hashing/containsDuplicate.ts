import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runContainsDuplicate(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const seen = new Set<number>();

  steps.push({
    state: { nums: [...nums], seen: [] },
    highlights: [],
    message: 'Check if array contains any duplicates',
    codeLine: 1,
  });

  for (let i = 0; i < nums.length; i++) {
    steps.push({
      state: { nums: [...nums], seen: Array.from(seen) },
      highlights: [i],
      pointers: { i },
      message: `Checking nums[${i}] = ${nums[i]}`,
      codeLine: 3,
      action: 'visit',
    });

    if (seen.has(nums[i])) {
      // Find the previous index
      const prevIndex = nums.findIndex((n, idx) => n === nums[i] && idx < i);
      steps.push({
        state: { nums: [...nums], seen: Array.from(seen), duplicate: nums[i] },
        highlights: [prevIndex, i],
        pointers: { i },
        message: `Duplicate found! ${nums[i]} was seen before`,
        codeLine: 4,
        action: 'found',
      });
      return steps;
    }

    seen.add(nums[i]);
    steps.push({
      state: { nums: [...nums], seen: Array.from(seen) },
      highlights: [i],
      pointers: { i },
      message: `Add ${nums[i]} to seen set`,
      codeLine: 5,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums], seen: Array.from(seen) },
    highlights: [],
    message: 'No duplicates found - all elements are unique',
    codeLine: 6,
  });

  return steps;
}

export const containsDuplicate: Algorithm = {
  id: 'contains-duplicate',
  name: 'Contains Duplicate',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Set — track seen values',
  description:
    'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
  problemUrl: 'https://leetcode.com/problems/contains-duplicate/',
  code: {
    python: `def containsDuplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return False`,
    javascript: `function containsDuplicate(nums) {
    const seen = new Set();
    for (const num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }
    return false;
}`,
    java: `public static boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        if (seen.contains(num)) {
            return true;
        }
        seen.add(num);
    }
    return false;
}`,
  },
  defaultInput: [1, 2, 3, 1],
  run: runContainsDuplicate,
  lineExplanations: {
    python: {
      1: 'Define function taking nums array',
      2: 'Create empty set to track numbers we have seen',
      3: 'Loop through each number in the array',
      4: 'Check if this number is already in our set',
      5: 'Duplicate found — return True immediately',
      6: 'Not seen before — add this number to the set',
      7: 'No duplicates found after checking all numbers',
    },
    javascript: {
      1: 'Define function taking nums array',
      2: 'Create empty Set to track numbers we have seen',
      3: 'Loop through each number in the array',
      4: 'Check if this number is already in our set',
      5: 'Duplicate found — return true immediately',
      7: 'Not seen before — add this number to the set',
      9: 'No duplicates found after checking all numbers',
    },
    java: {
      1: 'Define function taking nums array',
      2: 'Create empty HashSet to track numbers we have seen',
      3: 'Loop through each number in the array',
      4: 'Check if this number is already in our set',
      5: 'Duplicate found — return true immediately',
      7: 'Not seen before — add this number to the set',
      9: 'No duplicates found after checking all numbers',
    },
  },
};
