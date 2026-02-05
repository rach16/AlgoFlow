import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

function runLongestSubstringWithoutRepeating(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');
  const hashMap: Record<string, number> = {};

  // Initial state
  steps.push({
    state: { chars: [...chars], hashMap: {}, result: 0 },
    highlights: [],
    message: `Find the longest substring without repeating characters in "${s}"`,
    codeLine: 1,
  });

  let left = 0;
  let maxLen = 0;

  steps.push({
    state: { chars: [...chars], hashMap: {}, result: 0 },
    highlights: [0],
    pointers: { left: 0, right: 0 },
    message: 'Initialize left pointer at 0, right pointer will scan forward',
    codeLine: 3,
  });

  for (let right = 0; right < chars.length; right++) {
    const char = chars[right];

    // Show current character being examined
    steps.push({
      state: { chars: [...chars], hashMap: { ...hashMap }, result: maxLen },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Examining char '${char}' at index ${right}. Current window: "${s.slice(left, right + 1)}"`,
      codeLine: 5,
      action: 'visit',
    });

    // Check if character is already in the window
    if (char in hashMap && hashMap[char] >= left) {
      const oldLeft = left;
      left = hashMap[char] + 1;

      steps.push({
        state: { chars: [...chars], hashMap: { ...hashMap }, result: maxLen },
        highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        pointers: { left, right },
        message: `'${char}' already in window at index ${hashMap[char]}. Move left from ${oldLeft} to ${left} (past the duplicate)`,
        codeLine: 7,
        action: 'compare',
      });
    }

    // Update the character's latest position
    hashMap[char] = right;

    steps.push({
      state: { chars: [...chars], hashMap: { ...hashMap }, result: maxLen },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Set hashMap['${char}'] = ${right}`,
      codeLine: 8,
      action: 'insert',
    });

    // Update max length
    const windowLen = right - left + 1;
    if (windowLen > maxLen) {
      maxLen = windowLen;
      steps.push({
        state: { chars: [...chars], hashMap: { ...hashMap }, result: maxLen },
        highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        pointers: { left, right },
        message: `Window "${s.slice(left, right + 1)}" has length ${windowLen} > maxLen. Update maxLen = ${maxLen}`,
        codeLine: 9,
        action: 'found',
      });
    }
  }

  // Final result
  steps.push({
    state: { chars: [...chars], hashMap: { ...hashMap }, result: maxLen },
    highlights: [],
    message: `Longest substring without repeating characters has length ${maxLen}`,
    codeLine: 10,
    action: 'found',
  });

  return steps;
}

export const longestSubstringWithoutRepeating: Algorithm = {
  id: 'longest-substring-without-repeating',
  name: 'Longest Substring Without Repeating Characters',
  category: 'Sliding Window',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(min(n,m))',
  pattern: 'Sliding Window + Hash Set — expand right, shrink left on duplicate',
  description:
    'Given a string s, find the length of the longest substring without repeating characters.',
  problemUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
  code: {
    python: `def lengthOfLongestSubstring(s):
    char_set = {}
    left = 0
    max_len = 0

    for right in range(len(s)):
        if s[right] in char_set and char_set[s[right]] >= left:
            left = char_set[s[right]] + 1
        char_set[s[right]] = right
        max_len = max(max_len, right - left + 1)

    return max_len`,
    javascript: `function lengthOfLongestSubstring(s) {
    const charMap = {};
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        if (s[right] in charMap && charMap[s[right]] >= left) {
            left = charMap[s[right]] + 1;
        }
        charMap[s[right]] = right;
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}`,
  },
  defaultInput: 'abcabcbb',
  run: runLongestSubstringWithoutRepeating,
};
