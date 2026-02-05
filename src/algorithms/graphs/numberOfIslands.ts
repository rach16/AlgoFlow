import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runNumberOfIslands(input: unknown): AlgorithmStep[] {
  const grid = (input as string[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  let islandCount = 0;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Islands found: 0`,
    },
    highlights: [],
    message: 'Start scanning the grid for islands. "1" = land, "0" = water.',
    codeLine: 1,
  } as AlgorithmStep);

  function dfs(r: number, c: number, highlights: [number, number][]) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (grid[r][c] === '0' || visited[r][c]) return;

    visited[r][c] = true;
    highlights.push([r, c]);

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: highlights.map(h => [...h]),
        matrixSecondary: [],
        result: `Islands found: ${islandCount}`,
      },
      highlights: [],
      message: `DFS visiting cell (${r}, ${c}) - marking as visited`,
      codeLine: 7,
      action: 'visit',
    } as AlgorithmStep);

    dfs(r + 1, c, highlights);
    dfs(r - 1, c, highlights);
    dfs(r, c + 1, highlights);
    dfs(r, c - 1, highlights);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: [],
          matrixSecondary: [[r, c]],
          result: `Islands found: ${islandCount}`,
        },
        highlights: [],
        message: `Checking cell (${r}, ${c}): value = "${grid[r][c]}"${visited[r][c] ? ' (already visited)' : ''}`,
        codeLine: 3,
        action: 'compare',
      } as AlgorithmStep);

      if (grid[r][c] === '1' && !visited[r][c]) {
        islandCount++;
        const highlights: [number, number][] = [];

        steps.push({
          state: {
            matrix: grid.map(row => [...row]),
            matrixHighlights: [],
            matrixSecondary: [[r, c]],
            result: `Islands found: ${islandCount}`,
          },
          highlights: [],
          message: `Found new island #${islandCount}! Starting DFS from (${r}, ${c})`,
          codeLine: 5,
          action: 'found',
        } as AlgorithmStep);

        dfs(r, c, highlights);

        steps.push({
          state: {
            matrix: grid.map(row => [...row]),
            matrixHighlights: highlights.map(h => [...h]),
            matrixSecondary: [],
            result: `Islands found: ${islandCount}`,
          },
          highlights: [],
          message: `Finished exploring island #${islandCount} with ${highlights.length} cells`,
          codeLine: 8,
          action: 'found',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Total islands: ${islandCount}`,
    },
    highlights: [],
    message: `Done! Total number of islands = ${islandCount}`,
    codeLine: 10,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const numberOfIslands: Algorithm = {
  id: 'number-of-islands',
  name: 'Number of Islands',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DFS/BFS — flood fill each unvisited island',
  description:
    'Given an m x n 2D binary grid which represents a map of "1"s (land) and "0"s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
  problemUrl: 'https://leetcode.com/problems/number-of-islands/',
  code: {
    python: `def numIslands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    visited = set()
    islands = 0

    def dfs(r, c):
        if (r < 0 or r >= rows or
            c < 0 or c >= cols or
            grid[r][c] == "0" or
            (r, c) in visited):
            return
        visited.add((r, c))
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in visited:
                islands += 1
                dfs(r, c)
    return islands`,
    javascript: `function numIslands(grid) {
    if (!grid.length) return 0;
    const rows = grid.length, cols = grid[0].length;
    const visited = new Set();
    let islands = 0;

    function dfs(r, c) {
        if (r < 0 || r >= rows ||
            c < 0 || c >= cols ||
            grid[r][c] === "0" ||
            visited.has(\`\${r},\${c}\`))
            return;
        visited.add(\`\${r},\${c}\`);
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === "1" && !visited.has(\`\${r},\${c}\`)) {
                islands++;
                dfs(r, c);
            }
        }
    }
    return islands;
}`,
  },
  defaultInput: [
    ['1', '1', '1', '1', '0'],
    ['1', '1', '0', '1', '0'],
    ['1', '1', '0', '0', '0'],
    ['0', '0', '0', '0', '0'],
  ],
  run: runNumberOfIslands,
};
