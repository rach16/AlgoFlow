import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface RotateArrayInput {
  nums: number[];
  k: number;
}

function runRotateArray(input: unknown): AlgorithmStep[] {
  const { nums: original, k: rawK } = input as RotateArrayInput;
  const nums = [...original];
  const n = nums.length;
  const k = rawK % n;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], k: rawK },
    highlights: [],
    message: `Rotate [${original.join(', ')}] right by k=${rawK}. The trick: reversing the whole array, then reversing each of the two pieces, lands every element exactly where a rotation would put it`,
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...nums], k },
    highlights: [],
    message: `n=${n}, and k %= n gives k=${k}. Rotating by n is a full cycle, so only the remainder matters${rawK >= n ? ` (k=${rawK} was reduced)` : ''}`,
    codeLine: 3,
  });

  const reverse = (left: number, right: number, label: string) => {
    steps.push({
      state: { nums: [...nums] },
      highlights: [],
      secondary: Array.from({ length: Math.max(0, right - left + 1) }, (_, t) => left + t),
      pointers: { left, right },
      message: `${label}: reverse(${left}, ${right})`,
      codeLine: 6,
    });

    while (left < right) {
      const a = nums[left];
      const b = nums[right];
      nums[left] = b;
      nums[right] = a;

      steps.push({
        state: { nums: [...nums] },
        highlights: [left, right],
        pointers: { left, right },
        message: `Swap positions ${left} and ${right}: ${a} ↔ ${b} → [${nums.join(', ')}]`,
        codeLine: 7,
        action: 'swap',
      });

      left++;
      right--;
    }
  };

  reverse(0, n - 1, `Pass 1 — reverse everything, which puts the last k=${k} elements at the front (but backwards)`);

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    message: `After the full reverse: [${nums.join(', ')}]. The right answer's two blocks are both present and in the right place — each is just reversed internally`,
    codeLine: 11,
  });

  reverse(0, k - 1, `Pass 2 — reverse the first k=${k} elements to un-reverse the block that wrapped around`);

  steps.push({
    state: { nums: [...nums] },
    highlights: [],
    secondary: Array.from({ length: k }, (_, t) => t),
    message: `Front block fixed: [${nums.slice(0, k).join(', ')}] — these are the original last ${k} elements, back in order`,
    codeLine: 12,
  });

  reverse(k, n - 1, `Pass 3 — reverse the remaining ${n - k} elements`);

  steps.push({
    state: { nums: [...nums], result: [...nums] },
    highlights: [],
    message: `Rotated: [${nums.join(', ')}]. Three linear reversals = O(n) time, and every swap was in place, so O(1) extra space`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

function runRotateArrayExtraSpace(input: unknown): AlgorithmStep[] {
  const { nums: original, k: rawK } = input as RotateArrayInput;
  const nums = [...original];
  const n = nums.length;
  const k = rawK % n;
  const result: number[] = new Array(n).fill(0);
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], k: rawK },
    highlights: [],
    message: `Instead of shuffling in place, compute each element's destination directly: after rotating right by k, the element at i belongs at (i + k) % n`,
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...nums], k },
    highlights: [],
    message: `n=${n}, k %= n → k=${k}. Allocate a fresh array of ${n} slots — this is the O(n) space the reversal trick avoids`,
    codeLine: 4,
  });

  for (let i = 0; i < n; i++) {
    const dest = (i + k) % n;
    result[dest] = nums[i];

    steps.push({
      state: { nums: [...nums] },
      highlights: [i],
      secondary: [dest],
      pointers: { i, dest },
      message: `nums[${i}]=${nums[i]} → result[(${i} + ${k}) % ${n}] = result[${dest}]${dest < i ? ' — the modulo wrapped it around to the front' : ''}`,
      codeLine: 7,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...result] },
    highlights: [],
    message: `Copy the finished array back into nums (the problem requires modifying it in place): [${result.join(', ')}]`,
    codeLine: 9,
  });

  steps.push({
    state: { nums: [...result], result: [...result] },
    highlights: [],
    message: `Rotated: [${result.join(', ')}] — same answer in O(n) time, but it costs O(n) extra memory instead of O(1)`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const rotateArray: Algorithm = {
  id: 'rotate-array',
  name: 'Rotate Array',
  category: 'Two Pointers',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — converge from both ends',
  description:
    'Given an integer array nums, rotate the array to the right by k steps, where k is non-negative. Do it in place with O(1) extra space.',
  problemUrl: 'https://leetcode.com/problems/rotate-array/',
  code: {
    python: `def rotate(nums, k):
    n = len(nums)
    k %= n

    def reverse(left, right):
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1

    reverse(0, n - 1)
    reverse(0, k - 1)
    reverse(k, n - 1)
    return nums`,
    javascript: `function rotate(nums, k) {
    const n = nums.length;
    k %= n;

    const reverse = (left, right) => {
        while (left < right) {
            [nums[left], nums[right]] = [nums[right], nums[left]];
            left++;
            right--;
        }
    };

    reverse(0, n - 1);
    reverse(0, k - 1);
    reverse(k, n - 1);
    return nums;
}`,
    java: `public static int[] rotate(int[] nums, int k) {
    int n = nums.length;
    k %= n;

    reverse(nums, 0, n - 1);
    reverse(nums, 0, k - 1);
    reverse(nums, k, n - 1);
    return nums;
}

private static void reverse(int[] nums, int left, int right) {
    while (left < right) {
        int temp = nums[left];
        nums[left] = nums[right];
        nums[right] = temp;
        left++;
        right--;
    }
}`,
  },
  defaultInput: { nums: [1, 2, 3, 4, 5, 6, 7], k: 3 },
  run: runRotateArray,
  optimalApproachName: 'Triple Reversal',
  approaches: [
    {
      id: 'extra-array-modulo',
      name: 'Extra Array (Modulo)',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Place each element straight into a new array at index (i + k) % n, then copy back — far easier to reason about, but it gives up the O(1) space the reversal trick achieves.',
      code: {
        python: `def rotate(nums, k):
    n = len(nums)
    k %= n
    result = [0] * n

    for i in range(n):
        result[(i + k) % n] = nums[i]

    nums[:] = result
    return nums`,
        javascript: `function rotate(nums, k) {
    const n = nums.length;
    k %= n;
    const result = new Array(n);

    for (let i = 0; i < n; i++) {
        result[(i + k) % n] = nums[i];
    }

    for (let i = 0; i < n; i++) nums[i] = result[i];
    return nums;
}`,
        java: `public static int[] rotate(int[] nums, int k) {
    int n = nums.length;
    k %= n;
    int[] result = new int[n];

    for (int i = 0; i < n; i++) {
        result[(i + k) % n] = nums[i];
    }

    System.arraycopy(result, 0, nums, 0, n);
    return nums;
}`,
      },
      run: runRotateArrayExtraSpace,
      lineExplanations: {
        python: {
          1: 'Define function taking the array and rotation count',
          2: 'Cache the length',
          3: 'k larger than n wraps around, so only the remainder matters',
          4: 'Allocate the destination array — the O(n) cost of this approach',
          6: 'Visit every original index once',
          7: 'Element at i belongs at (i + k) % n after a right rotation',
          9: 'Slice assignment copies the result back into nums in place',
          10: 'Return the rotated array',
        },
        javascript: {
          1: 'Define function taking the array and rotation count',
          2: 'Cache the length',
          3: 'k larger than n wraps around, so only the remainder matters',
          4: 'Allocate the destination array — the O(n) cost of this approach',
          6: 'Visit every original index once',
          7: 'Element at i belongs at (i + k) % n after a right rotation',
          10: 'Copy the result back into nums so the change is in place',
          11: 'Return the rotated array',
        },
        java: {
          1: 'Define function taking the array and rotation count',
          2: 'Cache the length',
          3: 'k larger than n wraps around, so only the remainder matters',
          4: 'Allocate the destination array — the O(n) cost of this approach',
          6: 'Visit every original index once',
          7: 'Element at i belongs at (i + k) % n after a right rotation',
          10: 'Copy the result back into nums so the change is in place',
          11: 'Return the rotated array',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the array and rotation count',
      2: 'Cache the length',
      3: 'Rotating by n is a no-op, so reduce k modulo n',
      5: 'Helper reverses the slice [left, right] in place',
      6: 'Classic two-pointer reversal loop',
      7: 'Swap the outer pair of the slice',
      8: 'Move the left pointer inward',
      9: 'Move the right pointer inward',
      11: 'Reverse everything — the last k elements are now in front, backwards',
      12: 'Un-reverse the first k elements',
      13: 'Un-reverse the remaining n - k elements',
      14: 'nums was mutated in place, so return it',
    },
    javascript: {
      1: 'Define function taking the array and rotation count',
      2: 'Cache the length',
      3: 'Rotating by n is a no-op, so reduce k modulo n',
      5: 'Helper reverses the slice [left, right] in place',
      6: 'Classic two-pointer reversal loop',
      7: 'Swap the outer pair via array destructuring',
      8: 'Move the left pointer inward',
      9: 'Move the right pointer inward',
      13: 'Reverse everything — the last k elements are now in front, backwards',
      14: 'Un-reverse the first k elements',
      15: 'Un-reverse the remaining n - k elements',
      16: 'nums was mutated in place, so return it',
    },
    java: {
      1: 'Define function taking the array and rotation count',
      2: 'Cache the length',
      3: 'Rotating by n is a no-op, so reduce k modulo n',
      5: 'Reverse everything — the last k elements are now in front, backwards',
      6: 'Un-reverse the first k elements',
      7: 'Un-reverse the remaining n - k elements',
      8: 'nums was mutated in place, so return it',
      11: 'Helper reverses the slice [left, right] in place',
      12: 'Classic two-pointer reversal loop',
      13: 'Stash the left value before overwriting it',
      14: 'Copy the right value into the left slot',
      15: 'Copy the stashed value into the right slot',
      16: 'Move the left pointer inward',
      17: 'Move the right pointer inward',
    },
  },
};
