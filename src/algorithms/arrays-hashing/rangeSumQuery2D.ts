import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface RangeSumQuery2DInput {
  matrix: number[][];
  queries: [number, number, number, number][];
}

function runRangeSumQuery2DRowPrefix(input: unknown): AlgorithmStep[] {
  const { matrix, queries } = input as RangeSumQuery2DInput;
  const steps: AlgorithmStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;

  // rows[r][c] = sum of matrix[r][0..c-1]
  const rows: number[][] = Array.from({ length: m }, () => new Array(n + 1).fill(0));

  steps.push({
    state: { matrix: matrix.map((row) => [...row]), matrixHighlights: [] },
    highlights: [],
    message: `Cheaper build: give every row its own running total, then a query just adds up one slice per row`,
    codeLine: 2,
  });

  steps.push({
    state: { matrix: rows.map((row) => [...row]), matrixHighlights: [] },
    highlights: [],
    message: `Each row gets ${n + 1} slots — slot 0 is the empty prefix so slices never need a bounds check`,
    codeLine: 5,
  });

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      rows[r][c + 1] = rows[r][c] + matrix[r][c];
      steps.push({
        state: {
          matrix: rows.map((row) => [...row]),
          matrixHighlights: [[r, c + 1]] as [number, number][],
          matrixSecondary: [[r, c]] as [number, number][],
        },
        highlights: [],
        message: `row ${r}: ${rows[r][c]} + matrix[${r}][${c}]=${matrix[r][c]} → ${rows[r][c + 1]}`,
        codeLine: 7,
        action: 'insert',
      });
    }
  }

  const results: number[] = [];

  for (const [row1, col1, row2, col2] of queries) {
    let total = 0;
    steps.push({
      state: { matrix: rows.map((row) => [...row]), matrixHighlights: [] },
      highlights: [],
      message: `Query sumRegion(${row1}, ${col1}, ${row2}, ${col2}) — walk rows ${row1}..${row2} and slice each one`,
      codeLine: 12,
    });

    for (let r = row1; r <= row2; r++) {
      const slice = rows[r][col2 + 1] - rows[r][col1];
      total += slice;
      steps.push({
        state: {
          matrix: rows.map((row) => [...row]),
          matrixHighlights: [[r, col2 + 1]] as [number, number][],
          matrixSecondary: [[r, col1]] as [number, number][],
        },
        highlights: [],
        message: `row ${r}: ${rows[r][col2 + 1]} - ${rows[r][col1]} = ${slice} — running total ${total}`,
        codeLine: 13,
        action: 'compare',
      });
    }

    results.push(total);
  }

  steps.push({
    state: { matrix: rows.map((row) => [...row]), matrixHighlights: [], result: results },
    highlights: [],
    message: `Answers: [${results.join(', ')}] — O(rows) per query instead of O(1), but the build touches each cell once`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

function runRangeSumQuery2D(input: unknown): AlgorithmStep[] {
  const { matrix, queries } = input as RangeSumQuery2DInput;
  const steps: AlgorithmStep[] = [];
  const m = matrix.length;
  const n = matrix[0].length;

  const prefix: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const snap = () => prefix.map((row) => [...row]);

  steps.push({
    state: { matrix: matrix.map((row) => [...row]), matrixHighlights: [] },
    highlights: [],
    message: `Answer every rectangle query in O(1) by precomputing prefix[r][c] = sum of the rectangle from (0,0) to (r-1,c-1)`,
    codeLine: 3,
  });

  steps.push({
    state: { matrix: snap(), matrixHighlights: [] },
    highlights: [],
    message: `Build a ${m + 1}×${n + 1} table padded with a zero row and column — the padding removes every out-of-bounds check`,
    codeLine: 4,
  });

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const up = prefix[r][c + 1];
      const left = prefix[r + 1][c];
      const corner = prefix[r][c];
      prefix[r + 1][c + 1] = matrix[r][c] + up + left - corner;
      steps.push({
        state: {
          matrix: snap(),
          matrixHighlights: [[r + 1, c + 1]] as [number, number][],
          matrixSecondary: [
            [r, c + 1],
            [r + 1, c],
            [r, c],
          ] as [number, number][],
        },
        highlights: [],
        message: `cell(${r},${c})=${matrix[r][c]} + up ${up} + left ${left} - overlap ${corner} = ${prefix[r + 1][c + 1]}`,
        codeLine: 7,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: { matrix: snap(), matrixHighlights: [] },
    highlights: [],
    message: `Prefix table ready. Bottom-right ${prefix[m][n]} is the sum of the entire matrix — now every query is four lookups`,
    codeLine: 12,
  });

  const results: number[] = [];

  for (const [row1, col1, row2, col2] of queries) {
    const region: [number, number][] = [];
    for (let r = row1; r <= row2; r++) {
      for (let c = col1; c <= col2; c++) region.push([r, c]);
    }

    steps.push({
      state: {
        matrix: matrix.map((row) => [...row]),
        matrixHighlights: region,
      },
      highlights: [],
      message: `Query sumRegion(${row1}, ${col1}, ${row2}, ${col2}) — this is the rectangle we want, without touching any of its cells`,
      codeLine: 12,
      action: 'visit',
    });

    const big = prefix[row2 + 1][col2 + 1];
    const above = prefix[row1][col2 + 1];
    const leftOf = prefix[row2 + 1][col1];
    const addBack = prefix[row1][col1];
    const total = big - above - leftOf + addBack;
    results.push(total);

    steps.push({
      state: {
        matrix: snap(),
        matrixHighlights: [[row2 + 1, col2 + 1]] as [number, number][],
        matrixSecondary: [
          [row1, col2 + 1],
          [row2 + 1, col1],
          [row1, col1],
        ] as [number, number][],
      },
      highlights: [],
      message: `${big} - ${above} (rows above) - ${leftOf} (cols left) + ${addBack} (double-subtracted corner) = ${total}`,
      codeLine: 14,
      action: 'found',
    });
  }

  steps.push({
    state: { matrix: snap(), matrixHighlights: [], result: results },
    highlights: [],
    message: `Answers: [${results.join(', ')}] — each one cost four array reads no matter how big the rectangle is`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const rangeSumQuery2D: Algorithm = {
  id: 'range-sum-query-2d',
  name: 'Range Sum Query 2D - Immutable',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n) build, O(1) per query',
  spaceComplexity: 'O(m·n)',
  pattern: 'Prefix/Suffix — 2D cumulative sum with inclusion-exclusion',
  description:
    'Design a data structure that, given a 2D matrix, answers repeated sumRegion(row1, col1, row2, col2) queries returning the sum of every element inside that rectangle. The matrix never changes, so queries must be fast.',
  problemUrl: 'https://leetcode.com/problems/range-sum-query-2d-immutable/',
  code: {
    python: `class NumMatrix:
    def __init__(self, matrix):
        m, n = len(matrix), len(matrix[0])
        self.prefix = [[0] * (n + 1) for _ in range(m + 1)]
        for r in range(m):
            for c in range(n):
                self.prefix[r + 1][c + 1] = (matrix[r][c]
                    + self.prefix[r][c + 1]
                    + self.prefix[r + 1][c]
                    - self.prefix[r][c])

    def sumRegion(self, row1, col1, row2, col2):
        p = self.prefix
        return (p[row2 + 1][col2 + 1] - p[row1][col2 + 1]
                - p[row2 + 1][col1] + p[row1][col1])`,
    javascript: `class NumMatrix {
    constructor(matrix) {
        const m = matrix.length, n = matrix[0].length;
        this.prefix = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let r = 0; r < m; r++) {
            for (let c = 0; c < n; c++) {
                this.prefix[r + 1][c + 1] = matrix[r][c]
                    + this.prefix[r][c + 1]
                    + this.prefix[r + 1][c]
                    - this.prefix[r][c];
            }
        }
    }

    sumRegion(row1, col1, row2, col2) {
        const p = this.prefix;
        return p[row2 + 1][col2 + 1] - p[row1][col2 + 1]
             - p[row2 + 1][col1] + p[row1][col1];
    }
}`,
    java: `class NumMatrix {
    private int[][] prefix;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        prefix = new int[m + 1][n + 1];
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                prefix[r + 1][c + 1] = matrix[r][c]
                    + prefix[r][c + 1]
                    + prefix[r + 1][c]
                    - prefix[r][c];
            }
        }
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        return prefix[row2 + 1][col2 + 1] - prefix[row1][col2 + 1]
             - prefix[row2 + 1][col1] + prefix[row1][col1];
    }
}`,
  },
  defaultInput: {
    matrix: [
      [3, 0, 1],
      [5, 6, 3],
      [1, 2, 0],
    ],
    queries: [
      [0, 0, 1, 1],
      [1, 1, 2, 2],
    ],
  },
  run: runRangeSumQuery2D,
  optimalApproachName: '2D Prefix Sum',
  approaches: [
    {
      id: 'row-prefix-sums',
      name: 'Per-Row Prefix Sums',
      timeComplexity: 'O(m·n) build, O(rows) per query',
      spaceComplexity: 'O(m·n)',
      description:
        'Keeps a running total per row instead of one global 2D table — much easier to reason about, but each query has to add up one slice per row in the range.',
      code: {
        python: `class NumMatrix:
    def __init__(self, matrix):
        self.rows = []
        for row in matrix:
            acc = [0]
            for v in row:
                acc.append(acc[-1] + v)
            self.rows.append(acc)

    def sumRegion(self, row1, col1, row2, col2):
        total = 0
        for r in range(row1, row2 + 1):
            total += self.rows[r][col2 + 1] - self.rows[r][col1]
        return total`,
        javascript: `class NumMatrix {
    constructor(matrix) {
        this.rows = matrix.map((row) => {
            const acc = [0];
            for (const v of row) acc.push(acc[acc.length - 1] + v);
            return acc;
        });
    }

    sumRegion(row1, col1, row2, col2) {
        let total = 0;
        for (let r = row1; r <= row2; r++) {
            total += this.rows[r][col2 + 1] - this.rows[r][col1];
        }
        return total;
    }
}`,
        java: `class NumMatrix {
    private int[][] rows;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        rows = new int[m][n + 1];
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                rows[r][c + 1] = rows[r][c] + matrix[r][c];
            }
        }
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        int total = 0;
        for (int r = row1; r <= row2; r++) {
            total += rows[r][col2 + 1] - rows[r][col1];
        }
        return total;
    }
}`,
      },
      run: runRangeSumQuery2DRowPrefix,
      lineExplanations: {
        python: {
          1: 'Immutable 2D range-sum structure',
          2: 'Precompute once at construction time',
          3: 'One running-total array per row',
          5: 'Start each row with the empty prefix 0',
          6: 'Walk the row left to right',
          7: 'Each slot is the previous slot plus the current cell',
          8: 'Store the finished row prefix',
          10: 'Answer a rectangle query',
          11: 'Accumulate one horizontal slice per row',
          12: 'Only the rows inside the rectangle matter',
          13: 'Slice sum = prefix at col2+1 minus prefix at col1',
          14: 'Total of all the slices is the rectangle sum',
        },
        javascript: {
          1: 'Immutable 2D range-sum structure',
          2: 'Precompute once at construction time',
          3: 'Turn every row into a running-total array',
          4: 'Start each row with the empty prefix 0',
          5: 'Each slot is the previous slot plus the current cell',
          10: 'Answer a rectangle query',
          11: 'Accumulate one horizontal slice per row',
          12: 'Only the rows inside the rectangle matter',
          13: 'Slice sum = prefix at col2+1 minus prefix at col1',
          15: 'Total of all the slices is the rectangle sum',
        },
        java: {
          2: 'One running-total array per row, width n+1',
          4: 'Precompute once at construction time',
          6: 'Allocate the padded row prefixes',
          7: 'Walk every row',
          8: 'Walk every column of that row',
          9: 'Each slot is the previous slot plus the current cell',
          14: 'Answer a rectangle query',
          15: 'Accumulate one horizontal slice per row',
          16: 'Only the rows inside the rectangle matter',
          17: 'Slice sum = prefix at col2+1 minus prefix at col1',
          19: 'Total of all the slices is the rectangle sum',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Immutable 2D range-sum structure',
      2: 'Precompute the prefix table once at construction time',
      3: 'Matrix dimensions',
      4: 'Table padded with a zero row and zero column so edge cases vanish',
      5: 'Walk every row of the original matrix',
      6: 'Walk every column of that row',
      7: 'Start from the cell itself...',
      8: '...add the rectangle ending one row above...',
      9: '...add the rectangle ending one column left...',
      10: '...and subtract the overlap that got counted twice',
      12: 'Answer a rectangle query in constant time',
      13: 'Shorthand for the prefix table',
      14: 'Big rectangle minus the strip above it, minus the strip to its left...',
      15: '...plus the top-left corner that was subtracted twice',
    },
    javascript: {
      1: 'Immutable 2D range-sum structure',
      2: 'Precompute the prefix table once at construction time',
      3: 'Matrix dimensions',
      4: 'Table padded with a zero row and zero column so edge cases vanish',
      5: 'Walk every row of the original matrix',
      6: 'Walk every column of that row',
      7: 'Start from the cell itself...',
      8: '...add the rectangle ending one row above...',
      9: '...add the rectangle ending one column left...',
      10: '...and subtract the overlap that got counted twice',
      15: 'Answer a rectangle query in constant time',
      17: 'Big rectangle minus the strip above it, minus the strip to its left...',
      18: '...plus the top-left corner that was subtracted twice',
    },
    java: {
      2: 'The padded prefix table',
      4: 'Precompute the prefix table once at construction time',
      6: 'Allocate with an extra zero row and column',
      7: 'Walk every row of the original matrix',
      8: 'Walk every column of that row',
      9: 'Start from the cell itself...',
      10: '...add the rectangle ending one row above...',
      11: '...add the rectangle ending one column left...',
      12: '...and subtract the overlap that got counted twice',
      17: 'Answer a rectangle query in constant time',
      18: 'Big rectangle minus the strip above it, minus the strip to its left...',
      19: '...plus the top-left corner that was subtracted twice',
    },
  },
};
