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
  },
  defaultInput: [['push', 5], ['push', 3], ['push', 7], ['getMin'], ['pop'], ['top'], ['getMin']],
  run: runMinStack,
};
