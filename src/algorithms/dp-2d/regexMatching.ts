import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface RegexMatchingInput {
  s: string;
  p: string;
}

function runRegexMatching(input: unknown): AlgorithmStep[] {
  const { s, p } = input as RegexMatchingInput;
  const steps: AlgorithmStep[] = [];
  const m = s.length;
  const n = p.length;

  steps.push({
    state: { result: null, s, p },
    highlights: [],
    message: `Does string "${s}" match pattern "${p}"? ('.' = any char, '*' = zero or more of prev)`,
    codeLine: 1,
  });

  // dp2d[i][j] = does s[0..i-1] match p[0..j-1]?
  const dp2d: string[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill('F'));

  dp2d[0][0] = 'T';
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[0, 0]] as [number, number][],
      result: null, s, p,
    },
    highlights: [],
    message: `Base case: dp[0][0] = true (empty string matches empty pattern)`,
    codeLine: 2,
    action: 'insert',
  });

  // Handle patterns like a*, a*b*, a*b*c* that match empty string
  for (let j = 2; j <= n; j++) {
    if (p[j - 1] === '*') {
      dp2d[0][j] = dp2d[0][j - 2];
      steps.push({
        state: {
          dp2d: dp2d.map(r => [...r]),
          matrixHighlights: [[0, j]] as [number, number][],
          result: null, s, p,
        },
        highlights: [],
        message: `Pattern "${p.substring(0, j)}": p[${j - 1}]='*', dp[0][${j}] = dp[0][${j - 2}] = ${dp2d[0][j]} (X* matches zero X's)`,
        codeLine: 3,
        action: 'insert',
      });
    }
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        // Case 1: X* matches zero occurrences (look at dp[i][j-2])
        dp2d[i][j] = dp2d[i][j - 2];

        // Case 2: X* matches one or more (if current char matches X or X is '.')
        if (s[i - 1] === p[j - 2] || p[j - 2] === '.') {
          if (dp2d[i - 1][j] === 'T') {
            dp2d[i][j] = 'T';
          }
        }

        const zeroMatch = dp2d[i][j - 2];
        const charMatch = (s[i - 1] === p[j - 2] || p[j - 2] === '.') ? dp2d[i - 1][j] : 'F';

        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i, j - 2], ...(charMatch !== 'F' ? [[i - 1, j] as [number, number]] : [])] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, s, p,
          },
          highlights: [],
          pointers: { i, j },
          message: `s[${i - 1}]='${s[i - 1]}', p[${j - 2}..${j - 1}]='${p[j - 2]}*': zero_match=${zeroMatch}, char_match=${charMatch} => dp[${i}][${j}]=${dp2d[i][j]}`,
          codeLine: 6,
          action: dp2d[i][j] === 'T' ? 'found' : 'compare',
        });
      } else if (s[i - 1] === p[j - 1] || p[j - 1] === '.') {
        dp2d[i][j] = dp2d[i - 1][j - 1];

        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j - 1]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, s, p,
          },
          highlights: [],
          pointers: { i, j },
          message: `s[${i - 1}]='${s[i - 1]}' matches p[${j - 1}]='${p[j - 1]}': dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp2d[i][j]}`,
          codeLine: 8,
          action: dp2d[i][j] === 'T' ? 'found' : 'compare',
        });
      } else {
        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, s, p,
          },
          highlights: [],
          pointers: { i, j },
          message: `s[${i - 1}]='${s[i - 1]}' != p[${j - 1}]='${p[j - 1]}': dp[${i}][${j}] = F`,
          codeLine: 9,
          action: 'compare',
        });
      }
    }
  }

  const result = dp2d[m][n] === 'T';
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[m, n]] as [number, number][],
      result, s, p,
    },
    highlights: [],
    message: `"${s}" ${result ? 'MATCHES' : 'DOES NOT MATCH'} pattern "${p}"`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runRegexMatchingMemo(input: unknown): AlgorithmStep[] {
  const { s, p } = input as RegexMatchingInput;
  const steps: AlgorithmStep[] = [];
  const m = s.length;
  const n = p.length;
  const MAX_STEPS = 75;

  const memoGrid: string[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill('·'));
  const memo = new Map<string, boolean>();

  steps.push({
    state: { dp2d: memoGrid.map(r => [...r]), result: null, s, p },
    highlights: [],
    message: `Top-down: dfs(i, j) asks "does s[i:] match p[j:]?" starting from (0, 0). Each answer is cached — the table fills only where the recursion actually goes`,
    codeLine: 3,
  });

  function dfs(i: number, j: number): boolean {
    const key = `${i},${j}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    if (j === n) {
      const res = i === m;
      if (steps.length < MAX_STEPS) {
        steps.push({
          state: { dp2d: memoGrid.map(r => [...r]), matrixHighlights: [[i, j]] as [number, number][], result: null, s, p },
          highlights: [],
          pointers: { i, j },
          message: `dfs(${i}, ${n}): pattern exhausted — match only if string is exhausted too → ${res ? 'T' : 'F'}`,
          codeLine: 7,
          action: 'compare',
        });
      }
      return res;
    }

    if (steps.length < MAX_STEPS) {
      steps.push({
        state: { dp2d: memoGrid.map(r => [...r]), matrixHighlights: [[i, j]] as [number, number][], result: null, s, p },
        highlights: [],
        pointers: { i, j },
        message: `dfs(${i}, ${j}): does "${s.slice(i)}" match "${p.slice(j)}"?`,
        codeLine: 3,
        action: 'visit',
      });
    }

    const first = i < m && (p[j] === s[i] || p[j] === '.');
    let res: boolean;
    if (j + 1 < n && p[j + 1] === '*') {
      res = dfs(i, j + 2) || (first && dfs(i + 1, j));
    } else {
      res = first && dfs(i + 1, j + 1);
    }

    memo.set(key, res);
    memoGrid[i][j] = res ? 'T' : 'F';

    if (steps.length < MAX_STEPS) {
      const isStar = j + 1 < n && p[j + 1] === '*';
      steps.push({
        state: { dp2d: memoGrid.map(r => [...r]), matrixHighlights: [[i, j]] as [number, number][], result: null, s, p },
        highlights: [],
        pointers: { i, j },
        message: isStar
          ? `memo[${i}][${j}] = ${res ? 'T' : 'F'}: '${p[j]}*' → skip it (dfs(${i}, ${j + 2})) OR consume '${s[i] ?? ''}' (first=${first} and dfs(${i + 1}, ${j}))`
          : `memo[${i}][${j}] = ${res ? 'T' : 'F'}: single char — first=${first} and dfs(${i + 1}, ${j + 1})`,
        codeLine: 14,
        action: res ? 'found' : 'insert',
      });
    }
    return res;
  }

  const result = dfs(0, 0);

  steps.push({
    state: { dp2d: memoGrid.map(r => [...r]), matrixHighlights: [[0, 0]] as [number, number][], result, s, p },
    highlights: [],
    message: `"${s}" ${result ? 'MATCHES' : 'DOES NOT MATCH'} pattern "${p}" — dfs(0, 0) = ${result ? 'T' : 'F'} with ${memo.size} cached states`,
    codeLine: 16,
    action: 'found',
  });

  return steps;
}

export const regexMatching: Algorithm = {
  id: 'regex-matching',
  name: 'Regular Expression Matching',
  category: '2-D DP',
  difficulty: 'Hard',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DP — handle . and * cases with state transitions',
  description:
    'Given an input string s and a pattern p, implement regular expression matching with support for \'.\' and \'*\' where \'.\' matches any single character and \'*\' matches zero or more of the preceding element.',
  problemUrl: 'https://leetcode.com/problems/regular-expression-matching/',
  code: {
    python: `def isMatch(s, p):
    m, n = len(s), len(p)
    dp = [[False]*(n+1) for _ in range(m+1)]
    dp[0][0] = True
    for j in range(2, n+1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-2]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if p[j-1] == '*':
                dp[i][j] = dp[i][j-2]
                if s[i-1]==p[j-2] or p[j-2]=='.':
                    dp[i][j] = dp[i][j] or \
                        dp[i-1][j]
            elif s[i-1]==p[j-1] or p[j-1]=='.':
                dp[i][j] = dp[i-1][j-1]
    return dp[m][n]`,
    javascript: `function isMatch(s, p) {
    const m = s.length, n = p.length;
    const dp = Array.from({length: m+1},
        () => new Array(n+1).fill(false));
    dp[0][0] = true;
    for (let j = 2; j <= n; j++) {
        if (p[j-1] === '*')
            dp[0][j] = dp[0][j-2];
    }
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (p[j-1] === '*') {
                dp[i][j] = dp[i][j-2];
                if (s[i-1]===p[j-2] || p[j-2]==='.')
                    dp[i][j] = dp[i][j] || dp[i-1][j];
            } else if (s[i-1]===p[j-1] || p[j-1]==='.') {
                dp[i][j] = dp[i-1][j-1];
            }
        }
    }
    return dp[m][n];
}`,
    java: `public boolean isMatch(String s, String p) {
    int m = s.length(), n = p.length();
    boolean[][] dp = new boolean[m + 1][n + 1];
    dp[0][0] = true;
    for (int j = 2; j <= n; j++) {
        if (p.charAt(j - 1) == '*') {
            dp[0][j] = dp[0][j - 2];
        }
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (p.charAt(j - 1) == '*') {
                dp[i][j] = dp[i][j - 2];
                if (s.charAt(i - 1) == p.charAt(j - 2) || p.charAt(j - 2) == '.') {
                    dp[i][j] = dp[i][j] || dp[i - 1][j];
                }
            } else if (s.charAt(i - 1) == p.charAt(j - 1) || p.charAt(j - 1) == '.') {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`,
  },
  defaultInput: { s: 'aa', p: 'a*' },
  run: runRegexMatching,
  optimalApproachName: 'Bottom-Up 2-D DP',
  approaches: [
    {
      id: 'top-down-memo',
      name: 'Top-Down Memoization',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(m·n)',
      description:
        'Recurses from the front of the string and pattern ("does s[i:] match p[j:]?") with a memo cache, computing only the states the match actually reaches instead of the whole table.',
      code: {
        python: `def isMatch(s, p):
    memo = {}
    def dfs(i, j):
        if (i, j) in memo:
            return memo[(i, j)]
        if j == len(p):
            return i == len(s)
        first = i < len(s) and p[j] in (s[i], '.')
        if j + 1 < len(p) and p[j+1] == '*':
            res = (dfs(i, j + 2) or
                (first and dfs(i + 1, j)))
        else:
            res = first and dfs(i + 1, j + 1)
        memo[(i, j)] = res
        return res
    return dfs(0, 0)`,
        javascript: `function isMatch(s, p) {
    const memo = new Map();
    function dfs(i, j) {
        const key = i + ',' + j;
        if (memo.has(key)) return memo.get(key);
        if (j === p.length) return i === s.length;
        const first = i < s.length &&
            (p[j] === s[i] || p[j] === '.');
        let res;
        if (j + 1 < p.length && p[j+1] === '*') {
            res = dfs(i, j + 2) ||
                (first && dfs(i + 1, j));
        } else {
            res = first && dfs(i + 1, j + 1);
        }
        memo.set(key, res);
        return res;
    }
    return dfs(0, 0);
}`,
        java: `public boolean isMatch(String s, String p) {
    Boolean[][] memo = new Boolean[s.length() + 1][p.length() + 1];
    return dfs(s, p, 0, 0, memo);
}

private boolean dfs(String s, String p, int i, int j, Boolean[][] memo) {
    if (memo[i][j] != null) return memo[i][j];
    if (j == p.length()) return i == s.length();
    boolean first = i < s.length()
        && (p.charAt(j) == s.charAt(i) || p.charAt(j) == '.');
    boolean res;
    if (j + 1 < p.length() && p.charAt(j + 1) == '*') {
        res = dfs(s, p, i, j + 2, memo)
            || (first && dfs(s, p, i + 1, j, memo));
    } else {
        res = first && dfs(s, p, i + 1, j + 1, memo);
    }
    memo[i][j] = res;
    return res;
}`,
      },
      run: runRegexMatchingMemo,
      lineExplanations: {
        python: {
          1: 'Define function taking string s and pattern p',
          2: 'Memo dictionary keyed by (i, j) state',
          3: 'dfs(i, j) = does s[i:] match p[j:]?',
          4: 'Cache check: state already solved?',
          5: 'Return the cached boolean',
          6: 'Base case: pattern exhausted',
          7: 'Match only if the string is exhausted too',
          8: 'Does the current char match (literal or dot)?',
          9: 'Is the next pattern char a star?',
          10: 'Star option 1: skip the X* pair entirely',
          11: 'Star option 2: consume one char, stay on X*',
          12: 'No star branch',
          13: 'Plain char: must match and both advance',
          14: 'Cache the answer before returning',
          15: 'Return the result for this state',
          16: 'Kick off recursion from the start of both',
        },
        javascript: {
          1: 'Define function taking string s and pattern p',
          2: 'Memo map keyed by "i,j" state',
          3: 'dfs(i, j) = does s[i:] match p[j:]?',
          4: 'Build the memo key for this state',
          5: 'Return the cached boolean if already solved',
          6: 'Base case: pattern exhausted — string must be too',
          7: 'Does the current char match (literal or dot)?',
          8: 'Continuation of the first-char check',
          9: 'Result for this state',
          10: 'Is the next pattern char a star?',
          11: 'Star option 1: skip the X* pair entirely',
          12: 'Star option 2: consume one char, stay on X*',
          13: 'No star branch',
          14: 'Plain char: must match and both advance',
          16: 'Cache the answer before returning',
          17: 'Return the result for this state',
          19: 'Kick off recursion from the start of both',
        },
        java: {
          1: 'Define method taking string s and pattern p',
          2: 'Boolean[][] memo — null marks unsolved states',
          3: 'Kick off recursion from the start of both',
          6: 'dfs(i, j) = does s[i:] match p[j:]?',
          7: 'Return the cached boolean if already solved',
          8: 'Base case: pattern exhausted — string must be too',
          9: 'Does the current char match (literal or dot)?',
          10: 'Continuation of the first-char check',
          11: 'Result for this state',
          12: 'Is the next pattern char a star?',
          13: 'Star option 1: skip the X* pair entirely',
          14: 'Star option 2: consume one char, stay on X*',
          15: 'No star branch',
          16: 'Plain char: must match and both advance',
          18: 'Cache the answer before returning',
          19: 'Return the result for this state',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string s and pattern p',
      2: 'Get lengths of string and pattern',
      3: 'Create (m+1)x(n+1) DP table of booleans',
      4: 'Base case: empty string matches empty pattern',
      5: 'Handle X* patterns that can match empty string',
      6: 'If pattern char is *, skip the X* pair',
      7: 'X* matches zero occurrences of X',
      8: 'Iterate over each character of s',
      9: 'Iterate over each character of p',
      10: 'Handle * in pattern',
      11: 'Zero match: skip X* pair entirely',
      12: 'If current char matches X (or X is .)',
      13: 'One+ match: extend from previous row',
      14: 'Direct char match or dot matches any char',
      15: 'Copy result from diagonal (both advance)',
      16: 'Return whether full string matches pattern',
    },
    javascript: {
      1: 'Define function taking string s and pattern p',
      2: 'Get lengths of string and pattern',
      3: 'Create (m+1)x(n+1) DP table of booleans',
      4: 'Continuation of array initialization',
      5: 'Base case: empty string matches empty pattern',
      6: 'Handle X* patterns that can match empty string',
      7: 'If pattern char is *',
      8: 'X* matches zero occurrences of X',
      10: 'Iterate over each character of s',
      11: 'Iterate over each character of p',
      12: 'Handle * in pattern',
      13: 'Zero match: skip X* pair entirely',
      14: 'If current char matches X or X is dot',
      15: 'One+ match: extend from previous row',
      16: 'Direct char match or dot matches any char',
      17: 'Copy result from diagonal (both advance)',
      21: 'Return whether full string matches pattern',
    },
    java: {
      1: 'Define method taking string s and pattern p',
      2: 'Get lengths of string and pattern',
      3: 'Create (m+1)x(n+1) DP table of booleans',
      4: 'Base case: empty string matches empty pattern',
      5: 'Handle X* patterns matching empty string',
      6: 'If pattern char is *',
      7: 'X* matches zero occurrences of X',
      10: 'Iterate over each character of s',
      11: 'Iterate over each character of p',
      12: 'Handle * in pattern',
      13: 'Zero match: skip X* pair entirely',
      14: 'If current char matches X or X is dot',
      15: 'One+ match: extend from previous row',
      17: 'Direct char match or dot matches any char',
      18: 'Copy result from diagonal (both advance)',
      22: 'Return whether full string matches pattern',
    },
  },
};
