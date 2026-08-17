import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPerfectSquares(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];

  const dp: (number | string | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => `${i}`);

  const squares: number[] = [];
  for (let s = 1; s * s <= n; s++) squares.push(s * s);

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...squares], result: null },
    highlights: [],
    message: `Find the fewest perfect squares summing to ${n}. Usable squares: [${squares.join(', ')}]. dp[t] = fewest squares that make t`,
    codeLine: 1,
  });

  for (let i = 0; i <= n; i++) dp[i] = 'inf';
  dp[0] = 0;
  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...squares], dpHighlights: [0], result: null },
    highlights: [0],
    message: `Everything starts at infinity (unreachable); dp[0] = 0 because zero needs zero squares`,
    codeLine: 3,
    action: 'insert',
  });

  for (let target = 1; target <= n; target++) {
    steps.push({
      state: { dp: [...dp], dpLabels, nums: [...squares], dpSecondary: [target], result: null },
      highlights: [target],
      pointers: { target },
      message: `Target ${target}: subtract each square ≤ ${target} and reuse the already-solved remainder`,
      codeLine: 4,
      action: 'visit',
    });

    for (let s = 1; s * s <= target; s++) {
      const sq = s * s;
      const prev = dp[target - sq];
      if (prev === 'inf' || prev === null) continue;
      const candidate = (prev as number) + 1;
      const current = dp[target] === 'inf' ? Infinity : (dp[target] as number);
      if (candidate < current) {
        dp[target] = candidate;
        steps.push({
          state: {
            dp: [...dp],
            dpLabels,
            nums: [...squares],
            dpHighlights: [target - sq],
            dpSecondary: [target],
            result: null,
          },
          highlights: [target],
          pointers: { target, square: sq },
          message: `${target} = ${sq} + ${target - sq}, and ${target - sq} needs ${prev} square${prev === 1 ? '' : 's'} ⇒ dp[${target}] improves to ${candidate}`,
          codeLine: 7,
          action: 'insert',
        });
      }
    }
  }

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...squares], dpHighlights: [n], result: dp[n] },
    highlights: [n],
    message: `Result: ${dp[n]} perfect squares are enough to sum to ${n}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runPerfectSquaresBFS(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];

  // dp[i] = BFS level at which remainder i was first reached
  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => `${i}`);

  const squares: number[] = [];
  for (let s = 1; s * s <= n; s++) squares.push(s * s);

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...squares], result: null },
    highlights: [],
    message: `BFS view: remainders are graph nodes and squares [${squares.join(', ')}] are edges. The level at which BFS hits 0 IS the fewest squares`,
    codeLine: 3,
  });

  if (n === 0) {
    steps.push({
      state: { dp: [...dp], dpLabels, nums: [...squares], result: 0 },
      highlights: [],
      message: `n = 0 needs no squares. Result: 0`,
      codeLine: 24,
      action: 'found',
    });
    return steps;
  }

  const visited: boolean[] = new Array(n + 1).fill(false);
  visited[n] = true;
  dp[n] = 0;
  let queue: number[] = [n];
  let level = 0;

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...squares], dpHighlights: [n], result: null },
    highlights: [n],
    message: `Start BFS from remainder ${n} at level 0. Each level spends exactly one more square`,
    codeLine: 10,
    action: 'push',
  });

  while (queue.length > 0) {
    level++;
    const nextQueue: number[] = [];

    steps.push({
      state: { dp: [...dp], dpLabels, nums: [...squares], dpHighlights: [...queue], result: null },
      highlights: [...queue],
      pointers: { level },
      message: `Level ${level}: expand frontier {${queue.join(', ')}} — every remainder reached from here costs exactly ${level} square${level > 1 ? 's' : ''}`,
      codeLine: 14,
      action: 'visit',
    });

    for (const cur of queue) {
      for (const sq of squares) {
        const rem = cur - sq;
        if (rem === 0) {
          steps.push({
            state: { dp: [...dp], dpLabels, nums: [...squares], dpHighlights: [cur], dpSecondary: [0], result: level },
            highlights: [cur],
            pointers: { square: sq, level },
            message: `${cur} − ${sq} = 0 at level ${level}. BFS reaches 0 by the shortest path first, so ${level} is the minimum`,
            codeLine: 20,
            action: 'found',
          });
          return steps;
        }
        if (rem > 0 && !visited[rem]) {
          visited[rem] = true;
          dp[rem] = level;
          nextQueue.push(rem);
          steps.push({
            state: { dp: [...dp], dpLabels, nums: [...squares], dpHighlights: [cur], dpSecondary: [rem], result: null },
            highlights: [rem],
            pointers: { square: sq, level },
            message: `${cur} − ${sq} = ${rem}, first seen at level ${level} — enqueue it for the next round`,
            codeLine: 23,
            action: 'push',
          });
        }
      }
    }

    queue = nextQueue;
  }

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...squares], result: 0 },
    highlights: [],
    message: `Frontier exhausted without reaching 0`,
    codeLine: 24,
    action: 'found',
  });

  return steps;
}

export const perfectSquares: Algorithm = {
  id: 'perfect-squares',
  name: 'Perfect Squares',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n·√n)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[t] = min over squares of dp[t - s²] + 1',
  description:
    'Given an integer n, return the least number of perfect square numbers that sum to n. A perfect square is the product of some integer with itself, such as 1, 4, 9, and 16.',
  problemUrl: 'https://leetcode.com/problems/perfect-squares/',
  code: {
    python: `def numSquares(n):
    dp = [float('inf')] * (n + 1)
    dp[0] = 0
    for target in range(1, n + 1):
        s = 1
        while s * s <= target:
            dp[target] = min(dp[target], dp[target - s*s] + 1)
            s += 1
    return dp[n]`,
    javascript: `function numSquares(n) {
    const dp = new Array(n + 1).fill(Infinity);
    dp[0] = 0;
    for (let target = 1; target <= n; target++) {
        for (let s = 1; s * s <= target; s++) {
            dp[target] = Math.min(dp[target], dp[target - s * s] + 1);
        }
    }
    return dp[n];
}`,
    java: `public static int numSquares(int n) {
    int[] dp = new int[n + 1];
    Arrays.fill(dp, n + 1);
    dp[0] = 0;
    for (int target = 1; target <= n; target++) {
        for (int s = 1; s * s <= target; s++) {
            dp[target] = Math.min(dp[target], dp[target - s * s] + 1);
        }
    }
    return dp[n];
}`,
  },
  defaultInput: 12,
  run: runPerfectSquares,
  optimalApproachName: 'Bottom-Up DP',
  approaches: [
    {
      id: 'bfs-level-order',
      name: 'BFS (Level Order)',
      timeComplexity: 'O(n·√n)',
      spaceComplexity: 'O(n)',
      description:
        'Treat remainders as graph nodes and perfect squares as edges — BFS reaches 0 in the fewest hops, so it can stop early instead of filling the entire table.',
      code: {
        python: `from collections import deque

def numSquares(n):
    squares = []
    s = 1
    while s * s <= n:
        squares.append(s * s)
        s += 1
    visited = [False] * (n + 1)
    queue = deque([n])
    visited[n] = True
    level = 0
    while queue:
        level += 1
        for _ in range(len(queue)):
            cur = queue.popleft()
            for sq in squares:
                rem = cur - sq
                if rem == 0:
                    return level
                if rem > 0 and not visited[rem]:
                    visited[rem] = True
                    queue.append(rem)
    return 0`,
        javascript: `function numSquares(n) {
    const squares = [];
    for (let s = 1; s * s <= n; s++) squares.push(s * s);
    const visited = new Array(n + 1).fill(false);
    visited[n] = true;
    let queue = [n];
    let level = 0;
    while (queue.length > 0) {
        level++;
        const next = [];
        for (const cur of queue) {
            for (const sq of squares) {
                const rem = cur - sq;
                if (rem === 0) return level;
                if (rem > 0 && !visited[rem]) {
                    visited[rem] = true;
                    next.push(rem);
                }
            }
        }
        queue = next;
    }
    return 0;
}`,
        java: `public static int numSquares(int n) {
    List<Integer> squares = new ArrayList<>();
    for (int s = 1; s * s <= n; s++) squares.add(s * s);
    boolean[] visited = new boolean[n + 1];
    visited[n] = true;
    Queue<Integer> queue = new LinkedList<>();
    queue.add(n);
    int level = 0;
    while (!queue.isEmpty()) {
        level++;
        int size = queue.size();
        for (int k = 0; k < size; k++) {
            int cur = queue.poll();
            for (int sq : squares) {
                int rem = cur - sq;
                if (rem == 0) return level;
                if (rem > 0 && !visited[rem]) {
                    visited[rem] = true;
                    queue.add(rem);
                }
            }
        }
    }
    return 0;
}`,
      },
      run: runPerfectSquaresBFS,
      lineExplanations: {
        python: {
          1: 'Import deque for an efficient FIFO queue',
          3: 'Define function taking n',
          4: 'Collect every perfect square that fits inside n',
          5: 'Start from 1²',
          6: 'Keep going while the square is still ≤ n',
          7: 'Record this square as a usable "edge"',
          8: 'Advance to the next integer',
          9: 'Track remainders already reached',
          10: 'BFS starts at the full value n',
          11: 'Mark the start visited',
          12: 'Level counter = squares used so far',
          13: 'Process frontiers until none remain',
          14: 'Entering a level means spending one more square',
          15: 'Expand exactly the nodes in this level',
          16: 'Pop the next remainder',
          17: 'Try subtracting each perfect square',
          18: 'What is left after using this square',
          19: 'Hit exactly zero?',
          20: 'The current level is the minimum count',
          21: 'Only enqueue positive, unseen remainders',
          22: 'Mark so it is never re-added',
          23: 'Queue it for the next level',
          24: 'Unreachable in practice — every n is reachable using 1s',
        },
        javascript: {
          1: 'Define function taking n',
          2: 'Collect every perfect square that fits inside n',
          3: 'Build the list of usable squares',
          4: 'Track remainders already reached',
          5: 'Mark the start visited',
          6: 'BFS frontier starts at the full value n',
          7: 'Level counter = squares used so far',
          8: 'Process frontiers until none remain',
          9: 'Entering a level means spending one more square',
          10: 'Collect the next frontier here',
          11: 'Expand every remainder in the current frontier',
          12: 'Try subtracting each perfect square',
          13: 'What is left after using this square',
          14: 'Hit exactly zero: this level is the minimum',
          15: 'Only enqueue positive, unseen remainders',
          16: 'Mark so it is never re-added',
          17: 'Add to the next frontier',
          21: 'Swap in the next frontier',
          23: 'Unreachable in practice — every n is reachable using 1s',
        },
        java: {
          1: 'Define method taking n',
          2: 'Collect every perfect square that fits inside n',
          3: 'Build the list of usable squares',
          4: 'Track remainders already reached',
          5: 'Mark the start visited',
          6: 'FIFO queue for BFS',
          7: 'BFS starts at the full value n',
          8: 'Level counter = squares used so far',
          9: 'Process the queue until empty',
          10: 'Entering a level means spending one more square',
          11: 'Snapshot the current level size',
          12: 'Expand exactly the nodes of this level',
          13: 'Pop the next remainder',
          14: 'Try subtracting each perfect square',
          15: 'What is left after using this square',
          16: 'Hit exactly zero: this level is the minimum',
          17: 'Only enqueue positive, unseen remainders',
          18: 'Mark so it is never re-added',
          19: 'Queue it for the next level',
          24: 'Unreachable in practice — every n is reachable using 1s',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking n',
      2: 'dp[t] = fewest squares summing to t; start unreachable',
      3: 'Base case: zero needs zero squares',
      4: 'Solve every target from 1 up to n',
      5: 'Start with the square 1²',
      6: 'Only squares that fit inside the target are candidates',
      7: 'Use s² once, then reuse the solved remainder t - s²',
      8: 'Try the next larger square',
      9: 'dp[n] holds the fewest squares for n',
    },
    javascript: {
      1: 'Define function taking n',
      2: 'dp[t] = fewest squares summing to t; start unreachable',
      3: 'Base case: zero needs zero squares',
      4: 'Solve every target from 1 up to n',
      5: 'Try every square that fits inside the target',
      6: 'Use s² once, then reuse the solved remainder t - s²',
      9: 'dp[n] holds the fewest squares for n',
    },
    java: {
      1: 'Define method taking n',
      2: 'dp[t] = fewest squares summing to t',
      3: 'Fill with n+1 as a safe "unreachable" sentinel (no overflow)',
      4: 'Base case: zero needs zero squares',
      5: 'Solve every target from 1 up to n',
      6: 'Try every square that fits inside the target',
      7: 'Use s² once, then reuse the solved remainder t - s²',
      10: 'dp[n] holds the fewest squares for n',
    },
  },
};
