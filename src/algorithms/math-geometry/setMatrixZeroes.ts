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

function runSetMatrixZeroesRowColSets(input: unknown): AlgorithmStep[] {
  const matrix = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Scanning for zeroes...',
    },
    highlights: [],
    message: `${m}x${n} matrix. Record every zero's row and column in two sets, then zero out marked rows/columns in a second pass. O(m+n) extra space.`,
    codeLine: 1,
  } as AlgorithmStep);

  const zeroRows = new Set<number>();
  const zeroCols = new Set<number>();

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] === 0) {
        zeroRows.add(r);
        zeroCols.add(c);

        steps.push({
          state: {
            matrix: matrix.map(row => [...row]),
            matrixHighlights: [[r, c]],
            matrixSecondary: [],
            result: `zeroRows = {${[...zeroRows].join(', ')}}, zeroCols = {${[...zeroCols].join(', ')}}`,
          },
          highlights: [],
          message: `matrix[${r}][${c}] = 0. Record row ${r} and column ${c} in the sets — unlike the marker trick, this uses real extra memory.`,
          codeLine: 6,
          action: 'found',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [
        ...[...zeroRows].flatMap(r => Array.from({ length: n }, (_, c) => [r, c] as [number, number])),
        ...[...zeroCols].flatMap(c => Array.from({ length: m }, (_, r) => [r, c] as [number, number])),
      ],
      result: `Rows to zero: {${[...zeroRows].join(', ')}}. Cols to zero: {${[...zeroCols].join(', ')}}`,
    },
    highlights: [],
    message: `Scan complete. Rows {${[...zeroRows].join(', ')}} and columns {${[...zeroCols].join(', ')}} must become zero. Second pass applies it.`,
    codeLine: 9,
    action: 'visit',
  } as AlgorithmStep);

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if ((zeroRows.has(r) || zeroCols.has(c)) && matrix[r][c] !== 0) {
        matrix[r][c] = 0;

        steps.push({
          state: {
            matrix: matrix.map(row => [...row]),
            matrixHighlights: [[r, c]],
            matrixSecondary: [],
            result: `Set matrix[${r}][${c}] = 0`,
          },
          highlights: [],
          message: `Cell (${r},${c}) is in ${zeroRows.has(r) ? `zero row ${r}` : `zero column ${c}`} — set it to 0.`,
          codeLine: 12,
          action: 'delete',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      matrix: matrix.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Matrix zeroed!',
    },
    highlights: [],
    message: `Done! Same result as the O(1) marker approach, but the sets make the logic much easier to reason about.`,
    codeLine: 12,
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
    java: `public static void setZeroes(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    boolean firstRowZero = false;

    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            if (matrix[i][j] == 0) {
                matrix[0][j] = 0;
                if (i == 0) firstRowZero = true;
                else matrix[i][0] = 0;
            }
        }
    }

    for (int i = 1; i < rows; i++) {
        for (int j = 1; j < cols; j++) {
            if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                matrix[i][j] = 0;
            }
        }
    }

    if (matrix[0][0] == 0) {
        for (int i = 0; i < rows; i++) matrix[i][0] = 0;
    }
    if (firstRowZero) {
        for (int j = 0; j < cols; j++) matrix[0][j] = 0;
    }
}`,
  },
  defaultInput: [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
  run: runSetMatrixZeroes,
  optimalApproachName: 'First Row/Col Markers',
  approaches: [
    {
      id: 'row-col-sets',
      name: 'Row & Column Sets',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(m+n)',
      description:
        'Instead of reusing the first row/column as in-place markers, record zero rows and columns in two hash sets — trades O(m+n) extra space for far simpler bookkeeping.',
      code: {
        python: `def setZeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    zero_rows, zero_cols = set(), set()
    for r in range(m):
        for c in range(n):
            if matrix[r][c] == 0:
                zero_rows.add(r)
                zero_cols.add(c)
    for r in range(m):
        for c in range(n):
            if r in zero_rows or c in zero_cols:
                matrix[r][c] = 0`,
        javascript: `function setZeroes(matrix) {
    const m = matrix.length, n = matrix[0].length;
    const zeroRows = new Set(), zeroCols = new Set();
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if (matrix[r][c] === 0) {
                zeroRows.add(r);
                zeroCols.add(c);
            }
        }
    }
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if (zeroRows.has(r) || zeroCols.has(c)) {
                matrix[r][c] = 0;
            }
        }
    }
}`,
        java: `public static void setZeroes(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length;
    Set<Integer> zeroRows = new HashSet<>();
    Set<Integer> zeroCols = new HashSet<>();
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (matrix[r][c] == 0) {
                zeroRows.add(r);
                zeroCols.add(c);
            }
        }
    }
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (zeroRows.contains(r) || zeroCols.contains(c)) {
                matrix[r][c] = 0;
            }
        }
    }
}`,
      },
      run: runSetMatrixZeroesRowColSets,
      lineExplanations: {
        python: {
          1: 'Define function taking matrix',
          2: 'Get matrix dimensions m and n',
          3: 'Two sets: rows and columns that must become zero',
          4: 'First pass: scan every row',
          5: 'Scan every column',
          6: 'Found a zero cell?',
          7: 'Remember its row',
          8: 'Remember its column',
          9: 'Second pass: scan every row again',
          10: 'Scan every column again',
          11: 'Cell lies in a marked row or marked column?',
          12: 'Zero it out',
        },
        javascript: {
          1: 'Define function taking matrix',
          2: 'Get matrix dimensions m and n',
          3: 'Two sets: rows and columns that must become zero',
          4: 'First pass: scan every row',
          5: 'Scan every column',
          6: 'Found a zero cell?',
          7: 'Remember its row',
          8: 'Remember its column',
          12: 'Second pass: scan every row again',
          13: 'Scan every column again',
          14: 'Cell lies in a marked row or marked column?',
          15: 'Zero it out',
        },
        java: {
          1: 'Define method taking matrix',
          2: 'Get matrix dimensions m and n',
          3: 'Set of rows that must become zero',
          4: 'Set of columns that must become zero',
          5: 'First pass: scan every row',
          6: 'Scan every column',
          7: 'Found a zero cell?',
          8: 'Remember its row',
          9: 'Remember its column',
          13: 'Second pass: scan every row again',
          14: 'Scan every column again',
          15: 'Cell lies in a marked row or marked column?',
          16: 'Zero it out',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking matrix',
      2: 'Get matrix dimensions m and n',
      3: 'Check if first row contains any zero',
      4: 'Check if first column contains any zero',
      6: 'Scan inner matrix for zeroes',
      7: 'Iterate over columns (skip first)',
      8: 'If cell is zero, mark its row and col',
      9: 'Mark first cell of this row as 0',
      10: 'Mark first cell of this column as 0',
      12: 'Zero out cells based on markers',
      13: 'Iterate over columns',
      14: 'If row or column marker is 0, zero cell',
      15: 'Set cell to 0',
      17: 'If first row originally had zero',
      18: 'Zero out entire first row',
      19: 'If first col originally had zero',
      20: 'Zero out entire first column',
    },
    javascript: {
      1: 'Define function taking matrix',
      2: 'Get matrix dimensions',
      3: 'Flags for first row/col having zeroes',
      4: 'Check if first row has any zero',
      5: 'Check if first col has any zero',
      7: 'Scan inner matrix for zeroes',
      8: 'Iterate over columns',
      9: 'If cell is zero, mark row and col',
      10: 'Mark first cell of row as 0',
      11: 'Mark first cell of column as 0',
      14: 'Zero out cells based on markers',
      15: 'Iterate over columns',
      16: 'If row or column marker is 0',
      17: 'Set cell to 0',
      19: 'If first row had zero, zero entire row',
      20: 'If first col had zero, zero entire column',
    },
    java: {
      1: 'Define method taking matrix',
      2: 'Get dimensions and first-row flag',
      3: 'Initialize firstRowZero flag',
      5: 'Scan all cells for zeroes',
      6: 'Iterate over columns',
      7: 'If cell is zero, set markers',
      8: 'Mark first cell of column as 0',
      9: 'If in first row, set flag instead',
      10: 'Otherwise mark first cell of row as 0',
      15: 'Zero out inner cells based on markers',
      16: 'Iterate over columns',
      17: 'If row or column marker is 0',
      18: 'Set cell to 0',
      23: 'If top-left is 0, zero first column',
      24: 'Set each cell in first column to 0',
      26: 'If first row had zero, zero it out',
      27: 'Set each cell in first row to 0',
    },
  },
};
