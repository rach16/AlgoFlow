import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runPalindromicSubstrings(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');
  let count = 0;
  const foundPalindromes: string[] = [];

  steps.push({
    state: { chars: [...chars], result: 0, foundPalindromes: [] },
    highlights: [],
    message: `Count palindromic substrings in "${s}" using expand-around-center`,
    codeLine: 1,
  });

  function expandAroundCenter(left: number, right: number): void {
    while (left >= 0 && right < n && s[left] === s[right]) {
      const palindrome = s.substring(left, right + 1);
      count++;
      foundPalindromes.push(palindrome);

      steps.push({
        state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
        highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        pointers: { left, right },
        message: `Found palindrome: "${palindrome}" (count = ${count})`,
        codeLine: 5,
        action: 'found',
      });

      left--;
      right++;
    }

    if (left >= 0 && right < n) {
      steps.push({
        state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
        highlights: [left, right],
        pointers: { left, right },
        message: `s[${left}]='${s[left]}' != s[${right}]='${s[right]}', stop expanding`,
        codeLine: 6,
        action: 'compare',
      });
    }
  }

  for (let i = 0; i < n; i++) {
    steps.push({
      state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
      highlights: [i],
      pointers: { center: i },
      message: `Expanding around center ${i} (odd length)`,
      codeLine: 3,
      action: 'visit',
    });
    expandAroundCenter(i, i);

    if (i + 1 < n) {
      steps.push({
        state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
        highlights: [i, i + 1],
        pointers: { left: i, right: i + 1 },
        message: `Expanding around center ${i},${i + 1} (even length)`,
        codeLine: 7,
        action: 'visit',
      });
      expandAroundCenter(i, i + 1);
    }
  }

  steps.push({
    state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
    highlights: [],
    message: `Total palindromic substrings: ${count}`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runPalindromicSubstringsDP(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const n = s.length;
  const chars = s.split('');
  const foundPalindromes: string[] = [];
  let count = 0;

  steps.push({
    state: { chars: [...chars], result: 0, foundPalindromes: [] },
    highlights: [],
    message: `DP table: dp[i][j] = "is s[i..j] a palindrome?" Fill i from RIGHT to LEFT so the inner substring dp[i+1][j-1] is always ready before we need it`,
    codeLine: 3,
  });

  const dp: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));

  for (let i = n - 1; i >= 0; i--) {
    steps.push({
      state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
      highlights: [i],
      pointers: { i },
      message: `Row i = ${i}: decide all substrings starting at '${s[i]}' (they only depend on rows below, already solved)`,
      codeLine: 5,
      action: 'visit',
    });

    for (let j = i; j < n; j++) {
      const sub = s.substring(i, j + 1);
      const endsMatch = s[i] === s[j];
      const innerOk = j - i < 2 || dp[i + 1][j - 1];

      if (endsMatch && innerOk) {
        dp[i][j] = true;
        count++;
        foundPalindromes.push(sub);
        steps.push({
          state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
          highlights: Array.from({ length: j - i + 1 }, (_, k) => i + k),
          pointers: { i, j },
          message: `dp[${i}][${j}] = true: "${sub}" — ends match${j - i < 2 ? ' (length ≤ 2 needs nothing inside)' : ` and inner "${s.substring(i + 1, j)}" is a palindrome`}. Count = ${count}`,
          codeLine: 8,
          action: 'found',
        });
      } else {
        steps.push({
          state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
          highlights: [i, j],
          secondary: j - i >= 2 ? Array.from({ length: j - i - 1 }, (_, k) => i + 1 + k) : [],
          pointers: { i, j },
          message: `dp[${i}][${j}] = false: "${sub}" — ${!endsMatch ? `ends '${s[i]}' ≠ '${s[j]}'` : `inner "${s.substring(i + 1, j)}" is not a palindrome`}`,
          codeLine: 7,
          action: 'compare',
        });
      }
    }
  }

  steps.push({
    state: { chars: [...chars], result: count, foundPalindromes: [...foundPalindromes] },
    highlights: [],
    message: `Total palindromic substrings: ${count} — every true cell in the table is one palindrome`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const palindromicSubstrings: Algorithm = {
  id: 'palindromic-substrings',
  name: 'Palindromic Substrings',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  pattern: 'Expand Around Center — count all palindromes',
  description:
    'Given a string s, return the number of palindromic substrings in it. A string is a palindrome when it reads the same backward as forward. A substring is a contiguous sequence of characters within the string.',
  problemUrl: 'https://leetcode.com/problems/palindromic-substrings/',
  code: {
    python: `def countSubstrings(s):
    count = 0
    for i in range(len(s)):
        # odd length
        l, r = i, i
        while l >= 0 and r < len(s) and s[l] == s[r]:
            count += 1
            l -= 1
            r += 1
        # even length
        l, r = i, i + 1
        while l >= 0 and r < len(s) and s[l] == s[r]:
            count += 1
            l -= 1
            r += 1
    return count`,
    javascript: `function countSubstrings(s) {
    let count = 0;
    for (let i = 0; i < s.length; i++) {
        // odd length
        let l = i, r = i;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            count++;
            l--; r++;
        }
        // even length
        l = i; r = i + 1;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            count++;
            l--; r++;
        }
    }
    return count;
}`,
    java: `public int countSubstrings(String s) {
    int count = 0;
    for (int i = 0; i < s.length(); i++) {
        // odd length
        int l = i, r = i;
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            count++;
            l--; r++;
        }
        // even length
        l = i; r = i + 1;
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            count++;
            l--; r++;
        }
    }
    return count;
}`,
  },
  defaultInput: 'abc',
  run: runPalindromicSubstrings,
  optimalApproachName: 'Expand Around Center',
  approaches: [
    {
      id: 'dp-table',
      name: 'DP Table',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n²)',
      description:
        'Instead of expanding from centers, fill dp[i][j] = "is s[i..j] a palindrome?" bottom-up and count the true cells — same time, O(n²) space, with an explicit recurrence.',
      code: {
        python: `def countSubstrings(s):
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    count = 0
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or dp[i + 1][j - 1]):
                dp[i][j] = True
                count += 1
    return count`,
        javascript: `function countSubstrings(s) {
    const n = s.length;
    const dp = Array.from({ length: n }, () => new Array(n).fill(false));
    let count = 0;
    for (let i = n - 1; i >= 0; i--) {
        for (let j = i; j < n; j++) {
            if (s[i] === s[j] && (j - i < 2 || dp[i + 1][j - 1])) {
                dp[i][j] = true;
                count++;
            }
        }
    }
    return count;
}`,
        java: `public int countSubstrings(String s) {
    int n = s.length();
    boolean[][] dp = new boolean[n][n];
    int count = 0;
    for (int i = n - 1; i >= 0; i--) {
        for (int j = i; j < n; j++) {
            if (s.charAt(i) == s.charAt(j) && (j - i < 2 || dp[i + 1][j - 1])) {
                dp[i][j] = true;
                count++;
            }
        }
    }
    return count;
}`,
      },
      run: runPalindromicSubstringsDP,
      lineExplanations: {
        python: {
          1: 'Define function taking string s',
          2: 'Length of the input string',
          3: 'dp[i][j] = is s[i..j] a palindrome? All start false',
          4: 'Running count of palindromic substrings',
          5: 'Fill rows right-to-left so dp[i+1][..] is ready before row i needs it',
          6: 'j sweeps every end position at or after i',
          7: 'Palindrome iff ends match AND (length ≤ 2 or the inside is a palindrome)',
          8: 'Mark s[i..j] as a palindrome',
          9: 'Every true cell is one more palindrome',
          10: 'Return the total count',
        },
        javascript: {
          1: 'Define function taking string s',
          2: 'Length of the input string',
          3: 'dp[i][j] = is s[i..j] a palindrome? All start false',
          4: 'Running count of palindromic substrings',
          5: 'Fill rows right-to-left so dp[i+1][..] is ready before row i needs it',
          6: 'j sweeps every end position at or after i',
          7: 'Palindrome iff ends match AND (length ≤ 2 or the inside is a palindrome)',
          8: 'Mark s[i..j] as a palindrome',
          9: 'Every true cell is one more palindrome',
          13: 'Return the total count',
        },
        java: {
          1: 'Define method taking string s',
          2: 'Length of the input string',
          3: 'dp[i][j] = is s[i..j] a palindrome? All start false',
          4: 'Running count of palindromic substrings',
          5: 'Fill rows right-to-left so dp[i+1][..] is ready before row i needs it',
          6: 'j sweeps every end position at or after i',
          7: 'Palindrome iff ends match AND (length ≤ 2 or the inside is a palindrome)',
          8: 'Mark s[i..j] as a palindrome',
          9: 'Every true cell is one more palindrome',
          13: 'Return the total count',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string s',
      2: 'Initialize palindrome count to zero',
      3: 'Try each index as center of palindrome',
      5: 'Start odd-length expansion from center i',
      6: 'Expand while chars match and in bounds',
      7: 'Found a palindrome, increment count',
      8: 'Expand left pointer outward',
      9: 'Expand right pointer outward',
      11: 'Start even-length expansion from i, i+1',
      12: 'Expand while chars match and in bounds',
      13: 'Found a palindrome, increment count',
      14: 'Expand left pointer outward',
      15: 'Expand right pointer outward',
      16: 'Return total palindromic substring count',
    },
    javascript: {
      1: 'Define function taking string s',
      2: 'Initialize palindrome count to zero',
      3: 'Try each index as center of palindrome',
      5: 'Start odd-length expansion from center i',
      6: 'Expand while chars match and in bounds',
      7: 'Found a palindrome, increment count',
      8: 'Move both pointers outward',
      11: 'Start even-length expansion from i, i+1',
      12: 'Expand while chars match and in bounds',
      13: 'Found a palindrome, increment count',
      14: 'Move both pointers outward',
      17: 'Return total palindromic substring count',
    },
    java: {
      1: 'Define method taking string s',
      2: 'Initialize palindrome count to zero',
      3: 'Try each index as center of palindrome',
      5: 'Start odd-length expansion from center i',
      6: 'Expand while chars match and in bounds',
      7: 'Found a palindrome, increment count',
      8: 'Move both pointers outward',
      10: 'Start even-length expansion from i, i+1',
      11: 'Expand while chars match and in bounds',
      12: 'Found a palindrome, increment count',
      13: 'Move both pointers outward',
      16: 'Return total palindromic substring count',
    },
  },
};
