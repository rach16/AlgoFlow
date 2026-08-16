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

function runSearchRotatedSortedPivot(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as SearchRotatedInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Two-phase plan: first find the pivot (index of the smallest element), then run a plain binary search in the sorted half that could contain ${target}`,
    codeLine: 1,
  });

  // Phase 1: find pivot (index of minimum) with left < right binary search
  let left = 0;
  let right = nums.length - 1;

  steps.push({
    state: { nums: [...nums], target, left, right },
    highlights: Array.from({ length: nums.length }, (_, i) => i),
    pointers: { left, right },
    message: `Phase 1 — find the pivot: left=${left}, right=${right}`,
    codeLine: 3,
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    const rangeIndices = [];
    for (let i = left; i <= right; i++) rangeIndices.push(i);

    steps.push({
      state: { nums: [...nums], target, left, right, mid },
      highlights: rangeIndices,
      secondary: [mid],
      pointers: { left, mid, right },
      message: `mid=${mid}, nums[mid]=${nums[mid]} vs nums[right]=${nums[right]}`,
      codeLine: 5,
      action: 'visit',
    });

    if (nums[mid] > nums[right]) {
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `nums[${mid}]=${nums[mid]} > nums[${right}]=${nums[right]} — the drop (pivot) is to the right of mid`,
        codeLine: 7,
        action: 'compare',
      });
      left = mid + 1;
    } else {
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `nums[${mid}]=${nums[mid]} <= nums[${right}]=${nums[right]} — mid could be the minimum, keep it in range`,
        codeLine: 9,
        action: 'compare',
      });
      right = mid;
    }
  }

  const pivot = left;

  steps.push({
    state: { nums: [...nums], target, pivot },
    highlights: [pivot],
    pointers: { pivot },
    message: `Pivot found at index ${pivot}: nums[${pivot}]=${nums[pivot]} is the smallest element — the array is two sorted halves around it`,
    codeLine: 10,
    action: 'found',
  });

  // Phase 2: pick the sorted half that can contain target
  const lastVal = nums[nums.length - 1];
  if (target >= nums[pivot] && target <= lastVal) {
    left = pivot;
    right = nums.length - 1;
    steps.push({
      state: { nums: [...nums], target, pivot, left, right },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `${nums[pivot]} <= ${target} <= ${lastVal} — target can only be in the right sorted half [${left}..${right}]`,
      codeLine: 14,
    });
  } else {
    left = 0;
    right = pivot - 1;
    steps.push({
      state: { nums: [...nums], target, pivot, left, right },
      highlights: right >= left ? Array.from({ length: right - left + 1 }, (_, i) => left + i) : [],
      pointers: { left, right },
      message: `Target ${target} is outside [${nums[pivot]}..${lastVal}] — search the left sorted half [${left}..${right}]`,
      codeLine: 16,
    });
  }

  // Plain binary search on the chosen half
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    const rangeIndices = [];
    for (let i = left; i <= right; i++) rangeIndices.push(i);

    steps.push({
      state: { nums: [...nums], target, pivot, left, right, mid },
      highlights: rangeIndices,
      secondary: [mid],
      pointers: { left, mid, right },
      message: `Phase 2 — plain binary search: mid=${mid}, nums[mid]=${nums[mid]}`,
      codeLine: 19,
      action: 'visit',
    });

    if (nums[mid] === target) {
      steps.push({
        state: { nums: [...nums], target, result: mid },
        highlights: [mid],
        pointers: { mid },
        message: `Found! nums[${mid}] = ${target}`,
        codeLine: 21,
        action: 'found',
      });
      return steps;
    } else if (nums[mid] < target) {
      steps.push({
        state: { nums: [...nums], target, pivot, left, right, mid },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `${nums[mid]} < ${target} — search right half`,
        codeLine: 23,
        action: 'compare',
      });
      left = mid + 1;
    } else {
      steps.push({
        state: { nums: [...nums], target, pivot, left, right, mid },
        highlights: rangeIndices,
        secondary: [mid],
        pointers: { left, mid, right },
        message: `${nums[mid]} > ${target} — search left half`,
        codeLine: 25,
        action: 'compare',
      });
      right = mid - 1;
    }
  }

  steps.push({
    state: { nums: [...nums], target, result: -1 },
    highlights: [],
    message: `${target} not found in array`,
    codeLine: 27,
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
  optimalApproachName: 'One-Pass Binary Search',
  approaches: [
    {
      id: 'find-pivot-then-search',
      name: 'Find Pivot + Binary Search',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description:
        'First binary search for the rotation pivot (the minimum), then run a plain binary search in whichever sorted half can hold the target — two simple searches instead of one search with sorted-half case analysis.',
      code: {
        python: `def search(nums, target):
    # Phase 1: find pivot (index of smallest element)
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid
    pivot = left

    # Phase 2: binary search the sorted half
    if nums[pivot] <= target <= nums[-1]:
        left, right = pivot, len(nums) - 1
    else:
        left, right = 0, pivot - 1

    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
        javascript: `function search(nums, target) {
    // Phase 1: find pivot (index of smallest element)
    let left = 0, right = nums.length - 1;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    const pivot = left;

    // Phase 2: binary search the sorted half
    if (target >= nums[pivot] && target <= nums[nums.length - 1]) {
        left = pivot;
        right = nums.length - 1;
    } else {
        left = 0;
        right = pivot - 1;
    }

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) {
            return mid;
        }
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
        java: `public static int search(int[] nums, int target) {
    // Phase 1: find pivot (index of smallest element)
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    int pivot = left;

    // Phase 2: binary search the sorted half
    if (target >= nums[pivot] && target <= nums[nums.length - 1]) {
        left = pivot;
        right = nums.length - 1;
    } else {
        left = 0;
        right = pivot - 1;
    }

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            return mid;
        }
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
      },
      run: runSearchRotatedSortedPivot,
      lineExplanations: {
        python: {
          1: 'Define function taking rotated array and target',
          2: 'Phase 1 goal: locate the rotation point (smallest element)',
          3: 'Search the whole array for the pivot',
          4: 'Shrink until left and right meet on the minimum',
          5: 'Compute midpoint index',
          6: 'If mid is bigger than the right end, the drop is right of mid',
          7: 'Move left past mid — pivot is further right',
          9: 'Mid could itself be the minimum — keep it in range',
          10: 'Pointers met: this index holds the smallest element',
          12: 'Phase 2: the array is two sorted halves around the pivot',
          13: 'Is the target within the right (pivot..end) sorted range?',
          14: 'Search the right sorted half',
          16: 'Otherwise search the left sorted half',
          18: 'Plain binary search on the chosen half',
          19: 'Compute midpoint index',
          20: 'Is the middle element our target?',
          21: 'Found it — return the index',
          22: 'Middle too small — search the right half',
          23: 'Move left boundary past mid',
          25: 'Middle too large — move right boundary before mid',
          27: 'Target not in array — return -1',
        },
        javascript: {
          1: 'Define function taking rotated array and target',
          2: 'Phase 1 goal: locate the rotation point (smallest element)',
          3: 'Search the whole array for the pivot',
          4: 'Shrink until left and right meet on the minimum',
          5: 'Compute midpoint index',
          6: 'If mid is bigger than the right end, the drop is right of mid',
          7: 'Move left past mid — pivot is further right',
          9: 'Mid could itself be the minimum — keep it in range',
          12: 'Pointers met: this index holds the smallest element',
          14: 'Phase 2: the array is two sorted halves around the pivot',
          15: 'Is the target within the right (pivot..end) sorted range?',
          16: 'Search starts at the pivot',
          17: 'Search ends at the last index',
          19: 'Otherwise search the left sorted half from index 0',
          20: 'Left half ends just before the pivot',
          23: 'Plain binary search on the chosen half',
          24: 'Compute midpoint index',
          25: 'Is the middle element our target?',
          26: 'Found it — return the index',
          28: 'Middle too small — search the right half',
          29: 'Move left boundary past mid',
          31: 'Middle too large — move right boundary before mid',
          35: 'Target not in array — return -1',
        },
        java: {
          1: 'Define method taking rotated array and target',
          2: 'Phase 1 goal: locate the rotation point (smallest element)',
          3: 'Search the whole array for the pivot',
          4: 'Shrink until left and right meet on the minimum',
          5: 'Compute midpoint avoiding overflow',
          6: 'If mid is bigger than the right end, the drop is right of mid',
          7: 'Move left past mid — pivot is further right',
          9: 'Mid could itself be the minimum — keep it in range',
          12: 'Pointers met: this index holds the smallest element',
          14: 'Phase 2: the array is two sorted halves around the pivot',
          15: 'Is the target within the right (pivot..end) sorted range?',
          16: 'Search starts at the pivot',
          17: 'Search ends at the last index',
          19: 'Otherwise search the left sorted half from index 0',
          20: 'Left half ends just before the pivot',
          23: 'Plain binary search on the chosen half',
          24: 'Compute midpoint avoiding overflow',
          25: 'Is the middle element our target?',
          26: 'Found it — return the index',
          28: 'Middle too small — search the right half',
          29: 'Move left boundary past mid',
          31: 'Middle too large — move right boundary before mid',
          35: 'Target not in array — return -1',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array and target',
      2: 'Init left and right pointers for binary search',
      4: 'Loop while search space is valid',
      5: 'Compute midpoint index',
      7: 'If mid element equals target, found it',
      8: 'Return the index',
      10: 'Check if left half is sorted',
      11: 'If target is within sorted left range',
      12: 'Narrow search to left half',
      14: 'Otherwise search the right half',
      16: 'If target is within sorted right range',
      17: 'Narrow search to right half',
      19: 'Otherwise search the left half',
      21: 'Target not found, return -1',
    },
    javascript: {
      1: 'Define function taking nums array and target',
      2: 'Init left pointer to start',
      3: 'Init right pointer to end',
      5: 'Loop while search space is valid',
      6: 'Compute midpoint index',
      8: 'If mid element equals target, found it',
      9: 'Return the index',
      12: 'Check if left half is sorted',
      13: 'If target is within sorted left range',
      14: 'Narrow search to left half',
      16: 'Otherwise search the right half',
      19: 'If target is within sorted right range',
      20: 'Narrow search to right half',
      22: 'Otherwise search the left half',
      27: 'Target not found, return -1',
    },
    java: {
      1: 'Define method taking nums array and target',
      2: 'Init left pointer to start',
      3: 'Init right pointer to end',
      5: 'Loop while search space is valid',
      6: 'Compute midpoint avoiding overflow',
      8: 'If mid element equals target, found it',
      9: 'Return the index',
      12: 'Check if left half is sorted',
      13: 'If target is within sorted left range',
      14: 'Narrow search to left half',
      16: 'Otherwise search the right half',
      19: 'If target is within sorted right range',
      20: 'Narrow search to right half',
      22: 'Otherwise search the left half',
      27: 'Target not found, return -1',
    },
  },
};
