import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface DistinctSubsequencesInput {
  s: string;
  t: string;
}

function runDistinctSubsequences(input: unknown): AlgorithmStep[] {
  const { s, t } = input as DistinctSubsequencesInput;
  const steps: AlgorithmStep[] = [];
  const m = s.length;
  const n = t.length;

  steps.push({
    state: { result: null, chars: s.split(''), s, t },
    highlights: [],
    message: `Count distinct subsequences of "${s}" that equal "${t}"`,
    codeLine: 1,
  });

  // dp2d[i][j] = number of distinct subsequences of s[0..i-1] that equals t[0..j-1]
  const dp2d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Base case: empty t can be matched by any prefix of s (by deleting all chars)
  for (let i = 0; i <= m; i++) {
    dp2d[i][0] = 1;
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: Array.from({ length: m + 1 }, (_, i): [number, number] => [i, 0]),
      result: null, s, t,
    },
    highlights: [],
    message: `Base case: dp[i][0] = 1 for all i (empty t matches any s prefix by deleting all)`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // Always include the case where we skip s[i-1]
      dp2d[i][j] = dp2d[i - 1][j];

      if (s[i - 1] === t[j - 1]) {
        dp2d[i][j] += dp2d[i - 1][j - 1];

        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j], [i - 1, j - 1]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, s, t,
          },
          highlights: [],
          pointers: { i, j },
          message: `s[${i - 1}]='${s[i - 1]}' == t[${j - 1}]='${t[j - 1]}': dp[${i}][${j}] = dp[${i - 1}][${j}] + dp[${i - 1}][${j - 1}] = ${dp2d[i - 1][j]} + ${dp2d[i - 1][j - 1]} = ${dp2d[i][j]}`,
          codeLine: 6,
          action: 'found',
        });
      } else {
        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, s, t,
          },
          highlights: [],
          pointers: { i, j },
          message: `s[${i - 1}]='${s[i - 1]}' != t[${j - 1}]='${t[j - 1]}': dp[${i}][${j}] = dp[${i - 1}][${j}] = ${dp2d[i][j]}`,
          codeLine: 8,
          action: 'compare',
        });
      }
    }
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[m, n]] as [number, number][],
      result: dp2d[m][n], s, t,
    },
    highlights: [],
    message: `Number of distinct subsequences of "${s}" that equal "${t}": ${dp2d[m][n]}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const distinctSubsequences: Algorithm = {
  id: 'distinct-subsequences',
  name: 'Distinct Subsequences',
  category: '2-D DP',
  difficulty: 'Hard',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DP — dp[i][j] = ways to form t[:j] from s[:i]',
  description:
    'Given two strings s and t, return the number of distinct subsequences of s which equals t.',
  problemUrl: 'https://leetcode.com/problems/distinct-subsequences/',
  code: {
    python: `def numDistinct(s, t):
    m, n = len(s), len(t)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1):
        dp[i][0] = 1
    for i in range(1, m+1):
        for j in range(1, n+1):
            dp[i][j] = dp[i-1][j]
            if s[i-1] == t[j-1]:
                dp[i][j] += dp[i-1][j-1]
    return dp[m][n]`,
    javascript: `function numDistinct(s, t) {
    const m = s.length, n = t.length;
    const dp = Array.from({length: m+1},
        () => new Array(n+1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = 1;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = dp[i-1][j];
            if (s[i-1] === t[j-1])
                dp[i][j] += dp[i-1][j-1];
        }
    }
    return dp[m][n];
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: { s: 'rabbbit', t: 'rabbit' },
  run: runDistinctSubsequences,
};
