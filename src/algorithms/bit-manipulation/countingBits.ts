import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function toBinary(n: number, width: number = 8): string {
  return (n >>> 0).toString(2).padStart(width, '0');
}

function runCountingBits(input: unknown): AlgorithmStep[] {
  const n = input as number;
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: {
      dp: new Array(n + 1).fill(0),
      dpHighlights: [],
      bits: [{ value: 0, bits: toBinary(0), label: '0' }],
      result: `Counting bits for 0 to ${n}`,
    },
    highlights: [],
    message: `Count number of 1-bits for each number from 0 to ${n}. Use DP: dp[i] = dp[i >> 1] + (i & 1).`,
    codeLine: 1,
  } as AlgorithmStep);

  const dp = new Array(n + 1).fill(0);

  steps.push({
    state: {
      dp: [...dp],
      dpHighlights: [0],
      bits: [{ value: 0, bits: toBinary(0), label: 'dp[0] = 0' }],
      result: 'dp[0] = 0',
    },
    highlights: [],
    message: `Base case: dp[0] = 0 (zero has no set bits).`,
    codeLine: 2,
    action: 'visit',
  } as AlgorithmStep);

  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i >> 1] + (i & 1);

    steps.push({
      state: {
        dp: [...dp],
        dpHighlights: [i],
        bits: [
          { value: i, bits: toBinary(i), label: `${i}` },
          { value: i >> 1, bits: toBinary(i >> 1), label: `${i} >> 1 = ${i >> 1}` },
        ],
        result: `dp[${i}] = dp[${i >> 1}] + ${i & 1} = ${dp[i]}`,
      },
      highlights: [],
      message: `dp[${i}] = dp[${i} >> 1] + (${i} & 1) = dp[${i >> 1}] + ${i & 1} = ${dp[i >> 1]} + ${i & 1} = ${dp[i]}.  (${toBinary(i)})`,
      codeLine: 4,
      action: 'insert',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      dp: [...dp],
      dpHighlights: [],
      bits: dp.map((v, i) => ({ value: i, bits: toBinary(i), label: `${i}: ${v} bits` })),
      result: `Result: [${dp.join(', ')}]`,
    },
    highlights: [],
    message: `Done! Bit counts for 0 to ${n}: [${dp.join(', ')}].`,
    codeLine: 6,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const countingBits: Algorithm = {
  id: 'counting-bits',
  name: 'Counting Bits',
  category: 'Bit Manipulation',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'DP + Bits — dp[i] = dp[i >> 1] + (i & 1)',
  description:
    'Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1\'s in the binary representation of i.',
  problemUrl: 'https://leetcode.com/problems/counting-bits/',
  code: {
    python: `def countBits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp`,
    javascript: `function countBits(n) {
    const dp = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        dp[i] = dp[i >> 1] + (i & 1);
    }
    return dp;
}`,
  },
  defaultInput: 5,
  run: runCountingBits,
};
