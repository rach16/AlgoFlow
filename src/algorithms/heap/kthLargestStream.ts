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

function runKthLargestStreamSortedList(input: unknown): AlgorithmStep[] {
  const { k, nums, adds } = input as KthLargestInput;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      nums: [...nums],
      hashMap: { k: k, windowSize: 0 },
    },
    highlights: [],
    message: `Initialize with k=${k}. Instead of a heap, keep a SORTED window of the k largest values — the kth largest always sits at the front.`,
    codeLine: 4,
  });

  const sortedAll = [...nums].sort((a, b) => a - b);
  const window = sortedAll.slice(-k);

  steps.push({
    state: {
      nums: [...sortedAll],
      hashMap: { k: k, sorted: sortedAll.join(', ') },
    },
    highlights: sortedAll.map((_, i) => i).filter((i) => i >= sortedAll.length - k),
    message: `Sort initial numbers ascending: [${sortedAll.join(', ')}]. Keep only the last ${k} (the largest): [${window.join(', ')}]`,
    codeLine: 6,
    action: 'visit',
  });

  steps.push({
    state: {
      nums: [...window],
      hashMap: { k: k, windowSize: window.length, kthLargest: window[0] },
      result: window[0],
    },
    highlights: [0],
    message: `Window = [${window.join(', ')}]. Front element ${window[0]} is the ${k}th largest so far.`,
    codeLine: 6,
    action: 'found',
  });

  for (const val of adds) {
    steps.push({
      state: {
        nums: [...window],
        hashMap: { k: k, adding: val },
      },
      highlights: [],
      message: `add(${val}): binary-search for where ${val} belongs in the sorted window`,
      codeLine: 8,
      action: 'visit',
    });

    // Binary insertion (bisect.insort)
    let lo = 0;
    let hi = window.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (window[mid] < val) lo = mid + 1;
      else hi = mid;
    }
    window.splice(lo, 0, val);

    steps.push({
      state: {
        nums: [...window],
        hashMap: { k: k, inserted: val, position: lo },
      },
      highlights: [lo],
      message: `Insert ${val} at index ${lo} — the window stays sorted without any re-sorting. Window: [${window.join(', ')}]`,
      codeLine: 9,
      action: 'insert',
    });

    if (window.length > k) {
      const removed = window.shift()!;
      steps.push({
        state: {
          nums: [...window],
          hashMap: { k: k, removed: removed },
        },
        highlights: [0],
        message: `Window size ${window.length + 1} > k=${k}: drop the smallest (${removed}). Window: [${window.join(', ')}]`,
        codeLine: 11,
        action: 'delete',
      });
    }

    steps.push({
      state: {
        nums: [...window],
        hashMap: { k: k, kthLargest: window[0] },
        result: window[0],
      },
      highlights: [0],
      message: `add(${val}) returns ${window[0]} — the front of the sorted window is always the ${k}th largest`,
      codeLine: 12,
      action: 'found',
    });
  }

  steps.push({
    state: {
      nums: [...window],
      hashMap: { k: k, finalKthLargest: window[0] },
      result: window[0],
    },
    highlights: [0],
    message: `All operations complete. Final ${k}th largest = ${window[0]}. Each insert cost O(k) shifting vs O(log k) for the heap.`,
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
  optimalApproachName: 'Min-Heap of Size K',
  approaches: [
    {
      id: 'sorted-window',
      name: 'Sorted Window',
      timeComplexity: 'O(n log n + m·k)',
      spaceComplexity: 'O(k)',
      description:
        'Keep the k largest values in a plain sorted list and binary-insert each new value — simpler than a heap, but each insert costs O(k) shifting instead of O(log k).',
      code: {
        python: `import bisect

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.window = sorted(nums)[-k:]

    def add(self, val):
        bisect.insort(self.window, val)
        if len(self.window) > self.k:
            self.window.pop(0)
        return self.window[0]`,
        javascript: `class KthLargest {
    constructor(k, nums) {
        this.k = k;
        this.window = [...nums].sort((a, b) => a - b).slice(-k);
    }

    add(val) {
        let lo = 0, hi = this.window.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (this.window[mid] < val) lo = mid + 1;
            else hi = mid;
        }
        this.window.splice(lo, 0, val);
        if (this.window.length > this.k) this.window.shift();
        return this.window[0];
    }
}`,
        java: `class KthLargest {
    private List<Integer> window = new ArrayList<>();
    private int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        int[] sorted = nums.clone();
        Arrays.sort(sorted);
        for (int i = Math.max(0, sorted.length - k); i < sorted.length; i++)
            window.add(sorted[i]);
    }

    public int add(int val) {
        int pos = Collections.binarySearch(window, val);
        if (pos < 0) pos = -pos - 1;
        window.add(pos, val);
        if (window.size() > k) window.remove(0);
        return window.get(0);
    }
}`,
      },
      run: runKthLargestStreamSortedList,
      lineExplanations: {
        python: {
          1: 'Import bisect for binary-search insertion',
          3: 'Define the KthLargest class',
          4: 'Constructor takes k and initial numbers',
          5: 'Store k for later use',
          6: 'Sort ascending, keep only the last k (largest) values',
          8: 'Define add method for new stream values',
          9: 'Binary-insert val, keeping the window sorted',
          10: 'If window grew past k elements',
          11: 'Drop the smallest (front) value',
          12: 'Front of the sorted window is the kth largest',
        },
        javascript: {
          1: 'Define the KthLargest class',
          2: 'Constructor takes k and initial numbers',
          3: 'Store k for later use',
          4: 'Sort ascending, keep only the last k (largest) values',
          7: 'Define add method for new stream values',
          8: 'Binary search bounds for insertion point',
          9: 'Halve the search range each iteration',
          10: 'Midpoint of the current range',
          11: 'Value belongs right of mid — search upper half',
          12: 'Otherwise search lower half',
          14: 'Insert val at the found index — window stays sorted',
          15: 'If window grew past k, drop the smallest (front)',
          16: 'Front of the sorted window is the kth largest',
        },
        java: {
          1: 'Define the KthLargest class',
          2: 'Sorted list holding the k largest values',
          3: 'Store k for size limit',
          5: 'Constructor takes k and initial numbers',
          6: 'Store k for later use',
          7: 'Copy nums so we can sort safely',
          8: 'Sort ascending',
          9: 'Walk the last k (largest) sorted values',
          10: 'Add each to the window list',
          13: 'Define add method for new stream values',
          14: 'Binary search for the insertion point',
          15: 'Negative result encodes the insertion index',
          16: 'Insert val at that index — list stays sorted',
          17: 'If window grew past k, drop the smallest (front)',
          18: 'Front of the sorted window is the kth largest',
        },
      },
    },
  ],
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
