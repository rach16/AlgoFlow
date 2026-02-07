import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface SearchRotatedInput {
  nums: number[];
  target: number;
}

function runSearchRotatedSorted(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as SearchRotatedInput;
  const steps: AlgorithmStep[] = [];

  // Initial state
  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Search for ${target} in rotated sorted array [${nums.join(', ')}]`,
    codeLine: 1,
  });

  let left = 0;
  let right = nums.length - 1;

  steps.push({
    state: { nums: [...nums], target, left, right },
    highlights: Array.from({ length: nums.length }, (_, i) => i),
    pointers: { left, right },
    message: `Initialize: left=${left}, right=${right}`,
    codeLine: 2,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    const rangeIndices = [];
    for (let i = left; i <= right; i++) {
      rangeIndices.push(i);
    }

    steps.push({
      state: { nums: [...nums], target, left, right, mid },
      highlights: rangeIndices,
      secondary: [mid],
      pointers: { left, mid, right },
      message: `mid=${mid}, nums[mid]=${nums[mid]}`,
      codeLine: 4,
      action: 'visit',
    });

    if (nums[mid] === target) {
      steps.push({
        state: { nums: [...nums], target, result: mid },
        highlights: [mid],
        pointers: { mid },
        message: `Found! nums[${mid}] = ${target}`,
        codeLine: 6,
        action: 'found',
      });
      return steps;
    }

    // Check if left half is sorted
    if (nums[left] <= nums[mid]) {
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `Left half sorted: nums[${left}]=${nums[left]} <= nums[${mid}]=${nums[mid]}`,
        codeLine: 8,
        action: 'compare',
      });

      if (target >= nums[left] && target < nums[mid]) {
        // Target is in the sorted left half
        steps.push({
          state: { nums: [...nums], target, left, right, mid },
          highlights: rangeIndices,
          pointers: { left, mid, right },
          message: `${nums[left]} <= ${target} < ${nums[mid]} — target in left half`,
          codeLine: 10,
          action: 'compare',
        });
        right = mid - 1;
      } else {
        // Target is in the right half
        steps.push({
          state: { nums: [...nums], target, left, right, mid },
          highlights: rangeIndices,
          pointers: { left, mid, right },
          message: `Target ${target} not in left range [${nums[left]}..${nums[mid]}), search right`,
          codeLine: 12,
          action: 'compare',
        });
        left = mid + 1;
      }
    } else {
      // Right half is sorted
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `Right half sorted: nums[${mid}]=${nums[mid]} <= nums[${right}]=${nums[right]}`,
        codeLine: 14,
        action: 'compare',
      });

      if (target > nums[mid] && target <= nums[right]) {
        // Target is in the sorted right half
        steps.push({
          state: { nums: [...nums], target, left, right, mid },
          highlights: rangeIndices,
          pointers: { left, mid, right },
          message: `${nums[mid]} < ${target} <= ${nums[right]} — target in right half`,
          codeLine: 16,
          action: 'compare',
        });
        left = mid + 1;
      } else {
        // Target is in the left half
        steps.push({
          state: { nums: [...nums], target, left, right, mid },
          highlights: rangeIndices,
          pointers: { left, mid, right },
          message: `Target ${target} not in right range (${nums[mid]}..${nums[right]}], search left`,
          codeLine: 18,
          action: 'compare',
        });
        right = mid - 1;
      }
    }
  }

  // Not found
  steps.push({
    state: { nums: [...nums], target, result: -1 },
    highlights: [],
    message: `${target} not found in array`,
    codeLine: 20,
  });

  return steps;
}

export const searchRotatedSorted: Algorithm = {
  id: 'search-rotated-sorted',
  name: 'Search in Rotated Sorted Array',
  category: 'Binary Search',
  difficulty: 'Medium',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — identify sorted half, check if target is in it',
  description:
    'There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not.',
  problemUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
  code: {
    python: `def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return mid

        if nums[left] <= nums[mid]:
            if target >= nums[left] and target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if target > nums[mid] and target <= nums[right]:
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
        }

        if (nums[left] <= nums[mid]) {
            if (target >= nums[left] && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (target > nums[mid] && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
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
        }

        if (nums[left] <= nums[mid]) {
            if (target >= nums[left] && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (target > nums[mid] && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    return -1;
}`,
  },
  defaultInput: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 },
  run: runSearchRotatedSorted,
};
