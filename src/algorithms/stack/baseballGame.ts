import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runBaseballGame(input: unknown): AlgorithmStep[] {
  const ops = input as string[];
  const steps: AlgorithmStep[] = [];
  const stack: number[] = [];

  steps.push({
    state: { chars: [...ops], stack: [] },
    highlights: [],
    message:
      'Every operation only ever touches the most recent scores, so a stack is the perfect record book — the last score in is the first one "C" can undo.',
    codeLine: 2,
  });

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];

    steps.push({
      state: { chars: [...ops], stack: [...stack] },
      highlights: [i],
      pointers: { op: i },
      message: `Read operation "${op}" (record so far: [${stack.join(', ')}])`,
      codeLine: 4,
      action: 'visit',
    });

    if (op === '+') {
      const a = stack[stack.length - 1];
      const b = stack[stack.length - 2];
      const sum = a + b;
      stack.push(sum);
      steps.push({
        state: { chars: [...ops], stack: [...stack] },
        highlights: [i],
        pointers: { op: i },
        message: `"+" scores the sum of the last two: ${a} + ${b} = ${sum} — push ${sum} as a brand new record`,
        codeLine: 6,
        action: 'push',
      });
    } else if (op === 'D') {
      const top = stack[stack.length - 1];
      stack.push(2 * top);
      steps.push({
        state: { chars: [...ops], stack: [...stack] },
        highlights: [i],
        pointers: { op: i },
        message: `"D" doubles the last score: 2 × ${top} = ${2 * top} — push it (the original ${top} stays on the record)`,
        codeLine: 8,
        action: 'push',
      });
    } else if (op === 'C') {
      const removed = stack.pop();
      steps.push({
        state: { chars: [...ops], stack: [...stack] },
        highlights: [i],
        pointers: { op: i },
        message: `"C" cancels the previous score — pop ${removed} off the record. Only the top can be undone, which is exactly what a stack gives you.`,
        codeLine: 10,
        action: 'pop',
      });
    } else {
      const val = parseInt(op, 10);
      stack.push(val);
      steps.push({
        state: { chars: [...ops], stack: [...stack] },
        highlights: [i],
        pointers: { op: i },
        message: `"${op}" is a plain integer — push ${val} onto the record`,
        codeLine: 12,
        action: 'push',
      });
    }
  }

  const total = stack.reduce((a, b) => a + b, 0);
  steps.push({
    state: { chars: [...ops], stack: [...stack], result: total },
    highlights: [],
    message: `No operations left. Sum every surviving score: ${stack.join(' + ')} = ${total}`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

function runBaseballGameIndex(input: unknown): AlgorithmStep[] {
  const ops = input as string[];
  const steps: AlgorithmStep[] = [];
  const record: number[] = new Array(ops.length).fill(0);
  let i = 0;

  steps.push({
    state: { nums: [...record] },
    highlights: [],
    message: `A score list can never grow past ${ops.length} entries, so preallocate that many slots and track a write index i. No push/pop calls at all — just index arithmetic.`,
    codeLine: 2,
  });

  for (let k = 0; k < ops.length; k++) {
    const op = ops[k];

    if (op === '+') {
      record[i] = record[i - 1] + record[i - 2];
      steps.push({
        state: { nums: [...record] },
        highlights: [i],
        pointers: { i },
        secondary: [i - 1, i - 2],
        message: `"${op}": write record[${i}] = record[${i - 1}] + record[${i - 2}] = ${record[i - 1]} + ${record[i - 2]} = ${record[i]}`,
        codeLine: 7,
        action: 'insert',
      });
      i++;
      steps.push({
        state: { nums: [...record] },
        highlights: [],
        pointers: { i },
        message: `Advance the write index to i = ${i}`,
        codeLine: 8,
      });
    } else if (op === 'D') {
      record[i] = 2 * record[i - 1];
      steps.push({
        state: { nums: [...record] },
        highlights: [i],
        pointers: { i },
        secondary: [i - 1],
        message: `"${op}": write record[${i}] = 2 × record[${i - 1}] = ${record[i]}`,
        codeLine: 10,
        action: 'insert',
      });
      i++;
      steps.push({
        state: { nums: [...record] },
        highlights: [],
        pointers: { i },
        message: `Advance the write index to i = ${i}`,
        codeLine: 11,
      });
    } else if (op === 'C') {
      i--;
      steps.push({
        state: { nums: [...record] },
        highlights: [i],
        pointers: { i },
        message: `"C": just step the write index back to i = ${i}. The stale value ${record[i]} is still sitting in the array, but it is now past the end and will be overwritten or ignored.`,
        codeLine: 13,
        action: 'delete',
      });
    } else {
      record[i] = parseInt(op, 10);
      steps.push({
        state: { nums: [...record] },
        highlights: [i],
        pointers: { i },
        message: `"${op}": write record[${i}] = ${record[i]}`,
        codeLine: 15,
        action: 'insert',
      });
      i++;
      steps.push({
        state: { nums: [...record] },
        highlights: [],
        pointers: { i },
        message: `Advance the write index to i = ${i}`,
        codeLine: 16,
      });
    }
  }

  const live = record.slice(0, i);
  const total = live.reduce((a, b) => a + b, 0);
  steps.push({
    state: { nums: [...record], result: total },
    highlights: live.map((_, idx) => idx),
    pointers: { i },
    message: `Only the first ${i} slots are live. Sum record[0..${i - 1}]: ${live.join(' + ')} = ${total}`,
    codeLine: 18,
    action: 'found',
  });

  return steps;
}

export const baseballGame: Algorithm = {
  id: 'baseball-game',
  name: 'Baseball Game',
  category: 'Stack',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Stack — replay scores, undo with pop',
  description:
    'You are keeping score for a game with a list of operations: an integer records a new score, "+" records the sum of the previous two scores, "D" records double the previous score, and "C" invalidates the previous score. Return the sum of all scores on the record after applying every operation.',
  problemUrl: 'https://leetcode.com/problems/baseball-game/',
  code: {
    python: `def calPoints(operations):
    stack = []

    for op in operations:
        if op == '+':
            stack.append(stack[-1] + stack[-2])
        elif op == 'D':
            stack.append(2 * stack[-1])
        elif op == 'C':
            stack.pop()
        else:
            stack.append(int(op))

    return sum(stack)`,
    javascript: `function calPoints(operations) {
    const stack = [];

    for (const op of operations) {
        if (op === '+') {
            stack.push(stack[stack.length - 1] + stack[stack.length - 2]);
        } else if (op === 'D') {
            stack.push(2 * stack[stack.length - 1]);
        } else if (op === 'C') {
            stack.pop();
        } else {
            stack.push(parseInt(op, 10));
        }
    }

    return stack.reduce((a, b) => a + b, 0);
}`,
    java: `public static int calPoints(String[] operations) {
    Deque<Integer> stack = new ArrayDeque<>();

    for (String op : operations) {
        if (op.equals("+")) {
            int top = stack.pop();
            int sum = top + stack.peek();
            stack.push(top);
            stack.push(sum);
        } else if (op.equals("D")) {
            stack.push(2 * stack.peek());
        } else if (op.equals("C")) {
            stack.pop();
        } else {
            stack.push(Integer.parseInt(op));
        }
    }

    int total = 0;
    for (int score : stack) {
        total += score;
    }
    return total;
}`,
  },
  defaultInput: ['5', '-2', '4', 'C', 'D', '9', '+', '+'],
  run: runBaseballGame,
  optimalApproachName: 'Stack Simulation',
  approaches: [
    {
      id: 'write-index-array',
      name: 'Array with Write Index',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Replace the stack object with a preallocated array plus a write index — "C" becomes i -= 1 instead of a pop, so the whole simulation is pure index arithmetic.',
      code: {
        python: `def calPoints(operations):
    record = [0] * len(operations)
    i = 0

    for op in operations:
        if op == '+':
            record[i] = record[i - 1] + record[i - 2]
            i += 1
        elif op == 'D':
            record[i] = 2 * record[i - 1]
            i += 1
        elif op == 'C':
            i -= 1
        else:
            record[i] = int(op)
            i += 1

    return sum(record[:i])`,
        javascript: `function calPoints(operations) {
    const record = new Array(operations.length).fill(0);
    let i = 0;

    for (const op of operations) {
        if (op === '+') {
            record[i] = record[i - 1] + record[i - 2];
            i++;
        } else if (op === 'D') {
            record[i] = 2 * record[i - 1];
            i++;
        } else if (op === 'C') {
            i--;
        } else {
            record[i] = parseInt(op, 10);
            i++;
        }
    }

    let total = 0;
    for (let k = 0; k < i; k++) total += record[k];
    return total;
}`,
        java: `public static int calPoints(String[] operations) {
    int[] record = new int[operations.length];
    int i = 0;

    for (String op : operations) {
        if (op.equals("+")) {
            record[i] = record[i - 1] + record[i - 2];
            i++;
        } else if (op.equals("D")) {
            record[i] = 2 * record[i - 1];
            i++;
        } else if (op.equals("C")) {
            i--;
        } else {
            record[i] = Integer.parseInt(op);
            i++;
        }
    }

    int total = 0;
    for (int k = 0; k < i; k++) total += record[k];
    return total;
}`,
      },
      run: runBaseballGameIndex,
      lineExplanations: {
        python: {
          1: 'Define function taking the list of operations',
          2: 'The record can never exceed one entry per operation — preallocate that many slots',
          3: 'i is the write index: record[0..i-1] holds the live scores',
          5: 'Walk the operations in order',
          6: 'Sum of the previous two scores',
          7: 'Read the two slots below the write index and store their sum',
          8: 'Move the write index forward',
          9: 'Double the previous score',
          10: 'Read the slot just below i, double it, store it',
          11: 'Move the write index forward',
          12: 'Cancel the previous score',
          13: 'Step the write index back — the stale value is simply abandoned',
          14: 'Anything else is a plain integer score',
          15: 'Parse it and store it at the write index',
          16: 'Move the write index forward',
          18: 'Only the first i slots are live — sum those',
        },
        javascript: {
          1: 'Define function taking the array of operations',
          2: 'Preallocate one slot per operation',
          3: 'i is the write index: record[0..i-1] holds the live scores',
          5: 'Walk the operations in order',
          6: 'Sum of the previous two scores',
          7: 'Read the two slots below the write index and store their sum',
          8: 'Move the write index forward',
          9: 'Double the previous score',
          10: 'Read the slot just below i, double it, store it',
          11: 'Move the write index forward',
          12: 'Cancel the previous score',
          13: 'Step the write index back — the stale value is simply abandoned',
          14: 'Anything else is a plain integer score',
          15: 'Parse it and store it at the write index',
          16: 'Move the write index forward',
          21: 'Sum only the live prefix record[0..i-1]',
          22: 'Return the total',
        },
        java: {
          1: 'Define method taking the array of operations',
          2: 'Preallocate one int slot per operation',
          3: 'i is the write index: record[0..i-1] holds the live scores',
          5: 'Walk the operations in order',
          6: 'Sum of the previous two scores',
          7: 'Read the two slots below the write index and store their sum',
          8: 'Move the write index forward',
          9: 'Double the previous score',
          10: 'Read the slot just below i, double it, store it',
          11: 'Move the write index forward',
          12: 'Cancel the previous score',
          13: 'Step the write index back — the stale value is simply abandoned',
          14: 'Anything else is a plain integer score',
          15: 'Parse it and store it at the write index',
          16: 'Move the write index forward',
          21: 'Sum only the live prefix record[0..i-1]',
          22: 'Return the total',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the list of operations',
      2: 'The stack holds every score currently on the record',
      4: 'Process the operations in order',
      5: '"+" means score the sum of the previous two',
      6: 'Peek the top two scores and push their sum as a new score',
      7: '"D" means double the previous score',
      8: 'Peek the top score, double it, push the result',
      9: '"C" means cancel the previous score',
      10: 'Pop the top score off the record — only the newest can be undone',
      11: 'Anything else is a plain integer score',
      12: 'Parse it and push it onto the record',
      14: 'The answer is the sum of every score still on the stack',
    },
    javascript: {
      1: 'Define function taking the array of operations',
      2: 'The stack holds every score currently on the record',
      4: 'Process the operations in order',
      5: '"+" means score the sum of the previous two',
      6: 'Peek the top two scores and push their sum as a new score',
      7: '"D" means double the previous score',
      8: 'Peek the top score, double it, push the result',
      9: '"C" means cancel the previous score',
      10: 'Pop the top score off the record — only the newest can be undone',
      11: 'Anything else is a plain integer score',
      12: 'Parse it and push it onto the record',
      16: 'The answer is the sum of every score still on the stack',
    },
    java: {
      1: 'Define method taking the array of operations',
      2: 'The stack holds every score currently on the record',
      4: 'Process the operations in order',
      5: '"+" means score the sum of the previous two',
      6: 'ArrayDeque has no peek-second, so pop the top temporarily',
      7: 'Sum the top two scores',
      8: 'Put the top score back',
      9: 'Push the sum as a new score',
      10: '"D" means double the previous score',
      11: 'Peek the top score, double it, push the result',
      12: '"C" means cancel the previous score',
      13: 'Pop the top score off the record',
      14: 'Anything else is a plain integer score',
      15: 'Parse it and push it onto the record',
      19: 'Accumulate the final total',
      20: 'Iterating a Deque visits every remaining score',
      23: 'Return the sum of the record',
    },
  },
};
