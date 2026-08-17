import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MinimumPathSumInput {
  grid: number[][];
}

function runMinimumPathSum(input: unknown): AlgorithmStep[] {
  const { grid } = input as MinimumPathSumInput;
  const steps: AlgorithmStep[] = [];
  const m = grid.length;
  const n = grid[0].length;

  const dp2d: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  const snap = (
    hl: [number, number][],
    sec: [number, number][],
    result: number | null,
  ) => ({
    matrix: grid.map(r => [...r]),
    dp2d: dp2d.map(r => [...r]),
    matrixHighlights: hl,
    matrixSecondary: sec,
    result,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Walk from top-left to bottom-right moving only right or down, minimizing the sum of the numbers stepped on. dp[i][j] = cheapest cost to REACH cell (i, j)`,
    codeLine: 1,
  });

  dp2d[0][0] = grid[0][0];

  steps.push({
    state: snap([[0, 0]], [], null),
    highlights: [],
    message: `dp[0][0] = ${grid[0][0]} — reaching the start just costs the start cell itself`,
    codeLine: 4,
    action: 'insert',
  });

  for (let j = 1; j < n; j++) {
    dp2d[0][j] = dp2d[0][j - 1] + grid[0][j];
    steps.push({
      state: snap([[0, j - 1]], [[0, j]], null),
      highlights: [],
      pointers: { row: 0, col: j },
      message: `Top row has no choices — you can only arrive from the left: dp[0][${j}] = ${dp2d[0][j - 1]} + ${grid[0][j]} = ${dp2d[0][j]}`,
      codeLine: 6,
      action: 'insert',
    });
  }

  for (let i = 1; i < m; i++) {
    dp2d[i][0] = dp2d[i - 1][0] + grid[i][0];
    steps.push({
      state: snap([[i - 1, 0]], [[i, 0]], null),
      highlights: [],
      pointers: { row: i, col: 0 },
      message: `Left column has no choices either — you can only arrive from above: dp[${i}][0] = ${dp2d[i - 1][0]} + ${grid[i][0]} = ${dp2d[i][0]}`,
      codeLine: 8,
      action: 'insert',
    });
  }

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      const fromTop = dp2d[i - 1][j];
      const fromLeft = dp2d[i][j - 1];
      const winner = fromTop <= fromLeft ? 'above' : 'left';

      steps.push({
        state: snap([[i - 1, j], [i, j - 1]], [[i, j]], null),
        highlights: [],
        pointers: { row: i, col: j },
        message: `Two ways into (${i}, ${j}): from above costs ${fromTop}, from the left costs ${fromLeft}. Take the cheaper one — ${winner}`,
        codeLine: 11,
        action: 'compare',
      });

      dp2d[i][j] = grid[i][j] + Math.min(fromTop, fromLeft);

      steps.push({
        state: snap([[i, j]], [], null),
        highlights: [],
        pointers: { row: i, col: j },
        message: `dp[${i}][${j}] = grid ${grid[i][j]} + min(${fromTop}, ${fromLeft}) = ${dp2d[i][j]}`,
        codeLine: 11,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: snap([[m - 1, n - 1]], [], dp2d[m - 1][n - 1]),
    highlights: [],
    message: `Minimum path sum = ${dp2d[m - 1][n - 1]}. Every cell was solved exactly once, so this is O(m·n)`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runMinimumPathSumRollingRow(input: unknown): AlgorithmStep[] {
  const { grid } = input as MinimumPathSumInput;
  const steps: AlgorithmStep[] = [];
  const m = grid.length;
  const n = grid[0].length;

  const labels = Array.from({ length: n }, (_, j) => `c${j}`);
  const dp: number[] = new Array(n).fill(Infinity);

  const show = () => dp.map(v => (v === Infinity ? '∞' : v));

  const snap = (
    cell: [number, number][],
    hl: number[],
    sec: number[],
    result: number | null,
  ) => ({
    matrix: grid.map(r => [...r]),
    matrixHighlights: cell,
    dp: show(),
    dpLabels: labels,
    dpHighlights: hl,
    dpSecondary: sec,
    result,
  });

  steps.push({
    state: snap([], [], [], null),
    highlights: [],
    message: `A cell only ever reads the row above and its left neighbour, so one array of ${n} costs is enough — no m×n table needed`,
    codeLine: 1,
  });

  dp[0] = 0;

  steps.push({
    state: snap([], [0], [], null),
    highlights: [],
    message: `dp[j] = cheapest cost to reach column j of the row processed so far. Start with dp = [0, ∞, …]: only column 0 of the phantom row above is enterable, for free`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 0; i < m; i++) {
    steps.push({
      state: snap(Array.from({ length: n }, (_, j): [number, number] => [i, j]), [], [], null),
      highlights: [],
      pointers: { row: i },
      message: `Row ${i} = [${grid[i].join(', ')}] — sweep left to right, turning dp from "row ${i - 1}" into "row ${i}" as we go`,
      codeLine: 5,
      action: 'visit',
    });

    const before0 = dp[0];
    dp[0] += grid[i][0];
    steps.push({
      state: snap([[i, 0]], [0], [], null),
      highlights: [],
      pointers: { row: i, col: 0 },
      message: `Column 0 can only be entered from above: dp[0] = ${before0} + ${grid[i][0]} = ${dp[0]}`,
      codeLine: 6,
      action: 'insert',
    });

    for (let j = 1; j < n; j++) {
      const above = dp[j];
      const left = dp[j - 1];
      dp[j] = grid[i][j] + Math.min(above, left);
      steps.push({
        state: snap([[i, j]], [j], [j - 1], null),
        highlights: [],
        pointers: { row: i, col: j },
        message: `dp[${j}] = ${grid[i][j]} + min(${above === Infinity ? '∞' : above} above, ${left} left) = ${dp[j]} — the old dp[${j}] is overwritten the moment it is consumed`,
        codeLine: 8,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: snap([[m - 1, n - 1]], [n - 1], [], dp[n - 1]),
    highlights: [],
    message: `dp[${n - 1}] = ${dp[n - 1]} — identical answer to the full table, using O(n) space`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const minimumPathSum: Algorithm = {
  id: 'minimum-path-sum',
  name: 'Minimum Path Sum',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DP — dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])',
  description:
    'Given an m x n grid filled with non-negative numbers, find a path from the top-left to the bottom-right that minimizes the sum of all numbers along the path. You may only move either down or right at any point in time.',
  problemUrl: 'https://leetcode.com/problems/minimum-path-sum/',
  code: {
    python: `def minPathSum(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = grid[0][0]
    for j in range(1, n):
        dp[0][j] = dp[0][j-1] + grid[0][j]
    for i in range(1, m):
        dp[i][0] = dp[i-1][0] + grid[i][0]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
    return dp[m-1][n-1]`,
    javascript: `function minPathSum(grid) {
    const m = grid.length, n = grid[0].length;
    const dp = Array.from({length: m},
        () => new Array(n).fill(0));
    dp[0][0] = grid[0][0];
    for (let j = 1; j < n; j++)
        dp[0][j] = dp[0][j-1] + grid[0][j];
    for (let i = 1; i < m; i++)
        dp[i][0] = dp[i-1][0] + grid[i][0];
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = grid[i][j] +
                Math.min(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m-1][n-1];
}`,
    java: `public static int minPathSum(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    int[][] dp = new int[m][n];
    dp[0][0] = grid[0][0];
    for (int j = 1; j < n; j++)
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    for (int i = 1; i < m; i++)
        dp[i][0] = dp[i - 1][0] + grid[i][0];
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = grid[i][j] +
                Math.min(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m - 1][n - 1];
}`,
  },
  defaultInput: { grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]] },
  run: runMinimumPathSum,
  optimalApproachName: '2-D DP Table',
  approaches: [
    {
      id: 'rolling-row-1d',
      name: '1-D Rolling Row',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(n)',
      description:
        'Collapses the table to a single row of running costs that is overwritten in place, since dp[i][j] only depends on the entry directly above and the one already updated to its left.',
      code: {
        python: `def minPathSum(grid):
    n = len(grid[0])
    dp = [float('inf')] * n
    dp[0] = 0
    for row in grid:
        dp[0] += row[0]
        for j in range(1, n):
            dp[j] = row[j] + min(dp[j], dp[j-1])
    return dp[n-1]`,
        javascript: `function minPathSum(grid) {
    const n = grid[0].length;
    const dp = new Array(n).fill(Infinity);
    dp[0] = 0;
    for (const row of grid) {
        dp[0] += row[0];
        for (let j = 1; j < n; j++) {
            dp[j] = row[j] + Math.min(dp[j], dp[j-1]);
        }
    }
    return dp[n-1];
}`,
        java: `public static int minPathSum(int[][] grid) {
    int n = grid[0].length;
    int[] dp = new int[n];
    for (int j = 1; j < n; j++) dp[j] = Integer.MAX_VALUE;
    for (int[] row : grid) {
        dp[0] += row[0];
        for (int j = 1; j < n; j++) {
            dp[j] = row[j] + Math.min(dp[j], dp[j - 1]);
        }
    }
    return dp[n - 1];
}`,
      },
      run: runMinimumPathSumRollingRow,
      lineExplanations: {
        python: {
          1: 'Define function taking the cost grid',
          2: 'Width of the grid — length of the rolling row',
          3: 'Unreachable columns start at infinity',
          4: 'Only column 0 of the phantom row above is enterable, for free',
          5: 'Process one grid row at a time, overwriting dp in place',
          6: 'Column 0 can only be entered from directly above',
          7: 'Sweep the remaining columns left to right',
          8: 'dp[j] is still the row above; dp[j-1] is already this row',
          9: 'Last column after the last row is the cheapest path',
        },
        javascript: {
          1: 'Define function taking the cost grid',
          2: 'Width of the grid — length of the rolling row',
          3: 'Unreachable columns start at Infinity',
          4: 'Only column 0 of the phantom row above is enterable, for free',
          5: 'Process one grid row at a time, overwriting dp in place',
          6: 'Column 0 can only be entered from directly above',
          7: 'Sweep the remaining columns left to right',
          8: 'dp[j] is still the row above; dp[j-1] is already this row',
          11: 'Last column after the last row is the cheapest path',
        },
        java: {
          1: 'Define method taking the cost grid',
          2: 'Width of the grid — length of the rolling row',
          3: 'Allocate the single rolling row; dp[0] starts at 0',
          4: 'Every other column starts unreachable',
          5: 'Process one grid row at a time, overwriting dp in place',
          6: 'Column 0 can only be entered from directly above',
          7: 'Sweep the remaining columns left to right',
          8: 'dp[j] is still the row above; dp[j-1] is already this row',
          11: 'Last column after the last row is the cheapest path',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the cost grid',
      2: 'Read the grid dimensions',
      3: 'Create an m x n table of cheapest costs',
      4: 'Reaching the start costs the start cell itself',
      5: 'Fill the top row — no choice but to come from the left',
      6: 'Running prefix sum across the first row',
      7: 'Fill the left column — no choice but to come from above',
      8: 'Running prefix sum down the first column',
      9: 'Now solve the interior, row by row',
      10: 'Left to right so both parents are already final',
      11: 'Pay this cell, then take the cheaper of the two parents',
      12: 'Bottom-right cell is the minimum total path sum',
    },
    javascript: {
      1: 'Define function taking the cost grid',
      2: 'Read the grid dimensions',
      3: 'Create an m x n table of cheapest costs',
      4: 'Continuation of the table initialization',
      5: 'Reaching the start costs the start cell itself',
      6: 'Fill the top row — no choice but to come from the left',
      7: 'Running prefix sum across the first row',
      8: 'Fill the left column — no choice but to come from above',
      9: 'Running prefix sum down the first column',
      10: 'Now solve the interior, row by row',
      11: 'Left to right so both parents are already final',
      12: 'Pay this cell, then add the cheaper parent',
      13: 'Choose between arriving from above and from the left',
      16: 'Bottom-right cell is the minimum total path sum',
    },
    java: {
      1: 'Define method taking the cost grid',
      2: 'Read the grid dimensions',
      3: 'Create an m x n table of cheapest costs',
      4: 'Reaching the start costs the start cell itself',
      5: 'Fill the top row — no choice but to come from the left',
      6: 'Running prefix sum across the first row',
      7: 'Fill the left column — no choice but to come from above',
      8: 'Running prefix sum down the first column',
      9: 'Now solve the interior, row by row',
      10: 'Left to right so both parents are already final',
      11: 'Pay this cell, then add the cheaper parent',
      12: 'Choose between arriving from above and from the left',
      15: 'Bottom-right cell is the minimum total path sum',
    },
  },
};
