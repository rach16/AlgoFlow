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
  },
  defaultInput: { nums: [3, 2, 1, 5, 6, 4], k: 2 },
  run: runKthLargestElement,
};
