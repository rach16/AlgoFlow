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

function runLongestIncreasingPathTopo(input: unknown): AlgorithmStep[] {
  const matrix = input as number[][];
  const steps: AlgorithmStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  steps.push({
    state: { dp2d: matrix.map(r => [...r]), result: null },
    highlights: [],
    message: `Think of the matrix as a graph: each cell points to strictly larger neighbors. The longest increasing path = number of layers when we peel this DAG like an onion`,
    codeLine: 1,
  });

  // Out-degree: number of strictly larger neighbors
  const outdeg: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {
          outdeg[r][c]++;
        }
      }
    }
  }

  steps.push({
    state: { dp2d: outdeg.map(r => [...r]), result: null },
    highlights: [],
    message: `Compute each cell's out-degree = count of larger neighbors. Cells with out-degree 0 are local peaks: every increasing path must END at one`,
    codeLine: 11,
    action: 'insert',
  });

  let queue: [number, number][] = [];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (outdeg[r][c] === 0) queue.push([r, c]);
    }
  }

  steps.push({
    state: {
      dp2d: outdeg.map(r => [...r]),
      matrixHighlights: queue.map(([r, c]) => [r, c] as [number, number]),
      result: null,
    },
    highlights: [],
    message: `Layer 1 candidates: peaks ${queue.map(([r, c]) => `(${r},${c})=${matrix[r][c]}`).join(', ')} — paths of length 1 end here`,
    codeLine: 13,
    action: 'push',
  });

  let layers = 0;
  while (queue.length > 0) {
    layers++;
    const nxt: [number, number][] = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] < matrix[r][c]) {
          outdeg[nr][nc]--;
          if (outdeg[nr][nc] === 0) nxt.push([nr, nc]);
        }
      }
    }

    steps.push({
      state: {
        dp2d: outdeg.map(r2 => [...r2]),
        matrixHighlights: queue.map(([r, c]) => [r, c] as [number, number]),
        matrixSecondary: nxt.map(([r, c]) => [r, c] as [number, number]),
        result: null,
      },
      highlights: [],
      pointers: { layer: layers },
      message: `Peel layer ${layers}: remove ${queue.map(([r, c]) => matrix[r][c]).join(', ')} and decrement smaller neighbors' out-degrees${nxt.length > 0 ? ` — newly freed: ${nxt.map(([r, c]) => matrix[r][c]).join(', ')}` : ' — nothing left to free'}`,
      codeLine: 16,
      action: 'pop',
    });

    queue = nxt;
  }

  steps.push({
    state: { dp2d: outdeg.map(r => [...r]), result: layers },
    highlights: [],
    message: `Peeled ${layers} layers, so the longest increasing path has length ${layers} — no recursion needed, just BFS`,
    codeLine: 27,
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
  optimalApproachName: 'DFS + Memoization',
  approaches: [
    {
      id: 'topological-peeling',
      name: 'Topological Sort (Peel Layers)',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(m·n)',
      description:
        'Replaces recursion with Kahn\'s algorithm: treat cells as a DAG pointing to larger neighbors, repeatedly peel the cells with out-degree 0 — the number of peeled layers is the longest path.',
      code: {
        python: `def longestIncreasingPath(matrix):
    m, n = len(matrix), len(matrix[0])
    dirs = [(0,1),(0,-1),(1,0),(-1,0)]
    outdeg = [[0]*n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            for dr, dc in dirs:
                nr, nc = r+dr, c+dc
                if (0<=nr<m and 0<=nc<n and
                    matrix[nr][nc] > matrix[r][c]):
                    outdeg[r][c] += 1
    queue = [(r, c) for r in range(m)
        for c in range(n) if outdeg[r][c] == 0]
    layers = 0
    while queue:
        layers += 1
        nxt = []
        for r, c in queue:
            for dr, dc in dirs:
                nr, nc = r+dr, c+dc
                if (0<=nr<m and 0<=nc<n and
                    matrix[nr][nc] < matrix[r][c]):
                    outdeg[nr][nc] -= 1
                    if outdeg[nr][nc] == 0:
                        nxt.append((nr, nc))
        queue = nxt
    return layers`,
        javascript: `function longestIncreasingPath(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    const outdeg = Array.from({length: m},
        () => new Array(n).fill(0));
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            for (const [dr, dc] of dirs) {
                const nr = r+dr, nc = c+dc;
                if (nr>=0 && nr<m && nc>=0 && nc<n &&
                    matrix[nr][nc] > matrix[r][c])
                    outdeg[r][c]++;
            }
    let queue = [];
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            if (outdeg[r][c] === 0) queue.push([r, c]);
    let layers = 0;
    while (queue.length) {
        layers++;
        const nxt = [];
        for (const [r, c] of queue) {
            for (const [dr, dc] of dirs) {
                const nr = r+dr, nc = c+dc;
                if (nr>=0 && nr<m && nc>=0 && nc<n &&
                    matrix[nr][nc] < matrix[r][c] &&
                    --outdeg[nr][nc] === 0)
                    nxt.push([nr, nc]);
            }
        }
        queue = nxt;
    }
    return layers;
}`,
        java: `public int longestIncreasingPath(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
    int[][] outdeg = new int[m][n];
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n
                        && matrix[nr][nc] > matrix[r][c])
                    outdeg[r][c]++;
            }
    List<int[]> queue = new ArrayList<>();
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (outdeg[r][c] == 0) queue.add(new int[]{r, c});
    int layers = 0;
    while (!queue.isEmpty()) {
        layers++;
        List<int[]> nxt = new ArrayList<>();
        for (int[] cell : queue) {
            for (int[] d : dirs) {
                int nr = cell[0] + d[0], nc = cell[1] + d[1];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n
                        && matrix[nr][nc] < matrix[cell[0]][cell[1]]
                        && --outdeg[nr][nc] == 0)
                    nxt.add(new int[]{nr, nc});
            }
        }
        queue = nxt;
    }
    return layers;
}`,
      },
      run: runLongestIncreasingPathTopo,
      lineExplanations: {
        python: {
          1: 'Define function taking matrix as input',
          2: 'Get matrix dimensions m and n',
          3: 'Four movement directions',
          4: 'outdeg[r][c] = number of strictly larger neighbors',
          5: 'Visit every cell...',
          6: '...in every column...',
          7: '...checking each direction',
          8: 'Compute neighbor coordinates',
          9: 'Neighbor must be in bounds...',
          10: '...and strictly larger (an edge in the DAG)',
          11: 'Count the outgoing edge',
          12: 'Seed the queue with all peaks',
          13: 'Peaks have out-degree 0: increasing paths end there',
          14: 'Layer counter = longest path length so far',
          15: 'Peel one layer per iteration',
          16: 'Each layer adds 1 to the longest path',
          17: 'Collect cells freed by this peel',
          18: 'Remove every cell in the current layer',
          19: 'Look at its neighbors',
          20: 'Compute neighbor coordinates',
          21: 'Neighbor must be in bounds...',
          22: '...and strictly smaller (edge pointing at us)',
          23: 'Removing this cell deletes one of its outgoing edges',
          24: 'Neighbor freed once all its larger neighbors are gone',
          25: 'It joins the next layer',
          26: 'Move on to the next layer',
          27: 'Number of layers = longest increasing path',
        },
        javascript: {
          1: 'Define function taking matrix as input',
          2: 'Get matrix dimensions m and n',
          3: 'Four movement directions',
          4: 'outdeg[r][c] = number of strictly larger neighbors',
          6: 'Visit every cell',
          7: 'Iterate columns',
          8: 'Check each direction',
          9: 'Compute neighbor coordinates',
          10: 'Neighbor must be in bounds...',
          11: '...and strictly larger (an edge in the DAG)',
          12: 'Count the outgoing edge',
          14: 'Queue of cells ready to peel',
          15: 'Scan all cells',
          17: 'Seed with peaks (out-degree 0): paths end there',
          18: 'Layer counter = longest path length so far',
          19: 'Peel one layer per iteration',
          20: 'Each layer adds 1 to the longest path',
          21: 'Collect cells freed by this peel',
          22: 'Remove every cell in the current layer',
          23: 'Look at its neighbors',
          24: 'Compute neighbor coordinates',
          25: 'Neighbor must be in bounds...',
          26: '...and strictly smaller (edge pointing at us)',
          27: 'Decrement; if all larger neighbors are gone...',
          28: '...it joins the next layer',
          31: 'Move on to the next layer',
          33: 'Number of layers = longest increasing path',
        },
        java: {
          1: 'Define method taking matrix as input',
          2: 'Get matrix dimensions m and n',
          3: 'Four movement directions',
          4: 'outdeg[r][c] = number of strictly larger neighbors',
          5: 'Visit every cell',
          6: 'Iterate columns',
          7: 'Check each direction',
          8: 'Compute neighbor coordinates',
          9: 'Neighbor must be in bounds...',
          10: '...and strictly larger (an edge in the DAG)',
          11: 'Count the outgoing edge',
          13: 'Queue of cells ready to peel',
          14: 'Scan all cells',
          16: 'Seed with peaks (out-degree 0): paths end there',
          17: 'Layer counter = longest path length so far',
          18: 'Peel one layer per iteration',
          19: 'Each layer adds 1 to the longest path',
          20: 'Collect cells freed by this peel',
          21: 'Remove every cell in the current layer',
          22: 'Look at its neighbors',
          23: 'Compute neighbor coordinates',
          24: 'Neighbor must be in bounds...',
          25: '...and strictly smaller (edge pointing at us)',
          26: 'Decrement; if all larger neighbors are gone...',
          27: '...it joins the next layer',
          30: 'Move on to the next layer',
          32: 'Number of layers = longest increasing path',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking matrix as input',
      2: 'Get matrix dimensions m and n',
      3: 'Create memoization dictionary',
      4: 'Define DFS helper for cell (r, c)',
      5: 'Return cached result if already computed',
      6: 'Return memoized value',
      7: 'Start with path length 1 (the cell itself)',
      8: 'Try all four directions',
      9: 'Compute neighbor coordinates',
      10: 'Check bounds and increasing value',
      11: 'Continuation of bounds check',
      12: 'Update max path via recursive DFS',
      13: 'Cache result for cell (r, c)',
      14: 'Return the longest path from this cell',
      15: 'Run DFS from every cell, return overall max',
      16: 'Iterate over all rows',
      17: 'Iterate over all columns',
    },
    javascript: {
      1: 'Define function taking matrix as input',
      2: 'Get matrix dimensions m and n',
      3: 'Create memo table filled with zeros',
      4: 'Continuation of memo initialization',
      5: 'Define four movement directions',
      6: 'Define DFS helper for cell (r, c)',
      7: 'Return cached result if already computed',
      8: 'Start with path length 1 (the cell itself)',
      9: 'Try all four directions',
      10: 'Compute neighbor coordinates',
      11: 'Check bounds and increasing value',
      12: 'Continuation of bounds check',
      13: 'Update max path via recursive DFS',
      15: 'Cache result for cell (r, c)',
      16: 'Return the longest path from this cell',
      18: 'Initialize global answer to 0',
      19: 'Iterate over all rows',
      20: 'Iterate over all columns',
      21: 'Update answer with max DFS result',
      22: 'Return longest increasing path length',
    },
    java: {
      1: 'Define method taking matrix as input',
      2: 'Get matrix dimensions m and n',
      3: 'Create memo table initialized to 0',
      4: 'Initialize result to 0',
      5: 'Iterate over all rows',
      6: 'Iterate over all columns',
      7: 'Update result with max DFS path',
      10: 'Return longest increasing path length',
      13: 'Define DFS helper method',
      14: 'Return cached result if already computed',
      15: 'Start with path length 1 (the cell itself)',
      16: 'Define four movement directions',
      17: 'Try each direction',
      18: 'Compute neighbor coordinates',
      19: 'Check bounds and increasing value',
      20: 'Continuation of bounds check',
      21: 'Update max path via recursive DFS',
      24: 'Cache result for cell (r, c)',
      25: 'Return the longest path from this cell',
    },
  },
};
