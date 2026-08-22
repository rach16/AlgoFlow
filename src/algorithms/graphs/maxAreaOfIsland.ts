import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runMaxAreaOfIsland(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  let maxArea = 0;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Max area: 0`,
    },
    highlights: [],
    message: 'Start scanning the grid to find the island with maximum area. 1 = land, 0 = water.',
    codeLine: 1,
  } as AlgorithmStep);

  function dfs(r: number, c: number, highlights: [number, number][]): number {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return 0;
    if (grid[r][c] === 0 || visited[r][c]) return 0;

    visited[r][c] = true;
    highlights.push([r, c]);

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: highlights.map(h => [...h]),
        matrixSecondary: [],
        result: `Max area: ${maxArea}`,
      },
      highlights: [],
      message: `DFS visiting cell (${r}, ${c}) - current island area: ${highlights.length}`,
      codeLine: 8,
      action: 'visit',
    } as AlgorithmStep);

    let area = 1;
    area += dfs(r + 1, c, highlights);
    area += dfs(r - 1, c, highlights);
    area += dfs(r, c + 1, highlights);
    area += dfs(r, c - 1, highlights);
    return area;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1 && !visited[r][c]) {
        const highlights: [number, number][] = [];

        steps.push({
          state: {
            matrix: grid.map(row => [...row]),
            matrixHighlights: [],
            matrixSecondary: [[r, c]],
            result: `Max area: ${maxArea}`,
          },
          highlights: [],
          message: `Found land at (${r}, ${c}). Starting DFS to calculate island area.`,
          codeLine: 4,
          action: 'found',
        } as AlgorithmStep);

        const area = dfs(r, c, highlights);
        maxArea = Math.max(maxArea, area);

        steps.push({
          state: {
            matrix: grid.map(row => [...row]),
            matrixHighlights: highlights.map(h => [...h]),
            matrixSecondary: [],
            result: `Max area: ${maxArea}`,
          },
          highlights: [],
          message: `Island area = ${area}. Max area so far = ${maxArea}`,
          codeLine: 5,
          action: 'compare',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Max area: ${maxArea}`,
    },
    highlights: [],
    message: `Done! Maximum area of island = ${maxArea}`,
    codeLine: 12,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runMaxAreaOfIslandBFS(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  let maxArea = 0;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Max area: 0`,
    },
    highlights: [],
    message: 'BFS approach: measure each island with a queue, expanding outward in rings from the first land cell instead of diving deep like DFS.',
    codeLine: 1,
  } as AlgorithmStep);

  const directions: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1 && !visited[r][c]) {
        steps.push({
          state: {
            matrix: grid.map(row => [...row]),
            matrixHighlights: [],
            matrixSecondary: [[r, c]],
            result: `Max area: ${maxArea}`,
          },
          highlights: [],
          message: `Found unvisited land at (${r}, ${c}). Seed the BFS queue and measure this island ring by ring.`,
          codeLine: 8,
          action: 'found',
        } as AlgorithmStep);

        const queue: [number, number][] = [[r, c]];
        visited[r][c] = true;
        const islandCells: [number, number][] = [];
        let area = 0;

        while (queue.length > 0) {
          const [row, col] = queue.shift()!;
          area++;
          islandCells.push([row, col]);

          steps.push({
            state: {
              matrix: grid.map(rw => [...rw]),
              matrixHighlights: islandCells.map(h => [...h]),
              matrixSecondary: queue.map(q => [...q]),
              result: `Max area: ${maxArea}`,
            },
            highlights: [],
            message: `Dequeue (${row}, ${col}) — area is now ${area}. Frontier holds ${queue.length} cell(s) waiting.`,
            codeLine: 13,
            action: 'pop',
          } as AlgorithmStep);

          for (const [dr, dc] of directions) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !visited[nr][nc]) {
              visited[nr][nc] = true;
              queue.push([nr, nc]);
            }
          }
        }

        maxArea = Math.max(maxArea, area);

        steps.push({
          state: {
            matrix: grid.map(rw => [...rw]),
            matrixHighlights: islandCells.map(h => [...h]),
            matrixSecondary: [],
            result: `Max area: ${maxArea}`,
          },
          highlights: [],
          message: `Queue drained — island area = ${area}. Max area so far = ${maxArea}.`,
          codeLine: 21,
          action: 'compare',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Max area: ${maxArea}`,
    },
    highlights: [],
    message: `Done! Maximum area of island = ${maxArea}`,
    codeLine: 22,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const maxAreaOfIsland: Algorithm = {
  id: 'max-area-of-island',
  name: 'Max Area of Island',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DFS — flood fill and count cells per island',
  description:
    'Given an m x n binary matrix grid, find the maximum area of an island. An island is a group of 1s connected 4-directionally. Return 0 if there is no island.',
  problemUrl: 'https://leetcode.com/problems/max-area-of-island/',
  code: {
    python: `def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    visited = set()

    def dfs(r, c):
        if (r < 0 or r >= rows or
            c < 0 or c >= cols or
            grid[r][c] == 0 or
            (r, c) in visited):
            return 0
        visited.add((r, c))
        return (1 + dfs(r+1, c) +
                    dfs(r-1, c) +
                    dfs(r, c+1) +
                    dfs(r, c-1))

    max_area = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r,c) not in visited:
                max_area = max(max_area, dfs(r, c))
    return max_area`,
    javascript: `function maxAreaOfIsland(grid) {
    const rows = grid.length, cols = grid[0].length;
    const visited = new Set();

    function dfs(r, c) {
        if (r < 0 || r >= rows ||
            c < 0 || c >= cols ||
            grid[r][c] === 0 ||
            visited.has(\`\${r},\${c}\`))
            return 0;
        visited.add(\`\${r},\${c}\`);
        return (1 + dfs(r+1, c) +
                    dfs(r-1, c) +
                    dfs(r, c+1) +
                    dfs(r, c-1));
    }

    let maxArea = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 1 && !visited.has(\`\${r},\${c}\`))
                maxArea = Math.max(maxArea, dfs(r, c));
        }
    }
    return maxArea;
}`,
    java: `public int maxAreaOfIsland(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    boolean[][] visited = new boolean[rows][cols];
    int maxArea = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 1 && !visited[r][c]) {
                maxArea = Math.max(maxArea, dfs(grid, r, c, visited));
            }
        }
    }
    return maxArea;
}

private int dfs(int[][] grid, int r, int c, boolean[][] visited) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length
            || grid[r][c] == 0 || visited[r][c]) {
        return 0;
    }
    visited[r][c] = true;
    return 1 + dfs(grid, r + 1, c, visited) + dfs(grid, r - 1, c, visited)
            + dfs(grid, r, c + 1, visited) + dfs(grid, r, c - 1, visited);
}`,
  },
  defaultInput: [
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  ],
  run: runMaxAreaOfIsland,
  optimalApproachName: 'DFS Flood Fill',
  approaches: [
    {
      id: 'bfs-flood-fill',
      name: 'BFS Flood Fill',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(m·n)',
      description:
        'Measures each island with an explicit queue that expands outward ring by ring, avoiding the deep recursion of DFS (no stack-overflow risk on huge islands).',
      code: {
        python: `from collections import deque

def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    visited = set()
    max_area = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in visited:
                queue = deque([(r, c)])
                visited.add((r, c))
                area = 0
                while queue:
                    row, col = queue.popleft()
                    area += 1
                    for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                        nr, nc = row + dr, col + dc
                        if (0 <= nr < rows and 0 <= nc < cols and
                                grid[nr][nc] == 1 and (nr, nc) not in visited):
                            visited.add((nr, nc))
                            queue.append((nr, nc))
                max_area = max(max_area, area)
    return max_area`,
        javascript: `function maxAreaOfIsland(grid) {
    const rows = grid.length, cols = grid[0].length;
    const visited = new Set();
    let maxArea = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 1 && !visited.has(\`\${r},\${c}\`)) {
                const queue = [[r, c]];
                visited.add(\`\${r},\${c}\`);
                let area = 0;
                while (queue.length > 0) {
                    const [row, col] = queue.shift();
                    area++;
                    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                        const nr = row + dr, nc = col + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                                grid[nr][nc] === 1 && !visited.has(\`\${nr},\${nc}\`)) {
                            visited.add(\`\${nr},\${nc}\`);
                            queue.push([nr, nc]);
                        }
                    }
                }
                maxArea = Math.max(maxArea, area);
            }
        }
    }
    return maxArea;
}`,
        java: `public int maxAreaOfIsland(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    boolean[][] visited = new boolean[rows][cols];
    int maxArea = 0;
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 1 && !visited[r][c]) {
                Queue<int[]> queue = new LinkedList<>();
                queue.add(new int[]{r, c});
                visited[r][c] = true;
                int area = 0;
                while (!queue.isEmpty()) {
                    int[] cell = queue.poll();
                    area++;
                    for (int[] d : dirs) {
                        int nr = cell[0] + d[0], nc = cell[1] + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                                && grid[nr][nc] == 1 && !visited[nr][nc]) {
                            visited[nr][nc] = true;
                            queue.add(new int[]{nr, nc});
                        }
                    }
                }
                maxArea = Math.max(maxArea, area);
            }
        }
    }
    return maxArea;
}`,
      },
      run: runMaxAreaOfIslandBFS,
      lineExplanations: {
        python: {
          1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
          3: 'Define function taking integer grid',
          4: 'Get grid dimensions',
          5: 'Track visited cells using a set',
          6: 'Best island area seen so far',
          8: 'Iterate through each row',
          9: 'Iterate through each column',
          10: 'Unvisited land cell starts a new island',
          11: 'Seed the BFS queue with this cell',
          12: 'Mark it visited when enqueued, not dequeued',
          13: 'This island has area 0 so far',
          14: 'Expand until the frontier is empty',
          15: 'Take the next cell off the queue',
          16: 'Count it toward the island area',
          17: 'Try all four neighbor directions',
          18: 'Compute the neighbor coordinates',
          19: 'Neighbor must be in bounds...',
          20: '...and unvisited land',
          21: 'Mark visited immediately to avoid double-adds',
          22: 'Add it to the expanding frontier',
          23: 'Island measured — update the maximum',
          24: 'Return the largest island area found',
        },
        javascript: {
          1: 'Define function taking integer grid',
          2: 'Get grid dimensions',
          3: 'Track visited cells with a Set',
          4: 'Best island area seen so far',
          6: 'Iterate through each row',
          7: 'Iterate through each column',
          8: 'Unvisited land cell starts a new island',
          9: 'Seed the BFS queue with this cell',
          10: 'Mark it visited when enqueued, not dequeued',
          11: 'This island has area 0 so far',
          12: 'Expand until the frontier is empty',
          13: 'Take the next cell off the queue',
          14: 'Count it toward the island area',
          15: 'Try all four neighbor directions',
          16: 'Compute the neighbor coordinates',
          17: 'Neighbor must be in bounds...',
          18: '...and unvisited land',
          19: 'Mark visited immediately to avoid double-adds',
          20: 'Add it to the expanding frontier',
          24: 'Island measured — update the maximum',
          28: 'Return the largest island area found',
        },
        java: {
          1: 'Define method taking integer grid',
          2: 'Get grid dimensions',
          3: 'Create visited boolean grid',
          4: 'Best island area seen so far',
          5: 'The four neighbor directions',
          7: 'Iterate through each row',
          8: 'Iterate through each column',
          9: 'Unvisited land cell starts a new island',
          10: 'Create the BFS queue',
          11: 'Seed it with this cell',
          12: 'Mark it visited when enqueued, not dequeued',
          13: 'This island has area 0 so far',
          14: 'Expand until the frontier is empty',
          15: 'Take the next cell off the queue',
          16: 'Count it toward the island area',
          17: 'Try all four neighbor directions',
          18: 'Compute the neighbor coordinates',
          19: 'Neighbor must be in bounds...',
          20: '...and unvisited land',
          21: 'Mark visited immediately to avoid double-adds',
          22: 'Add it to the expanding frontier',
          26: 'Island measured — update the maximum',
          30: 'Return the largest island area found',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking integer grid',
      2: 'Get grid dimensions',
      3: 'Track visited cells using a set',
      5: 'Define DFS returning area of island',
      6: 'Check row bounds',
      7: 'Check column bounds',
      8: 'Skip water cells',
      9: 'Skip already visited cells',
      10: 'Return 0 if any check fails',
      11: 'Mark current cell as visited',
      12: 'Return 1 + area from all four neighbors',
      13: 'Add area from up neighbor',
      14: 'Add area from right neighbor',
      15: 'Add area from left neighbor',
      17: 'Initialize max area tracker',
      18: 'Iterate through each row',
      19: 'Iterate through each column',
      20: 'If unvisited land cell found',
      21: 'Update max area with this island area',
      22: 'Return the maximum island area found',
    },
    javascript: {
      1: 'Define function taking integer grid',
      2: 'Get grid dimensions',
      3: 'Track visited cells with a Set',
      5: 'Define DFS returning area of island',
      6: 'Check row bounds',
      7: 'Check column bounds',
      8: 'Skip water cells',
      9: 'Skip already visited cells',
      10: 'Return 0 if any check fails',
      11: 'Mark current cell as visited',
      12: 'Return 1 + area from all four neighbors',
      13: 'Add area from up neighbor',
      14: 'Add area from right neighbor',
      15: 'Add area from left neighbor',
      18: 'Initialize max area tracker',
      19: 'Iterate through each row',
      20: 'Iterate through each column',
      21: 'If unvisited land cell found',
      22: 'Update max area with this island area',
      25: 'Return the maximum island area found',
    },
    java: {
      1: 'Define method taking integer grid',
      2: 'Get grid dimensions',
      3: 'Create visited boolean grid',
      4: 'Initialize max area tracker',
      5: 'Iterate through each row',
      6: 'Iterate through each column',
      7: 'If unvisited land cell found',
      8: 'Update max area with this island area',
      12: 'Return the maximum island area found',
      15: 'Define private DFS returning area count',
      16: 'Check bounds, water, and visited',
      17: 'Continue checking conditions',
      18: 'Return 0 if any check fails',
      20: 'Mark current cell as visited',
      21: 'Return 1 + area from all four neighbors',
      22: 'Add area from right and left neighbors',
    },
  },
};
