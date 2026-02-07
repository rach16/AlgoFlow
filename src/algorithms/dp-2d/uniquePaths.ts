import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface UniquePathsInput {
  m: number;
  n: number;
}

function runUniquePaths(input: unknown): AlgorithmStep[] {
  const { m, n } = input as UniquePathsInput;
  const steps: AlgorithmStep[] = [];

  // Create 2D DP table
  const dp2d: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  steps.push({
    state: { dp2d: dp2d.map(r => [...r]), matrixHighlights: [] as [number, number][], result: null, m, n },
    highlights: [],
    message: `Find number of unique paths in a ${m}x${n} grid (can only move right or down)`,
    codeLine: 1,
  });

  // Fill first row with 1s
  for (let j = 0; j < n; j++) {
    dp2d[0][j] = 1;
  }
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: Array.from({ length: n }, (_, j): [number, number] => [0, j]),
      result: null,
    },
    highlights: [],
    message: `First row: only one way to reach each cell (go right)`,
    codeLine: 3,
    action: 'insert',
  });

  // Fill first column with 1s
  for (let i = 0; i < m; i++) {
    dp2d[i][0] = 1;
  }
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: Array.from({ length: m }, (_, i): [number, number] => [i, 0]),
      result: null,
    },
    highlights: [],
    message: `First column: only one way to reach each cell (go down)`,
    codeLine: 5,
    action: 'insert',
  });

  // Fill rest of the table
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      const fromTop = dp2d[i - 1][j];
      const fromLeft = dp2d[i][j - 1];

      steps.push({
        state: {
          dp2d: dp2d.map(r => [...r]),
          matrixHighlights: [[i - 1, j], [i, j - 1]] as [number, number][],
          matrixSecondary: [[i, j]] as [number, number][],
          result: null,
        },
        highlights: [],
        pointers: { row: i, col: j },
        message: `dp[${i}][${j}] = dp[${i - 1}][${j}] + dp[${i}][${j - 1}] = ${fromTop} + ${fromLeft}`,
        codeLine: 7,
        action: 'compare',
      });

      dp2d[i][j] = fromTop + fromLeft;

      steps.push({
        state: {
          dp2d: dp2d.map(r => [...r]),
          matrixHighlights: [[i, j]] as [number, number][],
          result: null,
        },
        highlights: [],
        message: `dp[${i}][${j}] = ${dp2d[i][j]}`,
        codeLine: 7,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[m - 1, n - 1]] as [number, number][],
      result: dp2d[m - 1][n - 1],
    },
    highlights: [],
    message: `Number of unique paths: ${dp2d[m - 1][n - 1]}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const uniquePaths: Algorithm = {
  id: 'unique-paths',
  name: 'Unique Paths',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[r][c] = dp[r-1][c] + dp[r][c-1]',
  description:
    'There is a robot on an m x n grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time. How many possible unique paths are there?',
  problemUrl: 'https://leetcode.com/problems/unique-paths/',
  code: {
    python: `def uniquePaths(m, n):
    dp = [[0] * n for _ in range(m)]
    for j in range(n):
        dp[0][j] = 1
    for i in range(m):
        dp[i][0] = 1
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]`,
    javascript: `function uniquePaths(m, n) {
    const dp = Array.from({length: m},
        () => new Array(n).fill(0));
    for (let j = 0; j < n; j++) dp[0][j] = 1;
    for (let i = 0; i < m; i++) dp[i][0] = 1;
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }
    return dp[m-1][n-1];
}`,
    java: `public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    return dp[m - 1][n - 1];
}`,
  },
  defaultInput: { m: 3, n: 7 },
  run: runUniquePaths,
};
