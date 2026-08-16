import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runDailyTemperatures(input: unknown): AlgorithmStep[] {
  const temperatures = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = temperatures.length;
  const result = new Array(n).fill(0);
  const stack: number[] = []; // stack of indices

  steps.push({
    state: { nums: [...temperatures], stack: [], result: [...result] },
    highlights: [],
    message: `Find days until warmer temperature for each day. Temperatures: [${temperatures.join(', ')}]`,
    codeLine: 1,
  });

  for (let i = 0; i < n; i++) {
    steps.push({
      state: { nums: [...temperatures], stack: [...stack], result: [...result] },
      highlights: [i],
      pointers: { i },
      message: `Day ${i}: temperature = ${temperatures[i]}. Check if it's warmer than days on stack.`,
      codeLine: 4,
      action: 'visit',
    });

    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevDay = stack.pop()!;
      result[prevDay] = i - prevDay;

      steps.push({
        state: { nums: [...temperatures], stack: [...stack], result: [...result] },
        highlights: [i, prevDay],
        pointers: { i, prevDay },
        message: `${temperatures[i]} > ${temperatures[prevDay]} (day ${prevDay}). Pop ${prevDay}. Days to wait: ${i} - ${prevDay} = ${i - prevDay}`,
        codeLine: 6,
        action: 'pop',
      });
    }

    stack.push(i);

    steps.push({
      state: { nums: [...temperatures], stack: [...stack], result: [...result] },
      highlights: [i],
      pointers: { i },
      message: `Push day ${i} (temp=${temperatures[i]}) onto stack. Stack: [${stack.join(', ')}]`,
      codeLine: 9,
      action: 'push',
    });
  }

  // Remaining indices on stack have result 0 (no warmer day)
  if (stack.length > 0) {
    steps.push({
      state: { nums: [...temperatures], stack: [...stack], result: [...result] },
      highlights: [...stack],
      message: `Days remaining on stack [${stack.join(', ')}] have no warmer future day (result = 0)`,
      codeLine: 11,
    });
  }

  steps.push({
    state: { nums: [...temperatures], stack: [], result: [...result] },
    highlights: [],
    message: `Done! Result: [${result.join(', ')}]`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runDailyTemperaturesJump(input: unknown): AlgorithmStep[] {
  const temperatures = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = temperatures.length;
  const result = new Array(n).fill(0);

  steps.push({
    state: { nums: [...temperatures], result: [...result] },
    highlights: [],
    message: `Sweep right-to-left with no stack: reuse already-computed answers to JUMP over days that can't be the next warmer day`,
    codeLine: 1,
  });

  for (let i = n - 2; i >= 0; i--) {
    steps.push({
      state: { nums: [...temperatures], result: [...result] },
      highlights: [i],
      pointers: { i },
      message: `Day ${i} (temp ${temperatures[i]}): days to its right already know their answers — use them as shortcuts`,
      codeLine: 5,
      action: 'visit',
    });

    let j = i + 1;
    while (j < n && temperatures[j] <= temperatures[i]) {
      if (result[j] === 0) {
        steps.push({
          state: { nums: [...temperatures], result: [...result] },
          highlights: [i],
          secondary: [j],
          pointers: { i, j },
          message: `Day ${j} (temp ${temperatures[j]}) is not warmer AND never sees a warmer day — so day ${i} won't either. result[${i}] stays 0`,
          codeLine: 9,
          action: 'compare',
        });
        j = n;
      } else {
        const next = j + result[j];
        steps.push({
          state: { nums: [...temperatures], result: [...result] },
          highlights: [i],
          secondary: [j],
          pointers: { i, j },
          message: `Day ${j} (temp ${temperatures[j]}) isn't warmer than ${temperatures[i]}, but its warmer day is ${result[j]} ahead — jump straight to day ${next}`,
          codeLine: 11,
          action: 'compare',
        });
        j = next;
      }
    }

    if (j < n) {
      result[i] = j - i;
      steps.push({
        state: { nums: [...temperatures], result: [...result] },
        highlights: [i, j],
        pointers: { i, j },
        message: `Day ${j} (temp ${temperatures[j]}) is warmer than ${temperatures[i]}! result[${i}] = ${j} - ${i} = ${j - i}`,
        codeLine: 13,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { nums: [...temperatures], result: [...result] },
    highlights: [],
    message: `Done! Result: [${result.join(', ')}] — computed in place with O(1) extra space`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const dailyTemperatures: Algorithm = {
  id: 'daily-temperatures',
  name: 'Daily Temperatures',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Monotonic Stack — decreasing temps, pop when warmer found',
  description:
    'Given an array of integers temperatures representing daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day with a warmer temperature, keep answer[i] == 0. Use a monotonic decreasing stack.',
  problemUrl: 'https://leetcode.com/problems/daily-temperatures/',
  code: {
    python: `def dailyTemperatures(temperatures):
    result = [0] * len(temperatures)
    stack = []  # indices

    for i, temp in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temp:
            prevDay = stack.pop()
            result[prevDay] = i - prevDay

        stack.append(i)

    return result`,
    javascript: `function dailyTemperatures(temperatures) {
    const result = new Array(temperatures.length).fill(0);
    const stack = []; // indices

    for (let i = 0; i < temperatures.length; i++) {
        while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
            const prevDay = stack.pop();
            result[prevDay] = i - prevDay;
        }

        stack.push(i);
    }

    return result;
}`,
    java: `public static int[] dailyTemperatures(int[] temperatures) {
    int[] result = new int[temperatures.length];
    Deque<Integer> stack = new ArrayDeque<>(); // indices

    for (int i = 0; i < temperatures.length; i++) {
        while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
            int prevDay = stack.pop();
            result[prevDay] = i - prevDay;
        }
        stack.push(i);
    }

    return result;
}`,
  },
  defaultInput: [73, 74, 75, 71, 69, 72, 76, 73],
  run: runDailyTemperatures,
  optimalApproachName: 'Monotonic Stack',
  approaches: [
    {
      id: 'reverse-jump',
      name: 'Reverse Iteration + Jumps',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Replaces the stack entirely: sweep right-to-left and use already-computed answers as shortcuts to jump over non-warmer days, using only the output array.',
      code: {
        python: `def dailyTemperatures(temperatures):
    n = len(temperatures)
    result = [0] * n

    for i in range(n - 2, -1, -1):
        j = i + 1
        while j < n and temperatures[j] <= temperatures[i]:
            if result[j] == 0:
                j = n
            else:
                j += result[j]
        if j < n:
            result[i] = j - i

    return result`,
        javascript: `function dailyTemperatures(temperatures) {
    const n = temperatures.length;
    const result = new Array(n).fill(0);

    for (let i = n - 2; i >= 0; i--) {
        let j = i + 1;
        while (j < n && temperatures[j] <= temperatures[i]) {
            j = result[j] === 0 ? n : j + result[j];
        }
        if (j < n) result[i] = j - i;
    }

    return result;
}`,
        java: `public static int[] dailyTemperatures(int[] temperatures) {
    int n = temperatures.length;
    int[] result = new int[n];

    for (int i = n - 2; i >= 0; i--) {
        int j = i + 1;
        while (j < n && temperatures[j] <= temperatures[i]) {
            j = result[j] == 0 ? n : j + result[j];
        }
        if (j < n) result[i] = j - i;
    }

    return result;
}`,
      },
      run: runDailyTemperaturesJump,
      lineExplanations: {
        python: {
          1: 'Define function taking temperatures list',
          2: 'Store the number of days',
          3: 'Result array doubles as our only data structure',
          5: 'Sweep right-to-left (last day is always 0)',
          6: 'Start scanning at the next day',
          7: "While day j isn't warmer than day i",
          8: 'Day j never sees a warmer day...',
          9: '...so day i cannot either — bail out',
          10: 'Day j has a known warmer day ahead',
          11: 'Jump over the whole block using its answer',
          12: 'Landed on a strictly warmer day?',
          13: 'Distance from i to that warmer day',
          15: 'Return result array of wait days',
        },
        javascript: {
          1: 'Define function taking temperatures array',
          2: 'Store the number of days',
          3: 'Result array doubles as our only data structure',
          5: 'Sweep right-to-left (last day is always 0)',
          6: 'Start scanning at the next day',
          7: "While day j isn't warmer than day i",
          8: 'No warmer day after j means none for i; otherwise jump by its answer',
          10: 'Landed on a warmer day — record the distance',
          13: 'Return result array of wait days',
        },
        java: {
          1: 'Define method taking temperatures array',
          2: 'Store the number of days',
          3: 'Result array doubles as our only data structure',
          5: 'Sweep right-to-left (last day is always 0)',
          6: 'Start scanning at the next day',
          7: "While day j isn't warmer than day i",
          8: 'No warmer day after j means none for i; otherwise jump by its answer',
          10: 'Landed on a warmer day — record the distance',
          13: 'Return result array of wait days',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking temperatures list',
      2: 'Initialize result array with zeros',
      3: 'Initialize stack to hold indices',
      5: 'Iterate with index and temperature value',
      6: 'While stack top has a cooler temperature',
      7: 'Pop the index of the cooler day',
      8: 'Set days to wait as index difference',
      10: 'Push current day index onto stack',
      12: 'Return result array of wait days',
    },
    javascript: {
      1: 'Define function taking temperatures array',
      2: 'Initialize result array with zeros',
      3: 'Initialize stack to hold indices',
      5: 'Iterate through each day index',
      6: 'While stack top has a cooler temperature',
      7: 'Pop the index of the cooler day',
      8: 'Set days to wait as index difference',
      11: 'Push current day index onto stack',
      14: 'Return result array of wait days',
    },
    java: {
      1: 'Define method taking temperatures array',
      2: 'Initialize result array with zeros',
      3: 'Initialize stack to hold indices',
      5: 'Iterate through each day index',
      6: 'While stack top has a cooler temperature',
      7: 'Pop the index of the cooler day',
      8: 'Set days to wait as index difference',
      10: 'Push current day index onto stack',
      13: 'Return result array of wait days',
    },
  },
};
