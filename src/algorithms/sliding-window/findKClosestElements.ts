import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface FindKClosestInput {
  arr: number[];
  k: number;
  x: number;
}

const span = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

function runFindKClosestElements(input: unknown): AlgorithmStep[] {
  const { arr, k, x } = input as FindKClosestInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...arr], result: [], x, k },
    highlights: [],
    message: `The answer is always k=${k} consecutive values, because arr is sorted. So the whole problem reduces to picking one window start — and there are only ${arr.length - k + 1} candidates.`,
    codeLine: 1,
  });

  let lo = 0;
  let hi = arr.length - k;

  steps.push({
    state: { nums: [...arr], result: [], x, k },
    highlights: span(lo, hi),
    pointers: { lo, hi },
    message: `Binary search the window start in [0, ${hi}]. Sliding the start right is better exactly when the value leaving on the left is farther from x=${x} than the value entering on the right — a monotone test, so binary search applies.`,
    codeLine: 2,
  });

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const leftDist = x - arr[mid];
    const rightDist = arr[mid + k] - x;

    steps.push({
      state: { nums: [...arr], result: [], x, k },
      highlights: span(mid, mid + k - 1),
      secondary: [mid + k],
      pointers: { lo, mid, hi },
      message: `Try start=${mid}: window [${arr.slice(mid, mid + k).join(', ')}]. Leaving arr[${mid}]=${arr[mid]} is ${leftDist} from x; entering arr[${mid + k}]=${arr[mid + k]} is ${rightDist} from x.`,
      codeLine: 6,
      action: 'compare',
    });

    if (leftDist > rightDist) {
      lo = mid + 1;
      steps.push({
        state: { nums: [...arr], result: [], x, k },
        highlights: span(lo, hi),
        pointers: { lo, hi },
        message: `${leftDist} > ${rightDist}, so swapping arr[${mid}] out for arr[${mid + k}] strictly improves the window. Every start ≤ ${mid} is beaten — search [${lo}, ${hi}].`,
        codeLine: 7,
        action: 'visit',
      });
    } else {
      hi = mid;
      steps.push({
        state: { nums: [...arr], result: [], x, k },
        highlights: span(lo, hi),
        pointers: { lo, hi },
        message: `${leftDist} ≤ ${rightDist}, so moving the start right would trade a closer value for a farther one. Start ${mid} stays in play — search [${lo}, ${hi}].`,
        codeLine: 9,
        action: 'visit',
      });
    }
  }

  const answer = arr.slice(lo, lo + k);
  steps.push({
    state: { nums: [...arr], result: answer, x, k },
    highlights: span(lo, lo + k - 1),
    pointers: { lo },
    message: `lo met hi at ${lo}. The k=${k} closest values to ${x} are [${answer.join(', ')}], already in sorted order. Only ${Math.ceil(Math.log2(arr.length - k + 1))} probes were needed — O(log(n-k)).`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runFindKClosestTwoPointers(input: unknown): AlgorithmStep[] {
  const { arr, k, x } = input as FindKClosestInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...arr], result: [], x, k },
    highlights: span(0, arr.length - 1),
    message: `Alternative: start with the whole array as the window and delete the worst element from one end at a time. The farthest-from-x value is always at one end or the other, since arr is sorted.`,
    codeLine: 1,
  });

  let lo = 0;
  let hi = arr.length - 1;

  steps.push({
    state: { nums: [...arr], result: [], x, k },
    highlights: span(lo, hi),
    pointers: { lo, hi },
    message: `lo=0, hi=${hi}. We must delete ${arr.length - k} values to get down to k=${k}.`,
    codeLine: 2,
  });

  while (hi - lo >= k) {
    const leftDist = x - arr[lo];
    const rightDist = arr[hi] - x;

    if (leftDist > rightDist) {
      steps.push({
        state: { nums: [...arr], result: [], x, k },
        highlights: span(lo + 1, hi),
        secondary: [lo],
        pointers: { lo, hi },
        message: `arr[${lo}]=${arr[lo]} is ${leftDist} away vs arr[${hi}]=${arr[hi]} at ${rightDist}. The left end is worse — drop it. Window is now ${hi - lo} wide.`,
        codeLine: 6,
        action: 'delete',
      });
      lo++;
    } else {
      steps.push({
        state: { nums: [...arr], result: [], x, k },
        highlights: span(lo, hi - 1),
        secondary: [hi],
        pointers: { lo, hi },
        message: `arr[${lo}]=${arr[lo]} is ${leftDist} away vs arr[${hi}]=${arr[hi]} at ${rightDist}. The right end is at least as bad, and ties go to the smaller value — drop the right. Window is now ${hi - lo} wide.`,
        codeLine: 8,
        action: 'delete',
      });
      hi--;
    }
  }

  const answer = arr.slice(lo, hi + 1);
  steps.push({
    state: { nums: [...arr], result: answer, x, k },
    highlights: span(lo, hi),
    pointers: { lo, hi },
    message: `Window shrank to exactly k=${k}: [${answer.join(', ')}] — same answer as the binary search, but this walks O(n-k) deletions instead of O(log(n-k)) probes.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const findKClosestElements: Algorithm = {
  id: 'find-k-closest-elements',
  name: 'Find K Closest Elements',
  category: 'Sliding Window',
  difficulty: 'Medium',
  timeComplexity: 'O(log(n - k) + k)',
  spaceComplexity: 'O(1)',
  pattern: 'Sliding Window — binary search the fixed-size window start',
  description:
    'Given a sorted integer array arr, two integers k and x, return the k closest integers to x in the array, sorted in ascending order. An integer a is closer to x than b if |a - x| < |b - x|, or if they tie and a < b.',
  problemUrl: 'https://leetcode.com/problems/find-k-closest-elements/',
  code: {
    python: `def findClosestElements(arr, k, x):
    lo, hi = 0, len(arr) - k

    while lo < hi:
        mid = (lo + hi) // 2
        if x - arr[mid] > arr[mid + k] - x:
            lo = mid + 1
        else:
            hi = mid

    return arr[lo:lo + k]`,
    javascript: `function findClosestElements(arr, k, x) {
    let lo = 0, hi = arr.length - k;

    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (x - arr[mid] > arr[mid + k] - x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    return arr.slice(lo, lo + k);
}`,
    java: `public static List<Integer> findClosestElements(int[] arr, int k, int x) {
    int lo = 0, hi = arr.length - k;

    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (x - arr[mid] > arr[mid + k] - x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }

    List<Integer> res = new ArrayList<>();
    for (int i = lo; i < lo + k; i++) {
        res.add(arr[i]);
    }
    return res;
}`,
  },
  defaultInput: { arr: [1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15], k: 4, x: 10 },
  run: runFindKClosestElements,
  optimalApproachName: 'Binary Search on Window Start',
  approaches: [
    {
      id: 'two-pointer-shrink',
      name: 'Two Pointers Shrink',
      timeComplexity: 'O(n - k)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of binary searching for the window start, begin with the entire array and repeatedly discard whichever end is farther from x until exactly k values remain — simpler to reason about, but linear in the number of discards.',
      code: {
        python: `def findClosestElements(arr, k, x):
    lo, hi = 0, len(arr) - 1

    while hi - lo >= k:
        if x - arr[lo] > arr[hi] - x:
            lo += 1
        else:
            hi -= 1

    return arr[lo:hi + 1]`,
        javascript: `function findClosestElements(arr, k, x) {
    let lo = 0, hi = arr.length - 1;

    while (hi - lo >= k) {
        if (x - arr[lo] > arr[hi] - x) {
            lo++;
        } else {
            hi--;
        }
    }

    return arr.slice(lo, hi + 1);
}`,
        java: `public static List<Integer> findClosestElements(int[] arr, int k, int x) {
    int lo = 0, hi = arr.length - 1;

    while (hi - lo >= k) {
        if (x - arr[lo] > arr[hi] - x) {
            lo++;
        } else {
            hi--;
        }
    }

    List<Integer> res = new ArrayList<>();
    for (int i = lo; i <= hi; i++) {
        res.add(arr[i]);
    }
    return res;
}`,
      },
      run: runFindKClosestTwoPointers,
      lineExplanations: {
        python: {
          1: 'Sorted array arr, count k, and the reference value x',
          2: 'Start with the window spanning the entire array',
          4: 'Keep going while the window holds more than k values',
          5: 'Which end is farther from x? (ties favor keeping the left)',
          6: 'Left end is worse — discard it',
          8: 'Otherwise discard the right end',
          10: 'Exactly k values remain, already sorted',
        },
        javascript: {
          1: 'Sorted array arr, count k, and the reference value x',
          2: 'Start with the window spanning the entire array',
          4: 'Keep going while the window holds more than k values',
          5: 'Which end is farther from x? (ties favor keeping the left)',
          6: 'Left end is worse — discard it',
          8: 'Otherwise discard the right end',
          12: 'Exactly k values remain, already sorted',
        },
        java: {
          1: 'Sorted array arr, count k, and the reference value x',
          2: 'Start with the window spanning the entire array',
          4: 'Keep going while the window holds more than k values',
          5: 'Which end is farther from x? (ties favor keeping the left)',
          6: 'Left end is worse — discard it',
          8: 'Otherwise discard the right end',
          12: 'Copy the surviving k values into the result list',
          16: 'Return them in ascending order',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Sorted array arr, count k, and the reference value x',
      2: 'Search space of window starts: 0 through len(arr) - k',
      4: 'Narrow until a single start survives',
      5: 'Midpoint candidate start',
      6: 'Is the value leaving on the left farther than the one entering on the right?',
      7: 'Yes — sliding right helps, so discard starts up to mid',
      9: 'No — mid is still a viable start, keep the left half',
      11: 'Return the k consecutive values beginning at lo',
    },
    javascript: {
      1: 'Sorted array arr, count k, and the reference value x',
      2: 'Search space of window starts: 0 through arr.length - k',
      4: 'Narrow until a single start survives',
      5: 'Midpoint candidate start',
      6: 'Is the value leaving on the left farther than the one entering on the right?',
      7: 'Yes — sliding right helps, so discard starts up to mid',
      9: 'No — mid is still a viable start, keep the left half',
      13: 'Return the k consecutive values beginning at lo',
    },
    java: {
      1: 'Sorted array arr, count k, and the reference value x',
      2: 'Search space of window starts: 0 through arr.length - k',
      4: 'Narrow until a single start survives',
      5: 'Midpoint candidate start',
      6: 'Is the value leaving on the left farther than the one entering on the right?',
      7: 'Yes — sliding right helps, so discard starts up to mid',
      9: 'No — mid is still a viable start, keep the left half',
      13: 'Collect the k consecutive values beginning at lo',
      17: 'Return them in ascending order',
    },
  },
};
