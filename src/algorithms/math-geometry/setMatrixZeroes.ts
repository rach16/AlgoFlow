import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSetMatrixZeroes(input: unknown): AlgorithmStep[] {
  const matrix = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Setting zeroes...',
    },
    highlights: [],
    message: `${m}x${n} matrix. Use first row and column as markers. O(1) extra space.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Check if first row has zero
  let firstRowZero = false;
  for (let c = 0; c < n; c++) {
    if (matrix[0][c] === 0) {
      firstRowZero = true;
      break;
    }
  }

  // Check if first column has zero
  let firstColZero = false;
  for (let r = 0; r < m; r++) {
    if (matrix[r][0] === 0) {
      firstColZero = true;
      break;
    }
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `First row has zero: ${firstRowZero}, First col has zero: ${firstColZero}`,
    },
    highlights: [],
    message: `First row has zero: ${firstRowZero}. First col has zero: ${firstColZero}.`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  // Use first row/col to mark zeros
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      if (matrix[r][c] === 0) {
        matrix[r][0] = 0;
        matrix[0][c] = 0;

        steps.push({
          state: {
            matrix: matrix.map(row => [...row]),
            matrixHighlights: [[r, c]],
            matrixSecondary: [[r, 0], [0, c]],
            result: `Found zero at (${r},${c}), marked row ${r} and col ${c}`,
          },
          highlights: [],
          message: `matrix[${r}][${c}] = 0. Mark: matrix[${r}][0] = 0, matrix[0][${c}] = 0.`,
          codeLine: 4,
          action: 'found',
        } as AlgorithmStep);
      }
    }
  }

  // Zero out cells based on markers
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      if (matrix[r][0] === 0 || matrix[0][c] === 0) {
        if (matrix[r][c] !== 0) {
          matrix[r][c] = 0;

          steps.push({
            state: {
              matrix: matrix.map(row => [...row]),
              matrixHighlights: [[r, c]],
              matrixSecondary: [],
              result: `Set matrix[${r}][${c}] = 0`,
            },
            highlights: [],
            message: `matrix[${r}][0]=${matrix[r][0]} or matrix[0][${c}]=${matrix[0][c]} is 0. Set matrix[${r}][${c}] = 0.`,
            codeLine: 6,
            action: 'delete',
          } as AlgorithmStep);
        }
      }
    }
  }

  // Handle first row
  if (firstRowZero) {
    for (let c = 0; c < n; c++) {
      matrix[0][c] = 0;
    }

    steps.push({
      state: {
        matrix: matrix.map(row => [...row]),
        matrixHighlights: Array.from({ length: n }, (_, c) => [0, c] as [number, number]),
        matrixSecondary: [],
        result: 'Zeroed first row',
      },
      highlights: [],
      message: `First row had a zero. Set entire first row to 0.`,
      codeLine: 8,
      action: 'delete',
    } as AlgorithmStep);
  }

  // Handle first column
  if (firstColZero) {
    for (let r = 0; r < m; r++) {
      matrix[r][0] = 0;
    }

    steps.push({
      state: {
        matrix: matrix.map(row => [...row]),
        matrixHighlights: Array.from({ length: m }, (_, r) => [r, 0] as [number, number]),
        matrixSecondary: [],
        result: 'Zeroed first column',
      },
      highlights: [],
      message: `First column had a zero. Set entire first column to 0.`,
      codeLine: 9,
      action: 'delete',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Matrix zeroed!',
    },
    highlights: [],
    message: `Done! Matrix updated in-place with O(1) extra space.`,
    codeLine: 10,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const setMatrixZeroes: Algorithm = {
  id: 'set-matrix-zeroes',
  name: 'Set Matrix Zeroes',
  category: 'Math & Geometry',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(1)',
  pattern: 'Matrix — use first row/col as markers',
  description:
    'Given an m x n integer matrix, if an element is 0, set its entire row and column to 0\'s. You must do it in place.',
  problemUrl: 'https://leetcode.com/problems/set-matrix-zeroes/',
  code: {
    python: `def setZeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    firstRow = any(matrix[0][c] == 0 for c in range(n))
    firstCol = any(matrix[r][0] == 0 for r in range(m))

    for r in range(1, m):
        for c in range(1, n):
            if matrix[r][c] == 0:
                matrix[r][0] = 0
                matrix[0][c] = 0

    for r in range(1, m):
        for c in range(1, n):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0

    if firstRow:
        for c in range(n): matrix[0][c] = 0
    if firstCol:
        for r in range(m): matrix[r][0] = 0`,
    javascript: `function setZeroes(matrix) {
    const m = matrix.length, n = matrix[0].length;
    let firstRow = false, firstCol = false;
    for (let c = 0; c < n; c++) if (matrix[0][c] === 0) firstRow = true;
    for (let r = 0; r < m; r++) if (matrix[r][0] === 0) firstCol = true;

    for (let r = 1; r < m; r++)
        for (let c = 1; c < n; c++)
            if (matrix[r][c] === 0) {
                matrix[r][0] = 0;
                matrix[0][c] = 0;
            }

    for (let r = 1; r < m; r++)
        for (let c = 1; c < n; c++)
            if (matrix[r][0] === 0 || matrix[0][c] === 0)
                matrix[r][c] = 0;

    if (firstRow) for (let c = 0; c < n; c++) matrix[0][c] = 0;
    if (firstCol) for (let r = 0; r < m; r++) matrix[r][0] = 0;
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
  run: runSetMatrixZeroes,
};
