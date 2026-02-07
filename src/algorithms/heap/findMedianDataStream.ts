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
    java: `// Java implementation coming soon`,
  },
  defaultInput: [5, 2, 8, 1, 9, 3],
  run: runFindMedianDataStream,
};
