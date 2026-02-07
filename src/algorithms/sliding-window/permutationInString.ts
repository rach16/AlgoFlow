import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface PermutationInput {
  s1: string;
  s2: string;
}

function runPermutationInString(input: unknown): AlgorithmStep[] {
  const { s1, s2 } = input as PermutationInput;
  const steps: AlgorithmStep[] = [];
  const chars = s2.split('');

  // Build s1 count map
  const s1Count: Record<string, number> = {};
  for (const ch of s1) {
    s1Count[ch] = (s1Count[ch] || 0) + 1;
  }

  const windowCount: Record<string, number> = {};

  // Initial state
  steps.push({
    state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: {}, result: false },
    highlights: [],
    message: `Check if any permutation of "${s1}" exists in "${s2}". s1 frequency: ${JSON.stringify(s1Count)}`,
    codeLine: 1,
  });

  // Helper to check if two count maps match
  const countsMatch = (a: Record<string, number>, b: Record<string, number>): boolean => {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b).filter((k) => b[k] > 0);
    const allKeys = new Set([...keysA, ...keysB]);
    for (const key of allKeys) {
      if ((a[key] || 0) !== (b[key] || 0)) return false;
    }
    return true;
  };

  // Helper to count matches (number of characters with matching frequency)
  const countMatches = (a: Record<string, number>, b: Record<string, number>): number => {
    let matches = 0;
    const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of allKeys) {
      if ((a[key] || 0) === (b[key] || 0)) matches++;
    }
    return matches;
  };

  const windowSize = s1.length;

  // Build initial window
  for (let i = 0; i < windowSize && i < s2.length; i++) {
    windowCount[s2[i]] = (windowCount[s2[i]] || 0) + 1;

    steps.push({
      state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: { ...windowCount }, result: false },
      highlights: Array.from({ length: i + 1 }, (_, idx) => idx),
      pointers: { right: i },
      message: `Building initial window: add '${s2[i]}'. windowCount = ${JSON.stringify(windowCount)}`,
      codeLine: 4,
      action: 'insert',
    });
  }

  // Check initial window
  if (countsMatch(s1Count, windowCount)) {
    steps.push({
      state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: { ...windowCount }, result: true },
      highlights: Array.from({ length: windowSize }, (_, i) => i),
      pointers: { left: 0, right: windowSize - 1 },
      message: `Window matches s1 frequency! Permutation found at index 0: "${s2.slice(0, windowSize)}"`,
      codeLine: 6,
      action: 'found',
    });
    return steps;
  }

  steps.push({
    state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: { ...windowCount }, result: false },
    highlights: Array.from({ length: windowSize }, (_, i) => i),
    pointers: { left: 0, right: windowSize - 1 },
    message: `Initial window "${s2.slice(0, windowSize)}" does not match. Matches: ${countMatches(s1Count, windowCount)}`,
    codeLine: 6,
    action: 'compare',
  });

  // Slide the window
  for (let right = windowSize; right < s2.length; right++) {
    const left = right - windowSize;

    // Remove left character
    const removedChar = s2[left];
    windowCount[removedChar]--;
    if (windowCount[removedChar] === 0) {
      delete windowCount[removedChar];
    }

    steps.push({
      state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: { ...windowCount }, result: false },
      highlights: Array.from({ length: windowSize }, (_, i) => left + 1 + i),
      pointers: { left: left + 1, right },
      message: `Remove '${removedChar}' from left (index ${left}). windowCount = ${JSON.stringify(windowCount)}`,
      codeLine: 9,
      action: 'delete',
    });

    // Add right character
    const addedChar = s2[right];
    windowCount[addedChar] = (windowCount[addedChar] || 0) + 1;

    steps.push({
      state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: { ...windowCount }, result: false },
      highlights: Array.from({ length: windowSize }, (_, i) => left + 1 + i),
      pointers: { left: left + 1, right },
      message: `Add '${addedChar}' at right (index ${right}). windowCount = ${JSON.stringify(windowCount)}`,
      codeLine: 10,
      action: 'insert',
    });

    // Check if window matches
    if (countsMatch(s1Count, windowCount)) {
      steps.push({
        state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: { ...windowCount }, result: true },
        highlights: Array.from({ length: windowSize }, (_, i) => left + 1 + i),
        pointers: { left: left + 1, right },
        message: `Window "${s2.slice(left + 1, right + 1)}" matches s1 frequency! Permutation found!`,
        codeLine: 12,
        action: 'found',
      });
      return steps;
    }

    steps.push({
      state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: { ...windowCount }, result: false },
      highlights: Array.from({ length: windowSize }, (_, i) => left + 1 + i),
      pointers: { left: left + 1, right },
      message: `Window "${s2.slice(left + 1, right + 1)}" does not match. Matches: ${countMatches(s1Count, windowCount)}. Slide window.`,
      codeLine: 12,
      action: 'compare',
    });
  }

  // No permutation found
  steps.push({
    state: { chars: [...chars], s1Count: { ...s1Count }, windowCount: { ...windowCount }, result: false },
    highlights: [],
    message: `No permutation of "${s1}" found in "${s2}"`,
    codeLine: 14,
  });

  return steps;
}

export const permutationInString: Algorithm = {
  id: 'permutation-in-string',
  name: 'Permutation in String',
  category: 'Sliding Window',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Sliding Window — fixed-size window with char frequency match',
  description:
    'Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise. In other words, return true if one of s1\'s permutations is the substring of s2.',
  problemUrl: 'https://leetcode.com/problems/permutation-in-string/',
  code: {
    python: `def checkInclusion(s1, s2):
    if len(s1) > len(s2):
        return False
    s1_count = {}
    for c in s1:
        s1_count[c] = s1_count.get(c, 0) + 1
    window_count = {}
    for i in range(len(s1)):
        window_count[s2[i]] = window_count.get(s2[i], 0) + 1

    if s1_count == window_count:
        return True

    for right in range(len(s1), len(s2)):
        left = right - len(s1)
        window_count[s2[left]] -= 1
        if window_count[s2[left]] == 0:
            del window_count[s2[left]]
        window_count[s2[right]] = window_count.get(s2[right], 0) + 1

        if s1_count == window_count:
            return True

    return False`,
    javascript: `function checkInclusion(s1, s2) {
    if (s1.length > s2.length) return false;
    const s1Count = {};
    for (const c of s1)
        s1Count[c] = (s1Count[c] || 0) + 1;
    const windowCount = {};
    for (let i = 0; i < s1.length; i++)
        windowCount[s2[i]] = (windowCount[s2[i]] || 0) + 1;

    if (JSON.stringify(s1Count) === JSON.stringify(windowCount))
        return true;

    for (let right = s1.length; right < s2.length; right++) {
        const left = right - s1.length;
        windowCount[s2[left]]--;
        if (windowCount[s2[left]] === 0)
            delete windowCount[s2[left]];
        windowCount[s2[right]] = (windowCount[s2[right]] || 0) + 1;

        if (JSON.stringify(s1Count) === JSON.stringify(windowCount))
            return true;
    }

    return false;
}`,
    java: `public static boolean checkInclusion(String s1, String s2) {
    if (s1.length() > s2.length()) return false;
    Map<Character, Integer> s1Count = new HashMap<>();
    for (char c : s1.toCharArray()) {
        s1Count.put(c, s1Count.getOrDefault(c, 0) + 1);
    }
    Map<Character, Integer> windowCount = new HashMap<>();
    for (int i = 0; i < s1.length(); i++) {
        char c = s2.charAt(i);
        windowCount.put(c, windowCount.getOrDefault(c, 0) + 1);
    }

    if (s1Count.equals(windowCount)) return true;

    for (int right = s1.length(); right < s2.length(); right++) {
        int left = right - s1.length();
        char leftChar = s2.charAt(left);
        windowCount.put(leftChar, windowCount.get(leftChar) - 1);
        if (windowCount.get(leftChar) == 0) {
            windowCount.remove(leftChar);
        }
        char rightChar = s2.charAt(right);
        windowCount.put(rightChar, windowCount.getOrDefault(rightChar, 0) + 1);

        if (s1Count.equals(windowCount)) return true;
    }

    return false;
}`,
  },
  defaultInput: { s1: 'ab', s2: 'eidbaooo' },
  run: runPermutationInString,
};
