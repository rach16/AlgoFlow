import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface KthLargestElementInput {
  nums: number[];
  k: number;
}

function runKthLargestElement(input: unknown): AlgorithmStep[] {
  const { nums: inputNums, k } = input as KthLargestElementInput;
  const nums = [...inputNums];
  const steps: AlgorithmStep[] = [];
  const targetIdx = nums.length - k; // kth largest = (n-k)th smallest in 0-indexed

  steps.push({
    state: { nums: [...nums], hashMap: { k: k, targetIndex: targetIdx } },
    highlights: [],
    message: `Find the ${k}th largest element. Using QuickSelect: kth largest = index ${targetIdx} in sorted array.`,
    codeLine: 1,
  });

  function quickSelect(left: number, right: number, target: number): number {
    if (left === right) {
      steps.push({
        state: { nums: [...nums], hashMap: { k: k, answer: nums[left] } },
        highlights: [left],
        message: `Single element at index ${left}: value = ${nums[left]}`,
        codeLine: 3,
        action: 'found',
      });
      return nums[left];
    }

    // Choose pivot (rightmost element)
    const pivot = nums[right];
    let p = left;

    steps.push({
      state: { nums: [...nums], hashMap: { k: k, pivot: pivot, left: left, right: right } },
      highlights: [right],
      pointers: { left, right, p: left },
      message: `QuickSelect [${left}..${right}]: pivot = nums[${right}] = ${pivot}`,
      codeLine: 4,
      action: 'visit',
    });

    for (let i = left; i < right; i++) {
      steps.push({
        state: { nums: [...nums], hashMap: { k: k, pivot: pivot, comparing: nums[i] } },
        highlights: [i, right],
        pointers: { left, right, p, i },
        message: `Compare nums[${i}]=${nums[i]} with pivot=${pivot}`,
        codeLine: 6,
        action: 'compare',
      });

      if (nums[i] <= pivot) {
        // Swap nums[p] and nums[i]
        [nums[p], nums[i]] = [nums[i], nums[p]];

        steps.push({
          state: { nums: [...nums], hashMap: { k: k, pivot: pivot } },
          highlights: [p, i],
          pointers: { left, right, p, i },
          message: `${nums[i]} <= ${pivot}: Swap nums[${p}] and nums[${i}]. p moves to ${p + 1}`,
          codeLine: 7,
          action: 'swap',
        });

        p++;
      }
    }

    // Place pivot in correct position
    [nums[p], nums[right]] = [nums[right], nums[p]];

    steps.push({
      state: { nums: [...nums], hashMap: { k: k, pivotPosition: p, pivotValue: pivot } },
      highlights: [p],
      pointers: { left, right, p },
      message: `Place pivot ${pivot} at index ${p}. Elements left of ${p} are smaller, right are larger.`,
      codeLine: 9,
      action: 'swap',
    });

    if (p === target) {
      steps.push({
        state: { nums: [...nums], hashMap: { k: k, answer: nums[p] }, result: nums[p] },
        highlights: [p],
        message: `Pivot index ${p} == target index ${target}! The ${k}th largest element is ${nums[p]}`,
        codeLine: 10,
        action: 'found',
      });
      return nums[p];
    } else if (p < target) {
      steps.push({
        state: { nums: [...nums], hashMap: { k: k, pivotPosition: p, target: target } },
        highlights: [p],
        message: `Pivot at ${p} < target ${target}: Search right half [${p + 1}..${right}]`,
        codeLine: 12,
        action: 'visit',
      });
      return quickSelect(p + 1, right, target);
    } else {
      steps.push({
        state: { nums: [...nums], hashMap: { k: k, pivotPosition: p, target: target } },
        highlights: [p],
        message: `Pivot at ${p} > target ${target}: Search left half [${left}..${p - 1}]`,
        codeLine: 14,
        action: 'visit',
      });
      return quickSelect(left, p - 1, target);
    }
  }

  const result = quickSelect(0, nums.length - 1, targetIdx);

  steps.push({
    state: { nums: [...nums], result },
    highlights: [nums.indexOf(result)],
    message: `QuickSelect complete! The ${k}th largest element is ${result}`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const kthLargestElement: Algorithm = {
  id: 'kth-largest-element',
  name: 'Kth Largest Element in an Array',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(n) avg',
  spaceComplexity: 'O(1)',
  pattern: 'Quickselect — partition around pivot, recurse one side',
  description:
    'Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in the sorted order, not the kth distinct element. Solve it without sorting.',
  problemUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
  code: {
    python: `def findKthLargest(nums, k):
    k = len(nums) - k

    def quickSelect(l, r):
        pivot, p = nums[r], l
        for i in range(l, r):
            if nums[i] <= pivot:
                nums[p], nums[i] = nums[i], nums[p]
                p += 1
        nums[p], nums[r] = nums[r], nums[p]

        if p > k:
            return quickSelect(l, p - 1)
        elif p < k:
            return quickSelect(p + 1, r)
        else:
            return nums[p]

    return quickSelect(0, len(nums) - 1)`,
    javascript: `function findKthLargest(nums, k) {
    k = nums.length - k;

    function quickSelect(l, r) {
        const pivot = nums[r];
        let p = l;
        for (let i = l; i < r; i++) {
            if (nums[i] <= pivot) {
                [nums[p], nums[i]] = [nums[i], nums[p]];
                p++;
            }
        }
        [nums[p], nums[r]] = [nums[r], nums[p]];

        if (p > k) return quickSelect(l, p - 1);
        else if (p < k) return quickSelect(p + 1, r);
        else return nums[p];
    }

    return quickSelect(0, nums.length - 1);
}`,
    java: `public static int findKthLargest(int[] nums, int k) {
    k = nums.length - k;
    return quickSelect(nums, 0, nums.length - 1, k);
}

private static int quickSelect(int[] nums, int l, int r, int k) {
    int pivot = nums[r];
    int p = l;
    for (int i = l; i < r; i++) {
        if (nums[i] <= pivot) {
            int temp = nums[p];
            nums[p] = nums[i];
            nums[i] = temp;
            p++;
        }
    }
    int temp = nums[p];
    nums[p] = nums[r];
    nums[r] = temp;

    if (p > k) return quickSelect(nums, l, p - 1, k);
    else if (p < k) return quickSelect(nums, p + 1, r, k);
    else return nums[p];
}`,
  },
  defaultInput: { nums: [3, 2, 1, 5, 6, 4], k: 2 },
  run: runKthLargestElement,
  lineExplanations: {
    python: {
      1: 'Define function with nums array and k',
      2: 'Convert kth largest to index in sorted array',
      4: 'Define recursive quickSelect helper',
      5: 'Choose rightmost element as pivot',
      6: 'Iterate and partition around pivot',
      7: 'If current element <= pivot',
      8: 'Swap to place it in left partition',
      9: 'Move partition pointer right',
      10: 'Place pivot in its correct sorted position',
      12: 'If pivot landed right of target, go left',
      13: 'Recurse on left partition',
      14: 'If pivot landed left of target, go right',
      15: 'Recurse on right partition',
      17: 'Pivot is at target: return the answer',
      19: 'Start quickSelect on entire array',
    },
    javascript: {
      1: 'Define function with nums array and k',
      2: 'Convert kth largest to sorted index',
      4: 'Define recursive quickSelect helper',
      5: 'Choose rightmost element as pivot',
      6: 'Init partition pointer',
      7: 'Iterate and partition around pivot',
      8: 'If current element <= pivot',
      9: 'Swap to place in left partition',
      10: 'Move partition pointer right',
      13: 'Place pivot in its correct sorted position',
      15: 'If pivot right of target, recurse left',
      16: 'If pivot left of target, recurse right',
      17: 'Pivot at target: return answer',
      20: 'Start quickSelect on entire array',
    },
    java: {
      1: 'Define public method with nums and k',
      2: 'Convert kth largest to sorted index',
      3: 'Start quickSelect on entire array',
      5: 'Define recursive quickSelect helper',
      6: 'Choose rightmost element as pivot',
      7: 'Init partition pointer',
      8: 'Iterate and partition around pivot',
      9: 'If current element <= pivot',
      10: 'Store value for swap',
      11: 'Move smaller element to left partition',
      12: 'Complete the swap',
      13: 'Move partition pointer right',
      16: 'Place pivot at its correct position',
      17: 'Swap pivot to partition boundary',
      18: 'Complete the swap',
      20: 'If pivot right of target, recurse left',
      21: 'If pivot left of target, recurse right',
      22: 'Pivot at target: return answer',
    },
  },
};
