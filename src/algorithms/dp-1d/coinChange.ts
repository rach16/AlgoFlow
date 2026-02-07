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
};
