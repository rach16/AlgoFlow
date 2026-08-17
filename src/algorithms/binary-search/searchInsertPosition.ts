import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface SearchInsertInput {
  nums: number[];
  target: number;
}

function runSearchInsertPosition(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as SearchInsertInput;
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Find where ${target} belongs in [${nums.join(', ')}] — its index if present, otherwise the index it would be inserted at`,
    codeLine: 1,
  });

  let lo = 0;
  let hi = n;

  steps.push({
    state: { nums: [...nums], target, lo, hi },
    highlights: Array.from({ length: n }, (_, i) => i),
    pointers: { lo, hi: n - 1 },
    message: `Lower bound: lo=0, hi=${n} (one past the end, so "insert after everything" is representable). We want the FIRST index i with nums[i] >= ${target}`,
    codeLine: 2,
  });

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    const range: number[] = [];
    for (let i = lo; i < hi; i++) range.push(i);

    steps.push({
      state: { nums: [...nums], target, lo, hi, mid },
      highlights: range,
      secondary: [mid],
      pointers: { lo, mid, hi: Math.min(hi, n - 1) },
      message: `Live window is [${lo}, ${hi - 1}] — mid = (${lo} + ${hi}) / 2 = ${mid}, nums[${mid}] = ${nums[mid]}`,
      codeLine: 5,
      action: 'visit',
    });

    if (nums[mid] < target) {
      steps.push({
        state: { nums: [...nums], target, lo, hi, mid },
        highlights: range,
        secondary: [mid],
        pointers: { lo, mid, hi: Math.min(hi, n - 1) },
        message: `${nums[mid]} < ${target} — index ${mid} is too small to be the answer, and so is everything left of it. lo = ${mid + 1}`,
        codeLine: 8,
        action: 'compare',
      });
      lo = mid + 1;
    } else {
      steps.push({
        state: { nums: [...nums], target, lo, hi, mid },
        highlights: range,
        secondary: [mid],
        pointers: { lo, mid, hi: Math.min(hi, n - 1) },
        message: `${nums[mid]} >= ${target} — index ${mid} is still a valid landing spot, so keep it in the window: hi = ${mid} (note: hi = mid, not mid - 1)`,
        codeLine: 10,
        action: 'compare',
      });
      hi = mid;
    }
  }

  const inRange = lo < n;
  const verdict = inRange
    ? nums[lo] === target
      ? `nums[${lo}] = ${target} — the target already lives there`
      : `nums[${lo}] = ${nums[lo]} is the first value >= ${target}, so ${target} slides in at index ${lo}`
    : `every value is smaller than ${target}, so it appends at index ${lo}`;

  steps.push({
    state: { nums: [...nums], target, result: lo },
    highlights: inRange ? [lo] : [],
    pointers: inRange ? { lo } : undefined,
    message: `lo and hi met at ${lo} — ${verdict}. Answer: ${lo}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runSearchInsertPositionLinearScan(input: unknown): AlgorithmStep[] {
  const { nums, target } = input as SearchInsertInput;
  const steps: AlgorithmStep[] = [];
  const n = nums.length;

  steps.push({
    state: { nums: [...nums], target },
    highlights: [],
    message: `Linear scan: walk left to right and stop at the first value that is >= ${target}`,
    codeLine: 1,
  });

  for (let i = 0; i < n; i++) {
    steps.push({
      state: { nums: [...nums], target, i },
      highlights: [i],
      pointers: { i },
      message: `nums[${i}] = ${nums[i]} — is it >= ${target}?`,
      codeLine: 3,
      action: 'compare',
    });

    if (nums[i] >= target) {
      steps.push({
        state: { nums: [...nums], target, result: i },
        highlights: [i],
        pointers: { i },
        message: `Yes — ${nums[i]} >= ${target}, so ${target} belongs at index ${i}. Took ${i + 1} comparisons; binary search needs at most ${Math.ceil(Math.log2(n + 1))}`,
        codeLine: 4,
        action: 'found',
      });
      return steps;
    }
  }

  steps.push({
    state: { nums: [...nums], target, result: n },
    highlights: [],
    message: `Never found a value >= ${target} — it appends at index ${n}. O(n) work versus binary search's O(log n)`,
    codeLine: 5,
    action: 'found',
  });

  return steps;
}

export const searchInsertPosition: Algorithm = {
  id: 'search-insert-position',
  name: 'Search Insert Position',
  category: 'Binary Search',
  difficulty: 'Easy',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — lower bound: first index with nums[i] >= target',
  description:
    'Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be inserted in order. You must write an algorithm with O(log n) runtime complexity.',
  problemUrl: 'https://leetcode.com/problems/search-insert-position/',
  code: {
    python: `def searchInsert(nums, target):
    lo, hi = 0, len(nums)

    while lo < hi:
        mid = (lo + hi) // 2

        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid

    return lo`,
    javascript: `function searchInsert(nums, target) {
    let lo = 0;
    let hi = nums.length;

    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        if (nums[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    return lo;
}`,
    java: `public static int searchInsert(int[] nums, int target) {
    int lo = 0;
    int hi = nums.length;

    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;

        if (nums[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    return lo;
}`,
  },
  defaultInput: { nums: [1, 3, 5, 6, 8, 10, 12, 15], target: 9 },
  run: runSearchInsertPosition,
  optimalApproachName: 'Lower-Bound Binary Search',
  approaches: [
    {
      id: 'linear-scan-insert',
      name: 'Linear Scan',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Walk the array from the left and return the first index whose value is >= target — trivially correct, but O(n) instead of the O(log n) the problem demands.',
      code: {
        python: `def searchInsert(nums, target):
    for i in range(len(nums)):
        if nums[i] >= target:
            return i
    return len(nums)`,
        javascript: `function searchInsert(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] >= target) {
            return i;
        }
    }
    return nums.length;
}`,
        java: `public static int searchInsert(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] >= target) {
            return i;
        }
    }
    return nums.length;
}`,
      },
      run: runSearchInsertPositionLinearScan,
      lineExplanations: {
        python: {
          1: 'Define function taking the sorted array and the target',
          2: 'Visit every index from left to right',
          3: 'First value that is >= target marks the insert spot',
          4: 'Return that index',
          5: 'All values were smaller — the target appends at the end',
        },
        javascript: {
          1: 'Define function taking the sorted array and the target',
          2: 'Visit every index from left to right',
          3: 'First value that is >= target marks the insert spot',
          4: 'Return that index',
          7: 'All values were smaller — the target appends at the end',
        },
        java: {
          1: 'Define method taking the sorted array and the target',
          2: 'Visit every index from left to right',
          3: 'First value that is >= target marks the insert spot',
          4: 'Return that index',
          7: 'All values were smaller — the target appends at the end',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the sorted array and the target',
      2: 'hi starts at len(nums), not len(nums) - 1, so "append at the end" is reachable',
      4: 'Shrink until the window is empty; lo is then the answer',
      5: 'Midpoint of the current half-open window [lo, hi)',
      7: 'Is the midpoint strictly too small to be the insert spot?',
      8: 'Discard mid and everything left of it',
      9: 'Otherwise mid itself is still a candidate',
      10: 'Keep mid in the window — hi = mid, never mid - 1',
      12: 'lo == hi is the first index whose value is >= target',
    },
    javascript: {
      1: 'Define function taking the sorted array and the target',
      2: 'Left edge of the search window',
      3: 'hi starts at nums.length so "append at the end" is reachable',
      5: 'Shrink until the window is empty; lo is then the answer',
      6: 'Midpoint of the current half-open window [lo, hi)',
      8: 'Is the midpoint strictly too small to be the insert spot?',
      9: 'Discard mid and everything left of it',
      10: 'Otherwise mid itself is still a candidate',
      11: 'Keep mid in the window — hi = mid, never mid - 1',
      15: 'lo == hi is the first index whose value is >= target',
    },
    java: {
      1: 'Define method taking the sorted array and the target',
      2: 'Left edge of the search window',
      3: 'hi starts at nums.length so "append at the end" is reachable',
      5: 'Shrink until the window is empty; lo is then the answer',
      6: 'Overflow-safe midpoint of the half-open window [lo, hi)',
      8: 'Is the midpoint strictly too small to be the insert spot?',
      9: 'Discard mid and everything left of it',
      10: 'Otherwise mid itself is still a candidate',
      11: 'Keep mid in the window — hi = mid, never mid - 1',
      15: 'lo == hi is the first index whose value is >= target',
    },
  },
};
