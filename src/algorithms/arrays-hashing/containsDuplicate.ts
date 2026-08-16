import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runContainsDuplicateSorting(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];
  const sorted = [...nums].sort((a, b) => a - b);

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: 'Sort the array first — any duplicates will end up sitting side by side',
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...sorted] },
    highlights: [],
    message: `Sorted: [${sorted.join(', ')}]. Now a single scan of adjacent pairs finds any duplicate`,
    codeLine: 2,
    action: 'swap',
  });

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) {
      steps.push({
        state: { nums: [...sorted], duplicate: sorted[i] },
        highlights: [i - 1, i],
        pointers: { i },
        message: `nums[${i - 1}] = nums[${i}] = ${sorted[i]} — sorting placed the duplicates next to each other. Return true`,
        codeLine: 5,
        action: 'found',
      });
      return steps;
    }
    steps.push({
      state: { nums: [...sorted] },
      highlights: [i],
      secondary: [i - 1],
      pointers: { i },
      message: `${sorted[i - 1]} ≠ ${sorted[i]} — neighbors differ, no duplicate here yet`,
      codeLine: 4,
      action: 'compare',
    });
  }

  steps.push({
    state: { nums: [...sorted] },
    highlights: [],
    message: 'Every adjacent pair differs — the array has no duplicates',
    codeLine: 6,
  });

  return steps;
}

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
  optimalApproachName: 'Hash Set',
  approaches: [
    {
      id: 'sorting',
      name: 'Sorting',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of remembering every value in a hash set, sort the array so duplicates become adjacent — trading O(n) extra memory for an O(n log n) sort.',
      code: {
        python: `def containsDuplicate(nums):
    nums.sort()
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            return True
    return False`,
        javascript: `function containsDuplicate(nums) {
    nums.sort((a, b) => a - b);
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] === nums[i - 1]) {
            return true;
        }
    }
    return false;
}`,
        java: `public static boolean containsDuplicate(int[] nums) {
    Arrays.sort(nums);
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] == nums[i - 1]) {
            return true;
        }
    }
    return false;
}`,
      },
      run: runContainsDuplicateSorting,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array',
          2: 'Sort in place — duplicates become neighbors',
          3: 'Scan the array starting from the second element',
          4: 'Compare each element with its left neighbor',
          5: 'Equal neighbors means a duplicate — return True',
          6: 'No adjacent pair matched — all elements unique',
        },
        javascript: {
          1: 'Define function taking nums array',
          2: 'Sort numerically — duplicates become neighbors',
          3: 'Scan the array starting from the second element',
          4: 'Compare each element with its left neighbor',
          5: 'Equal neighbors means a duplicate — return true',
          8: 'No adjacent pair matched — all elements unique',
        },
        java: {
          1: 'Define function taking nums array',
          2: 'Sort in place — duplicates become neighbors',
          3: 'Scan the array starting from the second element',
          4: 'Compare each element with its left neighbor',
          5: 'Equal neighbors means a duplicate — return true',
          8: 'No adjacent pair matched — all elements unique',
        },
      },
    },
  ],
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
