import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runValidPalindrome(input: unknown): AlgorithmStep[] {
  const s = (input as string).toLowerCase().replace(/[^a-z0-9]/g, '');
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');

  steps.push({
    state: { chars, original: input as string },
    highlights: [],
    message: `Check if "${input}" is a palindrome (cleaned: "${s}")`,
    codeLine: 1,
  });

  let left = 0;
  let right = chars.length - 1;

  steps.push({
    state: { chars },
    highlights: [left, right],
    pointers: { left, right },
    message: `Initialize two pointers: left=0, right=${right}`,
    codeLine: 3,
  });

  while (left < right) {
    steps.push({
      state: { chars },
      highlights: [left, right],
      pointers: { left, right },
      message: `Compare '${chars[left]}' (left) with '${chars[right]}' (right)`,
      codeLine: 5,
      action: 'compare',
    });

    if (chars[left] !== chars[right]) {
      steps.push({
        state: { chars, result: false },
        highlights: [left, right],
        pointers: { left, right },
        message: `'${chars[left]}' !== '${chars[right]}' - NOT a palindrome`,
        codeLine: 6,
      });
      return steps;
    }

    steps.push({
      state: { chars },
      highlights: [left, right],
      pointers: { left, right },
      message: `'${chars[left]}' === '${chars[right]}' - Match! Move pointers`,
      codeLine: 8,
      action: 'found',
    });

    left++;
    right--;
  }

  steps.push({
    state: { chars, result: true },
    highlights: [],
    message: `All characters matched - IS a palindrome!`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const validPalindrome: Algorithm = {
  id: 'valid-palindrome',
  name: 'Valid Palindrome',
  category: 'Two Pointers',
  difficulty: 'Easy',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Two Pointers — converge from both ends',
  description:
    'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
  problemUrl: 'https://leetcode.com/problems/valid-palindrome/',
  code: {
    python: `def isPalindrome(s):
    s = ''.join(c.lower() for c in s if c.isalnum())
    left, right = 0, len(s) - 1

    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1

    return True`,
    javascript: `function isPalindrome(s) {
    s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0;
    let right = s.length - 1;

    while (left < right) {
        if (s[left] !== s[right]) {
            return false;
        }
        left++;
        right--;
    }

    return true;
}`,
    java: `public static boolean isPalindrome(String s) {
    s = s.toLowerCase().replaceAll("[^a-z0-9]", "");
    int left = 0;
    int right = s.length() - 1;

    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) {
            return false;
        }
        left++;
        right--;
    }

    return true;
}`,
  },
  defaultInput: 'A man, a plan, a canal: Panama',
  run: runValidPalindrome,
};
