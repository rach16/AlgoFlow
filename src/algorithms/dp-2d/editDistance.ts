import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface EditDistanceInput {
  word1: string;
  word2: string;
}

function runEditDistance(input: unknown): AlgorithmStep[] {
  const { word1, word2 } = input as EditDistanceInput;
  const steps: AlgorithmStep[] = [];
  const m = word1.length;
  const n = word2.length;

  steps.push({
    state: { result: null, word1, word2 },
    highlights: [],
    message: `Find minimum operations to convert "${word1}" to "${word2}" (insert, delete, replace)`,
    codeLine: 1,
  });

  // dp2d[i][j] = min operations to convert word1[0..i-1] to word2[0..j-1]
  const dp2d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Base cases
  for (let i = 0; i <= m; i++) dp2d[i][0] = i;
  for (let j = 0; j <= n; j++) dp2d[0][j] = j;

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [
        ...Array.from({ length: m + 1 }, (_, i): [number, number] => [i, 0]),
        ...Array.from({ length: n + 1 }, (_, j): [number, number] => [0, j]),
      ],
      result: null, word1, word2,
    },
    highlights: [],
    message: `Base cases: dp[i][0]=i (delete all from word1), dp[0][j]=j (insert all from word2)`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp2d[i][j] = dp2d[i - 1][j - 1];

        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j - 1]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, word1, word2,
          },
          highlights: [],
          pointers: { i, j },
          message: `'${word1[i - 1]}' == '${word2[j - 1]}': no operation needed. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp2d[i][j]}`,
          codeLine: 5,
          action: 'compare',
        });
      } else {
        const insertOp = dp2d[i][j - 1] + 1;
        const deleteOp = dp2d[i - 1][j] + 1;
        const replaceOp = dp2d[i - 1][j - 1] + 1;
        dp2d[i][j] = Math.min(insertOp, deleteOp, replaceOp);

        const opName = dp2d[i][j] === insertOp ? 'insert' :
                       dp2d[i][j] === deleteOp ? 'delete' : 'replace';

        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i, j - 1], [i - 1, j], [i - 1, j - 1]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, word1, word2,
          },
          highlights: [],
          pointers: { i, j },
          message: `'${word1[i - 1]}' != '${word2[j - 1]}': min(insert=${insertOp}, delete=${deleteOp}, replace=${replaceOp}) = ${dp2d[i][j]} (${opName})`,
          codeLine: 7,
          action: 'insert',
        });
      }
    }
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[m, n]] as [number, number][],
      result: dp2d[m][n], word1, word2,
    },
    highlights: [],
    message: `Minimum edit distance from "${word1}" to "${word2}": ${dp2d[m][n]}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const editDistance: Algorithm = {
  id: 'edit-distance',
  name: 'Edit Distance',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DP — min of insert, delete, replace operations',
  description:
    'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations: Insert a character, Delete a character, Replace a character.',
  problemUrl: 'https://leetcode.com/problems/edit-distance/',
  code: {
    python: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i
    for j in range(n+1): dp[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(
                    dp[i][j-1],
                    dp[i-1][j],
                    dp[i-1][j-1])
    return dp[m][n]`,
    javascript: `function minDistance(word1, word2) {
    const m = word1.length, n = word2.length;
    const dp = Array.from({length: m+1},
        () => new Array(n+1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i-1] === word2[j-1]) {
                dp[i][j] = dp[i-1][j-1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i][j-1],
                    dp[i-1][j],
                    dp[i-1][j-1]);
            }
        }
    }
    return dp[m][n];
}`,
    java: `public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i][j - 1],
                    Math.min(dp[i - 1][j], dp[i - 1][j - 1]));
            }
        }
    }
    return dp[m][n];
}`,
  },
  defaultInput: { word1: 'horse', word2: 'ros' },
  run: runEditDistance,
  lineExplanations: {
    python: {
      1: 'Define function taking two strings',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table filled with zeros',
      4: 'Base case: deleting all chars from word1',
      5: 'Base case: inserting all chars of word2',
      6: 'Iterate over each character of word1',
      7: 'Iterate over each character of word2',
      8: 'Check if characters match',
      9: 'Match: no edit needed, take diagonal value',
      11: 'No match: 1 + min of insert, delete, replace',
      12: 'Insert: dp[i][j-1]',
      13: 'Delete: dp[i-1][j]',
      14: 'Replace: dp[i-1][j-1]',
      15: 'Return minimum edit distance',
    },
    javascript: {
      1: 'Define function taking two strings',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table filled with zeros',
      4: 'Continuation of array initialization',
      5: 'Base case: deleting all chars from word1',
      6: 'Base case: inserting all chars of word2',
      7: 'Iterate over each character of word1',
      8: 'Iterate over each character of word2',
      9: 'Check if characters match',
      10: 'Match: no edit needed, take diagonal value',
      12: 'No match: 1 + min of insert, delete, replace',
      13: 'Insert: dp[i][j-1]',
      14: 'Delete: dp[i-1][j]',
      15: 'Replace: dp[i-1][j-1]',
      19: 'Return minimum edit distance',
    },
    java: {
      1: 'Define method taking two strings',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table initialized to 0',
      4: 'Base case: deleting all chars from word1',
      5: 'Base case: inserting all chars of word2',
      6: 'Iterate over each character of word1',
      7: 'Iterate over each character of word2',
      8: 'Check if characters match',
      9: 'Match: no edit needed, take diagonal value',
      11: 'No match: 1 + min of insert, delete, replace',
      12: 'Continuation of min with delete and replace',
      16: 'Return minimum edit distance',
    },
  },
};
