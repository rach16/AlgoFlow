import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface BuySellStockIIInput {
  prices: number[];
}

function runBuySellStockIIPeakValley(input: unknown): AlgorithmStep[] {
  const { prices } = input as BuySellStockIIInput;
  const steps: AlgorithmStep[] = [];
  const n = prices.length;
  let profit = 0;
  let i = 0;

  steps.push({
    state: { nums: [...prices] },
    highlights: [],
    message: `Same answer, different story: walk down to each valley, walk up to the next peak, and bank peak - valley`,
    codeLine: 3,
  });

  while (i < n - 1) {
    const descendStart = i;
    while (i < n - 1 && prices[i + 1] <= prices[i]) i++;
    const valley = prices[i];
    steps.push({
      state: { nums: [...prices] },
      highlights: [i],
      secondary: descendStart === i ? [] : [descendStart],
      pointers: { i },
      message: `Slide down to the valley: prices[${i}] = ${valley} is the cheapest point of this dip — buy here`,
      codeLine: 7,
      action: 'visit',
    });

    while (i < n - 1 && prices[i + 1] >= prices[i]) i++;
    const peak = prices[i];
    profit += peak - valley;
    steps.push({
      state: { nums: [...prices] },
      highlights: [i],
      secondary: [],
      pointers: { i },
      message: `Climb to the peak: prices[${i}] = ${peak}. Sell — profit ${peak} - ${valley} = ${peak - valley}, total ${profit}`,
      codeLine: 11,
      action: 'found',
    });
  }

  steps.push({
    state: { nums: [...prices], result: profit },
    highlights: [],
    message: `Every valley→peak climb captured. Maximum profit = ${profit}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

function runBuySellStockII(input: unknown): AlgorithmStep[] {
  const { prices } = input as BuySellStockIIInput;
  const steps: AlgorithmStep[] = [];
  let profit = 0;

  steps.push({
    state: { nums: [...prices] },
    highlights: [],
    message: `Unlimited transactions means we can buy and sell on consecutive days — so just collect every day the price goes up`,
    codeLine: 2,
  });

  for (let i = 1; i < prices.length; i++) {
    const delta = prices[i] - prices[i - 1];
    if (delta > 0) {
      profit += delta;
      steps.push({
        state: { nums: [...prices] },
        highlights: [i],
        secondary: [i - 1],
        pointers: { i },
        message: `${prices[i - 1]} → ${prices[i]} is +${delta} — buy yesterday, sell today. Profit now ${profit}`,
        codeLine: 5,
        action: 'found',
      });
    } else {
      steps.push({
        state: { nums: [...prices] },
        highlights: [i],
        secondary: [i - 1],
        pointers: { i },
        message: `${prices[i - 1]} → ${prices[i]} is ${delta} — a losing day, hold nothing. Profit stays ${profit}`,
        codeLine: 4,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: { nums: [...prices], result: profit },
    highlights: [],
    message: `Summing only the upward moves gives the maximum profit = ${profit}`,
    codeLine: 6,
    action: 'found',
  });

  return steps;
}

export const buySellStockII: Algorithm = {
  id: 'buy-sell-stock-ii',
  name: 'Best Time to Buy And Sell Stock II',
  category: 'Arrays & Hashing',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Greedy — bank every upward price move',
  description:
    'You are given an array prices where prices[i] is the price of a stock on day i. You may buy and sell as many times as you like, but you can hold at most one share at a time. Return the maximum profit you can achieve.',
  problemUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/',
  code: {
    python: `def maxProfit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit`,
    javascript: `function maxProfit(prices) {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
}`,
    java: `public static int maxProfit(int[] prices) {
    int profit = 0;
    for (int i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
}`,
  },
  defaultInput: { prices: [7, 1, 5, 3, 6, 4, 8, 2, 9] },
  run: runBuySellStockII,
  optimalApproachName: 'Greedy Deltas',
  approaches: [
    {
      id: 'peak-valley',
      name: 'Peak & Valley',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Explicitly finds each local minimum and the following local maximum and banks the difference — the same total as summing daily deltas, but it names the actual buy and sell days.',
      code: {
        python: `def maxProfit(prices):
    i, n = 0, len(prices)
    profit = 0
    while i < n - 1:
        while i < n - 1 and prices[i + 1] <= prices[i]:
            i += 1
        valley = prices[i]
        while i < n - 1 and prices[i + 1] >= prices[i]:
            i += 1
        peak = prices[i]
        profit += peak - valley
    return profit`,
        javascript: `function maxProfit(prices) {
    const n = prices.length;
    let i = 0, profit = 0;
    while (i < n - 1) {
        while (i < n - 1 && prices[i + 1] <= prices[i]) i++;
        const valley = prices[i];
        while (i < n - 1 && prices[i + 1] >= prices[i]) i++;
        const peak = prices[i];
        profit += peak - valley;
    }
    return profit;
}`,
        java: `public static int maxProfit(int[] prices) {
    int n = prices.length;
    int i = 0, profit = 0;
    while (i < n - 1) {
        while (i < n - 1 && prices[i + 1] <= prices[i]) i++;
        int valley = prices[i];
        while (i < n - 1 && prices[i + 1] >= prices[i]) i++;
        int peak = prices[i];
        profit += peak - valley;
    }
    return profit;
}`,
      },
      run: runBuySellStockIIPeakValley,
      lineExplanations: {
        python: {
          1: 'Define function taking the daily price array',
          2: 'Scan index and array length',
          3: 'Running profit across all transactions',
          4: 'Keep pairing valleys with peaks until we run out of days',
          5: 'Slide downhill while tomorrow is not more expensive',
          6: 'Advance to the bottom of the dip',
          7: 'This is the buy price',
          8: 'Slide uphill while tomorrow is not cheaper',
          9: 'Advance to the top of the climb',
          10: 'This is the sell price',
          11: 'Bank the climb',
          12: 'Sum of all valley→peak climbs is the answer',
        },
        javascript: {
          1: 'Define function taking the daily price array',
          2: 'Number of trading days',
          3: 'Scan index and running profit',
          4: 'Keep pairing valleys with peaks until we run out of days',
          5: 'Slide downhill to the bottom of the dip',
          6: 'This is the buy price',
          7: 'Slide uphill to the top of the climb',
          8: 'This is the sell price',
          9: 'Bank the climb',
          11: 'Sum of all valley→peak climbs is the answer',
        },
        java: {
          1: 'Define function taking the daily price array',
          2: 'Number of trading days',
          3: 'Scan index and running profit',
          4: 'Keep pairing valleys with peaks until we run out of days',
          5: 'Slide downhill to the bottom of the dip',
          6: 'This is the buy price',
          7: 'Slide uphill to the top of the climb',
          8: 'This is the sell price',
          9: 'Bank the climb',
          11: 'Sum of all valley→peak climbs is the answer',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the daily price array',
      2: 'Total profit collected so far',
      3: 'Compare each day against the day before it',
      4: 'Did the price rise overnight?',
      5: 'Yes — buy yesterday, sell today, pocket the difference',
      6: 'Every upward move summed is the maximum achievable profit',
    },
    javascript: {
      1: 'Define function taking the daily price array',
      2: 'Total profit collected so far',
      3: 'Compare each day against the day before it',
      4: 'Did the price rise overnight?',
      5: 'Yes — buy yesterday, sell today, pocket the difference',
      8: 'Every upward move summed is the maximum achievable profit',
    },
    java: {
      1: 'Define function taking the daily price array',
      2: 'Total profit collected so far',
      3: 'Compare each day against the day before it',
      4: 'Did the price rise overnight?',
      5: 'Yes — buy yesterday, sell today, pocket the difference',
      8: 'Every upward move summed is the maximum achievable profit',
    },
  },
};
