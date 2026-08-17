import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MergeSortedArrayInput {
  nums1: number[];
  m: number;
  nums2: number[];
  n: number;
}

function runMergeSortedArray(input: unknown): AlgorithmStep[] {
  const { nums1: raw1, m, nums2, n } = input as MergeSortedArrayInput;
  const nums1 = [...raw1];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums1], nums2: [...nums2] },
    highlights: Array.from({ length: m }, (_, k) => k),
    message: `nums1 = [${nums1.join(', ')}] holds ${m} real values plus ${n} empty slots; nums2 = [${nums2.join(', ')}]. Merge in place`,
    codeLine: 1,
  });

  let i = m - 1;
  let j = n - 1;
  let k = m + n - 1;

  steps.push({
    state: { nums: [...nums1], nums2: [...nums2] },
    highlights: [k],
    secondary: i >= 0 ? [i] : [],
    pointers: { i, write: k },
    message: `Fill from the BACK: i=${i} (last real nums1 value), j=${j} (last nums2 value), write=${k} (last slot). Writing backwards means we never overwrite a value we still need`,
    codeLine: 4,
  });

  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      steps.push({
        state: { nums: [...nums1], nums2: [...nums2] },
        highlights: [i],
        secondary: [k],
        pointers: { i, write: k },
        message: `nums1[${i}] = ${nums1[i]} > nums2[${j}] = ${nums2[j]} — the bigger value goes into slot ${k}`,
        codeLine: 7,
        action: 'compare',
      });

      nums1[k] = nums1[i];
      steps.push({
        state: { nums: [...nums1], nums2: [...nums2] },
        highlights: [k],
        pointers: { i: i - 1, write: k },
        message: `Write ${nums1[i]} at index ${k}. Move i back to ${i - 1}`,
        codeLine: 8,
        action: 'insert',
      });
      i--;
    } else {
      steps.push({
        state: { nums: [...nums1], nums2: [...nums2] },
        highlights: [k],
        secondary: i >= 0 ? [i] : [],
        pointers: i >= 0 ? { i, write: k } : { write: k },
        message:
          i < 0
            ? `nums1 is exhausted (i = ${i}) — take nums2[${j}] = ${nums2[j]}`
            : `nums1[${i}] = ${nums1[i]} <= nums2[${j}] = ${nums2[j]} — nums2's value is the bigger one, it goes into slot ${k}`,
        codeLine: 7,
        action: 'compare',
      });

      nums1[k] = nums2[j];
      steps.push({
        state: { nums: [...nums1], nums2: [...nums2] },
        highlights: [k],
        pointers: i >= 0 ? { i, write: k } : { write: k },
        message: `Write ${nums2[j]} at index ${k}. Move j back to ${j - 1}`,
        codeLine: 11,
        action: 'insert',
      });
      j--;
    }
    k--;
  }

  steps.push({
    state: { nums: [...nums1], nums2: [...nums2], result: [...nums1] },
    highlights: [],
    message: `j fell below 0, so every nums2 value is placed — anything still in nums1[0..${k}] is already sorted and in the right spot. Merged: [${nums1.join(', ')}]`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

function runMergeSortedArrayCopy(input: unknown): AlgorithmStep[] {
  const { nums1: raw1, m, nums2, n } = input as MergeSortedArrayInput;
  const nums1 = [...raw1];
  const steps: AlgorithmStep[] = [];
  const merged: number[] = [];

  steps.push({
    state: { nums: [...nums1], result: [] },
    highlights: Array.from({ length: m }, (_, k) => k),
    message: `Forward merge into a scratch list, then copy back. nums1 has ${m} real values, nums2 = [${nums2.join(', ')}]`,
    codeLine: 2,
  });

  let i = 0;
  let j = 0;

  steps.push({
    state: { nums: [...nums1], result: [] },
    highlights: [0],
    pointers: { i },
    message: `Start both readers at the front: i=0 in nums1, j=0 in nums2`,
    codeLine: 3,
  });

  while (i < m && j < n) {
    if (nums1[i] <= nums2[j]) {
      merged.push(nums1[i]);
      steps.push({
        state: { nums: [...nums1], result: [...merged] },
        highlights: [i],
        pointers: { i },
        message: `nums1[${i}] = ${nums1[i]} <= nums2[${j}] = ${nums2[j]} — append ${nums1[i]}, advance i`,
        codeLine: 7,
        action: 'compare',
      });
      i++;
    } else {
      merged.push(nums2[j]);
      steps.push({
        state: { nums: [...nums1], result: [...merged] },
        highlights: i < m ? [i] : [],
        pointers: { i },
        message: `nums2[${j}] = ${nums2[j]} < nums1[${i}] = ${nums1[i]} — append ${nums2[j]}, advance j`,
        codeLine: 10,
        action: 'compare',
      });
      j++;
    }
  }

  while (i < m) {
    merged.push(nums1[i]);
    steps.push({
      state: { nums: [...nums1], result: [...merged] },
      highlights: [i],
      pointers: { i },
      message: `nums2 is drained — flush the rest of nums1: append ${nums1[i]}`,
      codeLine: 14,
      action: 'insert',
    });
    i++;
  }

  while (j < n) {
    merged.push(nums2[j]);
    steps.push({
      state: { nums: [...nums1], result: [...merged] },
      highlights: [],
      message: `nums1 is drained — flush the rest of nums2: append ${nums2[j]}`,
      codeLine: 17,
      action: 'insert',
    });
    j++;
  }

  for (let idx = 0; idx < m + n; idx++) {
    nums1[idx] = merged[idx];
    steps.push({
      state: { nums: [...nums1], result: [...merged] },
      highlights: [idx],
      pointers: { idx },
      message: `Copy back: nums1[${idx}] = ${merged[idx]}`,
      codeLine: 21,
      action: 'insert',
    });
  }

  steps.push({
    state: { nums: [...nums1], result: [...nums1] },
    highlights: [],
    message: `Merged: [${nums1.join(', ')}]. Easier to read, but it needs an O(m + n) scratch array — the back-to-front version needs none`,
    codeLine: 22,
    action: 'found',
  });

  return steps;
}

export const mergeSortedArray: Algorithm = {
  id: 'merge-sorted-array',
  name: 'Merge Sorted Array',
  category: 'Two Pointers',
  difficulty: 'Easy',
  timeComplexity: 'O(m + n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — fill from the back in place',
  description:
    'You are given two sorted integer arrays nums1 and nums2, where nums1 has a length of m + n with the last n slots set to 0 as placeholders. Merge nums2 into nums1 so that nums1 becomes a single sorted array, modifying it in place.',
  problemUrl: 'https://leetcode.com/problems/merge-sorted-array/',
  code: {
    python: `def merge(nums1, m, nums2, n):
    i = m - 1
    j = n - 1
    k = m + n - 1

    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1

    return nums1`,
    javascript: `function merge(nums1, m, nums2, n) {
    let i = m - 1;
    let j = n - 1;
    let k = m + n - 1;

    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) {
            nums1[k] = nums1[i];
            i--;
        } else {
            nums1[k] = nums2[j];
            j--;
        }
        k--;
    }

    return nums1;
}`,
    java: `public static int[] merge(int[] nums1, int m, int[] nums2, int n) {
    int i = m - 1;
    int j = n - 1;
    int k = m + n - 1;

    while (j >= 0) {
        if (i >= 0 && nums1[i] > nums2[j]) {
            nums1[k] = nums1[i];
            i--;
        } else {
            nums1[k] = nums2[j];
            j--;
        }
        k--;
    }

    return nums1;
}`,
  },
  defaultInput: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 },
  run: runMergeSortedArray,
  optimalApproachName: 'Backward Two Pointers',
  approaches: [
    {
      id: 'merge-into-copy',
      name: 'Merge Into Copy',
      timeComplexity: 'O(m + n)',
      spaceComplexity: 'O(m + n)',
      description:
        'Do the familiar forward merge into a scratch array and copy the result back — the same logic as merge sort, but it burns O(m + n) extra space that the backward in-place scan avoids.',
      code: {
        python: `def merge(nums1, m, nums2, n):
    merged = []
    i, j = 0, 0

    while i < m and j < n:
        if nums1[i] <= nums2[j]:
            merged.append(nums1[i])
            i += 1
        else:
            merged.append(nums2[j])
            j += 1

    while i < m:
        merged.append(nums1[i])
        i += 1
    while j < n:
        merged.append(nums2[j])
        j += 1

    for idx in range(m + n):
        nums1[idx] = merged[idx]
    return nums1`,
        javascript: `function merge(nums1, m, nums2, n) {
    const merged = [];
    let i = 0;
    let j = 0;

    while (i < m && j < n) {
        if (nums1[i] <= nums2[j]) {
            merged.push(nums1[i]);
            i++;
        } else {
            merged.push(nums2[j]);
            j++;
        }
    }

    while (i < m) merged.push(nums1[i++]);
    while (j < n) merged.push(nums2[j++]);

    for (let idx = 0; idx < m + n; idx++) {
        nums1[idx] = merged[idx];
    }
    return nums1;
}`,
        java: `public static int[] merge(int[] nums1, int m, int[] nums2, int n) {
    int[] merged = new int[m + n];
    int i = 0, j = 0, t = 0;

    while (i < m && j < n) {
        if (nums1[i] <= nums2[j]) {
            merged[t++] = nums1[i++];
        } else {
            merged[t++] = nums2[j++];
        }
    }

    while (i < m) merged[t++] = nums1[i++];
    while (j < n) merged[t++] = nums2[j++];

    for (int idx = 0; idx < m + n; idx++) {
        nums1[idx] = merged[idx];
    }
    return nums1;
}`,
      },
      run: runMergeSortedArrayCopy,
      lineExplanations: {
        python: {
          1: 'Define merge over both arrays and their real lengths',
          2: 'Scratch list that will hold the merged order',
          3: 'Read cursors start at the front of each array',
          5: 'While both arrays still have values',
          6: 'Which front value is smaller?',
          7: 'Take from nums1',
          8: 'Advance the nums1 cursor',
          9: 'Otherwise nums2 wins',
          10: 'Take from nums2',
          11: 'Advance the nums2 cursor',
          13: 'Leftovers in nums1',
          14: 'Append them (already sorted)',
          15: 'Advance',
          16: 'Leftovers in nums2',
          17: 'Append them',
          18: 'Advance',
          20: 'Copy the scratch list back over nums1',
          21: 'Slot by slot',
          22: 'nums1 now holds the merged array',
        },
        javascript: {
          1: 'Define merge over both arrays and their real lengths',
          2: 'Scratch array that will hold the merged order',
          3: 'Read cursor for nums1',
          4: 'Read cursor for nums2',
          6: 'While both arrays still have values',
          7: 'Which front value is smaller?',
          8: 'Take from nums1',
          9: 'Advance the nums1 cursor',
          11: 'Take from nums2',
          12: 'Advance the nums2 cursor',
          16: 'Flush any leftover nums1 values',
          17: 'Flush any leftover nums2 values',
          19: 'Copy the scratch array back over nums1',
          20: 'Slot by slot',
          22: 'nums1 now holds the merged array',
        },
        java: {
          1: 'Define merge over both arrays and their real lengths',
          2: 'Scratch array sized m + n',
          3: 'Read cursors plus a write cursor',
          5: 'While both arrays still have values',
          6: 'Which front value is smaller?',
          7: 'Take from nums1 and advance both cursors',
          9: 'Otherwise take from nums2',
          13: 'Flush any leftover nums1 values',
          14: 'Flush any leftover nums2 values',
          16: 'Copy the scratch array back over nums1',
          17: 'Slot by slot',
          19: 'nums1 now holds the merged array',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define merge over both arrays and their real lengths',
      2: 'i reads the last real value of nums1',
      3: 'j reads the last value of nums2',
      4: 'k writes into the last slot of nums1',
      6: 'Keep going until every nums2 value is placed',
      7: 'Does nums1 still have a value, and is it the bigger one?',
      8: 'Yes — copy it into the write slot',
      9: 'Step i back',
      10: 'Otherwise nums2 has the bigger value',
      11: 'Copy it into the write slot',
      12: 'Step j back',
      13: 'Move the write slot back one position',
      15: 'nums1 is now the merged sorted array',
    },
    javascript: {
      1: 'Define merge over both arrays and their real lengths',
      2: 'i reads the last real value of nums1',
      3: 'j reads the last value of nums2',
      4: 'k writes into the last slot of nums1',
      6: 'Keep going until every nums2 value is placed',
      7: 'Does nums1 still have a value, and is it the bigger one?',
      8: 'Yes — copy it into the write slot',
      9: 'Step i back',
      11: 'Otherwise copy nums2\'s value into the write slot',
      12: 'Step j back',
      14: 'Move the write slot back one position',
      17: 'nums1 is now the merged sorted array',
    },
    java: {
      1: 'Define merge over both arrays and their real lengths',
      2: 'i reads the last real value of nums1',
      3: 'j reads the last value of nums2',
      4: 'k writes into the last slot of nums1',
      6: 'Keep going until every nums2 value is placed',
      7: 'Does nums1 still have a value, and is it the bigger one?',
      8: 'Yes — copy it into the write slot',
      9: 'Step i back',
      11: 'Otherwise copy nums2\'s value into the write slot',
      12: 'Step j back',
      14: 'Move the write slot back one position',
      17: 'nums1 is now the merged sorted array',
    },
  },
};
