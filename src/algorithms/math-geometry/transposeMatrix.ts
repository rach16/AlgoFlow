import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function stringifyMatrix(matrix: number[][]): string {
  return `[${matrix.map(row => `[${row.join(',')}]`).join(',')}]`;
}

function runTransposeMatrix(input: unknown): AlgorithmStep[] {
  const matrix = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Transposing a ${m}x${n} matrix into an ${n}x${m} matrix`,
    },
    highlights: [],
    message: `The transpose flips the matrix over its main diagonal: cell (i, j) moves to (j, i). Note the SHAPE flips too — a ${m}x${n} input becomes an ${n}x${m} output, so allocate the result with the dimensions swapped.`,
    codeLine: 1,
  } as AlgorithmStep);

  const result: (number | string)[][] = Array.from({ length: n }, () => Array.from({ length: m }, () => '·'));

  steps.push({
    state: {
      matrix: result.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Allocated an empty ${n}x${m} result grid`,
    },
    highlights: [],
    message: `Allocate result as ${n} rows x ${m} columns (the input's dimensions swapped). Every cell of the input will be copied into it exactly once.`,
    codeLine: 3,
  } as AlgorithmStep);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      result[j][i] = matrix[i][j];

      steps.push({
        state: {
          matrix: result.map(row => [...row]),
          matrixHighlights: [[j, i]],
          matrixSecondary: [],
          result: `result[${j}][${i}] = matrix[${i}][${j}] = ${matrix[i][j]}`,
        },
        highlights: [],
        pointers: { i, j },
        message: `Read matrix[${i}][${j}] = ${matrix[i][j]} (row ${i}, col ${j}) and write it to result[${j}][${i}] — row and column indices swap places.`,
        codeLine: 6,
        action: 'insert',
      } as AlgorithmStep);
    }
  }

  const finalMatrix = result as number[][];

  steps.push({
    state: {
      matrix: result.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Transpose: ${stringifyMatrix(finalMatrix)}`,
    },
    highlights: [],
    message: `Done in one pass over all ${m * n} cells. Row i of the input is now column i of the output: ${stringifyMatrix(finalMatrix)}.`,
    codeLine: 7,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runTransposeMatrixInPlace(input: unknown): AlgorithmStep[] {
  const matrix = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;
  const square = m === n;

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: square
        ? `Square ${m}x${n} matrix — in-place diagonal swap is possible`
        : `Non-square ${m}x${n} matrix — in-place swap is NOT possible`,
    },
    highlights: [],
    message: square
      ? `When the matrix is SQUARE the transpose can be done with no extra grid: walk only the cells strictly above the diagonal and swap each with its mirror below. O(1) extra space instead of O(m*n).`
      : `Caveat: this technique needs a SQUARE matrix. A ${m}x${n} transpose has shape ${n}x${m}, and you cannot reshape an array in place, so a non-square input must fall back to building a new grid.`,
    codeLine: 1,
  } as AlgorithmStep);

  if (!square) {
    const result: (number | string)[][] = Array.from({ length: n }, () => Array.from({ length: m }, () => '·'));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        result[j][i] = matrix[i][j];
      }
    }
    steps.push({
      state: {
        matrix: result.map(row => [...row]),
        matrixHighlights: [],
        matrixSecondary: [],
        result: `Transpose: ${stringifyMatrix(result as number[][])}`,
      },
      highlights: [],
      message: `Fell back to allocating an ${n}x${m} grid, because the diagonal swap only works when rows and columns have the same count.`,
      codeLine: 4,
      action: 'found',
    } as AlgorithmStep);
    return steps;
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: Array.from({ length: m }, (_, d) => [d, d] as [number, number]),
      matrixSecondary: [],
      result: `Diagonal cells stay put`,
    },
    highlights: [],
    message: `The diagonal cells (i, i) map to themselves, so they never move. Only the pairs above and below the diagonal need swapping — that is why the inner loop starts at j = i + 1.`,
    codeLine: 6,
    action: 'visit',
  } as AlgorithmStep);

  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: [[i, j], [j, i]],
          matrixSecondary: [],
          result: `Swapping (${i},${j}) with (${j},${i})`,
        },
        highlights: [],
        message: `Mirror pair: matrix[${i}][${j}] = ${matrix[i][j]} and matrix[${j}][${i}] = ${matrix[j][i]}. Exchange them.`,
        codeLine: 7,
        action: 'compare',
      } as AlgorithmStep);

      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];

      steps.push({
        state: {
          matrix: matrix.map(row => [...row]),
          matrixHighlights: [[i, j], [j, i]],
          matrixSecondary: [],
          result: `Swapped: (${i},${j}) = ${matrix[i][j]}, (${j},${i}) = ${matrix[j][i]}`,
        },
        highlights: [],
        message: `After the swap matrix[${i}][${j}] = ${matrix[i][j]} and matrix[${j}][${i}] = ${matrix[j][i]}. Both cells are final — visiting each pair once is what keeps this O(n²) time, O(1) space.`,
        codeLine: 7,
        action: 'swap',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Transpose: ${stringifyMatrix(matrix)}`,
    },
    highlights: [],
    message: `Done with zero extra memory: ${stringifyMatrix(matrix)} — the same answer the allocate-a-new-grid version produces.`,
    codeLine: 8,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const transposeMatrix: Algorithm = {
  id: 'transpose-matrix',
  name: 'Transpose Matrix',
  category: 'Math & Geometry',
  difficulty: 'Easy',
  timeComplexity: 'O(m * n)',
  spaceComplexity: 'O(m * n)',
  pattern: 'Matrix — swap row and column indices across the diagonal',
  description:
    'Given a 2D integer array matrix, return the transpose of matrix. The transpose flips the matrix over its main diagonal, switching the row and column indices, so an m x n matrix becomes n x m.',
  problemUrl: 'https://leetcode.com/problems/transpose-matrix/',
  code: {
    python: `def transpose(matrix):
    m, n = len(matrix), len(matrix[0])
    result = [[0] * m for _ in range(n)]
    for i in range(m):
        for j in range(n):
            result[j][i] = matrix[i][j]
    return result`,
    javascript: `function transpose(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const result = Array.from({ length: n }, () => new Array(m).fill(0));
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}`,
    java: `public static int[][] transpose(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    int[][] result = new int[n][m];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}`,
  },
  defaultInput: [[2, 4, -1], [-10, 5, 11], [18, -7, 6]],
  run: runTransposeMatrix,
  optimalApproachName: 'Build New Matrix',
  approaches: [
    {
      id: 'in-place-diagonal-swap',
      name: 'In-Place Diagonal Swap',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description:
        'For a SQUARE matrix, swap each cell above the diagonal with its mirror below and skip the output grid entirely — O(1) space, but it cannot handle a non-square input because the transpose changes the shape.',
      code: {
        python: `def transpose(matrix):
    n = len(matrix)
    if len(matrix[0]) != n:
        raise ValueError("in-place swap needs a square matrix")
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    return matrix`,
        javascript: `function transpose(matrix) {
    const n = matrix.length;
    if (matrix[0].length !== n) {
        throw new Error('in-place swap needs a square matrix');
    }
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    return matrix;
}`,
        java: `public static int[][] transpose(int[][] matrix) {
    int n = matrix.length;
    if (matrix[0].length != n) {
        throw new IllegalArgumentException("in-place swap needs a square matrix");
    }
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }
    return matrix;
}`,
      },
      run: runTransposeMatrixInPlace,
      lineExplanations: {
        python: {
          1: 'Define function taking the matrix',
          2: 'Side length of the (assumed square) matrix',
          3: 'Guard: the shape changes unless rows == cols',
          4: 'A non-square input must build a new grid instead',
          5: 'Walk every row',
          6: 'Only cells strictly above the diagonal — j starts at i + 1',
          7: 'Swap the cell with its mirror below the diagonal',
          8: 'The same array now holds the transpose',
        },
        javascript: {
          1: 'Define function taking the matrix',
          2: 'Side length of the (assumed square) matrix',
          3: 'Guard: the shape changes unless rows == cols',
          4: 'A non-square input must build a new grid instead',
          6: 'Walk every row',
          7: 'Only cells strictly above the diagonal — j starts at i + 1',
          8: 'Destructuring swap with its mirror below the diagonal',
          11: 'The same array now holds the transpose',
        },
        java: {
          1: 'Define method taking the matrix',
          2: 'Side length of the (assumed square) matrix',
          3: 'Guard: the shape changes unless rows == cols',
          4: 'A non-square input must build a new grid instead',
          6: 'Walk every row',
          7: 'Only cells strictly above the diagonal — j starts at i + 1',
          8: 'Hold the upper cell in a temp',
          9: 'Copy the mirror cell up',
          10: 'Write the saved value into the mirror cell',
          13: 'The same array now holds the transpose',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the matrix',
      2: 'm rows and n columns in the input',
      3: 'Result has the dimensions SWAPPED: n rows, m columns',
      4: 'Walk every input row',
      5: 'Walk every input column',
      6: 'Cell (i, j) of the input lands at (j, i) of the result',
      7: 'Return the freshly built transpose',
    },
    javascript: {
      1: 'Define function taking the matrix',
      2: 'm rows and n columns in the input',
      3: 'Result has the dimensions SWAPPED: n rows, m columns',
      4: 'Walk every input row',
      5: 'Walk every input column',
      6: 'Cell (i, j) of the input lands at (j, i) of the result',
      9: 'Return the freshly built transpose',
    },
    java: {
      1: 'Define method taking the matrix',
      2: 'm rows and n columns in the input',
      3: 'Result has the dimensions SWAPPED: n rows, m columns',
      4: 'Walk every input row',
      5: 'Walk every input column',
      6: 'Cell (i, j) of the input lands at (j, i) of the result',
      9: 'Return the freshly built transpose',
    },
  },
};
