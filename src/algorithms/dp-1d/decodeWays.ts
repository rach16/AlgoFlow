import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runDecodeWays(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');

  // dp[i] = number of ways to decode s[0..i-1]
  const dp: (number | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => i === 0 ? '""' : s.substring(0, i));

  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, result: null },
    highlights: [],
    message: `Count ways to decode "${s}" (A=1, B=2, ..., Z=26)`,
    codeLine: 1,
  });

  if (s[0] === '0') {
    steps.push({
      state: { chars: [...chars], dp: [0], dpLabels, result: 0 },
      highlights: [0],
      message: `String starts with '0', cannot decode. Result: 0`,
      codeLine: 2,
    });
    return steps;
  }

  dp[0] = 1;
  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [0], result: null },
    highlights: [],
    message: `Base case: dp[0] = 1 (empty string has one decoding)`,
    codeLine: 3,
    action: 'insert',
  });

  dp[1] = 1;
  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [1], result: null },
    highlights: [0],
    message: `Base case: dp[1] = 1 (single non-zero digit "${s[0]}" has one decoding)`,
    codeLine: 4,
    action: 'insert',
  });

  for (let i = 2; i <= n; i++) {
    dp[i] = 0;
    const oneDigit = parseInt(s[i - 1]);
    const twoDigit = parseInt(s.substring(i - 2, i));

    steps.push({
      state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i], result: null },
      highlights: [i - 1],
      message: `Computing dp[${i}]: checking single digit "${s[i - 1]}" (=${oneDigit}) and two digits "${s.substring(i - 2, i)}" (=${twoDigit})`,
      codeLine: 6,
      action: 'visit',
    });

    if (oneDigit >= 1) {
      dp[i] = (dp[i] as number) + (dp[i - 1] as number);
      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i - 1, i], result: null },
        highlights: [i - 1],
        message: `Single digit "${s[i - 1]}" is valid (1-9): dp[${i}] += dp[${i - 1}] = ${dp[i - 1]}, dp[${i}] = ${dp[i]}`,
        codeLine: 7,
        action: 'insert',
      });
    } else {
      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i], result: null },
        highlights: [i - 1],
        message: `Single digit "${s[i - 1]}" is 0, cannot decode alone`,
        codeLine: 7,
      });
    }

    if (twoDigit >= 10 && twoDigit <= 26) {
      dp[i] = (dp[i] as number) + (dp[i - 2] as number);
      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i - 2, i], result: null },
        highlights: [i - 2, i - 1],
        message: `Two digits "${s.substring(i - 2, i)}" is valid (10-26): dp[${i}] += dp[${i - 2}] = ${dp[i - 2]}, dp[${i}] = ${dp[i]}`,
        codeLine: 9,
        action: 'insert',
      });
    } else {
      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i], result: null },
        highlights: [i - 2, i - 1],
        message: `Two digits "${s.substring(i - 2, i)}" = ${twoDigit} is not in range 10-26`,
        codeLine: 9,
      });
    }
  }

  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [n], result: dp[n] },
    highlights: [],
    message: `Number of ways to decode "${s}": ${dp[n]}`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

export const decodeWays: Algorithm = {
  id: 'decode-ways',
  name: 'Decode Ways',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'DP — dp[i] = dp[i-1] (single) + dp[i-2] (double if valid)',
  description:
    'A message containing letters from A-Z can be encoded into numbers using the mapping A=1, B=2, ..., Z=26. Given a string s containing only digits, return the number of ways to decode it.',
  problemUrl: 'https://leetcode.com/problems/decode-ways/',
  code: {
    python: `def numDecodings(s):
    if s[0] == '0':
        return 0
    dp = [0] * (len(s) + 1)
    dp[0] = 1
    dp[1] = 1
    for i in range(2, len(s) + 1):
        if int(s[i-1]) >= 1:
            dp[i] += dp[i-1]
        if 10 <= int(s[i-2:i]) <= 26:
            dp[i] += dp[i-2]
    return dp[len(s)]`,
    javascript: `function numDecodings(s) {
    if (s[0] === '0') return 0;
    const dp = new Array(s.length + 1).fill(0);
    dp[0] = 1;
    dp[1] = 1;
    for (let i = 2; i <= s.length; i++) {
        if (parseInt(s[i-1]) >= 1)
            dp[i] += dp[i-1];
        const twoDigit = parseInt(s.substring(i-2, i));
        if (twoDigit >= 10 && twoDigit <= 26)
            dp[i] += dp[i-2];
    }
    return dp[s.length];
}`,
    java: `// Java implementation coming soon`,
  },
  defaultInput: '226',
  run: runDecodeWays,
};
