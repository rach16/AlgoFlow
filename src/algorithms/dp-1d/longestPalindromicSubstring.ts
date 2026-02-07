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
};
