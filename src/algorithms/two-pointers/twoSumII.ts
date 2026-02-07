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
};
