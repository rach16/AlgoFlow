import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface InterleavingStringInput {
  s1: string;
  s2: string;
  s3: string;
}

function runInterleavingString(input: unknown): AlgorithmStep[] {
  const { s1, s2, s3 } = input as InterleavingStringInput;
  const steps: AlgorithmStep[] = [];
  const m = s1.length;
  const n = s2.length;

  steps.push({
    state: { result: null, s1, s2, s3 },
    highlights: [],
    message: `Can "${s3}" be formed by interleaving "${s1}" and "${s2}"?`,
    codeLine: 1,
  });

  if (m + n !== s3.length) {
    steps.push({
      state: { result: false, s1, s2, s3 },
      highlights: [],
      message: `Length mismatch: |s1|+|s2| = ${m}+${n} = ${m + n} != |s3| = ${s3.length}. Result: false`,
      codeLine: 2,
      action: 'found',
    });
    return steps;
  }

  // dp2d[i][j] = can s3[0..i+j-1] be formed by interleaving s1[0..i-1] and s2[0..j-1]?
  const dp2d: (string)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill('F'));

  dp2d[0][0] = 'T';
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[0, 0]] as [number, number][],
      result: null, s1, s2, s3,
    },
    highlights: [],
    message: `Base case: dp[0][0] = true (empty strings interleave to empty string)`,
    codeLine: 3,
    action: 'insert',
  });

  // Fill first column: using only s1
  for (let i = 1; i <= m; i++) {
    dp2d[i][0] = dp2d[i - 1][0] === 'T' && s1[i - 1] === s3[i - 1] ? 'T' : 'F';
    steps.push({
      state: {
        dp2d: dp2d.map(r => [...r]),
        matrixHighlights: [[i, 0]] as [number, number][],
        result: null, s1, s2, s3,
      },
      highlights: [],
      message: `dp[${i}][0]: s1[${i - 1}]='${s1[i - 1]}' vs s3[${i - 1}]='${s3[i - 1]}' => ${dp2d[i][0]}`,
      codeLine: 4,
      action: 'insert',
    });
  }

  // Fill first row: using only s2
  for (let j = 1; j <= n; j++) {
    dp2d[0][j] = dp2d[0][j - 1] === 'T' && s2[j - 1] === s3[j - 1] ? 'T' : 'F';
    steps.push({
      state: {
        dp2d: dp2d.map(r => [...r]),
        matrixHighlights: [[0, j]] as [number, number][],
        result: null, s1, s2, s3,
      },
      highlights: [],
      message: `dp[0][${j}]: s2[${j - 1}]='${s2[j - 1]}' vs s3[${j - 1}]='${s3[j - 1]}' => ${dp2d[0][j]}`,
      codeLine: 5,
      action: 'insert',
    });
  }

  // Fill rest
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const k = i + j - 1; // index in s3
      const fromTop = dp2d[i - 1][j] === 'T' && s1[i - 1] === s3[k];
      const fromLeft = dp2d[i][j - 1] === 'T' && s2[j - 1] === s3[k];

      dp2d[i][j] = fromTop || fromLeft ? 'T' : 'F';

      const highlights: [number, number][] = [];
      if (fromTop) highlights.push([i - 1, j]);
      if (fromLeft) highlights.push([i, j - 1]);

      steps.push({
        state: {
          dp2d: dp2d.map(r => [...r]),
          matrixHighlights: highlights.length > 0 ? highlights : [[i, j]] as [number, number][],
          matrixSecondary: [[i, j]] as [number, number][],
          result: null, s1, s2, s3,
        },
        highlights: [],
        pointers: { i, j },
        message: `dp[${i}][${j}]: s3[${k}]='${s3[k]}' | from_top(s1[${i - 1}]='${s1[i - 1]}'): ${fromTop}, from_left(s2[${j - 1}]='${s2[j - 1]}'): ${fromLeft} => ${dp2d[i][j]}`,
        codeLine: 8,
        action: dp2d[i][j] === 'T' ? 'found' : 'compare',
      });
    }
  }

  const result = dp2d[m][n] === 'T';
  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[m, n]] as [number, number][],
      result, s1, s2, s3,
    },
    highlights: [],
    message: `"${s3}" ${result ? 'CAN' : 'CANNOT'} be formed by interleaving "${s1}" and "${s2}"`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const interleavingString: Algorithm = {
  id: 'interleaving-string',
  name: 'Interleaving String',
  category: '2-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DP — dp[i][j] = can s1[:i] and s2[:j] form s3[:i+j]?',
  description:
    'Given strings s1, s2, and s3, find whether s3 is formed by an interleaving of s1 and s2. An interleaving of two strings s and t is a configuration where s and t are divided into n and m substrings respectively, and they are interleaved alternately.',
  problemUrl: 'https://leetcode.com/problems/interleaving-string/',
  code: {
    python: `def isInterleave(s1, s2, s3):
    if len(s1) + len(s2) != len(s3):
        return False
    m, n = len(s1), len(s2)
    dp = [[False]*(n+1) for _ in range(m+1)]
    dp[0][0] = True
    for i in range(1, m+1):
        dp[i][0] = dp[i-1][0] and s1[i-1]==s3[i-1]
    for j in range(1, n+1):
        dp[0][j] = dp[0][j-1] and s2[j-1]==s3[j-1]
    for i in range(1, m+1):
        for j in range(1, n+1):
            dp[i][j] = ((dp[i-1][j] and
                s1[i-1]==s3[i+j-1]) or
                (dp[i][j-1] and
                s2[j-1]==s3[i+j-1]))
    return dp[m][n]`,
    javascript: `function isInterleave(s1, s2, s3) {
    if (s1.length + s2.length !== s3.length)
        return false;
    const m = s1.length, n = s2.length;
    const dp = Array.from({length: m+1},
        () => new Array(n+1).fill(false));
    dp[0][0] = true;
    for (let i = 1; i <= m; i++)
        dp[i][0] = dp[i-1][0] && s1[i-1]===s3[i-1];
    for (let j = 1; j <= n; j++)
        dp[0][j] = dp[0][j-1] && s2[j-1]===s3[j-1];
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = (dp[i-1][j] &&
                s1[i-1]===s3[i+j-1]) ||
                (dp[i][j-1] &&
                s2[j-1]===s3[i+j-1]);
        }
    }
    return dp[m][n];
}`,
  },
  defaultInput: { s1: 'aabcc', s2: 'dbbca', s3: 'aadbbcbcac' },
  run: runInterleavingString,
};
