import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MedianInput {
  nums1: number[];
  nums2: number[];
}

function runMedianTwoSortedArrays(input: unknown): AlgorithmStep[] {
  const { nums1: inputNums1, nums2: inputNums2 } = input as MedianInput;
  const steps: AlgorithmStep[] = [];

  // Ensure A is the shorter array
  let A = [...inputNums1];
  let B = [...inputNums2];
  let swapped = false;

  steps.push({
    state: { nums1: [...A], nums2: [...B] },
    highlights: [],
    message: `Find median of nums1=[${A.join(', ')}] and nums2=[${B.join(', ')}]`,
    codeLine: 1,
  });

  if (A.length > B.length) {
    [A, B] = [B, A];
    swapped = true;
    steps.push({
      state: { nums1: [...A], nums2: [...B] },
      highlights: [],
      message: `Swap so A is shorter: A=[${A.join(', ')}], B=[${B.join(', ')}]`,
      codeLine: 3,
    });
  }

  const total = A.length + B.length;
  const half = Math.floor(total / 2);

  steps.push({
    state: { nums1: [...A], nums2: [...B], total, half },
    highlights: [],
    message: `Total elements: ${total}, half: ${half}. Binary search on A (length ${A.length})`,
    codeLine: 4,
  });

  let left = 0;
  let right = A.length;

  while (left <= right) {
    const i = Math.floor((left + right) / 2); // partition index for A
    const j = half - i; // partition index for B

    // Get boundary values (use -Infinity / Infinity for edges)
    const Aleft = i > 0 ? A[i - 1] : -Infinity;
    const Aright = i < A.length ? A[i] : Infinity;
    const Bleft = j > 0 ? B[j - 1] : -Infinity;
    const Bright = j < B.length ? B[j] : Infinity;

    // Show current partition
    const aHighlights: number[] = [];
    for (let k = 0; k < i; k++) aHighlights.push(k);

    const bHighlights: number[] = [];
    for (let k = 0; k < j; k++) bHighlights.push(k);

    steps.push({
      state: {
        nums1: [...A],
        nums2: [...B],
        partitionA: i,
        partitionB: j,
        Aleft: Aleft === -Infinity ? '-inf' : Aleft,
        Aright: Aright === Infinity ? '+inf' : Aright,
        Bleft: Bleft === -Infinity ? '-inf' : Bleft,
        Bright: Bright === Infinity ? '+inf' : Bright,
      },
      highlights: aHighlights,
      secondary: bHighlights,
      pointers: { i, j, left, right },
      message: `Partition: A[0..${i - 1}] | A[${i}..${A.length - 1}], B[0..${j - 1}] | B[${j}..${B.length - 1}]`,
      codeLine: 7,
      action: 'visit',
    });

    steps.push({
      state: {
        nums1: [...A],
        nums2: [...B],
        partitionA: i,
        partitionB: j,
        Aleft: Aleft === -Infinity ? '-inf' : Aleft,
        Aright: Aright === Infinity ? '+inf' : Aright,
        Bleft: Bleft === -Infinity ? '-inf' : Bleft,
        Bright: Bright === Infinity ? '+inf' : Bright,
      },
      highlights: aHighlights,
      secondary: bHighlights,
      pointers: { i, j },
      message: `Aleft=${Aleft === -Infinity ? '-inf' : Aleft}, Aright=${Aright === Infinity ? '+inf' : Aright}, Bleft=${Bleft === -Infinity ? '-inf' : Bleft}, Bright=${Bright === Infinity ? '+inf' : Bright}`,
      codeLine: 9,
      action: 'compare',
    });

    if (Aleft <= Bright && Bleft <= Aright) {
      // Correct partition found
      let median: number;
      if (total % 2 === 1) {
        median = Math.min(Aright as number, Bright as number);
        steps.push({
          state: {
            nums1: [...A],
            nums2: [...B],
            result: median,
            partitionA: i,
            partitionB: j,
          },
          highlights: [],
          message: `Valid partition found! Odd total: median = min(Aright, Bright) = min(${Aright}, ${Bright}) = ${median}`,
          codeLine: 11,
          action: 'found',
        });
      } else {
        median =
          (Math.max(Aleft as number, Bleft as number) +
            Math.min(Aright as number, Bright as number)) /
          2;
        steps.push({
          state: {
            nums1: [...A],
            nums2: [...B],
            result: median,
            partitionA: i,
            partitionB: j,
          },
          highlights: [],
          message: `Valid partition found! Even total: median = (max(${Aleft}, ${Bleft}) + min(${Aright}, ${Bright})) / 2 = ${median}`,
          codeLine: 13,
          action: 'found',
        });
      }

      if (swapped) {
        steps.push({
          state: {
            nums1: [...inputNums1],
            nums2: [...inputNums2],
            result: median,
          },
          highlights: [],
          message: `Median of [${inputNums1.join(', ')}] and [${inputNums2.join(', ')}] is ${median}`,
          codeLine: 14,
          action: 'found',
        });
      }

      return steps;
    } else if (Aleft > Bright) {
      // A's left partition too large, move left
      steps.push({
        state: {
          nums1: [...A],
          nums2: [...B],
          partitionA: i,
          partitionB: j,
        },
        highlights: [],
        pointers: { i, j, left, right },
        message: `Aleft(${Aleft}) > Bright(${Bright}) — A partition too far right, move left`,
        codeLine: 16,
        action: 'compare',
      });
      right = i - 1;
    } else {
      // A's left partition too small, move right
      steps.push({
        state: {
          nums1: [...A],
          nums2: [...B],
          partitionA: i,
          partitionB: j,
        },
        highlights: [],
        pointers: { i, j, left, right },
        message: `Bleft(${Bleft}) > Aright(${Aright}) — A partition too far left, move right`,
        codeLine: 18,
        action: 'compare',
      });
      left = i + 1;
    }
  }

  // Should not reach here for valid inputs
  steps.push({
    state: { nums1: [...inputNums1], nums2: [...inputNums2], result: 0 },
    highlights: [],
    message: `Error: no valid partition found`,
    codeLine: 19,
  });

  return steps;
}

export const medianTwoSortedArrays: Algorithm = {
  id: 'median-two-sorted-arrays',
  name: 'Median of Two Sorted Arrays',
  category: 'Binary Search',
  difficulty: 'Hard',
  timeComplexity: 'O(log(min(m,n)))',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — partition smaller array to find median cut',
  description:
    'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
  problemUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/',
  code: {
    python: `def findMedianSortedArrays(nums1, nums2):
    A, B = nums1, nums2
    total = len(A) + len(B)
    half = total // 2

    if len(A) > len(B):
        A, B = B, A

    left, right = 0, len(A)

    while left <= right:
        i = (left + right) // 2  # A
        j = half - i             # B

        Aleft = A[i - 1] if i > 0 else float("-inf")
        Aright = A[i] if i < len(A) else float("inf")
        Bleft = B[j - 1] if j > 0 else float("-inf")
        Bright = B[j] if j < len(B) else float("inf")

        if Aleft <= Bright and Bleft <= Aright:
            if total % 2:
                return min(Aright, Bright)
            return (max(Aleft, Bleft) + min(Aright, Bright)) / 2
        elif Aleft > Bright:
            right = i - 1
        else:
            left = i + 1`,
    javascript: `function findMedianSortedArrays(nums1, nums2) {
    let A = nums1, B = nums2;
    const total = A.length + B.length;
    const half = Math.floor(total / 2);

    if (A.length > B.length) {
        [A, B] = [B, A];
    }

    let left = 0, right = A.length;

    while (left <= right) {
        const i = Math.floor((left + right) / 2);
        const j = half - i;

        const Aleft = i > 0 ? A[i - 1] : -Infinity;
        const Aright = i < A.length ? A[i] : Infinity;
        const Bleft = j > 0 ? B[j - 1] : -Infinity;
        const Bright = j < B.length ? B[j] : Infinity;

        if (Aleft <= Bright && Bleft <= Aright) {
            if (total % 2 === 1) {
                return Math.min(Aright, Bright);
            }
            return (Math.max(Aleft, Bleft) +
                    Math.min(Aright, Bright)) / 2;
        } else if (Aleft > Bright) {
            right = i - 1;
        } else {
            left = i + 1;
        }
    }
}`,
    java: `public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
    int[] A = nums1, B = nums2;
    int total = A.length + B.length;
    int half = total / 2;

    if (A.length > B.length) {
        int[] temp = A;
        A = B;
        B = temp;
    }

    int left = 0, right = A.length;

    while (left <= right) {
        int i = left + (right - left) / 2;
        int j = half - i;

        int Aleft = i > 0 ? A[i - 1] : Integer.MIN_VALUE;
        int Aright = i < A.length ? A[i] : Integer.MAX_VALUE;
        int Bleft = j > 0 ? B[j - 1] : Integer.MIN_VALUE;
        int Bright = j < B.length ? B[j] : Integer.MAX_VALUE;

        if (Aleft <= Bright && Bleft <= Aright) {
            if (total % 2 == 1) {
                return Math.min(Aright, Bright);
            }
            return (Math.max(Aleft, Bleft) +
                    Math.min(Aright, Bright)) / 2.0;
        } else if (Aleft > Bright) {
            right = i - 1;
        } else {
            left = i + 1;
        }
    }
    return 0;
}`,
  },
  defaultInput: { nums1: [1, 3], nums2: [2] },
  run: runMedianTwoSortedArrays,
};
