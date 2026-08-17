import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runIslandPerimeter(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = grid.length;
  const cols = grid[0].length;

  const counted: [number, number][] = [];
  let perimeter = 0;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Perimeter: 0',
    },
    highlights: [],
    message:
      'Every land cell contributes 4 sides. Each time two land cells touch, they hide one side each — so subtract 2 per shared edge. No traversal needed: one sweep of the grid is enough.',
    codeLine: 1,
  } as AlgorithmStep);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue;

      counted.push([r, c]);
      perimeter += 4;

      steps.push({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: counted.map(h => [...h]),
          matrixSecondary: [[r, c]],
          result: `Perimeter: ${perimeter}`,
        },
        highlights: [],
        message: `Land at (${r}, ${c}) — a lone square has 4 exposed sides, so perimeter += 4 → ${perimeter}.`,
        codeLine: 7,
        action: 'visit',
      } as AlgorithmStep);

      const shares: string[] = [];
      const shared: [number, number][] = [];
      if (r > 0 && grid[r - 1][c] === 1) {
        perimeter -= 2;
        shares.push(`the cell above (${r - 1}, ${c})`);
        shared.push([r - 1, c]);
      }
      if (c > 0 && grid[r][c - 1] === 1) {
        perimeter -= 2;
        shares.push(`the cell to the left (${r}, ${c - 1})`);
        shared.push([r, c - 1]);
      }

      steps.push({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: counted.map(h => [...h]),
          matrixSecondary: shared.length ? shared.map(h => [...h]) : [[r, c]],
          result: `Perimeter: ${perimeter}`,
        },
        highlights: [],
        message: shares.length
          ? `(${r}, ${c}) touches ${shares.join(' and ')} — each contact seals 2 sides (one on each cell), so perimeter -= ${2 * shares.length} → ${perimeter}.`
          : `Nothing above or to the left of (${r}, ${c}) is land — no sides to seal, perimeter stays ${perimeter}. (Only up/left are checked so each shared edge is counted exactly once.)`,
        codeLine: shares.length ? 9 : 8,
        action: 'compare',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: counted.map(h => [...h]),
      matrixSecondary: [],
      result: perimeter,
    },
    highlights: [],
    message: `Sweep done: ${counted.length} land cells × 4 = ${counted.length * 4}, minus 2 for each of the ${(counted.length * 4 - perimeter) / 2} shared edges → perimeter = ${perimeter}.`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runIslandPerimeterDFS(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = grid.length;
  const cols = grid[0].length;

  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const visitedCells: [number, number][] = [];
  let perimeter = 0;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Perimeter: 0',
    },
    highlights: [],
    message:
      'DFS view: walk the single island cell by cell. Every step that leaves the island — off the grid or into water — crosses the coastline once, so count those crossings.',
    codeLine: 1,
  } as AlgorithmStep);

  const directions: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function dfs(r: number, c: number) {
    visited[r][c] = true;
    visitedCells.push([r, c]);

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: visitedCells.map(h => [...h]),
        matrixSecondary: [[r, c]],
        result: `Perimeter: ${perimeter}`,
      },
      highlights: [],
      message: `Enter (${r}, ${c}) and mark it visited so the walk never revisits it.`,
      codeLine: 8,
      action: 'visit',
    } as AlgorithmStep);

    let crossings = 0;
    const openSides: string[] = [];
    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === 0) {
        crossings++;
        perimeter++;
        openSides.push(nr < 0 || nr >= rows || nc < 0 || nc >= cols ? `(${nr}, ${nc}) off-grid` : `(${nr}, ${nc}) water`);
      }
    }

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: visitedCells.map(h => [...h]),
        matrixSecondary: [[r, c]],
        result: `Perimeter: ${perimeter}`,
      },
      highlights: [],
      message: crossings
        ? `(${r}, ${c}) has ${crossings} side(s) facing the outside — ${openSides.join(', ')}. perimeter += ${crossings} → ${perimeter}.`
        : `(${r}, ${c}) is fully surrounded by land — it adds nothing to the coastline. perimeter stays ${perimeter}.`,
      codeLine: 12,
      action: 'compare',
    } as AlgorithmStep);

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !visited[nr][nc]) {
        dfs(nr, nc);
      }
    }
  }

  let started = false;
  for (let r = 0; r < rows && !started; r++) {
    for (let c = 0; c < cols && !started; c++) {
      if (grid[r][c] === 1) {
        started = true;
        steps.push({
          state: {
            matrix: grid.map(row => [...row]),
            matrixHighlights: [],
            matrixSecondary: [[r, c]],
            result: 'Perimeter: 0',
          },
          highlights: [],
          message: `First land cell is (${r}, ${c}). The problem guarantees exactly one island, so one DFS from here reaches all of it.`,
          codeLine: 18,
          action: 'found',
        } as AlgorithmStep);
        dfs(r, c);
      }
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: visitedCells.map(h => [...h]),
      matrixSecondary: [],
      result: perimeter,
    },
    highlights: [],
    message: `DFS covered ${visitedCells.length} land cells and crossed the coastline ${perimeter} times → perimeter = ${perimeter}.`,
    codeLine: 20,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const islandPerimeter: Algorithm = {
  id: 'island-perimeter',
  name: 'Island Perimeter',
  category: 'Graphs',
  difficulty: 'Easy',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(1)',
  pattern: 'Matrix — 4 sides per land cell minus 2 per shared edge',
  description:
    'You are given a row x col binary grid where 1 represents land and 0 represents water. The grid has exactly one island with no lakes inside it. Return the perimeter of that island.',
  problemUrl: 'https://leetcode.com/problems/island-perimeter/',
  code: {
    python: `def islandPerimeter(grid):
    rows, cols = len(grid), len(grid[0])
    perimeter = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                perimeter += 4
                if r > 0 and grid[r - 1][c] == 1:
                    perimeter -= 2
                if c > 0 and grid[r][c - 1] == 1:
                    perimeter -= 2
    return perimeter`,
    javascript: `function islandPerimeter(grid) {
    const rows = grid.length, cols = grid[0].length;
    let perimeter = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 1) {
                perimeter += 4;
                if (r > 0 && grid[r - 1][c] === 1) perimeter -= 2;
                if (c > 0 && grid[r][c - 1] === 1) perimeter -= 2;
            }
        }
    }
    return perimeter;
}`,
    java: `public static int islandPerimeter(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    int perimeter = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 1) {
                perimeter += 4;
                if (r > 0 && grid[r - 1][c] == 1) perimeter -= 2;
                if (c > 0 && grid[r][c - 1] == 1) perimeter -= 2;
            }
        }
    }
    return perimeter;
}`,
  },
  defaultInput: [
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 1, 0, 0],
    [1, 1, 0, 0],
  ],
  run: runIslandPerimeter,
  optimalApproachName: 'Edge Counting',
  approaches: [
    {
      id: 'dfs-boundary-crossings',
      name: 'DFS Boundary Count',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(m·n)',
      description:
        'Walks the island with DFS and counts every step that leaves it (off-grid or into water) instead of sweeping the whole grid arithmetically — the same answer, but it needs a visited set and a recursion stack.',
      code: {
        python: `def islandPerimeter(grid):
    rows, cols = len(grid), len(grid[0])
    visited = set()
    perimeter = 0

    def dfs(r, c):
        nonlocal perimeter
        visited.add((r, c))
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= rows or nc < 0 or nc >= cols or grid[nr][nc] == 0:
                perimeter += 1
            elif (nr, nc) not in visited:
                dfs(nr, nc)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                dfs(r, c)
                return perimeter
    return 0`,
        javascript: `function islandPerimeter(grid) {
    const rows = grid.length, cols = grid[0].length;
    const visited = new Set();
    let perimeter = 0;

    function dfs(r, c) {
        visited.add(\`\${r},\${c}\`);
        for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === 0) {
                perimeter++;
            } else if (!visited.has(\`\${nr},\${nc}\`)) {
                dfs(nr, nc);
            }
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 1) {
                dfs(r, c);
                return perimeter;
            }
        }
    }
    return 0;
}`,
        java: `public static int islandPerimeter(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    boolean[][] visited = new boolean[rows][cols];
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 1) {
                return dfs(grid, r, c, visited, rows, cols);
            }
        }
    }
    return 0;
}

private static int dfs(int[][] grid, int r, int c, boolean[][] visited,
                       int rows, int cols) {
    visited[r][c] = true;
    int total = 0;
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    for (int[] d : dirs) {
        int nr = r + d[0], nc = c + d[1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] == 0) {
            total++;
        } else if (!visited[nr][nc]) {
            total += dfs(grid, nr, nc, visited, rows, cols);
        }
    }
    return total;
}`,
      },
      run: runIslandPerimeterDFS,
      lineExplanations: {
        python: {
          1: 'Define function taking the binary grid',
          2: 'Grid dimensions',
          3: 'Visited set so each land cell is walked once',
          4: 'Running coastline length',
          6: 'DFS helper that walks one island',
          7: 'Mutate the outer perimeter counter',
          8: 'Mark this cell before exploring it',
          9: 'Look at all four sides',
          10: 'Coordinates of the neighbor on that side',
          11: 'Side faces off-grid or water...',
          12: '...so that side is coastline: add 1',
          13: 'Otherwise it is land we have not walked yet',
          14: 'Recurse into it',
          16: 'Scan for the island start',
          17: 'Scan columns',
          18: 'First land cell found',
          19: 'One DFS covers the whole island',
          20: 'Return the accumulated perimeter',
          21: 'No land at all — perimeter 0',
        },
        javascript: {
          1: 'Define function taking the binary grid',
          2: 'Grid dimensions',
          3: 'Visited set keyed by "r,c"',
          4: 'Running coastline length',
          6: 'DFS helper that walks one island',
          7: 'Mark this cell before exploring it',
          8: 'Look at all four sides',
          9: 'Coordinates of the neighbor on that side',
          10: 'Side faces off-grid or water...',
          11: '...so that side is coastline: add 1',
          12: 'Otherwise it is unvisited land',
          13: 'Recurse into it',
          18: 'Scan for the island start',
          19: 'Scan columns',
          20: 'First land cell found',
          21: 'One DFS covers the whole island',
          22: 'Return the accumulated perimeter',
          26: 'No land at all — perimeter 0',
        },
        java: {
          1: 'Define method taking the binary grid',
          2: 'Grid dimensions',
          3: 'Visited matrix so each cell is walked once',
          4: 'Scan for the island start',
          5: 'Scan columns',
          6: 'First land cell found',
          7: 'One DFS covers the whole island',
          11: 'No land at all — perimeter 0',
          14: 'DFS helper returning coastline from here down',
          15: 'Helper signature continued',
          16: 'Mark this cell before exploring it',
          17: 'Coastline contributed by this branch',
          18: 'The four side directions',
          19: 'Look at all four sides',
          20: 'Coordinates of the neighbor on that side',
          21: 'Side faces off-grid or water...',
          22: '...so that side is coastline: add 1',
          23: 'Otherwise it is unvisited land',
          24: 'Add whatever that branch contributes',
          27: 'Return this cell plus its branches',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the binary grid',
      2: 'Grid dimensions',
      3: 'Running perimeter total',
      4: 'Sweep every row',
      5: 'Sweep every column',
      6: 'Only land cells matter',
      7: 'A lone square exposes 4 sides',
      8: 'Land directly above shares an edge',
      9: 'That edge hides one side on each cell: -2',
      10: 'Land directly to the left shares an edge',
      11: 'Again subtract both hidden sides',
      12: 'Return the perimeter',
    },
    javascript: {
      1: 'Define function taking the binary grid',
      2: 'Grid dimensions',
      3: 'Running perimeter total',
      4: 'Sweep every row',
      5: 'Sweep every column',
      6: 'Only land cells matter',
      7: 'A lone square exposes 4 sides',
      8: 'Land above shares an edge: -2',
      9: 'Land to the left shares an edge: -2',
      13: 'Return the perimeter',
    },
    java: {
      1: 'Define method taking the binary grid',
      2: 'Grid dimensions',
      3: 'Running perimeter total',
      4: 'Sweep every row',
      5: 'Sweep every column',
      6: 'Only land cells matter',
      7: 'A lone square exposes 4 sides',
      8: 'Land above shares an edge: -2',
      9: 'Land to the left shares an edge: -2',
      13: 'Return the perimeter',
    },
  },
};
