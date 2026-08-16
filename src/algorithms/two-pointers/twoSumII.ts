import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface TwoSumIIInput {
  nums: number[];
  target: number;
}

function runTwoSumII(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as TwoSumIIInput;
  const steps: AlgorithmStep[] = [];

  // Line 1: def twoSum(numbers, target):
  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Find two numbers in sorted array that sum to ${target}`,
    codeLine: 1,
  });

  let left = 0;
  let right = nums.length - 1;

  // Line 2: l, r = 0, len(numbers) - 1
  steps.push({
    state: { nums: [...nums], target },
    highlights: [left, right],
    pointers: { left, right },
    message: `Initialize pointers: left=0, right=${right}`,
    codeLine: 2,
  });

  // Line 4: while l < r:
  while (left < right) {
    const currentSum = nums[left] + nums[right];

    // Line 5: curSum = numbers[l] + numbers[r]
    steps.push({
      state: { nums: [...nums], target, sum: currentSum },
      highlights: [left, right],
      pointers: { left, right },
      message: `Calculate sum: nums[${left}] + nums[${right}] = ${nums[left]} + ${nums[right]} = ${currentSum}`,
      codeLine: 5,
      action: 'compare',
    });

    if (currentSum > target) {
      // Line 7: if curSum > target:
      steps.push({
        state: { nums: [...nums], target, sum: currentSum },
        highlights: [left, right],
        pointers: { left, right },
        message: `${currentSum} > ${target}, sum too large. Move right pointer left`,
        codeLine: 7,
        action: 'compare',
      });
      right--;
      // Line 8: r -= 1
      steps.push({
        state: { nums: [...nums], target },
        highlights: [left, right],
        pointers: { left, right },
        message: `Right pointer moved to index ${right} (value ${nums[right]})`,
        codeLine: 8,
      });
    } else if (currentSum < target) {
      // Line 9: elif curSum < target:
      steps.push({
        state: { nums: [...nums], target, sum: currentSum },
        highlights: [left, right],
        pointers: { left, right },
        message: `${currentSum} < ${target}, sum too small. Move left pointer right`,
        codeLine: 9,
        action: 'compare',
      });
      left++;
      // Line 10: l += 1
      steps.push({
        state: { nums: [...nums], target },
        highlights: [left, right],
        pointers: { left, right },
        message: `Left pointer moved to index ${left} (value ${nums[left]})`,
        codeLine: 10,
      });
    } else {
      // Line 12: return [l + 1, r + 1]
      steps.push({
        state: { nums: [...nums], target, sum: currentSum, result: [left + 1, right + 1] },
        highlights: [left, right],
        pointers: { left, right },
        message: `Found! nums[${left}] + nums[${right}] = ${nums[left]} + ${nums[right]} = ${target}. Return [${left + 1}, ${right + 1}] (1-indexed)`,
        codeLine: 12,
        action: 'found',
      });
      return steps;
    }
  }

  // No solution found (shouldn't happen per problem constraints)
  steps.push({
    state: { nums: [...nums], target, result: [] },
    highlights: [],
    message: 'No solution found',
    codeLine: 12,
  });

  return steps;
}

function runTwoSumIIBinarySearch(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as TwoSumIIInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `The array is sorted — so for each number, binary search the remainder for its complement (target = ${target})`,
    codeLine: 1,
  });

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    steps.push({
      state: { nums: [...nums], target },
      highlights: [i],
      pointers: { i },
      message: `Fix nums[${i}] = ${nums[i]}. Its complement is ${target} - ${nums[i]} = ${complement}`,
      codeLine: 3,
      action: 'visit',
    });

    let lo = i + 1;
    let hi = nums.length - 1;

    if (lo <= hi) {
      steps.push({
        state: { nums: [...nums], target },
        highlights: [i],
        secondary: [lo, hi],
        pointers: { i, lo, hi },
        message: `Binary search window: indices ${lo}..${hi} (only to the right of i, so we never reuse the same element)`,
        codeLine: 4,
      });
    }

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);

      steps.push({
        state: { nums: [...nums], target },
        highlights: [i, mid],
        secondary: [lo, hi],
        pointers: { i, lo, hi, mid },
        message: `Probe the middle: mid=${mid}, nums[${mid}] = ${nums[mid]}. Compare against complement ${complement}`,
        codeLine: 6,
        action: 'compare',
      });

      if (nums[mid] === complement) {
        steps.push({
          state: { nums: [...nums], target, sum: nums[i] + nums[mid], result: [i + 1, mid + 1] },
          highlights: [i, mid],
          pointers: { i, mid },
          message: `Found! nums[${i}] + nums[${mid}] = ${nums[i]} + ${nums[mid]} = ${target}. Return [${i + 1}, ${mid + 1}] (1-indexed)`,
          codeLine: 8,
          action: 'found',
        });
        return steps;
      }

      if (nums[mid] < complement) {
        steps.push({
          state: { nums: [...nums], target },
          highlights: [mid],
          secondary: [i],
          pointers: { i, lo, hi, mid },
          message: `${nums[mid]} < ${complement} — the complement can only be right of mid. Discard the left half: lo = ${mid + 1}`,
          codeLine: 10,
          action: 'compare',
        });
        lo = mid + 1;
      } else {
        steps.push({
          state: { nums: [...nums], target },
          highlights: [mid],
          secondary: [i],
          pointers: { i, lo, hi, mid },
          message: `${nums[mid]} > ${complement} — the complement can only be left of mid. Discard the right half: hi = ${mid - 1}`,
          codeLine: 12,
          action: 'compare',
        });
        hi = mid - 1;
      }
    }
  }

  steps.push({
    state: { nums: [...nums], target, result: [] },
    highlights: [],
    message: 'No pair found',
    codeLine: 13,
  });

  return steps;
}

export const twoSumII: Algorithm = {
  id: 'two-sum-ii',
  name: 'Two Sum II - Input Array Is Sorted',
  category: 'Two Pointers',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — sorted array, shrink window',
  description:
    'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Return the indices of the two numbers (1-indexed) as an integer array.',
  problemUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
  code: {
    python: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1

    while l < r:
        curSum = numbers[l] + numbers[r]

        if curSum > target:
            r -= 1
        elif curSum < target:
            l += 1
        else:
            return [l + 1, r + 1]`,
    javascript: `function twoSum(numbers, target) {
    let l = 0;
    let r = numbers.length - 1;

    while (l < r) {
        const curSum = numbers[l] + numbers[r];

        if (curSum > target) {
            r--;
        } else if (curSum < target) {
            l++;
        } else {
            return [l + 1, r + 1];
        }
    }
}`,
    java: `public static int[] twoSum(int[] numbers, int target) {
    int l = 0;
    int r = numbers.length - 1;

    while (l < r) {
        int curSum = numbers[l] + numbers[r];

        if (curSum > target) {
            r--;
        } else if (curSum < target) {
            l++;
        } else {
            return new int[] { l + 1, r + 1 };
        }
    }
    return new int[] {};
}`,
  },
  defaultInput: { nums: [2, 7, 11, 15], target: 9 },
  run: runTwoSumII,
  optimalApproachName: 'Two Pointers',
  approaches: [
    {
      id: 'binary-search',
      name: 'Binary Search',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(1)',
      description:
        'Fix each number and binary search the rest of the sorted array for its complement — exploits the sorted order per-element instead of squeezing from both ends.',
      code: {
        python: `def twoSum(numbers, target):
    for i in range(len(numbers)):
        complement = target - numbers[i]
        lo, hi = i + 1, len(numbers) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if numbers[mid] == complement:
                return [i + 1, mid + 1]
            if numbers[mid] < complement:
                lo = mid + 1
            else:
                hi = mid - 1
    return []`,
        javascript: `function twoSum(numbers, target) {
    for (let i = 0; i < numbers.length; i++) {
        const complement = target - numbers[i];
        let lo = i + 1;
        let hi = numbers.length - 1;
        while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            if (numbers[mid] === complement) {
                return [i + 1, mid + 1];
            }
            if (numbers[mid] < complement) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
    }
    return [];
}`,
        java: `public static int[] twoSum(int[] numbers, int target) {
    for (int i = 0; i < numbers.length; i++) {
        int complement = target - numbers[i];
        int lo = i + 1;
        int hi = numbers.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (numbers[mid] == complement) {
                return new int[] { i + 1, mid + 1 };
            }
            if (numbers[mid] < complement) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
    }
    return new int[] {};
}`,
      },
      run: runTwoSumIIBinarySearch,
      lineExplanations: {
        python: {
          1: 'Define function taking sorted array and target',
          2: 'Fix each element in turn as the first number of the pair',
          3: 'The value that would complete the pair',
          4: 'Binary search window: only indices right of i (no element reuse)',
          5: 'Standard binary search loop',
          6: 'Probe the middle of the window',
          7: 'Is the middle element exactly the complement?',
          8: 'Found the pair — return 1-indexed positions',
          9: 'Middle too small — complement must lie right of mid',
          10: 'Discard the left half of the window',
          11: 'Middle too big — complement must lie left of mid',
          12: 'Discard the right half of the window',
          13: 'No pair found (problem guarantees this never happens)',
        },
        javascript: {
          1: 'Define function taking sorted array and target',
          2: 'Fix each element in turn as the first number of the pair',
          3: 'The value that would complete the pair',
          4: 'Search window starts just right of i (no element reuse)',
          5: 'Search window ends at the last index',
          6: 'Standard binary search loop',
          7: 'Probe the middle of the window',
          8: 'Is the middle element exactly the complement?',
          9: 'Found the pair — return 1-indexed positions',
          11: 'Middle too small — complement must lie right of mid',
          12: 'Discard the left half of the window',
          13: 'Middle too big — complement must lie left of mid',
          14: 'Discard the right half of the window',
          18: 'No pair found (problem guarantees this never happens)',
        },
        java: {
          1: 'Define function taking sorted array and target',
          2: 'Fix each element in turn as the first number of the pair',
          3: 'The value that would complete the pair',
          4: 'Search window starts just right of i (no element reuse)',
          5: 'Search window ends at the last index',
          6: 'Standard binary search loop',
          7: 'Probe the middle of the window',
          8: 'Is the middle element exactly the complement?',
          9: 'Found the pair — return 1-indexed positions',
          11: 'Middle too small — complement must lie right of mid',
          12: 'Discard the left half of the window',
          13: 'Middle too big — complement must lie left of mid',
          14: 'Discard the right half of the window',
          18: 'No pair found (problem guarantees this never happens)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking sorted array and target',
      2: 'Init two pointers at both ends of array',
      4: 'Loop while pointers haven\'t crossed',
      5: 'Compute sum of elements at both pointers',
      7: 'If sum exceeds target',
      8: 'Move right pointer left to decrease sum',
      9: 'If sum is below target',
      10: 'Move left pointer right to increase sum',
      12: 'Found target sum, return 1-indexed positions',
    },
    javascript: {
      1: 'Define function taking sorted array and target',
      2: 'Init left pointer at start',
      3: 'Init right pointer at end',
      5: 'Loop while pointers haven\'t crossed',
      6: 'Compute sum of elements at both pointers',
      8: 'If sum exceeds target',
      9: 'Move right pointer left to decrease sum',
      10: 'If sum is below target',
      11: 'Move left pointer right to increase sum',
      13: 'Found target sum, return 1-indexed positions',
    },
    java: {
      1: 'Define function taking sorted array and target',
      2: 'Init left pointer at start',
      3: 'Init right pointer at end',
      5: 'Loop while pointers haven\'t crossed',
      6: 'Compute sum of elements at both pointers',
      8: 'If sum exceeds target',
      9: 'Move right pointer left to decrease sum',
      10: 'If sum is below target',
      11: 'Move left pointer right to increase sum',
      13: 'Found target sum, return 1-indexed positions',
      16: 'Return empty array if no solution found',
    },
  },
};
