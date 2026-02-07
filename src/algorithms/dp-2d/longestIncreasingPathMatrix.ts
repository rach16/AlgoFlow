import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLongestIncreasingPathMatrix(input: unknown): AlgorithmStep[] {
  const matrix = input as number[][];
  const steps: AlgorithmStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;

  steps.push({
    state: { dp2d: matrix.map(r => [...r]), result: null },
    highlights: [],
    message: `Find longest increasing path in ${m}x${n} matrix (move up/down/left/right)`,
    codeLine: 1,
  });

  // Memoization table
  const memo: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  function dfs(r: number, c: number): number {
    if (memo[r][c] !== 0) return memo[r][c];

    let maxPath = 1;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {
        maxPath = Math.max(maxPath, 1 + dfs(nr, nc));
      }
    }

    memo[r][c] = maxPath;
    return maxPath;
  }

  let result = 0;
  let bestR = 0;
  let bestC = 0;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (memo[i][j] === 0) {
        steps.push({
          state: {
            dp2d: memo.map(r => [...r]),
            matrixHighlights: [[i, j]] as [number, number][],
            result,
          },
          highlights: [],
          pointers: { row: i, col: j },
          message: `DFS from cell (${i},${j}) with value ${matrix[i][j]}`,
          codeLine: 4,
          action: 'visit',
        });

        const pathLen = dfs(i, j);

        steps.push({
          state: {
            dp2d: memo.map(r => [...r]),
            matrixHighlights: [[i, j]] as [number, number][],
            result,
          },
          highlights: [],
          pointers: { row: i, col: j },
          message: `Longest path from (${i},${j}): ${pathLen}`,
          codeLine: 7,
          action: 'insert',
        });

        if (pathLen > result) {
          result = pathLen;
          bestR = i;
          bestC = j;
          steps.push({
            state: {
              dp2d: memo.map(r => [...r]),
              matrixHighlights: [[i, j]] as [number, number][],
              result,
            },
            highlights: [],
            message: `New longest path: ${result} starting from (${i},${j})`,
            codeLine: 8,
            action: 'found',
          });
        }
      } else {
        steps.push({
          state: {
            dp2d: memo.map(r => [...r]),
            matrixHighlights: [[i, j]] as [number, number][],
            result,
          },
          highlights: [],
          message: `Cell (${i},${j}) already computed: memo[${i}][${j}] = ${memo[i][j]}`,
          codeLine: 5,
        });
      }
    }
  }

  steps.push({
    state: {
      dp2d: memo.map(r => [...r]),
      matrixHighlights: [[bestR, bestC]] as [number, number][],
      result,
    },
    highlights: [],
    message: `Longest increasing path in matrix: ${result}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const longestIncreasingPathMatrix: Algorithm = {
  id: 'longest-increasing-path-matrix',
  name: 'Longest Increasing Path in a Matrix',
  category: '2-D DP',
  difficulty: 'Hard',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DFS + Memoization — cache longest path from each cell',
  description:
    'Given an m x n integers matrix, return the length of the longest increasing path in matrix. From each cell, you can either move in four directions: left, right, up, or down.',
  problemUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/',
  code: {
    python: `def longestIncreasingPath(matrix):
    m, n = len(matrix), len(matrix[0])
    memo = {}
    def dfs(r, c):
        if (r, c) in memo:
            return memo[(r, c)]
        res = 1
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r+dr, c+dc
            if (0<=nr<m and 0<=nc<n and
                matrix[nr][nc] > matrix[r][c]):
                res = max(res, 1 + dfs(nr, nc))
        memo[(r, c)] = res
        return res
    return max(dfs(r, c)
        for r in range(m)
        for c in range(n))`,
    javascript: `function longestIncreasingPath(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const memo = Array.from({length: m},
        () => new Array(n).fill(0));
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    function dfs(r, c) {
        if (memo[r][c]) return memo[r][c];
        let res = 1;
        for (const [dr, dc] of dirs) {
            const nr = r+dr, nc = c+dc;
            if (nr>=0 && nr<m && nc>=0 && nc<n &&
                matrix[nr][nc] > matrix[r][c])
                res = Math.max(res, 1+dfs(nr,nc));
        }
        memo[r][c] = res;
        return res;
    }
    let ans = 0;
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            ans = Math.max(ans, dfs(r, c));
    return ans;
}`,
    java: `public int longestIncreasingPath(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    int[][] memo = new int[m][n];
    int result = 0;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            result = Math.max(result, dfs(matrix, r, c, memo));
        }
    }
    return result;
}

private int dfs(int[][] matrix, int r, int c, int[][] memo) {
    if (memo[r][c] != 0) return memo[r][c];
    int res = 1;
    int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    for (int[] dir : dirs) {
        int nr = r + dir[0], nc = c + dir[1];
        if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix[0].length
                && matrix[nr][nc] > matrix[r][c]) {
            res = Math.max(res, 1 + dfs(matrix, nr, nc, memo));
        }
    }
    memo[r][c] = res;
    return res;
}`,
  },
  defaultInput: [[9, 9, 4], [6, 6, 8], [2, 1, 1]],
  run: runLongestIncreasingPathMatrix,
};
