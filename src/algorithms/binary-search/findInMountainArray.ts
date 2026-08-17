import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MountainInput {
  arr: number[];
  target: number;
}

function runFindInMountainArray(input: unknown): AlgorithmStep[] {
  const { arr, target } = input as MountainInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { arr: [...arr], nums: [...arr], target },
    highlights: [],
    message: `Mountain array [${arr.join(', ')}] — it rises then falls. Find the SMALLEST index holding ${target}. Plan: binary search the peak, then binary search each slope.`,
    codeLine: 1,
  });

  // Phase 1: find the peak
  let left = 0;
  let right = arr.length - 1;

  steps.push({
    state: { arr: [...arr], nums: [...arr], target, left, right },
    highlights: Array.from({ length: arr.length }, (_, i) => i),
    pointers: { left, right },
    message: `Phase 1 — locate the peak. left=${left}, right=${right}.`,
    codeLine: 2,
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] < arr[mid + 1]) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, left: mid + 1, right, mid },
        highlights: [mid, mid + 1],
        secondary: [mid],
        pointers: { left, mid, right },
        message: `arr[${mid}]=${arr[mid]} < arr[${mid + 1}]=${arr[mid + 1]} — still climbing, so the peak is to the right. left = ${mid + 1}.`,
        codeLine: 5,
        action: 'compare',
      });
      left = mid + 1;
    } else {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, left, right: mid, mid },
        highlights: [mid, mid + 1],
        secondary: [mid],
        pointers: { left, mid, right },
        message: `arr[${mid}]=${arr[mid]} > arr[${mid + 1}]=${arr[mid + 1]} — already descending, so the peak is at ${mid} or left of it. right = ${mid}.`,
        codeLine: 7,
        action: 'compare',
      });
      right = mid;
    }
  }

  const peak = left;

  steps.push({
    state: { arr: [...arr], nums: [...arr], target, peak },
    highlights: [peak],
    pointers: { peak },
    message: `Peak found at index ${peak} (value ${arr[peak]}). Indices 0..${peak} are increasing; ${peak}..${arr.length - 1} are decreasing.`,
    codeLine: 9,
    action: 'found',
  });

  // Phase 2: binary search the increasing half
  left = 0;
  right = peak;

  steps.push({
    state: { arr: [...arr], nums: [...arr], target, peak, left, right },
    highlights: Array.from({ length: peak + 1 }, (_, i) => i),
    pointers: { left, right },
    message: `Phase 2 — ordinary ascending binary search on [0..${peak}]. Searching this half first guarantees the smallest index.`,
    codeLine: 11,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, result: mid },
        highlights: [mid],
        pointers: { mid },
        message: `arr[${mid}] = ${target} on the way up — that is the smallest index possible. Return ${mid}.`,
        codeLine: 15,
        action: 'found',
      });
      return steps;
    } else if (arr[mid] < target) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, left: mid + 1, right, mid },
        highlights: [mid],
        pointers: { left, mid, right },
        message: `arr[${mid}]=${arr[mid]} < ${target} and this half ascends — go right. left = ${mid + 1}.`,
        codeLine: 17,
        action: 'compare',
      });
      left = mid + 1;
    } else {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, left, right: mid - 1, mid },
        highlights: [mid],
        pointers: { left, mid, right },
        message: `arr[${mid}]=${arr[mid]} > ${target} — go left. right = ${mid - 1}.`,
        codeLine: 19,
        action: 'compare',
      });
      right = mid - 1;
    }
  }

  // Phase 3: binary search the decreasing half (comparisons flipped)
  left = peak + 1;
  right = arr.length - 1;

  steps.push({
    state: { arr: [...arr], nums: [...arr], target, peak, left, right },
    highlights: Array.from({ length: arr.length - peak - 1 }, (_, i) => peak + 1 + i),
    pointers: { left, right },
    message: `Not on the ascent. Phase 3 — binary search [${left}..${right}], but the slope descends so the comparisons flip.`,
    codeLine: 21,
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, result: mid },
        highlights: [mid],
        pointers: { mid },
        message: `arr[${mid}] = ${target} on the descent. Return ${mid}.`,
        codeLine: 25,
        action: 'found',
      });
      return steps;
    } else if (arr[mid] > target) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, left: mid + 1, right, mid },
        highlights: [mid],
        pointers: { left, mid, right },
        message: `arr[${mid}]=${arr[mid]} > ${target} — values SHRINK to the right here, so go right. left = ${mid + 1}.`,
        codeLine: 27,
        action: 'compare',
      });
      left = mid + 1;
    } else {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, left, right: mid - 1, mid },
        highlights: [mid],
        pointers: { left, mid, right },
        message: `arr[${mid}]=${arr[mid]} < ${target} — larger values are to the left. right = ${mid - 1}.`,
        codeLine: 29,
        action: 'compare',
      });
      right = mid - 1;
    }
  }

  steps.push({
    state: { arr: [...arr], nums: [...arr], target, result: -1 },
    highlights: [],
    message: `${target} is on neither slope — return -1. Total cost: three binary searches, O(log n).`,
    codeLine: 31,
    action: 'found',
  });

  return steps;
}

function runFindInMountainArrayScan(input: unknown): AlgorithmStep[] {
  const { arr, target } = input as MountainInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { arr: [...arr], nums: [...arr], target },
    highlights: [],
    message: `Single-pass version: walk up the mountain to find the peak, then scan each slope in value order and stop as soon as values pass ${target}.`,
    codeLine: 1,
  });

  let peak = 0;
  while (arr[peak] < arr[peak + 1]) {
    steps.push({
      state: { arr: [...arr], nums: [...arr], target, peak: peak + 1 },
      highlights: [peak, peak + 1],
      pointers: { peak },
      message: `arr[${peak}]=${arr[peak]} < arr[${peak + 1}]=${arr[peak + 1]} — still rising, step forward.`,
      codeLine: 3,
      action: 'visit',
    });
    peak++;
  }

  steps.push({
    state: { arr: [...arr], nums: [...arr], target, peak },
    highlights: [peak],
    pointers: { peak },
    message: `Walked to the peak at index ${peak} (value ${arr[peak]}) — that walk alone already cost O(n), which is what binary search avoids.`,
    codeLine: 4,
    action: 'found',
  });

  for (let i = 0; i <= peak; i++) {
    if (arr[i] === target) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, result: i },
        highlights: [i],
        pointers: { i },
        message: `arr[${i}] = ${target} on the ascent — smallest index wins. Return ${i}.`,
        codeLine: 8,
        action: 'found',
      });
      return steps;
    }
    if (arr[i] > target) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, i },
        highlights: [i],
        pointers: { i },
        message: `arr[${i}]=${arr[i]} > ${target} — the ascent only grows from here, so ${target} cannot be on it. Stop.`,
        codeLine: 10,
        action: 'compare',
      });
      break;
    }
    steps.push({
      state: { arr: [...arr], nums: [...arr], target, peak, i },
      highlights: [i],
      pointers: { i },
      message: `arr[${i}]=${arr[i]} != ${target} and still below it — keep climbing.`,
      codeLine: 7,
      action: 'compare',
    });
  }

  for (let i = arr.length - 1; i > peak; i--) {
    if (arr[i] === target) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, result: i },
        highlights: [i],
        pointers: { i },
        message: `arr[${i}] = ${target} on the descent. Return ${i}.`,
        codeLine: 14,
        action: 'found',
      });
      return steps;
    }
    if (arr[i] > target) {
      steps.push({
        state: { arr: [...arr], nums: [...arr], target, peak, i },
        highlights: [i],
        pointers: { i },
        message: `arr[${i}]=${arr[i]} > ${target} — walking leftward only increases values, so stop.`,
        codeLine: 16,
        action: 'compare',
      });
      break;
    }
    steps.push({
      state: { arr: [...arr], nums: [...arr], target, peak, i },
      highlights: [i],
      pointers: { i },
      message: `arr[${i}]=${arr[i]} != ${target} — keep walking back up the far side.`,
      codeLine: 13,
      action: 'compare',
    });
  }

  steps.push({
    state: { arr: [...arr], nums: [...arr], target, result: -1 },
    highlights: [],
    message: `${target} is on neither slope — return -1. Simple, but O(n) reads versus O(log n) for the binary-search version.`,
    codeLine: 18,
    action: 'found',
  });

  return steps;
}

export const findInMountainArray: Algorithm = {
  id: 'find-in-mountain-array',
  name: 'Find in Mountain Array',
  category: 'Binary Search',
  difficulty: 'Hard',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — find the peak, then search each monotonic slope',
  description:
    'A mountain array strictly increases to a peak and then strictly decreases. Given such an array and a target, return the minimum index whose value equals the target, or -1 if it does not exist.',
  problemUrl: 'https://leetcode.com/problems/find-in-mountain-array/',
  code: {
    python: `def findInMountainArray(target, arr):
    left, right = 0, len(arr) - 1
    while left < right:
        mid = (left + right) // 2
        if arr[mid] < arr[mid + 1]:
            left = mid + 1
        else:
            right = mid
    peak = left

    left, right = 0, peak
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    left, right = peak + 1, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] > target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,
    javascript: `function findInMountainArray(target, arr) {
    let left = 0;
    let right = arr.length - 1;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] < arr[mid + 1]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    const peak = left;

    left = 0;
    right = peak;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    left = peak + 1;
    right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] > target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
    java: `public static int findInMountainArray(int target, int[] arr) {
    int left = 0;
    int right = arr.length - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] < arr[mid + 1]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    int peak = left;

    left = 0;
    right = peak;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    left = peak + 1;
    right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] > target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1;
}`,
  },
  defaultInput: { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 3, 2, 1], target: 3 },
  run: runFindInMountainArray,
  optimalApproachName: 'Peak Search + Two Binary Searches',
  approaches: [
    {
      id: 'linear-peak-scan',
      name: 'Linear Peak + Ordered Scan',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Walk up the mountain to find the peak, then scan each slope in increasing value order and stop early once values exceed the target — no binary search, so O(n) reads instead of O(log n).',
      code: {
        python: `def findInMountainArray(target, arr):
    peak = 0
    while arr[peak] < arr[peak + 1]:
        peak += 1

    for i in range(peak + 1):
        if arr[i] == target:
            return i
        if arr[i] > target:
            break

    for i in range(len(arr) - 1, peak, -1):
        if arr[i] == target:
            return i
        if arr[i] > target:
            break

    return -1`,
        javascript: `function findInMountainArray(target, arr) {
    let peak = 0;
    while (arr[peak] < arr[peak + 1]) {
        peak++;
    }

    for (let i = 0; i <= peak; i++) {
        if (arr[i] === target) {
            return i;
        }
        if (arr[i] > target) {
            break;
        }
    }

    for (let i = arr.length - 1; i > peak; i--) {
        if (arr[i] === target) {
            return i;
        }
        if (arr[i] > target) {
            break;
        }
    }

    return -1;
}`,
        java: `public static int findInMountainArray(int target, int[] arr) {
    int peak = 0;
    while (arr[peak] < arr[peak + 1]) {
        peak++;
    }

    for (int i = 0; i <= peak; i++) {
        if (arr[i] == target) {
            return i;
        }
        if (arr[i] > target) {
            break;
        }
    }

    for (int i = arr.length - 1; i > peak; i--) {
        if (arr[i] == target) {
            return i;
        }
        if (arr[i] > target) {
            break;
        }
    }

    return -1;
}`,
      },
      run: runFindInMountainArrayScan,
      lineExplanations: {
        python: {
          1: 'Define function taking the target and the mountain array',
          2: 'Start the climb at index 0',
          3: 'Keep stepping while the next value is larger',
          4: 'Advance one index up the slope',
          6: 'Scan the ascending side from the bottom',
          7: 'Is this the target? The ascent gives the smallest index first',
          8: 'Return that index',
          9: 'Values only grow from here, so the target cannot appear later',
          10: 'Stop scanning the ascent',
          12: 'Scan the descending side from the far end (its smallest values)',
          13: 'Is this the target?',
          14: 'Return that index',
          15: 'Values only grow walking leftward, so stop',
          16: 'Stop scanning the descent',
          18: 'Target on neither slope — return -1',
        },
        javascript: {
          1: 'Define function taking the target and the mountain array',
          2: 'Start the climb at index 0',
          3: 'Keep stepping while the next value is larger',
          4: 'Advance one index up the slope',
          7: 'Scan the ascending side from the bottom',
          8: 'Is this the target? The ascent gives the smallest index first',
          9: 'Return that index',
          11: 'Values only grow from here, so the target cannot appear later',
          12: 'Stop scanning the ascent',
          16: 'Scan the descending side from the far end (its smallest values)',
          17: 'Is this the target?',
          18: 'Return that index',
          20: 'Values only grow walking leftward, so stop',
          21: 'Stop scanning the descent',
          25: 'Target on neither slope — return -1',
        },
        java: {
          1: 'Define method taking the target and the mountain array',
          2: 'Start the climb at index 0',
          3: 'Keep stepping while the next value is larger',
          4: 'Advance one index up the slope',
          7: 'Scan the ascending side from the bottom',
          8: 'Is this the target? The ascent gives the smallest index first',
          9: 'Return that index',
          11: 'Values only grow from here, so the target cannot appear later',
          12: 'Stop scanning the ascent',
          16: 'Scan the descending side from the far end (its smallest values)',
          17: 'Is this the target?',
          18: 'Return that index',
          20: 'Values only grow walking leftward, so stop',
          21: 'Stop scanning the descent',
          25: 'Target on neither slope — return -1',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the target and the mountain array',
      2: 'Phase 1: search the whole array for the peak',
      3: 'Shrink until left and right meet on the peak',
      4: 'Midpoint of the current window',
      5: 'Still climbing at mid?',
      6: 'Peak must be to the right of mid',
      7: 'Otherwise we are already descending',
      8: 'Peak is mid or to its left — keep mid',
      9: 'left == right is the peak index',
      11: 'Phase 2: ascending half [0..peak]',
      12: 'Standard binary search loop',
      13: 'Midpoint of the ascending window',
      14: 'Direct hit?',
      15: 'Return it — the ascent yields the smallest valid index',
      16: 'Value too small on an increasing slope',
      17: 'Move right',
      18: 'Value too large',
      19: 'Move left',
      21: 'Phase 3: descending half [peak+1..n-1]',
      22: 'Binary search again',
      23: 'Midpoint of the descending window',
      24: 'Direct hit?',
      25: 'Return that index',
      26: 'On a decreasing slope, too-large means go RIGHT (comparisons flip)',
      27: 'Move right',
      28: 'Value below the target',
      29: 'Move left toward bigger values',
      31: 'Not on either slope — return -1',
    },
    javascript: {
      1: 'Define function taking the target and the mountain array',
      2: 'Left bound for the peak search',
      3: 'Right bound for the peak search',
      4: 'Shrink until left and right meet on the peak',
      5: 'Midpoint of the current window',
      6: 'Still climbing at mid?',
      7: 'Peak must be to the right of mid',
      9: 'Peak is mid or to its left — keep mid',
      12: 'left == right is the peak index',
      14: 'Phase 2: ascending half starts at 0',
      15: 'and ends at the peak',
      16: 'Standard binary search loop',
      17: 'Midpoint of the ascending window',
      18: 'Direct hit?',
      19: 'Return it — the ascent yields the smallest valid index',
      20: 'Value too small on an increasing slope — move right',
      21: 'Advance the left bound',
      23: 'Value too large — move left',
      27: 'Phase 3: descending half starts after the peak',
      28: 'and ends at the last index',
      29: 'Binary search again',
      30: 'Midpoint of the descending window',
      31: 'Direct hit?',
      32: 'Return that index',
      33: 'On a decreasing slope, too-large means go RIGHT',
      34: 'Advance the left bound',
      36: 'Value below the target — move left toward bigger values',
      40: 'Not on either slope — return -1',
    },
    java: {
      1: 'Define method taking the target and the mountain array',
      2: 'Left bound for the peak search',
      3: 'Right bound for the peak search',
      4: 'Shrink until left and right meet on the peak',
      5: 'Midpoint computed without overflow',
      6: 'Still climbing at mid?',
      7: 'Peak must be to the right of mid',
      9: 'Peak is mid or to its left — keep mid',
      12: 'left == right is the peak index',
      14: 'Phase 2: ascending half starts at 0',
      15: 'and ends at the peak',
      16: 'Standard binary search loop',
      17: 'Midpoint of the ascending window',
      18: 'Direct hit?',
      19: 'Return it — the ascent yields the smallest valid index',
      20: 'Value too small on an increasing slope — move right',
      21: 'Advance the left bound',
      23: 'Value too large — move left',
      27: 'Phase 3: descending half starts after the peak',
      28: 'and ends at the last index',
      29: 'Binary search again',
      30: 'Midpoint of the descending window',
      31: 'Direct hit?',
      32: 'Return that index',
      33: 'On a decreasing slope, too-large means go RIGHT',
      34: 'Advance the left bound',
      36: 'Value below the target — move left toward bigger values',
      40: 'Not on either slope — return -1',
    },
  },
};
