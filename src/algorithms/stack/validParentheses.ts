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

function runValidParenthesesReplacement(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  let chars = s.split('');

  steps.push({
    state: { chars: [...chars] },
    highlights: [],
    message: `Repeatedly delete adjacent matched pairs from "${s}". A valid string collapses to empty from the inside out.`,
    codeLine: 1,
  });

  const isPair = (a: string, b: string) =>
    (a === '(' && b === ')') || (a === '[' && b === ']') || (a === '{' && b === '}');
  const pairLine: Record<string, number> = { '(': 3, '[': 4, '{': 5 };

  let removed = true;
  while (removed) {
    removed = false;
    for (let i = 0; i < chars.length - 1; i++) {
      if (isPair(chars[i], chars[i + 1])) {
        steps.push({
          state: { chars: [...chars] },
          highlights: [i, i + 1],
          pointers: { i },
          message: `"${chars[i]}${chars[i + 1]}" at index ${i} is an innermost matched pair — nothing sits between them, so delete both`,
          codeLine: 2,
          action: 'compare',
        });

        const opener = chars[i];
        chars = [...chars.slice(0, i), ...chars.slice(i + 2)];

        steps.push({
          state: { chars: [...chars] },
          highlights: [],
          message: `After deletion: "${chars.join('') || '(empty)'}". Brackets that wrapped the deleted pair are now adjacent and can match next.`,
          codeLine: pairLine[opener],
          action: 'delete',
        });

        removed = true;
        break;
      }
    }
  }

  const valid = chars.length === 0;
  steps.push({
    state: { chars: [...chars], result: valid },
    highlights: chars.map((_, i) => i),
    message: valid
      ? 'String shrank to empty — every bracket found its partner. VALID'
      : `No adjacent pairs left but "${chars.join('')}" remains — the leftovers can never match. INVALID`,
    codeLine: 6,
    action: valid ? 'found' : undefined,
  });

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
    java: `public static boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> closeToOpen = Map.of(
        ')', '(',
        ']', '[',
        '}', '{'
    );

    for (char c : s.toCharArray()) {
        if (closeToOpen.containsKey(c)) {
            if (!stack.isEmpty() && stack.peek() == closeToOpen.get(c)) {
                stack.pop();
            } else {
                return false;
            }
        } else {
            stack.push(c);
        }
    }

    return stack.isEmpty();
}`,
  },
  defaultInput: '({[]})',
  run: runValidParentheses,
  optimalApproachName: 'Stack Matching',
  approaches: [
    {
      id: 'string-replacement',
      name: 'String Replacement',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of tracking openers on a stack, repeatedly delete adjacent matched pairs — a valid string shrinks to empty from the inside out.',
      code: {
        python: `def isValid(s):
    while '()' in s or '[]' in s or '{}' in s:
        s = s.replace('()', '')
        s = s.replace('[]', '')
        s = s.replace('{}', '')
    return s == ''`,
        javascript: `function isValid(s) {
    let prev = null;
    while (prev !== s) {
        prev = s;
        s = s.replace('()', '').replace('[]', '').replace('{}', '');
    }
    return s === '';
}`,
        java: `public static boolean isValid(String s) {
    int prevLength = -1;
    while (s.length() != prevLength) {
        prevLength = s.length();
        s = s.replace("()", "").replace("[]", "").replace("{}", "");
    }
    return s.isEmpty();
}`,
      },
      run: runValidParenthesesReplacement,
      lineExplanations: {
        python: {
          1: 'Define function taking a string of brackets',
          2: 'Keep looping while any adjacent matched pair exists',
          3: 'Delete every "()" — innermost pairs vanish first',
          4: 'Delete every "[]" the same way',
          5: 'Delete every "{}" the same way',
          6: 'Valid only if the whole string shrank to empty',
        },
        javascript: {
          1: 'Define function taking a string of brackets',
          2: 'Remember the previous string to detect when nothing changed',
          3: 'Loop until a full pass deletes nothing',
          4: 'Snapshot the string before this pass',
          5: 'Delete one adjacent matched pair of each type',
          7: 'Valid only if the whole string shrank to empty',
        },
        java: {
          1: 'Define method taking a string of brackets',
          2: 'Track the previous length to detect when nothing changed',
          3: 'Loop until a pass stops shrinking the string',
          4: 'Record the length before this pass',
          5: 'Delete adjacent matched pairs of each type',
          7: 'Valid only if the whole string shrank to empty',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking a string of brackets',
      2: 'Create empty stack to track unmatched open brackets',
      3: 'Map each closing bracket to its matching opener',
      5: 'Loop through each character in the string',
      6: 'Is this a closing bracket?',
      7: 'Does it match the most recent open bracket on the stack?',
      8: 'Yes — pop the matched opener off the stack',
      10: "No match — string is invalid",
      12: "It's an opening bracket — push it onto the stack",
      14: 'Valid only if all brackets were matched (stack is empty)',
    },
    javascript: {
      1: 'Define function taking a string of brackets',
      2: 'Create empty stack to track unmatched open brackets',
      3: 'Map each closing bracket to its matching opener',
      5: 'Loop through each character in the string',
      6: 'Is this a closing bracket?',
      7: 'Does it match the most recent open bracket on the stack?',
      8: 'Yes — pop the matched opener off the stack',
      10: "No match — string is invalid",
      13: "It's an opening bracket — push it onto the stack",
      17: 'Valid only if all brackets were matched (stack is empty)',
    },
    java: {
      1: 'Define function taking a string of brackets',
      2: 'Create empty stack to track unmatched open brackets',
      3: 'Map each closing bracket to its matching opener',
      9: 'Loop through each character in the string',
      10: 'Is this a closing bracket?',
      11: 'Does it match the most recent open bracket on the stack?',
      12: 'Yes — pop the matched opener off the stack',
      14: "No match — string is invalid",
      17: "It's an opening bracket — push it onto the stack",
      21: 'Valid only if all brackets were matched (stack is empty)',
    },
  },
};
