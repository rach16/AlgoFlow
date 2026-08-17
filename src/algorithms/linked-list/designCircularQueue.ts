import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type Operation = [string, ...number[]];

const CAPACITY = 3;

function runDesignCircularQueue(input: unknown): AlgorithmStep[] {
  const operations = input as Operation[];
  const steps: AlgorithmStep[] = [];

  const q: number[] = new Array(CAPACITY).fill(0);
  let head = 0;
  let size = 0;
  const results: (number | boolean)[] = [];

  const occupied = (i: number) => {
    for (let t = 0; t < size; t++) if ((head + t) % CAPACITY === i) return true;
    return false;
  };
  const slots = () =>
    Array.from({ length: CAPACITY }, (_, i) => ({
      val: (occupied(i) ? q[i] : '·') as number | string,
      id: i,
    }));
  const liveIdx = () => Array.from({ length: size }, (_, t) => (head + t) % CAPACITY);
  const ptrs = () =>
    size === 0
      ? { head }
      : { head, rear: (head + size - 1) % CAPACITY };

  steps.push({
    state: {
      linkedList: slots(),
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: { head },
    },
    highlights: [],
    message: `Circular queue of capacity ${CAPACITY} on a FIXED array. Nothing ever shifts — only head and size move, and modulo wraps the indices around.`,
    codeLine: 3,
  });

  for (let opIdx = 0; opIdx < operations.length; opIdx++) {
    const [name, arg] = operations[opIdx];

    if (name === 'enQueue') {
      if (size === CAPACITY) {
        results.push(false);
        steps.push({
          state: {
            linkedList: slots(),
            linkedListHighlights: liveIdx(),
            linkedListSecondary: [],
            linkedListPointers: ptrs(),
          },
          highlights: liveIdx(),
          message: `Op ${opIdx + 1}: enQueue(${arg}) — size ${size} == capacity ${CAPACITY}, so the queue is full. Return false, change nothing.`,
          codeLine: 10,
          action: 'compare',
        });
        continue;
      }

      const tail = (head + size) % CAPACITY;
      steps.push({
        state: {
          linkedList: slots(),
          linkedListHighlights: liveIdx(),
          linkedListSecondary: [tail],
          linkedListPointers: { ...ptrs(), tail },
        },
        highlights: liveIdx(),
        secondary: [tail],
        message: `Op ${opIdx + 1}: enQueue(${arg}). Write slot = (head ${head} + size ${size}) % ${CAPACITY} = ${tail}${tail < head ? ' — it wrapped past the end of the array' : ''}.`,
        codeLine: 11,
        action: 'visit',
      });

      q[tail] = arg;
      size++;
      results.push(true);

      steps.push({
        state: {
          linkedList: slots(),
          linkedListHighlights: liveIdx(),
          linkedListSecondary: [tail],
          linkedListPointers: ptrs(),
        },
        highlights: [tail],
        message: `Stored ${arg} at slot ${tail}, size = ${size}. Return true.`,
        codeLine: 13,
        action: 'insert',
      });
    } else if (name === 'deQueue') {
      if (size === 0) {
        results.push(false);
        steps.push({
          state: {
            linkedList: slots(),
            linkedListHighlights: [],
            linkedListSecondary: [],
            linkedListPointers: { head },
          },
          highlights: [],
          message: `Op ${opIdx + 1}: deQueue() on an empty queue — return false.`,
          codeLine: 18,
          action: 'compare',
        });
        continue;
      }

      const old = head;
      steps.push({
        state: {
          linkedList: slots(),
          linkedListHighlights: [old],
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: [old],
        message: `Op ${opIdx + 1}: deQueue(). Front value ${q[old]} sits at slot ${old} — no data is erased, we just move head.`,
        codeLine: 19,
        action: 'visit',
      });

      head = (head + 1) % CAPACITY;
      size--;
      results.push(true);

      steps.push({
        state: {
          linkedList: slots(),
          linkedListHighlights: liveIdx(),
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: liveIdx(),
        message: `head = (${old} + 1) % ${CAPACITY} = ${head}, size = ${size}. Slot ${old} is now free for reuse. Return true.`,
        codeLine: 21,
        action: 'delete',
      });
    } else if (name === 'Rear') {
      const idx = size === 0 ? -1 : (head + size - 1) % CAPACITY;
      const value = idx === -1 ? -1 : q[idx];
      results.push(value);
      steps.push({
        state: {
          linkedList: slots(),
          linkedListHighlights: idx >= 0 ? [idx] : [],
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: idx >= 0 ? [idx] : [],
        message: `Op ${opIdx + 1}: Rear() = q[(head ${head} + size ${size} - 1) % ${CAPACITY}] = q[${idx}] = ${value}. O(1), no traversal.`,
        codeLine: 29,
        action: 'found',
      });
    } else if (name === 'Front') {
      const value = size === 0 ? -1 : q[head];
      results.push(value);
      steps.push({
        state: {
          linkedList: slots(),
          linkedListHighlights: size > 0 ? [head] : [],
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: size > 0 ? [head] : [],
        message: `Op ${opIdx + 1}: Front() = q[head] = q[${head}] = ${value}.`,
        codeLine: 24,
        action: 'found',
      });
    } else if (name === 'isFull') {
      const value = size === CAPACITY;
      results.push(value);
      steps.push({
        state: {
          linkedList: slots(),
          linkedListHighlights: liveIdx(),
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: liveIdx(),
        message: `Op ${opIdx + 1}: isFull() — size ${size} vs capacity ${CAPACITY} → ${value}. The size counter is what makes full and empty distinguishable.`,
        codeLine: 35,
        action: 'compare',
      });
    } else if (name === 'isEmpty') {
      const value = size === 0;
      results.push(value);
      steps.push({
        state: {
          linkedList: slots(),
          linkedListHighlights: liveIdx(),
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: liveIdx(),
        message: `Op ${opIdx + 1}: isEmpty() — size ${size} → ${value}.`,
        codeLine: 32,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: {
      linkedList: slots(),
      linkedListHighlights: liveIdx(),
      linkedListSecondary: [],
      linkedListPointers: ptrs(),
      result: results.join(', '),
    },
    highlights: liveIdx(),
    message: `All ops done. Outputs: [${results.join(', ')}]. Every operation was O(1) and the array was never resized or shifted.`,
    codeLine: 35,
    action: 'found',
  });

  return steps;
}

function runDesignCircularQueueNodes(input: unknown): AlgorithmStep[] {
  const operations = input as Operation[];
  const steps: AlgorithmStep[] = [];
  let nodeId = 0;

  const nodes: { val: number | string; id: number }[] = [];
  const results: (number | boolean)[] = [];

  const show = () => nodes.map((n) => ({ ...n }));
  const ptrs = () =>
    nodes.length === 0 ? {} : { head: 0, tail: nodes.length - 1 };

  steps.push({
    state: {
      linkedList: [],
      linkedListHighlights: [],
      linkedListSecondary: [],
      linkedListPointers: {},
    },
    highlights: [],
    message: `Same queue, built from linked nodes instead of a fixed array: head, tail and an explicit size counter (capacity ${CAPACITY}). No modulo needed — but every node is a separate allocation.`,
    codeLine: 3,
  });

  for (let opIdx = 0; opIdx < operations.length; opIdx++) {
    const [name, arg] = operations[opIdx];

    if (name === 'enQueue') {
      if (nodes.length === CAPACITY) {
        results.push(false);
        steps.push({
          state: {
            linkedList: show(),
            linkedListHighlights: nodes.map((_, i) => i),
            linkedListSecondary: [],
            linkedListPointers: ptrs(),
          },
          highlights: nodes.map((_, i) => i),
          message: `Op ${opIdx + 1}: enQueue(${arg}) — size ${nodes.length} == capacity ${CAPACITY}. Without the size counter a linked queue could not tell full from empty. Return false.`,
          codeLine: 10,
          action: 'compare',
        });
        continue;
      }

      const wasEmpty = nodes.length === 0;
      nodes.push({ val: arg, id: nodeId++ });
      results.push(true);

      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: [nodes.length - 1],
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: [nodes.length - 1],
        message: wasEmpty
          ? `Op ${opIdx + 1}: enQueue(${arg}) — list was empty, so head and tail both point at the new node. size = 1. Return true.`
          : `Op ${opIdx + 1}: enQueue(${arg}) — tail.next = new node, then tail moves to it. size = ${nodes.length}. Return true.`,
        codeLine: wasEmpty ? 13 : 16,
        action: 'insert',
      });
    } else if (name === 'deQueue') {
      if (nodes.length === 0) {
        results.push(false);
        steps.push({
          state: {
            linkedList: show(),
            linkedListHighlights: [],
            linkedListSecondary: [],
            linkedListPointers: {},
          },
          highlights: [],
          message: `Op ${opIdx + 1}: deQueue() on an empty queue — return false.`,
          codeLine: 22,
          action: 'compare',
        });
        continue;
      }

      const front = nodes[0];
      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: [0],
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: [0],
        message: `Op ${opIdx + 1}: deQueue(). head points at node ${front.val} — unlink it by moving head to head.next.`,
        codeLine: 23,
        action: 'visit',
      });

      nodes.shift();
      results.push(true);

      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: nodes.map((_, i) => i),
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: nodes.map((_, i) => i),
        message: `Node ${front.val} is dropped (the garbage collector reclaims it — the array version simply reuses the slot). size = ${nodes.length}. Return true.`,
        codeLine: 26,
        action: 'delete',
      });
    } else if (name === 'Rear') {
      const value = nodes.length === 0 ? -1 : (nodes[nodes.length - 1].val as number);
      results.push(value);
      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: nodes.length ? [nodes.length - 1] : [],
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: nodes.length ? [nodes.length - 1] : [],
        message: `Op ${opIdx + 1}: Rear() = tail.val = ${value}. O(1) only because we keep an explicit tail pointer.`,
        codeLine: 33,
        action: 'found',
      });
    } else if (name === 'Front') {
      const value = nodes.length === 0 ? -1 : (nodes[0].val as number);
      results.push(value);
      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: nodes.length ? [0] : [],
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: nodes.length ? [0] : [],
        message: `Op ${opIdx + 1}: Front() = head.val = ${value}.`,
        codeLine: 30,
        action: 'found',
      });
    } else if (name === 'isFull') {
      const value = nodes.length === CAPACITY;
      results.push(value);
      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: nodes.map((_, i) => i),
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: nodes.map((_, i) => i),
        message: `Op ${opIdx + 1}: isFull() — size ${nodes.length} vs capacity ${CAPACITY} → ${value}.`,
        codeLine: 39,
        action: 'compare',
      });
    } else if (name === 'isEmpty') {
      const value = nodes.length === 0;
      results.push(value);
      steps.push({
        state: {
          linkedList: show(),
          linkedListHighlights: nodes.map((_, i) => i),
          linkedListSecondary: [],
          linkedListPointers: ptrs(),
        },
        highlights: nodes.map((_, i) => i),
        message: `Op ${opIdx + 1}: isEmpty() — size ${nodes.length} → ${value}.`,
        codeLine: 36,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: {
      linkedList: show(),
      linkedListHighlights: nodes.map((_, i) => i),
      linkedListSecondary: [],
      linkedListPointers: ptrs(),
      result: results.join(', '),
    },
    highlights: nodes.map((_, i) => i),
    message: `All ops done. Outputs: [${results.join(', ')}] — identical to the array version, still O(1) per op, but it allocates and frees a node on every push and pop.`,
    codeLine: 39,
    action: 'found',
  });

  return steps;
}

export const designCircularQueue: Algorithm = {
  id: 'design-circular-queue',
  name: 'Design Circular Queue',
  category: 'Linked List',
  difficulty: 'Medium',
  timeComplexity: 'O(1) per operation',
  spaceComplexity: 'O(k)',
  pattern: 'Ring Buffer — fixed array with head index and modulo wraparound',
  description:
    'Design a circular queue of fixed size k supporting enQueue, deQueue, Front, Rear, isEmpty and isFull. The unused space in front of the queue must be reusable, so the buffer wraps around instead of shifting elements.',
  problemUrl: 'https://leetcode.com/problems/design-circular-queue/',
  code: {
    python: `class MyCircularQueue:
    def __init__(self, k):
        self.q = [0] * k
        self.size = 0
        self.head = 0
        self.capacity = k

    def enQueue(self, value):
        if self.size == self.capacity:
            return False
        tail = (self.head + self.size) % self.capacity
        self.q[tail] = value
        self.size += 1
        return True

    def deQueue(self):
        if self.size == 0:
            return False
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return True

    def Front(self):
        return -1 if self.size == 0 else self.q[self.head]

    def Rear(self):
        if self.size == 0:
            return -1
        return self.q[(self.head + self.size - 1) % self.capacity]

    def isEmpty(self):
        return self.size == 0

    def isFull(self):
        return self.size == self.capacity`,
    javascript: `class MyCircularQueue {
    constructor(k) {
        this.q = new Array(k).fill(0);
        this.size = 0;
        this.head = 0;
        this.capacity = k;
    }

    enQueue(value) {
        if (this.size === this.capacity) {
            return false;
        }
        const tail = (this.head + this.size) % this.capacity;
        this.q[tail] = value;
        this.size++;
        return true;
    }

    deQueue() {
        if (this.size === 0) {
            return false;
        }
        this.head = (this.head + 1) % this.capacity;
        this.size--;
        return true;
    }

    Front() {
        return this.size === 0 ? -1 : this.q[this.head];
    }

    Rear() {
        if (this.size === 0) {
            return -1;
        }
        return this.q[(this.head + this.size - 1) % this.capacity];
    }

    isEmpty() {
        return this.size === 0;
    }

    isFull() {
        return this.size === this.capacity;
    }
}`,
    java: `class MyCircularQueue {
    private int[] q;
    private int size;
    private int head;
    private int capacity;

    public MyCircularQueue(int k) {
        q = new int[k];
        size = 0;
        head = 0;
        capacity = k;
    }

    public boolean enQueue(int value) {
        if (size == capacity) {
            return false;
        }
        int tail = (head + size) % capacity;
        q[tail] = value;
        size++;
        return true;
    }

    public boolean deQueue() {
        if (size == 0) {
            return false;
        }
        head = (head + 1) % capacity;
        size--;
        return true;
    }

    public int Front() {
        return size == 0 ? -1 : q[head];
    }

    public int Rear() {
        if (size == 0) {
            return -1;
        }
        return q[(head + size - 1) % capacity];
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public boolean isFull() {
        return size == capacity;
    }
}`,
  },
  defaultInput: [
    ['enQueue', 1],
    ['enQueue', 2],
    ['enQueue', 3],
    ['enQueue', 4],
    ['Rear'],
    ['isFull'],
    ['deQueue'],
    ['enQueue', 4],
    ['Rear'],
  ],
  run: runDesignCircularQueue,
  optimalApproachName: 'Fixed Array + Modulo',
  approaches: [
    {
      id: 'linked-nodes-counter',
      name: 'Linked Nodes + Size Counter',
      timeComplexity: 'O(1) per operation',
      spaceComplexity: 'O(k)',
      description:
        'Keep head and tail node pointers plus a size counter instead of a ring buffer — no modulo arithmetic, but it allocates a node per push and loses the cache-friendly contiguous storage.',
      code: {
        python: `class MyCircularQueue:
    def __init__(self, k):
        self.head = None
        self.tail = None
        self.size = 0
        self.capacity = k

    def enQueue(self, value):
        if self.size == self.capacity:
            return False
        node = Node(value)
        if self.head is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node
        self.size += 1
        return True

    def deQueue(self):
        if self.size == 0:
            return False
        self.head = self.head.next
        if self.head is None:
            self.tail = None
        self.size -= 1
        return True

    def Front(self):
        return -1 if self.head is None else self.head.val

    def Rear(self):
        return -1 if self.tail is None else self.tail.val

    def isEmpty(self):
        return self.size == 0

    def isFull(self):
        return self.size == self.capacity`,
        javascript: `class MyCircularQueue {
    constructor(k) {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.capacity = k;
    }

    enQueue(value) {
        if (this.size === this.capacity) {
            return false;
        }
        const node = { val: value, next: null };
        if (this.head === null) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.next = node;
            this.tail = node;
        }
        this.size++;
        return true;
    }

    deQueue() {
        if (this.size === 0) {
            return false;
        }
        this.head = this.head.next;
        if (this.head === null) {
            this.tail = null;
        }
        this.size--;
        return true;
    }

    Front() {
        return this.head === null ? -1 : this.head.val;
    }

    Rear() {
        return this.tail === null ? -1 : this.tail.val;
    }

    isEmpty() {
        return this.size === 0;
    }

    isFull() {
        return this.size === this.capacity;
    }
}`,
        java: `class MyCircularQueue {
    private class Node {
        int val;
        Node next;

        Node(int val) {
            this.val = val;
        }
    }

    private Node head;
    private Node tail;
    private int size;
    private int capacity;

    public MyCircularQueue(int k) {
        capacity = k;
    }

    public boolean enQueue(int value) {
        if (size == capacity) {
            return false;
        }
        Node node = new Node(value);
        if (head == null) {
            head = node;
            tail = node;
        } else {
            tail.next = node;
            tail = node;
        }
        size++;
        return true;
    }

    public boolean deQueue() {
        if (size == 0) {
            return false;
        }
        head = head.next;
        if (head == null) {
            tail = null;
        }
        size--;
        return true;
    }

    public int Front() {
        return head == null ? -1 : head.val;
    }

    public int Rear() {
        return tail == null ? -1 : tail.val;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public boolean isFull() {
        return size == capacity;
    }
}`,
      },
      run: runDesignCircularQueueNodes,
      lineExplanations: {
        python: {
          1: 'Linked-node version of the circular queue',
          2: 'Constructor takes the fixed capacity k',
          3: 'Front node pointer',
          4: 'Back node pointer — keeps Rear() at O(1)',
          5: 'Explicit size counter (full vs empty is otherwise ambiguous)',
          6: 'Remember the capacity limit',
          8: 'Add a value at the back',
          9: 'Reject when already at capacity',
          10: 'Return False without touching the list',
          11: 'Allocate a fresh node',
          12: 'Is the queue currently empty?',
          13: 'Then head and tail are the same node',
          14: 'Otherwise append behind the current tail',
          15: 'Old tail links to the new node',
          16: 'tail moves to the new node',
          17: 'One more element',
          18: 'Return True',
          20: 'Remove the front value',
          21: 'Nothing to remove?',
          22: 'Return False',
          23: 'Unlink the front node',
          24: 'Did the queue just become empty?',
          25: 'Then tail must be cleared too',
          26: 'One fewer element',
          27: 'Return True',
          29: 'Front value',
          30: 'head.val, or -1 when empty',
          32: 'Back value',
          33: 'tail.val, or -1 when empty',
          35: 'Emptiness test',
          36: 'Size counter answers it directly',
          38: 'Fullness test',
          39: 'Compare size with capacity',
        },
        javascript: {
          1: 'Linked-node version of the circular queue',
          2: 'Constructor takes the fixed capacity k',
          3: 'Front node pointer',
          4: 'Back node pointer — keeps Rear() at O(1)',
          5: 'Explicit size counter',
          6: 'Remember the capacity limit',
          9: 'Add a value at the back',
          10: 'Reject when already at capacity',
          11: 'Return false without touching the list',
          13: 'Allocate a fresh node',
          14: 'Is the queue currently empty?',
          15: 'head points at the new node',
          16: 'so does tail',
          18: 'Otherwise the old tail links forward',
          19: 'tail moves to the new node',
          21: 'One more element',
          22: 'Return true',
          25: 'Remove the front value',
          26: 'Nothing to remove?',
          27: 'Return false',
          29: 'Unlink the front node',
          30: 'Did the queue just become empty?',
          31: 'Then tail must be cleared too',
          33: 'One fewer element',
          34: 'Return true',
          37: 'Front value',
          38: 'head.val, or -1 when empty',
          41: 'Back value',
          42: 'tail.val, or -1 when empty',
          45: 'Emptiness test',
          46: 'Size counter answers it directly',
          49: 'Fullness test',
          50: 'Compare size with capacity',
        },
        java: {
          1: 'Linked-node version of the circular queue',
          2: 'Inner node type',
          3: 'Stored value',
          4: 'Link to the next node',
          6: 'Node constructor',
          7: 'Store the value',
          11: 'Front node pointer',
          12: 'Back node pointer — keeps Rear() at O(1)',
          13: 'Explicit size counter',
          14: 'Capacity limit',
          16: 'Constructor takes the fixed capacity k',
          17: 'Remember the capacity',
          20: 'Add a value at the back',
          21: 'Reject when already at capacity',
          22: 'Return false without touching the list',
          24: 'Allocate a fresh node',
          25: 'Is the queue currently empty?',
          26: 'head points at the new node',
          27: 'so does tail',
          29: 'Otherwise the old tail links forward',
          30: 'tail moves to the new node',
          32: 'One more element',
          33: 'Return true',
          36: 'Remove the front value',
          37: 'Nothing to remove?',
          38: 'Return false',
          40: 'Unlink the front node',
          41: 'Did the queue just become empty?',
          42: 'Then tail must be cleared too',
          44: 'One fewer element',
          45: 'Return true',
          48: 'Front value',
          49: 'head.val, or -1 when empty',
          52: 'Back value',
          53: 'tail.val, or -1 when empty',
          56: 'Emptiness test',
          57: 'Size counter answers it directly',
          60: 'Fullness test',
          61: 'Compare size with capacity',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Circular queue backed by one fixed array',
      2: 'Constructor takes the fixed capacity k',
      3: 'Pre-allocate all k slots — the array never grows',
      4: 'Live element count',
      5: 'Index of the front element',
      6: 'Remember the capacity limit',
      8: 'Add a value at the back',
      9: 'Reject when size already equals capacity',
      10: 'Return False without touching the array',
      11: 'Write index wraps around with modulo',
      12: 'Store the value in that slot',
      13: 'One more element',
      14: 'Return True',
      16: 'Remove the front value',
      17: 'Nothing to remove?',
      18: 'Return False',
      19: 'Just advance head — no data is erased or shifted',
      20: 'One fewer element',
      21: 'Return True',
      23: 'Front value',
      24: 'The slot head points at, or -1 when empty',
      26: 'Back value',
      27: 'Empty queue has no rear',
      28: 'Return -1',
      29: 'Last live slot is head + size - 1, wrapped',
      31: 'Emptiness test',
      32: 'Size counter answers it directly',
      34: 'Fullness test',
      35: 'Compare size with capacity — this is why head == tail is not ambiguous',
    },
    javascript: {
      1: 'Circular queue backed by one fixed array',
      2: 'Constructor takes the fixed capacity k',
      3: 'Pre-allocate all k slots — the array never grows',
      4: 'Live element count',
      5: 'Index of the front element',
      6: 'Remember the capacity limit',
      9: 'Add a value at the back',
      10: 'Reject when size already equals capacity',
      11: 'Return false without touching the array',
      13: 'Write index wraps around with modulo',
      14: 'Store the value in that slot',
      15: 'One more element',
      16: 'Return true',
      19: 'Remove the front value',
      20: 'Nothing to remove?',
      21: 'Return false',
      23: 'Just advance head — no data is erased or shifted',
      24: 'One fewer element',
      25: 'Return true',
      28: 'Front value',
      29: 'The slot head points at, or -1 when empty',
      32: 'Back value',
      33: 'Empty queue has no rear',
      34: 'Return -1',
      36: 'Last live slot is head + size - 1, wrapped',
      39: 'Emptiness test',
      40: 'Size counter answers it directly',
      43: 'Fullness test',
      44: 'Compare size with capacity',
    },
    java: {
      1: 'Circular queue backed by one fixed array',
      2: 'The fixed storage array',
      3: 'Live element count',
      4: 'Index of the front element',
      5: 'Capacity limit',
      7: 'Constructor takes the fixed capacity k',
      8: 'Pre-allocate all k slots — the array never grows',
      9: 'Start empty',
      10: 'Front starts at index 0',
      11: 'Remember the capacity',
      14: 'Add a value at the back',
      15: 'Reject when size already equals capacity',
      16: 'Return false without touching the array',
      18: 'Write index wraps around with modulo',
      19: 'Store the value in that slot',
      20: 'One more element',
      21: 'Return true',
      24: 'Remove the front value',
      25: 'Nothing to remove?',
      26: 'Return false',
      28: 'Just advance head — no data is erased or shifted',
      29: 'One fewer element',
      30: 'Return true',
      33: 'Front value',
      34: 'The slot head points at, or -1 when empty',
      37: 'Back value',
      38: 'Empty queue has no rear',
      39: 'Return -1',
      41: 'Last live slot is head + size - 1, wrapped',
      44: 'Emptiness test',
      45: 'Size counter answers it directly',
      48: 'Fullness test',
      49: 'Compare size with capacity',
    },
  },
};
