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

function runNQueensBitmask(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];
  const result: string[][] = [];
  const fullMask = (1 << n) - 1;

  const board: string[][] = Array.from({ length: n }, () => new Array(n).fill('.'));

  function getQueenPositions(): [number, number][] {
    const positions: [number, number][] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] === 'Q') positions.push([r, c]);
      }
    }
    return positions;
  }

  function boardToMatrix(): string[][] {
    return board.map((row) => [...row]);
  }

  function toBits(mask: number): string {
    return (mask & fullMask).toString(2).padStart(n, '0');
  }

  steps.push({
    state: {
      matrix: boardToMatrix(),
      matrixHighlights: [] as [number, number][],
      hashMap: { n, solutions: 0 },
    },
    highlights: [],
    message: `Bitmask N-Queens: three integers replace the hash sets — one bit per column, per ↗ diagonal, per ↘ diagonal. Conflict checks become single AND operations`,
    codeLine: 1,
  });

  function backtrack(row: number, cols: number, diag1: number, diag2: number) {
    if (row === n) {
      result.push(board.map((r) => r.join('')));

      steps.push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: getQueenPositions(),
          hashMap: { n, solutions: result.length },
        },
        highlights: [],
        message: `Found solution #${result.length}! All ${n} queens placed with pure bit arithmetic`,
        codeLine: 7,
        action: 'found',
      });
      return;
    }

    const free = ~(cols | diag1 | diag2) & fullMask;
    const freeCount = toBits(free).split('').filter((b) => b === '1').length;

    steps.push({
      state: {
        matrix: boardToMatrix(),
        matrixHighlights: getQueenPositions(),
        hashMap: {
          n,
          solutions: result.length,
          row,
          cols: toBits(cols),
          free: toBits(free),
        },
      },
      highlights: [],
      message: freeCount > 0
        ? `Row ${row}: free = ~(cols | diag1 | diag2) = ${toBits(free)} — ${freeCount} safe column${freeCount !== 1 ? 's' : ''} found in one bitwise op (1 = safe)`
        : `Row ${row}: free = ${toBits(free)} — no safe columns, dead end. Backtrack`,
      codeLine: 10,
      action: 'visit',
    });

    let free2 = free;
    while (free2) {
      const bit = free2 & -free2;
      free2 -= bit;
      const col = 31 - Math.clz32(bit);

      board[row][col] = 'Q';

      steps.push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: getQueenPositions(),
          hashMap: { n, solutions: result.length, placed: `Q at [${row},${col}]`, bit: toBits(bit) },
        },
        highlights: [],
        message: `Extract lowest free bit ${toBits(bit)} (col ${col}) and place a queen. Diagonal masks shift as they pass to the next row`,
        codeLine: 15,
        action: 'push',
      });

      backtrack(row + 1, cols | bit, ((diag1 | bit) << 1) & fullMask, (diag2 | bit) >> 1);

      board[row][col] = '.';

      steps.push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: getQueenPositions(),
          hashMap: { n, solutions: result.length, removed: `Q from [${row},${col}]` },
        },
        highlights: [],
        message: `Backtrack: remove queen from [${row}, ${col}] — masks were passed by value, so nothing to un-set`,
        codeLine: 18,
        action: 'pop',
      });
    }
  }

  backtrack(0, 0, 0, 0);

  steps.push({
    state: {
      matrix: boardToMatrix(),
      matrixHighlights: [] as [number, number][],
      hashMap: { n, totalSolutions: result.length },
    },
    highlights: [],
    message: `Done! Found ${result.length} solution${result.length !== 1 ? 's' : ''} — same search tree as the set version, but each conflict check is O(1) bit math with no hashing`,
    codeLine: 21,
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
  optimalApproachName: 'Backtracking with Hash Sets',
  approaches: [
    {
      id: 'bitmask',
      name: 'Bitmask Backtracking',
      timeComplexity: 'O(n!)',
      spaceComplexity: 'O(n)',
      description:
        'Replaces the three hash sets with three integers whose bits mark attacked columns and diagonals — a single bitwise op finds all safe columns of a row at once, and shifting the diagonal masks per row keeps them aligned.',
      code: {
        python: `def solveNQueens(n):
    result = []
    board = [["."] * n for _ in range(n)]

    def backtrack(row, cols, diag1, diag2):
        if row == n:
            result.append(["".join(r) for r in board])
            return
        # free = columns not attacked in this row
        free = ~(cols | diag1 | diag2) & ((1 << n) - 1)
        while free:
            bit = free & -free      # lowest free column
            free -= bit
            col = bit.bit_length() - 1
            board[row][col] = "Q"
            backtrack(row + 1, cols | bit,
                      (diag1 | bit) << 1, (diag2 | bit) >> 1)
            board[row][col] = "."

    backtrack(0, 0, 0, 0)
    return result`,
        javascript: `function solveNQueens(n) {
    const result = [];
    const board = Array.from({length: n}, () => new Array(n).fill("."));

    function backtrack(row, cols, diag1, diag2) {
        if (row === n) {
            result.push(board.map(r => r.join("")));
            return;
        }
        // free = columns not attacked in this row
        let free = ~(cols | diag1 | diag2) & ((1 << n) - 1);
        while (free) {
            const bit = free & -free; // lowest free column
            free -= bit;
            const col = 31 - Math.clz32(bit);
            board[row][col] = "Q";
            backtrack(row + 1, cols | bit,
                ((diag1 | bit) << 1) & ((1 << n) - 1), (diag2 | bit) >> 1);
            board[row][col] = ".";
        }
    }

    backtrack(0, 0, 0, 0);
    return result;
}`,
        java: `public static List<List<String>> solveNQueens(int n) {
    List<List<String>> result = new ArrayList<>();
    char[][] board = new char[n][n];
    for (char[] row : board) Arrays.fill(row, '.');
    backtrack(0, 0, 0, 0, n, board, result);
    return result;
}

private static void backtrack(int row, int cols, int diag1, int diag2,
                              int n, char[][] board, List<List<String>> result) {
    if (row == n) {
        List<String> solution = new ArrayList<>();
        for (char[] r : board) solution.add(new String(r));
        result.add(solution);
        return;
    }
    int free = ~(cols | diag1 | diag2) & ((1 << n) - 1);
    while (free != 0) {
        int bit = free & -free;      // lowest free column
        free -= bit;
        int col = Integer.numberOfTrailingZeros(bit);
        board[row][col] = 'Q';
        backtrack(row + 1, cols | bit, (diag1 | bit) << 1,
                  (diag2 | bit) >> 1, n, board, result);
        board[row][col] = '.';
    }
}`,
      },
      run: runNQueensBitmask,
      lineExplanations: {
        python: {
          1: 'Define function taking board size n',
          2: 'Initialize list to store solutions',
          3: 'Create n x n board filled with "."',
          5: 'Masks are parameters — passed by value, so backtracking is automatic',
          6: 'Base case: all rows filled, found solution',
          7: 'Convert board rows to strings, save',
          8: 'Return after saving solution',
          9: 'A set bit in free means that column is safe',
          10: 'One OR + NOT finds every safe column of this row at once',
          11: 'Loop while safe columns remain',
          12: 'bit = free & -free isolates the lowest set bit',
          13: 'Consume that bit from the free mask',
          14: 'Convert the single bit to a column index',
          15: 'Place queen on the board (for output only)',
          16: 'Recurse: occupy the column bit ...',
          17: '... shift ↘ diagonal left and ↗ diagonal right so they track the next row',
          18: 'Remove queen — the masks need no cleanup',
          20: 'Start with row 0 and all-empty masks',
          21: 'Return all valid board configurations',
        },
        javascript: {
          1: 'Define function taking board size n',
          2: 'Initialize array to store solutions',
          3: 'Create n x n board filled with "."',
          5: 'Masks are parameters — passed by value, so backtracking is automatic',
          6: 'Base case: all rows filled, found solution',
          7: 'Convert board rows to strings, save',
          8: 'Return after saving solution',
          10: 'A set bit in free means that column is safe',
          11: 'One OR + NOT finds every safe column of this row at once',
          12: 'Loop while safe columns remain',
          13: 'bit = free & -free isolates the lowest set bit',
          14: 'Consume that bit from the free mask',
          15: 'Convert the single bit to a column index via count-leading-zeros',
          16: 'Place queen on the board (for output only)',
          17: 'Recurse: occupy the column bit ...',
          18: '... shift diagonals so they track the next row (masked to n bits)',
          19: 'Remove queen — the masks need no cleanup',
          23: 'Start with row 0 and all-empty masks',
          24: 'Return all valid board configurations',
        },
        java: {
          1: 'Define method returning list of solutions',
          2: 'Initialize result list',
          3: 'Create n x n board',
          4: 'Fill the board with "." characters',
          5: 'Start with row 0 and all-empty masks',
          6: 'Return all valid configurations',
          9: 'Masks are int parameters — passed by value, so backtracking is automatic',
          10: 'Remaining helper parameters',
          11: 'Base case: all rows filled, found solution',
          12: 'Create list for this solution',
          13: 'Convert each row to a string',
          14: 'Add solution to result',
          15: 'Return after saving',
          17: 'One OR + NOT finds every safe column of this row at once',
          18: 'Loop while safe columns remain',
          19: 'bit = free & -free isolates the lowest set bit',
          20: 'Consume that bit from the free mask',
          21: 'Convert the single bit to a column index',
          22: 'Place queen on the board (for output only)',
          23: 'Recurse: occupy the column bit ...',
          24: '... shift diagonals so they track the next row',
          25: 'Remove queen — the masks need no cleanup',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking board size n',
      2: 'Initialize list to store solutions',
      3: 'Create n x n board filled with "."',
      4: 'Track occupied columns',
      5: 'Track occupied positive diagonals (row+col)',
      6: 'Track occupied negative diagonals (row-col)',
      8: 'Define recursive backtrack helper',
      9: 'Base case: all rows filled, found solution',
      10: 'Convert board rows to strings, save',
      11: 'Return after saving solution',
      13: 'Try each column in current row',
      14: 'Check if column or diagonal is occupied',
      15: 'Check negative diagonal conflict',
      16: 'Skip conflicting position',
      18: 'Place queen at current position',
      19: 'Mark column as occupied',
      20: 'Mark positive diagonal as occupied',
      21: 'Mark negative diagonal as occupied',
      23: 'Recurse to place queen in next row',
      25: 'Remove queen (backtrack)',
      26: 'Unmark column',
      27: 'Unmark positive diagonal',
      28: 'Unmark negative diagonal',
      30: 'Start backtracking from row 0',
      31: 'Return all valid board configurations',
    },
    javascript: {
      1: 'Define function taking board size n',
      2: 'Initialize array to store solutions',
      3: 'Create n x n board filled with "."',
      4: 'Second line of board creation',
      5: 'Track occupied columns',
      6: 'Track occupied positive diagonals (row+col)',
      7: 'Track occupied negative diagonals (row-col)',
      9: 'Define recursive backtrack helper',
      10: 'Base case: all rows filled, found solution',
      11: 'Convert board rows to strings, save',
      12: 'Return after saving solution',
      15: 'Try each column in current row',
      16: 'Check column and diagonal conflicts',
      17: 'Check negative diagonal conflict',
      18: 'Skip conflicting position',
      20: 'Place queen at current position',
      21: 'Mark column as occupied',
      22: 'Mark positive diagonal as occupied',
      23: 'Mark negative diagonal as occupied',
      25: 'Recurse to place queen in next row',
      27: 'Remove queen (backtrack)',
      28: 'Unmark column',
      29: 'Unmark positive diagonal',
      30: 'Unmark negative diagonal',
      34: 'Start backtracking from row 0',
      35: 'Return all valid board configurations',
    },
    java: {
      1: 'Define method returning list of solutions',
      2: 'Initialize result list',
      3: 'Create n x n board',
      4: 'Fill each row with "." characters',
      5: 'Fill row with dots',
      8: 'Create sets for column tracking',
      9: 'Create set for positive diagonal tracking',
      10: 'Create set for negative diagonal tracking',
      12: 'Start backtracking from row 0',
      13: 'Return all valid configurations',
      16: 'Define recursive backtrack helper',
      17: 'Extra parameters in method signature',
      18: 'Extra parameters in method signature',
      19: 'Base case: all rows filled',
      20: 'Create list for this solution',
      21: 'Convert each row to string',
      22: 'Add row string to solution',
      24: 'Add solution to result',
      25: 'Return after saving',
      28: 'Try each column in current row',
      29: 'Check column and diagonal conflicts',
      30: 'Skip conflicting position',
      32: 'Place queen at current position',
      33: 'Mark column as occupied',
      34: 'Mark positive diagonal as occupied',
      35: 'Mark negative diagonal as occupied',
      37: 'Recurse to place queen in next row',
      39: 'Remove queen (backtrack)',
      40: 'Unmark column',
      41: 'Unmark positive diagonal',
      42: 'Unmark negative diagonal',
    },
  },
};
