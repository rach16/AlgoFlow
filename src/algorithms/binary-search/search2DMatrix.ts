import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface Search2DMatrixInput {
  matrix: number[][];
  target: number;
}

function runSearch2DMatrix(input: unknown): AlgorithmStep[] {
  const { matrix, target } = input as Search2DMatrixInput;
  const steps: AlgorithmStep[] = [];
  const rows = matrix.length;
  const cols = rows > 0 ? matrix[0].length : 0;

  // Deep copy helper
  const copyMatrix = () => matrix.map(row => [...row]);

  // Initial state
  steps.push({
    state: { matrix: copyMatrix(), target },
    highlights: [],
    message: `Search for ${target} in a ${rows}x${cols} matrix`,
    codeLine: 1,
  });

  if (rows === 0 || cols === 0) {
    steps.push({
      state: { matrix: copyMatrix(), target, result: false },
      highlights: [],
      message: `Empty matrix — target not found`,
      codeLine: 2,
    });
    return steps;
  }

  // Treat the matrix as a flattened sorted array and binary search
  let top = 0;
  let bot = rows - 1;

  steps.push({
    state: { matrix: copyMatrix(), target, top, bot },
    highlights: [],
    message: `Binary search for the correct row: top=${top}, bot=${bot}`,
    codeLine: 3,
  });

  // Step 1: Binary search for the correct row
  while (top <= bot) {
    const midRow = Math.floor((top + bot) / 2);

    steps.push({
      state: { matrix: copyMatrix(), target, top, bot, midRow, matrixHighlights: Array.from({ length: cols }, (_, c): [number, number] => [midRow, c]) },
      highlights: [],
      pointers: { top, midRow, bot },
      message: `Check row ${midRow}: [${matrix[midRow].join(', ')}]`,
      codeLine: 5,
      action: 'visit',
    });

    if (target > matrix[midRow][cols - 1]) {
      steps.push({
        state: { matrix: copyMatrix(), target, top, bot, midRow, matrixHighlights: [[midRow, cols - 1]] as [number, number][] },
        highlights: [],
        pointers: { top, midRow, bot },
        message: `${target} > ${matrix[midRow][cols - 1]} (last element of row ${midRow}), search below`,
        codeLine: 7,
        action: 'compare',
      });
      top = midRow + 1;
    } else if (target < matrix[midRow][0]) {
      steps.push({
        state: { matrix: copyMatrix(), target, top, bot, midRow, matrixHighlights: [[midRow, 0]] as [number, number][] },
        highlights: [],
        pointers: { top, midRow, bot },
        message: `${target} < ${matrix[midRow][0]} (first element of row ${midRow}), search above`,
        codeLine: 9,
        action: 'compare',
      });
      bot = midRow - 1;
    } else {
      steps.push({
        state: { matrix: copyMatrix(), target, top, bot, midRow, matrixHighlights: Array.from({ length: cols }, (_, c): [number, number] => [midRow, c]) },
        highlights: [],
        pointers: { top, midRow, bot },
        message: `Target ${target} is within row ${midRow} range [${matrix[midRow][0]}..${matrix[midRow][cols - 1]}]`,
        codeLine: 11,
        action: 'compare',
      });

      // Step 2: Binary search within the row
      let left = 0;
      let right = cols - 1;

      steps.push({
        state: { matrix: copyMatrix(), target, row: midRow, left, right, matrixHighlights: Array.from({ length: cols }, (_, c): [number, number] => [midRow, c]) },
        highlights: [],
        message: `Binary search within row ${midRow}: left=${left}, right=${right}`,
        codeLine: 12,
      });

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        steps.push({
          state: { matrix: copyMatrix(), target, row: midRow, left, right, mid, matrixHighlights: [[midRow, mid]] as [number, number][] },
          highlights: [],
          pointers: { left, mid, right },
          message: `Check matrix[${midRow}][${mid}] = ${matrix[midRow][mid]}`,
          codeLine: 14,
          action: 'visit',
        });

        if (matrix[midRow][mid] === target) {
          steps.push({
            state: { matrix: copyMatrix(), target, result: true, row: midRow, col: mid, matrixHighlights: [[midRow, mid]] as [number, number][] },
            highlights: [],
            message: `Found! matrix[${midRow}][${mid}] = ${target}`,
            codeLine: 16,
            action: 'found',
          });
          return steps;
        } else if (matrix[midRow][mid] < target) {
          steps.push({
            state: { matrix: copyMatrix(), target, row: midRow, left, right, mid, matrixHighlights: [[midRow, mid]] as [number, number][] },
            highlights: [],
            pointers: { left, mid, right },
            message: `${matrix[midRow][mid]} < ${target}, search right half`,
            codeLine: 18,
            action: 'compare',
          });
          left = mid + 1;
        } else {
          steps.push({
            state: { matrix: copyMatrix(), target, row: midRow, left, right, mid, matrixHighlights: [[midRow, mid]] as [number, number][] },
            highlights: [],
            pointers: { left, mid, right },
            message: `${matrix[midRow][mid]} > ${target}, search left half`,
            codeLine: 20,
            action: 'compare',
          });
          right = mid - 1;
        }
      }

      // Not found in row
      steps.push({
        state: { matrix: copyMatrix(), target, result: false },
        highlights: [],
        message: `${target} not found in row ${midRow}`,
        codeLine: 22,
      });
      return steps;
    }
  }

  // Target row not found
  steps.push({
    state: { matrix: copyMatrix(), target, result: false },
    highlights: [],
    message: `${target} not found in matrix`,
    codeLine: 22,
  });

  return steps;
}

function runSearch2DMatrixStaircase(input: unknown): AlgorithmStep[] {
  const { matrix, target } = input as Search2DMatrixInput;
  const steps: AlgorithmStep[] = [];
  const rows = matrix.length;
  const cols = rows > 0 ? matrix[0].length : 0;

  const copyMatrix = () => matrix.map(r => [...r]);

  steps.push({
    state: { matrix: copyMatrix(), target },
    highlights: [],
    message: `Staircase search: start at the top-right corner of the ${rows}x${cols} matrix and eliminate a full row or column each step`,
    codeLine: 1,
  });

  if (rows === 0 || cols === 0) {
    steps.push({
      state: { matrix: copyMatrix(), target, result: false },
      highlights: [],
      message: `Empty matrix — target not found`,
      codeLine: 13,
    });
    return steps;
  }

  let row = 0;
  let col = cols - 1;

  steps.push({
    state: { matrix: copyMatrix(), target, row, col, matrixHighlights: [[row, col]] as [number, number][] },
    highlights: [],
    pointers: { row, col },
    message: `Start at matrix[${row}][${col}] = ${matrix[row][col]} — everything left is smaller, everything below is bigger`,
    codeLine: 3,
    action: 'visit',
  });

  while (row < rows && col >= 0) {
    const val = matrix[row][col];

    steps.push({
      state: { matrix: copyMatrix(), target, row, col, matrixHighlights: [[row, col]] as [number, number][] },
      highlights: [],
      pointers: { row, col },
      message: `Compare matrix[${row}][${col}] = ${val} with target ${target}`,
      codeLine: 6,
      action: 'compare',
    });

    if (val === target) {
      steps.push({
        state: { matrix: copyMatrix(), target, result: true, row, col, matrixHighlights: [[row, col]] as [number, number][] },
        highlights: [],
        pointers: { row, col },
        message: `Found! matrix[${row}][${col}] = ${target}`,
        codeLine: 7,
        action: 'found',
      });
      return steps;
    }

    if (val > target) {
      steps.push({
        state: { matrix: copyMatrix(), target, row, col, matrixHighlights: Array.from({ length: row + 1 }, (_, r): [number, number] => [r, col]) },
        highlights: [],
        pointers: { row, col },
        message: `${val} > ${target} — everything below in column ${col} is even bigger. Eliminate the column, step left`,
        codeLine: 9,
        action: 'compare',
      });
      col--;
    } else {
      steps.push({
        state: { matrix: copyMatrix(), target, row, col, matrixHighlights: Array.from({ length: col + 1 }, (_, c): [number, number] => [row, c]) },
        highlights: [],
        pointers: { row, col },
        message: `${val} < ${target} — everything left in row ${row} is even smaller. Eliminate the row, step down`,
        codeLine: 11,
        action: 'compare',
      });
      row++;
    }
  }

  steps.push({
    state: { matrix: copyMatrix(), target, result: false },
    highlights: [],
    message: `Walked off the matrix — ${target} is not present. Staircase visits at most ${rows} + ${cols} cells`,
    codeLine: 13,
  });

  return steps;
}

export const search2DMatrix: Algorithm = {
  id: 'search-2d-matrix',
  name: 'Search a 2D Matrix',
  category: 'Binary Search',
  difficulty: 'Medium',
  timeComplexity: 'O(log(m·n))',
  spaceComplexity: 'O(1)',
  pattern: 'Binary Search — search row first, then column',
  description:
    'You are given an m x n integer matrix with the following properties: Integers in each row are sorted in ascending order. The first integer of each row is greater than the last integer of the previous row. Given an integer target, return true if target is in matrix or false otherwise. Write an algorithm with O(log(m * n)) time complexity.',
  problemUrl: 'https://leetcode.com/problems/search-a-2d-matrix/',
  code: {
    python: `def searchMatrix(matrix, target):
    ROWS, COLS = len(matrix), len(matrix[0])
    top, bot = 0, ROWS - 1

    while top <= bot:
        midRow = (top + bot) // 2
        if target > matrix[midRow][-1]:
            top = midRow + 1
        elif target < matrix[midRow][0]:
            bot = midRow - 1
        else:
            break

    if not (top <= bot):
        return False

    row = (top + bot) // 2
    left, right = 0, COLS - 1

    while left <= right:
        mid = (left + right) // 2
        if matrix[row][mid] == target:
            return True
        elif matrix[row][mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return False`,
    javascript: `function searchMatrix(matrix, target) {
    const ROWS = matrix.length;
    const COLS = matrix[0].length;
    let top = 0, bot = ROWS - 1;

    while (top <= bot) {
        const midRow = Math.floor((top + bot) / 2);
        if (target > matrix[midRow][COLS - 1]) {
            top = midRow + 1;
        } else if (target < matrix[midRow][0]) {
            bot = midRow - 1;
        } else {
            break;
        }
    }

    if (!(top <= bot)) return false;

    const row = Math.floor((top + bot) / 2);
    let left = 0, right = COLS - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (matrix[row][mid] === target) {
            return true;
        } else if (matrix[row][mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return false;
}`,
    java: `public static boolean searchMatrix(int[][] matrix, int target) {
    int ROWS = matrix.length;
    int COLS = matrix[0].length;
    int top = 0, bot = ROWS - 1;

    while (top <= bot) {
        int midRow = top + (bot - top) / 2;
        if (target > matrix[midRow][COLS - 1]) {
            top = midRow + 1;
        } else if (target < matrix[midRow][0]) {
            bot = midRow - 1;
        } else {
            break;
        }
    }

    if (!(top <= bot)) return false;

    int row = top + (bot - top) / 2;
    int left = 0, right = COLS - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (matrix[row][mid] == target) {
            return true;
        } else if (matrix[row][mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return false;
}`,
  },
  defaultInput: {
    matrix: [
      [1, 3, 5, 7],
      [10, 11, 16, 20],
      [23, 30, 34, 60],
    ],
    target: 3,
  },
  run: runSearch2DMatrix,
  optimalApproachName: 'Double Binary Search',
  approaches: [
    {
      id: 'staircase-search',
      name: 'Staircase Search',
      timeComplexity: 'O(m + n)',
      spaceComplexity: 'O(1)',
      description:
        'Start at the top-right corner and eliminate one row or column per step — a simpler O(m+n) walk instead of the O(log(m·n)) double binary search.',
      code: {
        python: `def searchMatrix(matrix, target):
    ROWS, COLS = len(matrix), len(matrix[0])
    row, col = 0, COLS - 1

    while row < ROWS and col >= 0:
        if matrix[row][col] == target:
            return True
        if matrix[row][col] > target:
            col -= 1
        else:
            row += 1

    return False`,
        javascript: `function searchMatrix(matrix, target) {
    const ROWS = matrix.length;
    const COLS = matrix[0].length;
    let row = 0, col = COLS - 1;

    while (row < ROWS && col >= 0) {
        if (matrix[row][col] === target) {
            return true;
        }
        if (matrix[row][col] > target) {
            col--;
        } else {
            row++;
        }
    }

    return false;
}`,
        java: `public static boolean searchMatrix(int[][] matrix, int target) {
    int ROWS = matrix.length;
    int COLS = matrix[0].length;
    int row = 0, col = COLS - 1;

    while (row < ROWS && col >= 0) {
        if (matrix[row][col] == target) {
            return true;
        }
        if (matrix[row][col] > target) {
            col--;
        } else {
            row++;
        }
    }

    return false;
}`,
      },
      run: runSearch2DMatrixStaircase,
      lineExplanations: {
        python: {
          1: 'Define function taking matrix and target',
          2: 'Get number of rows and columns',
          3: 'Start at the top-right corner cell',
          5: 'Keep walking while still inside the matrix',
          6: 'Does the current cell equal the target?',
          7: 'Found it — return True',
          8: 'Cell too big: everything below in this column is bigger',
          9: 'Eliminate the column — step left',
          10: 'Cell too small: everything left in this row is smaller',
          11: 'Eliminate the row — step down',
          13: 'Walked off the matrix — target absent',
        },
        javascript: {
          1: 'Define function taking matrix and target',
          2: 'Get number of rows',
          3: 'Get number of columns',
          4: 'Start at the top-right corner cell',
          6: 'Keep walking while still inside the matrix',
          7: 'Does the current cell equal the target?',
          8: 'Found it — return true',
          10: 'Cell too big: everything below in this column is bigger',
          11: 'Eliminate the column — step left',
          12: 'Cell too small: everything left in this row is smaller',
          13: 'Eliminate the row — step down',
          17: 'Walked off the matrix — target absent',
        },
        java: {
          1: 'Define method taking matrix and target',
          2: 'Get number of rows',
          3: 'Get number of columns',
          4: 'Start at the top-right corner cell',
          6: 'Keep walking while still inside the matrix',
          7: 'Does the current cell equal the target?',
          8: 'Found it — return true',
          10: 'Cell too big: everything below in this column is bigger',
          11: 'Eliminate the column — step left',
          12: 'Cell too small: everything left in this row is smaller',
          13: 'Eliminate the row — step down',
          17: 'Walked off the matrix — target absent',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking matrix and target',
      2: 'Get number of rows and columns',
      3: 'Init row search bounds top and bottom',
      5: 'Binary search for the correct row',
      6: 'Compute middle row index',
      7: 'If target > last element of mid row',
      8: 'Target must be in rows below, move top down',
      9: 'If target < first element of mid row',
      10: 'Target must be in rows above, move bot up',
      12: 'Target is within this row range, stop',
      14: 'If no valid row found, target is absent',
      15: 'Return False',
      17: 'Identify the target row for column search',
      18: 'Init column search bounds',
      20: 'Binary search within the target row',
      21: 'Compute middle column index',
      22: 'If element equals target, found it',
      23: 'Return True',
      24: 'If element is less than target',
      25: 'Search right half of row',
      27: 'Search left half of row',
      29: 'Target not found in the row',
    },
    javascript: {
      1: 'Define function taking matrix and target',
      2: 'Get number of rows',
      3: 'Get number of columns',
      4: 'Init row search bounds top and bottom',
      6: 'Binary search for the correct row',
      7: 'Compute middle row index',
      8: 'If target > last element of mid row',
      9: 'Search rows below',
      10: 'If target < first element of mid row',
      11: 'Search rows above',
      13: 'Target is within this row range, stop',
      17: 'If no valid row found, return false',
      19: 'Identify the target row',
      20: 'Init column search bounds',
      22: 'Binary search within the target row',
      23: 'Compute middle column index',
      24: 'If element equals target, found it',
      25: 'Return true',
      26: 'If element is less than target',
      27: 'Search right half of row',
      29: 'Search left half of row',
      33: 'Target not found, return false',
    },
    java: {
      1: 'Define method taking matrix and target',
      2: 'Get number of rows',
      3: 'Get number of columns',
      4: 'Init row search bounds top and bottom',
      6: 'Binary search for the correct row',
      7: 'Compute middle row avoiding overflow',
      8: 'If target > last element of mid row',
      9: 'Search rows below',
      10: 'If target < first element of mid row',
      11: 'Search rows above',
      13: 'Target is within this row range, stop',
      17: 'If no valid row found, return false',
      19: 'Identify the target row',
      20: 'Init column search bounds',
      22: 'Binary search within the target row',
      23: 'Compute middle column avoiding overflow',
      24: 'If element equals target, found it',
      25: 'Return true',
      26: 'If element is less than target',
      27: 'Search right half of row',
      29: 'Search left half of row',
      33: 'Target not found, return false',
    },
  },
};
