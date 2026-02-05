import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLargestRectHistogram(input: unknown): AlgorithmStep[] {
  const heights = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = heights.length;
  const stack: [number, number][] = []; // [index, height]
  let maxArea = 0;

  steps.push({
    state: { nums: [...heights], stack: [], maxArea: 0 },
    highlights: [],
    message: `Find largest rectangle in histogram: [${heights.join(', ')}]`,
    codeLine: 1,
  });

  for (let i = 0; i < n; i++) {
    let start = i;

    steps.push({
      state: {
        nums: [...heights],
        stack: stack.map(([idx, h]) => `i=${idx},h=${h}`),
        maxArea,
      },
      highlights: [i],
      pointers: { i },
      message: `Bar ${i}: height = ${heights[i]}. Check stack for taller bars.`,
      codeLine: 4,
      action: 'visit',
    });

    while (stack.length > 0 && stack[stack.length - 1][1] > heights[i]) {
      const [stackIdx, stackHeight] = stack.pop()!;
      const width = i - stackIdx;
      const area = stackHeight * width;

      if (area > maxArea) {
        maxArea = area;
      }

      steps.push({
        state: {
          nums: [...heights],
          stack: stack.map(([idx, h]) => `i=${idx},h=${h}`),
          maxArea,
        },
        highlights: Array.from({ length: width }, (_, k) => stackIdx + k),
        pointers: { i, poppedIdx: stackIdx },
        message: `Pop (i=${stackIdx}, h=${stackHeight}). Width: ${i} - ${stackIdx} = ${width}. Area: ${stackHeight} * ${width} = ${area}. Max area: ${maxArea}`,
        codeLine: 6,
        action: 'pop',
      });

      start = stackIdx;
    }

    stack.push([start, heights[i]]);

    steps.push({
      state: {
        nums: [...heights],
        stack: stack.map(([idx, h]) => `i=${idx},h=${h}`),
        maxArea,
      },
      highlights: [i],
      pointers: { i },
      message: `Push (i=${start}, h=${heights[i]}) onto stack. Stack size: ${stack.length}`,
      codeLine: 10,
      action: 'push',
    });
  }

  // Process remaining bars in stack
  if (stack.length > 0) {
    steps.push({
      state: {
        nums: [...heights],
        stack: stack.map(([idx, h]) => `i=${idx},h=${h}`),
        maxArea,
      },
      highlights: [],
      message: `Process remaining ${stack.length} bars in stack (extend to end of histogram)`,
      codeLine: 12,
    });
  }

  while (stack.length > 0) {
    const [stackIdx, stackHeight] = stack.pop()!;
    const width = n - stackIdx;
    const area = stackHeight * width;

    if (area > maxArea) {
      maxArea = area;
    }

    steps.push({
      state: {
        nums: [...heights],
        stack: stack.map(([idx, h]) => `i=${idx},h=${h}`),
        maxArea,
      },
      highlights: Array.from({ length: width }, (_, k) => stackIdx + k),
      pointers: { poppedIdx: stackIdx },
      message: `Pop (i=${stackIdx}, h=${stackHeight}). Width: ${n} - ${stackIdx} = ${width}. Area: ${stackHeight} * ${width} = ${area}. Max area: ${maxArea}`,
      codeLine: 13,
      action: 'pop',
    });
  }

  steps.push({
    state: {
      nums: [...heights],
      stack: [],
      maxArea,
      result: maxArea,
    },
    highlights: [],
    message: `Done! Largest rectangle area: ${maxArea}`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

export const largestRectHistogram: Algorithm = {
  id: 'largest-rectangle-in-histogram',
  name: 'Largest Rectangle in Histogram',
  category: 'Stack',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Monotonic Stack — increasing heights, calculate area on pop',
  description:
    'Given an array of integers heights representing the histogram\'s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram. Use a monotonic increasing stack to efficiently compute the max area.',
  problemUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/',
  code: {
    python: `def largestRectangleArea(heights):
    maxArea = 0
    stack = []  # (index, height)

    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            maxArea = max(maxArea, height * (i - idx))
            start = idx
        stack.append((start, h))

    for idx, height in stack:
        maxArea = max(maxArea, height * (len(heights) - idx))

    return maxArea`,
    javascript: `function largestRectangleArea(heights) {
    let maxArea = 0;
    const stack = []; // [index, height]

    for (let i = 0; i < heights.length; i++) {
        let start = i;
        while (stack.length && stack[stack.length - 1][1] > heights[i]) {
            const [idx, height] = stack.pop();
            maxArea = Math.max(maxArea, height * (i - idx));
            start = idx;
        }
        stack.push([start, heights[i]]);
    }

    for (const [idx, height] of stack) {
        maxArea = Math.max(maxArea, height * (heights.length - idx));
    }

    return maxArea;
}`,
  },
  defaultInput: [2, 1, 5, 6, 2, 3],
  run: runLargestRectHistogram,
};
