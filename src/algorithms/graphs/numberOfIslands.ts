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
    java: `public static int numIslands(char[][] grid) {
    if (grid.length == 0) return 0;
    int rows = grid.length, cols = grid[0].length;
    Set<String> visited = new HashSet<>();
    int islands = 0;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1' && !visited.contains(r + "," + c)) {
                islands++;
                dfs(grid, r, c, visited, rows, cols);
            }
        }
    }
    return islands;
}

private static void dfs(char[][] grid, int r, int c, Set<String> visited,
                        int rows, int cols) {
    if (r < 0 || r >= rows || c < 0 || c >= cols ||
        grid[r][c] == '0' || visited.contains(r + "," + c)) {
        return;
    }
    visited.add(r + "," + c);
    dfs(grid, r + 1, c, visited, rows, cols);
    dfs(grid, r - 1, c, visited, rows, cols);
    dfs(grid, r, c + 1, visited, rows, cols);
    dfs(grid, r, c - 1, visited, rows, cols);
}`,
  },
  defaultInput: [
    ['1', '1', '1', '1', '0'],
    ['1', '1', '0', '1', '0'],
    ['1', '1', '0', '0', '0'],
    ['0', '0', '0', '0', '0'],
  ],
  run: runNumberOfIslands,
  lineExplanations: {
    python: {
      1: 'Define function taking 2D grid of land/water',
      2: 'Return 0 if grid is empty',
      3: 'Return early for empty input',
      4: 'Get grid dimensions',
      5: 'Track visited cells using a set',
      6: 'Initialize island counter',
      8: 'Define DFS helper to explore one island',
      9: 'Check if out of bounds or invalid cell',
      10: 'Continue boundary and water checks',
      11: 'Skip water cells',
      12: 'Skip already visited cells',
      13: 'Return without exploring further',
      14: 'Mark current cell as visited',
      15: 'Explore down neighbor',
      16: 'Explore up neighbor',
      17: 'Explore right neighbor',
      18: 'Explore left neighbor',
      20: 'Iterate through each row',
      21: 'Iterate through each column',
      22: 'If unvisited land cell found',
      23: 'Increment island count',
      24: 'Flood-fill the entire island via DFS',
      25: 'Return total number of islands',
    },
    javascript: {
      1: 'Define function taking 2D grid',
      2: 'Return 0 if grid is empty',
      3: 'Get grid dimensions',
      4: 'Track visited cells with a Set',
      5: 'Initialize island counter',
      7: 'Define DFS helper function',
      8: 'Check row bounds',
      9: 'Check column bounds',
      10: 'Skip water cells',
      11: 'Skip already visited cells',
      12: 'Return if any check fails',
      13: 'Mark current cell as visited',
      14: 'Explore down neighbor',
      15: 'Explore up neighbor',
      16: 'Explore right neighbor',
      17: 'Explore left neighbor',
      20: 'Iterate through each row',
      21: 'Iterate through each column',
      22: 'If unvisited land found',
      23: 'Increment island count',
      24: 'Flood-fill the island via DFS',
      28: 'Return total number of islands',
    },
    java: {
      1: 'Define static method taking char grid',
      2: 'Return 0 if grid is empty',
      3: 'Get grid dimensions',
      4: 'Track visited cells with HashSet',
      5: 'Initialize island counter',
      7: 'Iterate through each row',
      8: 'Iterate through each column',
      9: 'If unvisited land cell found',
      10: 'Increment island count',
      11: 'Flood-fill the island via DFS',
      15: 'Return total number of islands',
      18: 'Define private DFS helper method',
      19: 'Method signature with grid and state params',
      20: 'Check bounds and cell validity',
      21: 'Skip water or already visited cells',
      22: 'Return if any check fails',
      24: 'Mark current cell as visited',
      25: 'Explore down neighbor',
      26: 'Explore up neighbor',
      27: 'Explore right neighbor',
      28: 'Explore left neighbor',
    },
  },
};
