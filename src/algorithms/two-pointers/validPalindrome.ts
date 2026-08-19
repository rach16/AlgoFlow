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

function runValidPalindromeReversed(input: unknown): AlgorithmStep[] {
  const original = input as string;
  const cleaned = original.toLowerCase().replace(/[^a-z0-9]/g, '');
  const chars = cleaned.split('');
  const reversed = [...chars].reverse();
  const steps: AlgorithmStep[] = [];

  steps.push({
    state: { chars, original },
    highlights: [],
    message: `Clean "${original}" to "${cleaned}", then compare it against its own reverse`,
    codeLine: 2,
  });

  steps.push({
    state: { chars },
    highlights: [],
    message: `Build the reversed copy: "${reversed.join('')}". A palindrome is exactly a string that equals its own reverse`,
    codeLine: 3,
  });

  for (let i = 0; i < chars.length; i++) {
    const j = chars.length - 1 - i;
    steps.push({
      state: { chars },
      highlights: [i],
      secondary: [j],
      pointers: { i, mirror: j },
      message: `String equality checks position ${i}: cleaned[${i}]='${chars[i]}' vs reversed[${i}]='${reversed[i]}' (the original's char at index ${j})`,
      codeLine: 4,
      action: 'compare',
    });

    if (chars[i] !== reversed[i]) {
      steps.push({
        state: { chars, result: false },
        highlights: [i, j],
        pointers: { i, mirror: j },
        message: `'${chars[i]}' !== '${reversed[i]}' — the string differs from its reverse. NOT a palindrome`,
        codeLine: 4,
      });
      return steps;
    }
  }

  steps.push({
    state: { chars, result: true },
    highlights: [],
    message: `"${cleaned}" equals its reverse — IS a palindrome! (This costs O(n) extra space for the copy; two pointers avoids that)`,
    codeLine: 4,
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
  spaceComplexity: 'O(n)',
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
  optimalApproachName: 'Two Pointers',
  approaches: [
    {
      id: 'reversed-string',
      name: 'Reversed String',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description:
        'Build a reversed copy of the cleaned string and compare the two — one-liner logic, but it uses O(n) extra space where two pointers uses O(1).',
      code: {
        python: `def isPalindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    reversed_s = cleaned[::-1]
    return cleaned == reversed_s`,
        javascript: `function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = cleaned.split('').reverse().join('');
    return cleaned === reversed;
}`,
        java: `public static boolean isPalindrome(String s) {
    String cleaned = s.toLowerCase().replaceAll("[^a-z0-9]", "");
    String reversed = new StringBuilder(cleaned).reverse().toString();
    return cleaned.equals(reversed);
}`,
      },
      run: runValidPalindromeReversed,
      lineExplanations: {
        python: {
          1: 'Define function taking a string',
          2: 'Lowercase and strip non-alphanumeric characters',
          3: 'Build the reversed copy with slice notation [::-1]',
          4: 'A palindrome is exactly a string that equals its own reverse',
        },
        javascript: {
          1: 'Define function taking a string',
          2: 'Lowercase and strip non-alphanumeric characters',
          3: 'Split to chars, reverse, and re-join to build the reversed copy',
          4: 'A palindrome is exactly a string that equals its own reverse',
        },
        java: {
          1: 'Define function taking a string',
          2: 'Lowercase and strip non-alphanumeric characters',
          3: 'StringBuilder.reverse() builds the reversed copy',
          4: 'A palindrome is exactly a string that equals its own reverse',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking a string',
      2: 'Remove non-alphanumeric chars and lowercase everything',
      3: 'Set two pointers at the start and end of the string',
      5: 'Keep going while pointers haven\'t crossed',
      6: 'Do the characters at left and right match?',
      7: "They don't match — not a palindrome",
      8: 'Move left pointer inward',
      9: 'Move right pointer inward',
      11: 'All characters matched — it is a palindrome',
    },
    javascript: {
      1: 'Define function taking a string',
      2: 'Remove non-alphanumeric chars and lowercase everything',
      3: 'Set left pointer at the start',
      4: 'Set right pointer at the end',
      6: 'Keep going while pointers haven\'t crossed',
      7: 'Do the characters at left and right match?',
      8: "They don't match — not a palindrome",
      10: 'Move left pointer inward',
      11: 'Move right pointer inward',
      14: 'All characters matched — it is a palindrome',
    },
    java: {
      1: 'Define function taking a string',
      2: 'Remove non-alphanumeric chars and lowercase everything',
      3: 'Set left pointer at the start',
      4: 'Set right pointer at the end',
      6: 'Keep going while pointers haven\'t crossed',
      7: 'Do the characters at left and right match?',
      8: "They don't match — not a palindrome",
      10: 'Move left pointer inward',
      11: 'Move right pointer inward',
      14: 'All characters matched — it is a palindrome',
    },
  },
};
