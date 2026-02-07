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
};
