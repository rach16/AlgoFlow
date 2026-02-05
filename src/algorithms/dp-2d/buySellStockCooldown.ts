import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runBuySellStockCooldown(input: unknown): AlgorithmStep[] {
  const prices = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = prices.length;

  if (n === 0) {
    steps.push({ state: { nums: [], result: 0 }, highlights: [], message: 'No prices. Result: 0', codeLine: 1 });
    return steps;
  }

  // States: hold (have stock), sold (just sold), rest (cooldown or idle)
  // dp2d[i][0] = hold, dp2d[i][1] = sold, dp2d[i][2] = rest
  const dp2d: number[][] = Array.from({ length: n }, () => [0, 0, 0]);

  steps.push({
    state: { nums: [...prices], dp2d: dp2d.map(r => [...r]), result: null },
    highlights: [],
    message: `Maximize profit from prices [${prices.join(', ')}] with cooldown after selling. States: hold, sold, rest`,
    codeLine: 1,
  });

  // Day 0
  dp2d[0][0] = -prices[0]; // hold: bought on day 0
  dp2d[0][1] = 0;          // sold: impossible, so 0 (or -inf, but 0 for simplicity)
  dp2d[0][2] = 0;          // rest: do nothing

  steps.push({
    state: {
      nums: [...prices],
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[0, 0], [0, 1], [0, 2]] as [number, number][],
      result: null,
    },
    highlights: [0],
    message: `Day 0: hold=${dp2d[0][0]} (buy at ${prices[0]}), sold=0, rest=0`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 1; i < n; i++) {
    // Hold: keep holding or buy after rest
    dp2d[i][0] = Math.max(dp2d[i - 1][0], dp2d[i - 1][2] - prices[i]);
    steps.push({
      state: {
        nums: [...prices],
        dp2d: dp2d.map(r => [...r]),
        matrixHighlights: [[i - 1, 0], [i - 1, 2]] as [number, number][],
        matrixSecondary: [[i, 0]] as [number, number][],
        result: null,
      },
      highlights: [i],
      message: `Day ${i} hold = max(prev_hold, prev_rest - price) = max(${dp2d[i - 1][0]}, ${dp2d[i - 1][2]} - ${prices[i]}) = ${dp2d[i][0]}`,
      codeLine: 5,
      action: 'compare',
    });

    // Sold: sell stock we were holding
    dp2d[i][1] = dp2d[i - 1][0] + prices[i];
    steps.push({
      state: {
        nums: [...prices],
        dp2d: dp2d.map(r => [...r]),
        matrixHighlights: [[i - 1, 0]] as [number, number][],
        matrixSecondary: [[i, 1]] as [number, number][],
        result: null,
      },
      highlights: [i],
      message: `Day ${i} sold = prev_hold + price = ${dp2d[i - 1][0]} + ${prices[i]} = ${dp2d[i][1]}`,
      codeLine: 6,
      action: 'insert',
    });

    // Rest: max of previous rest or previous sold (cooldown)
    dp2d[i][2] = Math.max(dp2d[i - 1][2], dp2d[i - 1][1]);
    steps.push({
      state: {
        nums: [...prices],
        dp2d: dp2d.map(r => [...r]),
        matrixHighlights: [[i - 1, 1], [i - 1, 2]] as [number, number][],
        matrixSecondary: [[i, 2]] as [number, number][],
        result: null,
      },
      highlights: [i],
      message: `Day ${i} rest = max(prev_rest, prev_sold) = max(${dp2d[i - 1][2]}, ${dp2d[i - 1][1]}) = ${dp2d[i][2]}`,
      codeLine: 7,
      action: 'insert',
    });
  }

  const result = Math.max(dp2d[n - 1][1], dp2d[n - 1][2]);
  steps.push({
    state: {
      nums: [...prices],
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[n - 1, 1], [n - 1, 2]] as [number, number][],
      result,
    },
    highlights: [],
    message: `Maximum profit: max(sold, rest) on last day = max(${dp2d[n - 1][1]}, ${dp2d[n - 1][2]}) = ${result}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const buySellStockCooldown: Algorithm = {
  id: 'buy-sell-stock-cooldown',
  name: 'Best Time to Buy/Sell Stock with Cooldown',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'State Machine DP — buy, sell, cooldown states',
  description:
    'You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit you can achieve. You may complete as many transactions as you like with the following restriction: After you sell your stock, you cannot buy stock on the next day (i.e., cooldown one day).',
  problemUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/',
  code: {
    python: `def maxProfit(prices):
    n = len(prices)
    if n == 0: return 0
    hold = -prices[0]
    sold = 0
    rest = 0
    for i in range(1, n):
        prev_hold = hold
        hold = max(hold, rest - prices[i])
        rest = max(rest, sold)
        sold = prev_hold + prices[i]
    return max(sold, rest)`,
    javascript: `function maxProfit(prices) {
    const n = prices.length;
    if (n === 0) return 0;
    let hold = -prices[0];
    let sold = 0;
    let rest = 0;
    for (let i = 1; i < n; i++) {
        const prevHold = hold;
        hold = Math.max(hold, rest - prices[i]);
        rest = Math.max(rest, sold);
        sold = prevHold + prices[i];
    }
    return Math.max(sold, rest);
}`,
  },
  defaultInput: [1, 2, 3, 0, 2],
  run: runBuySellStockCooldown,
};
