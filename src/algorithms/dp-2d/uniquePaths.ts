import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface UniquePathsInput {
  m: number;
  n: number;
}

function runUniquePaths(input: unknown): AlgorithmStep[] {
  const { m, n } = input as UniquePathsInput;
  const steps: AlgorithmStep[] = [];

  // Create 2D DP table
  const dp2d: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  steps.push({
    state: { dp2d: dp2d.map(r => [...r]), matrixHighlights: [] as [number, number][], result: null, m, n },
    highlights: [],
    message: `Find number of unique paths in a ${m}x${n} grid (can only move right or down)`,
    codeLine: 1,
  });

  // Fill first row with 1s
  for (let j = 0; j < n; j++) {
    dp2d[0][j] = 1;
  }
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: Array.from({ length: n }, (_, j): [number, number] => [0, j]),
      result: null,
    },
    highlights: [],
    message: `First row: only one way to reach each cell (go right)`,
    codeLine: 3,
    action: 'insert',
  });

  // Fill first column with 1s
  for (let i = 0; i < m; i++) {
    dp2d[i][0] = 1;
  }
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: Array.from({ length: m }, (_, i): [number, number] => [i, 0]),
      result: null,
    },
    highlights: [],
    message: `First column: only one way to reach each cell (go down)`,
    codeLine: 5,
    action: 'insert',
  });

  // Fill rest of the table
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      const fromTop = dp2d[i - 1][j];
      const fromLeft = dp2d[i][j - 1];

      steps.push({
        state: {
          dp2d: dp2d.map(r => [...r]),
          matrixHighlights: [[i - 1, j], [i, j - 1]] as [number, number][],
          matrixSecondary: [[i, j]] as [number, number][],
          result: null,
        },
        highlights: [],
        pointers: { row: i, col: j },
        message: `dp[${i}][${j}] = dp[${i - 1}][${j}] + dp[${i}][${j - 1}] = ${fromTop} + ${fromLeft}`,
        codeLine: 7,
        action: 'compare',
      });

      dp2d[i][j] = fromTop + fromLeft;

      steps.push({
        state: {
          dp2d: dp2d.map(r => [...r]),
          matrixHighlights: [[i, j]] as [number, number][],
          result: null,
        },
        highlights: [],
        message: `dp[${i}][${j}] = ${dp2d[i][j]}`,
        codeLine: 7,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[m - 1, n - 1]] as [number, number][],
      result: dp2d[m - 1][n - 1],
    },
    highlights: [],
    message: `Number of unique paths: ${dp2d[m - 1][n - 1]}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runUniquePathsMathCombination(input: unknown): AlgorithmStep[] {
  const { m, n } = input as UniquePathsInput;
  const steps: AlgorithmStep[] = [];

  const total = m + n - 2;
  const k = Math.min(m - 1, n - 1);
  const chooseWhat = m - 1 <= n - 1 ? 'down-moves' : 'right-moves';
  const labels = Array.from({ length: k + 1 }, (_, i) => `i=${i}`);

  steps.push({
    state: { result: null, m, n },
    highlights: [],
    message: `Insight: EVERY path in a ${m}x${n} grid is exactly ${total} moves — ${m - 1} downs and ${n - 1} rights. A path is just a choice of where the downs go!`,
    codeLine: 1,
  });

  steps.push({
    state: { result: null, m, n },
    highlights: [],
    message: `So the answer is the binomial coefficient C(${total}, ${k}): choose which ${k} of the ${total} moves are ${chooseWhat}. No DP table needed.`,
    codeLine: 3,
  });

  const values: (number | null)[] = new Array(k + 1).fill(null);
  values[0] = 1;
  let res = 1;

  steps.push({
    state: { dp: [...values], dpLabels: labels, dpHighlights: [0], result: null },
    highlights: [],
    message: `Start res = 1 (C(${total - k}, 0) = 1) and multiply in one factor at a time to avoid huge factorials`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 1; i <= k; i++) {
    const numerator = total - k + i;
    res = (res * numerator) / i;
    values[i] = res;
    steps.push({
      state: { dp: [...values], dpLabels: labels, dpHighlights: [i], dpSecondary: [i - 1], result: null },
      highlights: [],
      pointers: { i },
      message: `i=${i}: res = res × ${numerator} / ${i} = ${res}. This is C(${numerator}, ${i}) — always an integer, so division is exact`,
      codeLine: 6,
      action: 'insert',
    });
  }

  steps.push({
    state: { dp: [...values], dpLabels: labels, dpHighlights: [k], result: res },
    highlights: [],
    message: `C(${total}, ${k}) = ${res} unique paths — computed in O(min(m, n)) time with O(1) extra space`,
    codeLine: 7,
    action: 'found',
  });

  return steps;
}

export const uniquePaths: Algorithm = {
  id: 'unique-paths',
  name: 'Unique Paths',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[r][c] = dp[r-1][c] + dp[r][c-1]',
  description:
    'There is a robot on an m x n grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time. How many possible unique paths are there?',
  problemUrl: 'https://leetcode.com/problems/unique-paths/',
  code: {
    python: `def uniquePaths(m, n):
    dp = [[0] * n for _ in range(m)]
    for j in range(n):
        dp[0][j] = 1
    for i in range(m):
        dp[i][0] = 1
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]`,
    javascript: `function uniquePaths(m, n) {
    const dp = Array.from({length: m},
        () => new Array(n).fill(0));
    for (let j = 0; j < n; j++) dp[0][j] = 1;
    for (let i = 0; i < m; i++) dp[i][0] = 1;
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }
    return dp[m-1][n-1];
}`,
    java: `public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    return dp[m - 1][n - 1];
}`,
  },
  defaultInput: { m: 3, n: 7 },
  run: runUniquePaths,
  optimalApproachName: '2-D DP Table',
  approaches: [
    {
      id: 'math-combination',
      name: 'Math Combination',
      timeComplexity: 'O(min(m, n))',
      spaceComplexity: 'O(1)',
      description:
        'Instead of filling a DP table, count directly: every path is m+n-2 moves, so the answer is the binomial coefficient C(m+n-2, m-1).',
      code: {
        python: `def uniquePaths(m, n):
    total = m + n - 2
    k = min(m - 1, n - 1)
    res = 1
    for i in range(1, k + 1):
        res = res * (total - k + i) // i
    return res`,
        javascript: `function uniquePaths(m, n) {
    const total = m + n - 2;
    const k = Math.min(m - 1, n - 1);
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (total - k + i) / i;
    }
    return res;
}`,
        java: `public int uniquePaths(int m, int n) {
    int total = m + n - 2;
    int k = Math.min(m - 1, n - 1);
    long res = 1;
    for (int i = 1; i <= k; i++) {
        res = res * (total - k + i) / i;
    }
    return (int) res;
}`,
      },
      run: runUniquePathsMathCombination,
      lineExplanations: {
        python: {
          1: 'Define function taking grid dimensions m and n',
          2: 'Every path makes exactly m+n-2 moves total',
          3: 'Choose the smaller count (downs or rights) for fewer iterations',
          4: 'Running product starts at C(total-k, 0) = 1',
          5: 'Multiply in one factor of the binomial coefficient at a time',
          6: 'res becomes C(total-k+i, i); division is always exact',
          7: 'Return C(m+n-2, k) — the number of unique paths',
        },
        javascript: {
          1: 'Define function taking grid dimensions m and n',
          2: 'Every path makes exactly m+n-2 moves total',
          3: 'Choose the smaller count (downs or rights) for fewer iterations',
          4: 'Running product starts at C(total-k, 0) = 1',
          5: 'Multiply in one factor of the binomial coefficient at a time',
          6: 'res becomes C(total-k+i, i); division is always exact',
          8: 'Return C(m+n-2, k) — the number of unique paths',
        },
        java: {
          1: 'Define method taking grid dimensions m and n',
          2: 'Every path makes exactly m+n-2 moves total',
          3: 'Choose the smaller count (downs or rights) for fewer iterations',
          4: 'Use long to avoid overflow in the running product',
          5: 'Multiply in one factor of the binomial coefficient at a time',
          6: 'res becomes C(total-k+i, i); division is always exact',
          8: 'Cast back to int and return the path count',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking grid dimensions m and n',
      2: 'Create m x n DP table filled with zeros',
      3: 'Fill first row: only one way to reach each cell',
      4: 'Set each cell in first row to 1',
      5: 'Fill first column: only one way going down',
      6: 'Set each cell in first column to 1',
      7: 'Iterate rows starting from second row',
      8: 'Iterate columns starting from second column',
      9: 'Sum paths from above and from the left',
      10: 'Return total unique paths to bottom-right',
    },
    javascript: {
      1: 'Define function taking grid dimensions m and n',
      2: 'Create m x n DP table filled with zeros',
      3: 'Continuation of array initialization',
      4: 'Fill first row with 1s (one way: go right)',
      5: 'Fill first column with 1s (one way: go down)',
      6: 'Iterate rows starting from second row',
      7: 'Iterate columns starting from second column',
      8: 'Sum paths from above and from the left',
      11: 'Return total unique paths to bottom-right',
    },
    java: {
      1: 'Define method taking grid dimensions m and n',
      2: 'Create m x n DP table initialized to 0',
      3: 'Fill first row with 1s (one way: go right)',
      4: 'Fill first column with 1s (one way: go down)',
      5: 'Iterate rows starting from second row',
      6: 'Iterate columns starting from second column',
      7: 'Sum paths from above and from the left',
      10: 'Return total unique paths to bottom-right',
    },
  },
};
