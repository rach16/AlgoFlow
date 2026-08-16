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

function runPacificAtlanticBFS(input: unknown): AlgorithmStep[] {
  const heights = input as number[][];
  const steps: AlgorithmStep[] = [];
  const rows = heights.length;
  const cols = heights[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'BFS frontier expands from each ocean',
    },
    highlights: [],
    message: 'Same reverse thinking as the DFS solution, but iterative: grow a BFS frontier ring-by-ring from each ocean border, only stepping onto cells of equal or greater height.',
    codeLine: 1,
  } as AlgorithmStep);

  function bfs(starts: [number, number][], oceanName: string, seedLine: number): [number, number][] {
    const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    const reached: [number, number][] = [];
    let frontier: [number, number][] = [];

    for (const [r, c] of starts) {
      if (!visited[r][c]) {
        visited[r][c] = true;
        frontier.push([r, c]);
        reached.push([r, c]);
      }
    }

    steps.push({
      state: {
        matrix: heights.map(row => [...row]),
        matrixHighlights: reached.map(h => [...h]),
        matrixSecondary: [],
        queue: frontier.map(([r, c]) => `(${r},${c})`),
        result: `${oceanName}: ${frontier.length} border cells seeded`,
      },
      highlights: [],
      message: `${oceanName}: seed the queue with all ${frontier.length} coastal cells — water on the coast trivially reaches the ocean.`,
      codeLine: seedLine,
      action: 'push',
    } as AlgorithmStep);

    let ring = 0;
    while (frontier.length > 0) {
      const next: [number, number][] = [];
      for (const [r, c] of frontier) {
        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (visited[nr][nc]) continue;
          if (heights[nr][nc] < heights[r][c]) continue;
          visited[nr][nc] = true;
          next.push([nr, nc]);
          reached.push([nr, nc]);
        }
      }
      ring++;
      if (next.length > 0) {
        steps.push({
          state: {
            matrix: heights.map(row => [...row]),
            matrixHighlights: reached.map(h => [...h]),
            matrixSecondary: next.map(h => [...h]),
            queue: next.map(([r, c]) => `(${r},${c})`),
            result: `${oceanName} ring ${ring}: +${next.length} cell(s)`,
          },
          highlights: [],
          message: `${oceanName} ring ${ring}: the frontier climbs uphill to ${next.length} new cell(s). Each is at least as high as a reached neighbor, so its water can drain to the ${oceanName}.`,
          codeLine: 16,
          action: 'visit',
        } as AlgorithmStep);
      }
      frontier = next;
    }
    return reached;
  }

  const pacificStarts: [number, number][] = [];
  for (let c = 0; c < cols; c++) pacificStarts.push([0, c]);
  for (let r = 0; r < rows; r++) pacificStarts.push([r, 0]);
  const pacificReached = bfs(pacificStarts, 'Pacific', 19);

  const atlanticStarts: [number, number][] = [];
  for (let c = 0; c < cols; c++) atlanticStarts.push([rows - 1, c]);
  for (let r = 0; r < rows; r++) atlanticStarts.push([r, cols - 1]);
  const atlanticReached = bfs(atlanticStarts, 'Atlantic', 21);

  const pacificSet = new Set(pacificReached.map(([r, c]) => `${r},${c}`));
  const result: [number, number][] = [];
  for (const [r, c] of atlanticReached) {
    if (pacificSet.has(`${r},${c}`)) result.push([r, c]);
  }
  result.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: result.map(h => [...h]),
      matrixSecondary: [],
      result: result.map(([r, c]) => `[${r},${c}]`),
    },
    highlights: [],
    message: `Intersect the two reachable sets: ${result.length} cell(s) drain to BOTH oceans: ${result.map(([r, c]) => `(${r},${c})`).join(', ')}`,
    codeLine: 24,
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
    java: `public List<List<Integer>> pacificAtlantic(int[][] heights) {
    int rows = heights.length, cols = heights[0].length;
    boolean[][] pac = new boolean[rows][cols];
    boolean[][] atl = new boolean[rows][cols];

    for (int c = 0; c < cols; c++) {
        dfs(heights, 0, c, pac, heights[0][c]);
        dfs(heights, rows - 1, c, atl, heights[rows - 1][c]);
    }
    for (int r = 0; r < rows; r++) {
        dfs(heights, r, 0, pac, heights[r][0]);
        dfs(heights, r, cols - 1, atl, heights[r][cols - 1]);
    }

    List<List<Integer>> result = new ArrayList<>();
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (pac[r][c] && atl[r][c]) {
                result.add(Arrays.asList(r, c));
            }
        }
    }
    return result;
}

private void dfs(int[][] heights, int r, int c, boolean[][] visit, int prevHeight) {
    if (r < 0 || r >= heights.length || c < 0 || c >= heights[0].length
            || visit[r][c] || heights[r][c] < prevHeight) {
        return;
    }
    visit[r][c] = true;
    dfs(heights, r + 1, c, visit, heights[r][c]);
    dfs(heights, r - 1, c, visit, heights[r][c]);
    dfs(heights, r, c + 1, visit, heights[r][c]);
    dfs(heights, r, c - 1, visit, heights[r][c]);
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
  optimalApproachName: 'DFS from Ocean Borders',
  approaches: [
    {
      id: 'bfs-from-oceans',
      name: 'BFS from Oceans',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(m·n)',
      description:
        'Same reverse traversal from the ocean borders, but with an iterative BFS frontier instead of recursive DFS — no recursion-depth risk, and reachability spreads outward in visible rings.',
      code: {
        python: `def pacificAtlantic(heights):
    rows, cols = len(heights), len(heights[0])
    pac, atl = set(), set()
    dirs = [(1,0),(-1,0),(0,1),(0,-1)]

    def bfs(starts, visit):
        queue = deque(starts)
        visit.update(starts)
        while queue:
            r, c = queue.popleft()
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if (0 <= nr < rows and 0 <= nc < cols and
                    (nr, nc) not in visit and
                    heights[nr][nc] >= heights[r][c]):
                    visit.add((nr, nc))
                    queue.append((nr, nc))

    bfs([(0, c) for c in range(cols)] +
        [(r, 0) for r in range(rows)], pac)
    bfs([(rows-1, c) for c in range(cols)] +
        [(r, cols-1) for r in range(rows)], atl)

    return list(pac & atl)`,
        javascript: `function pacificAtlantic(heights) {
    const rows = heights.length, cols = heights[0].length;
    const pac = new Set(), atl = new Set();
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    function bfs(starts, visit) {
        const queue = [...starts];
        starts.forEach(([r, c]) => visit.add(\`\${r},\${c}\`));
        while (queue.length) {
            const [r, c] = queue.shift();
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                    !visit.has(\`\${nr},\${nc}\`) &&
                    heights[nr][nc] >= heights[r][c]) {
                    visit.add(\`\${nr},\${nc}\`);
                    queue.push([nr, nc]);
                }
            }
        }
    }

    const pacStarts = [], atlStarts = [];
    for (let c = 0; c < cols; c++) {
        pacStarts.push([0, c]);
        atlStarts.push([rows - 1, c]);
    }
    for (let r = 0; r < rows; r++) {
        pacStarts.push([r, 0]);
        atlStarts.push([r, cols - 1]);
    }
    bfs(pacStarts, pac);
    bfs(atlStarts, atl);

    const result = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (pac.has(\`\${r},\${c}\`) && atl.has(\`\${r},\${c}\`))
                result.push([r, c]);
    return result;
}`,
        java: `public List<List<Integer>> pacificAtlantic(int[][] heights) {
    int rows = heights.length, cols = heights[0].length;
    boolean[][] pac = new boolean[rows][cols];
    boolean[][] atl = new boolean[rows][cols];
    Queue<int[]> pacQueue = new LinkedList<>();
    Queue<int[]> atlQueue = new LinkedList<>();

    for (int c = 0; c < cols; c++) {
        pacQueue.offer(new int[]{0, c}); pac[0][c] = true;
        atlQueue.offer(new int[]{rows - 1, c}); atl[rows - 1][c] = true;
    }
    for (int r = 0; r < rows; r++) {
        pacQueue.offer(new int[]{r, 0}); pac[r][0] = true;
        atlQueue.offer(new int[]{r, cols - 1}); atl[r][cols - 1] = true;
    }

    bfs(heights, pacQueue, pac);
    bfs(heights, atlQueue, atl);

    List<List<Integer>> result = new ArrayList<>();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (pac[r][c] && atl[r][c])
                result.add(Arrays.asList(r, c));
    return result;
}

private void bfs(int[][] heights, Queue<int[]> queue, boolean[][] visit) {
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        for (int[] d : dirs) {
            int nr = cell[0] + d[0], nc = cell[1] + d[1];
            if (nr >= 0 && nr < heights.length && nc >= 0 && nc < heights[0].length
                    && !visit[nr][nc]
                    && heights[nr][nc] >= heights[cell[0]][cell[1]]) {
                visit[nr][nc] = true;
                queue.offer(new int[]{nr, nc});
            }
        }
    }
}`,
      },
      run: runPacificAtlanticBFS,
      lineExplanations: {
        python: {
          1: 'Define function taking height matrix',
          2: 'Get matrix dimensions',
          3: 'Sets of cells that can reach each ocean',
          4: 'Four directional offsets',
          6: 'BFS helper taking start cells and a visited set',
          7: 'Queue starts with every border cell at once',
          8: 'All starts are trivially reachable — mark visited',
          9: 'Expand the frontier until it stops growing',
          10: 'Dequeue the next reachable cell',
          11: 'Try each of the four directions',
          12: 'Compute neighbor coordinates',
          13: 'Neighbor must be inside the grid',
          14: 'Skip cells already known reachable',
          15: 'Only climb: neighbor must be same height or higher',
          16: 'Mark neighbor as able to drain to this ocean',
          17: 'Enqueue it so BFS continues from there',
          19: 'Pacific BFS: seed with the top row...',
          20: '...plus the left column border cells',
          21: 'Atlantic BFS: seed with the bottom row...',
          22: '...plus the right column border cells',
          24: 'Answer = intersection of the two reachable sets',
        },
        javascript: {
          1: 'Define function taking height matrix',
          2: 'Get matrix dimensions',
          3: 'Sets of cells that can reach each ocean',
          4: 'Four directional offsets',
          6: 'BFS helper taking start cells and a visited set',
          7: 'Copy start cells into the queue',
          8: 'All starts are trivially reachable — mark visited',
          9: 'Expand the frontier until the queue empties',
          10: 'Dequeue the next reachable cell',
          11: 'Try each of the four directions',
          12: 'Compute neighbor coordinates',
          13: 'Neighbor must be inside the grid',
          14: 'Skip cells already known reachable',
          15: 'Only climb: neighbor must be same height or higher',
          16: 'Mark neighbor as able to drain to this ocean',
          17: 'Enqueue it so BFS continues from there',
          23: 'Build both oceans’ border start lists',
          24: 'Walk every column index',
          25: 'Pacific touches the top row',
          26: 'Atlantic touches the bottom row',
          28: 'Walk every row index',
          29: 'Pacific touches the left column',
          30: 'Atlantic touches the right column',
          32: 'Run BFS outward from the Pacific coast',
          33: 'Run BFS outward from the Atlantic coast',
          35: 'Collect cells reachable from both oceans',
          36: 'Iterate through each row',
          37: 'Iterate through each column',
          38: 'Is this cell in both reachable sets?',
          39: 'Add coordinate to the answer',
          40: 'Return all dual-drainage cells',
        },
        java: {
          1: 'Define method returning list of coordinates',
          2: 'Get matrix dimensions',
          3: 'Boolean grid for Pacific reachability',
          4: 'Boolean grid for Atlantic reachability',
          5: 'BFS queue seeded with Pacific coast cells',
          6: 'BFS queue seeded with Atlantic coast cells',
          8: 'Walk every column index',
          9: 'Top row: seed Pacific queue and mark reached',
          10: 'Bottom row: seed Atlantic queue and mark reached',
          12: 'Walk every row index',
          13: 'Left column: seed Pacific queue and mark reached',
          14: 'Right column: seed Atlantic queue and mark reached',
          17: 'Run BFS outward from the Pacific coast',
          18: 'Run BFS outward from the Atlantic coast',
          20: 'Collect cells reachable from both oceans',
          21: 'Iterate through each row',
          22: 'Iterate through each column',
          23: 'Is this cell in both reachable sets?',
          24: 'Add coordinate pair to the answer',
          25: 'Return all dual-drainage cells',
          28: 'BFS helper expanding one ocean’s frontier',
          29: 'Four directional offsets',
          30: 'Expand until the queue empties',
          31: 'Dequeue the next reachable cell',
          32: 'Try each of the four directions',
          33: 'Compute neighbor coordinates',
          34: 'Neighbor must be inside the grid',
          35: 'Skip cells already known reachable',
          36: 'Only climb: neighbor must be same height or higher',
          37: 'Mark neighbor as able to drain to this ocean',
          38: 'Enqueue it so BFS continues from there',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking height matrix',
      2: 'Get matrix dimensions',
      3: 'Sets to track cells reachable by each ocean',
      5: 'Define DFS with reachability set and height',
      6: 'Check row bounds',
      7: 'Check column bounds',
      8: 'Skip already visited cells',
      9: 'Skip cells lower than previous (cant flow)',
      10: 'Return if any check fails',
      11: 'Mark cell as reachable by this ocean',
      12: 'Explore down neighbor',
      13: 'Explore up neighbor',
      14: 'Explore right neighbor',
      15: 'Explore left neighbor',
      17: 'DFS from top/bottom row for both oceans',
      18: 'Pacific: top row, Atlantic: bottom row',
      19: 'Atlantic: bottom row cells',
      20: 'DFS from left/right col for both oceans',
      21: 'Pacific: left column cells',
      22: 'Atlantic: right column cells',
      24: 'Return intersection of both reachable sets',
    },
    javascript: {
      1: 'Define function taking height matrix',
      2: 'Get matrix dimensions',
      3: 'Sets to track cells reachable by each ocean',
      5: 'Define DFS with visit set and prev height',
      6: 'Create unique key for cell coordinates',
      7: 'Check row bounds',
      8: 'Check column bounds',
      9: 'Skip already visited cells',
      10: 'Skip cells lower than previous',
      11: 'Return if any check fails',
      12: 'Mark cell as reachable by this ocean',
      13: 'Explore down neighbor',
      14: 'Explore up neighbor',
      15: 'Explore right neighbor',
      16: 'Explore left neighbor',
      19: 'DFS from top/bottom rows',
      20: 'Pacific from top row',
      21: 'Atlantic from bottom row',
      23: 'DFS from left/right columns',
      24: 'Pacific from left column',
      25: 'Atlantic from right column',
      28: 'Collect cells reachable by both oceans',
      29: 'Iterate through each row',
      30: 'Iterate through each column',
      31: 'Check if cell reaches both oceans',
      32: 'Add to result list',
      33: 'Return all cells reachable by both oceans',
    },
    java: {
      1: 'Define method returning list of coordinates',
      2: 'Get matrix dimensions',
      3: 'Boolean grids for Pacific reachability',
      4: 'Boolean grid for Atlantic reachability',
      6: 'DFS from top/bottom rows for both oceans',
      7: 'Pacific reachability from top row',
      8: 'Atlantic reachability from bottom row',
      10: 'DFS from left/right columns',
      11: 'Pacific reachability from left column',
      12: 'Atlantic reachability from right column',
      15: 'Collect cells reachable by both oceans',
      16: 'Iterate through each row',
      17: 'Iterate through each column',
      18: 'Check if reachable from both oceans',
      19: 'Add coordinate pair to result',
      23: 'Return result list',
      26: 'Define private DFS helper method',
      27: 'Check bounds, visited, and height condition',
      28: 'Skip invalid or lower cells',
      29: 'Return for invalid cells',
      31: 'Mark cell as reachable by this ocean',
      32: 'Explore down neighbor',
      33: 'Explore up neighbor',
      34: 'Explore right neighbor',
      35: 'Explore left neighbor',
    },
  },
};
