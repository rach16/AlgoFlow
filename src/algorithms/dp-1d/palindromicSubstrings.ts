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
};
