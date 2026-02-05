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
};
