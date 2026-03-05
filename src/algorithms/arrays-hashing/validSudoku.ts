import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

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
    python: `def isValidSudoku(board):
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
  lineExplanations: {
    python: {
      1: 'Define function taking 9x9 board',
      2: 'Create set dict to track each row',
      3: 'Create set dict to track each column',
      4: 'Create set dict to track each 3x3 box',
      5: 'Loop through each row index 0-8',
      6: 'Loop through each column index 0-8',
      7: 'Skip empty cells marked with "."',
      8: 'Skip to next iteration for empty cells',
      9: 'Read the digit value at current cell',
      10: 'Compute which 3x3 box this cell belongs to',
      11: 'Check if val already seen in row, col,',
      12: 'or column set, or in the box set',
      13: 'for a duplicate',
      14: 'Return False if any duplicate found',
      15: 'Add value to the row tracking set',
      16: 'Add value to the column tracking set',
      17: 'Add value to the box tracking set',
      18: 'Return True if no duplicates found',
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
