import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface SlidingWindowMaxInput {
  nums: number[];
  k: number;
}

function runSlidingWindowMaximum(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as SlidingWindowMaxInput;
  const steps: AlgorithmStep[] = [];
  const output: number[] = [];
  const deque: number[] = []; // stores indices

  // Initial state
  steps.push({
    state: { nums: [...nums], queue: [], result: [], k },
    highlights: [],
    message: `Find the maximum in each sliding window of size ${k} in [${nums.join(', ')}]`,
    codeLine: 1,
  });

  for (let i = 0; i < nums.length; i++) {
    // Remove indices outside the window from front of deque
    while (deque.length > 0 && deque[0] < i - k + 1) {
      const removed = deque.shift()!;

      steps.push({
        state: {
          nums: [...nums],
          queue: deque.map((idx) => nums[idx]),
          result: [...output],
          k,
        },
        highlights: Array.from({ length: Math.min(k, i + 1) }, (_, idx) => Math.max(0, i - k + 1) + idx),
        pointers: { left: Math.max(0, i - k + 1), right: i },
        message: `Remove index ${removed} (value=${nums[removed]}) from front of deque: outside window [${Math.max(0, i - k + 1)}, ${i}]`,
        codeLine: 4,
        action: 'delete',
      });
    }

    // Remove smaller elements from back of deque
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      const removed = deque.pop()!;

      steps.push({
        state: {
          nums: [...nums],
          queue: deque.map((idx) => nums[idx]),
          result: [...output],
          k,
        },
        highlights: [removed, i],
        pointers: { left: Math.max(0, i - k + 1), right: i },
        message: `Remove index ${removed} (value=${nums[removed]}) from back of deque: ${nums[removed]} <= ${nums[i]}`,
        codeLine: 6,
        action: 'compare',
      });
    }

    // Add current index to deque
    deque.push(i);

    steps.push({
      state: {
        nums: [...nums],
        queue: deque.map((idx) => nums[idx]),
        result: [...output],
        k,
      },
      highlights: [i],
      pointers: { left: Math.max(0, i - k + 1), right: i },
      message: `Push index ${i} (value=${nums[i]}) to deque. Deque values: [${deque.map((idx) => nums[idx]).join(', ')}]`,
      codeLine: 8,
      action: 'push',
    });

    // Once we have a full window, record the maximum
    if (i >= k - 1) {
      const windowStart = i - k + 1;
      const maxVal = nums[deque[0]];
      output.push(maxVal);

      steps.push({
        state: {
          nums: [...nums],
          queue: deque.map((idx) => nums[idx]),
          result: [...output],
          k,
        },
        highlights: Array.from({ length: k }, (_, idx) => windowStart + idx),
        pointers: { left: windowStart, right: i },
        message: `Window [${windowStart}..${i}] = [${nums.slice(windowStart, i + 1).join(', ')}]. Max = ${maxVal} (front of deque). Output: [${output.join(', ')}]`,
        codeLine: 10,
        action: 'found',
      });
    } else {
      steps.push({
        state: {
          nums: [...nums],
          queue: deque.map((idx) => nums[idx]),
          result: [...output],
          k,
        },
        highlights: Array.from({ length: i + 1 }, (_, idx) => idx),
        pointers: { right: i },
        message: `Building initial window: ${i + 1}/${k} elements added so far`,
        codeLine: 9,
        action: 'visit',
      });
    }
  }

  // Final result
  steps.push({
    state: {
      nums: [...nums],
      queue: deque.map((idx) => nums[idx]),
      result: [...output],
      k,
    },
    highlights: [],
    message: `Sliding window maximums: [${output.join(', ')}]`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const slidingWindowMaximum: Algorithm = {
  id: 'sliding-window-maximum',
  name: 'Sliding Window Maximum',
  category: 'Sliding Window',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(k)',
  pattern: 'Monotonic Deque — maintain decreasing order in window',
  description:
    'You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window.',
  problemUrl: 'https://leetcode.com/problems/sliding-window-maximum/',
  code: {
    python: `def maxSlidingWindow(nums, k):
    output = []
    deque = []  # indices

    for i in range(len(nums)):
        # Remove indices outside window
        while deque and deque[0] < i - k + 1:
            deque.pop(0)

        # Remove smaller elements from back
        while deque and nums[deque[-1]] <= nums[i]:
            deque.pop()

        deque.append(i)

        # Record max once window is full
        if i >= k - 1:
            output.append(nums[deque[0]])

    return output`,
    javascript: `function maxSlidingWindow(nums, k) {
    const output = [];
    const deque = []; // indices

    for (let i = 0; i < nums.length; i++) {
        // Remove indices outside window
        while (deque.length && deque[0] < i - k + 1)
            deque.shift();

        // Remove smaller elements from back
        while (deque.length && nums[deque[deque.length-1]] <= nums[i])
            deque.pop();

        deque.push(i);

        // Record max once window is full
        if (i >= k - 1)
            output.push(nums[deque[0]]);
    }

    return output;
}`,
    java: `public static int[] maxSlidingWindow(int[] nums, int k) {
    int[] output = new int[nums.length - k + 1];
    Deque<Integer> deque = new ArrayDeque<>(); // indices

    for (int i = 0; i < nums.length; i++) {
        // Remove indices outside window
        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
            deque.pollFirst();
        }

        // Remove smaller elements from back
        while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) {
            deque.pollLast();
        }

        deque.offerLast(i);

        // Record max once window is full
        if (i >= k - 1) {
            output[i - k + 1] = nums[deque.peekFirst()];
        }
    }

    return output;
}`,
  },
  defaultInput: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
  run: runSlidingWindowMaximum,
};
