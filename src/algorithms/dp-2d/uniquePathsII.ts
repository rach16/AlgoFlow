import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface UniquePathsIIInput {
  grid: number[][];
}

function runUniquePathsII(input: unknown): AlgorithmStep[] {
  const { grid } = input as UniquePathsIIInput;
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
    message: `${m}x${n} grid, 1 = obstacle. Count paths from top-left to bottom-right moving only right or down. Same recurrence as Unique Paths, but an obstacle cell is forced to 0`,
    codeLine: 1,
  });

  dp2d[0][0] = grid[0][0] === 0 ? 1 : 0;

  steps.push({
    state: snap([[0, 0]], [], null),
    highlights: [],
    message:
      grid[0][0] === 0
        ? `Start cell is clear, so dp[0][0] = 1 — there is exactly one way to "already be" at the start`
        : `Start cell is an obstacle, so dp[0][0] = 0 — no path can ever begin`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) {
        dp2d[i][j] = 0;
        steps.push({
          state: snap([[i, j]], [], null),
          highlights: [],
          pointers: { row: i, col: j },
          message: `grid[${i}][${j}] = 1 is an obstacle — zero it out. Nothing downstream may route through this cell`,
          codeLine: 8,
          action: 'delete',
        });
        continue;
      }

      if (i === 0 && j === 0) {
        steps.push({
          state: snap([[0, 0]], [], null),
          highlights: [],
          pointers: { row: 0, col: 0 },
          message: `dp[0][0] stays ${dp2d[0][0]} — there is no cell above or to the left of the start`,
          codeLine: 10,
          action: 'visit',
        });
        continue;
      }

      const fromTop = i > 0 ? dp2d[i - 1][j] : 0;
      const fromLeft = j > 0 ? dp2d[i][j - 1] : 0;
      const parents: [number, number][] = [];
      if (i > 0) parents.push([i - 1, j]);
      if (j > 0) parents.push([i, j - 1]);

      dp2d[i][j] = fromTop + fromLeft;

      const parts: string[] = [];
      if (i > 0) parts.push(`above ${fromTop}`);
      if (j > 0) parts.push(`left ${fromLeft}`);

      steps.push({
        state: snap(parents, [[i, j]], null),
        highlights: [],
        pointers: { row: i, col: j },
        message:
          dp2d[i][j] === 0
            ? `dp[${i}][${j}] = ${parts.join(' + ')} = 0 — this cell is clear but completely walled off`
            : `dp[${i}][${j}] = ${parts.join(' + ')} = ${dp2d[i][j]} paths reach here`,
        codeLine: i > 0 ? 11 : 13,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: snap([[m - 1, n - 1]], [], dp2d[m - 1][n - 1]),
    highlights: [],
    message: `Bottom-right holds the answer: ${dp2d[m - 1][n - 1]} unique path${dp2d[m - 1][n - 1] === 1 ? '' : 's'} avoid every obstacle`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

function runUniquePathsIIRollingRow(input: unknown): AlgorithmStep[] {
  const { grid } = input as UniquePathsIIInput;
  const steps: AlgorithmStep[] = [];
  const m = grid.length;
  const n = grid[0].length;

  const labels = Array.from({ length: n }, (_, j) => `c${j}`);
  const dp: number[] = new Array(n).fill(0);

  const snap = (
    cell: [number, number][],
    hl: number[],
    sec: number[],
    result: number | null,
  ) => ({
    matrix: grid.map(r => [...r]),
    matrixHighlights: cell,
    dp: [...dp],
    dpLabels: labels,
    dpHighlights: hl,
    dpSecondary: sec,
    result,
  });

  steps.push({
    state: snap([], [], [], null),
    highlights: [],
    message: `The 2-D table only ever reads the row directly above, so one array of ${n} numbers is enough — overwrite it in place, row by row`,
    codeLine: 1,
  });

  dp[0] = 1;

  steps.push({
    state: snap([], [0], [], null),
    highlights: [],
    message: `dp[j] = paths to column j of the row processed so far. Seed dp[0] = 1 as the phantom "row above the grid" so the first real row can build off it`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 0; i < m; i++) {
    steps.push({
      state: snap(Array.from({ length: n }, (_, j): [number, number] => [i, j]), [], [], null),
      highlights: [],
      pointers: { row: i },
      message: `Row ${i} = [${grid[i].join(', ')}] — sweep left to right. dp[j] currently means "row ${i - 1}", and becomes "row ${i}" as we pass over it`,
      codeLine: 5,
      action: 'visit',
    });

    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) {
        dp[j] = 0;
        steps.push({
          state: snap([[i, j]], [j], [], null),
          highlights: [],
          pointers: { row: i, col: j },
          message: `Obstacle at (${i}, ${j}) — dp[${j}] = 0 wipes out every path that would have entered this column here`,
          codeLine: 8,
          action: 'delete',
        });
      } else if (j > 0) {
        const above = dp[j];
        dp[j] += dp[j - 1];
        steps.push({
          state: snap([[i, j]], [j], [j - 1], null),
          highlights: [],
          pointers: { row: i, col: j },
          message: `dp[${j}] += dp[${j - 1}]: ${above} (from above) + ${dp[j - 1]} (from the left, already updated to row ${i}) = ${dp[j]}`,
          codeLine: 10,
          action: 'insert',
        });
      } else {
        steps.push({
          state: snap([[i, 0]], [0], [], null),
          highlights: [],
          pointers: { row: i, col: 0 },
          message: `Column 0 is clear, so dp[0] keeps its value ${dp[0]} — the only way into the first column is straight down`,
          codeLine: 9,
          action: 'visit',
        });
      }
    }
  }

  steps.push({
    state: snap([[m - 1, n - 1]], [n - 1], [], dp[n - 1]),
    highlights: [],
    message: `dp[${n - 1}] = ${dp[n - 1]} — same answer as the full table, in O(n) space instead of O(m·n)`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const uniquePathsII: Algorithm = {
  id: 'unique-paths-ii',
  name: 'Unique Paths II',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DP — dp[r][c] = dp[r-1][c] + dp[r][c-1], obstacle cells forced to 0',
  description:
    'You are given an m x n integer array grid where grid[i][j] could be 0 (empty) or 1 (an obstacle). A robot starts at the top-left corner and can only move down or right. Return the number of unique paths to the bottom-right corner that avoid every obstacle.',
  problemUrl: 'https://leetcode.com/problems/unique-paths-ii/',
  code: {
    python: `def uniquePathsWithObstacles(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    dp[0][0] = 1 if grid[0][0] == 0 else 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 1:
                dp[i][j] = 0
                continue
            if i > 0:
                dp[i][j] += dp[i-1][j]
            if j > 0:
                dp[i][j] += dp[i][j-1]
    return dp[m-1][n-1]`,
    javascript: `function uniquePathsWithObstacles(grid) {
    const m = grid.length, n = grid[0].length;
    const dp = Array.from({length: m},
        () => new Array(n).fill(0));
    dp[0][0] = grid[0][0] === 0 ? 1 : 0;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (grid[i][j] === 1) {
                dp[i][j] = 0;
                continue;
            }
            if (i > 0) dp[i][j] += dp[i-1][j];
            if (j > 0) dp[i][j] += dp[i][j-1];
        }
    }
    return dp[m-1][n-1];
}`,
    java: `public static int uniquePathsWithObstacles(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    int[][] dp = new int[m][n];
    dp[0][0] = grid[0][0] == 0 ? 1 : 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 1) {
                dp[i][j] = 0;
                continue;
            }
            if (i > 0) dp[i][j] += dp[i - 1][j];
            if (j > 0) dp[i][j] += dp[i][j - 1];
        }
    }
    return dp[m - 1][n - 1];
}`,
  },
  defaultInput: { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
  run: runUniquePathsII,
  optimalApproachName: '2-D DP Table',
  approaches: [
    {
      id: 'rolling-row-1d',
      name: '1-D Rolling Row',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(n)',
      description:
        'Keeps a single row of length n and overwrites it in place, because each cell only ever needs the value directly above it and the one already updated to its left.',
      code: {
        python: `def uniquePathsWithObstacles(grid):
    n = len(grid[0])
    dp = [0] * n
    dp[0] = 1
    for row in grid:
        for j in range(n):
            if row[j] == 1:
                dp[j] = 0
            elif j > 0:
                dp[j] += dp[j-1]
    return dp[n-1]`,
        javascript: `function uniquePathsWithObstacles(grid) {
    const n = grid[0].length;
    const dp = new Array(n).fill(0);
    dp[0] = 1;
    for (const row of grid) {
        for (let j = 0; j < n; j++) {
            if (row[j] === 1) dp[j] = 0;
            else if (j > 0) dp[j] += dp[j-1];
        }
    }
    return dp[n-1];
}`,
        java: `public static int uniquePathsWithObstacles(int[][] grid) {
    int n = grid[0].length;
    int[] dp = new int[n];
    dp[0] = 1;
    for (int[] row : grid) {
        for (int j = 0; j < n; j++) {
            if (row[j] == 1) dp[j] = 0;
            else if (j > 0) dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}`,
      },
      run: runUniquePathsIIRollingRow,
      lineExplanations: {
        python: {
          1: 'Define function taking the obstacle grid',
          2: 'Width of the grid — the length of our single rolling row',
          3: 'dp[j] = number of paths reaching column j of the current row',
          4: 'Seed dp[0] = 1 as the phantom row above the grid',
          5: 'Process one grid row at a time, overwriting dp in place',
          6: 'Sweep columns left to right',
          7: 'An obstacle blocks every path through this cell',
          8: 'Zero it out so nothing downstream can use it',
          9: 'Otherwise combine the value above with the one to the left',
          10: 'dp[j] is still the row above; dp[j-1] is already this row',
          11: 'Last column of the last row is the answer',
        },
        javascript: {
          1: 'Define function taking the obstacle grid',
          2: 'Width of the grid — the length of our single rolling row',
          3: 'dp[j] = number of paths reaching column j of the current row',
          4: 'Seed dp[0] = 1 as the phantom row above the grid',
          5: 'Process one grid row at a time, overwriting dp in place',
          6: 'Sweep columns left to right',
          7: 'An obstacle zeroes out this column',
          8: 'dp[j] is still the row above; dp[j-1] is already this row',
          11: 'Last column of the last row is the answer',
        },
        java: {
          1: 'Define method taking the obstacle grid',
          2: 'Width of the grid — the length of our single rolling row',
          3: 'dp[j] = number of paths reaching column j of the current row',
          4: 'Seed dp[0] = 1 as the phantom row above the grid',
          5: 'Process one grid row at a time, overwriting dp in place',
          6: 'Sweep columns left to right',
          7: 'An obstacle zeroes out this column',
          8: 'dp[j] is still the row above; dp[j-1] is already this row',
          11: 'Last column of the last row is the answer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the obstacle grid',
      2: 'Read the grid dimensions',
      3: 'Create an m x n DP table filled with zeros',
      4: 'Start cell has one path unless it is itself blocked',
      5: 'Scan rows top to bottom',
      6: 'Scan columns left to right so both parents are ready',
      7: 'Check whether this cell is an obstacle',
      8: 'Force blocked cells to 0 paths',
      9: 'Skip the transition entirely for obstacles',
      10: 'If there is a row above, paths can arrive from it',
      11: 'Add the number of paths coming from above',
      12: 'If there is a column to the left, paths can arrive from it',
      13: 'Add the number of paths coming from the left',
      14: 'Bottom-right cell holds the obstacle-free path count',
    },
    javascript: {
      1: 'Define function taking the obstacle grid',
      2: 'Read the grid dimensions',
      3: 'Create an m x n DP table filled with zeros',
      4: 'Continuation of the table initialization',
      5: 'Start cell has one path unless it is itself blocked',
      6: 'Scan rows top to bottom',
      7: 'Scan columns left to right so both parents are ready',
      8: 'Check whether this cell is an obstacle',
      9: 'Force blocked cells to 0 paths',
      10: 'Skip the transition entirely for obstacles',
      12: 'Add the paths arriving from the cell above',
      13: 'Add the paths arriving from the cell to the left',
      16: 'Bottom-right cell holds the obstacle-free path count',
    },
    java: {
      1: 'Define method taking the obstacle grid',
      2: 'Read the grid dimensions',
      3: 'Create an m x n DP table initialized to 0',
      4: 'Start cell has one path unless it is itself blocked',
      5: 'Scan rows top to bottom',
      6: 'Scan columns left to right so both parents are ready',
      7: 'Check whether this cell is an obstacle',
      8: 'Force blocked cells to 0 paths',
      9: 'Skip the transition entirely for obstacles',
      11: 'Add the paths arriving from the cell above',
      12: 'Add the paths arriving from the cell to the left',
      15: 'Bottom-right cell holds the obstacle-free path count',
    },
  },
};
