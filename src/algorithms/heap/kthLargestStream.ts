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
    java: `class KthLargest {
    private PriorityQueue<Integer> minHeap;
    private int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        this.minHeap = new PriorityQueue<>();
        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) {
                minHeap.poll();
            }
        }
    }

    public int add(int val) {
        minHeap.offer(val);
        if (minHeap.size() > k) {
            minHeap.poll();
        }
        return minHeap.peek();
    }
}`,
  },
  defaultInput: { k: 3, nums: [4, 5, 8, 2], adds: [3, 5, 10, 9, 4] },
  run: runKthLargestStream,
  lineExplanations: {
    python: {
      1: 'Import heapq for min-heap operations',
      3: 'Define the KthLargest class',
      4: 'Constructor takes k and initial numbers',
      5: 'Store nums as the min-heap array',
      6: 'Store k for later use',
      7: 'Heapify the array into a min-heap',
      8: 'Trim heap to keep only k largest elements',
      9: 'Pop smallest until heap has k elements',
      11: 'Define add method for new stream values',
      12: 'Push new value into the min-heap',
      13: 'If heap exceeds size k, remove smallest',
      14: 'Pop the minimum to maintain size k',
      15: 'Heap top is the kth largest element',
    },
    javascript: {
      1: 'Define the KthLargest class',
      2: 'Constructor takes k and initial numbers',
      3: 'Store k for later use',
      4: 'Create a min priority queue',
      5: 'Add each initial number to heap',
      6: 'Enqueue number into min-heap',
      7: 'If heap exceeds size k, remove smallest',
      8: 'Dequeue minimum to maintain size k',
      12: 'Define add method for new stream values',
      13: 'Push new value into the min-heap',
      14: 'If heap exceeds size k, remove smallest',
      15: 'Dequeue minimum to maintain size k',
      16: 'Heap front is the kth largest element',
    },
    java: {
      1: 'Define the KthLargest class',
      2: 'Min-heap to store k largest elements',
      3: 'Store k for size limit',
      5: 'Constructor takes k and initial numbers',
      6: 'Store k for later use',
      7: 'Initialize min priority queue',
      8: 'Add each number to the heap',
      9: 'Offer number into min-heap',
      10: 'If heap exceeds size k, remove smallest',
      11: 'Poll minimum to maintain size k',
      16: 'Define add method for new stream values',
      17: 'Push new value into the min-heap',
      18: 'If heap exceeds size k, remove smallest',
      19: 'Poll minimum to maintain size k',
      21: 'Heap peek is the kth largest element',
    },
  },
};
