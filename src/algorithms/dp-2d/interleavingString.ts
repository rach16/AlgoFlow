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

function runInterleavingStringRolling1D(input: unknown): AlgorithmStep[] {
  const { s1, s2, s3 } = input as InterleavingStringInput;
  const steps: AlgorithmStep[] = [];
  const m = s1.length;
  const n = s2.length;
  const labels = ['∅', ...s2.split('')];

  steps.push({
    state: { result: null, s1, s2, s3 },
    highlights: [],
    message: `Rolling 1-D DP: keep only one row of the interleaving table — dp[j] tracks whether the current s1 prefix and s2[0..j-1] interleave into s3`,
    codeLine: 1,
  });

  if (m + n !== s3.length) {
    steps.push({
      state: { result: false, s1, s2, s3 },
      highlights: [],
      message: `Length mismatch: ${m}+${n} != ${s3.length}. Result: false`,
      codeLine: 3,
      action: 'found',
    });
    return steps;
  }

  const dp: string[] = new Array(n + 1).fill('F');
  dp[0] = 'T';

  steps.push({
    state: { dp: [...dp], dpLabels: labels, dpHighlights: [0], result: null, s1, s2, s3 },
    highlights: [],
    message: `Row i=0 (empty s1 prefix): dp[0] = T — empty + empty forms empty`,
    codeLine: 6,
    action: 'insert',
  });

  for (let j = 1; j <= n; j++) {
    dp[j] = dp[j - 1] === 'T' && s2[j - 1] === s3[j - 1] ? 'T' : 'F';
  }
  steps.push({
    state: { dp: [...dp], dpLabels: labels, dpHighlights: Array.from({ length: n }, (_, j) => j + 1), result: null, s1, s2, s3 },
    highlights: [],
    message: `Fill row 0 using only s2: dp[j] = T while s2 prefix matches s3 prefix → [${dp.join(', ')}]`,
    codeLine: 8,
    action: 'insert',
  });

  for (let i = 1; i <= m; i++) {
    dp[0] = dp[0] === 'T' && s1[i - 1] === s3[i - 1] ? 'T' : 'F';

    steps.push({
      state: { dp: [...dp], dpLabels: labels, dpHighlights: [0], result: null, s1, s2, s3 },
      highlights: [],
      pointers: { i },
      message: `Row ${i} (s1 prefix "${s1.slice(0, i)}"): dp[0] = ${dp[0]} — using only s1, does s1[0..${i - 1}] match s3[0..${i - 1}]?`,
      codeLine: 10,
      action: 'visit',
    });

    for (let j = 1; j <= n; j++) {
      const k = i + j - 1;
      const fromTop = dp[j] === 'T' && s1[i - 1] === s3[k]; // dp[j] still holds row i-1
      const fromLeft = dp[j - 1] === 'T' && s2[j - 1] === s3[k];
      dp[j] = fromTop || fromLeft ? 'T' : 'F';

      steps.push({
        state: { dp: [...dp], dpLabels: labels, dpHighlights: [j], dpSecondary: [j - 1], result: null, s1, s2, s3 },
        highlights: [],
        pointers: { i, j },
        message: `dp[${j}]: s3[${k}]='${s3[k]}' — take from s1 (old dp[${j}]): ${fromTop}, take from s2 (dp[${j - 1}]): ${fromLeft} → ${dp[j]}`,
        codeLine: 13,
        action: dp[j] === 'T' ? 'found' : 'compare',
      });
    }
  }

  const result = dp[n] === 'T';
  steps.push({
    state: { dp: [...dp], dpLabels: labels, dpHighlights: [n], result, s1, s2, s3 },
    highlights: [],
    message: `"${s3}" ${result ? 'CAN' : 'CANNOT'} be formed — same answer with O(n) instead of O(m·n) space`,
    codeLine: 15,
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
    java: `public boolean isInterleave(String s1, String s2, String s3) {
    if (s1.length() + s2.length() != s3.length()) return false;
    int m = s1.length(), n = s2.length();
    boolean[][] dp = new boolean[m + 1][n + 1];
    dp[0][0] = true;
    for (int i = 1; i <= m; i++) {
        dp[i][0] = dp[i - 1][0] && s1.charAt(i - 1) == s3.charAt(i - 1);
    }
    for (int j = 1; j <= n; j++) {
        dp[0][j] = dp[0][j - 1] && s2.charAt(j - 1) == s3.charAt(j - 1);
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = (dp[i - 1][j] && s1.charAt(i - 1) == s3.charAt(i + j - 1))
                    || (dp[i][j - 1] && s2.charAt(j - 1) == s3.charAt(i + j - 1));
        }
    }
    return dp[m][n];
}`,
  },
  defaultInput: { s1: 'aabcc', s2: 'dbbca', s3: 'aadbbcbcac' },
  run: runInterleavingString,
  optimalApproachName: '2-D DP Table',
  approaches: [
    {
      id: 'rolling-1d-dp',
      name: 'Rolling 1-D DP',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(n)',
      description:
        'Same transitions as the 2-D table, but processed row by row in place: the not-yet-overwritten dp[j] plays the role of the cell above, so only one array is needed.',
      code: {
        python: `def isInterleave(s1, s2, s3):
    if len(s1) + len(s2) != len(s3):
        return False
    m, n = len(s1), len(s2)
    dp = [False] * (n + 1)
    dp[0] = True
    for j in range(1, n + 1):
        dp[j] = dp[j-1] and s2[j-1] == s3[j-1]
    for i in range(1, m + 1):
        dp[0] = dp[0] and s1[i-1] == s3[i-1]
        for j in range(1, n + 1):
            k = i + j - 1
            dp[j] = ((dp[j] and s1[i-1] == s3[k]) or
                (dp[j-1] and s2[j-1] == s3[k]))
    return dp[n]`,
        javascript: `function isInterleave(s1, s2, s3) {
    if (s1.length + s2.length !== s3.length)
        return false;
    const m = s1.length, n = s2.length;
    const dp = new Array(n + 1).fill(false);
    dp[0] = true;
    for (let j = 1; j <= n; j++)
        dp[j] = dp[j-1] && s2[j-1] === s3[j-1];
    for (let i = 1; i <= m; i++) {
        dp[0] = dp[0] && s1[i-1] === s3[i-1];
        for (let j = 1; j <= n; j++) {
            const k = i + j - 1;
            dp[j] = (dp[j] && s1[i-1] === s3[k]) ||
                (dp[j-1] && s2[j-1] === s3[k]);
        }
    }
    return dp[n];
}`,
        java: `public boolean isInterleave(String s1, String s2, String s3) {
    if (s1.length() + s2.length() != s3.length()) return false;
    int m = s1.length(), n = s2.length();
    boolean[] dp = new boolean[n + 1];
    dp[0] = true;
    for (int j = 1; j <= n; j++) {
        dp[j] = dp[j - 1] && s2.charAt(j - 1) == s3.charAt(j - 1);
    }
    for (int i = 1; i <= m; i++) {
        dp[0] = dp[0] && s1.charAt(i - 1) == s3.charAt(i - 1);
        for (int j = 1; j <= n; j++) {
            int k = i + j - 1;
            dp[j] = (dp[j] && s1.charAt(i - 1) == s3.charAt(k))
                || (dp[j - 1] && s2.charAt(j - 1) == s3.charAt(k));
        }
    }
    return dp[n];
}`,
      },
      run: runInterleavingStringRolling1D,
      lineExplanations: {
        python: {
          1: 'Define function taking three strings',
          2: 'Check if combined length matches s3',
          3: 'Return false if lengths are incompatible',
          4: 'Get lengths of s1 and s2',
          5: 'One row of booleans replaces the 2-D table',
          6: 'Base case: empty + empty interleave to empty',
          7: 'Fill row 0 using only s2 characters',
          8: 'True while the s2 prefix matches the s3 prefix',
          9: 'Process one s1 character (one "row") at a time',
          10: 'Column 0: only s1 used — must match s3 directly',
          11: 'Iterate over s2 positions',
          12: 'k = index into s3 for cell (i, j)',
          13: 'Old dp[j] is the cell ABOVE (take char from s1)...',
          14: '...or new dp[j-1] is the cell LEFT (take char from s2)',
          15: 'Answer for full s1 and s2 sits in dp[n]',
        },
        javascript: {
          1: 'Define function taking three strings',
          2: 'Check if combined length matches s3',
          3: 'Return false if lengths are incompatible',
          4: 'Get lengths of s1 and s2',
          5: 'One row of booleans replaces the 2-D table',
          6: 'Base case: empty + empty interleave to empty',
          7: 'Fill row 0 using only s2 characters',
          8: 'True while the s2 prefix matches the s3 prefix',
          9: 'Process one s1 character (one "row") at a time',
          10: 'Column 0: only s1 used — must match s3 directly',
          11: 'Iterate over s2 positions',
          12: 'k = index into s3 for cell (i, j)',
          13: 'Old dp[j] is the cell ABOVE (take char from s1)...',
          14: '...or new dp[j-1] is the cell LEFT (take char from s2)',
          17: 'Answer for full s1 and s2 sits in dp[n]',
        },
        java: {
          1: 'Define method taking three strings',
          2: 'Return false if lengths are incompatible',
          3: 'Get lengths of s1 and s2',
          4: 'One row of booleans replaces the 2-D table',
          5: 'Base case: empty + empty interleave to empty',
          6: 'Fill row 0 using only s2 characters',
          7: 'True while the s2 prefix matches the s3 prefix',
          9: 'Process one s1 character (one "row") at a time',
          10: 'Column 0: only s1 used — must match s3 directly',
          11: 'Iterate over s2 positions',
          12: 'k = index into s3 for cell (i, j)',
          13: 'Old dp[j] is the cell ABOVE (take char from s1)...',
          14: '...or new dp[j-1] is the cell LEFT (take char from s2)',
          17: 'Answer for full s1 and s2 sits in dp[n]',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking three strings',
      2: 'Check if combined length matches s3',
      3: 'Return false if lengths are incompatible',
      4: 'Get lengths of s1 and s2',
      5: 'Create (m+1)x(n+1) DP table of booleans',
      6: 'Base case: empty strings interleave to empty',
      7: 'Fill first column using only s1 characters',
      8: 'Check if s1 prefix matches s3 prefix',
      9: 'Fill first row using only s2 characters',
      10: 'Check if s2 prefix matches s3 prefix',
      11: 'Iterate over each character of s1',
      12: 'Iterate over each character of s2',
      13: 'Check from-top: s1 char matches s3 position',
      14: 'Continuation of from-top condition',
      15: 'Or from-left: s2 char matches s3 position',
      16: 'Continuation of from-left condition',
      17: 'Return whether full interleaving is possible',
    },
    javascript: {
      1: 'Define function taking three strings',
      2: 'Check if combined length matches s3',
      3: 'Return false if lengths are incompatible',
      4: 'Get lengths of s1 and s2',
      5: 'Create (m+1)x(n+1) DP table of booleans',
      6: 'Continuation of array initialization',
      7: 'Base case: empty strings interleave to empty',
      8: 'Fill first column using only s1 characters',
      9: 'Check if s1 prefix matches s3 prefix',
      10: 'Fill first row using only s2 characters',
      11: 'Check if s2 prefix matches s3 prefix',
      12: 'Iterate over each character of s1',
      13: 'Iterate over each character of s2',
      14: 'Check from-top: s1 char matches s3 position',
      15: 'Continuation of from-top match check',
      16: 'Or from-left: s2 char matches s3 position',
      17: 'Continuation of from-left match check',
      20: 'Return whether full interleaving is possible',
    },
    java: {
      1: 'Define method taking three strings',
      2: 'Return false if lengths are incompatible',
      3: 'Get lengths of s1 and s2',
      4: 'Create (m+1)x(n+1) DP table of booleans',
      5: 'Base case: empty strings interleave to empty',
      6: 'Fill first column: match s1 prefix with s3',
      7: 'Check if s1 char matches s3 at same position',
      9: 'Fill first row: match s2 prefix with s3',
      10: 'Check if s2 char matches s3 at same position',
      12: 'Iterate over each character of s1',
      13: 'Iterate over each character of s2',
      14: 'From-top: s1 char matches s3, or from-left',
      15: 'From-left: s2 char matches s3 position',
      18: 'Return whether full interleaving is possible',
    },
  },
};
