import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface StoneGameInput {
  piles: number[];
}

function runStoneGame(input: unknown): AlgorithmStep[] {
  const { piles } = input as StoneGameInput;
  const steps: AlgorithmStep[] = [];
  const n = piles.length;

  const dp2d: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  const snap = (
    hl: [number, number][],
    sec: [number, number][],
    result: boolean | null,
  ) => ({
    nums: [...piles],
    dp2d: dp2d.map(r => [...r]),
    matrixHighlights: hl,
    matrixSecondary: sec,
    result,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Alice and Bob alternately take a pile from either END of [${piles.join(', ')}]. Both play perfectly. Does Alice win?`,
    codeLine: 1,
  });

  steps.push({
    state: snap([], [], null),
    highlights: [],
    message: `Key reframing: don't track two scores, track ONE number. dp[i][j] = (current player's score − opponent's score) on the sub-array piles[i..j] with both playing optimally. Alice wins iff dp[0][${n - 1}] > 0`,
    codeLine: 3,
  });

  for (let i = 0; i < n; i++) {
    dp2d[i][i] = piles[i];
  }

  steps.push({
    state: snap(Array.from({ length: n }, (_, i): [number, number] => [i, i]), [], null),
    highlights: [],
    message: `Base case — the diagonal. One pile left means the player to move simply takes it: dp[i][i] = piles[i]. The lower triangle stays 0 and is unused (i > j is not a real range)`,
    codeLine: 5,
    action: 'insert',
  });

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      const takeLeft = piles[i] - dp2d[i + 1][j];
      const takeRight = piles[j] - dp2d[i][j - 1];

      steps.push({
        state: snap([[i + 1, j], [i, j - 1]], [[i, j]], null),
        highlights: Array.from({ length: len }, (_, k) => i + k),
        pointers: { i, j },
        message: `Range [${i}..${j}] = [${piles.slice(i, j + 1).join(', ')}]. Take the left pile ${piles[i]} and the opponent then leads by dp[${i + 1}][${j}] = ${dp2d[i + 1][j]}, so my margin is ${piles[i]} − ${dp2d[i + 1][j]} = ${takeLeft}. Take the right pile ${piles[j]}: ${piles[j]} − ${dp2d[i][j - 1]} = ${takeRight}`,
        codeLine: 9,
        action: 'compare',
      });

      dp2d[i][j] = Math.max(takeLeft, takeRight);

      steps.push({
        state: snap([[i, j]], [], null),
        highlights: Array.from({ length: len }, (_, k) => i + k),
        pointers: { i, j },
        message: `dp[${i}][${j}] = max(${takeLeft}, ${takeRight}) = ${dp2d[i][j]} — best to take the ${takeLeft >= takeRight ? `LEFT pile ${piles[i]}` : `RIGHT pile ${piles[j]}`}. Subtracting the opponent's margin is what makes one table serve both players`,
        codeLine: 10,
        action: 'insert',
      });
    }
  }

  const margin = dp2d[0][n - 1];

  steps.push({
    state: snap([[0, n - 1]], [], margin > 0),
    highlights: [],
    message: `dp[0][${n - 1}] = ${margin}: Alice finishes ${margin} stones ahead of Bob, so the answer is ${margin > 0 ? 'true' : 'false'}`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runStoneGameParityMath(input: unknown): AlgorithmStep[] {
  const { piles } = input as StoneGameInput;
  const steps: AlgorithmStep[] = [];
  const n = piles.length;

  const evenIdx = piles.map((_, i) => i).filter(i => i % 2 === 0);
  const oddIdx = piles.map((_, i) => i).filter(i => i % 2 === 1);
  const evenSum = evenIdx.reduce((a, i) => a + piles[i], 0);
  const oddSum = oddIdx.reduce((a, i) => a + piles[i], 0);
  const total = evenSum + oddSum;

  steps.push({
    state: { nums: [...piles], result: null },
    highlights: [],
    message: `No table needed. Colour the piles by index parity, like a checkerboard: even indices ${evenIdx.join(', ')} vs odd indices ${oddIdx.join(', ')}`,
    codeLine: 1,
  });

  steps.push({
    state: { nums: [...piles], result: null },
    highlights: evenIdx,
    secondary: oddIdx,
    message: `Even-index piles sum to ${evenSum}`,
    codeLine: 2,
    action: 'visit',
  });

  steps.push({
    state: { nums: [...piles], result: null },
    highlights: oddIdx,
    secondary: evenIdx,
    message: `Odd-index piles sum to ${oddSum}`,
    codeLine: 3,
    action: 'visit',
  });

  steps.push({
    state: { nums: [...piles], result: null },
    highlights: evenIdx,
    secondary: oddIdx,
    message: `The parity argument: n = ${n} is even, so the two ends of the row ALWAYS have opposite parity. Whichever colour Alice takes first, Bob is left with a row whose two ends are both the other colour — he is forced to hand that colour back`,
    codeLine: 4,
  });

  steps.push({
    state: { nums: [...piles], result: null },
    highlights: evenSum > oddSum ? evenIdx : oddIdx,
    secondary: evenSum > oddSum ? oddIdx : evenIdx,
    message: `So Alice can guarantee ALL evens or ALL odds — her choice. She picks the bigger group: ${evenSum > oddSum ? `evens (${evenSum} > ${oddSum})` : `odds (${oddSum} > ${evenSum})`}`,
    codeLine: 6,
    action: 'compare',
  });

  steps.push({
    state: { nums: [...piles], result: null },
    highlights: [],
    message: `And a tie is impossible: the total ${total} is odd, so ${evenSum} and ${oddSum} can never be equal. Alice strictly wins`,
    codeLine: 7,
  });

  steps.push({
    state: { nums: [...piles], result: Math.max(evenSum, oddSum) > Math.min(evenSum, oddSum) },
    highlights: evenSum > oddSum ? evenIdx : oddIdx,
    message: `Alice always wins — return true, in O(n) time and O(1) space. The DP table confirms it but was never necessary`,
    codeLine: 8,
    action: 'found',
  });

  return steps;
}

export const stoneGame: Algorithm = {
  id: 'stone-game',
  name: 'Stone Game',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(n²)',
  pattern: 'Interval DP — dp[i][j] = best score difference on piles[i..j]',
  description:
    'Alice and Bob play with an even number of piles of stones arranged in a row, taking turns removing an entire pile from either end. Alice goes first and the total number of stones is odd, so there are no ties. Return true if Alice wins assuming both players play optimally.',
  problemUrl: 'https://leetcode.com/problems/stone-game/',
  code: {
    python: `def stoneGame(piles):
    n = len(piles)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = piles[i]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = max(piles[i] - dp[i+1][j],
                           piles[j] - dp[i][j-1])
    return dp[0][n-1] > 0`,
    javascript: `function stoneGame(piles) {
    const n = piles.length;
    const dp = Array.from({length: n},
        () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) dp[i][i] = piles[i];
    for (let len = 2; len <= n; len++) {
        for (let i = 0; i + len - 1 < n; i++) {
            const j = i + len - 1;
            dp[i][j] = Math.max(piles[i] - dp[i+1][j],
                                piles[j] - dp[i][j-1]);
        }
    }
    return dp[0][n-1] > 0;
}`,
    java: `public static boolean stoneGame(int[] piles) {
    int n = piles.length;
    int[][] dp = new int[n][n];
    for (int i = 0; i < n; i++) dp[i][i] = piles[i];
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = Math.max(piles[i] - dp[i + 1][j],
                                piles[j] - dp[i][j - 1]);
        }
    }
    return dp[0][n - 1] > 0;
}`,
  },
  defaultInput: { piles: [5, 3, 4, 5] },
  run: runStoneGame,
  optimalApproachName: 'Interval DP',
  approaches: [
    {
      id: 'parity-math',
      name: 'Parity Argument',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Skips the DP entirely: with an even number of piles Alice can claim every even-index pile or every odd-index pile, so she simply takes whichever group is larger and always wins.',
      code: {
        python: `def stoneGame(piles):
    evenSum = sum(piles[0::2])
    oddSum = sum(piles[1::2])
    # n is even, so the two ends of the row always
    # have opposite parity. Alice can therefore lock
    # onto every even index or every odd index.
    # The total is odd, so the two groups never tie.
    return max(evenSum, oddSum) > min(evenSum, oddSum)`,
        javascript: `function stoneGame(piles) {
    let evenSum = 0, oddSum = 0;
    for (let i = 0; i < piles.length; i++) {
        if (i % 2 === 0) evenSum += piles[i];
        else oddSum += piles[i];
    }
    // Alice can claim every even index or every odd
    // index, and the odd total rules out a tie.
    return Math.max(evenSum, oddSum) >
           Math.min(evenSum, oddSum);
}`,
        java: `public static boolean stoneGame(int[] piles) {
    int evenSum = 0, oddSum = 0;
    for (int i = 0; i < piles.length; i++) {
        if (i % 2 == 0) evenSum += piles[i];
        else oddSum += piles[i];
    }
    // Alice can claim every even index or every odd
    // index, and the odd total rules out a tie.
    return Math.max(evenSum, oddSum) > Math.min(evenSum, oddSum);
}`,
      },
      run: runStoneGameParityMath,
      lineExplanations: {
        python: {
          1: 'Define function taking the pile sizes',
          2: 'Total of the even-index piles',
          3: 'Total of the odd-index piles',
          4: 'With an even n, the two ends always differ in parity',
          5: 'So one colour is always available to the player to move',
          6: 'Alice moves first and can commit to a whole colour',
          7: 'The odd grand total means the groups can never tie',
          8: 'The larger group is strictly larger — Alice always wins',
        },
        javascript: {
          1: 'Define function taking the pile sizes',
          2: 'Running totals for the two index parities',
          3: 'Walk the piles once',
          4: 'Even index adds to the even group',
          5: 'Odd index adds to the odd group',
          7: 'Alice can commit to whichever colour she prefers',
          9: 'The odd grand total rules out a tie',
          10: 'So the larger group strictly wins — always true',
        },
        java: {
          1: 'Define method taking the pile sizes',
          2: 'Running totals for the two index parities',
          3: 'Walk the piles once',
          4: 'Even index adds to the even group',
          5: 'Odd index adds to the odd group',
          7: 'Alice can commit to whichever colour she prefers',
          9: 'The odd grand total rules out a tie — Alice always wins',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking the pile sizes',
      2: 'Number of piles',
      3: 'dp[i][j] = score lead the player to move can force on piles[i..j]',
      4: 'Base case over every single-pile range',
      5: 'One pile left: just take it',
      6: 'Grow the ranges by length so sub-ranges are already solved',
      7: 'Slide the window of this length across the row',
      8: 'Right endpoint of the current range',
      9: 'Option A: take the left pile, then subtract the opponent lead',
      10: 'Option B: take the right pile, then subtract the opponent lead',
      11: 'Alice wins exactly when her forced lead is positive',
    },
    javascript: {
      1: 'Define function taking the pile sizes',
      2: 'Number of piles',
      3: 'dp[i][j] = score lead the player to move can force on piles[i..j]',
      4: 'Continuation of the table initialization',
      5: 'Base case: one pile left means just take it',
      6: 'Grow the ranges by length so sub-ranges are already solved',
      7: 'Slide the window of this length across the row',
      8: 'Right endpoint of the current range',
      9: 'Option A: take the left pile, then subtract the opponent lead',
      10: 'Option B: take the right pile, then subtract the opponent lead',
      13: 'Alice wins exactly when her forced lead is positive',
    },
    java: {
      1: 'Define method taking the pile sizes',
      2: 'Number of piles',
      3: 'dp[i][j] = score lead the player to move can force on piles[i..j]',
      4: 'Base case: one pile left means just take it',
      5: 'Grow the ranges by length so sub-ranges are already solved',
      6: 'Slide the window of this length across the row',
      7: 'Right endpoint of the current range',
      8: 'Option A: take the left pile, then subtract the opponent lead',
      9: 'Option B: take the right pile, then subtract the opponent lead',
      12: 'Alice wins exactly when her forced lead is positive',
    },
  },
};
