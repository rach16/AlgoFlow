import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLongestPalindromicSubstring(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const n = s.length;

  if (n === 0) {
    steps.push({ state: { chars: [], result: '' }, highlights: [], message: 'Empty string. Result: ""', codeLine: 1 });
    return steps;
  }

  const chars = s.split('');
  let resStart = 0;
  let resLen = 1;

  steps.push({
    state: { chars: [...chars], result: '', currentPalindrome: '' },
    highlights: [],
    message: `Find longest palindromic substring in "${s}" using expand-around-center`,
    codeLine: 1,
  });

  function expandAroundCenter(left: number, right: number, label: string): void {
    steps.push({
      state: { chars: [...chars], result: s.substring(resStart, resStart + resLen), currentPalindrome: '' },
      highlights: [left],
      secondary: right < n ? [right] : [],
      pointers: { left, right },
      message: `${label}: start expanding from left=${left}, right=${right}`,
      codeLine: 3,
      action: 'visit',
    });

    while (left >= 0 && right < n && s[left] === s[right]) {
      const currentPalin = s.substring(left, right + 1);
      steps.push({
        state: {
          chars: [...chars],
          result: s.substring(resStart, resStart + resLen),
          currentPalindrome: currentPalin,
        },
        highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        pointers: { left, right },
        message: `s[${left}]='${s[left]}' == s[${right}]='${s[right]}', palindrome: "${currentPalin}"`,
        codeLine: 5,
        action: 'compare',
      });

      if (right - left + 1 > resLen) {
        resStart = left;
        resLen = right - left + 1;
        steps.push({
          state: {
            chars: [...chars],
            result: s.substring(resStart, resStart + resLen),
            currentPalindrome: currentPalin,
          },
          highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
          pointers: { left, right },
          message: `New longest palindrome found: "${s.substring(resStart, resStart + resLen)}" (length ${resLen})`,
          codeLine: 6,
          action: 'found',
        });
      }

      left--;
      right++;
    }

    if (left >= 0 && right < n) {
      steps.push({
        state: { chars: [...chars], result: s.substring(resStart, resStart + resLen) },
        highlights: [left, right],
        pointers: { left, right },
        message: `s[${left}]='${s[left]}' != s[${right}]='${s[right]}', stop expanding`,
        codeLine: 7,
      });
    }
  }

  for (let i = 0; i < n; i++) {
    // Odd length palindromes
    expandAroundCenter(i, i, `Odd center at ${i}`);
    // Even length palindromes
    if (i + 1 < n) {
      expandAroundCenter(i, i + 1, `Even center at ${i},${i + 1}`);
    }
  }

  steps.push({
    state: { chars: [...chars], result: s.substring(resStart, resStart + resLen) },
    highlights: Array.from({ length: resLen }, (_, i) => resStart + i),
    message: `Longest palindromic substring: "${s.substring(resStart, resStart + resLen)}" (length ${resLen})`,
    codeLine: 9,
    action: 'found',
  });

  return steps;
}

function runLongestPalindromicSubstringDP(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const n = s.length;

  if (n === 0) {
    steps.push({ state: { chars: [], result: '' }, highlights: [], message: 'Empty string. Result: ""', codeLine: 1 });
    return steps;
  }

  const chars = s.split('');
  const dp: boolean[][] = Array.from({ length: n }, () => new Array(n).fill(false));
  let start = 0;
  let maxLen = 1;

  steps.push({
    state: { chars: [...chars], result: '', currentPalindrome: '' },
    highlights: [],
    message: `DP table: dp[i][j] = "is s[i..j] a palindrome?" A substring is a palindrome iff its ends match AND its inside is a palindrome — so solve short substrings first`,
    codeLine: 3,
  });

  for (let i = 0; i < n; i++) {
    dp[i][i] = true;
  }
  steps.push({
    state: { chars: [...chars], result: s[0], currentPalindrome: '' },
    highlights: Array.from({ length: n }, (_, i) => i),
    message: `Base case: every single character is a palindrome — dp[i][i] = true for all i`,
    codeLine: 6,
    action: 'insert',
  });

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      const range = Array.from({ length }, (_, k) => i + k);

      if (s[i] !== s[j]) {
        steps.push({
          state: { chars: [...chars], result: s.substring(start, start + maxLen), currentPalindrome: '' },
          highlights: [i, j],
          pointers: { i, j },
          message: `"${s.substring(i, j + 1)}": ends '${s[i]}' ≠ '${s[j]}' — not a palindrome, dp[${i}][${j}] stays false`,
          codeLine: 10,
          action: 'compare',
        });
        continue;
      }

      const innerOk = length === 2 || dp[i + 1][j - 1];
      if (innerOk) {
        dp[i][j] = true;
        const found = s.substring(i, j + 1);
        if (length > maxLen) {
          start = i;
          maxLen = length;
          steps.push({
            state: { chars: [...chars], result: s.substring(start, start + maxLen), currentPalindrome: found },
            highlights: range,
            pointers: { i, j },
            message: `"${found}": ends match and inner "${length === 2 ? '' : s.substring(i + 1, j)}" is a palindrome → dp[${i}][${j}] = true. New longest (length ${length})!`,
            codeLine: 13,
            action: 'found',
          });
        } else {
          steps.push({
            state: { chars: [...chars], result: s.substring(start, start + maxLen), currentPalindrome: found },
            highlights: range,
            pointers: { i, j },
            message: `"${found}" is a palindrome (dp[${i}][${j}] = true), but not longer than the current best`,
            codeLine: 11,
            action: 'insert',
          });
        }
      } else {
        steps.push({
          state: { chars: [...chars], result: s.substring(start, start + maxLen), currentPalindrome: '' },
          highlights: [i, j],
          secondary: Array.from({ length: length - 2 }, (_, k) => i + 1 + k),
          pointers: { i, j },
          message: `"${s.substring(i, j + 1)}": ends '${s[i]}' = '${s[j]}' match, but inner "${s.substring(i + 1, j)}" is not a palindrome (dp[${i + 1}][${j - 1}] = false)`,
          codeLine: 10,
          action: 'compare',
        });
      }
    }
  }

  steps.push({
    state: { chars: [...chars], result: s.substring(start, start + maxLen) },
    highlights: Array.from({ length: maxLen }, (_, i) => start + i),
    message: `Longest palindromic substring: "${s.substring(start, start + maxLen)}" (length ${maxLen}) — found by filling the table shortest-to-longest`,
    codeLine: 14,
    action: 'found',
  });

  return steps;
}

export const longestPalindromicSubstring: Algorithm = {
  id: 'longest-palindromic-substring',
  name: 'Longest Palindromic Substring',
  category: '1-D DP',
  difficulty: 'Medium',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  pattern: 'Expand Around Center — try each index as center',
  description:
    'Given a string s, return the longest palindromic substring in s. Uses the expand-around-center approach.',
  problemUrl: 'https://leetcode.com/problems/longest-palindromic-substring/',
  code: {
    python: `def longestPalindrome(s):
    res = ""
    resLen = 0
    for i in range(len(s)):
        # odd length
        l, r = i, i
        while l >= 0 and r < len(s) and s[l] == s[r]:
            if (r - l + 1) > resLen:
                res = s[l:r+1]
                resLen = r - l + 1
            l -= 1
            r += 1
        # even length
        l, r = i, i + 1
        while l >= 0 and r < len(s) and s[l] == s[r]:
            if (r - l + 1) > resLen:
                res = s[l:r+1]
                resLen = r - l + 1
            l -= 1
            r += 1
    return res`,
    javascript: `function longestPalindrome(s) {
    let res = "";
    let resLen = 0;
    for (let i = 0; i < s.length; i++) {
        // odd length
        let l = i, r = i;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            if (r - l + 1 > resLen) {
                res = s.substring(l, r + 1);
                resLen = r - l + 1;
            }
            l--; r++;
        }
        // even length
        l = i; r = i + 1;
        while (l >= 0 && r < s.length && s[l] === s[r]) {
            if (r - l + 1 > resLen) {
                res = s.substring(l, r + 1);
                resLen = r - l + 1;
            }
            l--; r++;
        }
    }
    return res;
}`,
    java: `public String longestPalindrome(String s) {
    String res = "";
    int resLen = 0;
    for (int i = 0; i < s.length(); i++) {
        // odd length
        int l = i, r = i;
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            if (r - l + 1 > resLen) {
                res = s.substring(l, r + 1);
                resLen = r - l + 1;
            }
            l--; r++;
        }
        // even length
        l = i; r = i + 1;
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            if (r - l + 1 > resLen) {
                res = s.substring(l, r + 1);
                resLen = r - l + 1;
            }
            l--; r++;
        }
    }
    return res;
}`,
  },
  defaultInput: 'babad',
  run: runLongestPalindromicSubstring,
  optimalApproachName: 'Expand Around Center',
  approaches: [
    {
      id: 'dp-table',
      name: 'DP Table',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n²)',
      description:
        'Instead of expanding outward from centers, fill a table dp[i][j] = "is s[i..j] a palindrome?" from shortest substrings to longest — same time, O(n²) space, but the recurrence is explicit.',
      code: {
        python: `def longestPalindrome(s):
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    start, maxLen = 0, 1
    for i in range(n):
        dp[i][i] = True
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j] and (length == 2 or dp[i+1][j-1]):
                dp[i][j] = True
                if length > maxLen:
                    start, maxLen = i, length
    return s[start:start + maxLen]`,
        javascript: `function longestPalindrome(s) {
    const n = s.length;
    const dp = Array.from({ length: n }, () => new Array(n).fill(false));
    let start = 0, maxLen = 1;
    for (let i = 0; i < n; i++) dp[i][i] = true;
    for (let len = 2; len <= n; len++) {
        for (let i = 0; i + len - 1 < n; i++) {
            const j = i + len - 1;
            if (s[i] === s[j] && (len === 2 || dp[i + 1][j - 1])) {
                dp[i][j] = true;
                if (len > maxLen) {
                    start = i;
                    maxLen = len;
                }
            }
        }
    }
    return s.substring(start, start + maxLen);
}`,
        java: `public String longestPalindrome(String s) {
    int n = s.length();
    boolean[][] dp = new boolean[n][n];
    int start = 0, maxLen = 1;
    for (int i = 0; i < n; i++) dp[i][i] = true;
    for (int len = 2; len <= n; len++) {
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            if (s.charAt(i) == s.charAt(j) && (len == 2 || dp[i + 1][j - 1])) {
                dp[i][j] = true;
                if (len > maxLen) {
                    start = i;
                    maxLen = len;
                }
            }
        }
    }
    return s.substring(start, start + maxLen);
}`,
      },
      run: runLongestPalindromicSubstringDP,
      lineExplanations: {
        python: {
          1: 'Define function taking string s',
          2: 'Length of the input string',
          3: 'dp[i][j] = is s[i..j] a palindrome? All start false',
          4: 'Track the best palindrome (start index and length)',
          5: 'Loop over every index',
          6: 'Base case: every single character is a palindrome',
          7: 'Solve substrings from length 2 up to n — shorter answers feed longer ones',
          8: 'Slide the window start across the string',
          9: 'j is the window end for this (i, length)',
          10: 'Palindrome iff ends match AND the inside is a palindrome (already computed)',
          11: 'Mark s[i..j] as a palindrome',
          12: 'Longer than the best so far?',
          13: 'Record the new best window',
          14: 'Slice out the longest palindrome',
        },
        javascript: {
          1: 'Define function taking string s',
          2: 'Length of the input string',
          3: 'dp[i][j] = is s[i..j] a palindrome? All start false',
          4: 'Track the best palindrome (start index and length)',
          5: 'Base case: every single character is a palindrome',
          6: 'Solve substrings from length 2 up to n — shorter answers feed longer ones',
          7: 'Slide the window start across the string',
          8: 'j is the window end for this (i, len)',
          9: 'Palindrome iff ends match AND the inside is a palindrome (already computed)',
          10: 'Mark s[i..j] as a palindrome',
          11: 'Longer than the best so far?',
          12: 'Record the new best start',
          13: 'Record the new best length',
          18: 'Slice out the longest palindrome',
        },
        java: {
          1: 'Define method taking string s',
          2: 'Length of the input string',
          3: 'dp[i][j] = is s[i..j] a palindrome? All start false',
          4: 'Track the best palindrome (start index and length)',
          5: 'Base case: every single character is a palindrome',
          6: 'Solve substrings from length 2 up to n — shorter answers feed longer ones',
          7: 'Slide the window start across the string',
          8: 'j is the window end for this (i, len)',
          9: 'Palindrome iff ends match AND the inside is a palindrome (already computed)',
          10: 'Mark s[i..j] as a palindrome',
          11: 'Longer than the best so far?',
          12: 'Record the new best start',
          13: 'Record the new best length',
          18: 'Slice out the longest palindrome',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string s',
      2: 'Track best palindrome found so far',
      3: 'Track length of best palindrome',
      4: 'Try each index as center of palindrome',
      6: 'Start odd-length expansion from center i',
      7: 'Expand while chars match and in bounds',
      8: 'Check if current palindrome is longest',
      9: 'Update best result substring',
      10: 'Update best result length',
      11: 'Expand left pointer outward',
      12: 'Expand right pointer outward',
      14: 'Start even-length expansion from i, i+1',
      15: 'Expand while chars match and in bounds',
      16: 'Check if current palindrome is longest',
      17: 'Update best result substring',
      18: 'Update best result length',
      19: 'Expand left pointer outward',
      20: 'Expand right pointer outward',
      21: 'Return the longest palindromic substring',
    },
    javascript: {
      1: 'Define function taking string s',
      2: 'Track best palindrome found so far',
      3: 'Track length of best palindrome',
      4: 'Try each index as center of palindrome',
      6: 'Start odd-length expansion from center i',
      7: 'Expand while chars match and in bounds',
      8: 'Check if current palindrome is longest',
      9: 'Update best result substring',
      10: 'Update best result length',
      12: 'Move both pointers outward',
      15: 'Start even-length expansion from i, i+1',
      16: 'Expand while chars match and in bounds',
      17: 'Check if current palindrome is longest',
      18: 'Update best result substring',
      19: 'Update best result length',
      21: 'Move both pointers outward',
      24: 'Return the longest palindromic substring',
    },
    java: {
      1: 'Define method taking string s',
      2: 'Track best palindrome found so far',
      3: 'Track length of best palindrome',
      4: 'Try each index as center of palindrome',
      6: 'Start odd-length expansion from center i',
      7: 'Expand while chars match and in bounds',
      8: 'Check if current palindrome is longest',
      9: 'Update best result substring',
      10: 'Update best result length',
      12: 'Move both pointers outward',
      15: 'Start even-length expansion from i, i+1',
      16: 'Expand while chars match and in bounds',
      17: 'Check if current palindrome is longest',
      18: 'Update best result substring',
      19: 'Update best result length',
      21: 'Move both pointers outward',
      24: 'Return the longest palindromic substring',
    },
  },
};
