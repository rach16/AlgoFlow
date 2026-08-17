import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runRemoveDuplicates(input: unknown): AlgorithmStep[] {
  const nums = [...(input as number[])];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: `Array is sorted: [${nums.join(', ')}]. Duplicates are always adjacent, so one pass can compact them away`,
    codeLine: 1,
  });

  if (nums.length === 0) {
    steps.push({
      state: { nums: [], result: 0 },
      highlights: [],
      message: `Empty array — nothing to keep, return 0`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  let slow = 0;

  steps.push({
    state: { nums: [...nums] },
    highlights: [0],
    pointers: { slow },
    message: `slow = 0 marks the last unique value written. nums[0] = ${nums[0]} is unique by definition`,
    codeLine: 5,
  });

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      steps.push({
        state: { nums: [...nums] },
        highlights: [fast],
        secondary: [slow],
        pointers: { slow, fast },
        message: `nums[${fast}] = ${nums[fast]} differs from the last kept value nums[${slow}] = ${nums[slow]} — a new unique value`,
        codeLine: 7,
        action: 'compare',
      });

      slow++;
      nums[slow] = nums[fast];

      steps.push({
        state: { nums: [...nums] },
        highlights: [slow],
        secondary: [fast],
        pointers: { slow, fast },
        message: `Advance slow to ${slow} and write ${nums[slow]} there. Front of the array is now [${nums.slice(0, slow + 1).join(', ')}]`,
        codeLine: 9,
        action: 'insert',
      });
    } else {
      steps.push({
        state: { nums: [...nums] },
        highlights: [fast],
        secondary: [slow],
        pointers: { slow, fast },
        message: `nums[${fast}] = ${nums[fast]} equals the last kept value — duplicate, skip it (slow stays at ${slow})`,
        codeLine: 7,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], result: slow + 1 },
    highlights: Array.from({ length: slow + 1 }, (_, idx) => idx),
    message: `slow ended at ${slow}, so k = ${slow + 1} unique values sit in nums[0..${slow}] = [${nums.slice(0, slow + 1).join(', ')}]. Everything past that is ignored`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runRemoveDuplicatesPrevScan(input: unknown): AlgorithmStep[] {
  const nums = [...(input as number[])];
  const original = [...nums];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: `Same array, different framing: instead of comparing against the last value KEPT, compare each element against its ORIGINAL left neighbour and count how many survive`,
    codeLine: 1,
  });

  if (nums.length === 0) {
    steps.push({
      state: { nums: [], result: 0 },
      highlights: [],
      message: `Empty array — return 0`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  let k = 1;

  steps.push({
    state: { nums: [...nums] },
    highlights: [0],
    pointers: { k },
    message: `nums[0] = ${nums[0]} always survives, so start the write counter at k = 1`,
    codeLine: 5,
  });

  for (let i = 1; i < nums.length; i++) {
    if (original[i] !== original[i - 1]) {
      steps.push({
        state: { nums: [...nums] },
        highlights: [i],
        secondary: [i - 1],
        pointers: { i, k },
        message: `nums[${i}] = ${original[i]} != its left neighbour ${original[i - 1]} — a run just started, keep it`,
        codeLine: 7,
        action: 'compare',
      });

      nums[k] = original[i];
      steps.push({
        state: { nums: [...nums] },
        highlights: [k],
        secondary: [i],
        pointers: { i, k: k + 1 },
        message: `Write ${original[i]} at index ${k}, then bump k to ${k + 1}. Kept so far: [${nums.slice(0, k + 1).join(', ')}]`,
        codeLine: 8,
        action: 'insert',
      });
      k++;
    } else {
      steps.push({
        state: { nums: [...nums] },
        highlights: [i],
        secondary: [i - 1],
        pointers: { i, k },
        message: `nums[${i}] = ${original[i]} matches its left neighbour — still inside the same run, so it is a duplicate`,
        codeLine: 7,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], result: k },
    highlights: Array.from({ length: k }, (_, idx) => idx),
    message: `k = ${k} unique values: [${nums.slice(0, k).join(', ')}]. Because writes always land at index k <= i, the neighbour we read is never one we already overwrote`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const removeDuplicatesFromSortedArray: Algorithm = {
  id: 'remove-duplicates-sorted-array',
  name: 'Remove Duplicates From Sorted Array',
  category: 'Two Pointers',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — slow write, fast read',
  description:
    'Given an integer array nums sorted in non-decreasing order, remove the duplicates in place so each unique element appears only once, keeping the relative order. Return k, the number of unique elements; the first k slots of nums must hold them.',
  problemUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
  code: {
    python: `def removeDuplicates(nums):
    if not nums:
        return 0

    slow = 0
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]

    return slow + 1`,
    javascript: `function removeDuplicates(nums) {
    if (nums.length === 0) return 0;

    let slow = 0;
    for (let fast = 1; fast < nums.length; fast++) {
        if (nums[fast] !== nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }

    return slow + 1;
}`,
    java: `public static int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;

    int slow = 0;
    for (int fast = 1; fast < nums.length; fast++) {
        if (nums[fast] != nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }

    return slow + 1;
}`,
  },
  defaultInput: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4],
  run: runRemoveDuplicates,
  optimalApproachName: 'Slow / Fast Pointers',
  approaches: [
    {
      id: 'neighbour-count-scan',
      name: 'Neighbour Count Scan',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of comparing against the last value kept, compare each element with its immediate left neighbour and use a single write counter k — the same O(n) work, but it reasons about runs of equal values rather than about two pointers.',
      code: {
        python: `def removeDuplicates(nums):
    if not nums:
        return 0

    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[i - 1]:
            nums[k] = nums[i]
            k += 1

    return k`,
        javascript: `function removeDuplicates(nums) {
    if (nums.length === 0) return 0;

    let k = 1;
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[i - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }

    return k;
}`,
        java: `public static int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;

    int k = 1;
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] != nums[i - 1]) {
            nums[k] = nums[i];
            k++;
        }
    }

    return k;
}`,
      },
      run: runRemoveDuplicatesPrevScan,
      lineExplanations: {
        python: {
          1: 'Define function taking the sorted array',
          2: 'Empty input guard',
          3: 'No unique elements',
          5: 'nums[0] always survives, so k starts at 1',
          6: 'Scan from the second element',
          7: 'Is this the first element of a new run?',
          8: 'Yes — write it at the next free slot',
          9: 'One more unique value kept',
          11: 'k is the count of unique values',
        },
        javascript: {
          1: 'Define function taking the sorted array',
          2: 'Empty input guard',
          4: 'nums[0] always survives, so k starts at 1',
          5: 'Scan from the second element',
          6: 'Is this the first element of a new run?',
          7: 'Yes — write it at the next free slot',
          8: 'One more unique value kept',
          12: 'k is the count of unique values',
        },
        java: {
          1: 'Define function taking the sorted array',
          2: 'Empty input guard',
          4: 'nums[0] always survives, so k starts at 1',
          5: 'Scan from the second element',
          6: 'Is this the first element of a new run?',
          7: 'Yes — write it at the next free slot',
          8: 'One more unique value kept',
          12: 'k is the count of unique values',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the sorted array',
      2: 'Empty input guard',
      3: 'No unique elements to report',
      5: 'slow marks the last unique value written',
      6: 'fast scans every later element',
      7: 'Does fast see something new?',
      8: 'Yes — make room for it',
      9: 'Write the new unique value at slow',
      11: 'Length of the unique prefix is slow + 1',
    },
    javascript: {
      1: 'Define function taking the sorted array',
      2: 'Empty input guard',
      4: 'slow marks the last unique value written',
      5: 'fast scans every later element',
      6: 'Does fast see something new?',
      7: 'Make room for it',
      8: 'Write the new unique value at slow',
      12: 'Length of the unique prefix is slow + 1',
    },
    java: {
      1: 'Define function taking the sorted array',
      2: 'Empty input guard',
      4: 'slow marks the last unique value written',
      5: 'fast scans every later element',
      6: 'Does fast see something new?',
      7: 'Make room for it',
      8: 'Write the new unique value at slow',
      12: 'Length of the unique prefix is slow + 1',
    },
  },
};
