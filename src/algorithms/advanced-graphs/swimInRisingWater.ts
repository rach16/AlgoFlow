import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runSwimInRisingWater(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const n = grid.length;

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Finding minimum time to swim from (0,0) to (n-1,n-1)...',
    },
    highlights: [],
    message: `${n}x${n} grid. Find minimum time t so we can swim from top-left to bottom-right.`,
    codeLine: 1,
  } as AlgorithmStep);

  // Modified Dijkstra / BFS with priority queue
  const visited: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  // Min-heap: [maxElevation, row, col]
  const pq: [number, number, number][] = [[grid[0][0], 0, 0]];
  visited[0][0] = true;

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [[0, 0]],
      matrixSecondary: [],
      result: 'Starting from (0,0)...',
    },
    highlights: [],
    message: `Start at (0,0) with elevation ${grid[0][0]}. Use modified Dijkstra to minimize max elevation.`,
    codeLine: 3,
    action: 'visit',
  } as AlgorithmStep);

  let answer = 0;
  const path: [number, number][] = [[0, 0]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [maxElev, r, c] = pq.shift()!;

    steps.push({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: path.map(p => [...p] as [number, number]),
        matrixSecondary: [[r, c]],
        result: `Current max elevation: ${maxElev}`,
      },
      highlights: [],
      message: `Process cell (${r},${c}) with max elevation so far = ${maxElev}.`,
      codeLine: 5,
      action: 'visit',
    } as AlgorithmStep);

    if (r === n - 1 && c === n - 1) {
      answer = maxElev;

      steps.push({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: path.map(p => [...p] as [number, number]),
          matrixSecondary: [[r, c]],
          result: `Minimum time: ${answer}`,
        },
        highlights: [],
        message: `Reached (${n - 1},${n - 1})! Minimum time = ${answer}.`,
        codeLine: 7,
        action: 'found',
      } as AlgorithmStep);
      break;
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= n || nc < 0 || nc >= n || visited[nr][nc]) continue;

      visited[nr][nc] = true;
      const newMax = Math.max(maxElev, grid[nr][nc]);
      pq.push([newMax, nr, nc]);
      path.push([nr, nc]);

      steps.push({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: path.map(p => [...p] as [number, number]),
          matrixSecondary: [[nr, nc]],
          result: `Current max elevation: ${maxElev}`,
        },
        highlights: [],
        message: `Explore neighbor (${nr},${nc}) with elevation ${grid[nr][nc]}. Max elevation on path = ${newMax}.`,
        codeLine: 9,
        action: 'compare',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: `Answer: ${answer}`,
    },
    highlights: [],
    message: `Done! Minimum time to swim from (0,0) to (${n - 1},${n - 1}) = ${answer}.`,
    codeLine: 11,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runSwimBinarySearchDFS(input: unknown): AlgorithmStep[] {
  const grid = (input as number[][]).map(row => [...row]);
  const steps: AlgorithmStep[] = [];
  const n = grid.length;
  const MAX_STEPS = 75;

  const emit = (step: AlgorithmStep) => {
    if (steps.length < MAX_STEPS) steps.push(step);
  };

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [],
      matrixSecondary: [],
      result: 'Binary search on the answer t...',
    },
    highlights: [],
    message: `Key insight: "can we cross at time t?" is monotonic — once true, it stays true. So binary search t and check each guess with a DFS.`,
    codeLine: 1,
  } as AlgorithmStep);

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  const canReach = (t: number): { ok: boolean; reached: [number, number][] } => {
    const visited: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    const reached: [number, number][] = [];
    const dfs = (r: number, c: number): boolean => {
      if (r < 0 || r >= n || c < 0 || c >= n) return false;
      if (grid[r][c] > t || visited[r][c]) return false;
      visited[r][c] = true;
      reached.push([r, c]);
      if (r === n - 1 && c === n - 1) return true;
      for (const [dr, dc] of dirs) {
        if (dfs(r + dr, c + dc)) return true;
      }
      return false;
    };
    return { ok: dfs(0, 0), reached };
  };

  let lo = grid[0][0];
  let hi = n * n - 1;

  emit({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: [[0, 0], [n - 1, n - 1]],
      matrixSecondary: [],
      result: `Search range: t in [${lo}, ${hi}]`,
    },
    highlights: [],
    message: `Search range: lo = grid[0][0] = ${lo} (must at least cover the start), hi = n²-1 = ${hi} (largest possible elevation).`,
    codeLine: 17,
    action: 'visit',
  } as AlgorithmStep);

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    emit({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: [],
        matrixSecondary: [[0, 0]],
        result: `Trying t = ${mid} (range [${lo}, ${hi}])`,
      },
      highlights: [],
      message: `Guess mid = ${mid}: can we swim to the corner using only cells with elevation <= ${mid}?`,
      codeLine: 19,
      action: 'compare',
    } as AlgorithmStep);

    const { ok, reached } = canReach(mid);

    emit({
      state: {
        matrix: grid.map(row => [...row]),
        matrixHighlights: reached.map(p => [...p] as [number, number]),
        matrixSecondary: ok ? [[n - 1, n - 1]] : [],
        result: `t = ${mid}: ${ok ? 'reachable' : 'NOT reachable'}`,
      },
      highlights: [],
      message: `DFS from (0,0) touched ${reached.length} cell(s) with elevation <= ${mid} — destination ${ok ? 'reached!' : 'not reachable.'}`,
      codeLine: 15,
      action: 'visit',
    } as AlgorithmStep);

    if (ok) {
      hi = mid;
      emit({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: reached.map(p => [...p] as [number, number]),
          matrixSecondary: [],
          result: `Feasible — shrink range to [${lo}, ${hi}]`,
        },
        highlights: [],
        message: `t = ${mid} works, but maybe a smaller t does too. Keep mid: hi = ${mid}.`,
        codeLine: 21,
        action: 'insert',
      } as AlgorithmStep);
    } else {
      lo = mid + 1;
      emit({
        state: {
          matrix: grid.map(row => [...row]),
          matrixHighlights: reached.map(p => [...p] as [number, number]),
          matrixSecondary: [],
          result: `Infeasible — shrink range to [${lo}, ${hi}]`,
        },
        highlights: [],
        message: `t = ${mid} is too shallow to cross. Search higher: lo = ${mid + 1}.`,
        codeLine: 23,
        action: 'delete',
      } as AlgorithmStep);
    }
  }

  steps.push({
    state: {
      matrix: grid.map(row => [...row]),
      matrixHighlights: canReach(lo).reached.map(p => [...p] as [number, number]),
      matrixSecondary: [[n - 1, n - 1]],
      result: `Answer: ${lo}`,
    },
    highlights: [],
    message: `Binary search converged: the minimum time to swim from (0,0) to (${n - 1},${n - 1}) is ${lo}.`,
    codeLine: 24,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const swimInRisingWater: Algorithm = {
  id: 'swim-in-rising-water',
  name: 'Swim in Rising Water',
  category: 'Advanced Graphs',
  difficulty: 'Hard',
  timeComplexity: 'O(n² log n)',
  spaceComplexity: 'O(n²)',
  pattern: 'Modified Dijkstra — min heap, path cost = max elevation',
  description:
    'You are given an n x n integer matrix grid where each value grid[i][j] represents the elevation at that point (i, j). The rain starts to fall. At time t, the depth of the water everywhere is t. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most t. Return the least time until you can reach the bottom right square (n - 1, n - 1) if you start at the top left square (0, 0).',
  problemUrl: 'https://leetcode.com/problems/swim-in-rising-water/',
  code: {
    python: `import heapq

def swimInWater(grid):
    n = len(grid)
    visited = set()
    heap = [(grid[0][0], 0, 0)]
    visited.add((0, 0))

    while heap:
        maxElev, r, c = heapq.heappop(heap)
        if r == n-1 and c == n-1:
            return maxElev

        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r+dr, c+dc
            if 0<=nr<n and 0<=nc<n and (nr,nc) not in visited:
                visited.add((nr, nc))
                heapq.heappush(heap, (max(maxElev, grid[nr][nc]), nr, nc))

    return -1`,
    javascript: `function swimInWater(grid) {
    const n = grid.length;
    const visited = new Set();
    const heap = [[grid[0][0], 0, 0]];
    visited.add("0,0");

    while (heap.length) {
        heap.sort((a, b) => a[0] - b[0]);
        const [maxElev, r, c] = heap.shift();
        if (r === n-1 && c === n-1) return maxElev;

        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            const nr = r+dr, nc = c+dc;
            if (nr>=0 && nr<n && nc>=0 && nc<n && !visited.has(nr+","+nc)) {
                visited.add(nr+","+nc);
                heap.push([Math.max(maxElev, grid[nr][nc]), nr, nc]);
            }
        }
    }
    return -1;
}`,
    java: `public int swimInWater(int[][] grid) {
    int n = grid.length;
    Set<String> visited = new HashSet<>();
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    heap.offer(new int[]{grid[0][0], 0, 0});
    visited.add("0,0");

    int[][] directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
    while (!heap.isEmpty()) {
        int[] curr = heap.poll();
        int maxElev = curr[0], r = curr[1], c = curr[2];
        if (r == n - 1 && c == n - 1) return maxElev;

        for (int[] dir : directions) {
            int nr = r + dir[0], nc = c + dir[1];
            String key = nr + "," + nc;
            if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited.contains(key)) {
                visited.add(key);
                heap.offer(new int[]{Math.max(maxElev, grid[nr][nc]), nr, nc});
            }
        }
    }
    return -1;
}`,
  },
  defaultInput: [
    [0, 2],
    [1, 3],
  ],
  run: runSwimInRisingWater,
  optimalApproachName: 'Dijkstra (Min-Heap)',
  approaches: [
    {
      id: 'binary-search-dfs',
      name: 'Binary Search + DFS',
      timeComplexity: 'O(n² log n)',
      spaceComplexity: 'O(n²)',
      description:
        'Rather than growing the cheapest path with a heap like Dijkstra, it binary-searches the answer t and runs a fresh DFS per guess to test "can we cross using only cells <= t?" — exploiting that feasibility is monotonic in t.',
      code: {
        python: `def swimInWater(grid):
    n = len(grid)

    def canReach(t):
        visited = set()
        def dfs(r, c):
            if r < 0 or r >= n or c < 0 or c >= n:
                return False
            if grid[r][c] > t or (r, c) in visited:
                return False
            visited.add((r, c))
            if r == n - 1 and c == n - 1:
                return True
            return dfs(r+1, c) or dfs(r-1, c) or dfs(r, c+1) or dfs(r, c-1)
        return dfs(0, 0)

    lo, hi = grid[0][0], n * n - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if canReach(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        javascript: `function swimInWater(grid) {
    const n = grid.length;

    function canReach(t) {
        const visited = new Set();
        function dfs(r, c) {
            if (r < 0 || r >= n || c < 0 || c >= n) return false;
            if (grid[r][c] > t || visited.has(r + "," + c)) return false;
            visited.add(r + "," + c);
            if (r === n - 1 && c === n - 1) return true;
            return dfs(r+1, c) || dfs(r-1, c) || dfs(r, c+1) || dfs(r, c-1);
        }
        return dfs(0, 0);
    }

    let lo = grid[0][0], hi = n * n - 1;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (canReach(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        java: `public int swimInWater(int[][] grid) {
    int n = grid.length;
    int lo = grid[0][0], hi = n * n - 1;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (canReach(grid, mid, 0, 0, new boolean[n][n])) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return lo;
}

private boolean canReach(int[][] grid, int t, int r, int c, boolean[][] visited) {
    int n = grid.length;
    if (r < 0 || r >= n || c < 0 || c >= n) return false;
    if (grid[r][c] > t || visited[r][c]) return false;
    visited[r][c] = true;
    if (r == n - 1 && c == n - 1) return true;
    return canReach(grid, t, r + 1, c, visited)
        || canReach(grid, t, r - 1, c, visited)
        || canReach(grid, t, r, c + 1, visited)
        || canReach(grid, t, r, c - 1, visited);
}`,
      },
      run: runSwimBinarySearchDFS,
      lineExplanations: {
        python: {
          1: 'Define function taking elevation grid',
          2: 'Get grid side length',
          4: 'Feasibility check: crossable at time t?',
          5: 'Track visited cells for this DFS',
          6: 'DFS flood-fill through cells <= t',
          7: 'Out of bounds?',
          8: 'Blocked: outside the grid',
          9: 'Cell too high for time t, or already seen?',
          10: 'Blocked: water not deep enough here',
          11: 'Mark cell reachable at time t',
          12: 'Reached bottom-right corner?',
          13: 'Feasible — a path exists at time t',
          14: 'Try all 4 neighbors; any success bubbles up',
          15: 'Start the flood-fill from (0,0)',
          17: 'Answer lies between start elevation and n²-1',
          18: 'Standard binary search on the answer',
          19: 'Guess the midpoint time',
          20: 'Is the grid crossable at time mid?',
          21: 'Yes — try smaller times (keep mid)',
          22: 'No —',
          23: 'the water must rise more: search above mid',
          24: 'lo == hi: the minimum feasible time',
        },
        javascript: {
          1: 'Define function taking elevation grid',
          2: 'Get grid side length',
          4: 'Feasibility check: crossable at time t?',
          5: 'Track visited cells for this DFS',
          6: 'DFS flood-fill through cells <= t',
          7: 'Blocked: outside the grid',
          8: 'Blocked: cell too high for t, or already seen',
          9: 'Mark cell reachable at time t',
          10: 'Feasible if we reached bottom-right corner',
          11: 'Try all 4 neighbors; any success bubbles up',
          13: 'Start the flood-fill from (0,0)',
          16: 'Answer lies between start elevation and n²-1',
          17: 'Standard binary search on the answer',
          18: 'Guess the midpoint time',
          19: 'Feasible — try smaller times (keep mid)',
          20: 'Infeasible — search above mid',
          22: 'lo == hi: the minimum feasible time',
        },
        java: {
          1: 'Define method taking elevation grid',
          2: 'Get grid side length',
          3: 'Answer lies between start elevation and n²-1',
          4: 'Standard binary search on the answer',
          5: 'Guess the midpoint time',
          6: 'Is the grid crossable at time mid?',
          7: 'Feasible — try smaller times (keep mid)',
          9: 'Infeasible — search above mid',
          12: 'lo == hi: the minimum feasible time',
          15: 'DFS feasibility check: crossable at time t?',
          16: 'Get grid side length',
          17: 'Blocked: outside the grid',
          18: 'Blocked: cell too high for t, or already seen',
          19: 'Mark cell reachable at time t',
          20: 'Feasible if we reached bottom-right corner',
          21: 'Try all 4 neighbors...',
          22: '...up...',
          23: '...right...',
          24: '...and left; any success bubbles up',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Import heapq — Python ships a min-heap only, so max-heaps use negated values',
      3: 'Define function taking elevation grid',
      4: 'Get grid side length',
      5: 'Track visited cells',
      6: 'Min-heap: (max elevation on path, row, col)',
      7: 'Mark starting cell as visited',
      9: 'Process cells while heap is not empty',
      10: 'Pop cell with smallest max elevation',
      11: 'Check if we reached bottom-right corner',
      12: 'Return the minimum time needed',
      14: 'Try all 4 adjacent directions',
      15: 'Compute neighbor coordinates',
      16: 'Check bounds and skip visited cells',
      17: 'Mark neighbor as visited',
      18: 'Push neighbor with updated max elevation',
      20: 'Return -1 if no path exists',
    },
    javascript: {
      1: 'Define function taking elevation grid',
      2: 'Get grid side length',
      3: 'Track visited cells using string keys',
      4: 'Min-heap: [max elevation, row, col]',
      5: 'Mark starting cell as visited',
      7: 'Process cells while heap is not empty',
      8: 'Sort to simulate min-heap extraction',
      9: 'Pop cell with smallest max elevation',
      10: 'Return max elevation if at destination',
      12: 'Try all 4 adjacent directions',
      13: 'Compute neighbor coordinates',
      14: 'Check bounds and skip visited cells',
      15: 'Mark neighbor as visited',
      16: 'Push with max of current and neighbor elev',
      20: 'Return -1 if no path exists',
    },
    java: {
      1: 'Define method taking elevation grid',
      2: 'Get grid side length',
      3: 'Track visited cells with string keys',
      4: 'Min-heap sorted by max elevation',
      5: 'Add starting cell with its elevation',
      6: 'Mark starting cell as visited',
      8: 'Define 4 movement directions',
      9: 'Process while heap has entries',
      10: 'Pop cell with smallest max elevation',
      11: 'Extract max elevation, row, and column',
      12: 'Return if we reached bottom-right corner',
      14: 'Try all 4 adjacent directions',
      15: 'Compute neighbor coordinates',
      16: 'Build key for visited check',
      17: 'Check bounds and skip visited cells',
      18: 'Mark neighbor as visited',
      19: 'Push with max of current and neighbor elev',
      23: 'Return -1 if no path exists',
    },
  },
};
