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
};
