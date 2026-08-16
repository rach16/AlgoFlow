import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface TwoSumInput {
  nums: number[];
  target: number;
}

function runTwoSumSortTwoPointers(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as TwoSumInput;
  const steps: AlgorithmStep[] = [];

  const pairs = nums.map((num, i) => ({ num, i }));
  pairs.sort((a, b) => a.num - b.num);
  const sorted = pairs.map((p) => p.num);

  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Sort the values (keeping their original indices), then squeeze with two pointers`,
    codeLine: 2,
  });

  steps.push({
    state: { nums: [...sorted], target },
    highlights: [],
    pointers: { left: 0, right: sorted.length - 1 },
    message: `Sorted: [${sorted.join(', ')}]. Start left at 0, right at ${sorted.length - 1}`,
    codeLine: 3,
  });

  let left = 0;
  let right = sorted.length - 1;

  while (left < right) {
    const sum = sorted[left] + sorted[right];
    if (sum === target) {
      const result = [pairs[left].i, pairs[right].i].sort((a, b) => a - b);
      steps.push({
        state: { nums: [...sorted], target, result },
        highlights: [left, right],
        pointers: { left, right },
        message: `${sorted[left]} + ${sorted[right]} = ${target}. Found! Original indices: [${result.join(', ')}]`,
        codeLine: 7,
        action: 'found',
      });
      return steps;
    }
    if (sum < target) {
      steps.push({
        state: { nums: [...sorted], target },
        highlights: [left],
        secondary: [right],
        pointers: { left, right },
        message: `${sorted[left]} + ${sorted[right]} = ${sum} < ${target} — sum too small, move left pointer right`,
        codeLine: 9,
        action: 'compare',
      });
      left++;
    } else {
      steps.push({
        state: { nums: [...sorted], target },
        highlights: [right],
        secondary: [left],
        pointers: { left, right },
        message: `${sorted[left]} + ${sorted[right]} = ${sum} > ${target} — sum too big, move right pointer left`,
        codeLine: 11,
        action: 'compare',
      });
      right--;
    }
  }

  steps.push({
    state: { nums: [...sorted], target },
    highlights: [],
    message: 'Pointers met — no pair sums to the target',
    codeLine: 12,
  });

  return steps;
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
    java: `public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> hashmap = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (hashmap.containsKey(complement)) {
            return new int[] { hashmap.get(complement), i };
        }
        hashmap.put(nums[i], i);
    }
    return new int[] {};
}`,
  },
  defaultInput: { nums: [2, 7, 11, 15], target: 9 },
  run: runTwoSum,
  optimalApproachName: 'Hash Map',
  approaches: [
    {
      id: 'sort-two-pointers',
      name: 'Sort + Two Pointers',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Sort the values (remembering original indices), then squeeze from both ends: sum too small → move left, too big → move right.',
      code: {
        python: `def twoSum(nums, target):
    pairs = sorted((num, i) for i, num in enumerate(nums))
    left, right = 0, len(nums) - 1
    while left < right:
        s = pairs[left][0] + pairs[right][0]
        if s == target:
            return sorted([pairs[left][1], pairs[right][1]])
        if s < target:
            left += 1
        else:
            right -= 1
    return []`,
        javascript: `function twoSum(nums, target) {
    const pairs = nums.map((num, i) => [num, i]).sort((a, b) => a[0] - b[0]);
    let left = 0, right = nums.length - 1;
    while (left < right) {
        const s = pairs[left][0] + pairs[right][0];
        if (s === target) {
            return [pairs[left][1], pairs[right][1]].sort((a, b) => a - b);
        }
        if (s < target) left++;
        else right--;
    }
    return [];
}`,
        java: `public static int[] twoSum(int[] nums, int target) {
    int n = nums.length;
    int[][] pairs = new int[n][2];
    for (int i = 0; i < n; i++) pairs[i] = new int[] { nums[i], i };
    Arrays.sort(pairs, (a, b) -> a[0] - b[0]);
    int left = 0, right = n - 1;
    while (left < right) {
        int s = pairs[left][0] + pairs[right][0];
        if (s == target) {
            return new int[] { Math.min(pairs[left][1], pairs[right][1]),
                               Math.max(pairs[left][1], pairs[right][1]) };
        }
        if (s < target) left++;
        else right--;
    }
    return new int[] {};
}`,
      },
      run: runTwoSumSortTwoPointers,
      lineExplanations: {
        python: {
          1: 'Define function taking nums array and target',
          2: 'Sort (value, original index) pairs by value',
          3: 'Two pointers at both ends of the sorted array',
          4: 'Squeeze until the pointers meet',
          5: 'Sum of the two pointed-at values',
          6: 'Exact match?',
          7: 'Return the original indices (sorted for a stable answer)',
          8: 'Sum too small — need a bigger value',
          9: 'Move left pointer right (bigger values)',
          11: 'Sum too big — move right pointer left (smaller values)',
        },
        javascript: {
          1: 'Define function taking nums array and target',
          2: 'Sort [value, original index] pairs by value',
          3: 'Two pointers at both ends of the sorted array',
          4: 'Squeeze until the pointers meet',
          5: 'Sum of the two pointed-at values',
          6: 'Exact match?',
          7: 'Return the original indices (sorted for a stable answer)',
          9: 'Sum too small — move left pointer right',
          10: 'Sum too big — move right pointer left',
        },
        java: {
          1: 'Define function taking nums array and target',
          3: 'Build [value, original index] pairs',
          5: 'Sort pairs by value',
          6: 'Two pointers at both ends of the sorted array',
          7: 'Squeeze until the pointers meet',
          8: 'Sum of the two pointed-at values',
          9: 'Exact match?',
          10: 'Return the original indices in ascending order',
          13: 'Sum too small — move left pointer right',
          14: 'Sum too big — move right pointer left',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array and target',
      2: 'Create empty hashmap to store {value: index} pairs',
      3: 'Loop through each number with its index',
      4: 'Calculate what number we need (target minus current)',
      5: 'Check if that complement was already seen',
      6: 'Found it! Return both indices',
      7: "Haven't found match yet — store current number and index",
    },
    javascript: {
      1: 'Define function taking nums array and target',
      2: 'Create empty hashmap to store {value: index} pairs',
      3: 'Loop through each index in the array',
      4: 'Calculate what number we need (target minus current)',
      5: 'Check if that complement was already seen',
      6: 'Found it! Return both indices',
      8: "Haven't found match yet — store current number and index",
    },
    java: {
      1: 'Define function taking nums array and target',
      2: 'Create empty HashMap to store {value: index} pairs',
      3: 'Loop through each index in the array',
      4: 'Calculate what number we need (target minus current)',
      5: 'Check if that complement was already seen',
      6: 'Found it! Return both indices',
      8: "Haven't found match yet — store current number and index",
    },
  },
};
