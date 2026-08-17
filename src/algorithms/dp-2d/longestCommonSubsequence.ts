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

function runLCSRolling1D(input: unknown): AlgorithmStep[] {
  const { text1, text2 } = input as LCSInput;
  const steps: AlgorithmStep[] = [];
  const m = text1.length;
  const n = text2.length;
  const labels = ['∅', ...text2.split('')];

  const dp: number[] = new Array(n + 1).fill(0);

  steps.push({
    state: { dp: [...dp], dpLabels: labels, result: null, text1, text2 },
    highlights: [],
    message: `Space trick: the 2-D recurrence only ever looks at the PREVIOUS row, so one array of size ${n + 1} is enough`,
    codeLine: 1,
  });

  steps.push({
    state: { dp: [...dp], dpLabels: labels, result: null, text1, text2 },
    highlights: [],
    message: `dp[j] = LCS of the text1 prefix processed so far vs text2[0..j-1]. Start all zeros (empty prefix)`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 1; i <= m; i++) {
    let prev = 0; // dp[i-1][j-1] from the old row

    steps.push({
      state: { dp: [...dp], dpLabels: labels, chars: text1.split(''), result: null, text1, text2 },
      highlights: [i - 1],
      pointers: { i },
      message: `Row ${i}: process text1[${i - 1}] = '${text1[i - 1]}'. prev holds the old diagonal dp[i-1][j-1], starting at 0`,
      codeLine: 5,
      action: 'visit',
    });

    for (let j = 1; j <= n; j++) {
      const temp = dp[j]; // old dp[i-1][j], becomes next diagonal
      if (text1[i - 1] === text2[j - 1]) {
        dp[j] = prev + 1;
        steps.push({
          state: { dp: [...dp], dpLabels: labels, dpHighlights: [j], dpSecondary: [j - 1], result: null, text1, text2 },
          highlights: [],
          pointers: { i, j },
          message: `'${text1[i - 1]}' == '${text2[j - 1]}': dp[${j}] = prev(diagonal) + 1 = ${prev} + 1 = ${dp[j]}`,
          codeLine: 9,
          action: 'found',
        });
      } else {
        dp[j] = Math.max(dp[j], dp[j - 1]);
        steps.push({
          state: { dp: [...dp], dpLabels: labels, dpHighlights: [j], dpSecondary: [j - 1], result: null, text1, text2 },
          highlights: [],
          pointers: { i, j },
          message: `'${text1[i - 1]}' != '${text2[j - 1]}': dp[${j}] = max(above=${temp}, left=${dp[j - 1]}) = ${dp[j]}`,
          codeLine: 11,
          action: 'compare',
        });
      }
      prev = temp;
    }
  }

  steps.push({
    state: { dp: [...dp], dpLabels: labels, dpHighlights: [n], result: dp[n], text1, text2 },
    highlights: [],
    message: `LCS length = dp[${n}] = ${dp[n]} — same answer as the 2-D table, but only O(n) memory`,
    codeLine: 13,
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
    java: `public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}`,
  },
  defaultInput: { text1: 'abcde', text2: 'ace' },
  run: runLongestCommonSubsequence,
  optimalApproachName: '2-D DP Table',
  approaches: [
    {
      id: 'rolling-1d-array',
      name: 'Rolling 1-D Array',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(min(m, n))',
      description:
        'Same recurrence as the 2-D table, but since each row only depends on the previous one, a single 1-D array (plus one saved diagonal value) replaces the whole matrix.',
      code: {
        python: `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [0] * (n + 1)
    for i in range(1, m + 1):
        prev = 0
        for j in range(1, n + 1):
            temp = dp[j]
            if text1[i-1] == text2[j-1]:
                dp[j] = prev + 1
            else:
                dp[j] = max(dp[j], dp[j-1])
            prev = temp
    return dp[n]`,
        javascript: `function longestCommonSubsequence(text1, text2) {
    const m = text1.length, n = text2.length;
    const dp = new Array(n + 1).fill(0);
    for (let i = 1; i <= m; i++) {
        let prev = 0;
        for (let j = 1; j <= n; j++) {
            const temp = dp[j];
            if (text1[i-1] === text2[j-1]) {
                dp[j] = prev + 1;
            } else {
                dp[j] = Math.max(dp[j], dp[j-1]);
            }
            prev = temp;
        }
    }
    return dp[n];
}`,
        java: `public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[] dp = new int[n + 1];
    for (int i = 1; i <= m; i++) {
        int prev = 0;
        for (int j = 1; j <= n; j++) {
            int temp = dp[j];
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[j] = prev + 1;
            } else {
                dp[j] = Math.max(dp[j], dp[j - 1]);
            }
            prev = temp;
        }
    }
    return dp[n];
}`,
      },
      run: runLCSRolling1D,
      lineExplanations: {
        python: {
          1: 'Define function taking two strings',
          2: 'Get lengths of both strings',
          3: 'One row of size n+1 replaces the whole 2-D table',
          4: 'Iterate over each character of text1 (the "rows")',
          5: 'prev = dp[i-1][j-1], the diagonal from the old row',
          6: 'Iterate over each character of text2 (the "columns")',
          7: 'Save old dp[j] (dp[i-1][j]) before overwriting — next diagonal',
          8: 'Check if characters at current positions match',
          9: 'Match: extend the diagonal LCS by 1',
          10: 'No match branch',
          11: 'Take max of above (old dp[j]) and left (new dp[j-1])',
          12: 'Slide the saved diagonal forward for the next column',
          13: 'Return LCS length from the final row',
        },
        javascript: {
          1: 'Define function taking two strings',
          2: 'Get lengths of both strings',
          3: 'One row of size n+1 replaces the whole 2-D table',
          4: 'Iterate over each character of text1 (the "rows")',
          5: 'prev = dp[i-1][j-1], the diagonal from the old row',
          6: 'Iterate over each character of text2 (the "columns")',
          7: 'Save old dp[j] (dp[i-1][j]) before overwriting — next diagonal',
          8: 'Check if characters at current positions match',
          9: 'Match: extend the diagonal LCS by 1',
          10: 'No match branch',
          11: 'Take max of above (old dp[j]) and left (new dp[j-1])',
          13: 'Slide the saved diagonal forward for the next column',
          16: 'Return LCS length from the final row',
        },
        java: {
          1: 'Define method taking two strings',
          2: 'Get lengths of both strings',
          3: 'One row of size n+1 replaces the whole 2-D table',
          4: 'Iterate over each character of text1 (the "rows")',
          5: 'prev = dp[i-1][j-1], the diagonal from the old row',
          6: 'Iterate over each character of text2 (the "columns")',
          7: 'Save old dp[j] (dp[i-1][j]) before overwriting — next diagonal',
          8: 'Check if characters at current positions match',
          9: 'Match: extend the diagonal LCS by 1',
          10: 'No match branch',
          11: 'Take max of above (old dp[j]) and left (new dp[j-1])',
          13: 'Slide the saved diagonal forward for the next column',
          16: 'Return LCS length from the final row',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking two strings',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table filled with zeros',
      4: 'Iterate over each character of text1',
      5: 'Iterate over each character of text2',
      6: 'Check if characters at current positions match',
      7: 'Match: extend LCS from diagonal by 1',
      9: 'No match: take max of skipping either char',
      10: 'Continuation of max expression',
      11: 'Return LCS length at dp[m][n]',
    },
    javascript: {
      1: 'Define function taking two strings',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table filled with zeros',
      4: 'Continuation of array initialization',
      5: 'Iterate over each character of text1',
      6: 'Iterate over each character of text2',
      7: 'Check if characters at current positions match',
      8: 'Match: extend LCS from diagonal by 1',
      10: 'No match: take max of skipping either char',
      11: 'Continuation of max expression',
      15: 'Return LCS length at dp[m][n]',
    },
    java: {
      1: 'Define method taking two strings',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table initialized to 0',
      4: 'Iterate over each character of text1',
      5: 'Iterate over each character of text2',
      6: 'Check if characters at current positions match',
      7: 'Match: extend LCS from diagonal by 1',
      9: 'No match: take max of skipping either char',
      13: 'Return LCS length at dp[m][n]',
    },
  },
};
