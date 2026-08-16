import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runEvalRPN(input: unknown): AlgorithmStep[] {
  const tokens = input as string[];
  const steps: AlgorithmStep[] = [];
  const stack: number[] = [];
  const operators = new Set(['+', '-', '*', '/']);

  steps.push({
    state: { chars: [...tokens], stack: [] },
    highlights: [],
    message: `Evaluate Reverse Polish Notation: [${tokens.join(', ')}]`,
    codeLine: 1,
  });

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    steps.push({
      state: { chars: [...tokens], stack: [...stack] },
      highlights: [i],
      pointers: { i },
      message: `Read token "${token}"`,
      codeLine: 3,
      action: 'visit',
    });

    if (operators.has(token)) {
      const b = stack.pop()!;
      const a = stack.pop()!;

      steps.push({
        state: { chars: [...tokens], stack: [...stack] },
        highlights: [i],
        pointers: { i },
        message: `Operator "${token}": pop ${b} and ${a} from stack`,
        codeLine: 5,
        action: 'pop',
      });

      let result: number;
      switch (token) {
        case '+':
          result = a + b;
          break;
        case '-':
          result = a - b;
          break;
        case '*':
          result = a * b;
          break;
        case '/':
          result = Math.trunc(a / b);
          break;
        default:
          result = 0;
      }

      stack.push(result);

      steps.push({
        state: { chars: [...tokens], stack: [...stack] },
        highlights: [i],
        pointers: { i },
        message: `Compute ${a} ${token} ${b} = ${result}, push ${result} onto stack`,
        codeLine: 7,
        action: 'push',
      });
    } else {
      const num = parseInt(token, 10);
      stack.push(num);

      steps.push({
        state: { chars: [...tokens], stack: [...stack] },
        highlights: [i],
        pointers: { i },
        message: `Push number ${num} onto stack`,
        codeLine: 10,
        action: 'push',
      });
    }
  }

  const finalResult = stack[0];

  steps.push({
    state: { chars: [...tokens], stack: [...stack], result: finalResult },
    highlights: [],
    message: `Evaluation complete. Result: ${finalResult}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runEvalRPNRecursive(input: unknown): AlgorithmStep[] {
  const tokens = input as string[];
  const steps: AlgorithmStep[] = [];
  const operators = new Set(['+', '-', '*', '/']);
  const pending: string[] = []; // operators waiting for their operands (mirrors the call stack)
  let index = tokens.length - 1;

  steps.push({
    state: { chars: [...tokens], stack: [] },
    highlights: [],
    message: `Read the expression from the END: the last token is the root operator, and each operator recursively evaluates its right operand, then its left`,
    codeLine: 1,
  });

  function evaluate(): number {
    const i = index;
    const token = tokens[index--];

    if (!operators.has(token)) {
      steps.push({
        state: { chars: [...tokens], stack: [...pending] },
        highlights: [i],
        pointers: { i },
        message: `"${token}" is a number — return ${token} up to the operator waiting for it`,
        codeLine: 5,
        action: 'visit',
      });
      return parseInt(token, 10);
    }

    pending.push(token);
    steps.push({
      state: { chars: [...tokens], stack: [...pending] },
      highlights: [i],
      pointers: { i },
      message: `"${token}" is an operator — it needs two operands, so recurse leftward for its RIGHT operand first`,
      codeLine: 6,
      action: 'push',
    });

    const right = evaluate();

    steps.push({
      state: { chars: [...tokens], stack: [...pending] },
      highlights: [i],
      pointers: { i },
      message: `Right operand of "${token}" resolved to ${right} — now recurse for the LEFT operand`,
      codeLine: 7,
      action: 'visit',
    });

    const left = evaluate();
    pending.pop();

    let value: number;
    let line: number;
    switch (token) {
      case '+':
        value = left + right;
        line = 9;
        break;
      case '-':
        value = left - right;
        line = 11;
        break;
      case '*':
        value = left * right;
        line = 13;
        break;
      default:
        value = Math.trunc(left / right);
        line = 14;
    }

    steps.push({
      state: { chars: [...tokens], stack: [...pending] },
      highlights: [i],
      pointers: { i },
      message: `Both operands ready: ${left} ${token} ${right} = ${value}. Return ${value} up the call chain`,
      codeLine: line,
      action: 'pop',
    });

    return value;
  }

  const finalResult = evaluate();

  steps.push({
    state: { chars: [...tokens], stack: [], result: finalResult },
    highlights: [],
    message: `Recursion complete — the call stack did the bookkeeping a manual stack does. Result: ${finalResult}`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

export const evalRPN: Algorithm = {
  id: 'evaluate-reverse-polish-notation',
  name: 'Evaluate Reverse Polish Notation',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Stack — push numbers, pop two on operator',
  description:
    'You are given an array of strings tokens that represents an arithmetic expression in Reverse Polish Notation. Evaluate the expression and return an integer that represents the value of the expression. The valid operators are +, -, *, and /. Each operand may be an integer or another expression. Division between two integers should truncate toward zero.',
  problemUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/',
  code: {
    python: `def evalRPN(tokens):
    stack = []
    for token in tokens:
        if token in "+-*/":
            b, a = stack.pop(), stack.pop()
            if token == '+':
                stack.append(a + b)
            elif token == '-':
                stack.append(a - b)
            elif token == '*':
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(token))
    return stack[0]`,
    javascript: `function evalRPN(tokens) {
    const stack = [];
    for (const token of tokens) {
        if ("+-*/".includes(token)) {
            const b = stack.pop();
            const a = stack.pop();
            if (token === '+') stack.push(a + b);
            else if (token === '-') stack.push(a - b);
            else if (token === '*') stack.push(a * b);
            else stack.push(Math.trunc(a / b));
        } else {
            stack.push(parseInt(token));
        }
    }
    return stack[0];
}`,
    java: `public static int evalRPN(String[] tokens) {
    Deque<Integer> stack = new ArrayDeque<>();
    for (String token : tokens) {
        if ("+-*/".contains(token)) {
            int b = stack.pop();
            int a = stack.pop();
            if (token.equals("+")) stack.push(a + b);
            else if (token.equals("-")) stack.push(a - b);
            else if (token.equals("*")) stack.push(a * b);
            else stack.push(a / b);
        } else {
            stack.push(Integer.parseInt(token));
        }
    }
    return stack.peek();
}`,
  },
  defaultInput: ['2', '1', '+', '3', '*'],
  run: runEvalRPN,
  optimalApproachName: 'Stack Evaluation',
  approaches: [
    {
      id: 'recursive-from-end',
      name: 'Recursion from the End',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Replaces the explicit stack with the call stack: consume tokens from the end, where each operator recursively evaluates its right subtree, then its left.',
      code: {
        python: `def evalRPN(tokens):
    def evaluate():
        token = tokens.pop()
        if token not in "+-*/":
            return int(token)
        right = evaluate()
        left = evaluate()
        if token == '+':
            return left + right
        if token == '-':
            return left - right
        if token == '*':
            return left * right
        return int(left / right)

    return evaluate()`,
        javascript: `function evalRPN(tokens) {
    function evaluate() {
        const token = tokens.pop();
        if (!"+-*/".includes(token)) {
            return parseInt(token);
        }
        const right = evaluate();
        const left = evaluate();
        if (token === '+') return left + right;
        if (token === '-') return left - right;
        if (token === '*') return left * right;
        return Math.trunc(left / right);
    }

    return evaluate();
}`,
        java: `public static int evalRPN(String[] tokens) {
    int[] index = { tokens.length - 1 };
    return evaluate(tokens, index);
}

private static int evaluate(String[] tokens, int[] index) {
    String token = tokens[index[0]--];
    if (!"+-*/".contains(token)) {
        return Integer.parseInt(token);
    }
    int right = evaluate(tokens, index);
    int left = evaluate(tokens, index);
    switch (token) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        default: return left / right;
    }
}`,
      },
      run: runEvalRPNRecursive,
      lineExplanations: {
        python: {
          1: 'Define function taking list of tokens',
          2: 'Recursive helper that consumes tokens from the end',
          3: 'Take the last unconsumed token',
          4: 'Is it a plain number?',
          5: 'Numbers are leaves — return the value immediately',
          6: 'Operator: recursively evaluate the RIGHT operand first',
          7: 'Then recursively evaluate the LEFT operand',
          8: 'Addition operator?',
          9: 'Return the sum upward',
          10: 'Subtraction operator?',
          11: 'Return the difference upward',
          12: 'Multiplication operator?',
          13: 'Return the product upward',
          14: 'Division truncating toward zero',
          16: 'The whole expression is one recursive evaluation',
        },
        javascript: {
          1: 'Define function taking array of tokens',
          2: 'Recursive helper that consumes tokens from the end',
          3: 'Take the last unconsumed token',
          4: 'Is it a plain number?',
          5: 'Numbers are leaves — return the value immediately',
          7: 'Operator: recursively evaluate the RIGHT operand first',
          8: 'Then recursively evaluate the LEFT operand',
          9: 'Return the sum upward',
          10: 'Return the difference upward',
          11: 'Return the product upward',
          12: 'Division truncating toward zero',
          15: 'The whole expression is one recursive evaluation',
        },
        java: {
          1: 'Define method taking array of token strings',
          2: 'Single-element array so recursion can share the cursor',
          3: 'The whole expression is one recursive evaluation',
          6: 'Recursive helper that consumes tokens from the end',
          7: 'Take the token at the cursor and move it left',
          8: 'Is it a plain number?',
          9: 'Numbers are leaves — return the value immediately',
          11: 'Operator: recursively evaluate the RIGHT operand first',
          12: 'Then recursively evaluate the LEFT operand',
          13: 'Dispatch on the operator',
          14: 'Return the sum upward',
          15: 'Return the difference upward',
          16: 'Return the product upward',
          17: 'Integer division (truncates toward zero)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking list of tokens',
      2: 'Initialize empty stack for operands',
      3: 'Iterate through each token',
      4: 'Check if token is an operator',
      5: 'Pop two operands (b first, then a)',
      6: 'If addition, push sum onto stack',
      8: 'If subtraction, push difference onto stack',
      10: 'If multiplication, push product onto stack',
      12: 'Otherwise divide and truncate toward zero',
      14: 'Push number value onto stack',
      15: 'Return final result from top of stack',
    },
    javascript: {
      1: 'Define function taking array of tokens',
      2: 'Initialize empty stack for operands',
      3: 'Iterate through each token',
      4: 'Check if token is an operator',
      5: 'Pop second operand from stack',
      6: 'Pop first operand from stack',
      7: 'If addition, push sum onto stack',
      8: 'If subtraction, push difference onto stack',
      9: 'If multiplication, push product onto stack',
      10: 'Otherwise divide and truncate toward zero',
      12: 'Push number value onto stack',
      15: 'Return final result from top of stack',
    },
    java: {
      1: 'Define method taking array of token strings',
      2: 'Initialize stack using ArrayDeque',
      3: 'Iterate through each token',
      4: 'Check if token is an operator',
      5: 'Pop second operand from stack',
      6: 'Pop first operand from stack',
      7: 'If addition, push sum onto stack',
      8: 'If subtraction, push difference onto stack',
      9: 'If multiplication, push product onto stack',
      10: 'Otherwise push integer division result',
      12: 'Parse and push number onto stack',
      15: 'Return final result from top of stack',
    },
  },
};
