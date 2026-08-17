import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type FreqStackOp = [string, number?];

const opLabel = ([op, val]: FreqStackOp) => (val !== undefined ? `${op}(${val})` : `${op}()`);

function runMaxFrequencyStack(input: unknown): AlgorithmStep[] {
  const operations = input as FreqStackOp[];
  const steps: AlgorithmStep[] = [];
  const labels = operations.map(opLabel);
  const freq: Record<string, number> = {};
  const group: Record<number, number[]> = {};
  let maxFreq = 0;
  const popped: number[] = [];

  const groupView = () => {
    const rows: string[] = [];
    for (let f = 1; f <= maxFreq; f++) {
      rows.push(`f=${f}: [${(group[f] ?? []).join(', ')}]`);
    }
    return rows;
  };

  steps.push({
    state: { chars: [...labels], stack: [], hashMap: { ...freq } },
    highlights: [],
    message:
      'Key idea: when a value reaches frequency f, record it on the stack for level f. pop() then only ever needs the top of the highest non-empty level — most frequent wins, and ties break toward the most recently pushed.',
    codeLine: 4,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, val] = operations[i];

    steps.push({
      state: { chars: [...labels], stack: groupView(), hashMap: { ...freq } },
      highlights: [i],
      pointers: { op: i },
      message: `Operation ${i}: ${labels[i]}`,
      codeLine: op === 'push' ? 7 : 13,
      action: 'visit',
    });

    if (op === 'push' && val !== undefined) {
      const f = (freq[val] ?? 0) + 1;
      freq[val] = f;
      maxFreq = Math.max(maxFreq, f);
      if (!group[f]) group[f] = [];
      group[f].push(val);

      steps.push({
        state: { chars: [...labels], stack: groupView(), hashMap: { ...freq } },
        highlights: [i],
        pointers: { op: i },
        message: `${val} is now seen ${f}× — push it onto level f=${f}. Copies at lower levels stay put, so ${val} is simultaneously "the 1st ${val}", "the 2nd ${val}", ... maxFreq = ${maxFreq}.`,
        codeLine: 11,
        action: 'push',
      });
    } else if (op === 'pop') {
      const top = group[maxFreq].pop() as number;
      freq[top] = (freq[top] ?? 0) - 1;
      popped.push(top);
      const drained = group[maxFreq].length === 0;
      const oldMax = maxFreq;
      if (drained) maxFreq -= 1;

      steps.push({
        state: { chars: [...labels], stack: groupView(), hashMap: { ...freq }, result: top },
        highlights: [i],
        pointers: { op: i },
        message: drained
          ? `Level f=${oldMax} is the highest non-empty level; its top is ${top}, so pop returns ${top}. That level is now empty, so maxFreq drops to ${maxFreq} — and it can only ever drop by 1.`
          : `Level f=${oldMax} is the highest non-empty level; its top is ${top} (the most recent value to reach frequency ${oldMax}), so pop returns ${top}. freq[${top}] falls to ${freq[top]}.`,
        codeLine: drained ? 17 : 14,
        action: 'pop',
      });
    }
  }

  steps.push({
    state: { chars: [...labels], stack: groupView(), hashMap: { ...freq }, result: popped },
    highlights: [],
    message: `Pop order was [${popped.join(', ')}] — every operation ran in O(1) because the level stacks already encode "most frequent, most recent".`,
    codeLine: 18,
    action: 'found',
  });

  return steps;
}

function runMaxFrequencyStackHeap(input: unknown): AlgorithmStep[] {
  const operations = input as FreqStackOp[];
  const steps: AlgorithmStep[] = [];
  const labels = operations.map(opLabel);
  const freq: Record<string, number> = {};
  const heap: { f: number; order: number; val: number }[] = [];
  let order = 0;
  const popped: number[] = [];

  // Rendered bottom -> top, so the last entry is the next one to be dequeued.
  const heapView = () =>
    [...heap]
      .sort((a, b) => (a.f !== b.f ? a.f - b.f : a.order - b.order))
      .map((e) => `${e.val} (f=${e.f}, #${e.order})`);

  const nextIndex = () => {
    let best = 0;
    for (let i = 1; i < heap.length; i++) {
      if (heap[i].f > heap[best].f || (heap[i].f === heap[best].f && heap[i].order > heap[best].order)) {
        best = i;
      }
    }
    return best;
  };

  steps.push({
    state: { chars: [...labels], stack: [], hashMap: { ...freq } },
    highlights: [],
    message:
      'Same rule — "highest frequency, then most recent" — expressed directly as a priority. Every push becomes a heap entry keyed by (frequency, insertion order), and pop is just "take the maximum".',
    codeLine: 5,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, val] = operations[i];

    steps.push({
      state: { chars: [...labels], stack: heapView(), hashMap: { ...freq } },
      highlights: [i],
      pointers: { op: i },
      message: `Operation ${i}: ${labels[i]}`,
      codeLine: op === 'push' ? 9 : 14,
      action: 'visit',
    });

    if (op === 'push' && val !== undefined) {
      const f = (freq[val] ?? 0) + 1;
      freq[val] = f;
      heap.push({ f, order, val });
      const stamp = order;
      order += 1;

      steps.push({
        state: { chars: [...labels], stack: heapView(), hashMap: { ...freq } },
        highlights: [i],
        pointers: { op: i },
        message: `Enqueue (freq ${f}, #${stamp}, value ${val}). The insertion stamp is what makes ties break toward the newest push — without it the heap could return the wrong copy.`,
        codeLine: 11,
        action: 'push',
      });
    } else if (op === 'pop') {
      const idx = nextIndex();
      const top = heap.splice(idx, 1)[0];
      freq[top.val] = top.f - 1;
      popped.push(top.val);

      steps.push({
        state: { chars: [...labels], stack: heapView(), hashMap: { ...freq }, result: top.val },
        highlights: [i],
        pointers: { op: i },
        message: `Highest priority entry is (freq ${top.f}, #${top.order}, value ${top.val}) — return ${top.val}. Its older, lower-frequency copies are still in the heap and will surface later.`,
        codeLine: 15,
        action: 'pop',
      });
    }
  }

  steps.push({
    state: { chars: [...labels], stack: heapView(), hashMap: { ...freq }, result: popped },
    highlights: [],
    message: `Pop order was [${popped.join(', ')}] — identical to the stack-of-stacks answer, but each operation costs O(log n) instead of O(1).`,
    codeLine: 17,
    action: 'found',
  });

  return steps;
}

export const maxFrequencyStack: Algorithm = {
  id: 'max-frequency-stack',
  name: 'Maximum Frequency Stack',
  category: 'Stack',
  difficulty: 'Hard',
  timeComplexity: 'O(1) per push and pop',
  spaceComplexity: 'O(n)',
  pattern: 'Stack of Stacks — bucket values by frequency, pop the top bucket',
  description:
    'Design a stack-like structure that pops the most frequent element. If several elements tie for the highest frequency, the one pushed most recently is removed first. Implement push(val) and pop().',
  problemUrl: 'https://leetcode.com/problems/maximum-frequency-stack/',
  code: {
    python: `class FreqStack:
    def __init__(self):
        self.freq = {}
        self.group = {}
        self.maxFreq = 0

    def push(self, val):
        f = self.freq.get(val, 0) + 1
        self.freq[val] = f
        self.maxFreq = max(self.maxFreq, f)
        self.group.setdefault(f, []).append(val)

    def pop(self):
        val = self.group[self.maxFreq].pop()
        self.freq[val] -= 1
        if not self.group[self.maxFreq]:
            self.maxFreq -= 1
        return val`,
    javascript: `class FreqStack {
    constructor() {
        this.freq = new Map();
        this.group = new Map();
        this.maxFreq = 0;
    }

    push(val) {
        const f = (this.freq.get(val) || 0) + 1;
        this.freq.set(val, f);
        this.maxFreq = Math.max(this.maxFreq, f);
        if (!this.group.has(f)) this.group.set(f, []);
        this.group.get(f).push(val);
    }

    pop() {
        const val = this.group.get(this.maxFreq).pop();
        this.freq.set(val, this.freq.get(val) - 1);
        if (this.group.get(this.maxFreq).length === 0) this.maxFreq--;
        return val;
    }
}`,
    java: `class FreqStack {
    private Map<Integer, Integer> freq = new HashMap<>();
    private Map<Integer, Deque<Integer>> group = new HashMap<>();
    private int maxFreq = 0;

    public void push(int val) {
        int f = freq.getOrDefault(val, 0) + 1;
        freq.put(val, f);
        maxFreq = Math.max(maxFreq, f);
        group.computeIfAbsent(f, k -> new ArrayDeque<>()).push(val);
    }

    public int pop() {
        int val = group.get(maxFreq).pop();
        freq.put(val, freq.get(val) - 1);
        if (group.get(maxFreq).isEmpty()) maxFreq--;
        return val;
    }
}`,
  },
  defaultInput: [
    ['push', 5],
    ['push', 7],
    ['push', 5],
    ['push', 7],
    ['push', 4],
    ['push', 5],
    ['pop'],
    ['pop'],
    ['pop'],
    ['pop'],
  ],
  run: runMaxFrequencyStack,
  optimalApproachName: 'Stack of Stacks',
  approaches: [
    {
      id: 'max-heap-priority',
      name: 'Max-Heap by (Freq, Order)',
      timeComplexity: 'O(log n) per push and pop',
      spaceComplexity: 'O(n)',
      description:
        'State the tie-breaking rule literally as a priority — a max-heap keyed by (frequency, insertion stamp) — instead of discovering that frequency buckets make it O(1).',
      code: {
        python: `import heapq

class FreqStack:
    def __init__(self):
        self.heap = []
        self.freq = {}
        self.order = 0

    def push(self, val):
        self.freq[val] = self.freq.get(val, 0) + 1
        heapq.heappush(self.heap, (-self.freq[val], -self.order, val))
        self.order += 1

    def pop(self):
        _, _, val = heapq.heappop(self.heap)
        self.freq[val] -= 1
        return val`,
        javascript: `class FreqStack {
    constructor() {
        this.heap = new MaxPriorityQueue({ compare: (a, b) => b[0] - a[0] || b[1] - a[1] });
        this.freq = new Map();
        this.order = 0;
    }

    push(val) {
        const f = (this.freq.get(val) || 0) + 1;
        this.freq.set(val, f);
        this.heap.enqueue([f, this.order++, val]);
    }

    pop() {
        const [f, , val] = this.heap.dequeue();
        this.freq.set(val, f - 1);
        return val;
    }
}`,
        java: `class FreqStack {
    private PriorityQueue<int[]> heap = new PriorityQueue<>(
        (a, b) -> a[0] != b[0] ? b[0] - a[0] : b[1] - a[1]
    );
    private Map<Integer, Integer> freq = new HashMap<>();
    private int order = 0;

    public void push(int val) {
        int f = freq.getOrDefault(val, 0) + 1;
        freq.put(val, f);
        heap.offer(new int[] { f, order++, val });
    }

    public int pop() {
        int[] top = heap.poll();
        freq.put(top[2], top[0] - 1);
        return top[2];
    }
}`,
      },
      run: runMaxFrequencyStackHeap,
      lineExplanations: {
        python: {
          1: "Python's heapq is a min-heap, so keys get negated",
          3: 'Define the FreqStack class',
          4: 'Constructor runs once before any operation',
          5: 'The priority queue of (freq, stamp, value) entries',
          6: 'How many times each value is currently present',
          7: 'Monotonic counter that stamps every push',
          9: 'Record one occurrence of val',
          10: 'This copy of val has a new, higher frequency',
          11: 'Negate both keys so the largest freq, then newest stamp, comes out first',
          12: 'Advance the stamp for the next push',
          14: 'Remove and return the highest-priority element',
          15: 'Heap top is exactly "most frequent, most recent"',
          16: 'That copy is gone, so the live count drops',
          17: 'Return the removed value',
        },
        javascript: {
          1: 'Define the FreqStack class',
          2: 'Constructor runs once before any operation',
          3: 'Max-heap ordered by frequency, then by insertion stamp',
          4: 'How many times each value is currently present',
          5: 'Monotonic counter that stamps every push',
          8: 'Record one occurrence of val',
          9: 'This copy of val has a new, higher frequency',
          10: 'Remember the new count',
          11: 'Enqueue the entry and advance the stamp',
          14: 'Remove and return the highest-priority element',
          15: 'Heap top is exactly "most frequent, most recent"',
          16: 'That copy is gone, so the live count drops',
          17: 'Return the removed value',
        },
        java: {
          1: 'Define the FreqStack class',
          2: 'Priority queue of {freq, stamp, value} triples',
          3: 'Order by higher frequency first, then by newer stamp',
          5: 'How many times each value is currently present',
          6: 'Monotonic counter that stamps every push',
          8: 'Record one occurrence of val',
          9: 'This copy of val has a new, higher frequency',
          10: 'Remember the new count',
          11: 'Offer the entry and advance the stamp',
          14: 'Remove and return the highest-priority element',
          15: 'Heap head is exactly "most frequent, most recent"',
          16: 'That copy is gone, so the live count drops',
          17: 'Return the removed value',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define the FreqStack class',
      2: 'Constructor runs once before any operation',
      3: 'How many times each value is currently present',
      4: 'group[f] is a stack of values that have reached frequency f',
      5: 'Highest frequency any value currently has',
      7: 'Add one occurrence of val',
      8: 'This copy pushes val to a new frequency level',
      9: 'Remember the new count',
      10: 'A push can raise maxFreq by at most 1',
      11: 'Record val on its level — earlier levels keep their copies',
      13: 'Remove and return the most frequent, most recent value',
      14: 'Top of the highest level is exactly that value',
      15: 'One copy is gone, so its live count drops',
      16: 'If that level just emptied...',
      17: '...maxFreq steps down by exactly one',
      18: 'Return the removed value',
    },
    javascript: {
      1: 'Define the FreqStack class',
      2: 'Constructor runs once before any operation',
      3: 'How many times each value is currently present',
      4: 'group[f] is a stack of values that have reached frequency f',
      5: 'Highest frequency any value currently has',
      8: 'Add one occurrence of val',
      9: 'This copy pushes val to a new frequency level',
      10: 'Remember the new count',
      11: 'A push can raise maxFreq by at most 1',
      12: 'Create the level lazily the first time it is reached',
      13: 'Record val on its level — earlier levels keep their copies',
      16: 'Remove and return the most frequent, most recent value',
      17: 'Top of the highest level is exactly that value',
      18: 'One copy is gone, so its live count drops',
      19: 'If that level just emptied, maxFreq steps down by one',
      20: 'Return the removed value',
    },
    java: {
      1: 'Define the FreqStack class',
      2: 'How many times each value is currently present',
      3: 'group[f] is a stack of values that have reached frequency f',
      4: 'Highest frequency any value currently has',
      6: 'Add one occurrence of val',
      7: 'This copy pushes val to a new frequency level',
      8: 'Remember the new count',
      9: 'A push can raise maxFreq by at most 1',
      10: 'Create the level lazily, then record val on it',
      13: 'Remove and return the most frequent, most recent value',
      14: 'Top of the highest level is exactly that value',
      15: 'One copy is gone, so its live count drops',
      16: 'If that level just emptied, maxFreq steps down by one',
      17: 'Return the removed value',
    },
  },
};
