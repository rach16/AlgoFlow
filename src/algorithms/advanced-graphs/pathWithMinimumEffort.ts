import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MinEffortInput {
  heights: number[][];
}

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

function runPathWithMinimumEffort(input: unknown): AlgorithmStep[] {
  const { heights } = input as MinEffortInput;
  const steps: AlgorithmStep[] = [];
  const rows = heights.length;
  const cols = heights[0].length;

  const effort: number[][] = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  effort[0][0] = 0;

  const view = () =>
    effort.map(row => row.map(v => (v === Infinity ? '∞' : `${v}`))) as (number | string)[][];

  const settled: [number, number][] = [];

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      dp2d: view(),
      matrixHighlights: [],
      matrixSecondary: [[0, 0]],
      result: 'Minimizing the largest step on the path...',
    },
    highlights: [],
    message: `${rows}x${cols} grid. A route's "effort" is the LARGEST single height jump on it — not the sum. So run Dijkstra where a path's cost is a max, not a total.`,
    codeLine: 1,
  } as AlgorithmStep);

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      dp2d: view(),
      matrixHighlights: [],
      matrixSecondary: [[0, 0]],
      result: 'effort[0][0] = 0, everything else = ∞',
    },
    highlights: [],
    message: `effort[r][c] = the smallest possible "largest jump" needed to reach (r,c). Start cell costs 0; every other cell starts at ∞.`,
    codeLine: 4,
    action: 'visit',
  } as AlgorithmStep);

  // [effort, row, col]
  const heap: [number, number, number][] = [[0, 0, 0]];
  let answer = 0;

  while (heap.length > 0) {
    heap.sort((a, b) => a[0] - b[0]);
    const [e, r, c] = heap.shift()!;

    if (e > effort[r][c]) continue; // stale heap entry, skip silently

    settled.push([r, c]);

    if (r === rows - 1 && c === cols - 1) {
      answer = e;
      steps.push({
        state: {
          matrix: heights.map(row => [...row]),
          dp2d: view(),
          matrixHighlights: settled.map(p => [...p] as [number, number]),
          matrixSecondary: [[r, c]],
          result: `Minimum effort: ${answer}`,
        },
        highlights: [],
        message: `Popped the target (${r},${c}) with effort ${e}. Dijkstra pops in increasing order, so no cheaper route to the corner exists — answer = ${answer}.`,
        codeLine: 10,
        action: 'found',
      } as AlgorithmStep);
      break;
    }

    steps.push({
      state: {
        matrix: heights.map(row => [...row]),
        dp2d: view(),
        matrixHighlights: settled.map(p => [...p] as [number, number]),
        matrixSecondary: [[r, c]],
        result: `Settled (${r},${c}) at effort ${e}`,
      },
      highlights: [],
      message: `Pop the cheapest frontier cell: (${r},${c}), height ${heights[r][c]}, effort ${e}. Its value is final — relax its 4 neighbors.`,
      codeLine: 8,
      action: 'visit',
    } as AlgorithmStep);

    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const diff = Math.abs(heights[nr][nc] - heights[r][c]);
      const nxt = Math.max(e, diff);

      if (nxt < effort[nr][nc]) {
        const before = effort[nr][nc];
        effort[nr][nc] = nxt;
        heap.push([nxt, nr, nc]);

        steps.push({
          state: {
            matrix: heights.map(row => [...row]),
            dp2d: view(),
            matrixHighlights: settled.map(p => [...p] as [number, number]),
            matrixSecondary: [[nr, nc]],
            result: `effort[${nr}][${nc}] = ${nxt}`,
          },
          highlights: [],
          message: `Step (${r},${c})→(${nr},${nc}): |${heights[nr][nc]} - ${heights[r][c]}| = ${diff}. Path effort = max(${e}, ${diff}) = ${nxt} < ${before === Infinity ? '∞' : before}, so improve it.`,
          codeLine: 19,
          action: 'insert',
        } as AlgorithmStep);
      }
    }
  }

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      dp2d: view(),
      matrixHighlights: settled.map(p => [...p] as [number, number]),
      matrixSecondary: [[rows - 1, cols - 1]],
      result: `Answer: ${answer}`,
    },
    highlights: [],
    message: `Done! The best route from (0,0) to (${rows - 1},${cols - 1}) never has to climb more than ${answer} in one step.`,
    codeLine: 10,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runPathWithMinimumEffortBinarySearch(input: unknown): AlgorithmStep[] {
  const { heights } = input as MinEffortInput;
  const steps: AlgorithmStep[] = [];
  const rows = heights.length;
  const cols = heights[0].length;
  const MAX_STEPS = 60;

  const emit = (step: AlgorithmStep) => {
    if (steps.length < MAX_STEPS) steps.push(step);
  };

  let hi = 0;
  for (const row of heights) for (const h of row) hi = Math.max(hi, h);
  let lo = 0;

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Binary searching effort in [0, ${hi}]`,
    },
    highlights: [],
    message: `"Can I cross using only steps ≤ t?" is monotonic — if t works, t+1 works too. So binary search t and answer each guess with a plain BFS.`,
    codeLine: 1,
  } as AlgorithmStep);

  const canReach = (limit: number): boolean => {
    const seen: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
    seen[0][0] = true;
    const queue: [number, number][] = [[0, 0]];
    const reached: [number, number][] = [[0, 0]];

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;

      if (r === rows - 1 && c === cols - 1) {
        emit({
          state: {
            matrix: heights.map(row => [...row]),
            matrixHighlights: reached.map(p => [...p] as [number, number]),
            matrixSecondary: [[r, c]],
            result: `t = ${limit}: reachable ✓`,
          },
          highlights: [],
          message: `BFS reached the bottom-right corner with every step ≤ ${limit}. So t = ${limit} is feasible.`,
          codeLine: 10,
          action: 'found',
        } as AlgorithmStep);
        return true;
      }

      const opened: string[] = [];
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
        if (Math.abs(heights[nr][nc] - heights[r][c]) <= limit) {
          seen[nr][nc] = true;
          queue.push([nr, nc]);
          reached.push([nr, nc]);
          opened.push(`(${nr},${nc})`);
        }
      }

      emit({
        state: {
          matrix: heights.map(row => [...row]),
          matrixHighlights: reached.map(p => [...p] as [number, number]),
          matrixSecondary: [[r, c]],
          result: `t = ${limit}: ${reached.length} cell(s) reachable`,
        },
        highlights: [],
        message:
          opened.length > 0
            ? `From (${r},${c}) height ${heights[r][c]}, steps within ${limit} open up ${opened.join(', ')}.`
            : `From (${r},${c}) height ${heights[r][c]}, every unvisited neighbor is a jump bigger than ${limit} — dead end.`,
        codeLine: 14,
        action: opened.length > 0 ? 'insert' : 'compare',
      } as AlgorithmStep);
    }

    emit({
      state: {
        matrix: heights.map(row => [...row]),
        matrixHighlights: reached.map(p => [...p] as [number, number]),
        matrixSecondary: [],
        result: `t = ${limit}: NOT reachable ✗`,
      },
      highlights: [],
      message: `BFS ran out of cells without touching the corner — t = ${limit} is too small.`,
      codeLine: 17,
      action: 'compare',
    } as AlgorithmStep);
    return false;
  };

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    emit({
      state: {
        matrix: heights.map(row => [...row]),
        matrixHighlights: [],
        matrixSecondary: [],
        result: `lo = ${lo}, hi = ${hi}, testing t = ${mid}`,
      },
      highlights: [],
      message: `Search window [${lo}, ${hi}] — try t = ${mid}. Run BFS using only steps of size ≤ ${mid}.`,
      codeLine: 21,
      action: 'compare',
    } as AlgorithmStep);

    if (canReach(mid)) {
      hi = mid;
      emit({
        state: {
          matrix: heights.map(row => [...row]),
          matrixHighlights: [],
          matrixSecondary: [],
          result: `lo = ${lo}, hi = ${hi}`,
        },
        highlights: [],
        message: `t = ${mid} works, so the answer is ≤ ${mid}. Shrink to [${lo}, ${hi}] and keep hunting for something smaller.`,
        codeLine: 23,
      } as AlgorithmStep);
    } else {
      lo = mid + 1;
      emit({
        state: {
          matrix: heights.map(row => [...row]),
          matrixHighlights: [],
          matrixSecondary: [],
          result: `lo = ${lo}, hi = ${hi}`,
        },
        highlights: [],
        message: `t = ${mid} fails, so the answer must exceed ${mid}. Shrink to [${lo}, ${hi}].`,
        codeLine: 25,
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      matrix: heights.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Answer: ${lo}`,
    },
    highlights: [],
    message: `lo == hi == ${lo} — the smallest feasible effort. Minimum effort = ${lo}.`,
    codeLine: 26,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const pathWithMinimumEffort: Algorithm = {
  id: 'path-with-minimum-effort',
  name: 'Path With Minimum Effort',
  category: 'Advanced Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(R·C log(R·C))',
  spaceComplexity: 'O(R·C)',
  pattern: 'Modified Dijkstra — min heap, path cost = max edge difference',
  description:
    'You are given a rows x columns grid of heights. Starting at the top-left cell you want to travel to the bottom-right cell, moving up, down, left or right. A route\'s effort is the maximum absolute difference in heights between two consecutive cells of the route. Return the minimum effort required to travel from the top-left cell to the bottom-right cell.',
  problemUrl: 'https://leetcode.com/problems/path-with-minimum-effort/',
  code: {
    python: `def minimumEffortPath(heights):
    rows, cols = len(heights), len(heights[0])
    effort = [[float('inf')] * cols for _ in range(rows)]
    effort[0][0] = 0
    heap = [(0, 0, 0)]

    while heap:
        e, r, c = heapq.heappop(heap)
        if (r, c) == (rows - 1, cols - 1):
            return e
        if e > effort[r][c]:
            continue
        for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                diff = abs(heights[nr][nc] - heights[r][c])
                nxt = max(e, diff)
                if nxt < effort[nr][nc]:
                    effort[nr][nc] = nxt
                    heapq.heappush(heap, (nxt, nr, nc))
    return 0`,
    javascript: `function minimumEffortPath(heights) {
    const rows = heights.length, cols = heights[0].length;
    const effort = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    effort[0][0] = 0;
    const heap = [[0, 0, 0]]; // [effort, row, col]

    while (heap.length) {
        heap.sort((a, b) => a[0] - b[0]);
        const [e, r, c] = heap.shift();
        if (r === rows - 1 && c === cols - 1) return e;
        if (e > effort[r][c]) continue;
        for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            const diff = Math.abs(heights[nr][nc] - heights[r][c]);
            const nxt = Math.max(e, diff);
            if (nxt < effort[nr][nc]) {
                effort[nr][nc] = nxt;
                heap.push([nxt, nr, nc]);
            }
        }
    }
    return 0;
}`,
    java: `public static int minimumEffortPath(int[][] heights) {
    int rows = heights.length, cols = heights[0].length;
    int[][] effort = new int[rows][cols];
    for (int[] row : effort) Arrays.fill(row, Integer.MAX_VALUE);
    effort[0][0] = 0;

    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    heap.offer(new int[]{0, 0, 0});
    int[][] dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

    while (!heap.isEmpty()) {
        int[] cur = heap.poll();
        int e = cur[0], r = cur[1], c = cur[2];
        if (r == rows - 1 && c == cols - 1) return e;
        if (e > effort[r][c]) continue;
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            int diff = Math.abs(heights[nr][nc] - heights[r][c]);
            int nxt = Math.max(e, diff);
            if (nxt < effort[nr][nc]) {
                effort[nr][nc] = nxt;
                heap.offer(new int[]{nxt, nr, nc});
            }
        }
    }
    return 0;
}`,
  },
  defaultInput: { heights: [[1, 2, 2], [3, 8, 2], [5, 3, 5]] },
  run: runPathWithMinimumEffort,
  optimalApproachName: 'Dijkstra (min-max path)',
  approaches: [
    {
      id: 'binary-search-bfs',
      name: 'Binary Search + BFS',
      timeComplexity: 'O(R·C·log(maxHeight))',
      spaceComplexity: 'O(R·C)',
      description:
        'Instead of computing the best effort directly, guess it: feasibility is monotonic in t, so binary search t and let a plain BFS that only walks steps of size ≤ t answer "is t enough?".',
      code: {
        python: `def minimumEffortPath(heights):
    rows, cols = len(heights), len(heights[0])

    def canReach(limit):
        seen = {(0, 0)}
        queue = deque([(0, 0)])
        while queue:
            r, c = queue.popleft()
            if (r, c) == (rows - 1, cols - 1):
                return True
            for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen:
                    if abs(heights[nr][nc] - heights[r][c]) <= limit:
                        seen.add((nr, nc))
                        queue.append((nr, nc))
        return False

    lo, hi = 0, max(max(row) for row in heights)
    while lo < hi:
        mid = (lo + hi) // 2
        if canReach(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        javascript: `function minimumEffortPath(heights) {
    const rows = heights.length, cols = heights[0].length;

    const canReach = (limit) => {
        const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
        const queue = [[0, 0]];
        seen[0][0] = true;
        while (queue.length) {
            const [r, c] = queue.shift();
            if (r === rows - 1 && c === cols - 1) return true;
            for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
                if (Math.abs(heights[nr][nc] - heights[r][c]) <= limit) {
                    seen[nr][nc] = true;
                    queue.push([nr, nc]);
                }
            }
        }
        return false;
    };

    let lo = 0, hi = Math.max(...heights.flat());
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (canReach(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        java: `public static int minimumEffortPath(int[][] heights) {
    int lo = 0, hi = 0;
    for (int[] row : heights)
        for (int h : row) hi = Math.max(hi, h);

    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (canReach(heights, mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

private static boolean canReach(int[][] heights, int limit) {
    int rows = heights.length, cols = heights[0].length;
    boolean[][] seen = new boolean[rows][cols];
    Deque<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[]{0, 0});
    seen[0][0] = true;
    int[][] dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

    while (!queue.isEmpty()) {
        int[] cur = queue.poll();
        int r = cur[0], c = cur[1];
        if (r == rows - 1 && c == cols - 1) return true;
        for (int[] d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) continue;
            if (Math.abs(heights[nr][nc] - heights[r][c]) <= limit) {
                seen[nr][nc] = true;
                queue.offer(new int[]{nr, nc});
            }
        }
    }
    return false;
}`,
      },
      run: runPathWithMinimumEffortBinarySearch,
      lineExplanations: {
        python: {
          1: 'Define function taking the height grid',
          2: 'Grid dimensions',
          4: 'Feasibility check: can we cross using only steps ≤ limit?',
          5: 'Visited set seeded with the start cell',
          6: 'BFS queue starting at the top-left',
          7: 'Standard BFS loop',
          8: 'Dequeue the next reachable cell',
          9: 'Did we make it to the bottom-right?',
          10: 'Yes — this limit is feasible',
          11: 'Try all four neighbors',
          12: 'Neighbor coordinates',
          13: 'Stay in bounds and skip already-seen cells',
          14: 'Only walk edges whose height jump fits the limit',
          15: 'Mark the neighbor visited',
          16: 'Queue it for later expansion',
          17: 'Exhausted the component without reaching the target',
          19: 'Answer lies between 0 and the largest height',
          20: 'Binary search for the smallest feasible limit',
          21: 'Midpoint guess',
          22: 'Is this guess enough?',
          23: 'Feasible — the answer is at most mid',
          24: 'Not feasible',
          25: 'Answer must be strictly larger than mid',
          26: 'lo == hi is the minimum feasible effort',
        },
        javascript: {
          1: 'Define function taking the height grid',
          2: 'Grid dimensions',
          4: 'Feasibility check for a given step limit',
          5: 'Visited grid',
          6: 'BFS queue starting at the top-left',
          7: 'Mark the start visited',
          8: 'Standard BFS loop',
          9: 'Dequeue the next reachable cell',
          10: 'Reached the bottom-right — limit works',
          11: 'Try all four neighbors',
          12: 'Neighbor coordinates',
          13: 'Skip out-of-bounds and visited cells',
          14: 'Only walk edges whose height jump fits the limit',
          15: 'Mark the neighbor visited',
          16: 'Queue it for later expansion',
          20: 'Never reached the target — limit too small',
          23: 'Answer lies between 0 and the largest height',
          24: 'Binary search for the smallest feasible limit',
          25: 'Midpoint guess',
          26: 'Feasible — the answer is at most mid',
          27: 'Infeasible — answer must exceed mid',
          29: 'lo == hi is the minimum feasible effort',
        },
        java: {
          1: 'Define method taking the height grid',
          2: 'Search window for the effort value',
          3: 'Scan every row',
          4: 'Largest height is a safe upper bound',
          6: 'Binary search for the smallest feasible limit',
          7: 'Midpoint guess',
          8: 'Feasible — the answer is at most mid',
          9: 'Infeasible — answer must exceed mid',
          11: 'lo == hi is the minimum feasible effort',
          14: 'BFS feasibility check for a given step limit',
          15: 'Grid dimensions',
          16: 'Visited grid',
          17: 'BFS queue',
          18: 'Seed the queue with the start cell',
          19: 'Mark the start visited',
          20: 'Four-directional moves',
          22: 'Standard BFS loop',
          23: 'Dequeue the next reachable cell',
          24: 'Unpack row and column',
          25: 'Reached the bottom-right — limit works',
          26: 'Try all four neighbors',
          27: 'Neighbor coordinates',
          28: 'Skip out-of-bounds and visited cells',
          29: 'Only walk edges whose height jump fits the limit',
          30: 'Mark the neighbor visited',
          31: 'Queue it for later expansion',
          35: 'Never reached the target — limit too small',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the height grid',
      2: 'Grid dimensions',
      3: 'effort[r][c] = best "largest jump" needed to reach (r,c)',
      4: 'The start cell costs nothing',
      5: 'Min-heap of (effort, row, col)',
      7: 'Dijkstra main loop',
      8: 'Pop the frontier cell with the smallest effort',
      9: 'Is this the bottom-right corner?',
      10: 'First pop of the target is optimal — return it',
      11: 'Stale heap entry (a better value was recorded later)',
      12: 'Skip it',
      13: 'Try all four neighbors',
      14: 'Neighbor coordinates',
      15: 'Stay inside the grid',
      16: 'Cost of this single step',
      17: 'Path cost is a MAX, not a sum — this is the key twist',
      18: 'Only keep it if it beats the recorded effort',
      19: 'Record the improved effort',
      20: 'Push the neighbor back onto the heap',
      21: 'Single-cell grid needs no effort',
    },
    javascript: {
      1: 'Define function taking the height grid',
      2: 'Grid dimensions',
      3: 'effort[r][c] = best "largest jump" needed to reach (r,c)',
      4: 'The start cell costs nothing',
      5: 'Min-heap of [effort, row, col]',
      7: 'Dijkstra main loop',
      8: 'Sort to emulate a priority queue',
      9: 'Pop the frontier cell with the smallest effort',
      10: 'First pop of the target is optimal — return it',
      11: 'Skip stale heap entries',
      12: 'Try all four neighbors',
      13: 'Neighbor coordinates',
      14: 'Stay inside the grid',
      15: 'Cost of this single step',
      16: 'Path cost is a MAX, not a sum — the key twist',
      17: 'Only keep it if it beats the recorded effort',
      18: 'Record the improved effort',
      19: 'Push the neighbor back onto the heap',
      23: 'Single-cell grid needs no effort',
    },
    java: {
      1: 'Define method taking the height grid',
      2: 'Grid dimensions',
      3: 'effort[r][c] = best "largest jump" needed to reach (r,c)',
      4: 'Initialize every cell to infinity',
      5: 'The start cell costs nothing',
      7: 'Min-heap ordered by effort',
      8: 'Seed it with the start cell',
      9: 'Four-directional moves',
      11: 'Dijkstra main loop',
      12: 'Pop the smallest-effort entry',
      13: 'Unpack effort, row, column',
      14: 'First pop of the target is optimal — return it',
      15: 'Skip stale heap entries',
      16: 'Try all four neighbors',
      17: 'Neighbor coordinates',
      18: 'Stay inside the grid',
      19: 'Cost of this single step',
      20: 'Path cost is a MAX, not a sum — the key twist',
      21: 'Only keep it if it beats the recorded effort',
      22: 'Record the improved effort',
      23: 'Push the neighbor back onto the heap',
      27: 'Single-cell grid needs no effort',
    },
  },
};
