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
  },
  defaultInput: ['2', '1', '+', '3', '*'],
  run: runEvalRPN,
};
