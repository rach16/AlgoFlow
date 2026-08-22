import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runValidSudokuBitmask(input: unknown): AlgorithmStep[] {
  const board = input as string[][];
  const steps: AlgorithmStep[] = [];

  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const boxes = new Array(9).fill(0);

  const boardCopy = () => board.map((row) => [...row]);

  // Show only the non-zero masks as 9-bit binary strings (digit 9 on the left, digit 1 on the right)
  const maskSnapshot = (): Record<string, string> => {
    const snapshot: Record<string, string> = {};
    for (let i = 0; i < 9; i++) {
      if (rows[i] !== 0) snapshot[`row${i}`] = rows[i].toString(2).padStart(9, '0');
    }
    for (let i = 0; i < 9; i++) {
      if (cols[i] !== 0) snapshot[`col${i}`] = cols[i].toString(2).padStart(9, '0');
    }
    for (let i = 0; i < 9; i++) {
      if (boxes[i] !== 0) snapshot[`box${i}`] = boxes[i].toString(2).padStart(9, '0');
    }
    return snapshot;
  };

  steps.push({
    state: { matrix: boardCopy(), matrixHighlights: [], hashMap: {} },
    highlights: [],
    message:
      'Bitmask version: each row/col/box is a single 9-bit integer — digit d occupies bit d-1. Duplicate check is one AND, marking is one OR',
    codeLine: 1,
  });

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val === '.') continue;

      const bit = 1 << (Number(val) - 1);
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);

      steps.push({
        state: {
          matrix: boardCopy(),
          matrixHighlights: [{ row: r, col: c }],
          hashMap: maskSnapshot(),
        },
        highlights: [],
        pointers: { row: r, col: c },
        message: `Cell (${r}, ${c}) = "${val}" → bit = 1 << ${Number(val) - 1} = ${bit.toString(2).padStart(9, '0')} | box ${b}`,
        codeLine: 9,
        action: 'visit',
      });

      if (rows[r] & bit) {
        steps.push({
          state: {
            matrix: boardCopy(),
            matrixHighlights: [{ row: r, col: c }],
            hashMap: maskSnapshot(),
            result: false,
          },
          highlights: [],
          message: `row${r} mask ${rows[r].toString(2).padStart(9, '0')} AND ${bit.toString(2).padStart(9, '0')} ≠ 0 — digit ${val} already in row ${r}. INVALID`,
          codeLine: 14,
          action: 'found',
        });
        return steps;
      }
      if (cols[c] & bit) {
        steps.push({
          state: {
            matrix: boardCopy(),
            matrixHighlights: [{ row: r, col: c }],
            hashMap: maskSnapshot(),
            result: false,
          },
          highlights: [],
          message: `col${c} mask ${cols[c].toString(2).padStart(9, '0')} AND ${bit.toString(2).padStart(9, '0')} ≠ 0 — digit ${val} already in column ${c}. INVALID`,
          codeLine: 14,
          action: 'found',
        });
        return steps;
      }
      if (boxes[b] & bit) {
        steps.push({
          state: {
            matrix: boardCopy(),
            matrixHighlights: [{ row: r, col: c }],
            hashMap: maskSnapshot(),
            result: false,
          },
          highlights: [],
          message: `box${b} mask ${boxes[b].toString(2).padStart(9, '0')} AND ${bit.toString(2).padStart(9, '0')} ≠ 0 — digit ${val} already in box ${b}. INVALID`,
          codeLine: 14,
          action: 'found',
        });
        return steps;
      }

      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;

      steps.push({
        state: {
          matrix: boardCopy(),
          matrixHighlights: [{ row: r, col: c }],
          hashMap: maskSnapshot(),
        },
        highlights: [],
        pointers: { row: r, col: c },
        message: `No collision — OR the bit in: row${r}=${rows[r].toString(2).padStart(9, '0')}, col${c}=${cols[c].toString(2).padStart(9, '0')}, box${b}=${boxes[b].toString(2).padStart(9, '0')}`,
        codeLine: 15,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: {
      matrix: boardCopy(),
      matrixHighlights: [],
      hashMap: maskSnapshot(),
      result: true,
    },
    highlights: [],
    message: 'Every digit set its bit without a collision — board is VALID (27 ints instead of 27 hash sets)',
    codeLine: 18,
    action: 'found',
  });

  return steps;
}

function runValidSudoku(input: unknown): AlgorithmStep[] {
  const board = input as string[][];
  const steps: AlgorithmStep[] = [];

  const rows: Record<string, Set<string>> = {};
  const cols: Record<string, Set<string>> = {};
  const boxes: Record<string, Set<string>> = {};

  // Helper to serialize sets for state snapshots
  function seenSnapshot(): Record<string, string[]> {
    const snapshot: Record<string, string[]> = {};
    for (const [key, set] of Object.entries(rows)) {
      snapshot[`row${key}`] = Array.from(set);
    }
    for (const [key, set] of Object.entries(cols)) {
      snapshot[`col${key}`] = Array.from(set);
    }
    for (const [key, set] of Object.entries(boxes)) {
      snapshot[`box${key}`] = Array.from(set);
    }
    return snapshot;
  }

  // Deep copy the board for state
  const boardCopy = () => board.map(row => [...row]);

  // Initial state
  steps.push({
    state: {
      matrix: boardCopy(),
      matrixHighlights: [],
      hashMap: {},
    },
    highlights: [],
    message: 'Validate the Sudoku board by checking rows, columns, and 3x3 boxes',
    codeLine: 1,
  });

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val === '.') continue;

      const boxKey = `${Math.floor(r / 3)},${Math.floor(c / 3)}`;

      // Initialize sets
      if (!rows[r]) rows[r] = new Set();
      if (!cols[c]) cols[c] = new Set();
      if (!boxes[boxKey]) boxes[boxKey] = new Set();

      // Show visiting the cell
      steps.push({
        state: {
          matrix: boardCopy(),
          matrixHighlights: [{ row: r, col: c }],
          hashMap: seenSnapshot(),
        },
        highlights: [],
        pointers: { row: r, col: c },
        message: `Checking cell (${r}, ${c}) = "${val}" | row ${r}, col ${c}, box (${boxKey})`,
        codeLine: 4,
        action: 'visit',
      });

      // Check for duplicates
      if (rows[r].has(val)) {
        // Find the duplicate in the same row
        const dupCol = board[r].findIndex((v, idx) => v === val && idx !== c);
        steps.push({
          state: {
            matrix: boardCopy(),
            matrixHighlights: [{ row: r, col: c }, { row: r, col: dupCol }],
            hashMap: seenSnapshot(),
            result: false,
          },
          highlights: [],
          message: `Duplicate "${val}" found in row ${r}! Board is INVALID`,
          codeLine: 5,
          action: 'found',
        });
        return steps;
      }

      if (cols[c].has(val)) {
        // Find the duplicate in the same column
        let dupRow = -1;
        for (let rr = 0; rr < 9; rr++) {
          if (rr !== r && board[rr][c] === val) {
            dupRow = rr;
            break;
          }
        }
        steps.push({
          state: {
            matrix: boardCopy(),
            matrixHighlights: [{ row: r, col: c }, { row: dupRow, col: c }],
            hashMap: seenSnapshot(),
            result: false,
          },
          highlights: [],
          message: `Duplicate "${val}" found in column ${c}! Board is INVALID`,
          codeLine: 6,
          action: 'found',
        });
        return steps;
      }

      if (boxes[boxKey].has(val)) {
        steps.push({
          state: {
            matrix: boardCopy(),
            matrixHighlights: [{ row: r, col: c }],
            hashMap: seenSnapshot(),
            result: false,
          },
          highlights: [],
          message: `Duplicate "${val}" found in box (${boxKey})! Board is INVALID`,
          codeLine: 7,
          action: 'found',
        });
        return steps;
      }

      // Add to sets
      rows[r].add(val);
      cols[c].add(val);
      boxes[boxKey].add(val);

      steps.push({
        state: {
          matrix: boardCopy(),
          matrixHighlights: [{ row: r, col: c }],
          hashMap: seenSnapshot(),
        },
        highlights: [],
        pointers: { row: r, col: c },
        message: `Added "${val}" to row ${r}, col ${c}, box (${boxKey}) sets`,
        codeLine: 8,
        action: 'insert',
      });
    }
  }

  // Valid board
  steps.push({
    state: {
      matrix: boardCopy(),
      matrixHighlights: [],
      hashMap: seenSnapshot(),
      result: true,
    },
    highlights: [],
    message: 'No duplicates found in any row, column, or box. Board is VALID!',
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const validSudoku: Algorithm = {
  id: 'valid-sudoku',
  name: 'Valid Sudoku',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(1)',
  pattern: 'Hash Set — track rows, cols, and boxes',
  description:
    'Determine if a 9x9 Sudoku board is valid. Only the filled cells need to be validated according to the rules: each row, column, and 3x3 sub-box must contain the digits 1-9 without repetition.',
  problemUrl: 'https://leetcode.com/problems/valid-sudoku/',
  code: {
    python: `from collections import defaultdict

def isValidSudoku(board):
    rows = defaultdict(set)
    cols = defaultdict(set)
    boxes = defaultdict(set)
    for r in range(9):
        for c in range(9):
            if board[r][c] == ".":
                continue
            val = board[r][c]
            box = (r // 3, c // 3)
            if (val in rows[r] or
                val in cols[c] or
                val in boxes[box]):
                return False
            rows[r].add(val)
            cols[c].add(val)
            boxes[box].add(val)
    return True`,
    javascript: `function isValidSudoku(board) {
    const rows = {}, cols = {}, boxes = {};
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === ".") continue;
            const val = board[r][c];
            const box = Math.floor(r/3)+","+Math.floor(c/3);
            if ((rows[r]?.has(val)) ||
                (cols[c]?.has(val)) ||
                (boxes[box]?.has(val)))
                return false;
            (rows[r] ??= new Set()).add(val);
            (cols[c] ??= new Set()).add(val);
            (boxes[box] ??= new Set()).add(val);
        }
    }
    return true;
}`,
    java: `public static boolean isValidSudoku(char[][] board) {
    Map<Integer, Set<Character>> rows = new HashMap<>();
    Map<Integer, Set<Character>> cols = new HashMap<>();
    Map<String, Set<Character>> boxes = new HashMap<>();

    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (board[r][c] == '.') continue;
            char val = board[r][c];
            String box = (r / 3) + "," + (c / 3);

            rows.putIfAbsent(r, new HashSet<>());
            cols.putIfAbsent(c, new HashSet<>());
            boxes.putIfAbsent(box, new HashSet<>());

            if (rows.get(r).contains(val) ||
                cols.get(c).contains(val) ||
                boxes.get(box).contains(val)) {
                return false;
            }

            rows.get(r).add(val);
            cols.get(c).add(val);
            boxes.get(box).add(val);
        }
    }
    return true;
}`,
  },
  defaultInput: [
    ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
    ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
    ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
    ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
    ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
    ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
    ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
    ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
    ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
  ],
  run: runValidSudoku,
  optimalApproachName: 'Hash Sets',
  approaches: [
    {
      id: 'bitmask',
      name: 'Bitmask',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      description:
        'Replaces the 27 hash sets with 27 plain integers: digit d flips bit d-1, so a duplicate check is a single AND and marking a digit is a single OR.',
      code: {
        python: `def isValidSudoku(board):
    rows = [0] * 9
    cols = [0] * 9
    boxes = [0] * 9
    for r in range(9):
        for c in range(9):
            if board[r][c] == ".":
                continue
            bit = 1 << (int(board[r][c]) - 1)
            b = (r // 3) * 3 + c // 3
            if (rows[r] & bit or
                cols[c] & bit or
                boxes[b] & bit):
                return False
            rows[r] |= bit
            cols[c] |= bit
            boxes[b] |= bit
    return True`,
        javascript: `function isValidSudoku(board) {
    const rows = new Array(9).fill(0);
    const cols = new Array(9).fill(0);
    const boxes = new Array(9).fill(0);
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === ".") continue;
            const bit = 1 << (Number(board[r][c]) - 1);
            const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
            if ((rows[r] & bit) ||
                (cols[c] & bit) ||
                (boxes[b] & bit)) {
                return false;
            }
            rows[r] |= bit;
            cols[c] |= bit;
            boxes[b] |= bit;
        }
    }
    return true;
}`,
        java: `public static boolean isValidSudoku(char[][] board) {
    int[] rows = new int[9];
    int[] cols = new int[9];
    int[] boxes = new int[9];
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (board[r][c] == '.') continue;
            int bit = 1 << (board[r][c] - '1');
            int b = (r / 3) * 3 + c / 3;
            if ((rows[r] & bit) != 0 ||
                (cols[c] & bit) != 0 ||
                (boxes[b] & bit) != 0) {
                return false;
            }
            rows[r] |= bit;
            cols[c] |= bit;
            boxes[b] |= bit;
        }
    }
    return true;
}`,
      },
      run: runValidSudokuBitmask,
      lineExplanations: {
        python: {
          1: 'Define function taking 9x9 board',
          2: 'One integer per row — 9 bits track which digits appeared',
          3: 'One integer per column',
          4: 'One integer per 3x3 box',
          5: 'Loop through each row index 0-8',
          6: 'Loop through each column index 0-8',
          7: 'Skip empty cells marked with "."',
          8: 'Skip to next iteration for empty cells',
          9: 'Digit d maps to bit d-1 (e.g. "5" → 000010000)',
          10: 'Flatten (row÷3, col÷3) into a single box index 0-8',
          11: 'AND the bit against the row mask,',
          12: 'the column mask,',
          13: 'and the box mask — any nonzero AND means the digit repeats',
          14: 'Duplicate bit already set — board is invalid',
          15: 'OR the bit into the row mask to mark the digit',
          16: 'OR the bit into the column mask',
          17: 'OR the bit into the box mask',
          18: 'All 81 cells passed — board is valid',
        },
        javascript: {
          1: 'Define function taking 9x9 board',
          2: 'One integer per row — 9 bits track which digits appeared',
          3: 'One integer per column',
          4: 'One integer per 3x3 box',
          5: 'Loop through each row index 0-8',
          6: 'Loop through each column index 0-8',
          7: 'Skip empty cells marked with "."',
          8: 'Digit d maps to bit d-1 (e.g. "5" → 000010000)',
          9: 'Flatten (row÷3, col÷3) into a single box index 0-8',
          10: 'AND the bit against the row mask,',
          11: 'the column mask,',
          12: 'and the box mask — any nonzero AND means the digit repeats',
          13: 'Duplicate bit already set — board is invalid',
          15: 'OR the bit into the row mask to mark the digit',
          16: 'OR the bit into the column mask',
          17: 'OR the bit into the box mask',
          20: 'All 81 cells passed — board is valid',
        },
        java: {
          1: 'Define function taking char 2D array',
          2: 'One integer per row — 9 bits track which digits appeared',
          3: 'One integer per column',
          4: 'One integer per 3x3 box',
          5: 'Loop through each row index 0-8',
          6: 'Loop through each column index 0-8',
          7: 'Skip empty cells marked with "."',
          8: "Digit d maps to bit d-1 (char minus '1' gives 0-8)",
          9: 'Flatten (row÷3, col÷3) into a single box index 0-8',
          10: 'AND the bit against the row mask,',
          11: 'the column mask,',
          12: 'and the box mask — any nonzero AND means the digit repeats',
          13: 'Duplicate bit already set — board is invalid',
          15: 'OR the bit into the row mask to mark the digit',
          16: 'OR the bit into the column mask',
          17: 'OR the bit into the box mask',
          20: 'All 81 cells passed — board is valid',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'defaultdict creates the empty value on first touch, so no "is this key here?" check',
      3: 'Define function taking 9x9 board',
      4: 'Create set dict to track each row',
      5: 'Create set dict to track each column',
      6: 'Create set dict to track each 3x3 box',
      7: 'Loop through each row index 0-8',
      8: 'Loop through each column index 0-8',
      9: 'Skip empty cells marked with "."',
      10: 'Skip to next iteration for empty cells',
      11: 'Read the digit value at current cell',
      12: 'Compute which 3x3 box this cell belongs to',
      13: 'Check if val already seen in row, col,',
      14: 'or column set, or in the box set',
      15: 'for a duplicate',
      16: 'Return False if any duplicate found',
      17: 'Add value to the row tracking set',
      18: 'Add value to the column tracking set',
      19: 'Add value to the box tracking set',
      20: 'Return True if no duplicates found',
    },
    javascript: {
      1: 'Define function taking 9x9 board',
      2: 'Create objects to track rows, cols, boxes',
      3: 'Loop through each row index 0-8',
      4: 'Loop through each column index 0-8',
      5: 'Skip empty cells marked with "."',
      6: 'Read the digit value at current cell',
      7: 'Compute which 3x3 box this cell belongs to',
      8: 'Check if val already in row set,',
      9: 'column set, or box set',
      10: 'for a duplicate',
      11: 'Return false if any duplicate found',
      12: 'Add value to the row tracking set',
      13: 'Add value to the column tracking set',
      14: 'Add value to the box tracking set',
      17: 'Return true if no duplicates found',
    },
    java: {
      1: 'Define function taking char 2D array',
      2: 'Create map of sets to track each row',
      3: 'Create map of sets to track each column',
      4: 'Create map of sets to track each 3x3 box',
      6: 'Loop through each row index 0-8',
      7: 'Loop through each column index 0-8',
      8: 'Skip empty cells marked with "."',
      9: 'Read the character value at current cell',
      10: 'Compute which 3x3 box this cell belongs to',
      12: 'Initialize row set if not present',
      13: 'Initialize column set if not present',
      14: 'Initialize box set if not present',
      16: 'Check if val already in row set,',
      17: 'column set, or box set',
      18: 'for a duplicate',
      19: 'Return false if any duplicate found',
      22: 'Add value to the row tracking set',
      23: 'Add value to the column tracking set',
      24: 'Add value to the box tracking set',
      27: 'Return true if no duplicates found',
    },
  },
};
