import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface LCSInput {
  text1: string;
  text2: string;
}

function runLongestCommonSubsequence(input: unknown): AlgorithmStep[] {
  const { text1, text2 } = input as LCSInput;
  const steps: AlgorithmStep[] = [];
  const m = text1.length;
  const n = text2.length;

  // dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]
  const dp2d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  steps.push({
    state: { dp2d: dp2d.map(r => [...r]), chars: text1.split(''), result: null, text1, text2 },
    highlights: [],
    message: `Find longest common subsequence of "${text1}" and "${text2}"`,
    codeLine: 1,
  });

  steps.push({
    state: { dp2d: dp2d.map(r => [...r]), chars: text1.split(''), result: null, text1, text2 },
    highlights: [],
    message: `Initialize: dp table of size ${m + 1}x${n + 1} with zeros (base cases: empty string has LCS 0)`,
    codeLine: 2,
    action: 'insert',
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j - 1]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, text1, text2,
          },
          highlights: [],
          pointers: { i, j },
          message: `text1[${i - 1}]='${text1[i - 1]}' == text2[${j - 1}]='${text2[j - 1]}': dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp2d[i - 1][j - 1]} + 1`,
          codeLine: 5,
          action: 'compare',
        });

        dp2d[i][j] = dp2d[i - 1][j - 1] + 1;
      } else {
        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j], [i, j - 1]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, text1, text2,
          },
          highlights: [],
          pointers: { i, j },
          message: `text1[${i - 1}]='${text1[i - 1]}' != text2[${j - 1}]='${text2[j - 1]}': dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${dp2d[i - 1][j]}, ${dp2d[i][j - 1]})`,
          codeLine: 7,
          action: 'compare',
        });

        dp2d[i][j] = Math.max(dp2d[i - 1][j], dp2d[i][j - 1]);
      }

      steps.push({
        state: {
          dp2d: dp2d.map(r => [...r]),
          matrixHighlights: [[i, j]] as [number, number][],
          result: null, text1, text2,
        },
        highlights: [],
        message: `dp[${i}][${j}] = ${dp2d[i][j]}`,
        codeLine: 8,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[m, n]] as [number, number][],
      result: dp2d[m][n], text1, text2,
    },
    highlights: [],
    message: `Length of longest common subsequence: ${dp2d[m][n]}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const longestCommonSubsequence: Algorithm = {
  id: 'longest-common-subsequence',
  name: 'Longest Common Subsequence',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DP — match chars diagonally, else max of skip one',
  description:
    'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.',
  problemUrl: 'https://leetcode.com/problems/longest-common-subsequence/',
  code: {
    python: `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j],
                               dp[i][j-1])
    return dp[m][n]`,
    javascript: `function longestCommonSubsequence(text1, text2) {
    const m = text1.length, n = text2.length;
    const dp = Array.from({length: m+1},
        () => new Array(n+1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i-1] === text2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j],
                                    dp[i][j-1]);
            }
        }
    }
    return dp[m][n];
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: { text1: 'abcde', text2: 'ace' },
  run: runLongestCommonSubsequence,
};
