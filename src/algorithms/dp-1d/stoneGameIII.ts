import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function verdict(diff: number): string {
  if (diff > 0) return 'Alice';
  if (diff < 0) return 'Bob';
  return 'Tie';
}

function runStoneGameIII(input: unknown): AlgorithmStep[] {
  const stoneValue = input as number[];
  const n = stoneValue.length;
  const steps: AlgorithmStep[] = [];

  // dp[i] = best achievable (current player score - opponent score) from index i on
  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => (i === n ? 'end' : `i=${i}`));

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...stoneValue], result: null },
    highlights: [],
    message: `Both players play optimally on [${stoneValue.join(', ')}]. Define dp[i] = best (my score − their score) achievable starting at index i — one number captures the whole game`,
    codeLine: 1,
  });

  dp[n] = 0;
  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...stoneValue], dpHighlights: [n], result: null },
    highlights: [],
    message: `Base case dp[${n}] = 0: no stones left, so neither player gains anything`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = n - 1; i >= 0; i--) {
    steps.push({
      state: { dp: [...dp], dpLabels, nums: [...stoneValue], dpSecondary: [i], result: null },
      highlights: [i],
      pointers: { i },
      message: `Solve position ${i} (stone ${stoneValue[i]}): the player to move may take 1, 2, or 3 stones from here`,
      codeLine: 4,
      action: 'visit',
    });

    let best = -Infinity;
    let take = 0;
    for (let k = 0; k < 3; k++) {
      if (i + k < n) {
        take += stoneValue[i + k];
        const candidate = take - (dp[i + k + 1] as number);
        const improved = candidate > best;
        if (improved) best = candidate;
        steps.push({
          state: {
            dp: [...dp],
            dpLabels,
            nums: [...stoneValue],
            dpHighlights: [i + k + 1],
            dpSecondary: [i],
            result: null,
          },
          highlights: Array.from({ length: k + 1 }, (_, x) => i + x),
          pointers: { i, taking: k + 1 },
          message: `Take ${k + 1} stone${k > 0 ? 's' : ''} (sum ${take}); the opponent then faces position ${i + k + 1} where their edge is ${dp[i + k + 1]} ⇒ my edge = ${take} − ${dp[i + k + 1]} = ${candidate}${improved ? ' — new best' : ' — worse, discard'}`,
          codeLine: 10,
          action: improved ? 'insert' : 'compare',
        });
      }
    }

    dp[i] = best;
    steps.push({
      state: { dp: [...dp], dpLabels, nums: [...stoneValue], dpHighlights: [i], result: null },
      highlights: [i],
      pointers: { i },
      message: `dp[${i}] = ${best} — the mover at index ${i} finishes ${Math.abs(best)} point${Math.abs(best) === 1 ? '' : 's'} ${best >= 0 ? 'ahead' : 'behind'}`,
      codeLine: 10,
      action: 'insert',
    });
  }

  const diff = dp[0] as number;
  const answer = verdict(diff);
  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...stoneValue], dpHighlights: [0], result: answer },
    highlights: [0],
    message: `dp[0] = ${diff} is Alice's final margin ⇒ ${answer === 'Tie' ? 'the game is a Tie' : answer + ' wins'}`,
    codeLine: diff > 0 ? 12 : diff < 0 ? 14 : 15,
    action: 'found',
  });

  return steps;
}

function runStoneGameIIIMemo(input: unknown): AlgorithmStep[] {
  const stoneValue = input as number[];
  const n = stoneValue.length;
  const steps: AlgorithmStep[] = [];

  const memo: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => (i === n ? 'end' : `i=${i}`));

  steps.push({
    state: { dp: [...memo], dpLabels, nums: [...stoneValue], result: null },
    highlights: [],
    message: `Top-down: dfs(i) returns the best (my score − their score) from index i. Recursion writes the same table the bottom-up loop does, just discovered on demand`,
    codeLine: 1,
  });

  const dfs = (i: number): number => {
    if (i >= n) {
      steps.push({
        state: { dp: [...memo], dpLabels, nums: [...stoneValue], dpHighlights: [n], result: null },
        highlights: [],
        message: `dfs(${i}): past the last stone — the game is over, edge is 0`,
        codeLine: 7,
        action: 'found',
      });
      return 0;
    }
    if (memo[i] !== null) {
      steps.push({
        state: { dp: [...memo], dpLabels, nums: [...stoneValue], dpHighlights: [i], result: null },
        highlights: [i],
        pointers: { i },
        message: `dfs(${i}) already solved as ${memo[i]} — reuse the cached value instead of replaying that subgame`,
        codeLine: 9,
        action: 'found',
      });
      return memo[i] as number;
    }

    steps.push({
      state: { dp: [...memo], dpLabels, nums: [...stoneValue], dpSecondary: [i], result: null },
      highlights: [i],
      pointers: { i },
      message: `dfs(${i}): unexplored. Try taking 1, 2, or 3 stones and hand the rest to the opponent`,
      codeLine: 5,
      action: 'visit',
    });

    let best = -Infinity;
    let take = 0;
    for (let k = 0; k < 3; k++) {
      if (i + k < n) {
        take += stoneValue[i + k];
        steps.push({
          state: {
            dp: [...memo],
            dpLabels,
            nums: [...stoneValue],
            dpSecondary: [i],
            result: null,
          },
          highlights: Array.from({ length: k + 1 }, (_, x) => i + x),
          pointers: { i, taking: k + 1 },
          message: `Take ${k + 1} stone${k > 0 ? 's' : ''} (sum ${take}) ⇒ recurse into dfs(${i + k + 1}) to learn the opponent's edge`,
          codeLine: 15,
          action: 'push',
        });
        const opponent = dfs(i + k + 1);
        const candidate = take - opponent;
        if (candidate > best) best = candidate;
      }
    }

    memo[i] = best;
    steps.push({
      state: { dp: [...memo], dpLabels, nums: [...stoneValue], dpHighlights: [i], result: null },
      highlights: [i],
      pointers: { i },
      message: `All three moves compared: memo[${i}] = ${best}. Cached, so any parent call reads it in O(1)`,
      codeLine: 16,
      action: 'insert',
    });
    return best;
  };

  const diff = dfs(0);
  const answer = verdict(diff);

  steps.push({
    state: { dp: [...memo], dpLabels, nums: [...stoneValue], dpHighlights: [0], result: answer },
    highlights: [0],
    message: `dfs(0) = ${diff} ⇒ ${answer === 'Tie' ? 'the game is a Tie' : answer + ' wins'}. Only ${n} distinct subgames were ever solved`,
    codeLine: diff > 0 ? 21 : diff < 0 ? 23 : 24,
    action: 'found',
  });

  return steps;
}

export const stoneGameIII: Algorithm = {
  id: 'stone-game-iii',
  name: 'Stone Game III',
  category: '1-D DP',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — suffix game DP: dp[i] = max(take − dp[i+k])',
  description:
    'Alice and Bob take turns removing 1, 2, or 3 stones from the front of a row, each scoring the sum of the stones they take. Both play optimally to maximize their own score; return "Alice", "Bob", or "Tie".',
  problemUrl: 'https://leetcode.com/problems/stone-game-iii/',
  code: {
    python: `def stoneGameIII(stoneValue):
    n = len(stoneValue)
    dp = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        dp[i] = float('-inf')
        take = 0
        for k in range(3):
            if i + k < n:
                take += stoneValue[i + k]
                dp[i] = max(dp[i], take - dp[i + k + 1])
    if dp[0] > 0:
        return "Alice"
    if dp[0] < 0:
        return "Bob"
    return "Tie"`,
    javascript: `function stoneGameIII(stoneValue) {
    const n = stoneValue.length;
    const dp = new Array(n + 1).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        dp[i] = -Infinity;
        let take = 0;
        for (let k = 0; k < 3; k++) {
            if (i + k < n) {
                take += stoneValue[i + k];
                dp[i] = Math.max(dp[i], take - dp[i + k + 1]);
            }
        }
    }
    if (dp[0] > 0) return "Alice";
    if (dp[0] < 0) return "Bob";
    return "Tie";
}`,
    java: `public static String stoneGameIII(int[] stoneValue) {
    int n = stoneValue.length;
    int[] dp = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) {
        dp[i] = Integer.MIN_VALUE;
        int take = 0;
        for (int k = 0; k < 3; k++) {
            if (i + k < n) {
                take += stoneValue[i + k];
                dp[i] = Math.max(dp[i], take - dp[i + k + 1]);
            }
        }
    }
    if (dp[0] > 0) return "Alice";
    if (dp[0] < 0) return "Bob";
    return "Tie";
}`,
  },
  defaultInput: [1, 2, 3, 7],
  run: runStoneGameIII,
  optimalApproachName: 'Suffix DP',
  approaches: [
    {
      id: 'top-down-memo',
      name: 'Top-Down Memoization',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Express the same score-difference recurrence as a recursion from index 0 and cache each index, which mirrors how the game is actually reasoned about move by move.',
      code: {
        python: `def stoneGameIII(stoneValue):
    n = len(stoneValue)
    memo = {}

    def dfs(i):
        if i >= n:
            return 0
        if i in memo:
            return memo[i]
        best = float('-inf')
        take = 0
        for k in range(3):
            if i + k < n:
                take += stoneValue[i + k]
                best = max(best, take - dfs(i + k + 1))
        memo[i] = best
        return best

    diff = dfs(0)
    if diff > 0:
        return "Alice"
    if diff < 0:
        return "Bob"
    return "Tie"`,
        javascript: `function stoneGameIII(stoneValue) {
    const n = stoneValue.length;
    const memo = new Map();

    function dfs(i) {
        if (i >= n) return 0;
        if (memo.has(i)) return memo.get(i);
        let best = -Infinity;
        let take = 0;
        for (let k = 0; k < 3; k++) {
            if (i + k < n) {
                take += stoneValue[i + k];
                best = Math.max(best, take - dfs(i + k + 1));
            }
        }
        memo.set(i, best);
        return best;
    }

    const diff = dfs(0);
    if (diff > 0) return "Alice";
    if (diff < 0) return "Bob";
    return "Tie";
}`,
        java: `public static String stoneGameIII(int[] stoneValue) {
    int[] memo = new int[stoneValue.length];
    Arrays.fill(memo, Integer.MIN_VALUE);
    int diff = dfs(stoneValue, 0, memo);
    if (diff > 0) return "Alice";
    if (diff < 0) return "Bob";
    return "Tie";
}

private static int dfs(int[] stoneValue, int i, int[] memo) {
    int n = stoneValue.length;
    if (i >= n) return 0;
    if (memo[i] != Integer.MIN_VALUE) return memo[i];
    int best = Integer.MIN_VALUE;
    int take = 0;
    for (int k = 0; k < 3; k++) {
        if (i + k < n) {
            take += stoneValue[i + k];
            best = Math.max(best, take - dfs(stoneValue, i + k + 1, memo));
        }
    }
    memo[i] = best;
    return best;
}`,
      },
      run: runStoneGameIIIMemo,
      lineExplanations: {
        python: {
          1: 'Define function taking the stone row',
          2: 'Number of stones',
          3: 'Cache from index to best score difference',
          5: 'dfs(i) = best (my score − their score) from index i',
          6: 'Ran past the last stone?',
          7: 'No stones left means no advantage either way',
          8: 'Already solved this suffix?',
          9: 'Return the cached difference',
          10: 'Track the best difference over the three moves',
          11: 'Running sum of the stones taken this turn',
          12: 'A turn may take 1, 2, or 3 stones',
          13: 'Stop early if fewer stones remain',
          14: 'Add the next stone to this turn',
          15: 'My gain minus whatever the opponent achieves after me',
          16: 'Cache before returning so each index is solved once',
          17: 'Hand the difference back up',
          19: 'Alice moves first, so dfs(0) is her margin',
          20: 'Positive margin means Alice scored more',
          21: 'Alice wins',
          22: 'Negative margin means Bob scored more',
          23: 'Bob wins',
          24: 'Equal scores',
        },
        javascript: {
          1: 'Define function taking the stone row',
          2: 'Number of stones',
          3: 'Cache from index to best score difference',
          5: 'dfs(i) = best (my score − their score) from index i',
          6: 'Past the last stone: no advantage either way',
          7: 'Cache hit returns immediately',
          8: 'Track the best difference over the three moves',
          9: 'Running sum of the stones taken this turn',
          10: 'A turn may take 1, 2, or 3 stones',
          11: 'Stop early if fewer stones remain',
          12: 'Add the next stone to this turn',
          13: 'My gain minus whatever the opponent achieves after me',
          16: 'Cache before returning so each index is solved once',
          17: 'Hand the difference back up',
          20: 'Alice moves first, so dfs(0) is her margin',
          21: 'Positive margin: Alice wins',
          22: 'Negative margin: Bob wins',
          23: 'Otherwise the scores are equal',
        },
        java: {
          1: 'Define method taking the stone row',
          2: 'Memo array indexed by starting position',
          3: 'MIN_VALUE marks "not computed yet"',
          4: 'Alice moves first, so dfs(0) is her margin',
          5: 'Positive margin: Alice wins',
          6: 'Negative margin: Bob wins',
          7: 'Otherwise the scores are equal',
          10: 'dfs(i) = best (my score − their score) from index i',
          11: 'Number of stones',
          12: 'Past the last stone: no advantage either way',
          13: 'Cache hit returns immediately',
          14: 'Track the best difference over the three moves',
          15: 'Running sum of the stones taken this turn',
          16: 'A turn may take 1, 2, or 3 stones',
          17: 'Stop early if fewer stones remain',
          18: 'Add the next stone to this turn',
          19: 'My gain minus whatever the opponent achieves after me',
          22: 'Cache before returning so each index is solved once',
          23: 'Hand the difference back up',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the stone row',
      2: 'Number of stones',
      3: 'dp[i] = best score difference starting at i; dp[n] = 0 is the base case',
      4: 'Fill the table backwards so dp[i+k+1] is always ready',
      5: 'Start this position at negative infinity',
      6: 'Running sum of the stones taken this turn',
      7: 'A turn may take 1, 2, or 3 stones',
      8: 'Stop early if fewer stones remain',
      9: 'Add the next stone to this turn',
      10: 'My gain minus the opponent’s best from the remaining suffix',
      11: 'dp[0] is Alice’s final margin',
      12: 'Positive margin: Alice wins',
      13: 'Negative margin means Bob scored more',
      14: 'Bob wins',
      15: 'Equal scores means a tie',
    },
    javascript: {
      1: 'Define function taking the stone row',
      2: 'Number of stones',
      3: 'dp[i] = best score difference starting at i; dp[n] = 0 is the base case',
      4: 'Fill the table backwards so dp[i+k+1] is always ready',
      5: 'Start this position at negative infinity',
      6: 'Running sum of the stones taken this turn',
      7: 'A turn may take 1, 2, or 3 stones',
      8: 'Stop early if fewer stones remain',
      9: 'Add the next stone to this turn',
      10: 'My gain minus the opponent’s best from the remaining suffix',
      14: 'Positive dp[0]: Alice wins',
      15: 'Negative dp[0]: Bob wins',
      16: 'Otherwise the scores are equal',
    },
    java: {
      1: 'Define method taking the stone row',
      2: 'Number of stones',
      3: 'dp[i] = best score difference starting at i; dp[n] = 0 is the base case',
      4: 'Fill the table backwards so dp[i+k+1] is always ready',
      5: 'Start this position at the smallest possible value',
      6: 'Running sum of the stones taken this turn',
      7: 'A turn may take 1, 2, or 3 stones',
      8: 'Stop early if fewer stones remain',
      9: 'Add the next stone to this turn',
      10: 'My gain minus the opponent’s best from the remaining suffix',
      14: 'Positive dp[0]: Alice wins',
      15: 'Negative dp[0]: Bob wins',
      16: 'Otherwise the scores are equal',
    },
  },
};
