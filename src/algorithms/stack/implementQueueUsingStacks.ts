import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type QueueOp = [string, number?];

const label = ([op, val]: QueueOp) => (val !== undefined ? `${op}(${val})` : `${op}()`);

function runImplementQueueUsingStacks(input: unknown): AlgorithmStep[] {
  const operations = input as QueueOp[];
  const labels = operations.map(label);
  const steps: AlgorithmStep[] = [];
  const inStack: number[] = [];
  const outStack: number[] = [];
  const outputs: (number | boolean)[] = [];

  const snapshot = () => ({
    chars: [...labels],
    stack: [...inStack],
    queue: [...outStack],
  });

  steps.push({
    state: snapshot(),
    highlights: [],
    message:
      'Two stacks. New elements pile onto the INPUT stack; pouring that pile into the OUTPUT stack reverses it, so the oldest element ends up on top — which is exactly queue order.',
    codeLine: 3,
  });

  // Refill the output stack from the input stack when needed. Emits steps.
  const transferIfNeeded = (i: number) => {
    if (outStack.length > 0) {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `Output stack already holds [${outStack.join(', ')}] with ${outStack[outStack.length - 1]} on top — it is still in queue order, so do NOT transfer`,
        codeLine: 14,
        action: 'compare',
      });
      return;
    }
    steps.push({
      state: snapshot(),
      highlights: [i],
      pointers: { op: i },
      message: `Output stack is empty — time to pour the input stack [${inStack.join(', ')}] across, which reverses it`,
      codeLine: 15,
      action: 'compare',
    });
    while (inStack.length > 0) {
      const moved = inStack.pop() as number;
      outStack.push(moved);
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `Pop ${moved} off input, push it onto output → input [${inStack.join(', ')}], output [${outStack.join(', ')}] (top = ${outStack[outStack.length - 1]})`,
        codeLine: 16,
        action: 'push',
      });
    }
  };

  for (let i = 0; i < operations.length; i++) {
    const [op, val] = operations[i];

    if (op === 'push' && val !== undefined) {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — arrivals always go on the input stack, nothing else to do`,
        codeLine: 6,
        action: 'visit',
      });

      inStack.push(val);
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `Push ${val} onto the input stack: [${inStack.join(', ')}]. O(1) — the reordering cost is deferred.`,
        codeLine: 7,
        action: 'push',
      });
    } else if (op === 'peek') {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — the front of the queue lives on top of the output stack`,
        codeLine: 13,
        action: 'visit',
      });

      transferIfNeeded(i);
      const front = outStack[outStack.length - 1];
      outputs.push(front);
      steps.push({
        state: { ...snapshot(), result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `peek() = ${front} — top of the output stack, left in place`,
        codeLine: 17,
        action: 'found',
      });
    } else if (op === 'pop') {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — make sure the output stack is loaded, then take its top`,
        codeLine: 9,
        action: 'visit',
      });

      transferIfNeeded(i);
      const removed = outStack.pop() as number;
      outputs.push(removed);
      steps.push({
        state: { ...snapshot(), result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `pop() = ${removed}. Each element is moved across at most once, so pops are O(1) amortized even though a single pop can cost O(n).`,
        codeLine: 11,
        action: 'pop',
      });
    } else if (op === 'empty') {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — the queue is empty only if BOTH stacks are`,
        codeLine: 19,
        action: 'visit',
      });

      const isEmpty = inStack.length === 0 && outStack.length === 0;
      outputs.push(isEmpty);
      steps.push({
        state: { ...snapshot(), result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `input has ${inStack.length}, output has ${outStack.length} → empty() = ${isEmpty}`,
        codeLine: 20,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { ...snapshot(), result: [...outputs] },
    highlights: [],
    message: `All operations done. Push is O(1); pop and peek are O(1) amortized. Outputs: [${outputs.join(', ')}]`,
    codeLine: 20,
  });

  return steps;
}

function runImplementQueueUsingStacksCostlyPush(input: unknown): AlgorithmStep[] {
  const operations = input as QueueOp[];
  const labels = operations.map(label);
  const steps: AlgorithmStep[] = [];
  const s1: number[] = [];
  const s2: number[] = [];
  const outputs: (number | boolean)[] = [];

  const snapshot = () => ({ chars: [...labels], stack: [...s1] });

  steps.push({
    state: snapshot(),
    highlights: [],
    message:
      'Pay the cost up front instead. s1 is kept permanently in queue order (front on TOP), so pop and peek are always plain O(1) stack operations.',
    codeLine: 3,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, val] = operations[i];

    if (op === 'push' && val !== undefined) {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — the newest element must end up at the BOTTOM of s1, so empty s1 into the helper s2 first`,
        codeLine: 6,
        action: 'visit',
      });

      while (s1.length > 0) {
        const moved = s1.pop() as number;
        s2.push(moved);
        steps.push({
          state: snapshot(),
          highlights: [i],
          pointers: { op: i },
          message: `Move ${moved} from s1 to s2 → s1 [${s1.join(', ')}], s2 [${s2.join(', ')}]`,
          codeLine: 8,
          action: 'pop',
        });
      }

      s1.push(val);
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `s1 is empty, so push ${val} onto the bare bottom — it is now the last in line`,
        codeLine: 9,
        action: 'push',
      });

      while (s2.length > 0) {
        const moved = s2.pop() as number;
        s1.push(moved);
        steps.push({
          state: snapshot(),
          highlights: [i],
          pointers: { op: i },
          message: `Pour ${moved} back onto s1 → s1 [${s1.join(', ')}] (top = ${s1[s1.length - 1]}, the queue front)`,
          codeLine: 11,
          action: 'push',
        });
      }
    } else if (op === 'peek') {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — no shuffling needed, s1 is already ordered`,
        codeLine: 16,
        action: 'visit',
      });

      const front = s1[s1.length - 1];
      outputs.push(front);
      steps.push({
        state: { ...snapshot(), result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `peek() = ${front} — just the top of s1`,
        codeLine: 17,
        action: 'found',
      });
    } else if (op === 'pop') {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — again no shuffling, the front is on top`,
        codeLine: 13,
        action: 'visit',
      });

      const removed = s1.pop() as number;
      outputs.push(removed);
      steps.push({
        state: { ...snapshot(), result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `pop() = ${removed} → s1 [${s1.join(', ')}]. Worst case O(1) here, unlike the amortized version.`,
        codeLine: 14,
        action: 'pop',
      });
    } else if (op === 'empty') {
      steps.push({
        state: snapshot(),
        highlights: [i],
        pointers: { op: i },
        message: `${labels[i]} — everything lives in s1, so one check is enough`,
        codeLine: 19,
        action: 'visit',
      });

      const isEmpty = s1.length === 0;
      outputs.push(isEmpty);
      steps.push({
        state: { ...snapshot(), result: [...outputs] },
        highlights: [i],
        pointers: { op: i },
        message: `s1 holds ${s1.length} element(s) → empty() = ${isEmpty}`,
        codeLine: 20,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { ...snapshot(), result: [...outputs] },
    highlights: [],
    message: `Same outputs — [${outputs.join(', ')}] — but the work moved to push: O(n) per push, O(1) worst case for everything else.`,
    codeLine: 20,
  });

  return steps;
}

export const implementQueueUsingStacks: Algorithm = {
  id: 'implement-queue-using-stacks',
  name: 'Implement Queue using Stacks',
  category: 'Stack',
  difficulty: 'Easy',
  timeComplexity: 'O(1) push, O(1) amortized pop/peek',
  spaceComplexity: 'O(n)',
  pattern: 'Two Stacks — amortized transfer from input to output',
  description:
    'Implement a first-in-first-out (FIFO) queue using only two stacks. The queue must support push, pop, peek, and empty using nothing but standard stack operations (push to top, pop from top, peek top, is-empty).',
  problemUrl: 'https://leetcode.com/problems/implement-queue-using-stacks/',
  code: {
    python: `class MyQueue:
    def __init__(self):
        self.input = []
        self.output = []

    def push(self, x):
        self.input.append(x)

    def pop(self):
        self.peek()
        return self.output.pop()

    def peek(self):
        if not self.output:
            while self.input:
                self.output.append(self.input.pop())
        return self.output[-1]

    def empty(self):
        return not self.input and not self.output`,
    javascript: `class MyQueue {
    constructor() {
        this.input = [];
        this.output = [];
    }

    push(x) {
        this.input.push(x);
    }

    pop() {
        this.peek();
        return this.output.pop();
    }

    peek() {
        if (this.output.length === 0) {
            while (this.input.length) {
                this.output.push(this.input.pop());
            }
        }
        return this.output[this.output.length - 1];
    }

    empty() {
        return this.input.length === 0 && this.output.length === 0;
    }
}`,
    java: `class MyQueue {
    private Deque<Integer> input = new ArrayDeque<>();
    private Deque<Integer> output = new ArrayDeque<>();

    public void push(int x) {
        input.push(x);
    }

    public int pop() {
        peek();
        return output.pop();
    }

    public int peek() {
        if (output.isEmpty()) {
            while (!input.isEmpty()) {
                output.push(input.pop());
            }
        }
        return output.peek();
    }

    public boolean empty() {
        return input.isEmpty() && output.isEmpty();
    }
}`,
  },
  defaultInput: [
    ['push', 1],
    ['push', 2],
    ['peek'],
    ['pop'],
    ['push', 3],
    ['peek'],
    ['pop'],
    ['pop'],
    ['empty'],
  ],
  run: runImplementQueueUsingStacks,
  optimalApproachName: 'Two Stacks (Amortized)',
  approaches: [
    {
      id: 'costly-push',
      name: 'Costly Push',
      timeComplexity: 'O(n) push, O(1) pop/peek/empty',
      spaceComplexity: 'O(n)',
      description:
        'Reorder on every push instead of lazily on read: drain s1 into s2, drop the new element on the bottom, pour everything back, so s1 is permanently in queue order.',
      code: {
        python: `class MyQueue:
    def __init__(self):
        self.s1 = []
        self.s2 = []

    def push(self, x):
        while self.s1:
            self.s2.append(self.s1.pop())
        self.s1.append(x)
        while self.s2:
            self.s1.append(self.s2.pop())

    def pop(self):
        return self.s1.pop()

    def peek(self):
        return self.s1[-1]

    def empty(self):
        return not self.s1`,
        javascript: `class MyQueue {
    constructor() {
        this.s1 = [];
        this.s2 = [];
    }

    push(x) {
        while (this.s1.length) {
            this.s2.push(this.s1.pop());
        }
        this.s1.push(x);
        while (this.s2.length) {
            this.s1.push(this.s2.pop());
        }
    }

    pop() {
        return this.s1.pop();
    }

    peek() {
        return this.s1[this.s1.length - 1];
    }

    empty() {
        return this.s1.length === 0;
    }
}`,
        java: `class MyQueue {
    private Deque<Integer> s1 = new ArrayDeque<>();
    private Deque<Integer> s2 = new ArrayDeque<>();

    public void push(int x) {
        while (!s1.isEmpty()) {
            s2.push(s1.pop());
        }
        s1.push(x);
        while (!s2.isEmpty()) {
            s1.push(s2.pop());
        }
    }

    public int pop() {
        return s1.pop();
    }

    public int peek() {
        return s1.peek();
    }

    public boolean empty() {
        return s1.isEmpty();
    }
}`,
      },
      run: runImplementQueueUsingStacksCostlyPush,
      lineExplanations: {
        python: {
          1: 'Define the MyQueue class',
          2: 'Constructor',
          3: 's1 permanently holds the queue with the FRONT on top',
          4: 's2 is a helper used only while pushing',
          6: 'Define push taking the new value',
          7: 'Empty s1 so the bottom slot becomes reachable',
          8: 'Each pop/push pair reverses the order into s2',
          9: 'The new element goes on the empty s1 — it is now the oldest-last',
          10: 'Pour everything back',
          11: 'Reversing twice restores queue order with the front on top',
          13: 'Define pop',
          14: 'The front is the top of s1 — a plain pop, O(1) worst case',
          16: 'Define peek',
          17: 'Read the top of s1 without removing it',
          19: 'Define empty',
          20: 'Everything lives in s1, so one emptiness check suffices',
        },
        javascript: {
          1: 'Define the MyQueue class',
          2: 'Constructor',
          3: 's1 permanently holds the queue with the FRONT on top',
          4: 's2 is a helper used only while pushing',
          7: 'Define push taking the new value',
          8: 'Empty s1 so the bottom slot becomes reachable',
          9: 'Each pop/push pair reverses the order into s2',
          11: 'The new element goes on the empty s1',
          12: 'Pour everything back',
          13: 'Reversing twice restores queue order with the front on top',
          17: 'Define pop',
          18: 'The front is the top of s1 — a plain pop',
          21: 'Define peek',
          22: 'Read the top of s1 without removing it',
          25: 'Define empty',
          26: 'Everything lives in s1, so one emptiness check suffices',
        },
        java: {
          1: 'Define the MyQueue class',
          2: 's1 permanently holds the queue with the FRONT on top',
          3: 's2 is a helper used only while pushing',
          5: 'Define push taking the new value',
          6: 'Empty s1 so the bottom slot becomes reachable',
          7: 'Each pop/push pair reverses the order into s2',
          9: 'The new element goes on the empty s1',
          10: 'Pour everything back',
          11: 'Reversing twice restores queue order with the front on top',
          15: 'Define pop',
          16: 'The front is the top of s1 — a plain pop',
          19: 'Define peek',
          20: 'Read the top of s1 without removing it',
          23: 'Define empty',
          24: 'Everything lives in s1, so one emptiness check suffices',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define the MyQueue class',
      2: 'Constructor',
      3: 'input stack receives every new element',
      4: 'output stack serves elements in queue order',
      6: 'Define push taking the new value',
      7: 'Just drop it on the input stack — always O(1)',
      9: 'Define pop',
      10: 'Reuse peek to guarantee the output stack is loaded',
      11: 'The front is now the top of the output stack',
      13: 'Define peek',
      14: 'Only refill when the output stack has run dry',
      15: 'Drain the whole input stack',
      16: 'Popping and re-pushing reverses the order — oldest ends up on top',
      17: 'The queue front is the top of the output stack',
      19: 'Define empty',
      20: 'The queue is empty only when neither stack holds anything',
    },
    javascript: {
      1: 'Define the MyQueue class',
      2: 'Constructor',
      3: 'input stack receives every new element',
      4: 'output stack serves elements in queue order',
      7: 'Define push taking the new value',
      8: 'Just drop it on the input stack — always O(1)',
      11: 'Define pop',
      12: 'Reuse peek to guarantee the output stack is loaded',
      13: 'The front is now the top of the output stack',
      16: 'Define peek',
      17: 'Only refill when the output stack has run dry',
      18: 'Drain the whole input stack',
      19: 'Popping and re-pushing reverses the order — oldest ends up on top',
      22: 'The queue front is the top of the output stack',
      25: 'Define empty',
      26: 'The queue is empty only when neither stack holds anything',
    },
    java: {
      1: 'Define the MyQueue class',
      2: 'input stack receives every new element',
      3: 'output stack serves elements in queue order',
      5: 'Define push taking the new value',
      6: 'Just drop it on the input stack — always O(1)',
      9: 'Define pop',
      10: 'Reuse peek to guarantee the output stack is loaded',
      11: 'The front is now the top of the output stack',
      14: 'Define peek',
      15: 'Only refill when the output stack has run dry',
      16: 'Drain the whole input stack',
      17: 'Popping and re-pushing reverses the order — oldest ends up on top',
      20: 'The queue front is the top of the output stack',
      23: 'Define empty',
      24: 'The queue is empty only when neither stack holds anything',
    },
  },
};
