import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CoinChangeInput {
  coins: number[];
  amount: number;
}

function runCoinChange(input: unknown): AlgorithmStep[] {
  const { coins, amount } = input as CoinChangeInput;
  const steps: AlgorithmStep[] = [];

  // dp[i] = min coins needed for amount i
  const dp: (number | string | null)[] = new Array(amount + 1).fill(null);
  const dpLabels = Array.from({ length: amount + 1 }, (_, i) => `$${i}`);

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...coins], result: null },
    highlights: [],
    message: `Find minimum coins to make amount ${amount} using coins [${coins.join(', ')}]`,
    codeLine: 1,
  });

  dp[0] = 0;
  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [0], result: null },
    highlights: [],
    message: `Base case: dp[0] = 0 (0 coins needed for amount 0)`,
    codeLine: 2,
    action: 'insert',
  });

  // Initialize rest to Infinity (displayed as "inf")
  for (let i = 1; i <= amount; i++) {
    dp[i] = 'inf';
  }
  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...coins], result: null },
    highlights: [],
    message: `Initialize all other amounts to infinity`,
    codeLine: 3,
  });

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        const prev = dp[i - coin];
        if (prev !== 'inf' && prev !== null) {
          const newVal = (prev as number) + 1;
          const currentVal = dp[i] === 'inf' ? Infinity : (dp[i] as number);

          steps.push({
            state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [i - coin], dpSecondary: [i], result: null },
            highlights: [],
            pointers: { amount: i, coin },
            message: `dp[${i}] = min(dp[${i}], dp[${i} - ${coin}] + 1) = min(${dp[i]}, ${prev} + 1) = min(${dp[i]}, ${newVal})`,
            codeLine: 6,
            action: 'compare',
          });

          if (newVal < currentVal) {
            dp[i] = newVal;
            steps.push({
              state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [i], result: null },
              highlights: [],
              pointers: { amount: i },
              message: `dp[${i}] updated to ${newVal} using coin ${coin}`,
              codeLine: 7,
              action: 'insert',
            });
          }
        }
      }
    }
  }

  const result = dp[amount] === 'inf' ? -1 : dp[amount];
  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [amount], result },
    highlights: [],
    message: result === -1
      ? `Cannot make amount ${amount} with given coins. Result: -1`
      : `Minimum coins to make amount ${amount}: ${result}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runCoinChangeBFS(input: unknown): AlgorithmStep[] {
  const { coins, amount } = input as CoinChangeInput;
  const steps: AlgorithmStep[] = [];

  // dp[i] = BFS level (number of coins) at which amount i was first reached
  const dp: (number | null)[] = new Array(amount + 1).fill(null);
  const dpLabels = Array.from({ length: amount + 1 }, (_, i) => `$${i}`);

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...coins], result: null },
    highlights: [],
    message: `BFS view: think of amounts as graph nodes and coins as edges. The first time BFS reaches ${amount}, the level number IS the minimum coin count`,
    codeLine: 3,
  });

  if (amount === 0) {
    dp[0] = 0;
    steps.push({
      state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [0], result: 0 },
      highlights: [],
      message: `Amount is 0 — zero coins needed. Result: 0`,
      codeLine: 5,
      action: 'found',
    });
    return steps;
  }

  const visited: boolean[] = new Array(amount + 1).fill(false);
  visited[0] = true;
  dp[0] = 0;
  let queue: number[] = [0];
  let level = 0;

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [0], result: null },
    highlights: [],
    message: `Start BFS from amount 0 (level 0). Each BFS level spends exactly one more coin`,
    codeLine: 8,
    action: 'push',
  });

  while (queue.length > 0) {
    level++;
    const nextQueue: number[] = [];

    steps.push({
      state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [...queue], result: null },
      highlights: [],
      pointers: { level },
      message: `Level ${level}: expand frontier {${queue.map((q) => '$' + q).join(', ')}} — every amount reached here uses exactly ${level} coin${level > 1 ? 's' : ''}`,
      codeLine: 11,
      action: 'visit',
    });

    for (const cur of queue) {
      for (const coin of coins) {
        const nxt = cur + coin;
        if (nxt === amount) {
          dp[nxt] = level;
          steps.push({
            state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [nxt], result: level },
            highlights: [],
            pointers: { amount: nxt, coin },
            message: `$${cur} + ${coin}¢ coin = $${amount} — target reached at level ${level}. BFS guarantees this is the MINIMUM: ${level} coins`,
            codeLine: 17,
            action: 'found',
          });
          return steps;
        }
        if (nxt < amount && !visited[nxt]) {
          visited[nxt] = true;
          dp[nxt] = level;
          nextQueue.push(nxt);
          steps.push({
            state: { dp: [...dp], dpLabels, nums: [...coins], dpHighlights: [cur], dpSecondary: [nxt], result: null },
            highlights: [],
            pointers: { amount: nxt, coin },
            message: `$${cur} + ${coin}¢ coin reaches $${nxt} for the first time (${level} coin${level > 1 ? 's' : ''}) — enqueue it`,
            codeLine: 20,
            action: 'push',
          });
        }
      }
    }

    queue = nextQueue;
  }

  steps.push({
    state: { dp: [...dp], dpLabels, nums: [...coins], result: -1 },
    highlights: [],
    message: `BFS exhausted all reachable amounts without hitting $${amount}. Result: -1`,
    codeLine: 21,
    action: 'found',
  });

  return steps;
}

export const coinChange: Algorithm = {
  id: 'coin-change',
  name: 'Coin Change',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n·amount)',
  spaceComplexity: 'O(amount)',
  pattern: 'DP — dp[i] = min coins for amount i, try each coin',
  description:
    'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount cannot be made up, return -1.',
  problemUrl: 'https://leetcode.com/problems/coin-change/',
  code: {
    python: `def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i],
                            dp[i - coin] + 1)
    return dp[amount] if dp[amount] != \
        float('inf') else -1`,
    javascript: `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i],
                                 dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    java: `public static int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    return dp[amount] > amount ? -1 : dp[amount];
}`,
  },
  defaultInput: { coins: [1, 5, 10, 25], amount: 11 },
  run: runCoinChange,
  optimalApproachName: 'Bottom-Up DP',
  approaches: [
    {
      id: 'bfs-level-order',
      name: 'BFS (Level Order)',
      timeComplexity: 'O(n·amount)',
      spaceComplexity: 'O(amount)',
      description:
        'Instead of filling a table for every amount, treat amounts as graph nodes and coins as edges — BFS finds the target in the fewest hops, which is exactly the fewest coins.',
      code: {
        python: `from collections import deque

def coinChange(coins, amount):
    if amount == 0:
        return 0
    visited = [False] * (amount + 1)
    queue = deque([0])
    visited[0] = True
    level = 0
    while queue:
        level += 1
        for _ in range(len(queue)):
            cur = queue.popleft()
            for coin in coins:
                nxt = cur + coin
                if nxt == amount:
                    return level
                if nxt < amount and not visited[nxt]:
                    visited[nxt] = True
                    queue.append(nxt)
    return -1`,
        javascript: `function coinChange(coins, amount) {
    if (amount === 0) return 0;
    const visited = new Array(amount + 1).fill(false);
    visited[0] = true;
    let queue = [0];
    let level = 0;
    while (queue.length > 0) {
        level++;
        const next = [];
        for (const cur of queue) {
            for (const coin of coins) {
                const nxt = cur + coin;
                if (nxt === amount) return level;
                if (nxt < amount && !visited[nxt]) {
                    visited[nxt] = true;
                    next.push(nxt);
                }
            }
        }
        queue = next;
    }
    return -1;
}`,
        java: `public static int coinChange(int[] coins, int amount) {
    if (amount == 0) return 0;
    boolean[] visited = new boolean[amount + 1];
    visited[0] = true;
    Queue<Integer> queue = new LinkedList<>();
    queue.add(0);
    int level = 0;
    while (!queue.isEmpty()) {
        level++;
        int size = queue.size();
        for (int k = 0; k < size; k++) {
            int cur = queue.poll();
            for (int coin : coins) {
                int nxt = cur + coin;
                if (nxt == amount) return level;
                if (nxt < amount && !visited[nxt]) {
                    visited[nxt] = true;
                    queue.add(nxt);
                }
            }
        }
    }
    return -1;
}`,
      },
      run: runCoinChangeBFS,
      lineExplanations: {
        python: {
          1: 'Import deque for an efficient FIFO queue',
          3: 'Define function taking coins and amount',
          4: 'Edge case: amount 0 needs no coins',
          5: 'Return 0 immediately',
          6: 'Track amounts already reached (avoid revisits)',
          7: 'BFS queue starts at amount 0',
          8: 'Mark the start as visited',
          9: 'Level counter = number of coins spent so far',
          10: 'Process the frontier until queue is empty',
          11: 'Entering a new level = spending one more coin',
          12: 'Expand every node in the current level',
          13: 'Take the next amount off the queue',
          14: 'Try adding each coin denomination',
          15: 'New amount after using this coin',
          16: 'Reached the target amount?',
          17: 'BFS level = minimum coins — return it',
          18: 'Only enqueue unseen amounts below the target',
          19: 'Mark as visited so it is never re-added',
          20: 'Enqueue for the next level',
          21: 'Queue emptied without reaching amount: impossible',
        },
        javascript: {
          1: 'Define function taking coins and amount',
          2: 'Edge case: amount 0 needs no coins',
          3: 'Track amounts already reached (avoid revisits)',
          4: 'Mark the start as visited',
          5: 'BFS frontier starts at amount 0',
          6: 'Level counter = number of coins spent so far',
          7: 'Process frontiers until none are left',
          8: 'Entering a new level = spending one more coin',
          9: 'Collect the next frontier here',
          10: 'Expand every amount in the current frontier',
          11: 'Try adding each coin denomination',
          12: 'New amount after using this coin',
          13: 'Reached the target: level = minimum coins',
          14: 'Only enqueue unseen amounts below the target',
          15: 'Mark as visited so it is never re-added',
          16: 'Add to the next frontier',
          20: 'Swap in the next frontier',
          22: 'Queue emptied without reaching amount: impossible',
        },
        java: {
          1: 'Define method taking coins and amount',
          2: 'Edge case: amount 0 needs no coins',
          3: 'Track amounts already reached (avoid revisits)',
          4: 'Mark the start as visited',
          5: 'FIFO queue for BFS',
          6: 'BFS starts at amount 0',
          7: 'Level counter = number of coins spent so far',
          8: 'Process the queue until empty',
          9: 'Entering a new level = spending one more coin',
          10: 'Snapshot current level size',
          11: 'Expand exactly the nodes of this level',
          12: 'Take the next amount off the queue',
          13: 'Try adding each coin denomination',
          14: 'New amount after using this coin',
          15: 'Reached the target: level = minimum coins',
          16: 'Only enqueue unseen amounts below the target',
          17: 'Mark as visited so it is never re-added',
          18: 'Enqueue for the next level',
          23: 'Queue emptied without reaching amount: impossible',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking coins and amount',
      2: 'Init DP array with infinity (unreachable)',
      3: 'Base case: 0 coins needed for amount 0',
      4: 'Try each amount from 1 to target',
      5: 'Try each coin denomination',
      6: 'Only use coin if it fits in current amount',
      7: 'Take min of current and using this coin',
      8: 'Continue min computation on next line',
      9: 'Return result or -1 if amount unreachable',
      10: 'Check if infinity means no solution',
    },
    javascript: {
      1: 'Define function taking coins and amount',
      2: 'Init DP array with Infinity (unreachable)',
      3: 'Base case: 0 coins needed for amount 0',
      4: 'Try each amount from 1 to target',
      5: 'Try each coin denomination',
      6: 'Only use coin if it fits in current amount',
      7: 'Take min of current and using this coin',
      8: 'Continue min computation on next line',
      12: 'Return result or -1 if amount unreachable',
    },
    java: {
      1: 'Define method taking coins and amount',
      2: 'Init DP array for amounts 0..amount',
      3: 'Fill with amount+1 as sentinel for infinity',
      4: 'Base case: 0 coins needed for amount 0',
      6: 'Try each amount from 1 to target',
      7: 'Try each coin denomination',
      8: 'Only use coin if it fits in current amount',
      9: 'Take min of current and using this coin',
      14: 'Return result or -1 if amount unreachable',
    },
  },
};
