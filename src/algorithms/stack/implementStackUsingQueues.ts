import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type StackOp = [string, number?];

const label = ([op, val]: StackOp) => (val !== undefined ? `${op}(${val})` : `${op}()`);

function runImplementStackUsingQueues(input: unknown): AlgorithmStep[] {
  const operations = input as StackOp[];
  const labels = operations.map(label);
  const steps: AlgorithmStep[] = [];
  const q: number[] = [];
  const outputs: (number | boolean)[] = [];

  steps.push({
    state: { chars: [...labels], queue: [] },
    highlights: [],
    message:
      'One queue is enough. The trick: after pushing x to the back, rotate every older element around behind it, so the newest element ends up at the FRONT — exactly where a queue lets you pop it in O(1).',
    codeLine: 5,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, val] = operations[i];

    if (op === 'push' && val !== undefined) {
      steps.push({
        state: { chars: [...labels], queue: [...q] },
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — a queue can only append at the back, so put ${val} there first and fix the order afterwards`,
        codeLine: 7,
        action: 'visit',
      });

      q.push(val);
      steps.push({
        state: { chars: [...labels], queue: [...q] },
        highlights: [i],
        pointers: { op: i },
        message: `Enqueue ${val} at the back: [${q.join(', ')}] (front is leftmost)`,
        codeLine: 8,
        action: 'push',
      });

      const rotations = q.length - 1;
      for (let r = 0; r < rotations; r++) {
        const moved = q.shift() as number;
        q.push(moved);
        steps.push({
          state: { chars: [...labels], queue: [...q] },
          highlights: [i],
          pointers: { op: i },
          message: `Rotation ${r + 1}/${rotations}: dequeue ${moved} from the front and re-enqueue it behind ${val} → [${q.join(', ')}]`,
          codeLine: 10,
          action: 'push',
        });
      }

      if (rotations === 0) {
        steps.push({
          state: { chars: [...labels], queue: [...q] },
          highlights: [i],
          pointers: { op: i },
          message: `Nothing older to rotate — ${val} is already at the front, so the queue reads top-first`,
          codeLine: 9,
        });
      }
    } else if (op === 'pop') {
      steps.push({
        state: { chars: [...labels], queue: [...q] },
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — the stack top is the queue front, so this is a plain dequeue`,
        codeLine: 12,
        action: 'visit',
      });

      const removed = q.shift() as number;
      outputs.push(removed);
      steps.push({
        state: { chars: [...labels], queue: [...q], result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `Dequeue the front: pop() = ${removed}. Queue is now [${q.join(', ')}] and still in top-first order.`,
        codeLine: 13,
        action: 'pop',
      });
    } else if (op === 'top') {
      steps.push({
        state: { chars: [...labels], queue: [...q] },
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — peek without removing`,
        codeLine: 15,
        action: 'visit',
      });

      const front = q[0];
      outputs.push(front);
      steps.push({
        state: { chars: [...labels], queue: [...q], result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `Front of the queue is ${front}, so top() = ${front} — the rotation on push already put it there`,
        codeLine: 16,
        action: 'found',
      });
    } else if (op === 'empty') {
      steps.push({
        state: { chars: [...labels], queue: [...q] },
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — nothing to rearrange, just check the size`,
        codeLine: 18,
        action: 'visit',
      });

      const isEmpty = q.length === 0;
      outputs.push(isEmpty);
      steps.push({
        state: { chars: [...labels], queue: [...q], result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `Queue holds ${q.length} element(s) → empty() = ${isEmpty}`,
        codeLine: 19,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { chars: [...labels], queue: [...q], result: [...outputs] },
    highlights: [],
    message: `All operations done. Push costs O(n) because of the rotation; pop, top and empty are all O(1). Outputs: [${outputs.join(', ')}]`,
    codeLine: 19,
  });

  return steps;
}

function runImplementStackUsingQueuesTwoQueues(input: unknown): AlgorithmStep[] {
  const operations = input as StackOp[];
  const labels = operations.map(label);
  const steps: AlgorithmStep[] = [];
  let q1: number[] = [];
  let q2: number[] = [];
  const outputs: (number | boolean)[] = [];

  steps.push({
    state: { chars: [...labels], queue: [] },
    highlights: [],
    message:
      'Two queues: q1 always holds the stack in top-first order (shown below), q2 is scratch space used only during a push.',
    codeLine: 5,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, val] = operations[i];

    if (op === 'push' && val !== undefined) {
      steps.push({
        state: { chars: [...labels], queue: [...q1] },
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — build the new order in q2 instead of rotating q1. q1 = [${q1.join(', ')}], q2 = []`,
        codeLine: 8,
        action: 'visit',
      });

      q2.push(val);
      steps.push({
        state: { chars: [...labels], queue: [...q1] },
        highlights: [i],
        pointers: { op: i },
        message: `Seed q2 with the new element first: q2 = [${q2.join(', ')}]. Whatever lands behind it is automatically older.`,
        codeLine: 9,
        action: 'push',
      });

      while (q1.length > 0) {
        const moved = q1.shift() as number;
        q2.push(moved);
        steps.push({
          state: { chars: [...labels], queue: [...q1] },
          highlights: [i],
          pointers: { op: i },
          message: `Drain ${moved} from q1 into q2 → q1 = [${q1.join(', ')}], q2 = [${q2.join(', ')}]`,
          codeLine: 11,
          action: 'pop',
        });
      }

      const tmp = q1;
      q1 = q2;
      q2 = tmp;
      steps.push({
        state: { chars: [...labels], queue: [...q1] },
        highlights: [i],
        pointers: { op: i },
        message: `Swap the names: q1 = [${q1.join(', ')}] (top-first), q2 = [] and ready for the next push`,
        codeLine: 12,
        action: 'push',
      });
    } else if (op === 'pop') {
      steps.push({
        state: { chars: [...labels], queue: [...q1] },
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — q1 is already ordered, so pop is a plain dequeue`,
        codeLine: 14,
        action: 'visit',
      });

      const removed = q1.shift() as number;
      outputs.push(removed);
      steps.push({
        state: { chars: [...labels], queue: [...q1], result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `Dequeue the front of q1: pop() = ${removed} → q1 = [${q1.join(', ')}]`,
        codeLine: 15,
        action: 'pop',
      });
    } else if (op === 'top') {
      steps.push({
        state: { chars: [...labels], queue: [...q1] },
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — peek the front of q1`,
        codeLine: 17,
        action: 'visit',
      });

      const front = q1[0];
      outputs.push(front);
      steps.push({
        state: { chars: [...labels], queue: [...q1], result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `top() = ${front} — no rearranging needed, the cost was already paid at push time`,
        codeLine: 18,
        action: 'found',
      });
    } else if (op === 'empty') {
      steps.push({
        state: { chars: [...labels], queue: [...q1] },
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — check whether q1 has anything left`,
        codeLine: 20,
        action: 'visit',
      });

      const isEmpty = q1.length === 0;
      outputs.push(isEmpty);
      steps.push({
        state: { chars: [...labels], queue: [...q1], result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `q1 holds ${q1.length} element(s) → empty() = ${isEmpty}`,
        codeLine: 21,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { chars: [...labels], queue: [...q1], result: [...outputs] },
    highlights: [],
    message: `Same outputs as the one-queue version — [${outputs.join(', ')}] — with the same O(n) push, but it needs a second queue instead of rotating in place.`,
    codeLine: 21,
  });

  return steps;
}

export const implementStackUsingQueues: Algorithm = {
  id: 'implement-stack-using-queues',
  name: 'Implement Stack Using Queues',
  category: 'Stack',
  difficulty: 'Easy',
  timeComplexity: 'O(n) push, O(1) pop/top/empty',
  spaceComplexity: 'O(n)',
  pattern: 'Queue Rotation — rotate after push so the newest sits in front',
  description:
    'Implement a last-in-first-out (LIFO) stack using only queue operations (enqueue at the back, dequeue from the front, peek front, size, is-empty). The stack must support push, pop, top, and empty.',
  problemUrl: 'https://leetcode.com/problems/implement-stack-using-queues/',
  code: {
    python: `from collections import deque

class MyStack:
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())

    def pop(self):
        return self.q.popleft()

    def top(self):
        return self.q[0]

    def empty(self):
        return len(self.q) == 0`,
    javascript: `class MyStack {
    constructor() {
        this.q = [];
    }

    push(x) {
        this.q.push(x);
        for (let i = 0; i < this.q.length - 1; i++) {
            this.q.push(this.q.shift());
        }
    }

    pop() {
        return this.q.shift();
    }

    top() {
        return this.q[0];
    }

    empty() {
        return this.q.length === 0;
    }
}`,
    java: `class MyStack {
    private Queue<Integer> q = new LinkedList<>();

    public void push(int x) {
        q.add(x);
        for (int i = 0; i < q.size() - 1; i++) {
            q.add(q.remove());
        }
    }

    public int pop() {
        return q.remove();
    }

    public int top() {
        return q.peek();
    }

    public boolean empty() {
        return q.isEmpty();
    }
}`,
  },
  defaultInput: [
    ['push', 1],
    ['push', 2],
    ['top'],
    ['pop'],
    ['push', 3],
    ['top'],
    ['pop'],
    ['pop'],
    ['empty'],
  ],
  run: runImplementStackUsingQueues,
  optimalApproachName: 'Single Queue Rotation',
  approaches: [
    {
      id: 'two-queues',
      name: 'Two Queues',
      timeComplexity: 'O(n) push, O(1) pop/top/empty',
      spaceComplexity: 'O(n)',
      description:
        'Instead of rotating one queue in place, seed a second queue with the new element and drain the first behind it, then swap the two queues.',
      code: {
        python: `from collections import deque

class MyStack:
    def __init__(self):
        self.q1 = deque()
        self.q2 = deque()

    def push(self, x):
        self.q2.append(x)
        while self.q1:
            self.q2.append(self.q1.popleft())
        self.q1, self.q2 = self.q2, self.q1

    def pop(self):
        return self.q1.popleft()

    def top(self):
        return self.q1[0]

    def empty(self):
        return len(self.q1) == 0`,
        javascript: `class MyStack {
    constructor() {
        this.q1 = [];
        this.q2 = [];
    }

    push(x) {
        this.q2.push(x);
        while (this.q1.length) {
            this.q2.push(this.q1.shift());
        }
        [this.q1, this.q2] = [this.q2, this.q1];
    }

    pop() {
        return this.q1.shift();
    }

    top() {
        return this.q1[0];
    }

    empty() {
        return this.q1.length === 0;
    }
}`,
        java: `class MyStack {
    private Queue<Integer> q1 = new LinkedList<>();
    private Queue<Integer> q2 = new LinkedList<>();

    public void push(int x) {
        q2.add(x);
        while (!q1.isEmpty()) {
            q2.add(q1.remove());
        }
        Queue<Integer> tmp = q1;
        q1 = q2;
        q2 = tmp;
    }

    public int pop() {
        return q1.remove();
    }

    public int top() {
        return q1.peek();
    }

    public boolean empty() {
        return q1.isEmpty();
    }
}`,
      },
      run: runImplementStackUsingQueuesTwoQueues,
      lineExplanations: {
        python: {
          1: 'deque gives O(1) enqueue at the back and dequeue from the front',
          3: 'Define the MyStack class',
          4: 'Constructor',
          5: 'q1 always holds the elements in stack (top-first) order',
          6: 'q2 is scratch space used only during push',
          8: 'Define push taking the new value',
          9: 'Put the new element into the empty q2 FIRST so it ends up in front',
          10: 'Drain everything still sitting in q1',
          11: 'Move each old element behind the new one',
          12: 'Swap the roles: q2 is now the ordered queue, q1 becomes scratch',
          14: 'Define pop',
          15: 'The stack top is the front of q1 — dequeue it',
          17: 'Define top',
          18: 'Peek the front of q1 without removing it',
          20: 'Define empty',
          21: 'The stack is empty exactly when q1 is',
        },
        javascript: {
          1: 'Define the MyStack class',
          2: 'Constructor',
          3: 'q1 always holds the elements in stack (top-first) order',
          4: 'q2 is scratch space used only during push',
          7: 'Define push taking the new value',
          8: 'Put the new element into the empty q2 FIRST so it ends up in front',
          9: 'Drain everything still sitting in q1',
          10: 'Move each old element behind the new one',
          12: 'Swap the roles: q2 is now the ordered queue, q1 becomes scratch',
          15: 'Define pop',
          16: 'The stack top is the front of q1 — dequeue it',
          19: 'Define top',
          20: 'Peek the front of q1 without removing it',
          23: 'Define empty',
          24: 'The stack is empty exactly when q1 is',
        },
        java: {
          1: 'Define the MyStack class',
          2: 'q1 always holds the elements in stack (top-first) order',
          3: 'q2 is scratch space used only during push',
          5: 'Define push taking the new value',
          6: 'Put the new element into the empty q2 FIRST so it ends up in front',
          7: 'Drain everything still sitting in q1',
          8: 'Move each old element behind the new one',
          10: 'Swap the roles of the two queues',
          11: 'q2 (with the new order) becomes q1',
          12: 'The old q1, now empty, becomes scratch',
          15: 'Define pop',
          16: 'The stack top is the front of q1 — dequeue it',
          19: 'Define top',
          20: 'Peek the front of q1 without removing it',
          23: 'Define empty',
          24: 'The stack is empty exactly when q1 is',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'deque gives O(1) enqueue at the back and dequeue from the front',
      3: 'Define the MyStack class',
      4: 'Constructor',
      5: 'A single queue is all the storage we need',
      7: 'Define push taking the new value',
      8: 'Enqueue the new element at the back (the only place a queue allows)',
      9: 'Rotate every OTHER element once — size minus one moves',
      10: 'Dequeue from the front and re-enqueue at the back, sliding the new element to the front',
      12: 'Define pop',
      13: 'After the rotation the stack top is the queue front — dequeue it',
      15: 'Define top',
      16: 'Peek the queue front without removing it',
      18: 'Define empty',
      19: 'The stack is empty exactly when the queue is',
    },
    javascript: {
      1: 'Define the MyStack class',
      2: 'Constructor',
      3: 'A single array used strictly as a queue (push to back, shift from front)',
      6: 'Define push taking the new value',
      7: 'Enqueue the new element at the back',
      8: 'Rotate every OTHER element once — length minus one moves',
      9: 'Dequeue from the front and re-enqueue at the back',
      13: 'Define pop',
      14: 'The stack top is the queue front — dequeue it',
      17: 'Define top',
      18: 'Peek the queue front without removing it',
      21: 'Define empty',
      22: 'The stack is empty exactly when the queue is',
    },
    java: {
      1: 'Define the MyStack class',
      2: 'A single queue is all the storage we need',
      4: 'Define push taking the new value',
      5: 'Enqueue the new element at the back',
      6: 'Rotate every OTHER element once — size minus one moves',
      7: 'Dequeue from the front and re-enqueue at the back',
      11: 'Define pop',
      12: 'The stack top is the queue front — remove it',
      15: 'Define top',
      16: 'Peek the queue front without removing it',
      19: 'Define empty',
      20: 'The stack is empty exactly when the queue is',
    },
  },
};
