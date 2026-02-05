import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPacificAtlanticWaterFlow(input: unknown): AlgorithmStep[] {
  const heights = input as number[][];
  const steps: AlgorithmStep[] = [];
  const rows = heights.length;
  const cols = heights[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const pacific: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const atlantic: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Finding cells that can reach both oceans',
    },
    highlights: [],
    message: 'Start reverse BFS/DFS from ocean borders. Pacific = top+left edges, Atlantic = bottom+right edges.',
    codeLine: 1,
  } as AlgorithmStep);

  function dfs(
    r: number, c: number,
    reachable: boolean[][],
    prevHeight: number,
    oceanName: string,
    highlights: [number, number][]
  ) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (reachable[r][c]) return;
    if (heights[r][c] < prevHeight) return;

    reachable[r][c] = true;
    highlights.push([r, c]);

    for (const [dr, dc] of directions) {
      dfs(r + dr, c + dc, reachable, heights[r][c], oceanName, highlights);
    }
  }

  // DFS from Pacific borders (top row and left column)
  const pacificHighlights: [number, number][] = [];

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Phase 1: DFS from Pacific ocean borders',
    },
    highlights: [],
    message: 'Phase 1: Run DFS from all Pacific border cells (top row + left column). Water flows uphill in reverse.',
    codeLine: 3,
  } as AlgorithmStep);

  for (let c = 0; c < cols; c++) {
    dfs(0, c, pacific, heights[0][c], 'Pacific', pacificHighlights);
  }
  for (let r = 0; r < rows; r++) {
    dfs(r, 0, pacific, heights[r][0], 'Pacific', pacificHighlights);
  }

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: pacificHighlights.map(h => [...h]),
      matrixSecondary: [],
      result: `Pacific reachable: ${pacificHighlights.length} cells`,
    },
    highlights: [],
    message: `Pacific DFS complete. ${pacificHighlights.length} cells can reach the Pacific ocean.`,
    codeLine: 6,
    action: 'found',
  } as AlgorithmStep);

  // DFS from Atlantic borders (bottom row and right column)
  const atlanticHighlights: [number, number][] = [];

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: pacificHighlights.map(h => [...h]),
      matrixSecondary: [],
      result: 'Phase 2: DFS from Atlantic ocean borders',
    },
    highlights: [],
    message: 'Phase 2: Run DFS from all Atlantic border cells (bottom row + right column).',
    codeLine: 8,
  } as AlgorithmStep);

  for (let c = 0; c < cols; c++) {
    dfs(rows - 1, c, atlantic, heights[rows - 1][c], 'Atlantic', atlanticHighlights);
  }
  for (let r = 0; r < rows; r++) {
    dfs(r, cols - 1, atlantic, heights[r][cols - 1], 'Atlantic', atlanticHighlights);
  }

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: pacificHighlights.map(h => [...h]),
      matrixSecondary: atlanticHighlights.map(h => [...h]),
      result: `Atlantic reachable: ${atlanticHighlights.length} cells`,
    },
    highlights: [],
    message: `Atlantic DFS complete. ${atlanticHighlights.length} cells can reach the Atlantic ocean.`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  // Find intersection
  const result: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pacific[r][c] && atlantic[r][c]) {
        result.push([r, c]);
      }
    }
  }

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: result.map(h => [...h]),
      matrixSecondary: [],
      result: result.map(([r, c]) => `[${r},${c}]`),
    },
    highlights: [],
    message: `Done! ${result.length} cell(s) can reach both oceans: ${result.map(([r, c]) => `(${r},${c})`).join(', ')}`,
    codeLine: 14,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const pacificAtlanticWaterFlow: Algorithm = {
  id: 'pacific-atlantic-water-flow',
  name: 'Pacific Atlantic Water Flow',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DFS from Edges — trace reachability from both oceans inward',
  description:
    'Given an m x n matrix of heights, find all cells where water can flow to both the Pacific (top/left) and Atlantic (bottom/right) oceans. Water flows from higher or equal height cells to adjacent lower or equal height cells.',
  problemUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
  code: {
    python: `def pacificAtlantic(heights):
    rows, cols = len(heights), len(heights[0])
    pac, atl = set(), set()

    def dfs(r, c, visit, prevHeight):
        if (r < 0 or r >= rows or
            c < 0 or c >= cols or
            (r, c) in visit or
            heights[r][c] < prevHeight):
            return
        visit.add((r, c))
        dfs(r+1, c, visit, heights[r][c])
        dfs(r-1, c, visit, heights[r][c])
        dfs(r, c+1, visit, heights[r][c])
        dfs(r, c-1, visit, heights[r][c])

    for c in range(cols):
        dfs(0, c, pac, heights[0][c])
        dfs(rows-1, c, atl, heights[rows-1][c])
    for r in range(rows):
        dfs(r, 0, pac, heights[r][0])
        dfs(r, cols-1, atl, heights[r][cols-1])

    return list(pac & atl)`,
    javascript: `function pacificAtlantic(heights) {
    const rows = heights.length, cols = heights[0].length;
    const pac = new Set(), atl = new Set();

    function dfs(r, c, visit, prevHeight) {
        const key = \`\${r},\${c}\`;
        if (r < 0 || r >= rows ||
            c < 0 || c >= cols ||
            visit.has(key) ||
            heights[r][c] < prevHeight)
            return;
        visit.add(key);
        dfs(r+1, c, visit, heights[r][c]);
        dfs(r-1, c, visit, heights[r][c]);
        dfs(r, c+1, visit, heights[r][c]);
        dfs(r, c-1, visit, heights[r][c]);
    }

    for (let c = 0; c < cols; c++) {
        dfs(0, c, pac, heights[0][c]);
        dfs(rows-1, c, atl, heights[rows-1][c]);
    }
    for (let r = 0; r < rows; r++) {
        dfs(r, 0, pac, heights[r][0]);
        dfs(r, cols-1, atl, heights[r][cols-1]);
    }

    const result = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (pac.has(\`\${r},\${c}\`) && atl.has(\`\${r},\${c}\`))
                result.push([r, c]);
    return result;
}`,
  },
  defaultInput: [
    [1, 2, 2, 3, 5],
    [3, 2, 3, 4, 4],
    [2, 4, 5, 3, 1],
    [6, 7, 1, 4, 5],
    [5, 1, 1, 2, 4],
  ],
  run: runPacificAtlanticWaterFlow,
};
