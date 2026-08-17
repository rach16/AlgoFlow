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

function runBuySellStockCooldownMemo(input: unknown): AlgorithmStep[] {
  const prices = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = prices.length;
  const MAX_STEPS = 75;

  if (n === 0) {
    steps.push({ state: { nums: [], result: 0 }, highlights: [], message: 'No prices. Result: 0', codeLine: 2 });
    return steps;
  }

  // memoGrid[i][0] = best profit from day i when we CAN BUY, [i][1] = when we CAN SELL
  const memoGrid: (number | string)[][] = Array.from({ length: n }, () => ['·', '·']);
  const memo = new Map<string, number>();

  steps.push({
    state: { nums: [...prices], dp2d: memoGrid.map(r => [...r]), result: null },
    highlights: [],
    message: `Top-down: dfs(day, canBuy) = best profit from this day onward. Two states per day (col 0 = can buy, col 1 = holding/can sell); selling jumps to day+2 for the cooldown`,
    codeLine: 4,
  });

  function dfs(i: number, buying: boolean): number {
    if (i >= n) return 0;
    const key = `${i},${buying}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    const col = buying ? 0 : 1;
    if (steps.length < MAX_STEPS) {
      steps.push({
        state: { nums: [...prices], dp2d: memoGrid.map(r => [...r]), matrixHighlights: [[i, col]] as [number, number][], result: null },
        highlights: [i],
        pointers: { day: i },
        message: `dfs(${i}, ${buying ? 'canBuy' : 'canSell'}): price is ${prices[i]} — try acting vs cooling down`,
        codeLine: 4,
        action: 'visit',
      });
    }

    const cooldown = dfs(i + 1, buying);
    let best: number;
    let detail: string;
    if (buying) {
      const buy = dfs(i + 1, false) - prices[i];
      best = Math.max(buy, cooldown);
      detail = `buy = dfs(${i + 1}, canSell) - ${prices[i]} = ${buy}, wait = ${cooldown}`;
    } else {
      const sell = dfs(i + 2, true) + prices[i];
      best = Math.max(sell, cooldown);
      detail = `sell = dfs(${i + 2}, canBuy) + ${prices[i]} = ${sell} (skip day ${i + 1}: cooldown!), hold = ${cooldown}`;
    }

    memo.set(key, best);
    memoGrid[i][col] = best;

    if (steps.length < MAX_STEPS) {
      steps.push({
        state: { nums: [...prices], dp2d: memoGrid.map(r => [...r]), matrixHighlights: [[i, col]] as [number, number][], result: null },
        highlights: [i],
        pointers: { day: i },
        message: `memo[day ${i}][${buying ? 'canBuy' : 'canSell'}] = max(${detail}) = ${best}`,
        codeLine: buying ? 12 : 15,
        action: 'insert',
      });
    }
    return best;
  }

  const result = dfs(0, true);

  steps.push({
    state: { nums: [...prices], dp2d: memoGrid.map(r => [...r]), matrixHighlights: [[0, 0]] as [number, number][], result },
    highlights: [],
    message: `Maximum profit: dfs(0, canBuy) = ${result} — the cooldown is enforced by the i+2 jump after every sell`,
    codeLine: 17,
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
    java: `public int maxProfit(int[] prices) {
    int n = prices.length;
    if (n == 0) return 0;
    int hold = -prices[0];
    int sold = 0;
    int rest = 0;
    for (int i = 1; i < n; i++) {
        int prevHold = hold;
        hold = Math.max(hold, rest - prices[i]);
        rest = Math.max(rest, sold);
        sold = prevHold + prices[i];
    }
    return Math.max(sold, rest);
}`,
  },
  defaultInput: [1, 2, 3, 0, 2],
  run: runBuySellStockCooldown,
  optimalApproachName: 'State Machine DP',
  approaches: [
    {
      id: 'top-down-memo-dfs',
      name: 'Top-Down Memoized DFS',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of rolling hold/sold/rest variables forward, recurse on (day, canBuy) decisions and cache them — the cooldown appears naturally as an i+2 jump after selling.',
      code: {
        python: `def maxProfit(prices):
    n = len(prices)
    memo = {}
    def dfs(i, buying):
        if i >= n:
            return 0
        if (i, buying) in memo:
            return memo[(i, buying)]
        cooldown = dfs(i + 1, buying)
        if buying:
            buy = dfs(i + 1, False) - prices[i]
            memo[(i, buying)] = max(buy, cooldown)
        else:
            sell = dfs(i + 2, True) + prices[i]
            memo[(i, buying)] = max(sell, cooldown)
        return memo[(i, buying)]
    return dfs(0, True)`,
        javascript: `function maxProfit(prices) {
    const n = prices.length;
    const memo = new Map();
    function dfs(i, buying) {
        if (i >= n) return 0;
        const key = i + ',' + buying;
        if (memo.has(key)) return memo.get(key);
        const cooldown = dfs(i + 1, buying);
        let best;
        if (buying) {
            const buy = dfs(i + 1, false) - prices[i];
            best = Math.max(buy, cooldown);
        } else {
            const sell = dfs(i + 2, true) + prices[i];
            best = Math.max(sell, cooldown);
        }
        memo.set(key, best);
        return best;
    }
    return dfs(0, true);
}`,
        java: `public int maxProfit(int[] prices) {
    Integer[][] memo = new Integer[prices.length][2];
    return dfs(prices, 0, 1, memo);
}

private int dfs(int[] prices, int i, int buying, Integer[][] memo) {
    if (i >= prices.length) return 0;
    if (memo[i][buying] != null) return memo[i][buying];
    int cooldown = dfs(prices, i + 1, buying, memo);
    int best;
    if (buying == 1) {
        int buy = dfs(prices, i + 1, 0, memo) - prices[i];
        best = Math.max(buy, cooldown);
    } else {
        int sell = dfs(prices, i + 2, 1, memo) + prices[i];
        best = Math.max(sell, cooldown);
    }
    memo[i][buying] = best;
    return best;
}`,
      },
      run: runBuySellStockCooldownMemo,
      lineExplanations: {
        python: {
          1: 'Define function taking prices array',
          2: 'Get number of days',
          3: 'Memo dictionary keyed by (day, buying) state',
          4: 'dfs(i, buying) = best profit from day i onward',
          5: 'Base case: past the last day',
          6: 'No more profit possible',
          7: 'Cache check: state already solved?',
          8: 'Return the cached profit',
          9: 'Option available in every state: do nothing today',
          10: 'If we are allowed to buy',
          11: 'Buy today: pay prices[i], tomorrow we can sell',
          12: 'Keep the better of buying vs waiting',
          13: 'Otherwise we are holding stock',
          14: 'Sell today: gain prices[i], then SKIP a day (cooldown)',
          15: 'Keep the better of selling vs holding',
          16: 'Return the memoized best for this state',
          17: 'Start on day 0, allowed to buy',
        },
        javascript: {
          1: 'Define function taking prices array',
          2: 'Get number of days',
          3: 'Memo map keyed by "day,buying" state',
          4: 'dfs(i, buying) = best profit from day i onward',
          5: 'Base case: past the last day — no profit',
          6: 'Build the memo key for this state',
          7: 'Return the cached profit if already solved',
          8: 'Option available in every state: do nothing today',
          9: 'Best profit for this state',
          10: 'If we are allowed to buy',
          11: 'Buy today: pay prices[i], tomorrow we can sell',
          12: 'Keep the better of buying vs waiting',
          13: 'Otherwise we are holding stock',
          14: 'Sell today: gain prices[i], then SKIP a day (cooldown)',
          15: 'Keep the better of selling vs holding',
          17: 'Cache the answer before returning',
          18: 'Return the best for this state',
          20: 'Start on day 0, allowed to buy',
        },
        java: {
          1: 'Define method taking prices array',
          2: 'Integer[day][buying] memo — null marks unsolved states',
          3: 'Start on day 0, allowed to buy (1 = can buy)',
          6: 'dfs(i, buying) = best profit from day i onward',
          7: 'Base case: past the last day — no profit',
          8: 'Return the cached profit if already solved',
          9: 'Option available in every state: do nothing today',
          10: 'Best profit for this state',
          11: 'If we are allowed to buy',
          12: 'Buy today: pay prices[i], tomorrow we can sell',
          13: 'Keep the better of buying vs waiting',
          14: 'Otherwise we are holding stock',
          15: 'Sell today: gain prices[i], then SKIP a day (cooldown)',
          16: 'Keep the better of selling vs holding',
          18: 'Cache the answer before returning',
          19: 'Return the best for this state',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking prices array',
      2: 'Get number of days',
      3: 'Return 0 if no prices given',
      4: 'Init hold state: buy stock on day 0',
      5: 'Init sold state: nothing sold yet',
      6: 'Init rest state: idle on day 0',
      7: 'Iterate from day 1 through last day',
      8: 'Save previous hold value before updating',
      9: 'Hold: keep holding or buy after resting',
      10: 'Rest: stay resting or enter cooldown after sell',
      11: 'Sold: sell stock held from previous day',
      12: 'Return max of sold and rest on last day',
    },
    javascript: {
      1: 'Define function taking prices array',
      2: 'Get number of days',
      3: 'Return 0 if no prices given',
      4: 'Init hold state: buy stock on day 0',
      5: 'Init sold state: nothing sold yet',
      6: 'Init rest state: idle on day 0',
      7: 'Iterate from day 1 through last day',
      8: 'Save previous hold value before updating',
      9: 'Hold: keep holding or buy after resting',
      10: 'Rest: stay resting or enter cooldown after sell',
      11: 'Sold: sell stock held from previous day',
      13: 'Return max of sold and rest on last day',
    },
    java: {
      1: 'Define method taking prices array',
      2: 'Get number of days',
      3: 'Return 0 if no prices given',
      4: 'Init hold state: buy stock on day 0',
      5: 'Init sold state: nothing sold yet',
      6: 'Init rest state: idle on day 0',
      7: 'Iterate from day 1 through last day',
      8: 'Save previous hold value before updating',
      9: 'Hold: keep holding or buy after resting',
      10: 'Rest: stay resting or enter cooldown after sell',
      11: 'Sold: sell stock held from previous day',
      13: 'Return max of sold and rest on last day',
    },
  },
};
