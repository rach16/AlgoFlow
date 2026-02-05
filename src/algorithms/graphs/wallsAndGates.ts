import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

const INF = 2147483647;

function cellDisplay(val: number): string {
  if (val === INF) return 'INF';
  if (val === -1) return 'W';
  return String(val);
}

function runWallsAndGates(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function displayMatrix() {
    return grid.map(row => row.map(v => cellDisplay(v)));
  }

  steps.push({
    state: {
      matrix: displayMatrix(),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'INF = empty room, W = wall, 0 = gate',
    },
    highlights: [],
    message: 'Multi-source BFS from all gates. Fill each empty room with distance to nearest gate.',
    codeLine: 1,
  } as AlgorithmStep);

  // Find all gates (cells with value 0)
  const queue: [number, number][] = [];
  const gateHighlights: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) {
        queue.push([r, c]);
        gateHighlights.push([r, c]);
      }
    }
  }

  steps.push({
    state: {
      matrix: displayMatrix(),
      matrixHighlights: gateHighlights.map(h => [...h]),
      matrixSecondary: [],
      queue: queue.map(([r, c]) => `(${r},${c})`),
      result: `Found ${queue.length} gates`,
    },
    highlights: [],
    message: `Found ${queue.length} gate(s). Add all gates to BFS queue as starting points.`,
    codeLine: 4,
    action: 'found',
  } as AlgorithmStep);

  // BFS from all gates simultaneously
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;

    steps.push({
      state: {
        matrix: displayMatrix(),
        matrixHighlights: [[r, c]],
        matrixSecondary: [],
        queue: queue.map(([r2, c2]) => `(${r2},${c2})`),
        result: `Processing (${r}, ${c}), distance = ${grid[r][c]}`,
      },
      highlights: [],
      message: `Dequeue (${r}, ${c}) with distance ${grid[r][c]}. Check all 4 neighbors.`,
      codeLine: 7,
      action: 'pop',
    } as AlgorithmStep);

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] !== INF) continue;

      grid[nr][nc] = grid[r][c] + 1;
      queue.push([nr, nc]);

      steps.push({
        state: {
          matrix: displayMatrix(),
          matrixHighlights: [[r, c]],
          matrixSecondary: [[nr, nc]],
          queue: queue.map(([r2, c2]) => `(${r2},${c2})`),
          result: `Updated (${nr}, ${nc}) = ${grid[nr][nc]}`,
        },
        highlights: [],
        message: `Empty room at (${nr}, ${nc}) updated to distance ${grid[nr][nc]}. Added to queue.`,
        codeLine: 10,
        action: 'insert',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      matrix: displayMatrix(),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'All rooms filled with shortest distance to nearest gate',
    },
    highlights: [],
    message: 'Done! All reachable empty rooms now contain the shortest distance to the nearest gate.',
    codeLine: 13,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const wallsAndGates: Algorithm = {
  id: 'walls-and-gates',
  name: 'Walls and Gates',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'Multi-source BFS — start from all gates simultaneously',
  description:
    'You are given an m x n grid rooms initialized with INF (empty room), -1 (wall), or 0 (gate). Fill each empty room with the distance to its nearest gate. Use multi-source BFS starting from all gates simultaneously.',
  problemUrl: 'https://leetcode.com/problems/walls-and-gates/',
  code: {
    python: `def wallsAndGates(rooms):
    if not rooms:
        return
    rows, cols = len(rooms), len(rooms[0])
    INF = 2147483647
    queue = deque()

    for r in range(rows):
        for c in range(cols):
            if rooms[r][c] == 0:
                queue.append((r, c))

    directions = [(1,0),(-1,0),(0,1),(0,-1)]
    while queue:
        r, c = queue.popleft()
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and
                0 <= nc < cols and
                rooms[nr][nc] == INF):
                rooms[nr][nc] = rooms[r][c] + 1
                queue.append((nr, nc))`,
    javascript: `function wallsAndGates(rooms) {
    if (!rooms.length) return;
    const rows = rooms.length, cols = rooms[0].length;
    const INF = 2147483647;
    const queue = [];

    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (rooms[r][c] === 0)
                queue.push([r, c]);

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (queue.length) {
        const [r, c] = queue.shift();
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows &&
                nc >= 0 && nc < cols &&
                rooms[nr][nc] === INF) {
                rooms[nr][nc] = rooms[r][c] + 1;
                queue.push([nr, nc]);
            }
        }
    }
}`,
  },
  defaultInput: [
    [INF, -1, 0, INF],
    [INF, INF, INF, -1],
    [INF, -1, INF, -1],
    [0, -1, INF, INF],
  ],
  run: runWallsAndGates,
};
