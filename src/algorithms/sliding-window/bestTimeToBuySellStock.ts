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

function runBestTimeMinPriceTracking(input: unknown): AlgorithmStep[] {
  const nums = input as number[];
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { nums: [...nums], result: 0 },
    highlights: [],
    message: 'Single pass: remember the cheapest price seen so far — the best profit on any day is its price minus that running minimum',
    codeLine: 1,
  });

  let minPrice = Infinity;
  let minDay = 0;
  let maxProfit = 0;

  steps.push({
    state: { nums: [...nums], result: 0 },
    highlights: [],
    message: 'Initialize minPrice = Infinity (no buy day yet) and maxProfit = 0',
    codeLine: 2,
  });

  for (let i = 0; i < nums.length; i++) {
    const price = nums[i];

    if (price < minPrice) {
      minPrice = price;
      minDay = i;
      steps.push({
        state: { nums: [...nums], result: maxProfit },
        highlights: [i],
        pointers: { buy: minDay, day: i },
        message: `Day ${i}: price ${price} is a new low. Any future sale does best buying here, so minPrice = ${minPrice}`,
        codeLine: 7,
        action: 'visit',
      });
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
      steps.push({
        state: { nums: [...nums], result: maxProfit },
        highlights: [i],
        secondary: [minDay],
        pointers: { buy: minDay, day: i },
        message: `Day ${i}: sell at ${price} after buying at ${minPrice} (day ${minDay}) gives profit ${maxProfit} — new best!`,
        codeLine: 9,
        action: 'found',
      });
    } else {
      steps.push({
        state: { nums: [...nums], result: maxProfit },
        highlights: [i],
        secondary: [minDay],
        pointers: { buy: minDay, day: i },
        message: `Day ${i}: selling at ${price} gives only ${price - minPrice}, not better than maxProfit = ${maxProfit}`,
        codeLine: 8,
        action: 'compare',
      });
    }
  }

  steps.push({
    state: { nums: [...nums], result: maxProfit },
    highlights: [],
    message: `Maximum profit = ${maxProfit}. One running-minimum variable replaced the explicit buy pointer entirely`,
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
  optimalApproachName: 'Two Pointers',
  approaches: [
    {
      id: 'min-price-tracking',
      name: 'Track Minimum Price',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of moving an explicit buy pointer, keep a single running minimum of all prices seen so far and check each day\'s profit against it — a Kadane-style one-variable scan.',
      code: {
        python: `def maxProfit(prices):
    min_price = float("inf")
    max_profit = 0

    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price

    return max_profit`,
        javascript: `function maxProfit(prices) {
    let minPrice = Infinity;
    let maxProfit = 0;

    for (const price of prices) {
        if (price < minPrice) {
            minPrice = price;
        } else if (price - minPrice > maxProfit) {
            maxProfit = price - minPrice;
        }
    }

    return maxProfit;
}`,
        java: `public static int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE;
    int maxProfit = 0;

    for (int price : prices) {
        if (price < minPrice) {
            minPrice = price;
        } else if (price - minPrice > maxProfit) {
            maxProfit = price - minPrice;
        }
    }

    return maxProfit;
}`,
      },
      run: runBestTimeMinPriceTracking,
      lineExplanations: {
        python: {
          1: 'Define function taking array of stock prices',
          2: 'Running minimum price seen so far (start at infinity)',
          3: 'Best profit found so far',
          5: 'Scan each day\'s price once, left to right',
          6: 'Is today cheaper than every earlier day?',
          7: 'Yes — the best possible buy day is now today',
          8: 'Otherwise, would selling today beat the best profit?',
          9: 'Yes — record the new maximum profit',
          11: 'Return the best profit found (0 if prices only fell)',
        },
        javascript: {
          1: 'Define function taking array of stock prices',
          2: 'Running minimum price seen so far (start at Infinity)',
          3: 'Best profit found so far',
          5: 'Scan each day\'s price once, left to right',
          6: 'Is today cheaper than every earlier day?',
          7: 'Yes — the best possible buy day is now today',
          8: 'Otherwise, would selling today beat the best profit?',
          9: 'Yes — record the new maximum profit',
          13: 'Return the best profit found (0 if prices only fell)',
        },
        java: {
          1: 'Define function taking array of stock prices',
          2: 'Running minimum price seen so far (start at max int)',
          3: 'Best profit found so far',
          5: 'Scan each day\'s price once, left to right',
          6: 'Is today cheaper than every earlier day?',
          7: 'Yes — the best possible buy day is now today',
          8: 'Otherwise, would selling today beat the best profit?',
          9: 'Yes — record the new maximum profit',
          13: 'Return the best profit found (0 if prices only fell)',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking array of stock prices',
      2: 'Left pointer = buy day (start at day 0)',
      3: 'Right pointer = sell day (start at day 1)',
      4: 'Track the best profit found so far',
      6: 'Slide the sell pointer across all days',
      7: 'Calculate profit: sell price minus buy price',
      8: 'Is there a profit?',
      9: 'Update max profit if this is the best so far',
      11: 'No profit — found a cheaper buy price, move buy pointer here',
      12: 'Always move sell pointer forward',
      14: 'Return the maximum profit found',
    },
    javascript: {
      1: 'Define function taking array of stock prices',
      2: 'Left pointer = buy day (start at day 0)',
      3: 'Right pointer = sell day (start at day 1)',
      4: 'Track the best profit found so far',
      6: 'Slide the sell pointer across all days',
      7: 'Calculate profit: sell price minus buy price',
      8: 'Is there a profit?',
      9: 'Update max profit if this is the best so far',
      11: 'No profit — found a cheaper buy price, move buy pointer here',
      13: 'Always move sell pointer forward',
      16: 'Return the maximum profit found',
    },
    java: {
      1: 'Define function taking array of stock prices',
      2: 'Left pointer = buy day (start at day 0)',
      3: 'Right pointer = sell day (start at day 1)',
      4: 'Track the best profit found so far',
      6: 'Slide the sell pointer across all days',
      7: 'Calculate profit: sell price minus buy price',
      8: 'Is there a profit?',
      9: 'Update max profit if this is the best so far',
      11: 'No profit — found a cheaper buy price, move buy pointer here',
      13: 'Always move sell pointer forward',
      16: 'Return the maximum profit found',
    },
  },
};
