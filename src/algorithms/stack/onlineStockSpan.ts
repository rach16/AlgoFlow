import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runOnlineStockSpan(input: unknown): AlgorithmStep[] {
  const prices = input as number[];
  const steps: AlgorithmStep[] = [];
  const stack: [number, number][] = []; // [price, span]
  const spans: number[] = [];
  const display = () => stack.map(([p, s]) => `${p} (span ${s})`);

  steps.push({
    state: { nums: [...prices], stack: [] },
    highlights: [],
    message:
      'Span of a day = how many consecutive days back (today included) had a price <= today. Keep a stack of (price, span) pairs whose prices strictly decrease from bottom to top.',
    codeLine: 3,
  });

  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    let span = 1;

    steps.push({
      state: { nums: [...prices], stack: display() },
      highlights: [i],
      pointers: { i },
      message: `next(${price}) — start with span 1, because today always counts toward its own span.`,
      codeLine: 6,
      action: 'visit',
    });

    while (stack.length > 0 && stack[stack.length - 1][0] <= price) {
      const popped = stack.pop() as [number, number];
      span += popped[1];
      steps.push({
        state: { nums: [...prices], stack: display() },
        highlights: [i],
        pointers: { i },
        message: `Top of stack is ${popped[0]} <= ${price}, so today swallows that whole block: span += ${popped[1]} -> ${span}. Pop it — a day cheaper than today can never end a future streak before today does.`,
        codeLine: 8,
        action: 'pop',
      });
    }

    stack.push([price, span]);
    spans.push(span);

    steps.push({
      state: { nums: [...prices], stack: display() },
      highlights: [i],
      pointers: { i },
      message:
        stack.length > 1
          ? `Push (${price}, span ${span}). The pair below holds ${stack[stack.length - 2][0]} > ${price}, so the streak stops there. span[${i}] = ${span}`
          : `Push (${price}, span ${span}). Nothing is left below, so every earlier day was <= ${price}. span[${i}] = ${span}`,
      codeLine: 9,
      action: 'push',
    });
  }

  steps.push({
    state: { nums: [...prices], stack: display(), result: spans },
    highlights: [],
    message: `All days answered: spans = [${spans.join(', ')}]. Every price is pushed once and popped at most once, so the whole sequence of calls costs O(n) total.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

function runOnlineStockSpanJump(input: unknown): AlgorithmStep[] {
  const prices = input as number[];
  const n = prices.length;
  const steps: AlgorithmStep[] = [];
  const span: (number | null)[] = new Array(n).fill(null);

  steps.push({
    state: { nums: [...prices], dp: [...span] },
    highlights: [],
    message:
      'No stack at all: store every span in an array. Walking left one day at a time would be O(n^2), so instead JUMP backwards over whole blocks using spans already computed.',
    codeLine: 3,
  });

  for (let i = 0; i < n; i++) {
    span[i] = 1;
    let j = i - 1;

    steps.push({
      state: { nums: [...prices], dp: [...span], dpHighlights: [i] },
      highlights: [i],
      pointers: j >= 0 ? { i, j } : { i },
      message: `Day ${i} (price ${prices[i]}): span starts at 1. Look at day ${j}${j < 0 ? ' — nothing to the left, done' : ` (price ${prices[j]})`}.`,
      codeLine: 5,
      action: 'visit',
    });

    while (j >= 0 && prices[j] <= prices[i]) {
      const jumped = span[j] as number;
      span[i] = (span[i] as number) + jumped;
      const from = j;
      j -= jumped;
      steps.push({
        state: { nums: [...prices], dp: [...span], dpHighlights: [i], dpSecondary: [from] },
        highlights: [i],
        secondary: [from],
        pointers: j >= 0 ? { i, j } : { i },
        message: `prices[${from}] = ${prices[from]} <= ${prices[i]}, and day ${from} already knows its own streak is ${jumped} long — every day in it is <= ${prices[from]} <= ${prices[i]}. Absorb all ${jumped} at once (span = ${span[i]}) and jump to index ${j}.`,
        codeLine: 9,
        action: 'compare',
      });
    }

    steps.push({
      state: { nums: [...prices], dp: [...span], dpHighlights: [i] },
      highlights: [i],
      pointers: { i },
      message:
        j < 0
          ? `Walked off the left edge — every earlier day was <= ${prices[i]}. span[${i}] = ${span[i]}.`
          : `prices[${j}] = ${prices[j]} > ${prices[i]} — that day blocks the streak. span[${i}] = ${span[i]}.`,
      codeLine: 7,
    });
  }

  const result = span.map((v) => v as number);
  steps.push({
    state: { nums: [...prices], dp: [...span], result },
    highlights: [],
    message: `spans = [${result.join(', ')}] — same answers as the stack version, but the "stack" is hidden inside the jump pointers of the span array itself.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const onlineStockSpan: Algorithm = {
  id: 'online-stock-span',
  name: 'Online Stock Span',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(1) amortized per call, O(n) total',
  spaceComplexity: 'O(n)',
  pattern: 'Monotonic Stack — decreasing prices, absorb spans on pop',
  description:
    'Design an algorithm that collects daily price quotes for a stock and returns the span of that stock price for the current day. The span is the maximum number of consecutive days (ending today, going backwards) for which the price was less than or equal to today\'s price.',
  problemUrl: 'https://leetcode.com/problems/online-stock-span/',
  code: {
    python: `class StockSpanner:
    def __init__(self):
        self.stack = []  # (price, span) pairs

    def next(self, price):
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span`,
    javascript: `class StockSpanner {
    constructor() {
        this.stack = []; // [price, span] pairs
    }

    next(price) {
        let span = 1;
        while (this.stack.length && this.stack[this.stack.length - 1][0] <= price) {
            span += this.stack.pop()[1];
        }
        this.stack.push([price, span]);
        return span;
    }
}`,
    java: `class StockSpanner {
    private Deque<int[]> stack; // [price, span]

    public StockSpanner() {
        stack = new ArrayDeque<>();
    }

    public int next(int price) {
        int span = 1;
        while (!stack.isEmpty() && stack.peek()[0] <= price) {
            span += stack.pop()[1];
        }
        stack.push(new int[] { price, span });
        return span;
    }
}`,
  },
  defaultInput: [100, 80, 60, 70, 60, 75, 85],
  run: runOnlineStockSpan,
  optimalApproachName: 'Monotonic Stack',
  approaches: [
    {
      id: 'span-jump-array',
      name: 'Span Jump Array',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Drop the stack entirely and keep only the span array — each already-computed span acts as a jump pointer that skips a whole block of dominated days in one hop.',
      code: {
        python: `def stockSpans(prices):
    n = len(prices)
    span = [0] * n
    for i in range(n):
        span[i] = 1
        j = i - 1
        while j >= 0 and prices[j] <= prices[i]:
            span[i] += span[j]
            j -= span[j]
    return span`,
        javascript: `function stockSpans(prices) {
    const n = prices.length;
    const span = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        span[i] = 1;
        let j = i - 1;
        while (j >= 0 && prices[j] <= prices[i]) {
            span[i] += span[j];
            j -= span[j];
        }
    }
    return span;
}`,
        java: `public static int[] stockSpans(int[] prices) {
    int n = prices.length;
    int[] span = new int[n];
    for (int i = 0; i < n; i++) {
        span[i] = 1;
        int j = i - 1;
        while (j >= 0 && prices[j] <= prices[i]) {
            span[i] += span[j];
            j -= span[j];
        }
    }
    return span;
}`,
      },
      run: runOnlineStockSpanJump,
      lineExplanations: {
        python: {
          1: 'Take the whole price series and return every span',
          2: 'Number of days',
          3: 'span[i] will hold the answer for day i',
          4: 'Answer the days left to right, so earlier spans are ready to reuse',
          5: 'Today always counts toward its own span',
          6: 'Start scanning at yesterday',
          7: 'Keep going while day j is cheap enough to be part of the streak',
          8: 'Day j already knows its streak length — absorb the whole block at once',
          9: 'Jump past that entire block instead of stepping one day back',
          10: 'Every day now has its span',
        },
        javascript: {
          1: 'Take the whole price series and return every span',
          2: 'Number of days',
          3: 'span[i] will hold the answer for day i',
          4: 'Answer the days left to right, so earlier spans are ready to reuse',
          5: 'Today always counts toward its own span',
          6: 'Start scanning at yesterday',
          7: 'Keep going while day j is cheap enough to be part of the streak',
          8: 'Day j already knows its streak length — absorb the whole block at once',
          9: 'Jump past that entire block instead of stepping one day back',
          12: 'Every day now has its span',
        },
        java: {
          1: 'Take the whole price series and return every span',
          2: 'Number of days',
          3: 'span[i] will hold the answer for day i',
          4: 'Answer the days left to right, so earlier spans are ready to reuse',
          5: 'Today always counts toward its own span',
          6: 'Start scanning at yesterday',
          7: 'Keep going while day j is cheap enough to be part of the streak',
          8: 'Day j already knows its streak length — absorb the whole block at once',
          9: 'Jump past that entire block instead of stepping one day back',
          12: 'Every day now has its span',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define the StockSpanner class',
      2: 'Constructor runs once before any query',
      3: 'Stack of (price, span) pairs, prices strictly decreasing bottom to top',
      5: "Handle one day's price and return its span",
      6: 'Today itself always contributes 1',
      7: 'While the day on top is not more expensive than today...',
      8: '...today swallows its whole streak, so add its span and pop it',
      9: 'Push today with the streak it now owns',
      10: 'Return the span for today',
    },
    javascript: {
      1: 'Define the StockSpanner class',
      2: 'Constructor runs once before any query',
      3: 'Stack of [price, span] pairs, prices strictly decreasing bottom to top',
      6: "Handle one day's price and return its span",
      7: 'Today itself always contributes 1',
      8: 'While the day on top is not more expensive than today...',
      9: '...today swallows its whole streak, so add its span and pop it',
      11: 'Push today with the streak it now owns',
      12: 'Return the span for today',
    },
    java: {
      1: 'Define the StockSpanner class',
      2: 'Stack of [price, span] pairs, prices strictly decreasing bottom to top',
      4: 'Constructor runs once before any query',
      5: 'Create the pair stack using ArrayDeque',
      8: "Handle one day's price and return its span",
      9: 'Today itself always contributes 1',
      10: 'While the day on top is not more expensive than today...',
      11: '...today swallows its whole streak, so add its span and pop it',
      13: 'Push today with the streak it now owns',
      14: 'Return the span for today',
    },
  },
};
