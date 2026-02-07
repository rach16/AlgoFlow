import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runNQueens(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];
  const result: string[][] = [];

  // Create empty board
  const board: string[][] = Array.from({ length: n }, () => new Array(n).fill('.'));

  // Track columns and diagonals for O(1) conflict checks
  const cols = new Set<number>();
  const posDiag = new Set<number>(); // row + col
  const negDiag = new Set<number>(); // row - col

  function getQueenPositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] === 'Q') {
          positions.push([r, c]);
        }
      }
    }
    return positions;
  }

  function boardToMatrix(): string[][] {
    return board.map((row) => [...row]);
  }

  steps.push({
    state: {
      matrix: boardToMatrix(),
      matrixHighlights: [] as [number, number][],
      hashMap: { n, solutions: 0 },
    },
    highlights: [],
    message: `Place ${n} queens on a ${n}x${n} board so no two queens attack each other`,
    codeLine: 1,
  });

  function backtrack(row: number) {
    if (row === n) {
      // Found a valid solution
      const solution = board.map((r) => r.join(''));
      result.push(solution);

      steps.push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: getQueenPositions(),
          hashMap: { n, solutions: result.length },
        },
        highlights: [],
        message: `Found solution #${result.length}! All ${n} queens placed safely`,
        codeLine: 5,
        action: 'found',
      });
      return;
    }

    steps.push({
      state: {
        matrix: boardToMatrix(),
        matrixHighlights: getQueenPositions(),
        hashMap: { n, solutions: result.length, processingRow: row },
      },
      highlights: [],
      message: `Try placing a queen in row ${row}`,
      codeLine: 7,
      action: 'visit',
    });

    for (let col = 0; col < n; col++) {
      // Check if this position is safe
      if (cols.has(col) || posDiag.has(row + col) || negDiag.has(row - col)) {
        const conflicts: string[] = [];
        if (cols.has(col)) conflicts.push(`col ${col}`);
        if (posDiag.has(row + col)) conflicts.push(`diag /`);
        if (negDiag.has(row - col)) conflicts.push(`diag \\`);

        steps.push({
          state: {
            matrix: boardToMatrix(),
            matrixHighlights: [...getQueenPositions(), [row, col]] as [number, number][],
            hashMap: { n, solutions: result.length, conflict: conflicts.join(', ') },
          },
          highlights: [],
          message: `Row ${row}, Col ${col}: conflict (${conflicts.join(', ')}), skip`,
          codeLine: 9,
        });
        continue;
      }

      // Place queen
      board[row][col] = 'Q';
      cols.add(col);
      posDiag.add(row + col);
      negDiag.add(row - col);

      steps.push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: getQueenPositions(),
          hashMap: { n, solutions: result.length, placed: `Q at [${row},${col}]` },
        },
        highlights: [],
        message: `Place queen at [${row}, ${col}]`,
        codeLine: 11,
        action: 'push',
      });

      // Explore next row
      backtrack(row + 1);

      // Remove queen (backtrack)
      board[row][col] = '.';
      cols.delete(col);
      posDiag.delete(row + col);
      negDiag.delete(row - col);

      steps.push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: getQueenPositions(),
          hashMap: { n, solutions: result.length, removed: `Q from [${row},${col}]` },
        },
        highlights: [],
        message: `Backtrack: remove queen from [${row}, ${col}]`,
        codeLine: 13,
        action: 'pop',
      });
    }
  }

  backtrack(0);

  steps.push({
    state: {
      matrix: boardToMatrix(),
      matrixHighlights: [] as [number, number][],
      hashMap: { n, totalSolutions: result.length },
    },
    highlights: [],
    message: `Done! Found ${result.length} solution${result.length !== 1 ? 's' : ''} for ${n}-Queens`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const nQueens: Algorithm = {
  id: 'n-queens',
  name: 'N-Queens',
  category: 'Backtracking',
  difficulty: 'Hard',
  timeComplexity: 'O(n!)',
  spaceComplexity: 'O(n²)',
  pattern: 'Backtracking — place row by row, check col and diag conflicts',
  description:
    'Place n queens on an n x n chessboard such that no two queens attack each other. Find all distinct solutions. Use backtracking: try placing a queen in each column of the current row, checking column and diagonal conflicts with sets.',
  problemUrl: 'https://leetcode.com/problems/n-queens/',
  code: {
    python: `def solveNQueens(n):
    result = []
    board = [["." ] * n for _ in range(n)]
    cols = set()
    posDiag = set()  # row + col
    negDiag = set()  # row - col

    def backtrack(row):
        if row == n:
            result.append(["".join(r) for r in board])
            return

        for col in range(n):
            if (col in cols or row + col in posDiag
                or row - col in negDiag):
                continue

            board[row][col] = "Q"
            cols.add(col)
            posDiag.add(row + col)
            negDiag.add(row - col)

            backtrack(row + 1)

            board[row][col] = "."
            cols.remove(col)
            posDiag.remove(row + col)
            negDiag.remove(row - col)

    backtrack(0)
    return result`,
    javascript: `function solveNQueens(n) {
    const result = [];
    const board = Array.from({length: n},
        () => new Array(n).fill("."));
    const cols = new Set();
    const posDiag = new Set(); // row + col
    const negDiag = new Set(); // row - col

    function backtrack(row) {
        if (row === n) {
            result.push(board.map(r => r.join("")));
            return;
        }

        for (let col = 0; col < n; col++) {
            if (cols.has(col) || posDiag.has(row+col)
                || negDiag.has(row-col))
                continue;

            board[row][col] = "Q";
            cols.add(col);
            posDiag.add(row + col);
            negDiag.add(row - col);

            backtrack(row + 1);

            board[row][col] = ".";
            cols.delete(col);
            posDiag.delete(row + col);
            negDiag.delete(row - col);
        }
    }

    backtrack(0);
    return result;
}`,
    java: `public static List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    for (int i = 0; i < n; i++) {
        Arrays.fill(board[i], '.');
    }

    Set<Integer> cols = new HashSet<>();
    Set<Integer> posDiag = new HashSet<>();
    Set<Integer> negDiag = new HashSet<>();

    backtrack(0, board, cols, posDiag, negDiag, result);
    return result;
}

private static void backtrack(int row, char[][] board, Set<Integer> cols,
                             Set<Integer> posDiag, Set<Integer> negDiag,
                             List<List<String>> result) {
    if (row == board.length) {
        List<String> solution = new ArrayList<>();
        for (char[] r : board) {
            solution.add(new String(r));
        }
        result.add(solution);
        return;
    }

    for (int col = 0; col < board.length; col++) {
        if (cols.contains(col) || posDiag.contains(row + col) ||
            negDiag.contains(row - col)) continue;

        board[row][col] = 'Q';
        cols.add(col);
        posDiag.add(row + col);
        negDiag.add(row - col);

        backtrack(row + 1, board, cols, posDiag, negDiag, result);

        board[row][col] = '.';
        cols.remove(col);
        posDiag.remove(row + col);
        negDiag.remove(row - col);
    }
}`,
  },
  defaultInput: 4,
  run: runNQueens,
};
