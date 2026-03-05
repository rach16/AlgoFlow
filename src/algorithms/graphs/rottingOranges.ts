import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runRottingOranges(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function getRottenCells(): [number, number][] {
    const cells: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 2) cells.push([r, c]);
      }
    }
    return cells;
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: '0 = empty, 1 = fresh, 2 = rotten',
    },
    highlights: [],
    message: 'BFS from all rotten oranges simultaneously. Each minute, rotten oranges infect adjacent fresh oranges.',
    codeLine: 1,
  } as AlgorithmStep);

  // Initialize queue with all rotten oranges
  const queue: [number, number][] = [];
  let freshCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      if (grid[r][c] === 1) freshCount++;
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: getRottenCells(),
      matrixSecondary: [],
      queue: queue.map(([r, c]) => `(${r},${c})`),
      result: `Fresh: ${freshCount}, Rotten: ${queue.length}`,
    },
    highlights: [],
    message: `Found ${queue.length} initially rotten orange(s) and ${freshCount} fresh orange(s).`,
    codeLine: 5,
    action: 'found',
  } as AlgorithmStep);

  let minutes = 0;

  while (queue.length > 0 && freshCount > 0) {
    const levelSize = queue.length;
    minutes++;

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: getRottenCells(),
        matrixSecondary: [],
        queue: queue.map(([r, c]) => `(${r},${c})`),
        result: `Minute ${minutes}: Processing ${levelSize} rotten oranges`,
      },
      highlights: [],
      message: `--- Minute ${minutes} --- Processing ${levelSize} rotten orange(s) from the queue.`,
      codeLine: 8,
    } as AlgorithmStep);

    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue.shift()!;

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (grid[nr][nc] !== 1) continue;

        grid[nr][nc] = 2;
        freshCount--;
        queue.push([nr, nc]);

        steps.push({
          state: {
            matrix: grid.map(row => [...row]),
            matrixHighlights: [[nr, nc]],
            matrixSecondary: [[r, c]],
            queue: queue.map(([r2, c2]) => `(${r2},${c2})`),
            result: `Minute ${minutes}: Fresh remaining = ${freshCount}`,
          },
          highlights: [],
          message: `Orange at (${nr}, ${nc}) becomes rotten (infected by (${r}, ${c})). Fresh remaining: ${freshCount}`,
          codeLine: 12,
          action: 'visit',
        } as AlgorithmStep);
      }
    }
  }

  const answer = freshCount > 0 ? -1 : minutes;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Answer: ${answer}`,
    },
    highlights: [],
    message: freshCount > 0
      ? `Done! ${freshCount} fresh orange(s) can never be reached. Return -1.`
      : `Done! All oranges rotted in ${minutes} minute(s). Return ${minutes}.`,
    codeLine: 15,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const rottingOranges: Algorithm = {
  id: 'rotting-oranges',
  name: 'Rotting Oranges',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'Multi-source BFS — all rotten oranges spread each minute',
  description:
    'You are given an m x n grid where 0 = empty, 1 = fresh orange, 2 = rotten orange. Every minute, any fresh orange adjacent (4-directionally) to a rotten orange becomes rotten. Return the minimum minutes until no fresh orange remains, or -1 if impossible.',
  problemUrl: 'https://leetcode.com/problems/rotting-oranges/',
  code: {
    python: `def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    directions = [(1,0),(-1,0),(0,1),(0,-1)]
    while queue and fresh > 0:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if (0 <= nr < rows and
                    0 <= nc < cols and
                    grid[nr][nc] == 1):
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1

    return -1 if fresh > 0 else minutes`,
    javascript: `function orangesRotting(grid) {
    const rows = grid.length, cols = grid[0].length;
    const queue = [];
    let fresh = 0;

    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 2) queue.push([r, c]);
            else if (grid[r][c] === 1) fresh++;
        }

    let minutes = 0;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (queue.length && fresh > 0) {
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const [r, c] = queue.shift();
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows &&
                    nc >= 0 && nc < cols &&
                    grid[nr][nc] === 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.push([nr, nc]);
                }
            }
        }
        minutes++;
    }
    return fresh > 0 ? -1 : minutes;
}`,
    java: `public int orangesRotting(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    Queue<int[]> queue = new LinkedList<>();
    int fresh = 0;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) {
                queue.offer(new int[]{r, c});
            } else if (grid[r][c] == 1) {
                fresh++;
            }
        }
    }

    int minutes = 0;
    int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!queue.isEmpty() && fresh > 0) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            int[] pos = queue.poll();
            for (int[] dir : directions) {
                int nr = pos[0] + dir[0], nc = pos[1] + dir[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2;
                    queue.offer(new int[]{nr, nc});
                    fresh--;
                }
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}`,
  },
  defaultInput: [
    [2, 1, 1],
    [1, 1, 0],
    [0, 1, 1],
  ],
  run: runRottingOranges,
  lineExplanations: {
    python: {
      1: 'Define function taking the grid',
      2: 'Get grid dimensions',
      3: 'Initialize BFS queue with deque',
      4: 'Count fresh oranges',
      6: 'Scan grid for initial rotten and fresh',
      7: 'Iterate through each column',
      8: 'If cell is rotten, add to queue',
      9: 'Seed BFS queue with rotten orange',
      10: 'If cell is fresh, increment counter',
      11: 'Count fresh oranges for tracking',
      13: 'Initialize minutes counter',
      14: 'Define four directional offsets',
      15: 'BFS while queue has items and fresh remain',
      16: 'Process all oranges at current time step',
      17: 'Dequeue one rotten orange',
      18: 'Try each of four directions',
      19: 'Calculate neighbor coordinates',
      20: 'Check row bounds',
      21: 'Check column bounds',
      22: 'Check if neighbor is fresh',
      23: 'Rot the fresh orange',
      24: 'Decrement fresh count',
      25: 'Add newly rotten to queue',
      26: 'Increment time after processing level',
      28: 'Return -1 if fresh remain, else minutes',
    },
    javascript: {
      1: 'Define function taking the grid',
      2: 'Get grid dimensions',
      3: 'Initialize BFS queue array',
      4: 'Count fresh oranges',
      6: 'Scan grid for rotten and fresh oranges',
      7: 'Iterate through each column',
      8: 'Add rotten orange to queue',
      9: 'Count fresh orange',
      12: 'Initialize minutes counter',
      13: 'Define four directional offsets',
      14: 'BFS while queue has items and fresh remain',
      15: 'Save current level size',
      16: 'Process all oranges at current time step',
      17: 'Dequeue one rotten orange',
      18: 'Try each of four directions',
      19: 'Calculate neighbor coordinates',
      20: 'Check row bounds',
      21: 'Check column bounds',
      22: 'Check if neighbor is fresh',
      23: 'Rot the fresh orange',
      24: 'Decrement fresh count',
      25: 'Add newly rotten to queue',
      29: 'Increment minutes after processing level',
      31: 'Return -1 if fresh remain, else minutes',
    },
    java: {
      1: 'Define method taking the grid',
      2: 'Get grid dimensions',
      3: 'Initialize BFS queue',
      4: 'Count fresh oranges',
      6: 'Scan grid for rotten and fresh oranges',
      7: 'Iterate through each column',
      8: 'If cell is rotten',
      9: 'Add rotten orange position to queue',
      10: 'If cell is fresh',
      11: 'Increment fresh counter',
      15: 'Initialize minutes counter',
      16: 'Define four directional offsets',
      17: 'BFS while queue has items and fresh remain',
      18: 'Save current level size',
      19: 'Process all oranges at current time step',
      20: 'Dequeue one rotten orange position',
      21: 'Try each of four directions',
      22: 'Calculate neighbor coordinates',
      23: 'Check bounds and if neighbor is fresh',
      24: 'Rot the fresh orange',
      25: 'Add newly rotten to queue',
      26: 'Decrement fresh count',
      30: 'Increment minutes after processing level',
      32: 'Return minutes if all rotted, else -1',
    },
  },
};
