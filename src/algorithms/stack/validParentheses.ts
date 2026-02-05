import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runValidParentheses(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const stack: string[] = [];
  const chars = s.split('');

  const closeToOpen: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  steps.push({
    state: { chars, stack: [] },
    highlights: [],
    message: `Check if parentheses in "${s}" are valid`,
    codeLine: 1,
  });

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    steps.push({
      state: { chars, stack: [...stack] },
      highlights: [i],
      pointers: { i },
      message: `Processing '${char}'`,
      codeLine: 4,
      action: 'visit',
    });

    if (char in closeToOpen) {
      // Closing bracket
      if (stack.length > 0 && stack[stack.length - 1] === closeToOpen[char]) {
        const popped = stack.pop();
        steps.push({
          state: { chars, stack: [...stack] },
          highlights: [i],
          pointers: { i },
          message: `'${char}' matches '${popped}' - pop from stack`,
          codeLine: 6,
          action: 'pop',
        });
      } else {
        steps.push({
          state: { chars, stack: [...stack], result: false },
          highlights: [i],
          pointers: { i },
          message: `'${char}' doesn't match top of stack - INVALID`,
          codeLine: 8,
        });
        return steps;
      }
    } else {
      // Opening bracket
      stack.push(char);
      steps.push({
        state: { chars, stack: [...stack] },
        highlights: [i],
        pointers: { i },
        message: `Push '${char}' onto stack`,
        codeLine: 10,
        action: 'push',
      });
    }
  }

  if (stack.length === 0) {
    steps.push({
      state: { chars, stack: [...stack], result: true },
      highlights: [],
      message: `Stack is empty - all brackets matched! VALID`,
      codeLine: 12,
      action: 'found',
    });
  } else {
    steps.push({
      state: { chars, stack: [...stack], result: false },
      highlights: [],
      message: `Stack not empty (${stack.join(', ')}) - unmatched brackets! INVALID`,
      codeLine: 13,
    });
  }

  return steps;
}

export const validParentheses: Algorithm = {
  id: 'valid-parentheses',
  name: 'Valid Parentheses',
  category: 'Stack',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Stack — push open, pop and match close',
  description:
    'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.',
  problemUrl: 'https://leetcode.com/problems/valid-parentheses/',
  code: {
    python: `def isValid(s):
    stack = []
    closeToOpen = {')': '(', ']': '[', '}': '{'}

    for c in s:
        if c in closeToOpen:
            if stack and stack[-1] == closeToOpen[c]:
                stack.pop()
            else:
                return False
        else:
            stack.append(c)

    return len(stack) == 0`,
    javascript: `function isValid(s) {
    const stack = [];
    const closeToOpen = {')': '(', ']': '[', '}': '{'};

    for (const c of s) {
        if (c in closeToOpen) {
            if (stack.length && stack[stack.length - 1] === closeToOpen[c]) {
                stack.pop();
            } else {
                return false;
            }
        } else {
            stack.push(c);
        }
    }

    return stack.length === 0;
}`,
  },
  defaultInput: '({[]})',
  run: runValidParentheses,
};
