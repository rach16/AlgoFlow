import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type MinStackOp = [string, number?];

function runMinStack(input: unknown): AlgorithmStep[] {
  const operations = input as MinStackOp[];
  const steps: AlgorithmStep[] = [];
  const stack: number[] = [];
  const minStack: number[] = [];

  steps.push({
    state: { stack: [], minStack: [], chars: operations.map((op) => op.join('(')+')') },
    highlights: [],
    message: 'Initialize empty stack and minStack',
    codeLine: 1,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, val] = operations[i];
    const opLabel = val !== undefined ? `${op}(${val})` : `${op}()`;

    steps.push({
      state: { stack: [...stack], minStack: [...minStack], chars: operations.map((o) => o.join('(')+')') },
      highlights: [i],
      pointers: { op: i },
      message: `Processing operation: ${opLabel}`,
      codeLine: 4,
      action: 'visit',
    });

    if (op === 'push' && val !== undefined) {
      stack.push(val);
      const minVal = minStack.length === 0 ? val : Math.min(val, minStack[minStack.length - 1]);
      minStack.push(minVal);

      steps.push({
        state: { stack: [...stack], minStack: [...minStack], chars: operations.map((o) => o.join('(')+')') },
        highlights: [i],
        pointers: { op: i },
        message: `Push ${val} onto stack. Min so far: ${minVal} -> push ${minVal} onto minStack`,
        codeLine: 6,
        action: 'push',
      });
    } else if (op === 'pop') {
      const popped = stack.pop();
      minStack.pop();

      steps.push({
        state: { stack: [...stack], minStack: [...minStack], chars: operations.map((o) => o.join('(')+')') },
        highlights: [i],
        pointers: { op: i },
        message: `Pop ${popped} from stack. Also pop from minStack. ${minStack.length > 0 ? `Current min: ${minStack[minStack.length - 1]}` : 'Stack is now empty'}`,
        codeLine: 9,
        action: 'pop',
      });
    } else if (op === 'top') {
      const topVal = stack[stack.length - 1];

      steps.push({
        state: { stack: [...stack], minStack: [...minStack], chars: operations.map((o) => o.join('(')+')'), result: topVal },
        highlights: [i],
        pointers: { op: i },
        message: `Top of stack is ${topVal}`,
        codeLine: 12,
        action: 'found',
      });
    } else if (op === 'getMin') {
      const currentMin = minStack[minStack.length - 1];

      steps.push({
        state: { stack: [...stack], minStack: [...minStack], chars: operations.map((o) => o.join('(')+')'), result: currentMin },
        highlights: [i],
        pointers: { op: i },
        message: `getMin() = ${currentMin} (top of minStack)`,
        codeLine: 15,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { stack: [...stack], minStack: [...minStack], chars: operations.map((o) => o.join('(')+')') },
    highlights: [],
    message: `All operations complete. Final stack: [${stack.join(', ')}]`,
    codeLine: 17,
  });

  return steps;
}

function runMinStackPairs(input: unknown): AlgorithmStep[] {
  const operations = input as MinStackOp[];
  const steps: AlgorithmStep[] = [];
  const stack: [number, number][] = []; // [value, min-so-far]
  const opLabels = operations.map(([op, val]) => (val !== undefined ? `${op}(${val})` : `${op}()`));
  const display = () => stack.map(([v, m]) => `${v} (min ${m})`);

  steps.push({
    state: { stack: [], chars: [...opLabels] },
    highlights: [],
    message: 'One stack is enough: each entry stores (value, minSoFar), so every level remembers the minimum of everything at or below it',
    codeLine: 3,
  });

  for (let i = 0; i < operations.length; i++) {
    const [op, val] = operations[i];
    const visitLine: Record<string, number> = { push: 5, pop: 9, top: 12, getMin: 15 };

    steps.push({
      state: { stack: display(), chars: [...opLabels] },
      highlights: [i],
      pointers: { op: i },
      message: `Processing operation: ${opLabels[i]}`,
      codeLine: visitLine[op] ?? 1,
      action: 'visit',
    });

    if (op === 'push' && val !== undefined) {
      const minVal = stack.length === 0 ? val : Math.min(val, stack[stack.length - 1][1]);
      stack.push([val, minVal]);

      steps.push({
        state: { stack: display(), chars: [...opLabels] },
        highlights: [i],
        pointers: { op: i },
        message: `Push the pair (${val}, min ${minVal}) — the min rides along with the value, no second stack needed`,
        codeLine: 7,
        action: 'push',
      });
    } else if (op === 'pop') {
      const popped = stack.pop();

      steps.push({
        state: { stack: display(), chars: [...opLabels] },
        highlights: [i],
        pointers: { op: i },
        message: `Pop the pair (${popped?.[0]}, min ${popped?.[1]}). ${stack.length > 0 ? `The pair now on top already knows the min is ${stack[stack.length - 1][1]}` : 'Stack is now empty'}`,
        codeLine: 10,
        action: 'pop',
      });
    } else if (op === 'top') {
      const topVal = stack[stack.length - 1][0];

      steps.push({
        state: { stack: display(), chars: [...opLabels], result: topVal },
        highlights: [i],
        pointers: { op: i },
        message: `top() = ${topVal} — first element of the top pair`,
        codeLine: 13,
        action: 'found',
      });
    } else if (op === 'getMin') {
      const currentMin = stack[stack.length - 1][1];

      steps.push({
        state: { stack: display(), chars: [...opLabels], result: currentMin },
        highlights: [i],
        pointers: { op: i },
        message: `getMin() = ${currentMin} — second element of the top pair, in O(1) with no extra stack`,
        codeLine: 16,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { stack: display(), chars: [...opLabels] },
    highlights: [],
    message: `All operations complete. Final stack of pairs: [${display().join(', ')}]`,
    codeLine: 16,
  });

  return steps;
}

export const minStack: Algorithm = {
  id: 'min-stack',
  name: 'Min Stack',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(n)',
  pattern: 'Two Stacks — main stack + min tracker stack',
  description:
    'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Implement the MinStack class with push(val), pop(), top(), and getMin() operations.',
  problemUrl: 'https://leetcode.com/problems/min-stack/',
  code: {
    python: `class MinStack:
    def __init__(self):
        self.stack = []
        self.minStack = []

    def push(self, val):
        self.stack.append(val)
        minVal = min(val, self.minStack[-1] if self.minStack else val)
        self.minStack.append(minVal)

    def pop(self):
        self.stack.pop()
        self.minStack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.minStack[-1]`,
    javascript: `class MinStack {
    constructor() {
        this.stack = [];
        this.minStack = [];
    }

    push(val) {
        this.stack.append(val);
        const minVal = Math.min(val, this.minStack.length ? this.minStack[this.minStack.length - 1] : val);
        this.minStack.push(minVal);
    }

    pop() {
        this.stack.pop();
        this.minStack.pop();
    }

    top() {
        return this.stack[this.stack.length - 1];
    }

    getMin() {
        return this.minStack[this.minStack.length - 1];
    }
}`,
    java: `class MinStack {
    private Deque<Integer> stack;
    private Deque<Integer> minStack;

    public MinStack() {
        stack = new ArrayDeque<>();
        minStack = new ArrayDeque<>();
    }

    public void push(int val) {
        stack.push(val);
        int minVal = Math.min(val, minStack.isEmpty() ? val : minStack.peek());
        minStack.push(minVal);
    }

    public void pop() {
        stack.pop();
        minStack.pop();
    }

    public int top() {
        return stack.peek();
    }

    public int getMin() {
        return minStack.peek();
    }
}`,
  },
  defaultInput: [['push', 5], ['push', 3], ['push', 7], ['getMin'], ['pop'], ['top'], ['getMin']],
  run: runMinStack,
  optimalApproachName: 'Two Stacks',
  approaches: [
    {
      id: 'single-stack-pairs',
      name: 'Single Stack of Pairs',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of a parallel minStack, store (value, minSoFar) pairs in one stack — each entry carries the minimum of everything below it.',
      code: {
        python: `class MinStack:
    def __init__(self):
        self.stack = []  # (val, min) pairs

    def push(self, val):
        minVal = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, minVal))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def getMin(self):
        return self.stack[-1][1]`,
        javascript: `class MinStack {
    constructor() {
        this.stack = []; // [val, min] pairs
    }

    push(val) {
        const minVal = this.stack.length ? Math.min(val, this.stack[this.stack.length - 1][1]) : val;
        this.stack.push([val, minVal]);
    }

    pop() {
        this.stack.pop();
    }

    top() {
        return this.stack[this.stack.length - 1][0];
    }

    getMin() {
        return this.stack[this.stack.length - 1][1];
    }
}`,
        java: `class MinStack {
    private Deque<int[]> stack; // [val, min]

    public MinStack() {
        stack = new ArrayDeque<>();
    }

    public void push(int val) {
        int minVal = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
        stack.push(new int[] { val, minVal });
    }

    public void pop() {
        stack.pop();
    }

    public int top() {
        return stack.peek()[0];
    }

    public int getMin() {
        return stack.peek()[1];
    }
}`,
      },
      run: runMinStackPairs,
      lineExplanations: {
        python: {
          1: 'Define MinStack class',
          2: 'Constructor to initialize data',
          3: 'One stack holding (value, min-so-far) pairs',
          5: 'Define push method taking a value',
          6: 'New min is the smaller of val and the min stored on top',
          7: 'Push the value together with the min at this level',
          9: 'Define pop method',
          10: 'Pop one pair — value and its min leave together',
          12: 'Define top method',
          13: 'Return first element of the top pair (the value)',
          15: 'Define getMin method',
          16: 'Return second element of the top pair (the min)',
        },
        javascript: {
          1: 'Define MinStack class',
          2: 'Constructor to initialize data',
          3: 'One stack holding [value, min-so-far] pairs',
          6: 'Define push method taking a value',
          7: 'New min is the smaller of val and the min stored on top',
          8: 'Push the value together with the min at this level',
          11: 'Define pop method',
          12: 'Pop one pair — value and its min leave together',
          15: 'Define top method',
          16: 'Return first element of the top pair (the value)',
          19: 'Define getMin method',
          20: 'Return second element of the top pair (the min)',
        },
        java: {
          1: 'Define MinStack class',
          2: 'One stack holding [value, min] pairs',
          4: 'Constructor to initialize data',
          5: 'Create the pair stack using ArrayDeque',
          8: 'Define push method taking an int value',
          9: 'New min is the smaller of val and the min stored on top',
          10: 'Push the value together with the min at this level',
          13: 'Define pop method',
          14: 'Pop one pair — value and its min leave together',
          17: 'Define top method',
          18: 'Return first element of the top pair (the value)',
          21: 'Define getMin method',
          22: 'Return second element of the top pair (the min)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define MinStack class',
      2: 'Constructor to initialize data',
      3: 'Initialize main stack as empty list',
      4: 'Initialize min-tracking stack as empty list',
      6: 'Define push method taking a value',
      7: 'Append value to main stack',
      8: 'Compute min of val and current minimum',
      9: 'Push current minimum onto minStack',
      11: 'Define pop method',
      12: 'Remove top element from main stack',
      13: 'Remove top element from minStack',
      15: 'Define top method',
      16: 'Return top element of main stack',
      18: 'Define getMin method',
      19: 'Return top of minStack (current minimum)',
    },
    javascript: {
      1: 'Define MinStack class',
      2: 'Constructor to initialize stacks',
      3: 'Initialize main stack as empty array',
      4: 'Initialize min-tracking stack as empty array',
      7: 'Define push method taking a value',
      8: 'Append value to main stack',
      9: 'Compute min of val and current minimum',
      10: 'Push current minimum onto minStack',
      13: 'Define pop method',
      14: 'Remove top element from main stack',
      15: 'Remove top element from minStack',
      18: 'Define top method',
      19: 'Return top element of main stack',
      22: 'Define getMin method',
      23: 'Return top of minStack (current minimum)',
    },
    java: {
      1: 'Define MinStack class',
      2: 'Declare main stack field',
      3: 'Declare min-tracking stack field',
      5: 'Constructor to initialize stacks',
      6: 'Create main stack using ArrayDeque',
      7: 'Create minStack using ArrayDeque',
      10: 'Define push method taking an int value',
      11: 'Push value onto main stack',
      12: 'Compute min of val and current minimum',
      13: 'Push current minimum onto minStack',
      16: 'Define pop method',
      17: 'Remove top element from main stack',
      18: 'Remove top element from minStack',
      21: 'Define top method',
      22: 'Return top element of main stack',
      25: 'Define getMin method',
      26: 'Return top of minStack (current minimum)',
    },
  },
};
