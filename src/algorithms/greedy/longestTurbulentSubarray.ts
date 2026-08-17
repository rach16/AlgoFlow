import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLongestTurbulentSubarray(input: unknown): AlgorithmStep[] {
  const arr = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...arr], result: 1 },
    highlights: [],
    message: `A turbulent subarray zig-zags: >, <, >, < ... Track two run lengths — "up" ends on a rise, "down" ends on a drop. Each new comparison flips one into the other.`,
    codeLine: 2,
  });

  let up = 1;
  let down = 1;
  let result = 1;

  for (let i = 1; i < arr.length; i++) {
    let msg: string;
    let line: number;

    if (arr[i] > arr[i - 1]) {
      up = down + 1;
      down = 1;
      msg = `arr[${i}] = ${arr[i]} > ${arr[i - 1]} — a rise. A run ending on a rise extends whatever ended on a drop: up = down + 1 = ${up}. Reset down to 1.`;
      line = 6;
    } else if (arr[i] < arr[i - 1]) {
      down = up + 1;
      up = 1;
      msg = `arr[${i}] = ${arr[i]} < ${arr[i - 1]} — a drop. A run ending on a drop extends whatever ended on a rise: down = up + 1 = ${down}. Reset up to 1.`;
      line = 9;
    } else {
      up = 1;
      down = 1;
      msg = `arr[${i}] = ${arr[i]} equals ${arr[i - 1]} — flat kills the zig-zag. Both runs restart at 1.`;
      line = 12;
    }

    const best = Math.max(up, down);
    const improved = best > result;
    result = Math.max(result, best);

    const runLen = best;
    const hl: number[] = [];
    for (let j = i - runLen + 1; j <= i; j++) if (j >= 0) hl.push(j);

    steps.push({
      state: { nums: [...arr], result },
      highlights: hl,
      pointers: { i },
      message: `${msg} Longest so far = ${result}${improved ? ' (new best!)' : ''}.`,
      codeLine: line,
      action: improved ? 'insert' : 'compare',
    });
  }

  steps.push({
    state: { nums: [...arr], result },
    highlights: [],
    message: `Done in one pass — the longest turbulent subarray has length ${result}.`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

function runLongestTurbulentSubarrayWindow(input: unknown): AlgorithmStep[] {
  const arr = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = arr.length;
  const cmp = (a: number, b: number) => (a > b ? 1 : a < b ? -1 : 0);
  const sign = (c: number) => (c === 1 ? '>' : c === -1 ? '<' : '=');

  steps.push({
    state: { nums: [...arr], result: 1 },
    highlights: [],
    message: `Window framing: anchor the window's left end and slide the right end while consecutive comparison signs keep alternating. Close the window the moment two neighbouring signs fail to alternate.`,
    codeLine: 7,
  });

  let result = 1;
  let anchor = 0;

  for (let i = 1; i < n; i++) {
    const c = cmp(arr[i - 1], arr[i]);
    const hl: number[] = [];
    for (let j = anchor; j <= i; j++) hl.push(j);

    if (c === 0) {
      steps.push({
        state: { nums: [...arr], result },
        highlights: [i - 1, i],
        pointers: { anchor, i },
        message: `arr[${i - 1}] = arr[${i}] = ${arr[i]} — flat. No turbulence can span a tie, so re-anchor the window at ${i}.`,
        codeLine: 11,
        action: 'delete',
      });
      anchor = i;
      continue;
    }

    const nextC = i === n - 1 ? 0 : cmp(arr[i], arr[i + 1]);
    const breaks = i === n - 1 || c * nextC !== -1;

    if (breaks) {
      const len = i - anchor + 1;
      const improved = len > result;
      result = Math.max(result, len);
      steps.push({
        state: { nums: [...arr], result },
        highlights: hl,
        pointers: { anchor, i },
        message: `Sign at ${i} is '${sign(c)}'. ${i === n - 1 ? 'End of the array' : `Next sign is '${sign(nextC)}' — it does not alternate`}, so the window [${anchor}, ${i}] closes with length ${len}.${improved ? ` New best: ${result}.` : ` Best stays ${result}.`} Re-anchor at ${i}.`,
        codeLine: 13,
        action: improved ? 'found' : 'compare',
      });
      anchor = i;
    } else {
      steps.push({
        state: { nums: [...arr], result },
        highlights: hl,
        pointers: { anchor, i },
        message: `Sign at ${i} is '${sign(c)}' and the next is '${sign(nextC)}' — they alternate, so the window [${anchor}, ${i}] keeps growing. Best still ${result}.`,
        codeLine: 12,
        action: 'visit',
      });
    }
  }

  steps.push({
    state: { nums: [...arr], result },
    highlights: [],
    message: `Every window has been closed — the longest turbulent subarray has length ${result}, matching the up/down run method.`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const longestTurbulentSubarray: Algorithm = {
  id: 'longest-turbulent-subarray',
  name: 'Longest Turbulent Subarray',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — extend alternating up/down run lengths',
  description:
    'Given an integer array arr, return the length of the longest turbulent subarray — one where the comparison sign flips between every adjacent pair of elements.',
  problemUrl: 'https://leetcode.com/problems/longest-turbulent-subarray/',
  code: {
    python: `def maxTurbulenceSize(arr):
    up, down = 1, 1
    result = 1
    for i in range(1, len(arr)):
        if arr[i] > arr[i - 1]:
            up = down + 1
            down = 1
        elif arr[i] < arr[i - 1]:
            down = up + 1
            up = 1
        else:
            up = down = 1
        result = max(result, up, down)
    return result`,
    javascript: `function maxTurbulenceSize(arr) {
    let up = 1, down = 1, result = 1;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > arr[i - 1]) {
            up = down + 1;
            down = 1;
        } else if (arr[i] < arr[i - 1]) {
            down = up + 1;
            up = 1;
        } else {
            up = 1;
            down = 1;
        }
        result = Math.max(result, up, down);
    }
    return result;
}`,
    java: `public static int maxTurbulenceSize(int[] arr) {
    int up = 1, down = 1, result = 1;
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > arr[i - 1]) {
            up = down + 1;
            down = 1;
        } else if (arr[i] < arr[i - 1]) {
            down = up + 1;
            up = 1;
        } else {
            up = 1;
            down = 1;
        }
        result = Math.max(result, Math.max(up, down));
    }
    return result;
}`,
  },
  defaultInput: [9, 4, 2, 10, 7, 8, 8, 1, 9],
  run: runLongestTurbulentSubarray,
  optimalApproachName: 'Up/Down Run Lengths',
  approaches: [
    {
      id: 'sliding-window-signs',
      name: 'Sliding Window (Sign Tracking)',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of two run counters, hold an explicit window anchored on the left and close it whenever two adjacent comparison signs stop alternating.',
      code: {
        python: `def maxTurbulenceSize(arr):
    def cmp(a, b):
        return (a > b) - (a < b)

    n = len(arr)
    result = 1
    anchor = 0
    for i in range(1, n):
        c = cmp(arr[i - 1], arr[i])
        if c == 0:
            anchor = i
        elif i == n - 1 or c * cmp(arr[i], arr[i + 1]) != -1:
            result = max(result, i - anchor + 1)
            anchor = i
    return result`,
        javascript: `function maxTurbulenceSize(arr) {
    const cmp = (a, b) => (a > b ? 1 : a < b ? -1 : 0);
    const n = arr.length;
    let result = 1;
    let anchor = 0;
    for (let i = 1; i < n; i++) {
        const c = cmp(arr[i - 1], arr[i]);
        if (c === 0) {
            anchor = i;
        } else if (i === n - 1 || c * cmp(arr[i], arr[i + 1]) !== -1) {
            result = Math.max(result, i - anchor + 1);
            anchor = i;
        }
    }
    return result;
}`,
        java: `public static int maxTurbulenceSize(int[] arr) {
    int n = arr.length;
    int result = 1;
    int anchor = 0;
    for (int i = 1; i < n; i++) {
        int c = Integer.compare(arr[i - 1], arr[i]);
        if (c == 0) {
            anchor = i;
        } else if (i == n - 1 || c * Integer.compare(arr[i], arr[i + 1]) != -1) {
            result = Math.max(result, i - anchor + 1);
            anchor = i;
        }
    }
    return result;
}`,
      },
      run: runLongestTurbulentSubarrayWindow,
      lineExplanations: {
        python: {
          1: 'Define function taking arr',
          2: 'Three-way comparison helper',
          3: 'Returns 1, -1 or 0 for greater / less / equal',
          5: 'Length of the array',
          6: 'Longest turbulent window found so far',
          7: 'Left edge of the current window',
          8: 'Slide the right edge',
          9: 'Sign of the comparison between the last two elements',
          10: 'Equal neighbours break turbulence entirely',
          11: 'Restart the window here',
          12: 'End of array, or the next sign fails to alternate',
          13: 'Close the window and record its length',
          14: 'Start the next window at this index',
          15: 'Return the longest window length',
        },
        javascript: {
          1: 'Define function taking arr',
          2: 'Three-way comparison helper: 1, -1 or 0',
          3: 'Length of the array',
          4: 'Longest turbulent window found so far',
          5: 'Left edge of the current window',
          6: 'Slide the right edge',
          7: 'Sign of the comparison between the last two elements',
          8: 'Equal neighbours break turbulence entirely',
          9: 'Restart the window here',
          10: 'End of array, or the next sign fails to alternate',
          11: 'Close the window and record its length',
          12: 'Start the next window at this index',
          15: 'Return the longest window length',
        },
        java: {
          1: 'Define method taking arr',
          2: 'Length of the array',
          3: 'Longest turbulent window found so far',
          4: 'Left edge of the current window',
          5: 'Slide the right edge',
          6: 'Integer.compare gives the three-way sign',
          7: 'Equal neighbours break turbulence entirely',
          8: 'Restart the window here',
          9: 'End of array, or the next sign fails to alternate',
          10: 'Close the window and record its length',
          11: 'Start the next window at this index',
          14: 'Return the longest window length',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking arr',
      2: 'Length of the best run ending on a rise / on a drop',
      3: 'A single element is always turbulent',
      4: 'Compare every adjacent pair',
      5: 'This pair rises',
      6: 'A rise can extend any run that ended on a drop',
      7: 'The drop-run restarts',
      8: 'This pair drops',
      9: 'A drop can extend any run that ended on a rise',
      10: 'The rise-run restarts',
      11: 'The pair is flat',
      12: 'Flat breaks both runs',
      13: 'Record the longer of the two runs',
      14: 'Return the longest turbulent length',
    },
    javascript: {
      1: 'Define function taking arr',
      2: 'Run lengths ending on a rise / on a drop, and the best answer',
      3: 'Compare every adjacent pair',
      4: 'This pair rises',
      5: 'A rise can extend any run that ended on a drop',
      6: 'The drop-run restarts',
      7: 'This pair drops',
      8: 'A drop can extend any run that ended on a rise',
      9: 'The rise-run restarts',
      10: 'The pair is flat',
      11: 'Flat breaks the rise-run',
      12: 'Flat breaks the drop-run too',
      14: 'Record the longer of the two runs',
      16: 'Return the longest turbulent length',
    },
    java: {
      1: 'Define method taking arr',
      2: 'Run lengths ending on a rise / on a drop, and the best answer',
      3: 'Compare every adjacent pair',
      4: 'This pair rises',
      5: 'A rise can extend any run that ended on a drop',
      6: 'The drop-run restarts',
      7: 'This pair drops',
      8: 'A drop can extend any run that ended on a rise',
      9: 'The rise-run restarts',
      10: 'The pair is flat',
      11: 'Flat breaks the rise-run',
      12: 'Flat breaks the drop-run too',
      14: 'Record the longer of the two runs',
      16: 'Return the longest turbulent length',
    },
  },
};
