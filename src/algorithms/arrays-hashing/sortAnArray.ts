import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface SortAnArrayInput {
  nums: number[];
}

const idxRange = (lo: number, hi: number): number[] =>
  hi < lo ? [] : Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);

function runSortAnArrayQuickSort(input: unknown): AlgorithmStep[] {
  const { nums } = input as SortAnArrayInput;
  const arr = [...nums];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...arr] },
    highlights: [],
    message: `Quick sort: pick a pivot, push everything smaller to its left, then recurse on the two sides`,
    codeLine: 1,
  });

  const quickSort = (lo: number, hi: number) => {
    if (lo >= hi) return;

    const pivot = arr[hi];
    steps.push({
      state: { nums: [...arr] },
      highlights: [hi],
      secondary: idxRange(lo, hi - 1),
      pointers: { pivot: hi },
      message: `Partition [${lo}..${hi}] around pivot ${pivot} (the last element of this slice)`,
      codeLine: 5,
    });

    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (arr[j] < pivot) {
        const before = arr[j];
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({
          state: { nums: [...arr] },
          highlights: [i, j],
          secondary: [hi],
          pointers: { i, j },
          message: `${before} < pivot ${pivot} — swap it into the "smaller" zone at index ${i}`,
          codeLine: 9,
          action: 'swap',
        });
        i++;
      } else {
        steps.push({
          state: { nums: [...arr] },
          highlights: [j],
          secondary: [hi],
          pointers: { i, j },
          message: `${arr[j]} >= pivot ${pivot} — leave it on the right side, just advance j`,
          codeLine: 8,
          action: 'compare',
        });
      }
    }

    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    steps.push({
      state: { nums: [...arr] },
      highlights: [i],
      secondary: idxRange(lo, i - 1),
      pointers: { pivot: i },
      message: `Drop pivot ${pivot} into index ${i} — it is now in its final sorted position`,
      codeLine: 11,
      action: 'insert',
    });

    quickSort(lo, i - 1);
    quickSort(i + 1, hi);
  };

  quickSort(0, arr.length - 1);

  steps.push({
    state: { nums: [...arr], result: [...arr] },
    highlights: idxRange(0, arr.length - 1),
    message: `Every pivot landed in place — sorted: [${arr.join(', ')}]`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

function runSortAnArray(input: unknown): AlgorithmStep[] {
  const { nums } = input as SortAnArrayInput;
  const arr = [...nums];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...arr] },
    highlights: [],
    message: `Merge sort [${arr.join(', ')}]: keep halving until pieces are single elements, then merge sorted pieces`,
    codeLine: 1,
  });

  const mergeSort = (lo: number, hi: number) => {
    if (lo >= hi) return;

    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      state: { nums: [...arr] },
      highlights: idxRange(lo, mid),
      secondary: idxRange(mid + 1, hi),
      message: `Split [${lo}..${hi}] at ${mid}: left [${arr.slice(lo, mid + 1).join(', ')}] | right [${arr.slice(mid + 1, hi + 1).join(', ')}]`,
      codeLine: 5,
    });

    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);

    const merged: number[] = [];
    let i = lo;
    let j = mid + 1;

    while (i <= mid && j <= hi) {
      if (arr[i] <= arr[j]) {
        steps.push({
          state: { nums: [...arr] },
          highlights: [i],
          secondary: [j],
          pointers: { i, j },
          message: `${arr[i]} <= ${arr[j]} — take ${arr[i]} from the left half`,
          codeLine: 12,
          action: 'compare',
        });
        merged.push(arr[i]);
        i++;
      } else {
        steps.push({
          state: { nums: [...arr] },
          highlights: [j],
          secondary: [i],
          pointers: { i, j },
          message: `${arr[j]} < ${arr[i]} — take ${arr[j]} from the right half`,
          codeLine: 15,
          action: 'compare',
        });
        merged.push(arr[j]);
        j++;
      }
    }

    while (i <= mid) {
      steps.push({
        state: { nums: [...arr] },
        highlights: [i],
        pointers: { i },
        message: `Right half is exhausted — drain ${arr[i]} from the left half`,
        codeLine: 18,
      });
      merged.push(arr[i]);
      i++;
    }

    while (j <= hi) {
      steps.push({
        state: { nums: [...arr] },
        highlights: [j],
        pointers: { j },
        message: `Left half is exhausted — drain ${arr[j]} from the right half`,
        codeLine: 21,
      });
      merged.push(arr[j]);
      j++;
    }

    for (let k = 0; k < merged.length; k++) arr[lo + k] = merged[k];

    steps.push({
      state: { nums: [...arr] },
      highlights: idxRange(lo, hi),
      message: `Write the merged run back: [${lo}..${hi}] is now [${merged.join(', ')}]`,
      codeLine: 23,
      action: 'insert',
    });
  };

  mergeSort(0, arr.length - 1);

  steps.push({
    state: { nums: [...arr], result: [...arr] },
    highlights: idxRange(0, arr.length - 1),
    message: `All runs merged — sorted: [${arr.join(', ')}]`,
    codeLine: 25,
    action: 'found',
  });

  return steps;
}

export const sortAnArray: Algorithm = {
  id: 'sort-an-array',
  name: 'Sort an Array',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Divide & Conquer — split in half, sort each half, merge',
  description:
    'Given an array of integers nums, sort the array in ascending order and return it. You must solve it without using any built-in sort function, in O(n log n) time and with the smallest space complexity possible.',
  problemUrl: 'https://leetcode.com/problems/sort-an-array/',
  code: {
    python: `def sortArray(nums):
    def merge_sort(lo, hi):
        if lo >= hi:
            return
        mid = (lo + hi) // 2
        merge_sort(lo, mid)
        merge_sort(mid + 1, hi)
        merged = []
        i, j = lo, mid + 1
        while i <= mid and j <= hi:
            if nums[i] <= nums[j]:
                merged.append(nums[i])
                i += 1
            else:
                merged.append(nums[j])
                j += 1
        while i <= mid:
            merged.append(nums[i])
            i += 1
        while j <= hi:
            merged.append(nums[j])
            j += 1
        nums[lo:hi + 1] = merged
    merge_sort(0, len(nums) - 1)
    return nums`,
    javascript: `function sortArray(nums) {
    function mergeSort(lo, hi) {
        if (lo >= hi) return;
        const mid = Math.floor((lo + hi) / 2);
        mergeSort(lo, mid);
        mergeSort(mid + 1, hi);
        const merged = [];
        let i = lo, j = mid + 1;
        while (i <= mid && j <= hi) {
            if (nums[i] <= nums[j]) merged.push(nums[i++]);
            else merged.push(nums[j++]);
        }
        while (i <= mid) merged.push(nums[i++]);
        while (j <= hi) merged.push(nums[j++]);
        for (let k = 0; k < merged.length; k++) nums[lo + k] = merged[k];
    }
    mergeSort(0, nums.length - 1);
    return nums;
}`,
    java: `public static int[] sortArray(int[] nums) {
    mergeSort(nums, 0, nums.length - 1);
    return nums;
}

private static void mergeSort(int[] nums, int lo, int hi) {
    if (lo >= hi) return;
    int mid = (lo + hi) / 2;
    mergeSort(nums, lo, mid);
    mergeSort(nums, mid + 1, hi);
    int[] merged = new int[hi - lo + 1];
    int i = lo, j = mid + 1, k = 0;
    while (i <= mid && j <= hi) {
        merged[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++];
    }
    while (i <= mid) merged[k++] = nums[i++];
    while (j <= hi) merged[k++] = nums[j++];
    for (int t = 0; t < merged.length; t++) nums[lo + t] = merged[t];
}`,
  },
  defaultInput: { nums: [5, 2, 3, 1, 4, 6] },
  run: runSortAnArray,
  optimalApproachName: 'Merge Sort',
  approaches: [
    {
      id: 'quick-sort',
      name: 'Quick Sort',
      timeComplexity: 'O(n log n) average, O(n²) worst',
      spaceComplexity: 'O(log n)',
      description:
        'Sorts in place around a pivot instead of allocating merge buffers — less memory than merge sort, but no worst-case guarantee unless the pivot is randomized.',
      code: {
        python: `def sortArray(nums):
    def quick_sort(lo, hi):
        if lo >= hi:
            return
        pivot = nums[hi]
        i = lo
        for j in range(lo, hi):
            if nums[j] < pivot:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
        nums[i], nums[hi] = nums[hi], nums[i]
        quick_sort(lo, i - 1)
        quick_sort(i + 1, hi)
    quick_sort(0, len(nums) - 1)
    return nums`,
        javascript: `function sortArray(nums) {
    function quickSort(lo, hi) {
        if (lo >= hi) return;
        const pivot = nums[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) {
            if (nums[j] < pivot) {
                [nums[i], nums[j]] = [nums[j], nums[i]];
                i++;
            }
        }
        [nums[i], nums[hi]] = [nums[hi], nums[i]];
        quickSort(lo, i - 1);
        quickSort(i + 1, hi);
    }
    quickSort(0, nums.length - 1);
    return nums;
}`,
        java: `public static int[] sortArray(int[] nums) {
    quickSort(nums, 0, nums.length - 1);
    return nums;
}

private static void quickSort(int[] nums, int lo, int hi) {
    if (lo >= hi) return;
    int pivot = nums[hi];
    int i = lo;
    for (int j = lo; j < hi; j++) {
        if (nums[j] < pivot) {
            int tmp = nums[i];
            nums[i] = nums[j];
            nums[j] = tmp;
            i++;
        }
    }
    int tmp = nums[i];
    nums[i] = nums[hi];
    nums[hi] = tmp;
    quickSort(nums, lo, i - 1);
    quickSort(nums, i + 1, hi);
}`,
      },
      run: runSortAnArrayQuickSort,
      lineExplanations: {
        python: {
          1: 'Sort nums in place and return it',
          2: 'Recursive helper sorting the slice [lo..hi]',
          3: 'Slices of size 0 or 1 are already sorted',
          5: 'Choose the last element of the slice as the pivot',
          6: 'i marks the boundary of the "smaller than pivot" zone',
          7: 'Scan every element before the pivot',
          8: 'Element belongs on the small side?',
          9: 'Swap it into the small zone',
          10: 'Grow the small zone by one',
          11: 'Put the pivot right after the small zone — its final home',
          12: 'Recurse on everything left of the pivot',
          13: 'Recurse on everything right of the pivot',
          15: 'Array is sorted in place',
        },
        javascript: {
          1: 'Sort nums in place and return it',
          2: 'Recursive helper sorting the slice [lo..hi]',
          3: 'Slices of size 0 or 1 are already sorted',
          4: 'Choose the last element of the slice as the pivot',
          5: 'i marks the boundary of the "smaller than pivot" zone',
          6: 'Scan every element before the pivot',
          7: 'Element belongs on the small side?',
          8: 'Swap it into the small zone',
          9: 'Grow the small zone by one',
          12: 'Put the pivot right after the small zone — its final home',
          13: 'Recurse on everything left of the pivot',
          14: 'Recurse on everything right of the pivot',
          17: 'Array is sorted in place',
        },
        java: {
          1: 'Sort nums in place and return it',
          6: 'Recursive helper sorting the slice [lo..hi]',
          7: 'Slices of size 0 or 1 are already sorted',
          8: 'Choose the last element of the slice as the pivot',
          9: 'i marks the boundary of the "smaller than pivot" zone',
          10: 'Scan every element before the pivot',
          11: 'Element belongs on the small side?',
          12: 'Swap it into the small zone',
          15: 'Grow the small zone by one',
          18: 'Put the pivot right after the small zone — its final home',
          21: 'Recurse on everything left of the pivot',
          22: 'Recurse on everything right of the pivot',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Sort nums in place and return it',
      2: 'Recursive helper that sorts the slice [lo..hi]',
      3: 'A slice of one element is already sorted',
      5: 'Split point — halve the slice',
      6: 'Sort the left half',
      7: 'Sort the right half',
      8: 'Buffer holding the merged run',
      9: 'One read pointer per sorted half',
      10: 'Merge while both halves still have elements',
      11: 'Left value is the smaller one?',
      12: 'Take from the left half',
      15: 'Otherwise take from the right half',
      17: 'Drain whatever is left in the left half',
      20: 'Drain whatever is left in the right half',
      23: 'Copy the merged run back over the original slice',
      24: 'Kick off the recursion on the whole array',
      25: 'nums is now sorted ascending',
    },
    javascript: {
      1: 'Sort nums in place and return it',
      2: 'Recursive helper that sorts the slice [lo..hi]',
      3: 'A slice of one element is already sorted',
      4: 'Split point — halve the slice',
      5: 'Sort the left half',
      6: 'Sort the right half',
      7: 'Buffer holding the merged run',
      8: 'One read pointer per sorted half',
      9: 'Merge while both halves still have elements',
      10: 'Left value is smaller or equal — take it (keeps the sort stable)',
      11: 'Otherwise take from the right half',
      13: 'Drain whatever is left in the left half',
      14: 'Drain whatever is left in the right half',
      15: 'Copy the merged run back over the original slice',
      17: 'Kick off the recursion on the whole array',
      18: 'nums is now sorted ascending',
    },
    java: {
      1: 'Sort nums in place and return it',
      2: 'Kick off the recursion on the whole array',
      6: 'Recursive helper that sorts the slice [lo..hi]',
      7: 'A slice of one element is already sorted',
      8: 'Split point — halve the slice',
      9: 'Sort the left half',
      10: 'Sort the right half',
      11: 'Buffer holding the merged run',
      12: 'One read pointer per half plus a write pointer',
      13: 'Merge while both halves still have elements',
      14: 'Take the smaller of the two front values',
      16: 'Drain whatever is left in the left half',
      17: 'Drain whatever is left in the right half',
      18: 'Copy the merged run back over the original slice',
    },
  },
};
