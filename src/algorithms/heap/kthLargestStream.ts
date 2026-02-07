import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface KthLargestInput {
  k: number;
  nums: number[];
  adds: number[];
}

function runKthLargestStream(input: unknown): AlgorithmStep[] {
  const { k, nums, adds } = input as KthLargestInput;
  const steps: AlgorithmStep[] = [];

  // Min-heap implementation
  class MinHeap {
    heap: number[];
    constructor() {
      this.heap = [];
    }
    push(val: number) {
      this.heap.push(val);
      this._bubbleUp(this.heap.length - 1);
    }
    pop(): number {
      const top = this.heap[0];
      const last = this.heap.pop()!;
      if (this.heap.length > 0) {
        this.heap[0] = last;
        this._sinkDown(0);
      }
      return top;
    }
    peek(): number {
      return this.heap[0];
    }
    size(): number {
      return this.heap.length;
    }
    toArray(): number[] {
      return [...this.heap];
    }
    _bubbleUp(i: number) {
      while (i > 0) {
        const parent = Math.floor((i - 1) / 2);
        if (this.heap[parent] > this.heap[i]) {
          [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
          i = parent;
        } else break;
      }
    }
    _sinkDown(i: number) {
      const n = this.heap.length;
      while (true) {
        let smallest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
        if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
        if (smallest !== i) {
          [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
          i = smallest;
        } else break;
      }
    }
  }

  const minHeap = new MinHeap();

  steps.push({
    state: {
      nums: [],
      hashMap: { k: k, heapSize: 0 },
    },
    highlights: [],
    message: `Initialize KthLargest with k=${k}. We maintain a min-heap of size k.`,
    codeLine: 1,
  });

  // Initialize with nums
  steps.push({
    state: {
      nums: [...nums],
      hashMap: { k: k, phase: 'init' },
    },
    highlights: [],
    message: `Initial numbers: [${nums.join(', ')}]. Add each to heap, keeping only top ${k} largest.`,
    codeLine: 3,
  });

  for (let i = 0; i < nums.length; i++) {
    minHeap.push(nums[i]);

    steps.push({
      state: {
        nums: minHeap.toArray(),
        hashMap: { k: k, heapSize: minHeap.size(), added: nums[i] },
      },
      highlights: [minHeap.heap.indexOf(nums[i])],
      message: `Push ${nums[i]} into heap. Heap: [${minHeap.toArray().join(', ')}], size=${minHeap.size()}`,
      codeLine: 5,
      action: 'push',
    });

    if (minHeap.size() > k) {
      const removed = minHeap.pop();
      steps.push({
        state: {
          nums: minHeap.toArray(),
          hashMap: { k: k, heapSize: minHeap.size(), removed: removed },
        },
        highlights: [0],
        message: `Heap size ${minHeap.size() + 1} > k=${k}. Pop min=${removed}. Heap: [${minHeap.toArray().join(', ')}]`,
        codeLine: 6,
        action: 'pop',
      });
    }
  }

  steps.push({
    state: {
      nums: minHeap.toArray(),
      hashMap: { k: k, heapSize: minHeap.size(), kthLargest: minHeap.peek() },
      result: minHeap.peek(),
    },
    highlights: [0],
    message: `Initialization complete. Heap: [${minHeap.toArray().join(', ')}]. Kth largest = heap top = ${minHeap.peek()}`,
    codeLine: 7,
    action: 'found',
  });

  // Process add operations
  for (let i = 0; i < adds.length; i++) {
    const val = adds[i];

    steps.push({
      state: {
        nums: minHeap.toArray(),
        hashMap: { k: k, heapSize: minHeap.size(), adding: val },
      },
      highlights: [],
      message: `add(${val}): Adding ${val} to the stream`,
      codeLine: 9,
      action: 'visit',
    });

    minHeap.push(val);

    steps.push({
      state: {
        nums: minHeap.toArray(),
        hashMap: { k: k, heapSize: minHeap.size(), added: val },
      },
      highlights: [minHeap.heap.indexOf(val)],
      message: `Push ${val} into heap. Heap: [${minHeap.toArray().join(', ')}]`,
      codeLine: 10,
      action: 'push',
    });

    if (minHeap.size() > k) {
      const removed = minHeap.pop();
      steps.push({
        state: {
          nums: minHeap.toArray(),
          hashMap: { k: k, heapSize: minHeap.size(), removed: removed },
        },
        highlights: [0],
        message: `Heap size > k=${k}. Pop min=${removed}. Heap: [${minHeap.toArray().join(', ')}]`,
        codeLine: 11,
        action: 'pop',
      });
    }

    steps.push({
      state: {
        nums: minHeap.toArray(),
        hashMap: { k: k, kthLargest: minHeap.peek() },
        result: minHeap.peek(),
      },
      highlights: [0],
      message: `add(${val}) returns ${minHeap.peek()} (top of min-heap = kth largest)`,
      codeLine: 12,
      action: 'found',
    });
  }

  steps.push({
    state: {
      nums: minHeap.toArray(),
      hashMap: { k: k, finalKthLargest: minHeap.peek() },
      result: minHeap.peek(),
    },
    highlights: [],
    message: `All operations complete. Final kth largest = ${minHeap.peek()}`,
    codeLine: 12,
  });

  return steps;
}

export const kthLargestStream: Algorithm = {
  id: 'kth-largest-stream',
  name: 'Kth Largest Element in a Stream',
  category: 'Heap / Priority Queue',
  difficulty: 'Easy',
  timeComplexity: 'O(n log k)',
  spaceComplexity: 'O(k)',
  pattern: 'Min Heap — keep k largest, top is kth largest',
  description:
    'Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.',
  problemUrl: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/',
  code: {
    python: `import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.minHeap = nums
        self.k = k
        heapq.heapify(self.minHeap)
        while len(self.minHeap) > k:
            heapq.heappop(self.minHeap)

    def add(self, val):
        heapq.heappush(self.minHeap, val)
        if len(self.minHeap) > self.k:
            heapq.heappop(self.minHeap)
        return self.minHeap[0]`,
    javascript: `class KthLargest {
    constructor(k, nums) {
        this.k = k;
        this.minHeap = new MinPriorityQueue();
        for (const num of nums) {
            this.minHeap.enqueue(num);
            if (this.minHeap.size() > k)
                this.minHeap.dequeue();
        }
    }

    add(val) {
        this.minHeap.enqueue(val);
        if (this.minHeap.size() > this.k)
            this.minHeap.dequeue();
        return this.minHeap.front().element;
    }
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: { k: 3, nums: [4, 5, 8, 2], adds: [3, 5, 10, 9, 4] },
  run: runKthLargestStream,
};
