import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runBestTimeToBuySellStock(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  // Initial state
  steps.push({
    state: { nums: [...nums], result: 0 },
    highlights: [],
    message: 'Find the maximum profit from buying and selling stock',
    codeLine: 1,
  });

  let left = 0; // buy day
  let right = 1; // sell day
  let maxProfit = 0;

  steps.push({
    state: { nums: [...nums], result: 0 },
    highlights: [left, right],
    pointers: { buy: left, sell: right },
    message: `Initialize buy pointer at day 0 (price=${nums[0]}), sell pointer at day 1 (price=${nums[1]})`,
    codeLine: 3,
  });

  while (right < nums.length) {
    const profit = nums[right] - nums[left];

    // Show current comparison
    steps.push({
      state: { nums: [...nums], result: maxProfit },
      highlights: [left, right],
      pointers: { buy: left, sell: right },
      message: `Buy at day ${left} (price=${nums[left]}), sell at day ${right} (price=${nums[right]}). Profit = ${nums[right]} - ${nums[left]} = ${profit}`,
      codeLine: 5,
      action: 'compare',
    });

    if (profit > 0) {
      if (profit > maxProfit) {
        maxProfit = profit;
        steps.push({
          state: { nums: [...nums], result: maxProfit },
          highlights: [left, right],
          pointers: { buy: left, sell: right },
          message: `Profit ${profit} > 0 and is new max profit! maxProfit = ${maxProfit}`,
          codeLine: 7,
          action: 'found',
        });
      } else {
        steps.push({
          state: { nums: [...nums], result: maxProfit },
          highlights: [left, right],
          pointers: { buy: left, sell: right },
          message: `Profit ${profit} > 0 but not better than maxProfit=${maxProfit}. Move sell pointer right.`,
          codeLine: 7,
          action: 'visit',
        });
      }
    } else {
      // Found a lower price, move buy to this position
      steps.push({
        state: { nums: [...nums], result: maxProfit },
        highlights: [left, right],
        pointers: { buy: left, sell: right },
        message: `Profit ${profit} <= 0. Price at day ${right} is lower. Move buy pointer to day ${right}.`,
        codeLine: 9,
        action: 'visit',
      });
      left = right;
    }

    right++;
  }

  // Final result
  steps.push({
    state: { nums: [...nums], result: maxProfit },
    highlights: [],
    message: `Maximum profit = ${maxProfit}`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const bestTimeToBuySellStock: Algorithm = {
  id: 'best-time-to-buy-sell-stock',
  name: 'Best Time to Buy and Sell Stock',
  category: 'Sliding Window',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Sliding Window — track min price, max profit',
  description:
    'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
  problemUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
  code: {
    python: `def maxProfit(prices):
    left = 0  # buy
    right = 1  # sell
    max_profit = 0

    while right < len(prices):
        profit = prices[right] - prices[left]
        if profit > 0:
            max_profit = max(max_profit, profit)
        else:
            left = right
        right += 1

    return max_profit`,
    javascript: `function maxProfit(prices) {
    let left = 0;  // buy
    let right = 1; // sell
    let maxProfit = 0;

    while (right < prices.length) {
        const profit = prices[right] - prices[left];
        if (profit > 0) {
            maxProfit = Math.max(maxProfit, profit);
        } else {
            left = right;
        }
        right++;
    }

    return maxProfit;
}`,
    java: `public static int maxProfit(int[] prices) {
    int left = 0;  // buy
    int right = 1; // sell
    int maxProfit = 0;

    while (right < prices.length) {
        int profit = prices[right] - prices[left];
        if (profit > 0) {
            maxProfit = Math.max(maxProfit, profit);
        } else {
            left = right;
        }
        right++;
    }

    return maxProfit;
}`,
  },
  defaultInput: [7, 1, 5, 3, 6, 4],
  run: runBestTimeToBuySellStock,
};
