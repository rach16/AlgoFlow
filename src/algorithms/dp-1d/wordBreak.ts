import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface WordBreakInput {
  s: string;
  wordDict: string[];
}

function runWordBreak(input: unknown): AlgorithmStep[] {
  const { s, wordDict } = input as WordBreakInput;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');

  // dp[i] = can s[0..i-1] be segmented using wordDict
  const dp: (string | null)[] = new Array(n + 1).fill(null);
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => i === 0 ? '""' : s.substring(0, i));

  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, result: null, wordDict: [...wordDict] },
    highlights: [],
    message: `Can "${s}" be segmented using dictionary [${wordDict.map(w => `"${w}"`).join(', ')}]?`,
    codeLine: 1,
  });

  dp[0] = 'T';
  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [0], result: null, wordDict: [...wordDict] },
    highlights: [],
    message: `Base case: dp[0] = true (empty string can be segmented)`,
    codeLine: 2,
    action: 'insert',
  });

  const wordSet = new Set(wordDict);

  for (let i = 1; i <= n; i++) {
    dp[i] = 'F';

    for (let j = 0; j < i; j++) {
      const substring = s.substring(j, i);
      const dpjVal = dp[j] === 'T';

      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [j], dpSecondary: [i], result: null, wordDict: [...wordDict] },
        highlights: Array.from({ length: i - j }, (_, k) => j + k),
        pointers: { j, i },
        message: `Check: dp[${j}]=${dp[j]} and "${substring}" in dict? ${wordSet.has(substring) ? 'YES' : 'NO'}`,
        codeLine: 5,
        action: 'compare',
      });

      if (dpjVal && wordSet.has(substring)) {
        dp[i] = 'T';
        steps.push({
          state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i], result: null, wordDict: [...wordDict] },
          highlights: Array.from({ length: i - j }, (_, k) => j + k),
          pointers: { j, i },
          message: `dp[${i}] = true! s[${j}..${i - 1}] = "${substring}" is in dictionary and dp[${j}] is true`,
          codeLine: 6,
          action: 'found',
        });
        break;
      }
    }

    if (dp[i] === 'F') {
      steps.push({
        state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [i], result: null, wordDict: [...wordDict] },
        highlights: [],
        message: `dp[${i}] = false. No valid split found for "${s.substring(0, i)}"`,
        codeLine: 7,
        action: 'insert',
      });
    }
  }

  const result = dp[n] === 'T';
  steps.push({
    state: { chars: [...chars], dp: [...dp], dpLabels, dpHighlights: [n], result, wordDict: [...wordDict] },
    highlights: [],
    message: `Result: "${s}" ${result ? 'CAN' : 'CANNOT'} be segmented using the dictionary`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

export const wordBreak: Algorithm = {
  id: 'word-break',
  name: 'Word Break',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n²·m)',
  spaceComplexity: 'O(n)',
  pattern: 'DP — dp[i] = can s[0..i] be segmented using dictionary',
  description:
    'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
  problemUrl: 'https://leetcode.com/problems/word-break/',
  code: {
    python: `def wordBreak(s, wordDict):
    dp = [False] * (len(s) + 1)
    dp[0] = True
    wordSet = set(wordDict)
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in wordSet:
                dp[i] = True
                break
    return dp[len(s)]`,
    javascript: `function wordBreak(s, wordDict) {
    const dp = new Array(s.length + 1).fill(false);
    dp[0] = true;
    const wordSet = new Set(wordDict);
    for (let i = 1; i <= s.length; i++) {
        for (let j = 0; j < i; j++) {
            if (dp[j] && wordSet.has(s.substring(j, i))) {
                dp[i] = true;
                break;
            }
        }
    }
    return dp[s.length];
}`,
  },
  defaultInput: { s: 'leetcode', wordDict: ['leet', 'code'] },
  run: runWordBreak,
};
