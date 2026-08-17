import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runNQueensII(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];
  const fullMask = (1 << n) - 1;
  const board: string[][] = Array.from({ length: n }, () => new Array(n).fill('.'));
  const STEP_BUDGET = 62;
  let suppressed = 0;
  let count = 0;

  const boardToMatrix = () => board.map((row) => [...row]);

  const queenPositions = (): [number, number][] => {
    const positions: [number, number][] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] === 'Q') positions.push([r, c]);
      }
    }
    return positions;
  };

  const toBits = (mask: number) => (mask & fullMask).toString(2).padStart(n, '0');

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      matrix: boardToMatrix(),
      matrixHighlights: [] as [number, number][],
      hashMap: { n, solutions: 0 },
    },
    highlights: [],
    message: `Only the COUNT matters here, so nothing needs to be stored. Three integers track attacks: one bit per column, one per ↗ diagonal, one per ↘ diagonal`,
    codeLine: 1,
  });

  function backtrack(row: number, cols: number, diag1: number, diag2: number) {
    if (row === n) {
      count++;
      push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: queenPositions(),
          hashMap: { n, solutions: count },
          result: count,
        },
        highlights: [],
        message: `Row ${n} reached — every queen placed safely. count = ${count}`,
        codeLine: 7,
        action: 'found',
      });
      return;
    }

    const free = ~(cols | diag1 | diag2) & fullMask;
    const freeCount = toBits(free).split('').filter((b) => b === '1').length;

    push({
      state: {
        matrix: boardToMatrix(),
        matrixHighlights: queenPositions(),
        hashMap: { n, solutions: count, row, attacked: toBits(cols | diag1 | diag2), free: toBits(free) },
      },
      highlights: [],
      message:
        freeCount > 0
          ? `Row ${row}: free = ~(cols | diag1 | diag2) = ${toBits(free)} — ${freeCount} safe column${freeCount !== 1 ? 's' : ''} located by a single bitwise expression`
          : `Row ${row}: free = ${toBits(free)} — every column is attacked, dead end. Unwind`,
      codeLine: 11,
      action: 'visit',
    });

    let remaining = free;
    while (remaining) {
      const bit = remaining & -remaining;
      remaining -= bit;
      const col = 31 - Math.clz32(bit);

      board[row][col] = 'Q';

      push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: queenPositions(),
          hashMap: { n, solutions: count, bit: toBits(bit), placed: `[${row},${col}]` },
        },
        highlights: [],
        message: `free & -free peels off the lowest safe bit ${toBits(bit)} = column ${col}. Recurse with cols|bit, (diag1|bit)<<1 and (diag2|bit)>>1 so the diagonals slide with the row`,
        codeLine: 15,
        action: 'push',
      });

      backtrack(row + 1, cols | bit, ((diag1 | bit) << 1) & fullMask, (diag2 | bit) >> 1);

      board[row][col] = '.';

      push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: queenPositions(),
          hashMap: { n, solutions: count, removed: `[${row},${col}]` },
        },
        highlights: [],
        message: `Branch from column ${col} exhausted. The masks were passed by value, so there is literally nothing to undo`,
        codeLine: 14,
        action: 'pop',
      });
    }
  }

  backtrack(0, 0, 0, 0);

  steps.push({
    state: {
      matrix: boardToMatrix(),
      matrixHighlights: [] as [number, number][],
      hashMap: { n, solutions: count },
      result: count,
    },
    highlights: [],
    message: `Done! ${n}-Queens has ${count} distinct solution${count !== 1 ? 's' : ''}${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''}`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

function runNQueensIIHashSets(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];
  const board: string[][] = Array.from({ length: n }, () => new Array(n).fill('.'));
  const cols = new Set<number>();
  const posDiag = new Set<number>();
  const negDiag = new Set<number>();
  const STEP_BUDGET = 62;
  let suppressed = 0;
  let count = 0;

  const boardToMatrix = () => board.map((row) => [...row]);

  const queenPositions = (): [number, number][] => {
    const positions: [number, number][] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] === 'Q') positions.push([r, c]);
      }
    }
    return positions;
  };

  const setStr = (s: Set<number>) => (s.size ? [...s].sort((a, b) => a - b).join(',') : '-');

  const push = (step: AlgorithmStep) => {
    if (steps.length < STEP_BUDGET) steps.push(step);
    else suppressed++;
  };

  steps.push({
    state: {
      matrix: boardToMatrix(),
      matrixHighlights: [] as [number, number][],
      hashMap: { n, solutions: 0, cols: '-', posDiag: '-', negDiag: '-' },
    },
    highlights: [],
    message: `Same search, readable bookkeeping: three hash sets. Two queens share a ↗ diagonal exactly when row+col matches, and a ↘ diagonal exactly when row-col matches`,
    codeLine: 1,
  });

  function backtrack(row: number) {
    if (row === n) {
      count++;
      push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: queenPositions(),
          hashMap: { n, solutions: count, cols: setStr(cols) },
          result: count,
        },
        highlights: [],
        message: `Row ${n} reached — all ${n} queens are mutually safe. count = ${count}`,
        codeLine: 10,
        action: 'found',
      });
      return;
    }

    for (let col = 0; col < n; col++) {
      if (cols.has(col) || posDiag.has(row + col) || negDiag.has(row - col)) {
        const reasons: string[] = [];
        if (cols.has(col)) reasons.push(`column ${col} taken`);
        if (posDiag.has(row + col)) reasons.push(`↗ diagonal ${row + col} taken`);
        if (negDiag.has(row - col)) reasons.push(`↘ diagonal ${row - col} taken`);

        push({
          state: {
            matrix: boardToMatrix(),
            matrixHighlights: [...queenPositions(), [row, col]] as [number, number][],
            hashMap: { n, solutions: count, cols: setStr(cols), posDiag: setStr(posDiag), negDiag: setStr(negDiag) },
          },
          highlights: [],
          message: `[${row}, ${col}] rejected — ${reasons.join(' and ')}`,
          codeLine: 14,
        });
        continue;
      }

      board[row][col] = 'Q';
      cols.add(col);
      posDiag.add(row + col);
      negDiag.add(row - col);

      push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: queenPositions(),
          hashMap: { n, solutions: count, cols: setStr(cols), posDiag: setStr(posDiag), negDiag: setStr(negDiag) },
        },
        highlights: [],
        message: `Place a queen at [${row}, ${col}] — claim column ${col}, ↗ diagonal ${row + col}, ↘ diagonal ${row - col}`,
        codeLine: 18,
        action: 'push',
      });

      backtrack(row + 1);

      board[row][col] = '.';
      cols.delete(col);
      posDiag.delete(row + col);
      negDiag.delete(row - col);

      push({
        state: {
          matrix: boardToMatrix(),
          matrixHighlights: queenPositions(),
          hashMap: { n, solutions: count, cols: setStr(cols), posDiag: setStr(posDiag), negDiag: setStr(negDiag) },
        },
        highlights: [],
        message: `Backtrack from [${row}, ${col}] — the three sets are shared state, so each claim must be explicitly released`,
        codeLine: 24,
        action: 'pop',
      });
    }
  }

  backtrack(0);

  steps.push({
    state: {
      matrix: boardToMatrix(),
      matrixHighlights: [] as [number, number][],
      hashMap: { n, solutions: count },
      result: count,
    },
    highlights: [],
    message: `Done! Same ${count} solution${count !== 1 ? 's' : ''}${suppressed > 0 ? ` (${suppressed} branch steps not shown)` : ''} — identical tree, just hashing instead of bit tricks`,
    codeLine: 29,
    action: 'found',
  });

  return steps;
}

export const nQueensII: Algorithm = {
  id: 'n-queens-ii',
  name: 'N-Queens II',
  category: 'Backtracking',
  difficulty: 'Hard',
  timeComplexity: 'O(n!)',
  spaceComplexity: 'O(n)',
  pattern: 'Backtracking — place row by row, check col and diag conflicts',
  description:
    'Given an integer n, return the number of distinct solutions to the n-queens puzzle — placements of n queens on an n x n board where no two attack each other. Only the count is needed, so no board has to be materialized.',
  problemUrl: 'https://leetcode.com/problems/n-queens-ii/',
  code: {
    python: `def totalNQueens(n):
    count = 0

    def backtrack(row, cols, diag1, diag2):
        nonlocal count
        if row == n:
            count += 1
            return

        # A 1 bit in free marks a safe column
        free = ~(cols | diag1 | diag2) & ((1 << n) - 1)
        while free:
            bit = free & -free
            free -= bit
            backtrack(row + 1, cols | bit,
                      (diag1 | bit) << 1, (diag2 | bit) >> 1)

    backtrack(0, 0, 0, 0)
    return count`,
    javascript: `function totalNQueens(n) {
    let count = 0;
    const full = (1 << n) - 1;

    function backtrack(row, cols, diag1, diag2) {
        if (row === n) {
            count++;
            return;
        }

        // A 1 bit in free marks a safe column
        let free = ~(cols | diag1 | diag2) & full;
        while (free) {
            const bit = free & -free;
            free -= bit;
            backtrack(row + 1, cols | bit,
                ((diag1 | bit) << 1) & full, (diag2 | bit) >> 1);
        }
    }

    backtrack(0, 0, 0, 0);
    return count;
}`,
    java: `public static int totalNQueens(int n) {
    return backtrack(0, 0, 0, 0, n);
}

private static int backtrack(int row, int cols, int diag1, int diag2, int n) {
    if (row == n) return 1;

    int count = 0;
    // A 1 bit in free marks a safe column
    int free = ~(cols | diag1 | diag2) & ((1 << n) - 1);
    while (free != 0) {
        int bit = free & -free;
        free -= bit;
        count += backtrack(row + 1, cols | bit,
                           (diag1 | bit) << 1, (diag2 | bit) >> 1, n);
    }
    return count;
}`,
  },
  defaultInput: 4,
  run: runNQueensII,
  optimalApproachName: 'Bitmask Backtracking',
  approaches: [
    {
      id: 'hash-set-diagonals',
      name: 'Hash Sets (col / diag)',
      timeComplexity: 'O(n!)',
      spaceComplexity: 'O(n)',
      description:
        'Explores the identical tree but tracks attacked columns and both diagonal families in three hash sets keyed by col, row+col and row-col — slower per check, but the invariant is written out in plain terms.',
      code: {
        python: `def totalNQueens(n):
    count = 0
    cols = set()
    pos_diag = set()   # row + col
    neg_diag = set()   # row - col

    def backtrack(row):
        nonlocal count
        if row == n:
            count += 1
            return

        for col in range(n):
            if (col in cols or row + col in pos_diag
                    or row - col in neg_diag):
                continue

            cols.add(col)
            pos_diag.add(row + col)
            neg_diag.add(row - col)

            backtrack(row + 1)

            cols.remove(col)
            pos_diag.remove(row + col)
            neg_diag.remove(row - col)

    backtrack(0)
    return count`,
        javascript: `function totalNQueens(n) {
    let count = 0;
    const cols = new Set();
    const posDiag = new Set(); // row + col
    const negDiag = new Set(); // row - col

    function backtrack(row) {
        if (row === n) {
            count++;
            return;
        }

        for (let col = 0; col < n; col++) {
            if (cols.has(col) || posDiag.has(row + col)
                || negDiag.has(row - col)) continue;

            cols.add(col);
            posDiag.add(row + col);
            negDiag.add(row - col);

            backtrack(row + 1);

            cols.delete(col);
            posDiag.delete(row + col);
            negDiag.delete(row - col);
        }
    }

    backtrack(0);
    return count;
}`,
        java: `public static int totalNQueens(int n) {
    Set<Integer> cols = new HashSet<>();
    Set<Integer> posDiag = new HashSet<>();
    Set<Integer> negDiag = new HashSet<>();
    return backtrack(0, n, cols, posDiag, negDiag);
}

private static int backtrack(int row, int n, Set<Integer> cols,
                             Set<Integer> posDiag, Set<Integer> negDiag) {
    if (row == n) return 1;

    int count = 0;
    for (int col = 0; col < n; col++) {
        if (cols.contains(col) || posDiag.contains(row + col)
            || negDiag.contains(row - col)) continue;

        cols.add(col);
        posDiag.add(row + col);
        negDiag.add(row - col);

        count += backtrack(row + 1, n, cols, posDiag, negDiag);

        cols.remove(col);
        posDiag.remove(row + col);
        negDiag.remove(row - col);
    }
    return count;
}`,
      },
      run: runNQueensIIHashSets,
      lineExplanations: {
        python: {
          1: 'Define function taking board size n',
          2: 'Running number of complete placements',
          3: 'Columns already occupied by a queen',
          4: 'Anti-diagonals, identified by row + col',
          5: 'Main diagonals, identified by row - col',
          7: 'One queen per row, so recursion depth equals the row index',
          8: 'Let the helper update the outer counter',
          9: 'Base case: a queen sits safely in every row',
          10: 'That is one more solution',
          11: 'Unwind and let the parent try other columns',
          13: 'Try every column of the current row',
          14: 'Reject if the column or the ↗ diagonal is claimed',
          15: 'Reject if the ↘ diagonal is claimed',
          16: 'Move on to the next column',
          18: 'Claim the column',
          19: 'Claim the ↗ diagonal',
          20: 'Claim the ↘ diagonal',
          22: 'Solve the rest of the board below this row',
          24: 'Release the column — shared sets must be undone',
          25: 'Release the ↗ diagonal',
          26: 'Release the ↘ diagonal',
          28: 'Begin at row 0 with empty sets',
          29: 'Return the number of distinct solutions',
        },
        javascript: {
          1: 'Define function taking board size n',
          2: 'Running number of complete placements',
          3: 'Columns already occupied by a queen',
          4: 'Anti-diagonals, identified by row + col',
          5: 'Main diagonals, identified by row - col',
          7: 'One queen per row, so recursion depth equals the row index',
          8: 'Base case: a queen sits safely in every row',
          9: 'That is one more solution',
          10: 'Unwind and let the parent try other columns',
          13: 'Try every column of the current row',
          14: 'Reject if the column or the ↗ diagonal is claimed',
          15: 'Reject if the ↘ diagonal is claimed',
          17: 'Claim the column',
          18: 'Claim the ↗ diagonal',
          19: 'Claim the ↘ diagonal',
          21: 'Solve the rest of the board below this row',
          23: 'Release the column — shared sets must be undone',
          24: 'Release the ↗ diagonal',
          25: 'Release the ↘ diagonal',
          29: 'Begin at row 0 with empty sets',
          30: 'Return the number of distinct solutions',
        },
        java: {
          1: 'Define method taking board size n',
          2: 'Columns already occupied by a queen',
          3: 'Anti-diagonals, identified by row + col',
          4: 'Main diagonals, identified by row - col',
          5: 'Begin at row 0 with empty sets',
          8: 'Helper returns the solution count of its subtree',
          9: 'The three shared sets travel with it',
          10: 'Base case: a queen sits safely in every row',
          12: 'Solutions found below this node',
          13: 'Try every column of the current row',
          14: 'Reject if the column or the ↗ diagonal is claimed',
          15: 'Reject if the ↘ diagonal is claimed',
          17: 'Claim the column',
          18: 'Claim the ↗ diagonal',
          19: 'Claim the ↘ diagonal',
          21: 'Accumulate the count from the rest of the board',
          23: 'Release the column — shared sets must be undone',
          24: 'Release the ↗ diagonal',
          25: 'Release the ↘ diagonal',
          27: 'Return the subtree total',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking board size n',
      2: 'Running number of complete placements',
      4: 'Masks ride along as parameters instead of shared sets',
      5: 'Let the helper update the outer counter',
      6: 'Base case: a queen sits safely in every row',
      7: 'That is one more solution',
      8: 'Unwind and let the parent try other columns',
      10: 'Invert the union of all three attack masks',
      11: 'Masking to n bits keeps the board width honest',
      12: 'Keep going while a safe column remains',
      13: 'free & -free isolates the lowest set bit',
      14: 'Consume that column from the free mask',
      15: 'Occupy the column bit for every deeper row',
      16: 'Shift the diagonals so they line up with the next row',
      18: 'Begin at row 0 with all masks empty',
      19: 'Return the number of distinct solutions',
    },
    javascript: {
      1: 'Define function taking board size n',
      2: 'Running number of complete placements',
      3: 'n low bits set — the board width',
      5: 'Masks ride along as parameters instead of shared sets',
      6: 'Base case: a queen sits safely in every row',
      7: 'That is one more solution',
      8: 'Unwind and let the parent try other columns',
      11: 'Invert the union of all three attack masks',
      12: 'Masking to n bits keeps the board width honest',
      13: 'Keep going while a safe column remains',
      14: 'free & -free isolates the lowest set bit',
      15: 'Consume that column from the free mask',
      16: 'Occupy the column bit for every deeper row',
      17: 'Shift the diagonals so they line up with the next row',
      21: 'Begin at row 0 with all masks empty',
      22: 'Return the number of distinct solutions',
    },
    java: {
      1: 'Define method taking board size n',
      2: 'Begin at row 0 with all masks empty',
      5: 'Masks ride along as int parameters, so backtracking is free',
      6: 'Base case: a full board is worth exactly one solution',
      8: 'Solutions found below this node',
      9: 'Invert the union of all three attack masks',
      10: 'Masking to n bits keeps the board width honest',
      11: 'Keep going while a safe column remains',
      12: 'free & -free isolates the lowest set bit',
      13: 'Consume that column from the free mask',
      14: 'Occupy the column bit for every deeper row',
      15: 'Shift the diagonals so they line up with the next row',
      17: 'Return the subtree total',
    },
  },
};
