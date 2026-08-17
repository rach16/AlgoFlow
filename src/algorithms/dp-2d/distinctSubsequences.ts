import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface DistinctSubsequencesInput {
  s: string;
  t: string;
}

function runDistinctSubsequences(input: unknown): AlgorithmStep[] {
  const { s, t } = input as DistinctSubsequencesInput;
  const steps: AlgorithmStep[] = [];
  const m = s.length;
  const n = t.length;

  steps.push({
    state: { result: null, chars: s.split(''), s, t },
    highlights: [],
    message: `Count distinct subsequences of "${s}" that equal "${t}"`,
    codeLine: 1,
  });

  // dp2d[i][j] = number of distinct subsequences of s[0..i-1] that equals t[0..j-1]
  const dp2d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Base case: empty t can be matched by any prefix of s (by deleting all chars)
  for (let i = 0; i <= m; i++) {
    dp2d[i][0] = 1;
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: Array.from({ length: m + 1 }, (_, i): [number, number] => [i, 0]),
      result: null, s, t,
    },
    highlights: [],
    message: `Base case: dp[i][0] = 1 for all i (empty t matches any s prefix by deleting all)`,
    codeLine: 3,
    action: 'insert',
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      // Always include the case where we skip s[i-1]
      dp2d[i][j] = dp2d[i - 1][j];

      if (s[i - 1] === t[j - 1]) {
        dp2d[i][j] += dp2d[i - 1][j - 1];

        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j], [i - 1, j - 1]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, s, t,
          },
          highlights: [],
          pointers: { i, j },
          message: `s[${i - 1}]='${s[i - 1]}' == t[${j - 1}]='${t[j - 1]}': dp[${i}][${j}] = dp[${i - 1}][${j}] + dp[${i - 1}][${j - 1}] = ${dp2d[i - 1][j]} + ${dp2d[i - 1][j - 1]} = ${dp2d[i][j]}`,
          codeLine: 6,
          action: 'found',
        });
      } else {
        steps.push({
          state: {
            dp2d: dp2d.map(r => [...r]),
            matrixHighlights: [[i - 1, j]] as [number, number][],
            matrixSecondary: [[i, j]] as [number, number][],
            result: null, s, t,
          },
          highlights: [],
          pointers: { i, j },
          message: `s[${i - 1}]='${s[i - 1]}' != t[${j - 1}]='${t[j - 1]}': dp[${i}][${j}] = dp[${i - 1}][${j}] = ${dp2d[i][j]}`,
          codeLine: 8,
          action: 'compare',
        });
      }
    }
  }

  steps.push({
    state: {
      dp2d: dp2d.map(r => [...r]),
      matrixHighlights: [[m, n]] as [number, number][],
      result: dp2d[m][n], s, t,
    },
    highlights: [],
    message: `Number of distinct subsequences of "${s}" that equal "${t}": ${dp2d[m][n]}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

function runDistinctSubsequencesMemo(input: unknown): AlgorithmStep[] {
  const { s, t } = input as DistinctSubsequencesInput;
  const steps: AlgorithmStep[] = [];
  const m = s.length;
  const n = t.length;
  const MAX_STEPS = 75;

  // Memo grid shown as the dp2d table; '·' = not yet computed
  const memoGrid: (number | string)[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill('·'));
  const memo = new Map<string, number>();

  steps.push({
    state: { dp2d: memoGrid.map(r => [...r]), result: null, s, t },
    highlights: [],
    message: `Top-down: dfs(i, j) = ways to build t[${0}..] suffix t[j:] from s[i:]. Recurse first, cache each answer in memo[i][j] — watch the table fill on the way back up`,
    codeLine: 3,
  });

  function dfs(i: number, j: number): number {
    if (j === n) return 1; // matched all of t
    if (i === m) return 0; // ran out of s
    const key = `${i},${j}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    let res = dfs(i + 1, j); // skip s[i]
    if (s[i] === t[j]) {
      res += dfs(i + 1, j + 1); // use s[i] to match t[j]
    }

    memo.set(key, res);
    memoGrid[i][j] = res;

    if (steps.length < MAX_STEPS) {
      steps.push({
        state: {
          dp2d: memoGrid.map(r => [...r]),
          matrixHighlights: [[i, j]] as [number, number][],
          result: null, s, t,
        },
        highlights: [],
        pointers: { i, j },
        message: s[i] === t[j]
          ? `memo[${i}][${j}] = ${res}: '${s[i]}' matches '${t[j]}', so ways("${t.slice(j)}" from "${s.slice(i)}") = skip s[${i}] + use it to match t[${j}]`
          : `memo[${i}][${j}] = ${res}: '${s[i]}' != '${t[j]}', only option is skipping s[${i}]`,
        codeLine: 13,
        action: 'insert',
      });
    }
    return res;
  }

  const result = dfs(0, 0);

  steps.push({
    state: {
      dp2d: memoGrid.map(r => [...r]),
      matrixHighlights: [[0, 0]] as [number, number][],
      result, s, t,
    },
    highlights: [],
    message: `dfs(0, 0) = ${result} distinct subsequences of "${s}" equal "${t}" — each of the ${memo.size} subproblems was solved exactly once`,
    codeLine: 15,
    action: 'found',
  });

  return steps;
}

export const distinctSubsequences: Algorithm = {
  id: 'distinct-subsequences',
  name: 'Distinct Subsequences',
  category: '2-D DP',
  difficulty: 'Hard',
  timeComplexity: 'O(m·n)',
  spaceComplexity: 'O(m·n)',
  pattern: 'DP — dp[i][j] = ways to form t[:j] from s[:i]',
  description:
    'Given two strings s and t, return the number of distinct subsequences of s which equals t.',
  problemUrl: 'https://leetcode.com/problems/distinct-subsequences/',
  code: {
    python: `def numDistinct(s, t):
    m, n = len(s), len(t)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1):
        dp[i][0] = 1
    for i in range(1, m+1):
        for j in range(1, n+1):
            dp[i][j] = dp[i-1][j]
            if s[i-1] == t[j-1]:
                dp[i][j] += dp[i-1][j-1]
    return dp[m][n]`,
    javascript: `function numDistinct(s, t) {
    const m = s.length, n = t.length;
    const dp = Array.from({length: m+1},
        () => new Array(n+1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = 1;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = dp[i-1][j];
            if (s[i-1] === t[j-1])
                dp[i][j] += dp[i-1][j-1];
        }
    }
    return dp[m][n];
}`,
    java: `public int numDistinct(String s, String t) {
    int m = s.length(), n = t.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) {
        dp[i][0] = 1;
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = dp[i - 1][j];
            if (s.charAt(i - 1) == t.charAt(j - 1)) {
                dp[i][j] += dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`,
  },
  defaultInput: { s: 'rabbbit', t: 'rabbit' },
  run: runDistinctSubsequences,
  optimalApproachName: 'Bottom-Up 2-D DP',
  approaches: [
    {
      id: 'top-down-memo',
      name: 'Top-Down Memoization',
      timeComplexity: 'O(m·n)',
      spaceComplexity: 'O(m·n)',
      description:
        'Instead of filling the whole table bottom-up, recurse from (0, 0) and cache each subproblem — only states actually reachable from the top get computed.',
      code: {
        python: `def numDistinct(s, t):
    memo = {}
    def dfs(i, j):
        if j == len(t):
            return 1
        if i == len(s):
            return 0
        if (i, j) in memo:
            return memo[(i, j)]
        res = dfs(i + 1, j)
        if s[i] == t[j]:
            res += dfs(i + 1, j + 1)
        memo[(i, j)] = res
        return res
    return dfs(0, 0)`,
        javascript: `function numDistinct(s, t) {
    const memo = new Map();
    function dfs(i, j) {
        if (j === t.length) return 1;
        if (i === s.length) return 0;
        const key = i + ',' + j;
        if (memo.has(key)) return memo.get(key);
        let res = dfs(i + 1, j);
        if (s[i] === t[j]) {
            res += dfs(i + 1, j + 1);
        }
        memo.set(key, res);
        return res;
    }
    return dfs(0, 0);
}`,
        java: `public int numDistinct(String s, String t) {
    Integer[][] memo = new Integer[s.length() + 1][t.length() + 1];
    return dfs(s, t, 0, 0, memo);
}

private int dfs(String s, String t, int i, int j, Integer[][] memo) {
    if (j == t.length()) return 1;
    if (i == s.length()) return 0;
    if (memo[i][j] != null) return memo[i][j];
    int res = dfs(s, t, i + 1, j, memo);
    if (s.charAt(i) == t.charAt(j)) {
        res += dfs(s, t, i + 1, j + 1, memo);
    }
    memo[i][j] = res;
    return res;
}`,
      },
      run: runDistinctSubsequencesMemo,
      lineExplanations: {
        python: {
          1: 'Define function taking strings s and t',
          2: 'Memo dictionary keyed by (i, j) state',
          3: 'dfs(i, j) = ways to build t[j:] from s[i:]',
          4: 'Base case: all of t matched',
          5: 'One valid way found — count it',
          6: 'Base case: s exhausted with t remaining',
          7: 'No way to finish the match',
          8: 'Cache check: state already solved?',
          9: 'Return the cached count',
          10: 'Option 1: always allowed — skip s[i]',
          11: 'If the characters match',
          12: 'Option 2: use s[i] to match t[j]',
          13: 'Cache the answer before returning',
          14: 'Return combined ways for this state',
          15: 'Kick off recursion from the start of both strings',
        },
        javascript: {
          1: 'Define function taking strings s and t',
          2: 'Memo map keyed by "i,j" state',
          3: 'dfs(i, j) = ways to build t[j:] from s[i:]',
          4: 'Base case: all of t matched — count one way',
          5: 'Base case: s exhausted with t remaining — zero ways',
          6: 'Build the memo key for this state',
          7: 'Return the cached count if already solved',
          8: 'Option 1: always allowed — skip s[i]',
          9: 'If the characters match',
          10: 'Option 2: use s[i] to match t[j]',
          12: 'Cache the answer before returning',
          13: 'Return combined ways for this state',
          15: 'Kick off recursion from the start of both strings',
        },
        java: {
          1: 'Define method taking strings s and t',
          2: 'Integer[][] memo — null marks unsolved states',
          3: 'Kick off recursion from the start of both strings',
          6: 'dfs(i, j) = ways to build t[j:] from s[i:]',
          7: 'Base case: all of t matched — count one way',
          8: 'Base case: s exhausted with t remaining — zero ways',
          9: 'Return the cached count if already solved',
          10: 'Option 1: always allowed — skip s[i]',
          11: 'If the characters match',
          12: 'Option 2: use s[i] to match t[j]',
          14: 'Cache the answer before returning',
          15: 'Return combined ways for this state',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking strings s and t',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table filled with zeros',
      4: 'Base case: empty t matches any prefix of s',
      5: 'Set dp[i][0] = 1 for all i',
      6: 'Iterate over each character of s',
      7: 'Iterate over each character of t',
      8: 'Skip s[i-1]: carry forward dp[i-1][j]',
      9: 'If characters match',
      10: 'Add ways that use s[i-1] to match t[j-1]',
      11: 'Return total distinct subsequences count',
    },
    javascript: {
      1: 'Define function taking strings s and t',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table filled with zeros',
      4: 'Continuation of array initialization',
      5: 'Base case: empty t matches any prefix of s',
      6: 'Iterate over each character of s',
      7: 'Iterate over each character of t',
      8: 'Skip s[i-1]: carry forward dp[i-1][j]',
      9: 'If characters match',
      10: 'Add ways that use s[i-1] to match t[j-1]',
      13: 'Return total distinct subsequences count',
    },
    java: {
      1: 'Define method taking strings s and t',
      2: 'Get lengths of both strings',
      3: 'Create (m+1)x(n+1) DP table initialized to 0',
      4: 'Base case: empty t matches any prefix of s',
      5: 'Set dp[i][0] = 1 for all i',
      7: 'Iterate over each character of s',
      8: 'Iterate over each character of t',
      9: 'Skip s[i-1]: carry forward dp[i-1][j]',
      10: 'If characters match',
      11: 'Add ways that use s[i-1] to match t[j-1]',
      15: 'Return total distinct subsequences count',
    },
  },
};
