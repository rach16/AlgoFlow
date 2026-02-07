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
};
