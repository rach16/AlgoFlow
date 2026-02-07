import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runFindMinRotatedSorted(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  // Initial state
  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: `Find the minimum element in rotated sorted array [${nums.join(', ')}]`,
    codeLine: 1,
  });

  let left = 0;
  let right = nums.length - 1;
  let result = nums[0];

  steps.push({
    state: { nums: [...nums], left, right, result },
    highlights: Array.from({ length: nums.length }, (_, i) => i),
    pointers: { left, right },
    message: `Initialize: left=${left}, right=${right}, result=${result}`,
    codeLine: 2,
  });

  while (left <= right) {
    // If already sorted subarray, min is at left
    if (nums[left] < nums[right]) {
      result = Math.min(result, nums[left]);

      steps.push({
        state: { nums: [...nums], left, right, result },
        highlights: [left],
        pointers: { left, right },
        message: `nums[${left}]=${nums[left]} < nums[${right}]=${nums[right]} — subarray is sorted. Min candidate: ${nums[left]}`,
        codeLine: 5,
        action: 'found',
      });

      break;
    }

    const mid = Math.floor((left + right) / 2);
    result = Math.min(result, nums[mid]);

    const rangeIndices = [];
    for (let i = left; i <= right; i++) {
      rangeIndices.push(i);
    }

    steps.push({
      state: { nums: [...nums], left, right, mid, result },
      highlights: rangeIndices,
      secondary: [mid],
      pointers: { left, mid, right },
      message: `mid=${mid}, nums[mid]=${nums[mid]}. Current min candidate: ${result}`,
      codeLine: 7,
      action: 'visit',
    });

    if (nums[mid] >= nums[left]) {
      // Left portion is sorted, minimum is in the right portion
      steps.push({
        state: { nums: [...nums], left, right, mid, result },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `nums[${mid}]=${nums[mid]} >= nums[${left}]=${nums[left]} — left half sorted, search right`,
        codeLine: 9,
        action: 'compare',
      });
      left = mid + 1;
    } else {
      // Right portion is sorted, minimum is in the left portion
      steps.push({
        state: { nums: [...nums], left, right, mid, result },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `nums[${mid}]=${nums[mid]} < nums[${left}]=${nums[left]} — pivot in left half, search left`,
        codeLine: 11,
        action: 'compare',
      });
      right = mid - 1;
    }
  }

  // Final result
  steps.push({
    state: { nums: [...nums], result },
    highlights: [nums.indexOf(result)],
    message: `Minimum element is ${result}`,
    codeLine: 13,
    action: 'found',
  });

  return steps;
}

export const findMinRotatedSorted: Algorithm = {
  id: 'find-min-rotated-sorted',
  name: 'Find Minimum in Rotated Sorted Array',
  category: 'Binary Search',
  difficulty: 'Medium',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — compare mid with right to find pivot',
  description:
    'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.',
  problemUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
  code: {
    python: `def findMin(nums):
    result = nums[0]
    left, right = 0, len(nums) - 1

    while left <= right:
        if nums[left] < nums[right]:
            result = min(result, nums[left])
            break

        mid = (left + right) // 2
        result = min(result, nums[mid])

        if nums[mid] >= nums[left]:
            left = mid + 1
        else:
            right = mid - 1

    return result`,
    javascript: `function findMin(nums) {
    let result = nums[0];
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        if (nums[left] < nums[right]) {
            result = Math.min(result, nums[left]);
            break;
        }

        const mid = Math.floor((left + right) / 2);
        result = Math.min(result, nums[mid]);

        if (nums[mid] >= nums[left]) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}`,
    java: `public static int findMin(int[] nums) {
    int result = nums[0];
    int left = 0;
    int right = nums.length - 1;

    while (left <= right) {
        if (nums[left] < nums[right]) {
            result = Math.min(result, nums[left]);
            break;
        }

        int mid = left + (right - left) / 2;
        result = Math.min(result, nums[mid]);

        if (nums[mid] >= nums[left]) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}`,
  },
  defaultInput: [3, 4, 5, 1, 2],
  run: runFindMinRotatedSorted,
};
