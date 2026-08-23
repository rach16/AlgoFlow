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

function runRottingOrangesSimulation(input: unknown): AlgorithmStep[] {
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
    message: 'Brute-force simulation: no queue at all. Each minute, rescan the ENTIRE grid, collect every fresh orange touching rot, then flip them all at once. Repeat until a pass changes nothing.',
    codeLine: 1,
  } as AlgorithmStep);

  let minutes = 0;

  // Safety bound: the grid can change at most rows*cols times
  for (let pass = 0; pass <= rows * cols; pass++) {
    const infected: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== 1) continue;
        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 2) {
            infected.push([r, c]);
            break;
          }
        }
      }
    }

    if (infected.length === 0) {
      steps.push({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: getRottenCells(),
          matrixSecondary: [],
          result: 'Grid is stable — no fresh orange touches rot',
        },
        highlights: [],
        message: `Full-grid scan found no fresh orange adjacent to a rotten one. The grid is stable — stop the simulation.`,
        codeLine: 18,
      } as AlgorithmStep);
      break;
    }

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: getRottenCells(),
        matrixSecondary: infected.map(h => [...h]),
        result: `Scan pass ${minutes + 1}: ${infected.length} orange(s) will rot`,
      },
      highlights: [],
      message: `Scan every cell: ${infected.length} fresh orange(s) touch a rotten neighbor: ${infected.map(([r, c]) => `(${r},${c})`).join(', ')}. Mark them, but don't flip yet — flipping mid-scan would let rot travel 2+ cells in one minute.`,
      codeLine: 15,
      action: 'compare',
    } as AlgorithmStep);

    for (const [r, c] of infected) {
      grid[r][c] = 2;
    }
    minutes++;

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: infected.map(h => [...h]),
        matrixSecondary: [],
        result: `Minute ${minutes} complete`,
      },
      highlights: [],
      message: `Minute ${minutes}: flip all ${infected.length} marked orange(s) to rotten simultaneously.`,
      codeLine: 20,
      action: 'swap',
    } as AlgorithmStep);
  }

  let freshLeft = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) freshLeft++;
    }
  }
  const answer = freshLeft > 0 ? -1 : minutes;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Answer: ${answer}`,
    },
    highlights: [],
    message: freshLeft > 0
      ? `Done! ${freshLeft} fresh orange(s) survived — they are unreachable. Return -1.`
      : `Done! All oranges rotted after ${minutes} pass(es). Each pass costs a full O(m·n) rescan, so this is O((m·n)²) worst case vs O(m·n) for BFS.`,
    codeLine: freshLeft > 0 ? 24 : 25,
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
    python: `from collections import deque

def orangesRotting(grid):
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
  optimalApproachName: 'Multi-source BFS',
  approaches: [
    {
      id: 'simulation-loop',
      name: 'Grid Simulation',
      timeComplexity: 'O((m·n)²)',
      spaceComplexity: 'O(m·n)',
      description:
        'No queue: repeatedly rescan the whole grid, flipping every fresh orange adjacent to rot in one synchronized pass, until nothing changes — intuitive but requires a full scan per minute instead of BFS.',
      code: {
        python: `def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    dirs = [(1,0),(-1,0),(0,1),(0,-1)]
    minutes = 0

    while True:
        infected = []
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    for dr, dc in dirs:
                        nr, nc = r + dr, c + dc
                        if (0 <= nr < rows and 0 <= nc < cols
                                and grid[nr][nc] == 2):
                            infected.append((r, c))
                            break
        if not infected:
            break
        for r, c in infected:
            grid[r][c] = 2
        minutes += 1

    if any(1 in row for row in grid):
        return -1
    return minutes`,
        javascript: `function orangesRotting(grid) {
    const rows = grid.length, cols = grid[0].length;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let minutes = 0;

    while (true) {
        const infected = [];
        for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++)
                if (grid[r][c] === 1 &&
                    dirs.some(([dr, dc]) => {
                        const nr = r + dr, nc = c + dc;
                        return nr >= 0 && nr < rows && nc >= 0 &&
                            nc < cols && grid[nr][nc] === 2;
                    }))
                    infected.push([r, c]);
        if (!infected.length) break;
        for (const [r, c] of infected) grid[r][c] = 2;
        minutes++;
    }

    return grid.some(row => row.includes(1)) ? -1 : minutes;
}`,
        java: `public int orangesRotting(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    int minutes = 0;

    while (true) {
        List<int[]> infected = new ArrayList<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != 1) continue;
                for (int[] d : dirs) {
                    int nr = r + d[0], nc = c + d[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                            && grid[nr][nc] == 2) {
                        infected.add(new int[]{r, c});
                        break;
                    }
                }
            }
        }
        if (infected.isEmpty()) break;
        for (int[] cell : infected) grid[cell[0]][cell[1]] = 2;
        minutes++;
    }

    for (int[] row : grid)
        for (int v : row)
            if (v == 1) return -1;
    return minutes;
}`,
      },
      run: runRottingOrangesSimulation,
      lineExplanations: {
        python: {
          1: 'Define function taking the grid',
          2: 'Get grid dimensions',
          3: 'Four directional offsets',
          4: 'Minutes elapsed so far',
          6: 'Simulate minute by minute until stable',
          7: 'Collect this minute\'s infections before flipping any',
          8: 'Scan every row...',
          9: '...and every column of the grid',
          10: 'Only fresh oranges can get infected',
          11: 'Look at all four neighbors',
          12: 'Compute neighbor coordinates',
          13: 'Neighbor must be inside the grid',
          14: 'Is the neighbor rotten?',
          15: 'Mark this fresh orange for infection',
          16: 'One rotten neighbor is enough — stop checking',
          17: 'Nothing got infected this pass...',
          18: '...so the grid is stable: stop simulating',
          19: 'Now flip all marked oranges together...',
          20: '...so rot spreads exactly one cell per minute',
          21: 'One full minute has elapsed',
          23: 'Any fresh orange left is unreachable',
          24: 'Return -1: impossible to rot everything',
          25: 'All rotted — return elapsed minutes',
        },
        javascript: {
          1: 'Define function taking the grid',
          2: 'Get grid dimensions',
          3: 'Four directional offsets',
          4: 'Minutes elapsed so far',
          6: 'Simulate minute by minute until stable',
          7: 'Collect this minute\'s infections before flipping any',
          8: 'Scan every row...',
          9: '...and every column of the grid',
          10: 'Only fresh oranges can get infected',
          11: 'Does any of the four neighbors qualify?',
          12: 'Compute neighbor coordinates',
          13: 'Neighbor must be inside the grid...',
          14: '...and rotten',
          16: 'Mark this fresh orange for infection',
          17: 'No infections: grid is stable, stop simulating',
          18: 'Flip all marked oranges together (synchronized)',
          19: 'One full minute has elapsed',
          22: 'Fresh orange left means -1, else elapsed minutes',
        },
        java: {
          1: 'Define method taking the grid',
          2: 'Get grid dimensions',
          3: 'Four directional offsets',
          4: 'Minutes elapsed so far',
          6: 'Simulate minute by minute until stable',
          7: 'Collect this minute\'s infections before flipping any',
          8: 'Scan every row...',
          9: '...and every column of the grid',
          10: 'Only fresh oranges can get infected',
          11: 'Look at all four neighbors',
          12: 'Compute neighbor coordinates',
          13: 'Neighbor must be inside the grid...',
          14: '...and rotten',
          15: 'Mark this fresh orange for infection',
          16: 'One rotten neighbor is enough — stop checking',
          21: 'No infections: grid is stable, stop simulating',
          22: 'Flip all marked oranges together (synchronized)',
          23: 'One full minute has elapsed',
          26: 'Scan for survivors',
          27: 'Check every cell value',
          28: 'A fresh orange survived — impossible, return -1',
          29: 'All rotted — return elapsed minutes',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
      3: 'Define function taking the grid',
      4: 'Get grid dimensions',
      5: 'Initialize BFS queue with deque',
      6: 'Count fresh oranges',
      8: 'Scan grid for initial rotten and fresh',
      9: 'Iterate through each column',
      10: 'If cell is rotten, add to queue',
      11: 'Seed BFS queue with rotten orange',
      12: 'If cell is fresh, increment counter',
      13: 'Count fresh oranges for tracking',
      15: 'Initialize minutes counter',
      16: 'Define four directional offsets',
      17: 'BFS while queue has items and fresh remain',
      18: 'Process all oranges at current time step',
      19: 'Dequeue one rotten orange',
      20: 'Try each of four directions',
      21: 'Calculate neighbor coordinates',
      22: 'Check row bounds',
      23: 'Check column bounds',
      24: 'Check if neighbor is fresh',
      25: 'Rot the fresh orange',
      26: 'Decrement fresh count',
      27: 'Add newly rotten to queue',
      28: 'Increment time after processing level',
      30: 'Return -1 if fresh remain, else minutes',
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
      16: 'Initialize minutes counter',
      17: 'Define four directional offsets',
      18: 'BFS while queue has items and fresh remain',
      19: 'Save current level size',
      20: 'Process all oranges at current time step',
      21: 'Dequeue one rotten orange position',
      22: 'Try each of four directions',
      23: 'Calculate neighbor coordinates',
      24: 'Check bounds and if neighbor is fresh',
      25: 'Rot the fresh orange',
      26: 'Add newly rotten to queue',
      27: 'Decrement fresh count',
      31: 'Increment minutes after processing level',
      33: 'Return minutes if all rotted, else -1',
    },
  },
};
