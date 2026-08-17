import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface QNode {
  val: 0 | 1;
  isLeaf: boolean;
  children: QNode[]; // [topLeft, topRight, bottomLeft, bottomRight] or []
}

const leaf = (v: 0 | 1): QNode => ({ val: v, isLeaf: true, children: [] });
const internal = (children: QNode[]): QNode => ({ val: 1, isLeaf: false, children });

/** LeetCode's serialization: level-order list of [isLeaf, val] pairs. */
function serializeQuad(root: QNode | null): number[][] {
  if (!root) return [];
  const out: number[][] = [];
  const queue: QNode[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    out.push([node.isLeaf ? 1 : 0, node.val]);
    for (const c of node.children) queue.push(c);
  }
  return out;
}

function quadrantCells(r: number, c: number, n: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = r; i < r + n; i++) {
    for (let j = c; j < c + n; j++) cells.push([i, j]);
  }
  return cells;
}

const cornerName = (r: number, c: number, n: number): string => `(${r},${c}) size ${n}x${n}`;

function runConstructQuadTree(input: unknown): AlgorithmStep[] {
  const grid = input as number[][];
  const steps: AlgorithmStep[] = [];
  const built: string[] = [];

  function emit(
    message: string,
    codeLine: number,
    cells: [number, number][] = [],
    action?: AlgorithmStep['action'],
    extra: Record<string, unknown> = {},
  ): void {
    const state: Record<string, unknown> = {
      matrix: grid.map(row => row.slice()),
      stack: [...built],
      ...extra,
    };
    if (cells.length) state.matrixHighlights = cells;
    steps.push({ state, highlights: [], message, codeLine, ...(action ? { action } : {}) });
  }

  emit(
    'A quad tree stores a square grid by repeatedly asking one question: is this square all-same? If yes it collapses into a single leaf; if not it splits into four quadrants and asks again.',
    1,
  );

  function build(r: number, c: number, n: number): QNode {
    const cells = quadrantCells(r, c, n);
    const first = grid[r][c];
    let uniform = true;
    for (const [i, j] of cells) {
      if (grid[i][j] !== first) uniform = false;
    }

    emit(`Examine quadrant ${cornerName(r, c, n)} — scan all ${n * n} cells and compare them to the top-left value ${first}`, 3, cells, 'visit');

    if (uniform) {
      built.push(`leaf ${first} @${cornerName(r, c, n)}`);
      emit(`Every cell is ${first} → collapse this whole ${n}x${n} block into ONE leaf node with val=${first}`, 10, cells, 'insert');
      return leaf(first as 0 | 1);
    }

    emit(`Mixed 0s and 1s → this cannot be a leaf. Split ${cornerName(r, c, n)} into four ${n / 2}x${n / 2} quadrants and recurse.`, 12, cells, 'push');

    const half = n / 2;
    const topLeft = build(r, c, half);
    const topRight = build(r, c + half, half);
    const bottomLeft = build(r + half, c, half);
    const bottomRight = build(r + half, c + half, half);

    built.push(`internal @${cornerName(r, c, n)}`);
    emit(`All four quadrants of ${cornerName(r, c, n)} are done — wrap them in an internal node (isLeaf = false)`, 12, cells, 'insert');

    return internal([topLeft, topRight, bottomLeft, bottomRight]);
  }

  const root = build(0, 0, grid.length);
  const serialized = serializeQuad(root);

  emit(
    `Quad tree complete: ${serialized.length} nodes, serialized level-order as [isLeaf, val] pairs`,
    17,
    [],
    'found',
    { result: serialized },
  );

  return steps;
}

function runConstructQuadTreePrefixSum(input: unknown): AlgorithmStep[] {
  const grid = input as number[][];
  const steps: AlgorithmStep[] = [];
  const n = grid.length;
  const built: string[] = [];

  const pre: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(n + 1).fill(0));

  function emit(
    message: string,
    codeLine: number,
    cells: [number, number][] = [],
    action?: AlgorithmStep['action'],
    extra: Record<string, unknown> = {},
  ): void {
    const state: Record<string, unknown> = {
      matrix: grid.map(row => row.slice()),
      stack: [...built],
      ...extra,
    };
    if (cells.length) state.matrixHighlights = cells;
    steps.push({ state, highlights: [], message, codeLine, ...(action ? { action } : {}) });
  }

  emit(
    'The recursive scan re-reads the same cells at every level (O(n^2 log n) total). A 2-D prefix-sum table lets us test any square for uniformity in O(1) instead.',
    1,
  );

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      pre[i + 1][j + 1] = grid[i][j] + pre[i][j + 1] + pre[i + 1][j] - pre[i][j];
    }
  }

  emit(
    `Build the (n+1)x(n+1) prefix table once: pre[i+1][j+1] holds the sum of the whole rectangle from (0,0) to (i,j). Total 1s in the grid = ${pre[n][n]}.`,
    6,
    [],
    'insert',
    { dp2d: pre.map(row => row.slice()) },
  );

  const total = (r: number, c: number, k: number): number =>
    pre[r + k][c + k] - pre[r][c + k] - pre[r + k][c] + pre[r][c];

  emit(
    'Now any k x k square sums in O(1) with four lookups: bottom-right − top strip − left strip + the double-subtracted corner.',
    8,
    [],
    undefined,
    { dp2d: pre.map(row => row.slice()) },
  );

  function build(r: number, c: number, k: number): QNode {
    const cells = quadrantCells(r, c, k);
    const s = total(r, c, k);

    emit(`Quadrant ${cornerName(r, c, k)}: sum = ${s} out of ${k * k} cells — one subtraction, no scanning`, 10, cells, 'compare');

    if (s === 0) {
      built.push(`leaf 0 @${cornerName(r, c, k)}`);
      emit(`sum == 0 → every cell is 0 → leaf with val=0`, 12, cells, 'insert');
      return leaf(0);
    }
    if (s === k * k) {
      built.push(`leaf 1 @${cornerName(r, c, k)}`);
      emit(`sum == ${k}x${k} = ${k * k} → every cell is 1 → leaf with val=1`, 14, cells, 'insert');
      return leaf(1);
    }

    emit(`0 < ${s} < ${k * k} → the square is mixed, so split into four ${k / 2}x${k / 2} quadrants`, 16, cells, 'push');

    const h = k / 2;
    const topLeft = build(r, c, h);
    const topRight = build(r, c + h, h);
    const bottomLeft = build(r + h, c, h);
    const bottomRight = build(r + h, c + h, h);

    built.push(`internal @${cornerName(r, c, k)}`);
    emit(`Four children of ${cornerName(r, c, k)} are built — wrap them in an internal node`, 16, cells, 'insert');

    return internal([topLeft, topRight, bottomLeft, bottomRight]);
  }

  const root = build(0, 0, n);
  const serialized = serializeQuad(root);

  emit(
    `Same quad tree, ${serialized.length} nodes — but every uniformity test was O(1) instead of O(k^2)`,
    21,
    [],
    'found',
    { result: serialized },
  );

  return steps;
}

export const constructQuadTree: Algorithm = {
  id: 'construct-quad-tree',
  name: 'Construct Quad Tree',
  category: 'Trees',
  difficulty: 'Medium',
  timeComplexity: 'O(n^2 log n)',
  spaceComplexity: 'O(log n)',
  pattern: 'Divide & Conquer — split the grid into four quadrants until uniform',
  description:
    'Given an n x n binary matrix (n is a power of 2), build the quad tree that represents it. A node is a leaf when its whole square holds a single value; otherwise it splits into four equal quadrants.',
  problemUrl: 'https://leetcode.com/problems/construct-quad-tree/',
  code: {
    python: `def construct(grid):
    def build(r, c, n):
        first = grid[r][c]
        uniform = True
        for i in range(r, r + n):
            for j in range(c, c + n):
                if grid[i][j] != first:
                    uniform = False
        if uniform:
            return Node(first == 1, True)
        half = n // 2
        return Node(True, False,
                    build(r, c, half),
                    build(r, c + half, half),
                    build(r + half, c, half),
                    build(r + half, c + half, half))
    return build(0, 0, len(grid))`,
    javascript: `function construct(grid) {
    function build(r, c, n) {
        const first = grid[r][c];
        let uniform = true;
        for (let i = r; i < r + n; i++) {
            for (let j = c; j < c + n; j++) {
                if (grid[i][j] !== first) uniform = false;
            }
        }
        if (uniform) return new Node(first === 1, true);
        const half = n / 2;
        return new Node(true, false,
            build(r, c, half),
            build(r, c + half, half),
            build(r + half, c, half),
            build(r + half, c + half, half));
    }
    return build(0, 0, grid.length);
}`,
    java: `public static Node construct(int[][] grid) {
    return build(grid, 0, 0, grid.length);
}

private static Node build(int[][] grid, int r, int c, int n) {
    int first = grid[r][c];
    boolean uniform = true;
    for (int i = r; i < r + n; i++) {
        for (int j = c; j < c + n; j++) {
            if (grid[i][j] != first) uniform = false;
        }
    }
    if (uniform) return new Node(first == 1, true);
    int half = n / 2;
    return new Node(true, false,
        build(grid, r, c, half),
        build(grid, r, c + half, half),
        build(grid, r + half, c, half),
        build(grid, r + half, c + half, half));
}`,
  },
  defaultInput: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 1, 0],
    [1, 1, 0, 1],
  ],
  run: runConstructQuadTree,
  optimalApproachName: 'Recursive Quadrant Split',
  approaches: [
    {
      id: 'prefix-sum-uniformity',
      name: 'Prefix Sum Uniformity',
      timeComplexity: 'O(n^2)',
      spaceComplexity: 'O(n^2)',
      description:
        'Precompute a 2-D prefix-sum table so each square\'s uniformity test is four array lookups instead of a full O(k^2) scan — trading O(n^2) memory for a log factor of time.',
      code: {
        python: `def construct(grid):
    n = len(grid)
    pre = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n):
        for j in range(n):
            pre[i + 1][j + 1] = grid[i][j] + pre[i][j + 1] + pre[i + 1][j] - pre[i][j]
    def total(r, c, k):
        return pre[r + k][c + k] - pre[r][c + k] - pre[r + k][c] + pre[r][c]
    def build(r, c, k):
        s = total(r, c, k)
        if s == 0:
            return Node(False, True)
        if s == k * k:
            return Node(True, True)
        h = k // 2
        return Node(True, False,
                    build(r, c, h),
                    build(r, c + h, h),
                    build(r + h, c, h),
                    build(r + h, c + h, h))
    return build(0, 0, n)`,
        javascript: `function construct(grid) {
    const n = grid.length;
    const pre = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            pre[i + 1][j + 1] = grid[i][j] + pre[i][j + 1] + pre[i + 1][j] - pre[i][j];
        }
    }
    const total = (r, c, k) => pre[r + k][c + k] - pre[r][c + k] - pre[r + k][c] + pre[r][c];
    function build(r, c, k) {
        const s = total(r, c, k);
        if (s === 0) return new Node(false, true);
        if (s === k * k) return new Node(true, true);
        const h = k / 2;
        return new Node(true, false,
            build(r, c, h),
            build(r, c + h, h),
            build(r + h, c, h),
            build(r + h, c + h, h));
    }
    return build(0, 0, n);
}`,
        java: `public static Node construct(int[][] grid) {
    int n = grid.length;
    int[][] pre = new int[n + 1][n + 1];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            pre[i + 1][j + 1] = grid[i][j] + pre[i][j + 1] + pre[i + 1][j] - pre[i][j];
        }
    }
    return build(pre, 0, 0, n);
}

private static Node build(int[][] pre, int r, int c, int k) {
    int s = pre[r + k][c + k] - pre[r][c + k] - pre[r + k][c] + pre[r][c];
    if (s == 0) return new Node(false, true);
    if (s == k * k) return new Node(true, true);
    int h = k / 2;
    return new Node(true, false,
        build(pre, r, c, h),
        build(pre, r, c + h, h),
        build(pre, r + h, c, h),
        build(pre, r + h, c + h, h));
}`,
      },
      run: runConstructQuadTreePrefixSum,
      lineExplanations: {
        python: {
          1: 'Build the quad tree for the grid',
          2: 'Side length of the square grid',
          3: 'Prefix table padded with a zero row and column',
          4: 'Walk every row',
          5: 'Walk every column',
          6: 'Inclusion-exclusion: add both strips, subtract the overlap',
          7: 'Sum of the k x k square anchored at (r, c)',
          8: 'Four lookups — O(1) regardless of k',
          9: 'Recurse on the square at (r, c) with side k',
          10: 'One O(1) query replaces the whole scan',
          11: 'No 1s at all in this square',
          12: 'Collapse into a leaf holding 0',
          13: 'Every cell is a 1',
          14: 'Collapse into a leaf holding 1',
          15: 'Mixed square — halve the side',
          16: 'Internal node wrapping the four quadrants',
          17: 'Top-left quadrant',
          18: 'Top-right quadrant',
          19: 'Bottom-left quadrant',
          20: 'Bottom-right quadrant',
          21: 'Start from the whole grid',
        },
        javascript: {
          1: 'Build the quad tree for the grid',
          2: 'Side length of the square grid',
          3: 'Prefix table padded with a zero row and column',
          4: 'Walk every row',
          5: 'Walk every column',
          6: 'Inclusion-exclusion: add both strips, subtract the overlap',
          9: 'Sum any k x k square with four lookups — O(1)',
          10: 'Recurse on the square at (r, c) with side k',
          11: 'One O(1) query replaces the whole scan',
          12: 'No 1s at all — leaf holding 0',
          13: 'All 1s — leaf holding 1',
          14: 'Mixed square — halve the side',
          15: 'Internal node wrapping the four quadrants',
          16: 'Top-left quadrant',
          17: 'Top-right quadrant',
          18: 'Bottom-left quadrant',
          19: 'Bottom-right quadrant',
          21: 'Start from the whole grid',
        },
        java: {
          1: 'Build the quad tree for the grid',
          2: 'Side length of the square grid',
          3: 'Prefix table padded with a zero row and column',
          4: 'Walk every row',
          5: 'Walk every column',
          6: 'Inclusion-exclusion: add both strips, subtract the overlap',
          9: 'Recurse starting from the whole grid',
          12: 'Recurse on the square at (r, c) with side k',
          13: 'One O(1) query replaces the whole scan',
          14: 'No 1s at all — leaf holding 0',
          15: 'All 1s — leaf holding 1',
          16: 'Mixed square — halve the side',
          17: 'Internal node wrapping the four quadrants',
          18: 'Top-left quadrant',
          19: 'Top-right quadrant',
          20: 'Bottom-left quadrant',
          21: 'Bottom-right quadrant',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Build the quad tree for the grid',
      2: 'Recurse on the n x n square anchored at (r, c)',
      3: 'Compare everything against the top-left cell',
      4: 'Assume the square is uniform until proven otherwise',
      5: 'Scan every row of the square',
      6: 'Scan every column of the square',
      7: 'A single mismatch is enough',
      8: 'Mark the square as mixed',
      9: 'Whole square holds one value?',
      10: 'Collapse it into a single leaf node',
      11: 'Otherwise halve the side length',
      12: 'Internal node: isLeaf = False',
      13: 'Top-left quadrant',
      14: 'Top-right quadrant',
      15: 'Bottom-left quadrant',
      16: 'Bottom-right quadrant',
      17: 'Start from the whole grid',
    },
    javascript: {
      1: 'Build the quad tree for the grid',
      2: 'Recurse on the n x n square anchored at (r, c)',
      3: 'Compare everything against the top-left cell',
      4: 'Assume the square is uniform until proven otherwise',
      5: 'Scan every row of the square',
      6: 'Scan every column of the square',
      7: 'A single mismatch marks the square as mixed',
      10: 'Uniform square collapses into a single leaf node',
      11: 'Otherwise halve the side length',
      12: 'Internal node: isLeaf = false',
      13: 'Top-left quadrant',
      14: 'Top-right quadrant',
      15: 'Bottom-left quadrant',
      16: 'Bottom-right quadrant',
      18: 'Start from the whole grid',
    },
    java: {
      1: 'Build the quad tree for the grid',
      2: 'Start from the whole grid',
      5: 'Recurse on the n x n square anchored at (r, c)',
      6: 'Compare everything against the top-left cell',
      7: 'Assume the square is uniform until proven otherwise',
      8: 'Scan every row of the square',
      9: 'Scan every column of the square',
      10: 'A single mismatch marks the square as mixed',
      13: 'Uniform square collapses into a single leaf node',
      14: 'Otherwise halve the side length',
      15: 'Internal node: isLeaf = false',
      16: 'Top-left quadrant',
      17: 'Top-right quadrant',
      18: 'Bottom-left quadrant',
      19: 'Bottom-right quadrant',
    },
  },
};
