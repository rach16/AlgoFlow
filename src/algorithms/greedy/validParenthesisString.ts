import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runValidParenthesisString(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');

  steps.push({
    state: {
      chars: [...chars],
      result: 'Checking if valid...',
    },
    highlights: [],
    message: `Greedy: track min and max possible open count. '*' can be '(', ')' or empty.`,
    codeLine: 1,
  });

  let lo = 0; // minimum possible open parens
  let hi = 0; // maximum possible open parens

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (ch === '(') {
      lo++;
      hi++;
    } else if (ch === ')') {
      lo--;
      hi--;
    } else {
      // '*': could be '(', ')' or ''
      lo--; // treat as ')'
      hi++; // treat as '('
    }

    steps.push({
      state: {
        chars: [...chars],
        count: hi,
        result: `lo=${lo < 0 ? 0 : lo}, hi=${hi}`,
      },
      highlights: [i],
      pointers: { i },
      message: `char='${ch}': ${ch === '(' ? 'lo++, hi++' : ch === ')' ? 'lo--, hi--' : 'lo-- (as ")"), hi++ (as "(")'}.  lo=${lo}, hi=${hi}.`,
      codeLine: 3,
      action: 'visit',
    });

    if (hi < 0) {
      steps.push({
        state: {
          chars: [...chars],
          result: 'false',
        },
        highlights: [i],
        message: `hi < 0: too many ')' even treating all '*' as '('. Return false.`,
        codeLine: 5,
        action: 'found',
      });
      return steps;
    }

    // lo can't go below 0
    if (lo < 0) {
      lo = 0;

      steps.push({
        state: {
          chars: [...chars],
          count: hi,
          result: `lo=0, hi=${hi}`,
        },
        highlights: [i],
        pointers: { i },
        message: `lo was negative, clamp to 0 (we can choose '*' to not act as ')').`,
        codeLine: 6,
        action: 'compare',
      });
    }
  }

  const result = lo === 0;

  steps.push({
    state: {
      chars: [...chars],
      result: result ? 'true' : 'false',
    },
    highlights: [],
    message: `Done! lo = ${lo}. ${result ? 'lo == 0, so valid!' : 'lo != 0, unmatched open parens.'} Result: ${result}.`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const validParenthesisString: Algorithm = {
  id: 'valid-parenthesis-string',
  name: 'Valid Parenthesis String',
  category: 'Greedy',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — track min and max possible open count',
  description:
    'Given a string s containing only three types of characters: \'(\', \')\' and \'*\', return true if s is valid. \'*\' could be treated as a single right parenthesis \')\', or a single left parenthesis \'(\', or an empty string "".',
  problemUrl: 'https://leetcode.com/problems/valid-parenthesis-string/',
  code: {
    python: `def checkValidString(s):
    lo = hi = 0
    for c in s:
        if c == '(':
            lo += 1
            hi += 1
        elif c == ')':
            lo -= 1
            hi -= 1
        else:
            lo -= 1
            hi += 1
        if hi < 0:
            return False
        lo = max(lo, 0)
    return lo == 0`,
    javascript: `function checkValidString(s) {
    let lo = 0, hi = 0;
    for (const c of s) {
        if (c === '(') { lo++; hi++; }
        else if (c === ')') { lo--; hi--; }
        else { lo--; hi++; }
        if (hi < 0) return false;
        lo = Math.max(lo, 0);
    }
    return lo === 0;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: '(*))',
  run: runValidParenthesisString,
};
