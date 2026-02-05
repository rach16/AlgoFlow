import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSwimInRisingWater(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const n = grid.length;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Finding minimum time to swim from (0,0) to (n-1,n-1)...',
    },
    highlights: [],
    message: `${n}x${n} grid. Find minimum time t so we can swim from top-left to bottom-right.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Modified Dijkstra / BFS with priority queue
  const visited: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  // Min-heap: [maxElevation, row, col]
  const pq: [number, number, number][] = [[grid[0][0], 0, 0]];
  visited[0][0] = true;

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [[0, 0]],
      matrixSecondary: [],
      result: 'Starting from (0,0)...',
    },
    highlights: [],
    message: `Start at (0,0) with elevation ${grid[0][0]}. Use modified Dijkstra to minimize max elevation.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  let answer = 0;
  const path: [number, number][] = [[0, 0]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [maxElev, r, c] = pq.shift()!;

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: path.map(p => [...p] as [number, number]),
        matrixSecondary: [[r, c]],
        result: `Current max elevation: ${maxElev}`,
      },
      highlights: [],
      message: `Process cell (${r},${c}) with max elevation so far = ${maxElev}.`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    if (r === n - 1 && c === n - 1) {
      answer = maxElev;

      steps.push({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: path.map(p => [...p] as [number, number]),
          matrixSecondary: [[r, c]],
          result: `Minimum time: ${answer}`,
        },
        highlights: [],
        message: `Reached (${n - 1},${n - 1})! Minimum time = ${answer}.`,
        codeLine: 7,
        action: 'found',
      } as AlgorithmStep);
      break;
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= n || nc < 0 || nc >= n || visited[nr][nc]) continue;

      visited[nr][nc] = true;
      const newMax = Math.max(maxElev, grid[nr][nc]);
      pq.push([newMax, nr, nc]);
      path.push([nr, nc]);

      steps.push({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: path.map(p => [...p] as [number, number]),
          matrixSecondary: [[nr, nc]],
          result: `Current max elevation: ${maxElev}`,
        },
        highlights: [],
        message: `Explore neighbor (${nr},${nc}) with elevation ${grid[nr][nc]}. Max elevation on path = ${newMax}.`,
        codeLine: 9,
        action: 'compare',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Answer: ${answer}`,
    },
    highlights: [],
    message: `Done! Minimum time to swim from (0,0) to (${n - 1},${n - 1}) = ${answer}.`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const swimInRisingWater: Algorithm = {
  id: 'swim-in-rising-water',
  name: 'Swim in Rising Water',
  category: 'Advanced Graphs',
  difficulty: 'Hard',
  timeComplexity: 'O(n² log n)',
  spaceComplexity: 'O(n²)',
  pattern: 'Modified Dijkstra — min heap, path cost = max elevation',
  description:
    'You are given an n x n integer matrix grid where each value grid[i][j] represents the elevation at that point (i, j). The rain starts to fall. At time t, the depth of the water everywhere is t. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most t. Return the least time until you can reach the bottom right square (n - 1, n - 1) if you start at the top left square (0, 0).',
  problemUrl: 'https://leetcode.com/problems/swim-in-rising-water/',
  code: {
    python: `def swimInWater(grid):
    n = len(grid)
    visited = set()
    heap = [(grid[0][0], 0, 0)]
    visited.add((0, 0))

    while heap:
        maxElev, r, c = heapq.heappop(heap)
        if r == n-1 and c == n-1:
            return maxElev

        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r+dr, c+dc
            if 0<=nr<n and 0<=nc<n and (nr,nc) not in visited:
                visited.add((nr, nc))
                heapq.heappush(heap, (max(maxElev, grid[nr][nc]), nr, nc))

    return -1`,
    javascript: `function swimInWater(grid) {
    const n = grid.length;
    const visited = new Set();
    const heap = [[grid[0][0], 0, 0]];
    visited.add("0,0");

    while (heap.length) {
        heap.sort((a, b) => a[0] - b[0]);
        const [maxElev, r, c] = heap.shift();
        if (r === n-1 && c === n-1) return maxElev;

        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            const nr = r+dr, nc = c+dc;
            if (nr>=0 && nr<n && nc>=0 && nc<n && !visited.has(nr+","+nc)) {
                visited.add(nr+","+nc);
                heap.push([Math.max(maxElev, grid[nr][nc]), nr, nc]);
            }
        }
    }
    return -1;
}`,
  },
  defaultInput: [
    [0, 2],
    [1, 3],
  ],
  run: runSwimInRisingWater,
};
