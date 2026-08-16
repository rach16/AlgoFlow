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

function runLongestSubstringHashSet(input: unknown): AlgorithmStep[] {
  const s = input as string;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');
  const window: Record<string, number> = {}; // char -> index, acts as the set

  steps.push({
    state: { chars: [...chars], hashMap: {}, result: 0 },
    highlights: [],
    message: `Set-based window: expand right; on a duplicate, evict from the left ONE char at a time until the window is unique again`,
    codeLine: 1,
  });

  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < chars.length; right++) {
    const char = chars[right];

    steps.push({
      state: { chars: [...chars], hashMap: { ...window }, result: maxLen },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Examining char '${char}' at index ${right}. Set holds: {${Object.keys(window).join(', ')}}`,
      codeLine: 6,
      action: 'visit',
    });

    while (char in window) {
      const removed = chars[left];
      delete window[removed];

      steps.push({
        state: { chars: [...chars], hashMap: { ...window }, result: maxLen },
        highlights: Array.from({ length: right - left }, (_, i) => left + 1 + i),
        pointers: { left: left + 1, right },
        message: `'${char}' is already in the set — evict '${removed}' at index ${left} and shrink. Unlike the index-map jump, we walk left one step at a time`,
        codeLine: 8,
        action: 'delete',
      });

      left++;
    }

    window[char] = right;

    steps.push({
      state: { chars: [...chars], hashMap: { ...window }, result: maxLen },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Window is duplicate-free — add '${char}' to the set`,
      codeLine: 10,
      action: 'insert',
    });

    const windowLen = right - left + 1;
    if (windowLen > maxLen) {
      maxLen = windowLen;
      steps.push({
        state: { chars: [...chars], hashMap: { ...window }, result: maxLen },
        highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        pointers: { left, right },
        message: `Window "${s.slice(left, right + 1)}" has length ${windowLen} — new maximum!`,
        codeLine: 11,
        action: 'found',
      });
    }
  }

  steps.push({
    state: { chars: [...chars], hashMap: { ...window }, result: maxLen },
    highlights: [],
    message: `Longest substring without repeating characters has length ${maxLen}. Each char enters and leaves the set at most once — still O(n) overall`,
    codeLine: 13,
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
    java: `public static int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> charMap = new HashMap<>();
    int left = 0;
    int maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (charMap.containsKey(c) && charMap.get(c) >= left) {
            left = charMap.get(c) + 1;
        }
        charMap.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}`,
  },
  defaultInput: 'abcabcbb',
  run: runLongestSubstringWithoutRepeating,
  optimalApproachName: 'Last-Seen Index Map',
  approaches: [
    {
      id: 'hash-set-shrink',
      name: 'Hash Set + Shrink',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(min(n,m))',
      description:
        'Instead of jumping the left pointer straight past a duplicate via its last-seen index, keep a plain set of window chars and evict from the left one character at a time until the duplicate is gone.',
      code: {
        python: `def lengthOfLongestSubstring(s):
    char_set = set()
    left = 0
    max_len = 0

    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)

    return max_len`,
        javascript: `function lengthOfLongestSubstring(s) {
    const charSet = new Set();
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        charSet.add(s[right]);
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}`,
        java: `public static int lengthOfLongestSubstring(String s) {
    Set<Character> charSet = new HashSet<>();
    int left = 0;
    int maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        while (charSet.contains(s.charAt(right))) {
            charSet.remove(s.charAt(left));
            left++;
        }
        charSet.add(s.charAt(right));
        maxLen = Math.max(maxLen, right - left + 1);
    }

    return maxLen;
}`,
      },
      run: runLongestSubstringHashSet,
      lineExplanations: {
        python: {
          1: 'Define function taking string s',
          2: 'Set of characters currently inside the window',
          3: 'Left boundary of current window',
          4: 'Track longest substring length found',
          6: 'Expand window by moving right pointer',
          7: 'While the incoming char already sits in the window',
          8: 'Evict the leftmost character from the set',
          9: 'Step the left boundary right by one',
          10: 'Window is now duplicate-free — add the new char',
          11: 'Update max length if window is larger',
          13: 'Return the longest length found',
        },
        javascript: {
          1: 'Define function taking string s',
          2: 'Set of characters currently inside the window',
          3: 'Left boundary of current window',
          4: 'Track longest substring length found',
          6: 'Expand window by moving right pointer',
          7: 'While the incoming char already sits in the window',
          8: 'Evict the leftmost character from the set',
          9: 'Step the left boundary right by one',
          11: 'Window is now duplicate-free — add the new char',
          12: 'Update max length if window is larger',
          15: 'Return the longest length found',
        },
        java: {
          1: 'Define function taking string s',
          2: 'Set of characters currently inside the window',
          3: 'Left boundary of current window',
          4: 'Track longest substring length found',
          6: 'Expand window by moving right pointer',
          7: 'While the incoming char already sits in the window',
          8: 'Evict the leftmost character from the set',
          9: 'Step the left boundary right by one',
          11: 'Window is now duplicate-free — add the new char',
          12: 'Update max length if window is larger',
          15: 'Return the longest length found',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking string s',
      2: 'Map each char to its last seen index',
      3: 'Left boundary of current window',
      4: 'Track longest substring length found',
      6: 'Expand window by moving right pointer',
      7: 'If char is duplicate and inside window',
      8: 'Shrink window past the duplicate char',
      9: 'Update char\'s latest position',
      10: 'Update max length if window is larger',
      12: 'Return the longest length found',
    },
    javascript: {
      1: 'Define function taking string s',
      2: 'Map each char to its last seen index',
      3: 'Left boundary of current window',
      4: 'Track longest substring length found',
      6: 'Expand window by moving right pointer',
      7: 'If char is duplicate and inside window',
      8: 'Shrink window past the duplicate char',
      10: 'Update char\'s latest position',
      11: 'Update max length if window is larger',
      14: 'Return the longest length found',
    },
    java: {
      1: 'Define function taking string s',
      2: 'Map each char to its last seen index',
      3: 'Left boundary of current window',
      4: 'Track longest substring length found',
      6: 'Expand window by moving right pointer',
      7: 'Get current character at right pointer',
      8: 'If char is duplicate and inside window',
      9: 'Shrink window past the duplicate char',
      11: 'Store char\'s latest position in map',
      12: 'Update max length if window is larger',
      15: 'Return the longest length found',
    },
  },
};
