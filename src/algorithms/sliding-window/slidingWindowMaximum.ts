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

function runSlidingWindowMaxHeap(input: unknown): AlgorithmStep[] {
  const { nums, k } = input as SlidingWindowMaxInput;
  const steps: AlgorithmStep[] = [];
  const output: number[] = [];
  // Max-heap of [value, index]; modeled as a list kept ordered by value descending
  const heap: Array<[number, number]> = [];

  const heapValues = () => heap.map((h) => h[0]);

  steps.push({
    state: { nums: [...nums], queue: [], result: [], k },
    highlights: [],
    message: `Max-heap with LAZY removal: push every element, and only discard an old max when it surfaces at the top while outside the window — no need to delete from the middle`,
    codeLine: 3,
  });

  for (let i = 0; i < nums.length; i++) {
    heap.push([nums[i], i]);
    heap.sort((x, y) => y[0] - x[0]);

    steps.push({
      state: { nums: [...nums], queue: heapValues(), result: [...output], k },
      highlights: [i],
      pointers: { left: Math.max(0, i - k + 1), right: i },
      message: `Push (${nums[i]}, index ${i}) into the heap — it sifts to its place by value. Heap (by priority): [${heapValues().join(', ')}]`,
      codeLine: 8,
      action: 'push',
    });

    if (i >= k - 1) {
      while (heap[0][1] <= i - k) {
        const [staleVal, staleIdx] = heap[0];
        heap.shift();

        steps.push({
          state: { nums: [...nums], queue: heapValues(), result: [...output], k },
          highlights: [staleIdx],
          pointers: { left: i - k + 1, right: i },
          message: `Top of heap is ${staleVal} from index ${staleIdx} — it slid out of window [${i - k + 1}, ${i}]. Lazily pop it NOW, only because it reached the top`,
          codeLine: 11,
          action: 'pop',
        });
      }

      const windowStart = i - k + 1;
      const maxVal = heap[0][0];
      output.push(maxVal);

      steps.push({
        state: { nums: [...nums], queue: heapValues(), result: [...output], k },
        highlights: Array.from({ length: k }, (_, idx) => windowStart + idx),
        secondary: [heap[0][1]],
        pointers: { left: windowStart, right: i },
        message: `Window [${windowStart}..${i}]: heap top ${maxVal} is in-window, so it is the max. Stale entries deeper in the heap can wait. Output: [${output.join(', ')}]`,
        codeLine: 12,
        action: 'found',
      });
    } else {
      steps.push({
        state: { nums: [...nums], queue: heapValues(), result: [...output], k },
        highlights: Array.from({ length: i + 1 }, (_, idx) => idx),
        pointers: { right: i },
        message: `Building initial window: ${i + 1}/${k} elements pushed so far`,
        codeLine: 9,
        action: 'visit',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], queue: heapValues(), result: [...output], k },
    highlights: [],
    message: `Sliding window maximums: [${output.join(', ')}]. O(n log n) vs the deque's O(n) — but the heap idea generalizes to any "max/min over a moving set" problem`,
    codeLine: 14,
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
  optimalApproachName: 'Monotonic Deque',
  approaches: [
    {
      id: 'max-heap-lazy-removal',
      name: 'Max-Heap (Lazy Removal)',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of a monotonic deque, keep every element in a max-heap and lazily discard stale maxes only when they surface at the top outside the window — simpler invariant, extra log factor.',
      code: {
        python: `import heapq

def maxSlidingWindow(nums, k):
    output = []
    heap = []  # (-value, index)

    for i in range(len(nums)):
        heapq.heappush(heap, (-nums[i], i))
        if i >= k - 1:
            while heap[0][1] <= i - k:
                heapq.heappop(heap)
            output.append(-heap[0][0])

    return output`,
        javascript: `function maxSlidingWindow(nums, k) {
    // MaxPriorityQueue from datastructures-js (built into LeetCode)
    const heap = new MaxPriorityQueue({ priority: (item) => item[0] });
    const output = [];

    for (let i = 0; i < nums.length; i++) {
        heap.enqueue([nums[i], i]);
        if (i >= k - 1) {
            // lazy removal: discard maxes that slid out of the window
            while (heap.front().element[1] <= i - k)
                heap.dequeue();
            output.push(heap.front().element[0]);
        }
    }

    return output;
}`,
        java: `public static int[] maxSlidingWindow(int[] nums, int k) {
    int[] output = new int[nums.length - k + 1];
    // Max-heap of {value, index}, ordered by value descending
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> b[0] - a[0]);

    for (int i = 0; i < nums.length; i++) {
        heap.offer(new int[] { nums[i], i });
        if (i >= k - 1) {
            while (heap.peek()[1] <= i - k) {
                heap.poll(); // lazily discard stale entries
            }
            output[i - k + 1] = heap.peek()[0];
        }
    }

    return output;
}`,
      },
      run: runSlidingWindowMaxHeap,
      lineExplanations: {
        python: {
          1: 'heapq provides a min-heap, so we store negated values',
          3: 'Define function taking nums array and window size k',
          4: 'Store the max value for each window position',
          5: 'Heap of (-value, index): smallest negation = largest value on top',
          7: 'Iterate through every element in the array',
          8: 'Push every element — never delete from the middle',
          9: 'Once the first window is complete',
          10: 'Is the top of the heap from outside the window?',
          11: 'Lazily pop it — stale entries only cost us when they surface',
          12: 'Top is in-window, so it is the current maximum',
          14: 'Return array of sliding window maximums',
        },
        javascript: {
          1: 'Define function taking nums array and window size k',
          2: 'LeetCode ships datastructures-js priority queues',
          3: 'Max-heap of [value, index], prioritized by value',
          4: 'Store the max value for each window position',
          6: 'Iterate through every element in the array',
          7: 'Push every element — never delete from the middle',
          8: 'Once the first window is complete',
          9: 'Stale maxes are discarded only when they surface',
          10: 'Is the top of the heap from outside the window?',
          11: 'Lazily dequeue the stale entry',
          12: 'Top is in-window, so it is the current maximum',
          16: 'Return array of sliding window maximums',
        },
        java: {
          1: 'Define function taking nums array and window size k',
          2: 'Allocate output array for window maximums',
          3: 'Comparator puts the largest value at the top',
          4: 'Max-heap of {value, index} pairs',
          6: 'Iterate through every element in the array',
          7: 'Push every element — never delete from the middle',
          8: 'Once the first window is complete',
          9: 'Is the top of the heap from outside the window?',
          10: 'Lazily poll it — stale entries only cost us when they surface',
          12: 'Top is in-window, so it is the current maximum',
          16: 'Return array of sliding window maximums',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking nums array and window size k',
      2: 'Store the max value for each window position',
      3: 'Monotonic deque stores indices in decreasing order',
      5: 'Iterate through every element in array',
      7: 'Remove front if index is outside window range',
      8: 'Pop index from front of deque',
      11: 'Remove smaller elements from back of deque',
      12: 'Pop index from back of deque',
      14: 'Add current index to back of deque',
      17: 'Once window is full, record the maximum',
      18: 'Front of deque holds index of window max',
      20: 'Return array of sliding window maximums',
    },
    javascript: {
      1: 'Define function taking nums array and window size k',
      2: 'Store the max value for each window position',
      3: 'Monotonic deque stores indices in decreasing order',
      5: 'Iterate through every element in array',
      7: 'Remove front if index is outside window range',
      8: 'Shift index from front of deque',
      11: 'Remove smaller elements from back of deque',
      12: 'Pop index from back of deque',
      14: 'Push current index to back of deque',
      17: 'Once window is full, record the maximum',
      18: 'Front of deque holds index of window max',
      21: 'Return array of sliding window maximums',
    },
    java: {
      1: 'Define function taking nums array and window size k',
      2: 'Allocate output array for window maximums',
      3: 'Monotonic deque stores indices in decreasing order',
      5: 'Iterate through every element in array',
      7: 'If front index is outside window range',
      8: 'Poll index from front of deque',
      12: 'Remove smaller elements from back of deque',
      13: 'Poll index from back of deque',
      16: 'Add current index to back of deque',
      19: 'Once window is full, record the maximum',
      20: 'Front of deque holds index of window max',
      24: 'Return array of sliding window maximums',
    },
  },
};
