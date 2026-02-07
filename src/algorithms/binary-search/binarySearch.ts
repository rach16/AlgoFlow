import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface BinarySearchInput {
  nums: number[];
  target: number;
}

function runBinarySearch(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as BinarySearchInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Search for ${target} in sorted array [${nums.join(', ')}]`,
    codeLine: 1,
  });

  let left = 0;
  let right = nums.length - 1;

  steps.push({
    state: { nums: [...nums], target, left, right },
    highlights: Array.from({ length: nums.length }, (_, i) => i),
    pointers: { left, right },
    message: `Initialize: left=${left}, right=${right}`,
    codeLine: 3,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // Show current search range
    const rangeIndices = [];
    for (let i = left; i <= right; i++) {
      rangeIndices.push(i);
    }

    steps.push({
      state: { nums: [...nums], target, left, right, mid },
      highlights: rangeIndices,
      secondary: [mid],
      pointers: { left, mid, right },
      message: `mid = (${left} + ${right}) / 2 = ${mid}, nums[mid] = ${nums[mid]}`,
      codeLine: 5,
      action: 'visit',
    });

    if (nums[mid] === target) {
      steps.push({
        state: { nums: [...nums], target, result: mid },
        highlights: [mid],
        pointers: { mid },
        message: `Found! nums[${mid}] = ${target}`,
        codeLine: 7,
        action: 'found',
      });
      return steps;
    } else if (nums[mid] < target) {
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `${nums[mid]} < ${target}, search right half`,
        codeLine: 9,
        action: 'compare',
      });
      left = mid + 1;
    } else {
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `${nums[mid]} > ${target}, search left half`,
        codeLine: 11,
        action: 'compare',
      });
      right = mid - 1;
    }
  }

  steps.push({
    state: { nums: [...nums], target, result: -1 },
    highlights: [],
    message: `${target} not found in array`,
    codeLine: 13,
  });

  return steps;
}

export const binarySearch: Algorithm = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'Binary Search',
  difficulty: 'Easy',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — classic halving on sorted array',
  description:
    'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
  problemUrl: 'https://leetcode.com/problems/binary-search/',
  code: {
    python: `def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
    javascript: `function search(nums, target) {
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
    java: `public static int search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
  },
  defaultInput: { nums: [-1, 0, 3, 5, 9, 12], target: 9 },
  run: runBinarySearch,
};
