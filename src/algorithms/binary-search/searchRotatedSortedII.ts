import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface SearchRotatedIIInput {
  nums: number[];
  target: number;
}

function runSearchRotatedSortedII(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as SearchRotatedIIInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Rotated sorted array WITH duplicates: [${nums.join(', ')}]. Does ${target} appear? Return true/false — duplicates make the index ambiguous.`,
    codeLine: 1,
  });

  let left = 0;
  let right = nums.length - 1;

  steps.push({
    state: { nums: [...nums], target, left, right },
    highlights: Array.from({ length: nums.length }, (_, i) => i),
    pointers: { left, right },
    message: `Initialize left=${left}, right=${right}. Every step still tries to throw away one half.`,
    codeLine: 2,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const range: number[] = [];
    for (let i = left; i <= right; i++) range.push(i);

    steps.push({
      state: { nums: [...nums], target, left, right, mid },
      highlights: range,
      secondary: [mid],
      pointers: { left, mid, right },
      message: `mid = (${left} + ${right}) / 2 = ${mid}, nums[mid] = ${nums[mid]}`,
      codeLine: 5,
      action: 'visit',
    });

    if (nums[mid] === target) {
      steps.push({
        state: { nums: [...nums], target, result: true },
        highlights: [mid],
        pointers: { mid },
        message: `nums[${mid}] = ${target} — found it. Return true.`,
        codeLine: 8,
        action: 'found',
      });
      return steps;
    }

    steps.push({
      state: { nums: [...nums], target, left, right, mid },
      highlights: range,
      secondary: [mid],
      pointers: { left, mid, right },
      message: `nums[${mid}] = ${nums[mid]} != ${target} — now decide which half is sorted.`,
      codeLine: 7,
      action: 'compare',
    });

    if (nums[left] === nums[mid] && nums[mid] === nums[right]) {
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: [left, mid, right],
        secondary: range,
        pointers: { left, mid, right },
        message: `nums[${left}] = nums[${mid}] = nums[${right}] = ${nums[mid]} — the ends tell us nothing about where the rotation is. Shrink both sides by one (this is the O(n) worst case).`,
        codeLine: 11,
        action: 'compare',
      });
      left++;
      right--;
    } else if (nums[left] <= nums[mid]) {
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: range,
        secondary: [left, mid],
        pointers: { left, mid, right },
        message: `nums[${left}] = ${nums[left]} <= nums[${mid}] = ${nums[mid]} — the left half is cleanly sorted.`,
        codeLine: 13,
        action: 'compare',
      });

      if (nums[left] <= target && target < nums[mid]) {
        steps.push({
          state: { nums: [...nums], target, left, right, mid },
          highlights: range,
          pointers: { left, mid, right },
          message: `${nums[left]} <= ${target} < ${nums[mid]} — ${target} must live in that sorted left half. right = ${mid - 1}.`,
          codeLine: 15,
        });
        right = mid - 1;
      } else {
        steps.push({
          state: { nums: [...nums], target, left, right, mid },
          highlights: range,
          pointers: { left, mid, right },
          message: `${target} is outside [${nums[left]}, ${nums[mid]}) — discard the sorted left half. left = ${mid + 1}.`,
          codeLine: 17,
        });
        left = mid + 1;
      }
    } else {
      steps.push({
        state: { nums: [...nums], target, left, right, mid },
        highlights: range,
        secondary: [mid, right],
        pointers: { left, mid, right },
        message: `nums[${left}] = ${nums[left]} > nums[${mid}] = ${nums[mid]} — the rotation point is on the left, so the right half is sorted.`,
        codeLine: 18,
        action: 'compare',
      });

      if (nums[mid] < target && target <= nums[right]) {
        steps.push({
          state: { nums: [...nums], target, left, right, mid },
          highlights: range,
          pointers: { left, mid, right },
          message: `${nums[mid]} < ${target} <= ${nums[right]} — ${target} sits in the sorted right half. left = ${mid + 1}.`,
          codeLine: 20,
        });
        left = mid + 1;
      } else {
        steps.push({
          state: { nums: [...nums], target, left, right, mid },
          highlights: range,
          pointers: { left, mid, right },
          message: `${target} is outside (${nums[mid]}, ${nums[right]}] — discard the sorted right half. right = ${mid - 1}.`,
          codeLine: 22,
        });
        right = mid - 1;
      }
    }
  }

  steps.push({
    state: { nums: [...nums], target, result: false },
    highlights: [],
    message: `left (${left}) passed right (${right}) — the search space is empty, so ${target} is not in the array. Return false.`,
    codeLine: 24,
    action: 'found',
  });

  return steps;
}

function runSearchRotatedSortedIILinear(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as SearchRotatedIIInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Linear scan: with heavy duplicates binary search already degrades to O(n) worst case, so just look at every value once.`,
    codeLine: 1,
  });

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) {
      steps.push({
        state: { nums: [...nums], target, result: true },
        highlights: [i],
        pointers: { i },
        message: `nums[${i}] = ${target} — found after ${i + 1} comparison${i === 0 ? '' : 's'}. Return true.`,
        codeLine: 4,
        action: 'found',
      });
      return steps;
    }

    steps.push({
      state: { nums: [...nums], target, i },
      highlights: [i],
      pointers: { i },
      message: `nums[${i}] = ${nums[i]} != ${target} — keep walking. No sortedness is being exploited here.`,
      codeLine: 3,
      action: 'compare',
    });
  }

  steps.push({
    state: { nums: [...nums], target, result: false },
    highlights: [],
    message: `Checked all ${nums.length} values without a match — return false. Always O(n); binary search averages O(log n) and only degrades when duplicates blind it.`,
    codeLine: 5,
    action: 'found',
  });

  return steps;
}

export const searchRotatedSortedII: Algorithm = {
  id: 'search-rotated-sorted-ii',
  name: 'Search In Rotated Sorted Array II',
  category: 'Binary Search',
  difficulty: 'Medium',
  timeComplexity: 'O(log n) average, O(n) worst case',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — identify sorted half, shrink ends when duplicates hide it',
  description:
    'Given a rotated sorted array nums that may contain duplicates and a target value, return true if target is in nums and false otherwise. Duplicates can make it impossible to tell which half is sorted, so those cases fall back to shrinking the bounds one step at a time.',
  problemUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/',
  code: {
    python: `def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return True

        if nums[left] == nums[mid] == nums[right]:
            left += 1
            right -= 1
        elif nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return False`,
    javascript: `function search(nums, target) {
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (nums[mid] === target) {
            return true;
        }

        if (nums[left] === nums[mid] && nums[mid] === nums[right]) {
            left++;
            right--;
        } else if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    return false;
}`,
    java: `public static boolean search(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            return true;
        }

        if (nums[left] == nums[mid] && nums[mid] == nums[right]) {
            left++;
            right--;
        } else if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    return false;
}`,
  },
  defaultInput: { nums: [1, 1, 1, 1, 0, 1, 1], target: 0 },
  run: runSearchRotatedSortedII,
  optimalApproachName: 'Binary Search with Duplicate Shrink',
  approaches: [
    {
      id: 'linear-scan-duplicates',
      name: 'Linear Scan',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Ignore the rotation entirely and compare every element — the same O(n) as binary search\'s worst case, but it gives up the O(log n) that binary search still delivers on typical inputs.',
      code: {
        python: `def search(nums, target):
    for num in nums:
        if num == target:
            return True
    return False`,
        javascript: `function search(nums, target) {
    for (const num of nums) {
        if (num === target) {
            return true;
        }
    }
    return false;
}`,
        java: `public static boolean search(int[] nums, int target) {
    for (int num : nums) {
        if (num == target) {
            return true;
        }
    }
    return false;
}`,
      },
      run: runSearchRotatedSortedIILinear,
      lineExplanations: {
        python: {
          1: 'Define function taking the rotated array and the target',
          2: 'Walk every value in order — rotation is irrelevant here',
          3: 'Does this value equal the target?',
          4: 'Found it — return True',
          5: 'Scanned everything without a hit — return False',
        },
        javascript: {
          1: 'Define function taking the rotated array and the target',
          2: 'Walk every value in order — rotation is irrelevant here',
          3: 'Does this value equal the target?',
          4: 'Found it — return true',
          7: 'Scanned everything without a hit — return false',
        },
        java: {
          1: 'Define method taking the rotated array and the target',
          2: 'Walk every value in order — rotation is irrelevant here',
          3: 'Does this value equal the target?',
          4: 'Found it — return true',
          7: 'Scanned everything without a hit — return false',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the rotated array (duplicates allowed) and the target',
      2: 'Search the whole array to start',
      4: 'Keep halving while the window is non-empty',
      5: 'Midpoint of the current window',
      7: 'Direct hit on the target?',
      8: 'Return True — we only need existence, not an index',
      10: 'Both ends equal the middle — neither half can be proven sorted',
      11: 'Give up one element on the left',
      12: 'Give up one element on the right (the O(n) fallback)',
      13: 'Otherwise: is the left half sorted?',
      14: 'Does the target fall inside that sorted left range?',
      15: 'Yes — keep the left half',
      17: 'No — the target must be past mid',
      18: 'Left half is not sorted, so the right half is',
      19: 'Does the target fall inside the sorted right range?',
      20: 'Yes — keep the right half',
      22: 'No — keep the left half',
      24: 'Window emptied without a match — return False',
    },
    javascript: {
      1: 'Define function taking the rotated array (duplicates allowed) and the target',
      2: 'Left bound at the start of the array',
      3: 'Right bound at the end of the array',
      5: 'Keep halving while the window is non-empty',
      6: 'Midpoint of the current window',
      8: 'Direct hit on the target?',
      9: 'Return true — we only need existence, not an index',
      12: 'Both ends equal the middle — neither half can be proven sorted',
      13: 'Give up one element on the left',
      14: 'Give up one element on the right (the O(n) fallback)',
      15: 'Otherwise: is the left half sorted?',
      16: 'Does the target fall inside that sorted left range?',
      17: 'Yes — keep the left half',
      19: 'No — the target must be past mid',
      21: 'Left half is not sorted, so the right half is',
      22: 'Does the target fall inside the sorted right range?',
      23: 'Yes — keep the right half',
      25: 'No — keep the left half',
      30: 'Window emptied without a match — return false',
    },
    java: {
      1: 'Define method taking the rotated array (duplicates allowed) and the target',
      2: 'Left bound at the start of the array',
      3: 'Right bound at the end of the array',
      5: 'Keep halving while the window is non-empty',
      6: 'Midpoint computed without integer overflow',
      8: 'Direct hit on the target?',
      9: 'Return true — we only need existence, not an index',
      12: 'Both ends equal the middle — neither half can be proven sorted',
      13: 'Give up one element on the left',
      14: 'Give up one element on the right (the O(n) fallback)',
      15: 'Otherwise: is the left half sorted?',
      16: 'Does the target fall inside that sorted left range?',
      17: 'Yes — keep the left half',
      19: 'No — the target must be past mid',
      21: 'Left half is not sorted, so the right half is',
      22: 'Does the target fall inside the sorted right range?',
      23: 'Yes — keep the right half',
      25: 'No — keep the left half',
      30: 'Window emptied without a match — return false',
    },
  },
};
