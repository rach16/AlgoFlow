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

function runDecodeWaysMemo(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');

  // memo[i] = number of ways to decode the suffix s[i..]
  const memo: (number | null)[] = new Array(n + 1).fill(null);
  memo[n] = 1;
  const dpLabels = Array.from({ length: n + 1 }, (_, i) => (i === n ? '""' : s.substring(i)));

  const dpSnapshot = () => [...memo];

  steps.push({
    state: { chars: [...chars], dp: dpSnapshot(), dpLabels, result: null },
    highlights: [],
    message: `Top-down: dfs(i) = ways to decode the SUFFIX s[${0}..] starting at i. Recurse from the front, cache each answer in a memo`,
    codeLine: 1,
  });

  steps.push({
    state: { chars: [...chars], dp: dpSnapshot(), dpLabels, dpHighlights: [n], result: null },
    highlights: [],
    message: `Base case: memo[${n}] = 1 — an empty suffix counts as one complete decoding`,
    codeLine: 2,
    action: 'insert',
  });

  function dfs(i: number): number {
    if (memo[i] !== null) {
      if (i < n) {
        steps.push({
          state: { chars: [...chars], dp: dpSnapshot(), dpLabels, dpHighlights: [i], result: null },
          highlights: [i],
          pointers: { i },
          message: `dfs(${i}): memo hit! Suffix "${s.substring(i)}" already solved = ${memo[i]} — this is where memoization saves repeated work`,
          codeLine: 5,
          action: 'found',
        });
      }
      return memo[i] as number;
    }

    if (s[i] === '0') {
      steps.push({
        state: { chars: [...chars], dp: dpSnapshot(), dpLabels, result: null },
        highlights: [i],
        pointers: { i },
        message: `dfs(${i}): suffix starts with '0' — no letter maps to 0, so 0 ways`,
        codeLine: 7,
      });
      return 0;
    }

    steps.push({
      state: { chars: [...chars], dp: dpSnapshot(), dpLabels, result: null },
      highlights: [i],
      pointers: { i },
      message: `dfs(${i}): take single digit "${s[i]}" as a letter, then solve the rest via dfs(${i + 1})`,
      codeLine: 8,
      action: 'visit',
    });
    let res = dfs(i + 1);

    if (i + 1 < n && parseInt(s.substring(i, i + 2)) <= 26) {
      steps.push({
        state: { chars: [...chars], dp: dpSnapshot(), dpLabels, result: null },
        highlights: [i, i + 1],
        pointers: { i },
        message: `dfs(${i}): "${s.substring(i, i + 2)}" ≤ 26 is also a valid letter — add dfs(${i + 2}) as a second branch`,
        codeLine: 9,
        action: 'compare',
      });
      res += dfs(i + 2);
    }

    memo[i] = res;
    steps.push({
      state: { chars: [...chars], dp: dpSnapshot(), dpLabels, dpHighlights: [i], result: null },
      highlights: [i],
      pointers: { i },
      message: `Cache memo[${i}] = ${res}: suffix "${s.substring(i)}" has ${res} decoding${res === 1 ? '' : 's'}`,
      codeLine: 11,
      action: 'insert',
    });
    return res;
  }

  const result = dfs(0);

  steps.push({
    state: { chars: [...chars], dp: dpSnapshot(), dpLabels, dpHighlights: [0], result },
    highlights: [],
    message: `dfs(0) = ${result}: "${s}" has ${result} decoding${result === 1 ? '' : 's'} — same recurrence as bottom-up, but computed lazily on demand`,
    codeLine: 13,
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
  spaceComplexity: 'O(n)',
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
    java: `public int numDecodings(String s) {
    if (s.charAt(0) == '0') return 0;
    int[] dp = new int[s.length() + 1];
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i <= s.length(); i++) {
        int oneDigit = Integer.parseInt(s.substring(i-1, i));
        if (oneDigit >= 1) {
            dp[i] += dp[i-1];
        }
        int twoDigit = Integer.parseInt(s.substring(i-2, i));
        if (twoDigit >= 10 && twoDigit <= 26) {
            dp[i] += dp[i-2];
        }
    }
    return dp[s.length()];
}`,
  },
  defaultInput: '226',
  run: runDecodeWays,
  optimalApproachName: 'Bottom-Up DP',
  approaches: [
    {
      id: 'top-down-memoization',
      name: 'Top-Down Memoization',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Instead of filling a table left-to-right, recurse from the front — dfs(i) counts decodings of the suffix starting at i — and cache results so each index is solved once.',
      code: {
        python: `def numDecodings(s):
    memo = {len(s): 1}
    def dfs(i):
        if i in memo:
            return memo[i]
        if s[i] == '0':
            return 0
        res = dfs(i + 1)
        if i + 1 < len(s) and int(s[i:i+2]) <= 26:
            res += dfs(i + 2)
        memo[i] = res
        return res
    return dfs(0)`,
        javascript: `function numDecodings(s) {
    const memo = { [s.length]: 1 };
    function dfs(i) {
        if (i in memo) return memo[i];
        if (s[i] === '0') return 0;
        let res = dfs(i + 1);
        if (i + 1 < s.length && parseInt(s.substring(i, i + 2)) <= 26) {
            res += dfs(i + 2);
        }
        memo[i] = res;
        return res;
    }
    return dfs(0);
}`,
        java: `public int numDecodings(String s) {
    Map<Integer, Integer> memo = new HashMap<>();
    memo.put(s.length(), 1);
    return dfs(s, 0, memo);
}

private int dfs(String s, int i, Map<Integer, Integer> memo) {
    if (memo.containsKey(i)) return memo.get(i);
    if (s.charAt(i) == '0') return 0;
    int res = dfs(s, i + 1, memo);
    if (i + 1 < s.length() && Integer.parseInt(s.substring(i, i + 2)) <= 26) {
        res += dfs(s, i + 2, memo);
    }
    memo.put(i, res);
    return res;
}`,
      },
      run: runDecodeWaysMemo,
      lineExplanations: {
        python: {
          1: 'Define function taking digit string s',
          2: 'Memo cache; base case: empty suffix = 1 decoding',
          3: 'dfs(i) = ways to decode the suffix starting at i',
          4: 'Memo hit: this suffix was already solved',
          5: 'Return the cached answer — no recomputation',
          6: "A suffix starting with '0' cannot be decoded",
          7: 'Zero ways for this branch',
          8: 'Branch 1: take one digit as a letter, solve the rest',
          9: 'Branch 2 valid only if two digits form 10-26',
          10: 'Add the two-digit branch count',
          11: 'Cache the answer before returning',
          12: 'Return total ways for this suffix',
          13: 'Answer for the whole string = dfs from index 0',
        },
        javascript: {
          1: 'Define function taking digit string s',
          2: 'Memo cache; base case: empty suffix = 1 decoding',
          3: 'dfs(i) = ways to decode the suffix starting at i',
          4: 'Memo hit: return the cached answer',
          5: "A suffix starting with '0' cannot be decoded",
          6: 'Branch 1: take one digit as a letter, solve the rest',
          7: 'Branch 2 valid only if two digits form 10-26',
          8: 'Add the two-digit branch count',
          10: 'Cache the answer before returning',
          11: 'Return total ways for this suffix',
          13: 'Answer for the whole string = dfs from index 0',
        },
        java: {
          1: 'Define method taking digit string s',
          2: 'Memo cache maps index to suffix answer',
          3: 'Base case: empty suffix = 1 decoding',
          4: 'Answer for the whole string = dfs from index 0',
          7: 'dfs(i) = ways to decode the suffix starting at i',
          8: 'Memo hit: return the cached answer',
          9: "A suffix starting with '0' cannot be decoded",
          10: 'Branch 1: take one digit as a letter, solve the rest',
          11: 'Branch 2 valid only if two digits form 10-26',
          12: 'Add the two-digit branch count',
          14: 'Cache the answer before returning',
          15: 'Return total ways for this suffix',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking digit string s',
      2: 'Check if string starts with zero',
      3: 'Leading zero means no valid decoding',
      4: 'Init DP array of size n+1',
      5: 'Base case: empty string has one decoding',
      6: 'Base case: first char has one decoding',
      7: 'Fill DP for each position from 2 onward',
      8: 'If single digit is 1-9, it is valid',
      9: 'Add ways from previous position',
      10: 'If two digits form 10-26, it is valid',
      11: 'Add ways from two positions back',
      12: 'Return total decodings for full string',
    },
    javascript: {
      1: 'Define function taking digit string s',
      2: 'Leading zero means no valid decoding',
      3: 'Init DP array of size n+1',
      4: 'Base case: empty string has one decoding',
      5: 'Base case: first char has one decoding',
      6: 'Fill DP for each position from 2 onward',
      7: 'If single digit is 1-9, it is valid',
      8: 'Add ways from previous position',
      9: 'Parse the two-digit number ending at i',
      10: 'If two digits form 10-26, it is valid',
      11: 'Add ways from two positions back',
      13: 'Return total decodings for full string',
    },
    java: {
      1: 'Define method taking digit string s',
      2: 'Leading zero means no valid decoding',
      3: 'Init DP array of size n+1',
      4: 'Base case: empty string has one decoding',
      5: 'Base case: first char has one decoding',
      6: 'Fill DP for each position from 2 onward',
      7: 'Parse single digit at position i',
      8: 'If single digit is 1-9, it is valid',
      9: 'Add ways from previous position',
      11: 'Parse two-digit number ending at i',
      12: 'If two digits form 10-26, it is valid',
      13: 'Add ways from two positions back',
      16: 'Return total decodings for full string',
    },
  },
};
