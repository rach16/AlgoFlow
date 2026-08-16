import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runGenerateParentheses(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];
  const result: string[] = [];

  steps.push({
    state: { chars: [], stack: [], result: [] },
    highlights: [],
    message: `Generate all valid combinations of ${n} pairs of parentheses`,
    codeLine: 1,
  });

  function backtrack(current: string[], openCount: number, closeCount: number) {
    // Show current state
    steps.push({
      state: {
        chars: [...current],
        stack: [`open:${openCount}`, `close:${closeCount}`],
        result: [...result],
      },
      highlights: current.length > 0 ? [current.length - 1] : [],
      message: `Current: "${current.join('')}" | open=${openCount}, close=${closeCount}`,
      codeLine: 3,
      action: 'visit',
    });

    // Base case: valid combination found
    if (openCount === n && closeCount === n) {
      const combo = current.join('');
      result.push(combo);

      steps.push({
        state: {
          chars: [...current],
          stack: [`open:${openCount}`, `close:${closeCount}`],
          result: [...result],
        },
        highlights: Array.from({ length: current.length }, (_, i) => i),
        message: `Found valid combination: "${combo}" (total found: ${result.length})`,
        codeLine: 5,
        action: 'found',
      });
      return;
    }

    // Add open parenthesis if we can
    if (openCount < n) {
      current.push('(');
      steps.push({
        state: {
          chars: [...current],
          stack: [`open:${openCount + 1}`, `close:${closeCount}`],
          result: [...result],
        },
        highlights: [current.length - 1],
        message: `Add '(' -> "${current.join('')}" (open: ${openCount} -> ${openCount + 1})`,
        codeLine: 7,
        action: 'push',
      });

      backtrack(current, openCount + 1, closeCount);

      current.pop();
      steps.push({
        state: {
          chars: [...current],
          stack: [`open:${openCount}`, `close:${closeCount}`],
          result: [...result],
        },
        highlights: current.length > 0 ? [current.length - 1] : [],
        message: `Backtrack: remove '(' -> "${current.join('')}"`,
        codeLine: 9,
        action: 'pop',
      });
    }

    // Add close parenthesis if we can
    if (closeCount < openCount) {
      current.push(')');
      steps.push({
        state: {
          chars: [...current],
          stack: [`open:${openCount}`, `close:${closeCount + 1}`],
          result: [...result],
        },
        highlights: [current.length - 1],
        message: `Add ')' -> "${current.join('')}" (close: ${closeCount} -> ${closeCount + 1})`,
        codeLine: 11,
        action: 'push',
      });

      backtrack(current, openCount, closeCount + 1);

      current.pop();
      steps.push({
        state: {
          chars: [...current],
          stack: [`open:${openCount}`, `close:${closeCount}`],
          result: [...result],
        },
        highlights: current.length > 0 ? [current.length - 1] : [],
        message: `Backtrack: remove ')' -> "${current.join('')}"`,
        codeLine: 13,
        action: 'pop',
      });
    }
  }

  backtrack([], 0, 0);

  steps.push({
    state: {
      chars: [],
      stack: [],
      result: [...result],
    },
    highlights: [],
    message: `Done! Generated ${result.length} valid combinations: [${result.map((r) => `"${r}"`).join(', ')}]`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

function runGenerateParenthesesBFS(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];
  const result: string[] = [];
  const queue: [string, number, number][] = [['', 0, 0]];

  const queueDisplay = () => queue.map(([str]) => (str === '' ? 'ε' : str));

  steps.push({
    state: { chars: [], stack: queueDisplay(), result: [] },
    highlights: [],
    message: `BFS instead of recursion: grow every valid prefix level by level from an explicit queue — no call stack, no backtracking`,
    codeLine: 3,
  });

  while (queue.length > 0) {
    const [current, openCount, closeCount] = queue.shift()!;
    const curChars = current.split('');

    steps.push({
      state: { chars: [...curChars], stack: queueDisplay(), result: [...result] },
      highlights: curChars.length > 0 ? [curChars.length - 1] : [],
      message: `Dequeue "${current || 'ε'}" (open=${openCount}, close=${closeCount})`,
      codeLine: 6,
      action: 'visit',
    });

    if (current.length === 2 * n) {
      result.push(current);

      steps.push({
        state: { chars: [...curChars], stack: queueDisplay(), result: [...result] },
        highlights: curChars.map((_, i) => i),
        message: `"${current}" uses all ${n} pairs — complete combination! (total found: ${result.length})`,
        codeLine: 8,
        action: 'found',
      });
      continue;
    }

    if (openCount < n) {
      queue.push([current + '(', openCount + 1, closeCount]);

      steps.push({
        state: { chars: [...curChars], stack: queueDisplay(), result: [...result] },
        highlights: [],
        message: `open ${openCount} < ${n}: extending with '(' is always safe — enqueue "${current + '('}"`,
        codeLine: 11,
        action: 'push',
      });
    }

    if (closeCount < openCount) {
      queue.push([current + ')', openCount, closeCount + 1]);

      steps.push({
        state: { chars: [...curChars], stack: queueDisplay(), result: [...result] },
        highlights: [],
        message: `close ${closeCount} < open ${openCount}: an unmatched '(' exists to close — enqueue "${current + ')'}"`,
        codeLine: 13,
        action: 'push',
      });
    }
  }

  steps.push({
    state: { chars: [], stack: [], result: [...result] },
    highlights: [],
    message: `Queue empty — done! Generated ${result.length} valid combinations: [${result.map((r) => `"${r}"`).join(', ')}]`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const generateParentheses: Algorithm = {
  id: 'generate-parentheses',
  name: 'Generate Parentheses',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(4ⁿ/√n)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking + Stack — add open if < n, close if < open',
  description:
    'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses. Use backtracking: only add open parenthesis if open count < n, and only add close parenthesis if close count < open count.',
  problemUrl: 'https://leetcode.com/problems/generate-parentheses/',
  code: {
    python: `def generateParenthesis(n):
    result = []

    def backtrack(current, openCount, closeCount):
        if openCount == closeCount == n:
            result.append("".join(current))
            return

        if openCount < n:
            current.append("(")
            backtrack(current, openCount + 1, closeCount)
            current.pop()

        if closeCount < openCount:
            current.append(")")
            backtrack(current, openCount, closeCount + 1)
            current.pop()

    backtrack([], 0, 0)
    return result`,
    javascript: `function generateParenthesis(n) {
    const result = [];

    function backtrack(current, openCount, closeCount) {
        if (openCount === closeCount && openCount === n) {
            result.push(current.join(""));
            return;
        }

        if (openCount < n) {
            current.push("(");
            backtrack(current, openCount + 1, closeCount);
            current.pop();
        }

        if (closeCount < openCount) {
            current.push(")");
            backtrack(current, openCount, closeCount + 1);
            current.pop();
        }
    }

    backtrack([], 0, 0);
    return result;
}`,
    java: `public static List<String> generateParenthesis(int n) {
    List<String> result = new ArrayList<>();

    backtrack(result, new StringBuilder(), 0, 0, n);
    return result;
}

private static void backtrack(List<String> result, StringBuilder current, int openCount, int closeCount, int n) {
    if (openCount == closeCount && openCount == n) {
        result.add(current.toString());
        return;
    }

    if (openCount < n) {
        current.append("(");
        backtrack(result, current, openCount + 1, closeCount, n);
        current.deleteCharAt(current.length() - 1);
    }

    if (closeCount < openCount) {
        current.append(")");
        backtrack(result, current, openCount, closeCount + 1, n);
        current.deleteCharAt(current.length() - 1);
    }
}`,
  },
  defaultInput: 3,
  run: runGenerateParentheses,
  optimalApproachName: 'Backtracking (DFS)',
  approaches: [
    {
      id: 'iterative-bfs',
      name: 'Iterative BFS',
      timeComplexity: 'O(4ⁿ/√n)',
      spaceComplexity: 'O(4ⁿ/√n)',
      description:
        'Replaces recursive backtracking with an explicit queue: every valid prefix is grown level by level, trading the O(n) call stack for a queue that holds a whole level at once.',
      code: {
        python: `def generateParenthesis(n):
    result = []
    queue = [("", 0, 0)]

    while queue:
        current, openN, closeN = queue.pop(0)
        if len(current) == 2 * n:
            result.append(current)
            continue
        if openN < n:
            queue.append((current + "(", openN + 1, closeN))
        if closeN < openN:
            queue.append((current + ")", openN, closeN + 1))

    return result`,
        javascript: `function generateParenthesis(n) {
    const result = [];
    const queue = [["", 0, 0]];

    while (queue.length) {
        const [current, open, close] = queue.shift();
        if (current.length === 2 * n) {
            result.push(current);
            continue;
        }
        if (open < n) queue.push([current + "(", open + 1, close]);
        if (close < open) queue.push([current + ")", open, close + 1]);
    }

    return result;
}`,
        java: `public static List<String> generateParenthesis(int n) {
    List<String> result = new ArrayList<>();
    Queue<String> queue = new LinkedList<>();
    queue.add("");

    while (!queue.isEmpty()) {
        String current = queue.poll();
        int open = 0, close = 0;
        for (char c : current.toCharArray()) {
            if (c == '(') open++;
            else close++;
        }
        if (current.length() == 2 * n) {
            result.add(current);
            continue;
        }
        if (open < n) queue.add(current + "(");
        if (close < open) queue.add(current + ")");
    }

    return result;
}`,
      },
      run: runGenerateParenthesesBFS,
      lineExplanations: {
        python: {
          1: 'Define function taking number of pairs n',
          2: 'Initialize list to store complete combinations',
          3: 'Queue seeded with the empty prefix (0 open, 0 close)',
          5: 'Process prefixes until the queue is drained',
          6: 'Dequeue the oldest prefix with its bracket counts',
          7: 'Prefix already has all 2n characters?',
          8: 'It is a complete valid combination — save it',
          9: 'Skip extending — this string is finished',
          10: 'Room for another opener?',
          11: "Enqueue the prefix extended with '('",
          12: "Any unmatched '(' that a ')' could close?",
          13: "Enqueue the prefix extended with ')'",
          15: 'Return all valid combinations',
        },
        javascript: {
          1: 'Define function taking number of pairs n',
          2: 'Initialize array to store complete combinations',
          3: 'Queue seeded with the empty prefix (0 open, 0 close)',
          5: 'Process prefixes until the queue is drained',
          6: 'Dequeue the oldest prefix with its bracket counts',
          7: 'Prefix already has all 2n characters?',
          8: 'It is a complete valid combination — save it',
          9: 'Skip extending — this string is finished',
          11: "Room for another opener? Enqueue prefix + '('",
          12: "Unmatched '(' available? Enqueue prefix + ')'",
          15: 'Return all valid combinations',
        },
        java: {
          1: 'Define method returning list of strings',
          2: 'Initialize list to store complete combinations',
          3: 'Explicit FIFO queue of prefixes',
          4: 'Seed the queue with the empty prefix',
          6: 'Process prefixes until the queue is drained',
          7: 'Dequeue the oldest prefix',
          8: 'Recount its open and close brackets',
          9: 'Scan each character of the prefix',
          10: 'Count opening brackets',
          11: 'Count closing brackets',
          13: 'Prefix already has all 2n characters?',
          14: 'It is a complete valid combination — save it',
          15: 'Skip extending — this string is finished',
          17: "Room for another opener? Enqueue prefix + '('",
          18: "Unmatched '(' available? Enqueue prefix + ')'",
          21: 'Return all valid combinations',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking number of pairs n',
      2: 'Initialize list to store valid combinations',
      4: 'Define backtrack helper with current state',
      5: 'Base case: all parens used, save result',
      6: 'Join current list into string and append',
      7: 'Return to explore other branches',
      9: 'If we can still add open parentheses',
      10: 'Append open paren to current combination',
      11: 'Recurse with incremented open count',
      12: 'Backtrack by removing last character',
      14: 'If close count less than open count',
      15: 'Append close paren to current combination',
      16: 'Recurse with incremented close count',
      17: 'Backtrack by removing last character',
      19: 'Start backtracking from empty state',
      20: 'Return all valid combinations',
    },
    javascript: {
      1: 'Define function taking number of pairs n',
      2: 'Initialize array to store valid combinations',
      4: 'Define backtrack helper with current state',
      5: 'Base case: all parens used, save result',
      6: 'Join current array into string and push',
      7: 'Return to explore other branches',
      10: 'If we can still add open parentheses',
      11: 'Push open paren to current combination',
      12: 'Recurse with incremented open count',
      13: 'Backtrack by removing last character',
      16: 'If close count less than open count',
      17: 'Push close paren to current combination',
      18: 'Recurse with incremented close count',
      19: 'Backtrack by removing last character',
      22: 'Start backtracking from empty state',
      23: 'Return all valid combinations',
    },
    java: {
      1: 'Define method returning list of strings',
      2: 'Initialize list to store valid combinations',
      4: 'Start backtracking from empty state',
      5: 'Return all valid combinations',
      8: 'Define backtrack helper method',
      9: 'Base case: all parens used, save result',
      10: 'Add current string to result list',
      11: 'Return to explore other branches',
      14: 'If we can still add open parentheses',
      15: 'Append open paren to StringBuilder',
      16: 'Recurse with incremented open count',
      17: 'Backtrack by removing last character',
      20: 'If close count less than open count',
      21: 'Append close paren to StringBuilder',
      22: 'Recurse with incremented close count',
      23: 'Backtrack by removing last character',
    },
  },
};
