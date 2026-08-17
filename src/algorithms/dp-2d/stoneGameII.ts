import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface StoneGameIIInput {
  piles: number[];
}

const MAX_STEPS = 55;

function runStoneGameII(input: unknown): AlgorithmStep[] {
  const { piles } = input as StoneGameIIInput;
  const steps: AlgorithmStep[] = [];
  const n = piles.length;

  const suffix = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + piles[i];

  // memo table rows = index i (0..n-1), cols = M (1..n) stored at col M-1
  const memoGrid: (number | string)[][] = Array.from({ length: n }, () =>
    new Array(n).fill('·'),
  );
  const memo = new Map<string, number>();

  const snap = (
    hl: [number, number][],
    sec: [number, number][],
    result: number | null,
  ) => ({
    nums: [...piles],
    dp2d: memoGrid.map(r => [...r]),
    matrixHighlights: hl,
    matrixSecondary: sec,
    result,
  });

  const push = (step: {
    hl: [number, number][];
    sec?: [number, number][];
    highlights?: number[];
    pointers?: Record<string, number>;
    message: string;
    codeLine: number;
    action?: 'compare' | 'insert' | 'found' | 'visit' | 'pop';
    result?: number | null;
  }) => {
    if (steps.length >= MAX_STEPS) return;
    steps.push({
      state: snap(step.hl, step.sec ?? [], step.result ?? null),
      highlights: step.highlights ?? [],
      pointers: step.pointers,
      message: step.message,
      codeLine: step.codeLine,
      action: step.action,
    });
  };

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Alice and Bob alternate; on your turn with parameter M you must take the first X remaining piles for any 1 ≤ X ≤ 2M, and M becomes max(M, X). Maximize Alice's stones from [${piles.join(', ')}]`,
    codeLine: 1,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Suffix sums first: suffix[i] = ${suffix.slice(0, n + 1).join(', ')} — stones remaining from index i onward. If I take X piles and my opponent then wins Y of the rest, I get suffix[i] − Y. So I never need to track two scores`,
    codeLine: 5,
    action: 'insert',
  });

  const rowsSeen = new Set<string>();

  function dfs(i: number, m: number, depth: number): number {
    const pad = '  '.repeat(Math.min(depth, 4));

    if (i >= n) return 0;

    if (i + 2 * m >= n) {
      push({
        hl: [],
        highlights: Array.from({ length: n - i }, (_, k) => i + k),
        pointers: { i, M: m },
        message: `${pad}(i=${i}, M=${m}): 2M = ${2 * m} covers everything left, so just sweep all ${n - i} remaining piles — return suffix[${i}] = ${suffix[i]}`,
        codeLine: 11,
        action: 'found',
      });
      return suffix[i];
    }

    const key = `${i},${m}`;
    if (memo.has(key)) {
      push({
        hl: [[i, m - 1]],
        highlights: [i],
        pointers: { i, M: m },
        message: `${pad}(i=${i}, M=${m}) already solved — reuse the memo cell ${memo.get(key)} instead of re-exploring the whole subtree`,
        codeLine: 13,
        action: 'pop',
      });
      return memo.get(key)!;
    }

    if (!rowsSeen.has(key)) {
      rowsSeen.add(key);
      push({
        hl: [[i, m - 1]],
        highlights: Array.from({ length: Math.min(2 * m, n - i) }, (_, k) => i + k),
        pointers: { i, M: m },
        message: `${pad}(i=${i}, M=${m}): may take 1…${2 * m} piles. Remaining stones = suffix[${i}] = ${suffix[i]}; whatever the opponent then forces, I keep the rest`,
        codeLine: 15,
        action: 'visit',
      });
    }

    let best = 0;
    let bestX = 1;
    for (let x = 1; x <= 2 * m; x++) {
      if (i + x > n) break;
      const opponent = dfs(i + x, Math.max(m, x), depth + 1);
      const mine = suffix[i] - opponent;
      if (mine > best) {
        best = mine;
        bestX = x;
      }
      push({
        hl: [[i, m - 1]],
        highlights: Array.from({ length: x }, (_, k) => i + k),
        pointers: { i, M: m, X: x },
        message: `${pad}(i=${i}, M=${m}) take X=${x} (piles ${piles.slice(i, i + x).join(' + ')}): opponent then forces ${opponent}, so I get ${suffix[i]} − ${opponent} = ${mine}. Best so far ${best}`,
        codeLine: 16,
        action: 'compare',
      });
    }

    memo.set(key, best);
    memoGrid[i][m - 1] = best;

    push({
      hl: [[i, m - 1]],
      highlights: [i],
      pointers: { i, M: m },
      message: `${pad}memo[(${i}, ${m})] = ${best} — taking X=${bestX} is optimal here. Cached, so this state is never recomputed`,
      codeLine: 17,
      action: 'insert',
    });

    return best;
  }

  const answer = dfs(0, 1, 0);

  steps.push({
    state: snap([[0, 0]], [], answer),
    highlights: [],
    message: `dfs(0, 1) = ${answer} — the maximum stones Alice can guarantee. Only ${memo.size} distinct (i, M) states needed caching, which is what turns the exponential game tree into O(n³)`,
    codeLine: 19,
    action: 'found',
  });

  return steps;
}

function runStoneGameIIBottomUp(input: unknown): AlgorithmStep[] {
  const { piles } = input as StoneGameIIInput;
  const steps: AlgorithmStep[] = [];
  const n = piles.length;

  const suffix = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + piles[i];

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));

  const snap = (
    hl: [number, number][],
    sec: [number, number][],
    result: number | null,
  ) => ({
    nums: [...piles],
    dp2d: dp.map(r => [...r]),
    matrixHighlights: hl,
    matrixSecondary: sec,
    result,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Same recurrence, no recursion: dp[i][M] = most stones the player to move can take from piles[i..] with parameter M. Rows are i, columns are M`,
    codeLine: 1,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Suffix sums: [${suffix.join(', ')}]. suffix[i] is everything left from index i, so "my score = suffix[i] − opponent's score"`,
    codeLine: 5,
    action: 'insert',
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Fill i from ${n - 1} DOWN to 0 — dp[i][M] only reads rows strictly BELOW it (i + X), so those must already be final. That reversed order is exactly what the recursion's call stack was doing for us`,
    codeLine: 7,
  });

  for (let i = n - 1; i >= 0; i--) {
    for (let m = n; m >= 1; m--) {
      if (i + 2 * m >= n) {
        dp[i][m] = suffix[i];
        steps.push({
          state: snap([[i, m]], [], null),
          highlights: Array.from({ length: n - i }, (_, k) => i + k),
          pointers: { i, M: m },
          message: `dp[${i}][${m}]: 2M = ${2 * m} reaches the end, so take everything — dp = suffix[${i}] = ${suffix[i]}`,
          codeLine: 10,
          action: 'insert',
        });
        continue;
      }

      let bestX = 1;
      for (let x = 1; x <= 2 * m; x++) {
        const cand = suffix[i] - dp[i + x][Math.max(m, x)];
        if (cand > dp[i][m]) {
          dp[i][m] = cand;
          bestX = x;
        }
      }

      steps.push({
        state: snap([[i, m]], Array.from({ length: 2 * m }, (_, k): [number, number] => [i + k + 1, Math.max(m, k + 1)]), null),
        highlights: Array.from({ length: bestX }, (_, k) => i + k),
        pointers: { i, M: m, bestX },
        message: `dp[${i}][${m}] = max over X of (suffix[${i}] − dp[${i}+X][max(${m}, X)]) = ${dp[i][m]}, achieved by taking X = ${bestX}`,
        codeLine: 13,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: snap([[0, 1]], [], dp[0][1]),
    highlights: [],
    message: `dp[0][1] = ${dp[0][1]} — Alice starts at index 0 with M = 1. Same answer as the memoized recursion, with the table filled explicitly instead of on demand`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const stoneGameII: Algorithm = {
  id: 'stone-game-ii',
  name: 'Stone Game II',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n³)',
  spaceComplexity: 'O(n²)',
  pattern: 'DFS + Memoization — cache the game state (index, M)',
  description:
    'Alice and Bob take turns removing the first X remaining piles of stones, where 1 <= X <= 2M and M starts at 1; after a move M becomes max(M, X). Both play optimally. Return the maximum number of stones Alice can get.',
  problemUrl: 'https://leetcode.com/problems/stone-game-ii/',
  code: {
    python: `def stoneGameII(piles):
    n = len(piles)
    suffix = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix[i] = suffix[i+1] + piles[i]
    memo = {}
    def dfs(i, m):
        if i >= n:
            return 0
        if i + 2 * m >= n:
            return suffix[i]
        if (i, m) in memo:
            return memo[(i, m)]
        best = 0
        for x in range(1, 2 * m + 1):
            best = max(best, suffix[i] - dfs(i + x, max(m, x)))
        memo[(i, m)] = best
        return best
    return dfs(0, 1)`,
    javascript: `function stoneGameII(piles) {
    const n = piles.length;
    const suffix = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--)
        suffix[i] = suffix[i+1] + piles[i];
    const memo = new Map();
    function dfs(i, m) {
        if (i >= n) return 0;
        if (i + 2 * m >= n) return suffix[i];
        const key = i + ',' + m;
        if (memo.has(key)) return memo.get(key);
        let best = 0;
        for (let x = 1; x <= 2 * m; x++) {
            best = Math.max(best,
                suffix[i] - dfs(i + x, Math.max(m, x)));
        }
        memo.set(key, best);
        return best;
    }
    return dfs(0, 1);
}`,
    java: `public static int stoneGameII(int[] piles) {
    int n = piles.length;
    int[] suffix = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) {
        suffix[i] = suffix[i + 1] + piles[i];
    }
    Integer[][] memo = new Integer[n + 1][n + 1];
    return dfs(piles, suffix, memo, 0, 1);
}

private static int dfs(int[] piles, int[] suffix,
                       Integer[][] memo, int i, int m) {
    int n = piles.length;
    if (i >= n) return 0;
    if (i + 2 * m >= n) return suffix[i];
    if (memo[i][m] != null) return memo[i][m];
    int best = 0;
    for (int x = 1; x <= 2 * m; x++) {
        best = Math.max(best,
            suffix[i] - dfs(piles, suffix, memo,
                            i + x, Math.max(m, x)));
    }
    memo[i][m] = best;
    return best;
}`,
  },
  defaultInput: { piles: [2, 7, 9, 4, 4] },
  run: runStoneGameII,
  optimalApproachName: 'Memoized DFS',
  approaches: [
    {
      id: 'bottom-up-table',
      name: 'Bottom-Up Table',
      timeComplexity: 'O(n³)',
      spaceComplexity: 'O(n²)',
      description:
        'Fills the same (index, M) table iteratively from the last pile backwards, removing the recursion and its call-stack overhead entirely.',
      code: {
        python: `def stoneGameII(piles):
    n = len(piles)
    suffix = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix[i] = suffix[i+1] + piles[i]
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for m in range(n, 0, -1):
            if i + 2 * m >= n:
                dp[i][m] = suffix[i]
            else:
                for x in range(1, 2 * m + 1):
                    dp[i][m] = max(dp[i][m],
                                   suffix[i] - dp[i+x][max(m, x)])
    return dp[0][1]`,
        javascript: `function stoneGameII(piles) {
    const n = piles.length;
    const suffix = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--)
        suffix[i] = suffix[i+1] + piles[i];
    const dp = Array.from({length: n + 1},
        () => new Array(n + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
        for (let m = n; m >= 1; m--) {
            if (i + 2 * m >= n) {
                dp[i][m] = suffix[i];
            } else {
                for (let x = 1; x <= 2 * m; x++) {
                    dp[i][m] = Math.max(dp[i][m],
                        suffix[i] - dp[i+x][Math.max(m, x)]);
                }
            }
        }
    }
    return dp[0][1];
}`,
        java: `public static int stoneGameII(int[] piles) {
    int n = piles.length;
    int[] suffix = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) {
        suffix[i] = suffix[i + 1] + piles[i];
    }
    int[][] dp = new int[n + 1][n + 1];
    for (int i = n - 1; i >= 0; i--) {
        for (int m = n; m >= 1; m--) {
            if (i + 2 * m >= n) {
                dp[i][m] = suffix[i];
            } else {
                for (int x = 1; x <= 2 * m; x++) {
                    dp[i][m] = Math.max(dp[i][m],
                        suffix[i] - dp[i + x][Math.max(m, x)]);
                }
            }
        }
    }
    return dp[0][1];
}`,
      },
      run: runStoneGameIIBottomUp,
      lineExplanations: {
        python: {
          1: 'Define function taking the pile sizes',
          2: 'Number of piles',
          3: 'Suffix sums of the remaining stones',
          4: 'Build them right to left',
          5: 'suffix[i] = piles[i] plus everything after it',
          6: 'dp[i][M] = best score for the player to move at (i, M)',
          7: 'Fill i backwards so rows below are already final',
          8: 'M can be anything from n down to 1',
          9: 'If 2M reaches the end, the whole suffix is takeable',
          10: 'Take it all',
          11: 'Otherwise try every legal number of piles',
          12: 'X ranges over 1..2M',
          13: 'Keep the best over all X',
          14: 'My score is the suffix minus what the opponent forces',
          15: 'Alice starts at index 0 with M = 1',
        },
        javascript: {
          1: 'Define function taking the pile sizes',
          2: 'Number of piles',
          3: 'Suffix sums of the remaining stones',
          4: 'Build them right to left',
          5: 'suffix[i] = piles[i] plus everything after it',
          6: 'dp[i][M] = best score for the player to move at (i, M)',
          8: 'Fill i backwards so rows below are already final',
          9: 'M can be anything from n down to 1',
          10: 'If 2M reaches the end, the whole suffix is takeable',
          11: 'Take it all',
          13: 'X ranges over 1..2M',
          14: 'Keep the best over all X',
          15: 'My score is the suffix minus what the opponent forces',
          20: 'Alice starts at index 0 with M = 1',
        },
        java: {
          1: 'Define method taking the pile sizes',
          2: 'Number of piles',
          3: 'Suffix sums of the remaining stones',
          4: 'Build them right to left',
          5: 'suffix[i] = piles[i] plus everything after it',
          7: 'dp[i][M] = best score for the player to move at (i, M)',
          8: 'Fill i backwards so rows below are already final',
          9: 'M can be anything from n down to 1',
          10: 'If 2M reaches the end, the whole suffix is takeable',
          11: 'Take it all',
          14: 'X ranges over 1..2M',
          15: 'Keep the best over all X',
          16: 'My score is the suffix minus what the opponent forces',
          20: 'Alice starts at index 0 with M = 1',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the pile sizes',
      2: 'Number of piles',
      3: 'Suffix sums of the remaining stones',
      4: 'Build them right to left',
      5: 'suffix[i] = piles[i] plus everything after it',
      6: 'Cache keyed by the full game state (i, M)',
      7: 'Solve the game from index i with parameter M',
      8: 'No piles left',
      9: 'Score 0',
      10: 'If 2M reaches the end, sweep the whole suffix',
      11: 'That is the maximum possible from here',
      12: 'Already solved this exact state?',
      13: 'Reuse the cached answer instead of re-exploring',
      14: 'Best score found so far at this state',
      15: 'Try taking X = 1..2M piles',
      16: 'My score is the suffix minus what the opponent then forces',
      17: 'Cache the result for this state',
      18: 'Hand it back up the recursion',
      19: 'Alice starts at index 0 with M = 1',
    },
    javascript: {
      1: 'Define function taking the pile sizes',
      2: 'Number of piles',
      3: 'Suffix sums of the remaining stones',
      4: 'Build them right to left',
      5: 'suffix[i] = piles[i] plus everything after it',
      6: 'Cache keyed by the full game state (i, M)',
      7: 'Solve the game from index i with parameter M',
      8: 'No piles left, score 0',
      9: 'If 2M reaches the end, sweep the whole suffix',
      10: 'Build the memo key from the state',
      11: 'Reuse the cached answer instead of re-exploring',
      12: 'Best score found so far at this state',
      13: 'Try taking X = 1..2M piles',
      14: 'My score is the suffix minus what the opponent forces',
      15: 'M grows to max(M, X) for the opponent',
      17: 'Cache the result for this state',
      20: 'Alice starts at index 0 with M = 1',
    },
    java: {
      1: 'Define method taking the pile sizes',
      2: 'Number of piles',
      3: 'Suffix sums of the remaining stones',
      4: 'Build them right to left',
      5: 'suffix[i] = piles[i] plus everything after it',
      7: 'Memo table indexed by (i, M); null means unsolved',
      8: 'Alice starts at index 0 with M = 1',
      11: 'Recursive helper carrying the shared state',
      14: 'No piles left, score 0',
      15: 'If 2M reaches the end, sweep the whole suffix',
      16: 'Reuse the cached answer instead of re-exploring',
      17: 'Best score found so far at this state',
      18: 'Try taking X = 1..2M piles',
      19: 'My score is the suffix minus what the opponent forces',
      21: 'M grows to max(M, X) for the opponent',
      23: 'Cache the result for this state',
      24: 'Hand it back up the recursion',
    },
  },
};
