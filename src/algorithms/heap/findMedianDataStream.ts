import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runFindMedianDataStream(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  // Two heaps: maxHeap (left half), minHeap (right half)
  // maxHeap stores negated values to simulate max-heap with sort
  const maxHeap: number[] = []; // left half (stores values, sorted descending)
  const minHeap: number[] = []; // right half (stores values, sorted ascending)

  const getMaxHeapSorted = () => [...maxHeap].sort((a, b) => b - a);
  const getMinHeapSorted = () => [...minHeap].sort((a, b) => a - b);

  const pushMaxHeap = (val: number) => {
    maxHeap.push(val);
    maxHeap.sort((a, b) => b - a);
  };
  const pushMinHeap = (val: number) => {
    minHeap.push(val);
    minHeap.sort((a, b) => a - b);
  };
  const popMaxHeap = (): number => {
    maxHeap.sort((a, b) => b - a);
    return maxHeap.shift()!;
  };
  const popMinHeap = (): number => {
    minHeap.sort((a, b) => a - b);
    return minHeap.shift()!;
  };
  const peekMaxHeap = (): number => {
    maxHeap.sort((a, b) => b - a);
    return maxHeap[0];
  };
  const peekMinHeap = (): number => {
    minHeap.sort((a, b) => a - b);
    return minHeap[0];
  };

  steps.push({
    state: {
      nums: [],
      hashMap: { maxHeapLabel: 'left half (max-heap)', minHeapLabel: 'right half (min-heap)' },
    },
    highlights: [],
    message: 'Initialize MedianFinder with two heaps: maxHeap (left half) and minHeap (right half).',
    codeLine: 1,
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];

    steps.push({
      state: {
        nums: [...getMaxHeapSorted(), ...getMinHeapSorted()],
        hashMap: {
          maxHeap: `[${getMaxHeapSorted().join(', ')}]`,
          minHeap: `[${getMinHeapSorted().join(', ')}]`,
          adding: num,
        },
      },
      highlights: [],
      message: `addNum(${num}): Adding ${num} to the data structure`,
      codeLine: 4,
      action: 'visit',
    });

    // Always add to maxHeap first
    pushMaxHeap(num);

    steps.push({
      state: {
        nums: [...getMaxHeapSorted(), ...getMinHeapSorted()],
        hashMap: {
          maxHeap: `[${getMaxHeapSorted().join(', ')}]`,
          minHeap: `[${getMinHeapSorted().join(', ')}]`,
        },
      },
      highlights: [getMaxHeapSorted().indexOf(num)],
      message: `Push ${num} to maxHeap. maxHeap=[${getMaxHeapSorted().join(', ')}]`,
      codeLine: 5,
      action: 'push',
    });

    // Ensure every element in maxHeap <= every element in minHeap
    if (minHeap.length > 0 && peekMaxHeap() > peekMinHeap()) {
      const maxVal = popMaxHeap();
      const minVal = popMinHeap();
      pushMinHeap(maxVal);
      pushMaxHeap(minVal);

      steps.push({
        state: {
          nums: [...getMaxHeapSorted(), ...getMinHeapSorted()],
          hashMap: {
            maxHeap: `[${getMaxHeapSorted().join(', ')}]`,
            minHeap: `[${getMinHeapSorted().join(', ')}]`,
          },
        },
        highlights: [],
        message: `maxHeap top (${maxVal}) > minHeap top (${minVal}): Swap tops to maintain order`,
        codeLine: 7,
        action: 'swap',
      });
    }

    // Balance sizes: maxHeap can have at most 1 more element than minHeap
    if (maxHeap.length > minHeap.length + 1) {
      const moved = popMaxHeap();
      pushMinHeap(moved);

      steps.push({
        state: {
          nums: [...getMaxHeapSorted(), ...getMinHeapSorted()],
          hashMap: {
            maxHeap: `[${getMaxHeapSorted().join(', ')}]`,
            minHeap: `[${getMinHeapSorted().join(', ')}]`,
          },
        },
        highlights: [],
        message: `maxHeap too large (${maxHeap.length + 1} vs ${minHeap.length - 1}). Move ${moved} to minHeap.`,
        codeLine: 9,
        action: 'swap',
      });
    } else if (minHeap.length > maxHeap.length) {
      const moved = popMinHeap();
      pushMaxHeap(moved);

      steps.push({
        state: {
          nums: [...getMaxHeapSorted(), ...getMinHeapSorted()],
          hashMap: {
            maxHeap: `[${getMaxHeapSorted().join(', ')}]`,
            minHeap: `[${getMinHeapSorted().join(', ')}]`,
          },
        },
        highlights: [],
        message: `minHeap too large (${minHeap.length + 1} vs ${maxHeap.length - 1}). Move ${moved} to maxHeap.`,
        codeLine: 11,
        action: 'swap',
      });
    }

    // Calculate median
    let median: number;
    if (maxHeap.length > minHeap.length) {
      median = peekMaxHeap();
      steps.push({
        state: {
          nums: [...getMaxHeapSorted(), ...getMinHeapSorted()],
          hashMap: {
            maxHeap: `[${getMaxHeapSorted().join(', ')}]`,
            minHeap: `[${getMinHeapSorted().join(', ')}]`,
            median: median,
          },
          result: median,
        },
        highlights: [0],
        message: `findMedian: Odd total (${maxHeap.length + minHeap.length}). Median = maxHeap top = ${median}`,
        codeLine: 13,
        action: 'found',
      });
    } else {
      median = (peekMaxHeap() + peekMinHeap()) / 2;
      steps.push({
        state: {
          nums: [...getMaxHeapSorted(), ...getMinHeapSorted()],
          hashMap: {
            maxHeap: `[${getMaxHeapSorted().join(', ')}]`,
            minHeap: `[${getMinHeapSorted().join(', ')}]`,
            median: median,
          },
          result: median,
        },
        highlights: [maxHeap.length - 1, maxHeap.length],
        message: `findMedian: Even total (${maxHeap.length + minHeap.length}). Median = (${peekMaxHeap()} + ${peekMinHeap()}) / 2 = ${median}`,
        codeLine: 15,
        action: 'found',
      });
    }
  }

  const finalMaxSorted = getMaxHeapSorted();
  const finalMinSorted = getMinHeapSorted();
  let finalMedian: number;
  if (maxHeap.length > minHeap.length) {
    finalMedian = peekMaxHeap();
  } else {
    finalMedian = (peekMaxHeap() + peekMinHeap()) / 2;
  }

  steps.push({
    state: {
      nums: [...finalMaxSorted, ...finalMinSorted],
      hashMap: {
        maxHeap: `[${finalMaxSorted.join(', ')}]`,
        minHeap: `[${finalMinSorted.join(', ')}]`,
        finalMedian: finalMedian,
      },
      result: finalMedian,
    },
    highlights: [],
    message: `All numbers added. Final median = ${finalMedian}. maxHeap=[${finalMaxSorted.join(', ')}], minHeap=[${finalMinSorted.join(', ')}]`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

export const findMedianDataStream: Algorithm = {
  id: 'find-median-data-stream',
  name: 'Find Median from Data Stream',
  category: 'Heap / Priority Queue',
  difficulty: 'Hard',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(n)',
  pattern: 'Two Heaps — max heap for lower half, min heap for upper',
  description:
    'The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values. Implement the MedianFinder class that supports addNum and findMedian operations efficiently.',
  problemUrl: 'https://leetcode.com/problems/find-median-from-data-stream/',
  code: {
    python: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # maxHeap (negate values)
        self.large = []  # minHeap

    def addNum(self, num):
        # Push to maxHeap (negate for max behavior)
        heapq.heappush(self.small, -1 * num)

        # Ensure max of small <= min of large
        if (self.small and self.large and
            (-self.small[0]) > self.large[0]):
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)

        # Balance sizes
        if len(self.small) > len(self.large) + 1:
            val = -heapq.heappop(self.small)
            heapq.heappush(self.large, val)
        if len(self.large) > len(self.small):
            val = heapq.heappop(self.large)
            heapq.heappush(self.small, -val)

    def findMedian(self):
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2.0`,
    javascript: `class MedianFinder {
    constructor() {
        this.small = new MaxPriorityQueue(); // left half
        this.large = new MinPriorityQueue(); // right half
    }

    addNum(num) {
        this.small.enqueue(num);

        // Ensure max of small <= min of large
        if (this.small.size() && this.large.size() &&
            this.small.front().element > this.large.front().element) {
            const val = this.small.dequeue().element;
            this.large.enqueue(val);
        }

        // Balance sizes
        if (this.small.size() > this.large.size() + 1) {
            this.large.enqueue(this.small.dequeue().element);
        }
        if (this.large.size() > this.small.size()) {
            this.small.enqueue(this.large.dequeue().element);
        }
    }

    findMedian() {
        if (this.small.size() > this.large.size())
            return this.small.front().element;
        return (this.small.front().element +
                this.large.front().element) / 2;
    }
}`,
    java: `class MedianFinder {
    private PriorityQueue<Integer> small; // max heap (left half)
    private PriorityQueue<Integer> large; // min heap (right half)

    public MedianFinder() {
        small = new PriorityQueue<>((a, b) -> b - a);
        large = new PriorityQueue<>();
    }

    public void addNum(int num) {
        small.offer(num);

        // Ensure max of small <= min of large
        if (!small.isEmpty() && !large.isEmpty() &&
            small.peek() > large.peek()) {
            large.offer(small.poll());
        }

        // Balance sizes
        if (small.size() > large.size() + 1) {
            large.offer(small.poll());
        }
        if (large.size() > small.size()) {
            small.offer(large.poll());
        }
    }

    public double findMedian() {
        if (small.size() > large.size()) {
            return small.peek();
        }
        return (small.peek() + large.peek()) / 2.0;
    }
}`,
  },
  defaultInput: [5, 2, 8, 1, 9, 3],
  run: runFindMedianDataStream,
  lineExplanations: {
    python: {
      1: 'Import heapq for priority queue operations',
      3: 'Define the MedianFinder class',
      4: 'Initialize MedianFinder instance',
      5: 'Max-heap for lower half (negated values)',
      6: 'Min-heap for upper half',
      8: 'Add a number to the data structure',
      9: 'Comment: push to max-heap first',
      10: 'Push negated value to simulate max-heap',
      12: 'Comment: ensure ordering between heaps',
      13: 'Check if max of small exceeds min of large',
      14: 'Pop max from small heap',
      15: 'Push it to large heap',
      17: 'Comment: balance heap sizes',
      18: 'If small has more than 1 extra element',
      19: 'Move top of small to large',
      20: 'Push to large heap',
      21: 'If large is bigger than small',
      22: 'Move top of large to small',
      23: 'Push negated value to small heap',
      25: 'Find current median',
      26: 'Odd total: median is top of small',
      27: 'Return negated top of max-heap',
      28: 'Even total: average of both tops',
    },
    javascript: {
      1: 'Define the MedianFinder class',
      2: 'Initialize MedianFinder instance',
      3: 'Max priority queue for lower half',
      4: 'Min priority queue for upper half',
      7: 'Add a number to the structure',
      8: 'Push to max-heap (lower half) first',
      10: 'Comment: ensure ordering between heaps',
      11: 'Check if max of small exceeds min of large',
      12: 'Check front elements of both heaps',
      13: 'Dequeue max from small',
      14: 'Enqueue to large heap',
      17: 'Comment: balance heap sizes',
      18: 'If small has more than 1 extra element',
      19: 'Move top of small to large',
      21: 'If large is bigger than small',
      22: 'Move top of large to small',
      26: 'Find current median',
      27: 'Odd total: median is front of small',
      28: 'Return front element of max-heap',
      29: 'Even total: average of both fronts',
      30: 'Return average of two middle values',
    },
    java: {
      1: 'Define the MedianFinder class',
      2: 'Max-heap for lower half of numbers',
      3: 'Min-heap for upper half of numbers',
      5: 'Initialize MedianFinder instance',
      6: 'Create max-heap with reverse comparator',
      7: 'Create default min-heap',
      10: 'Add a number to the structure',
      11: 'Push to max-heap first',
      13: 'Comment: ensure ordering between heaps',
      14: 'Check if max of small exceeds min of large',
      15: 'Check peek values of both heaps',
      16: 'Move top of small to large',
      19: 'Comment: balance heap sizes',
      20: 'If small has more than 1 extra element',
      21: 'Move top of small to large',
      23: 'If large is bigger than small',
      24: 'Move top of large to small',
      28: 'Find current median',
      29: 'Odd total: median is top of small',
      30: 'Return peek of max-heap',
      32: 'Even total: average of both tops',
    },
  },
};
