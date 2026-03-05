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
