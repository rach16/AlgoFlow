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

function runEditDistanceRollingRows(input: unknown): AlgorithmStep[] {
  const { word1, word2 } = input as EditDistanceInput;
  const steps: AlgorithmStep[] = [];
  const m = word1.length;
  const n = word2.length;
  const labels = ['∅', ...word2.split('')];

  let prev: number[] = Array.from({ length: n + 1 }, (_, j) => j);

  steps.push({
    state: { dp: [...prev], dpLabels: labels, result: null, word1, word2 },
    highlights: [],
    message: `Space trick: each 2-D row only reads the row above it, so two 1-D rows of size ${n + 1} suffice`,
    codeLine: 1,
  });

  steps.push({
    state: { dp: [...prev], dpLabels: labels, dpHighlights: Array.from({ length: n + 1 }, (_, j) => j), result: null, word1, word2 },
    highlights: [],
    message: `Base row (empty word1 prefix): converting "" to word2[0..j-1] costs j insertions`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 1; i <= m; i++) {
    const curr: number[] = new Array(n + 1).fill(0);
    curr[0] = i;

    steps.push({
      state: { dp: [...curr], dpLabels: labels, dpHighlights: [0], chars: word1.split(''), result: null, word1, word2 },
      highlights: [i - 1],
      pointers: { i },
      message: `Row ${i}: process word1[${i - 1}] = '${word1[i - 1]}'. curr[0] = ${i} (delete all ${i} chars to reach "")`,
      codeLine: 5,
      action: 'visit',
    });

    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        curr[j] = prev[j - 1];
        steps.push({
          state: { dp: [...curr], dpLabels: labels, dpHighlights: [j], dpSecondary: [j - 1], result: null, word1, word2 },
          highlights: [],
          pointers: { i, j },
          message: `'${word1[i - 1]}' == '${word2[j - 1]}': free — copy diagonal from previous row: curr[${j}] = ${curr[j]}`,
          codeLine: 8,
          action: 'compare',
        });
      } else {
        const insertOp = curr[j - 1] + 1;
        const deleteOp = prev[j] + 1;
        const replaceOp = prev[j - 1] + 1;
        curr[j] = Math.min(insertOp, deleteOp, replaceOp);
        steps.push({
          state: { dp: [...curr], dpLabels: labels, dpHighlights: [j], dpSecondary: [j - 1], result: null, word1, word2 },
          highlights: [],
          pointers: { i, j },
          message: `'${word1[i - 1]}' != '${word2[j - 1]}': curr[${j}] = 1 + min(insert=${curr[j - 1]}, delete=${prev[j]}, replace=${prev[j - 1]}) = ${curr[j]}`,
          codeLine: 10,
          action: 'insert',
        });
      }
    }

    prev = curr;
  }

  steps.push({
    state: { dp: [...prev], dpLabels: labels, dpHighlights: [n], result: prev[n], word1, word2 },
    highlights: [],
    message: `Minimum edit distance from "${word1}" to "${word2}": ${prev[n]} — computed with only two rows of memory`,
    codeLine: 13,
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
  optimalApproachName: '2-D DP Table',
  approaches: [
    {
      id: 'rolling-rows',
      name: 'Rolling Rows (1-D)',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(n)',
      description:
        'Identical recurrence to the 2-D table, but keeps only the previous and current rows, cutting space from O(m·n) to O(n).',
      code: {
        python: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    prev = list(range(n + 1))
    for i in range(1, m + 1):
        curr = [i] + [0] * n
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                curr[j] = prev[j-1]
            else:
                curr[j] = 1 + min(curr[j-1],
                    prev[j], prev[j-1])
        prev = curr
    return prev[n]`,
        javascript: `function minDistance(word1, word2) {
    const m = word1.length, n = word2.length;
    let prev = Array.from({length: n + 1}, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        const curr = new Array(n + 1).fill(0);
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            if (word1[i-1] === word2[j-1]) {
                curr[j] = prev[j-1];
            } else {
                curr[j] = 1 + Math.min(curr[j-1],
                    prev[j], prev[j-1]);
            }
        }
        prev = curr;
    }
    return prev[n];
}`,
        java: `public int minDistance(String word1, String word2) {
    int m = word1.length(), n = word2.length();
    int[] prev = new int[n + 1];
    for (int j = 0; j <= n; j++) prev[j] = j;
    for (int i = 1; i <= m; i++) {
        int[] curr = new int[n + 1];
        curr[0] = i;
        for (int j = 1; j <= n; j++) {
            if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                curr[j] = prev[j - 1];
            } else {
                curr[j] = 1 + Math.min(curr[j - 1],
                    Math.min(prev[j], prev[j - 1]));
            }
        }
        prev = curr;
    }
    return prev[n];
}`,
      },
      run: runEditDistanceRollingRows,
      lineExplanations: {
        python: {
          1: 'Define function taking two strings',
          2: 'Get lengths of both strings',
          3: 'Previous row = base cases: "" to word2[:j] costs j inserts',
          4: 'Iterate over each character of word1 (one row at a time)',
          5: 'New row starts with curr[0] = i (delete all i chars)',
          6: 'Iterate over each character of word2',
          7: 'Check if characters match',
          8: 'Match: free — copy the diagonal from the previous row',
          9: 'No match branch',
          10: 'curr[j-1] = insert, then...',
          11: 'prev[j] = delete, prev[j-1] = replace; take min + 1',
          12: 'Current row becomes the previous row for the next i',
          13: 'Answer sits at the end of the last computed row',
        },
        javascript: {
          1: 'Define function taking two strings',
          2: 'Get lengths of both strings',
          3: 'Previous row = base cases: "" to word2[:j] costs j inserts',
          4: 'Iterate over each character of word1 (one row at a time)',
          5: 'Allocate the new current row',
          6: 'curr[0] = i (delete all i chars of word1 prefix)',
          7: 'Iterate over each character of word2',
          8: 'Check if characters match',
          9: 'Match: free — copy the diagonal from the previous row',
          10: 'No match branch',
          11: 'curr[j-1] = insert, then...',
          12: 'prev[j] = delete, prev[j-1] = replace; take min + 1',
          15: 'Current row becomes the previous row for the next i',
          17: 'Answer sits at the end of the last computed row',
        },
        java: {
          1: 'Define method taking two strings',
          2: 'Get lengths of both strings',
          3: 'Allocate the previous row',
          4: 'Base cases: "" to word2[:j] costs j inserts',
          5: 'Iterate over each character of word1 (one row at a time)',
          6: 'Allocate the new current row',
          7: 'curr[0] = i (delete all i chars of word1 prefix)',
          8: 'Iterate over each character of word2',
          9: 'Check if characters match',
          10: 'Match: free — copy the diagonal from the previous row',
          11: 'No match branch',
          12: 'curr[j-1] = insert, then...',
          13: 'prev[j] = delete, prev[j-1] = replace; take min + 1',
          16: 'Current row becomes the previous row for the next i',
          18: 'Answer sits at the end of the last computed row',
        },
      },
    },
  ],
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
