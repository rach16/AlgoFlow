import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface RemoveElementInput {
  nums: number[];
  val: number;
}

function runRemoveElement(input: unknown): AlgorithmStep[] {
  const { nums, val } = input as RemoveElementInput;
  const steps: AlgorithmStep[] = [];
  const arr = [...nums];

  steps.push({
    state: { nums: [...arr], hashMap: { val: String(val), k: '0' } },
    highlights: [],
    message: `Remove every ${val} in place. k is the write pointer (how many keepers we've placed); i scans the whole array.`,
    codeLine: 2,
  });

  let k = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== val) {
      arr[k] = arr[i];
      k++;
      steps.push({
        state: { nums: [...arr], hashMap: { val: String(val), k: String(k) } },
        highlights: [k - 1],
        secondary: [i],
        pointers: { k: k - 1, i },
        message: `nums[${i}] = ${arr[i]} ≠ ${val} — keep it: write it to index ${k - 1}, k becomes ${k}`,
        codeLine: 5,
        action: 'insert',
      });
    } else {
      steps.push({
        state: { nums: [...arr], hashMap: { val: String(val), k: String(k) } },
        highlights: [i],
        secondary: k > 0 ? [k - 1] : [],
        pointers: { i, k },
        message: `nums[${i}] = ${val} — this is the value to remove, skip it. k stays at ${k}.`,
        codeLine: 4,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: { nums: [...arr], hashMap: { val: String(val), k: String(k) }, result: k },
    highlights: Array.from({ length: k }, (_, i) => i),
    message: `Scan complete — the first ${k} slots hold every element that isn't ${val}. Return k = ${k}; whatever sits past index ${k - 1} doesn't matter.`,
    codeLine: 6,
    action: 'found',
  });

  return steps;
}

function runRemoveElementSwapWithEnd(input: unknown): AlgorithmStep[] {
  const { nums, val } = input as RemoveElementInput;
  const steps: AlgorithmStep[] = [];
  const arr = [...nums];

  steps.push({
    state: { nums: [...arr], hashMap: { val: String(val), n: String(arr.length) } },
    highlights: [],
    message: `Order doesn't matter, so when we hit a ${val} we can overwrite it with the last live element and shrink n — no shifting at all.`,
    codeLine: 2,
  });

  let i = 0;
  let n = arr.length;

  while (i < n) {
    if (arr[i] === val) {
      const moved = arr[n - 1];
      arr[i] = moved;
      n--;
      steps.push({
        state: { nums: [...arr], hashMap: { val: String(val), n: String(n) } },
        highlights: [i],
        secondary: [n],
        pointers: { i, n },
        message: `nums[${i}] = ${val} — overwrite it with the last live value ${moved} and shrink n to ${n}. Don't advance i: the moved value still needs checking.`,
        codeLine: 5,
        action: 'swap',
      });
    } else {
      steps.push({
        state: { nums: [...arr], hashMap: { val: String(val), n: String(n) } },
        highlights: [i],
        pointers: { i, n },
        message: `nums[${i}] = ${arr[i]} ≠ ${val} — it's a keeper, advance i.`,
        codeLine: 8,
        action: 'compare',
      });
      i++;
    }
  }

  steps.push({
    state: { nums: [...arr], hashMap: { val: String(val), n: String(n) }, result: n },
    highlights: Array.from({ length: n }, (_, idx) => idx),
    message: `i reached n — the first ${n} elements are all ≠ ${val}. Return ${n}. Fewer writes than the copy-forward version when ${val} is rare.`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const removeElement: Algorithm = {
  id: 'remove-element',
  name: 'Remove Element',
  category: 'Arrays & Hashing',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — read pointer scans, write pointer packs',
  description:
    'Given an integer array nums and an integer val, remove all occurrences of val in nums in-place. Return the number of elements k that are not equal to val; the first k elements of nums must hold them, and the rest can be anything.',
  problemUrl: 'https://leetcode.com/problems/remove-element/',
  code: {
    python: `def removeElement(nums, val):
    k = 0
    for i in range(len(nums)):
        if nums[i] != val:
            nums[k] = nums[i]
            k += 1
    return k`,
    javascript: `function removeElement(nums, val) {
    let k = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== val) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}`,
    java: `public static int removeElement(int[] nums, int val) {
    int k = 0;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] != val) {
            nums[k] = nums[i];
            k++;
        }
    }
    return k;
}`,
  },
  defaultInput: { nums: [0, 1, 2, 2, 3, 0, 4, 2], val: 2 },
  run: runRemoveElement,
  optimalApproachName: 'Two Pointers',
  approaches: [
    {
      id: 'swap-with-end',
      name: 'Swap With End',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Rather than copying every keeper forward, overwrite each removed element with the last live element and shrink the length — the same O(n) bound but far fewer writes when val is rare.',
      code: {
        python: `def removeElement(nums, val):
    i, n = 0, len(nums)
    while i < n:
        if nums[i] == val:
            nums[i] = nums[n - 1]
            n -= 1
        else:
            i += 1
    return n`,
        javascript: `function removeElement(nums, val) {
    let i = 0, n = nums.length;
    while (i < n) {
        if (nums[i] === val) {
            nums[i] = nums[n - 1];
            n--;
        } else {
            i++;
        }
    }
    return n;
}`,
        java: `public static int removeElement(int[] nums, int val) {
    int i = 0, n = nums.length;
    while (i < n) {
        if (nums[i] == val) {
            nums[i] = nums[n - 1];
            n--;
        } else {
            i++;
        }
    }
    return n;
}`,
      },
      run: runRemoveElementSwapWithEnd,
      lineExplanations: {
        python: {
          1: 'Define function taking nums and the value to remove',
          2: 'i scans forward; n is the current live length',
          3: 'Stop once i passes the shrinking boundary',
          4: 'Current element must go',
          5: 'Overwrite it with the last live element',
          6: 'Shrink the live length — note i does not advance',
          7: 'Element is a keeper',
          8: 'Move past it',
          9: 'n is the count of surviving elements',
        },
        javascript: {
          1: 'Define function taking nums and the value to remove',
          2: 'i scans forward; n is the current live length',
          3: 'Stop once i passes the shrinking boundary',
          4: 'Current element must go',
          5: 'Overwrite it with the last live element',
          6: 'Shrink the live length — note i does not advance',
          8: 'Element is a keeper, move past it',
          11: 'n is the count of surviving elements',
        },
        java: {
          1: 'Define function taking nums and the value to remove',
          2: 'i scans forward; n is the current live length',
          3: 'Stop once i passes the shrinking boundary',
          4: 'Current element must go',
          5: 'Overwrite it with the last live element',
          6: 'Shrink the live length — note i does not advance',
          8: 'Element is a keeper, move past it',
          11: 'n is the count of surviving elements',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums and the value to remove',
      2: 'k is the write pointer — how many keepers placed so far',
      3: 'i is the read pointer scanning every element',
      4: 'Only elements different from val survive',
      5: 'Pack the keeper into the next write slot',
      6: 'Advance the write pointer',
      7: 'k is the count of surviving elements',
    },
    javascript: {
      1: 'Define function taking nums and the value to remove',
      2: 'k is the write pointer — how many keepers placed so far',
      3: 'i is the read pointer scanning every element',
      4: 'Only elements different from val survive',
      5: 'Pack the keeper into the next write slot',
      6: 'Advance the write pointer',
      9: 'k is the count of surviving elements',
    },
    java: {
      1: 'Define function taking nums and the value to remove',
      2: 'k is the write pointer — how many keepers placed so far',
      3: 'i is the read pointer scanning every element',
      4: 'Only elements different from val survive',
      5: 'Pack the keeper into the next write slot',
      6: 'Advance the write pointer',
      9: 'k is the count of surviving elements',
    },
  },
};
