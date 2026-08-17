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

function runValidParenthesisStringTwoPass(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');

  steps.push({
    state: { chars: [...chars], result: 'Checking if valid...' },
    highlights: [],
    message: `Two-pass check: forward pass treats every '*' as '(' (best case for closers); backward pass treats every '*' as ')'. Valid iff neither pass goes negative.`,
    codeLine: 1,
  });

  let open = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    open += ch === ')' ? -1 : 1;

    steps.push({
      state: { chars: [...chars], count: Math.max(open, 0), result: `Forward open count: ${open}` },
      highlights: [i],
      pointers: { i },
      message: `Forward: '${ch}' ${ch === ')' ? 'closes → open--' : ch === '(' ? 'opens → open++' : "is '*', assume the friendliest case '(' → open++"}. open = ${open}.`,
      codeLine: 4,
      action: 'visit',
    });

    if (open < 0) {
      steps.push({
        state: { chars: [...chars], result: 'false' },
        highlights: [i],
        message: `open < 0: this ')' has no possible partner even with every '*' as '('. Return false.`,
        codeLine: 6,
        action: 'found',
      });
      return steps;
    }
  }

  steps.push({
    state: { chars: [...chars], count: 0, result: 'Forward pass OK' },
    highlights: [],
    message: `Forward pass survived — no ')' is ever unmatched. Now scan RIGHT to LEFT treating every '*' as ')' to check the '(' side.`,
    codeLine: 7,
    action: 'compare',
  });

  let close = 0;

  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i];
    close += ch === '(' ? -1 : 1;

    steps.push({
      state: { chars: [...chars], count: Math.max(close, 0), result: `Backward close count: ${close}` },
      highlights: [i],
      pointers: { i },
      message: `Backward: '${ch}' ${ch === '(' ? 'opens → close--' : ch === ')' ? 'closes → close++' : "is '*', assume the friendliest case ')' → close++"}. close = ${close}.`,
      codeLine: 9,
      action: 'visit',
    });

    if (close < 0) {
      steps.push({
        state: { chars: [...chars], result: 'false' },
        highlights: [i],
        message: `close < 0: this '(' has no possible partner even with every '*' as ')'. Return false.`,
        codeLine: 11,
        action: 'found',
      });
      return steps;
    }
  }

  steps.push({
    state: { chars: [...chars], result: 'true' },
    highlights: [],
    message: `Both passes stayed non-negative — every paren can find a partner with some assignment of the '*'s. Return true.`,
    codeLine: 12,
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
    java: `public static boolean checkValidString(String s) {
    int lo = 0, hi = 0;
    for (char c : s.toCharArray()) {
        if (c == '(') {
            lo++;
            hi++;
        } else if (c == ')') {
            lo--;
            hi--;
        } else {
            lo--;
            hi++;
        }
        if (hi < 0) return false;
        lo = Math.max(lo, 0);
    }
    return lo == 0;
}`,
  },
  defaultInput: '(*))',
  run: runValidParenthesisString,
  optimalApproachName: 'Two-Bound Greedy',
  approaches: [
    {
      id: 'two-pass',
      name: 'Two-Pass Counting',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        "Instead of tracking a [lo, hi] range in one pass, make two passes: forward treating '*' as '(' and backward treating '*' as ')' — valid iff neither count goes negative.",
      code: {
        python: `def checkValidString(s):
    open_count = 0
    for c in s:
        open_count += 1 if c in '(*' else -1
        if open_count < 0:
            return False
    close_count = 0
    for c in reversed(s):
        close_count += 1 if c in ')*' else -1
        if close_count < 0:
            return False
    return True`,
        javascript: `function checkValidString(s) {
    let openCount = 0;
    for (const c of s) {
        openCount += c === ')' ? -1 : 1;
        if (openCount < 0) return false;
    }
    let closeCount = 0;
    for (let i = s.length - 1; i >= 0; i--) {
        closeCount += s[i] === '(' ? -1 : 1;
        if (closeCount < 0) return false;
    }
    return true;
}`,
        java: `public static boolean checkValidString(String s) {
    int openCount = 0;
    for (char c : s.toCharArray()) {
        openCount += (c == ')') ? -1 : 1;
        if (openCount < 0) return false;
    }
    int closeCount = 0;
    for (int i = s.length() - 1; i >= 0; i--) {
        closeCount += (s.charAt(i) == '(') ? -1 : 1;
        if (closeCount < 0) return false;
    }
    return true;
}`,
      },
      run: runValidParenthesisStringTwoPass,
      lineExplanations: {
        python: {
          1: 'Define function taking string s',
          2: "Forward counter: opens minus closes, with '*' as '('",
          3: 'Scan left to right',
          4: "'(' and '*' count as +1 (open), ')' as -1",
          5: "Even the friendliest '*' assignment cannot save this ')'",
          6: 'Unmatched close paren — invalid',
          7: "Backward counter: closes minus opens, with '*' as ')'",
          8: 'Scan right to left',
          9: "')' and '*' count as +1 (close), '(' as -1",
          10: "Even the friendliest '*' assignment cannot save this '('",
          11: 'Unmatched open paren — invalid',
          12: 'Both directions check out — some assignment of stars works',
        },
        javascript: {
          1: 'Define function taking string s',
          2: "Forward counter: opens minus closes, with '*' as '('",
          3: 'Scan left to right',
          4: "'(' and '*' count as +1 (open), ')' as -1",
          5: "A ')' has no possible partner — invalid",
          7: "Backward counter: closes minus opens, with '*' as ')'",
          8: 'Scan right to left',
          9: "')' and '*' count as +1 (close), '(' as -1",
          10: "A '(' has no possible partner — invalid",
          12: 'Both directions check out — some assignment of stars works',
        },
        java: {
          1: 'Define method taking string s',
          2: "Forward counter: opens minus closes, with '*' as '('",
          3: 'Scan left to right',
          4: "'(' and '*' count as +1 (open), ')' as -1",
          5: "A ')' has no possible partner — invalid",
          7: "Backward counter: closes minus opens, with '*' as ')'",
          8: 'Scan right to left',
          9: "')' and '*' count as +1 (close), '(' as -1",
          10: "A '(' has no possible partner — invalid",
          12: 'Both directions check out — some assignment of stars works',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string s',
      2: 'Init lo and hi to track open paren range',
      3: 'Iterate through each character',
      4: 'If open paren, both bounds increase',
      5: 'Increment min possible open count',
      6: 'Increment max possible open count',
      8: 'Decrement min possible open count',
      9: 'Decrement max possible open count',
      11: 'Star as close paren decreases lo',
      12: 'Star as open paren increases hi',
      13: 'Too many close parens, invalid',
      14: 'Return false immediately',
      15: 'Clamp lo to zero (choose star as empty)',
      16: 'Valid if min open count is zero',
    },
    javascript: {
      1: 'Define function taking string s',
      2: 'Init lo and hi to track open paren range',
      3: 'Iterate through each character',
      4: 'Open paren: increment both lo and hi',
      5: 'Close paren: decrement both lo and hi',
      6: 'Star: lo-- (as ")"), hi++ (as "(")',
      7: 'Too many close parens, return false',
      8: 'Clamp lo to zero (choose star as empty)',
      10: 'Valid if min open count is zero',
    },
    java: {
      1: 'Define method taking string s',
      2: 'Init lo and hi to track open paren range',
      3: 'Iterate through each character',
      4: 'If open parenthesis',
      5: 'Increment min possible open count',
      6: 'Increment max possible open count',
      8: 'Decrement min possible open count',
      9: 'Decrement max possible open count',
      11: 'Star as close paren decreases lo',
      12: 'Star as open paren increases hi',
      14: 'Too many close parens, return false',
      15: 'Clamp lo to zero (choose star as empty)',
      17: 'Valid if min open count is zero',
    },
  },
};
