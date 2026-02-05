import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CoinChangeIIInput {
  amount: number;
  coins: number[];
}

function runCoinChangeII(input: unknown): AlgorithmStep[] {
  const { amount, coins } = input as CoinChangeIIInput;
  const steps: AlgorithmStep[] = [];

  // dp2d[i][j] = number of combinations using first i coins to make amount j
  const numCoins = coins.length;
  const dp2d: number[][] = Array.from({ length: numCoins + 1 }, () => new Array(amount + 1).fill(0));

  steps.push({
    state: { dp2d: dp2d.map(r => [...r]), nums: [...coins], result: null, amount },
    highlights: [],
    message: `Count combinations to make amount ${amount} using coins [${coins.join(', ')}]`,
    codeLine: 1,
  });

  // Base case: one way to make amount 0 (use no coins)
  for (let i = 0; i <= numCoins; i++) {
    dp2d[i][0] = 1;
  }
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: Array.from({ length: numCoins + 1 }, (_, i): [number, number] => [i, 0]),
      nums: [...coins], result: null, amount,
    },
    highlights: [],
    message: `Base case: dp[i][0] = 1 for all i (one way to make amount 0: use no coins)`,
    codeLine: 2,
    action: 'insert',
  });

  for (let i = 1; i <= numCoins; i++) {
    const coin = coins[i - 1];

    steps.push({
      state: { dp2d: dp2d.map(r => [...r]), nums: [...coins], result: null, amount },
      highlights: [i - 1],
      message: `Processing coin ${coin} (coin index ${i})`,
      codeLine: 4,
      action: 'visit',
    });

    for (let j = 1; j <= amount; j++) {
      // Don't use this coin
      dp2d[i][j] = dp2d[i - 1][j];

      if (coin <= j) {
        // Use this coin at least once
        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j], [i, j - coin]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            nums: [...coins], result: null, amount,
          },
          highlights: [],
          pointers: { coin: i - 1, amount: j },
          message: `dp[${i}][${j}] = dp[${i - 1}][${j}] + dp[${i}][${j - coin}] = ${dp2d[i - 1][j]} + ${dp2d[i][j - coin]}`,
          codeLine: 7,
          action: 'compare',
        });

        dp2d[i][j] += dp2d[i][j - coin];
      } else {
        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            nums: [...coins], result: null, amount,
          },
          highlights: [],
          message: `Coin ${coin} > amount ${j}: dp[${i}][${j}] = dp[${i - 1}][${j}] = ${dp2d[i - 1][j]}`,
          codeLine: 6,
        });
      }

      steps.push({
        state: {
          dp2d: dp2d.map(r => [...r]),
          matrixHighlights: [[i, j]] as [number, number][],
          nums: [...coins], result: null, amount,
        },
        highlights: [],
        message: `dp[${i}][${j}] = ${dp2d[i][j]}`,
        codeLine: 8,
        action: 'insert',
      });
    }
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[numCoins, amount]] as [number, number][],
      nums: [...coins], result: dp2d[numCoins][amount], amount,
    },
    highlights: [],
    message: `Number of combinations to make amount ${amount}: ${dp2d[numCoins][amount]}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const coinChangeII: Algorithm = {
  id: 'coin-change-ii',
  name: 'Coin Change II',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n·amount)',
  spaceComplexity: 'O(amount)',
  pattern: 'DP — unbounded knapsack, count combinations',
  description:
    'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the number of combinations that make up that amount.',
  problemUrl: 'https://leetcode.com/problems/coin-change-ii/',
  code: {
    python: `def change(amount, coins):
    dp = [[0]*(amount+1)
          for _ in range(len(coins)+1)]
    for i in range(len(coins)+1):
        dp[i][0] = 1
    for i in range(1, len(coins)+1):
        for j in range(1, amount+1):
            dp[i][j] = dp[i-1][j]
            if coins[i-1] <= j:
                dp[i][j] += dp[i][j-coins[i-1]]
    return dp[len(coins)][amount]`,
    javascript: `function change(amount, coins) {
    const dp = Array.from(
        {length: coins.length+1},
        () => new Array(amount+1).fill(0));
    for (let i = 0; i <= coins.length; i++)
        dp[i][0] = 1;
    for (let i = 1; i <= coins.length; i++) {
        for (let j = 1; j <= amount; j++) {
            dp[i][j] = dp[i-1][j];
            if (coins[i-1] <= j)
                dp[i][j] += dp[i][j-coins[i-1]];
        }
    }
    return dp[coins.length][amount];
}`,
  },
  defaultInput: { amount: 5, coins: [1, 2, 5] },
  run: runCoinChangeII,
};
