import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runCandy(input: unknown): AlgorithmStep[] {
  const ratings = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = ratings.length;
  const dpLabels = ratings.map((_, i) => `${i}`);

  const candies: number[] = new Array(n).fill(1);

  steps.push({
    state: {
      nums: [...ratings],
      dp: [...candies],
      dpLabels,
      result: 'Minimum candies?',
    },
    highlights: [],
    message: `Every child needs at least 1 candy, and must beat any lower-rated neighbour. The two constraints (left neighbour, right neighbour) fight each other, so satisfy them in two separate passes.`,
    codeLine: 3,
  });

  for (let i = 1; i < n; i++) {
    const rises = ratings[i] > ratings[i - 1];
    if (rises) candies[i] = candies[i - 1] + 1;

    steps.push({
      state: {
        nums: [...ratings],
        dp: [...candies],
        dpLabels,
        dpHighlights: [i],
        dpSecondary: [i - 1],
        result: `Left pass: [${candies.join(', ')}]`,
      },
      highlights: [i],
      secondary: [i - 1],
      pointers: { i },
      message: rises
        ? `Left pass, i = ${i}: rating ${ratings[i]} > ${ratings[i - 1]}, so this child must out-earn the left neighbour: candies[${i}] = ${candies[i - 1]} + 1 = ${candies[i]}.`
        : `Left pass, i = ${i}: rating ${ratings[i]} is not above ${ratings[i - 1]}, so the left rule imposes nothing. Keep candies[${i}] = ${candies[i]}.`,
      codeLine: 6,
      action: rises ? 'insert' : 'compare',
    });
  }

  for (let i = n - 2; i >= 0; i--) {
    const drops = ratings[i] > ratings[i + 1];
    const before = candies[i];
    if (drops) candies[i] = Math.max(candies[i], candies[i + 1] + 1);
    const bumped = candies[i] !== before;

    steps.push({
      state: {
        nums: [...ratings],
        dp: [...candies],
        dpLabels,
        dpHighlights: [i],
        dpSecondary: [i + 1],
        result: `Right pass: [${candies.join(', ')}]`,
      },
      highlights: [i],
      secondary: [i + 1],
      pointers: { i },
      message: drops
        ? `Right pass, i = ${i}: rating ${ratings[i]} > ${ratings[i + 1]}, so candies[${i}] = max(${before}, ${candies[i + 1]} + 1) = ${candies[i]}${bumped ? ' — bumped up' : ' — the left pass already covered it'}.`
        : `Right pass, i = ${i}: rating ${ratings[i]} is not above ${ratings[i + 1]}, nothing to enforce. candies[${i}] stays ${candies[i]}.`,
      codeLine: 9,
      action: bumped ? 'insert' : 'compare',
    });
  }

  const total = candies.reduce((a, b) => a + b, 0);

  steps.push({
    state: {
      nums: [...ratings],
      dp: [...candies],
      dpLabels,
      result: total,
    },
    highlights: ratings.map((_, i) => i),
    message: `Both passes satisfied at once by taking the max at each index: [${candies.join(', ')}]. Total = ${candies.join(' + ')} = ${total}.`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

function runCandySlope(input: unknown): AlgorithmStep[] {
  const ratings = input as number[];
  const steps: AlgorithmStep[] = [];
  const n = ratings.length;

  if (n <= 1) {
    steps.push({
      state: { nums: [...ratings], result: n },
      highlights: [],
      message: `${n} child${n === 1 ? '' : 'ren'} — the answer is just ${n}.`,
      codeLine: 4,
      action: 'found',
    });
    return steps;
  }

  let total = 1;
  let up = 0;
  let down = 0;
  let peak = 0;

  steps.push({
    state: {
      nums: [...ratings],
      hashMap: { up: 0, down: 0, peak: 0, total: 1 },
      result: 1,
    },
    highlights: [0],
    message: `O(1)-space view: walk the ratings once and measure each slope. A rising run of length u costs 1+2+...+u extra; a falling run of length d costs the same, except the peak is shared and only needs paying for once.`,
    codeLine: 6,
  });

  for (let i = 1; i < n; i++) {
    let msg: string;
    let line: number;

    if (ratings[i] > ratings[i - 1]) {
      up += 1;
      peak = up;
      down = 0;
      total += 1 + up;
      msg = `i = ${i}: ${ratings[i]} > ${ratings[i - 1]} — climbing. The rise is now ${up} long, so this child needs ${1 + up} candies. Total = ${total}.`;
      line = 12;
    } else if (ratings[i] === ratings[i - 1]) {
      up = 0;
      down = 0;
      peak = 0;
      total += 1;
      msg = `i = ${i}: ${ratings[i]} equals ${ratings[i - 1]} — a tie resets every slope. This child needs only 1 candy. Total = ${total}.`;
      line = 15;
    } else {
      up = 0;
      down += 1;
      const discount = peak >= down ? 1 : 0;
      total += 1 + down - discount;
      msg = `i = ${i}: ${ratings[i]} < ${ratings[i - 1]} — descending, run length ${down}. Cost 1 + ${down}${discount ? ` - 1 (the peak of height ${peak} already covers this step)` : ' (the descent has outgrown the peak, so the peak must be raised)'} = ${1 + down - discount}. Total = ${total}.`;
      line = 19;
    }

    steps.push({
      state: {
        nums: [...ratings],
        hashMap: { up, down, peak, total },
        result: total,
      },
      highlights: [i],
      secondary: [i - 1],
      pointers: { i },
      message: msg,
      codeLine: line,
      action: 'compare',
    });
  }

  steps.push({
    state: {
      nums: [...ratings],
      hashMap: { up, down, peak, total },
      result: total,
    },
    highlights: ratings.map((_, i) => i),
    message: `One pass, no candy array: total = ${total}. Same answer as the two-pass method, in O(1) extra space.`,
    codeLine: 20,
    action: 'found',
  });

  return steps;
}

export const candy: Algorithm = {
  id: 'candy',
  name: 'Candy',
  category: 'Greedy',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Greedy — two passes, one per neighbour constraint',
  description:
    'There are n children standing in a line, each with a rating value. Each child must get at least one candy, and any child with a higher rating than an adjacent child must get more candies than that neighbour. Return the minimum number of candies you need.',
  problemUrl: 'https://leetcode.com/problems/candy/',
  code: {
    python: `def candy(ratings):
    n = len(ratings)
    candies = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            candies[i] = candies[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            candies[i] = max(candies[i], candies[i + 1] + 1)
    return sum(candies)`,
    javascript: `function candy(ratings) {
    const n = ratings.length;
    const candies = new Array(n).fill(1);
    for (let i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) {
            candies[i] = candies[i - 1] + 1;
        }
    }
    for (let i = n - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1]) {
            candies[i] = Math.max(candies[i], candies[i + 1] + 1);
        }
    }
    return candies.reduce((a, b) => a + b, 0);
}`,
    java: `public static int candy(int[] ratings) {
    int n = ratings.length;
    int[] candies = new int[n];
    Arrays.fill(candies, 1);
    for (int i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) {
            candies[i] = candies[i - 1] + 1;
        }
    }
    for (int i = n - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1]) {
            candies[i] = Math.max(candies[i], candies[i + 1] + 1);
        }
    }
    int total = 0;
    for (int c : candies) total += c;
    return total;
}`,
  },
  defaultInput: [1, 2, 2, 3, 1],
  run: runCandy,
  optimalApproachName: 'Two Passes',
  approaches: [
    {
      id: 'slope-counting',
      name: 'Single-Pass Slope Counting',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Instead of storing a candy array and sweeping twice, measure each rising and falling run on the fly and add its arithmetic-series cost, repaying the peak only when the descent outgrows it.',
      code: {
        python: `def candy(ratings):
    n = len(ratings)
    if n <= 1:
        return n
    total = 1
    up, down, peak = 0, 0, 0
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            up += 1
            peak = up
            down = 0
            total += 1 + up
        elif ratings[i] == ratings[i - 1]:
            up = down = peak = 0
            total += 1
        else:
            up = 0
            down += 1
            total += 1 + down - (1 if peak >= down else 0)
    return total`,
        javascript: `function candy(ratings) {
    const n = ratings.length;
    if (n <= 1) return n;
    let total = 1;
    let up = 0, down = 0, peak = 0;
    for (let i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) {
            up++;
            peak = up;
            down = 0;
            total += 1 + up;
        } else if (ratings[i] === ratings[i - 1]) {
            up = down = peak = 0;
            total += 1;
        } else {
            up = 0;
            down++;
            total += 1 + down - (peak >= down ? 1 : 0);
        }
    }
    return total;
}`,
        java: `public static int candy(int[] ratings) {
    int n = ratings.length;
    if (n <= 1) return n;
    int total = 1;
    int up = 0, down = 0, peak = 0;
    for (int i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) {
            up++;
            peak = up;
            down = 0;
            total += 1 + up;
        } else if (ratings[i] == ratings[i - 1]) {
            up = down = peak = 0;
            total += 1;
        } else {
            up = 0;
            down++;
            total += 1 + down - (peak >= down ? 1 : 0);
        }
    }
    return total;
}`,
      },
      run: runCandySlope,
      lineExplanations: {
        python: {
          1: 'Define function taking ratings',
          2: 'Number of children',
          3: 'Zero or one child is trivial',
          4: 'Each gets exactly one candy',
          5: 'The first child always costs 1',
          6: 'Length of the current rise, current fall, and the last peak height',
          7: 'Walk the ratings once',
          8: 'Climbing',
          9: 'The rise grows',
          10: 'Remember how tall this peak got',
          11: 'Any previous descent is over',
          12: 'This child costs 1 + the height of the rise',
          13: 'Equal ratings',
          14: 'A tie breaks every slope',
          15: 'The child needs only the mandatory 1 candy',
          16: 'Descending',
          17: 'The rise is over',
          18: 'The fall grows',
          19: 'Pay for the descent; while the peak is still taller it absorbs one candy',
          20: 'Return the running total',
        },
        javascript: {
          1: 'Define function taking ratings',
          2: 'Number of children',
          3: 'Zero or one child is trivial',
          4: 'The first child always costs 1',
          5: 'Length of the current rise, current fall, and the last peak height',
          6: 'Walk the ratings once',
          7: 'Climbing',
          8: 'The rise grows',
          9: 'Remember how tall this peak got',
          10: 'Any previous descent is over',
          11: 'This child costs 1 + the height of the rise',
          12: 'Equal ratings break every slope',
          13: 'Reset the counters',
          14: 'The child needs only the mandatory 1 candy',
          15: 'Descending',
          16: 'The rise is over',
          17: 'The fall grows',
          18: 'Pay for the descent; a taller peak absorbs one candy',
          21: 'Return the running total',
        },
        java: {
          1: 'Define method taking ratings',
          2: 'Number of children',
          3: 'Zero or one child is trivial',
          4: 'The first child always costs 1',
          5: 'Length of the current rise, current fall, and the last peak height',
          6: 'Walk the ratings once',
          7: 'Climbing',
          8: 'The rise grows',
          9: 'Remember how tall this peak got',
          10: 'Any previous descent is over',
          11: 'This child costs 1 + the height of the rise',
          12: 'Equal ratings break every slope',
          13: 'Reset the counters',
          14: 'The child needs only the mandatory 1 candy',
          15: 'Descending',
          16: 'The rise is over',
          17: 'The fall grows',
          18: 'Pay for the descent; a taller peak absorbs one candy',
          21: 'Return the running total',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking ratings',
      2: 'Number of children',
      3: 'Everyone starts with the mandatory single candy',
      4: 'Left-to-right pass fixes the "beat my left neighbour" rule',
      5: 'This child out-rates the one on the left',
      6: 'So give them one more candy than that neighbour',
      7: 'Right-to-left pass fixes the "beat my right neighbour" rule',
      8: 'This child out-rates the one on the right',
      9: 'Take the max so the left rule is not broken',
      10: 'The minimum total is the sum of the array',
    },
    javascript: {
      1: 'Define function taking ratings',
      2: 'Number of children',
      3: 'Everyone starts with the mandatory single candy',
      4: 'Left-to-right pass fixes the "beat my left neighbour" rule',
      5: 'This child out-rates the one on the left',
      6: 'So give them one more candy than that neighbour',
      9: 'Right-to-left pass fixes the "beat my right neighbour" rule',
      10: 'This child out-rates the one on the right',
      11: 'Take the max so the left rule is not broken',
      14: 'The minimum total is the sum of the array',
    },
    java: {
      1: 'Define method taking ratings',
      2: 'Number of children',
      3: 'Candy count per child',
      4: 'Everyone starts with the mandatory single candy',
      5: 'Left-to-right pass fixes the "beat my left neighbour" rule',
      6: 'This child out-rates the one on the left',
      7: 'So give them one more candy than that neighbour',
      10: 'Right-to-left pass fixes the "beat my right neighbour" rule',
      11: 'This child out-rates the one on the right',
      12: 'Take the max so the left rule is not broken',
      15: 'Sum the candies',
      16: 'Add each child\'s share',
      17: 'Return the minimum total',
    },
  },
};
