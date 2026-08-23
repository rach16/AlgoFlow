import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSurroundedRegions(input: unknown): AlgorithmStep[] {
  const board = (input as string[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = board.length;
  const cols = board[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  steps.push({
    state: {
      matrix: board.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Capture surrounded regions',
    },
    highlights: [],
    message: 'Capture all "O" regions that are fully surrounded by "X". Border-connected "O"s are safe.',
    codeLine: 1,
  } as AlgorithmStep);

  // Phase 1: Mark border-connected O's as safe (temporarily mark as 'T')
  const safeHighlights: [number, number][] = [];

  function dfs(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (board[r][c] !== 'O') return;

    board[r][c] = 'T'; // Temporarily mark as safe
    safeHighlights.push([r, c]);

    steps.push({
      state: {
        matrix: board.map(row => [...row]),
        matrixHighlights: safeHighlights.map(h => [...h]),
        matrixSecondary: [],
        result: `Safe cells: ${safeHighlights.length}`,
      },
      highlights: [],
      message: `Mark (${r}, ${c}) as safe (border-connected). Temporarily set to "T".`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    for (const [dr, dc] of directions) {
      dfs(r + dr, c + dc);
    }
  }

  steps.push({
    state: {
      matrix: board.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Phase 1: Find border-connected O regions',
    },
    highlights: [],
    message: 'Phase 1: DFS from all border "O" cells to find safe (non-surrounded) regions.',
    codeLine: 3,
  } as AlgorithmStep);

  // Run DFS from border O's
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === 0 || r === rows - 1 || c === 0 || c === cols - 1) && board[r][c] === 'O') {
        dfs(r, c);
      }
    }
  }

  steps.push({
    state: {
      matrix: board.map(row => [...row]),
      matrixHighlights: safeHighlights.map(h => [...h]),
      matrixSecondary: [],
      result: `${safeHighlights.length} safe border-connected cells found`,
    },
    highlights: [],
    message: `Phase 1 complete. Found ${safeHighlights.length} safe border-connected "O" cells.`,
    codeLine: 7,
    action: 'found',
  } as AlgorithmStep);

  // Phase 2: Capture surrounded O's and restore safe T's
  steps.push({
    state: {
      matrix: board.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Phase 2: Capture surrounded and restore safe',
    },
    highlights: [],
    message: 'Phase 2: Remaining "O" cells are surrounded -> capture to "X". Restore "T" back to "O".',
    codeLine: 9,
  } as AlgorithmStep);

  const capturedCells: [number, number][] = [];
  const restoredCells: [number, number][] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'O') {
        board[r][c] = 'X';
        capturedCells.push([r, c]);

        steps.push({
          state: {
            matrix: board.map(row => [...row]),
            matrixHighlights: capturedCells.map(h => [...h]),
            matrixSecondary: [],
            result: `Captured ${capturedCells.length} cells`,
          },
          highlights: [],
          message: `Capture surrounded "O" at (${r}, ${c}) -> "X"`,
          codeLine: 11,
          action: 'swap',
        } as AlgorithmStep);
      } else if (board[r][c] === 'T') {
        board[r][c] = 'O';
        restoredCells.push([r, c]);

        steps.push({
          state: {
            matrix: board.map(row => [...row]),
            matrixHighlights: [],
            matrixSecondary: restoredCells.map(h => [...h]),
            result: `Restored ${restoredCells.length} safe cells`,
          },
          highlights: [],
          message: `Restore safe "T" at (${r}, ${c}) -> "O"`,
          codeLine: 12,
          action: 'swap',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      matrix: board.map(row => [...row]),
      matrixHighlights: capturedCells.map(h => [...h]),
      matrixSecondary: restoredCells.map(h => [...h]),
      result: `Captured: ${capturedCells.length}, Safe: ${restoredCells.length}`,
    },
    highlights: [],
    message: `Done! Captured ${capturedCells.length} surrounded cell(s). ${restoredCells.length} border-connected cell(s) preserved.`,
    codeLine: 14,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runSurroundedRegionsBFS(input: unknown): AlgorithmStep[] {
  const board = (input as string[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const rows = board.length;
  const cols = board[0].length;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  steps.push({
    state: {
      matrix: board.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Capture surrounded regions (BFS)',
    },
    highlights: [],
    message: 'Same border-first insight, but iterative: put every border "O" in a queue and let BFS spread the "safe" marking inward — no recursion stack to overflow on huge boards.',
    codeLine: 1,
  } as AlgorithmStep);

  // Phase 1: seed queue with all border O's
  const queue: [number, number][] = [];
  const safeHighlights: [number, number][] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === 0 || r === rows - 1 || c === 0 || c === cols - 1) && board[r][c] === 'O') {
        board[r][c] = 'T';
        queue.push([r, c]);
        safeHighlights.push([r, c]);
      }
    }
  }

  steps.push({
    state: {
      matrix: board.map(row => [...row]),
      matrixHighlights: safeHighlights.map(h => [...h]),
      matrixSecondary: [],
      queue: queue.map(([r, c]) => `(${r},${c})`),
      result: `Seeded ${queue.length} border "O" cell(s)`,
    },
    highlights: [],
    message: `Scan the border: ${queue.length} "O" cell(s) touch the edge. Mark them "T" (safe) and enqueue them as BFS sources.`,
    codeLine: 9,
    action: 'push',
  } as AlgorithmStep);

  // BFS inward from the border
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;

    steps.push({
      state: {
        matrix: board.map(row => [...row]),
        matrixHighlights: [[r, c]],
        matrixSecondary: safeHighlights.map(h => [...h]),
        queue: queue.map(([r2, c2]) => `(${r2},${c2})`),
        result: `Processing safe cell (${r}, ${c})`,
      },
      highlights: [],
      message: `Dequeue safe cell (${r}, ${c}). Any adjacent "O" is also connected to the border, so it is safe too.`,
      codeLine: 14,
      action: 'pop',
    } as AlgorithmStep);

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (board[nr][nc] !== 'O') continue;

      board[nr][nc] = 'T';
      queue.push([nr, nc]);
      safeHighlights.push([nr, nc]);

      steps.push({
        state: {
          matrix: board.map(row => [...row]),
          matrixHighlights: [[nr, nc]],
          matrixSecondary: safeHighlights.map(h => [...h]),
          queue: queue.map(([r2, c2]) => `(${r2},${c2})`),
          result: `Safe cells: ${safeHighlights.length}`,
        },
        highlights: [],
        message: `Neighbor (${nr}, ${nc}) is "O" — reachable from the border via (${r}, ${c}). Mark "T" and enqueue.`,
        codeLine: 19,
        action: 'visit',
      } as AlgorithmStep);
    }
  }

  // Phase 2: capture surrounded O's and restore safe T's
  const capturedCells: [number, number][] = [];
  const restoredCells: [number, number][] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'O') {
        board[r][c] = 'X';
        capturedCells.push([r, c]);

        steps.push({
          state: {
            matrix: board.map(row => [...row]),
            matrixHighlights: capturedCells.map(h => [...h]),
            matrixSecondary: [],
            result: `Captured ${capturedCells.length} cell(s)`,
          },
          highlights: [],
          message: `(${r}, ${c}) is still "O" — BFS never reached it, so it is fully surrounded. Capture -> "X".`,
          codeLine: 25,
          action: 'swap',
        } as AlgorithmStep);
      } else if (board[r][c] === 'T') {
        board[r][c] = 'O';
        restoredCells.push([r, c]);

        steps.push({
          state: {
            matrix: board.map(row => [...row]),
            matrixHighlights: [],
            matrixSecondary: restoredCells.map(h => [...h]),
            result: `Restored ${restoredCells.length} safe cell(s)`,
          },
          highlights: [],
          message: `(${r}, ${c}) was marked "T" (border-connected). Restore -> "O".`,
          codeLine: 27,
          action: 'swap',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      matrix: board.map(row => [...row]),
      matrixHighlights: capturedCells.map(h => [...h]),
      matrixSecondary: restoredCells.map(h => [...h]),
      result: `Captured: ${capturedCells.length}, Safe: ${restoredCells.length}`,
    },
    highlights: [],
    message: `Done! BFS captured ${capturedCells.length} surrounded cell(s) and preserved ${restoredCells.length} border-connected cell(s) — identical result to DFS, found level by level.`,
    codeLine: 27,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const surroundedRegions: Algorithm = {
  id: 'surrounded-regions',
  name: 'Surrounded Regions',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DFS from Border — mark border-connected O, flip the rest',
  description:
    'Given an m x n matrix board containing "X" and "O", capture all regions that are 4-directionally surrounded by "X". A region is captured by flipping all "O"s into "X"s. Regions connected to the border cannot be captured.',
  problemUrl: 'https://leetcode.com/problems/surrounded-regions/',
  code: {
    python: `def solve(board):
    rows, cols = len(board), len(board[0])

    def dfs(r, c):
        if (r < 0 or r >= rows or
            c < 0 or c >= cols or
            board[r][c] != "O"):
            return
        board[r][c] = "T"
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)

    # Mark border-connected O's as T
    for r in range(rows):
        for c in range(cols):
            if (board[r][c] == "O" and
                (r in [0, rows-1] or
                 c in [0, cols-1])):
                dfs(r, c)

    # Capture surrounded O's, restore T's
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == "O":
                board[r][c] = "X"
            elif board[r][c] == "T":
                board[r][c] = "O"`,
    javascript: `function solve(board) {
    const rows = board.length, cols = board[0].length;

    function dfs(r, c) {
        if (r < 0 || r >= rows ||
            c < 0 || c >= cols ||
            board[r][c] !== "O")
            return;
        board[r][c] = "T";
        dfs(r+1, c);
        dfs(r-1, c);
        dfs(r, c+1);
        dfs(r, c-1);
    }

    // Mark border-connected O's as T
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (board[r][c] === "O" &&
                (r === 0 || r === rows-1 ||
                 c === 0 || c === cols-1))
                dfs(r, c);

    // Capture surrounded O's, restore T's
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === "O") board[r][c] = "X";
            else if (board[r][c] === "T") board[r][c] = "O";
        }
}`,
    java: `public void solve(char[][] board) {
    int rows = board.length, cols = board[0].length;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (board[r][c] == 'O' && (r == 0 || r == rows - 1 || c == 0 || c == cols - 1)) {
                dfs(board, r, c);
            }
        }
    }

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (board[r][c] == 'O') {
                board[r][c] = 'X';
            } else if (board[r][c] == 'T') {
                board[r][c] = 'O';
            }
        }
    }
}

private void dfs(char[][] board, int r, int c) {
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != 'O') {
        return;
    }
    board[r][c] = 'T';
    dfs(board, r + 1, c);
    dfs(board, r - 1, c);
    dfs(board, r, c + 1);
    dfs(board, r, c - 1);
}`,
  },
  defaultInput: [
    ['X', 'X', 'X', 'X'],
    ['X', 'O', 'O', 'X'],
    ['X', 'X', 'O', 'X'],
    ['X', 'O', 'X', 'X'],
  ],
  run: runSurroundedRegions,
  optimalApproachName: 'Border DFS',
  approaches: [
    {
      id: 'border-bfs',
      name: 'Border BFS',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(m·n)',
      description:
        'Marks the same border-connected regions with an explicit queue instead of recursion — the safe zone grows level by level, and there is no risk of stack overflow on large boards.',
      code: {
        python: `from collections import deque

def solve(board):
    rows, cols = len(board), len(board[0])
    queue = deque()

    for r in range(rows):
        for c in range(cols):
            if (board[r][c] == "O" and
                (r in [0, rows-1] or c in [0, cols-1])):
                queue.append((r, c))
                board[r][c] = "T"

    dirs = [(1,0),(-1,0),(0,1),(0,-1)]
    while queue:
        r, c = queue.popleft()
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and 0 <= nc < cols
                    and board[nr][nc] == "O"):
                board[nr][nc] = "T"
                queue.append((nr, nc))

    for r in range(rows):
        for c in range(cols):
            if board[r][c] == "O":
                board[r][c] = "X"
            elif board[r][c] == "T":
                board[r][c] = "O"`,
        javascript: `function solve(board) {
    const rows = board.length, cols = board[0].length;
    const queue = [];

    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            if (board[r][c] === "O" &&
                (r === 0 || r === rows-1 ||
                 c === 0 || c === cols-1)) {
                queue.push([r, c]);
                board[r][c] = "T";
            }

    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (queue.length) {
        const [r, c] = queue.shift();
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 &&
                nc < cols && board[nr][nc] === "O") {
                board[nr][nc] = "T";
                queue.push([nr, nc]);
            }
        }
    }

    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === "O") board[r][c] = "X";
            else if (board[r][c] === "T") board[r][c] = "O";
        }
}`,
        java: `public void solve(char[][] board) {
    int rows = board.length, cols = board[0].length;
    Queue<int[]> queue = new LinkedList<>();

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (board[r][c] == 'O' && (r == 0 || r == rows - 1 || c == 0 || c == cols - 1)) {
                queue.offer(new int[]{r, c});
                board[r][c] = 'T';
            }
        }
    }

    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        for (int[] d : dirs) {
            int nr = cell[0] + d[0], nc = cell[1] + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] == 'O') {
                board[nr][nc] = 'T';
                queue.offer(new int[]{nr, nc});
            }
        }
    }

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (board[r][c] == 'O') {
                board[r][c] = 'X';
            } else if (board[r][c] == 'T') {
                board[r][c] = 'O';
            }
        }
    }
}`,
      },
      run: runSurroundedRegionsBFS,
      lineExplanations: {
        python: {
          1: 'deque pops from the front in O(1); a plain list is O(n) per popleft',
          3: 'Define function taking the board in-place',
          4: 'Get board dimensions',
          5: 'Queue of safe cells to expand from',
          7: 'Scan every row...',
          8: '...and every column',
          9: 'Looking for "O" cells...',
          10: '...that sit on the border',
          11: 'Enqueue border "O" as a BFS source',
          12: 'Mark it "T" immediately so it is not re-added',
          14: 'Four directional offsets',
          15: 'Expand the safe zone until the queue empties',
          16: 'Dequeue the next known-safe cell',
          17: 'Look at all four neighbors',
          18: 'Compute neighbor coordinates',
          19: 'Neighbor must be inside the board',
          20: 'Only untouched "O" cells spread the marking',
          21: 'Neighbor is border-connected too — mark "T"',
          22: 'Enqueue it so BFS keeps spreading inward',
          24: 'Second pass: resolve every cell',
          25: 'Iterate through each column',
          26: 'Still "O" means BFS never reached it',
          27: 'Surrounded — capture by flipping to "X"',
          28: '"T" means border-connected',
          29: 'Restore safe cell back to "O"',
        },
        javascript: {
          1: 'Define function taking the board in-place',
          2: 'Get board dimensions',
          3: 'Queue of safe cells to expand from',
          5: 'Scan every row...',
          6: '...and every column',
          7: 'Looking for "O" cells...',
          8: '...on the top/bottom border...',
          9: '...or the left/right border',
          10: 'Enqueue border "O" as a BFS source',
          11: 'Mark it "T" immediately so it is not re-added',
          14: 'Four directional offsets',
          15: 'Expand the safe zone until the queue empties',
          16: 'Dequeue the next known-safe cell',
          17: 'Look at all four neighbors',
          18: 'Compute neighbor coordinates',
          19: 'Neighbor must be inside the board...',
          20: '...and an untouched "O"',
          21: 'Neighbor is border-connected too — mark "T"',
          22: 'Enqueue it so BFS keeps spreading inward',
          27: 'Second pass: resolve every cell',
          28: 'Iterate through each column',
          29: 'Still "O" = surrounded: capture to "X"',
          30: '"T" = border-connected: restore to "O"',
        },
        java: {
          1: 'Define method taking char board in-place',
          2: 'Get board dimensions',
          3: 'Queue of safe cells to expand from',
          5: 'Scan every row...',
          6: '...and every column',
          7: 'Border "O" found — it can never be captured',
          8: 'Enqueue it as a BFS source',
          9: 'Mark it "T" immediately so it is not re-added',
          14: 'Four directional offsets',
          15: 'Expand the safe zone until the queue empties',
          16: 'Dequeue the next known-safe cell',
          17: 'Look at all four neighbors',
          18: 'Compute neighbor coordinates',
          19: 'In-bounds "O" neighbor is border-connected too',
          20: 'Mark it "T"',
          21: 'Enqueue it so BFS keeps spreading inward',
          26: 'Second pass: resolve every cell',
          27: 'Iterate through each column',
          28: 'Still "O" means BFS never reached it',
          29: 'Surrounded — capture by flipping to "X"',
          30: '"T" means border-connected',
          31: 'Restore safe cell back to "O"',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the board in-place',
      2: 'Get board dimensions',
      4: 'Define DFS to mark border-connected O cells',
      5: 'Check if out of bounds',
      6: 'Continue boundary checks for columns',
      7: 'Skip cells that are not O',
      8: 'Return if any check fails',
      9: 'Mark cell as safe with temporary T',
      10: 'Explore down neighbor',
      11: 'Explore up neighbor',
      12: 'Explore right neighbor',
      13: 'Explore left neighbor',
      15: 'Phase 1: find border-connected O regions',
      16: 'Iterate through each row',
      17: 'Iterate through each column',
      18: 'Check if cell is O on the border',
      19: 'Check if on first/last row',
      20: 'Check if on first/last column',
      21: 'DFS from this border O cell',
      23: 'Phase 2: capture and restore',
      24: 'Iterate through each row',
      25: 'Iterate through each column',
      26: 'If still O, it is surrounded',
      27: 'Capture surrounded O by flipping to X',
      28: 'If T, it was border-connected',
      29: 'Restore safe T back to O',
    },
    javascript: {
      1: 'Define function taking the board in-place',
      2: 'Get board dimensions',
      4: 'Define DFS to mark border-connected O cells',
      5: 'Check row bounds',
      6: 'Check column bounds',
      7: 'Skip cells that are not O',
      8: 'Return if any check fails',
      9: 'Mark cell as safe with temporary T',
      10: 'Explore down neighbor',
      11: 'Explore up neighbor',
      12: 'Explore right neighbor',
      13: 'Explore left neighbor',
      16: 'Iterate rows for border scan',
      17: 'Iterate columns for border scan',
      18: 'Check if border cell is O',
      19: 'Check first/last row',
      20: 'Check first/last column',
      21: 'DFS from this border O cell',
      24: 'Iterate rows for capture phase',
      25: 'Iterate columns for capture phase',
      26: 'Capture surrounded O to X',
      27: 'Restore safe T back to O',
    },
    java: {
      1: 'Define method taking char board in-place',
      2: 'Get board dimensions',
      4: 'Iterate rows to find border O cells',
      5: 'Iterate columns to find border O cells',
      6: 'If border cell is O, start DFS',
      7: 'DFS marks border-connected O as T',
      12: 'Iterate rows for capture/restore phase',
      13: 'Iterate columns for capture/restore phase',
      14: 'If cell is still O, it is surrounded',
      15: 'Capture surrounded O by flipping to X',
      16: 'If cell is T, it was border-connected',
      17: 'Restore safe T back to O',
      23: 'Define private DFS helper method',
      24: 'Return if out of bounds or not O',
      25: 'Return for invalid cells',
      27: 'Mark cell as safe with temporary T',
      28: 'Explore down neighbor',
      29: 'Explore up neighbor',
      30: 'Explore right neighbor',
      31: 'Explore left neighbor',
    },
  },
};
