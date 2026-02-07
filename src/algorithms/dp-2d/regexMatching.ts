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
};
