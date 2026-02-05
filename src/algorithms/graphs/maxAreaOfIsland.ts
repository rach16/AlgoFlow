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
};
