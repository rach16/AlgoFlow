import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface CharReplacementInput {
  s: string;
  k: number;
}

function runLongestRepeatingCharReplacement(input: unknown): AlgorithmStep[] {
  const { s, k } = input as CharReplacementInput;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');
  const count: Record<string, number> = {};

  // Initial state
  steps.push({
    state: { chars: [...chars], count: {}, result: 0, k },
    highlights: [],
    message: `Find the longest substring with at most ${k} character replacements in "${s}"`,
    codeLine: 1,
  });

  let left = 0;
  let maxFreq = 0;
  let maxLen = 0;

  for (let right = 0; right < chars.length; right++) {
    const char = chars[right];

    // Increment count for current character
    count[char] = (count[char] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[char]);

    steps.push({
      state: { chars: [...chars], count: { ...count }, result: maxLen, k, maxFreq },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Add '${char}' to window. count['${char}'] = ${count[char]}. maxFreq = ${maxFreq}`,
      codeLine: 5,
      action: 'visit',
    });

    // Window size - maxFreq > k means we need more than k replacements
    const windowSize = right - left + 1;
    const replacementsNeeded = windowSize - maxFreq;

    steps.push({
      state: { chars: [...chars], count: { ...count }, result: maxLen, k, maxFreq },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Window size=${windowSize}, maxFreq=${maxFreq}, replacements needed=${replacementsNeeded} (k=${k})`,
      codeLine: 7,
      action: 'compare',
    });

    if (replacementsNeeded > k) {
      // Shrink window from left
      const removedChar = chars[left];
      count[removedChar]--;

      steps.push({
        state: { chars: [...chars], count: { ...count }, result: maxLen, k, maxFreq },
        highlights: Array.from({ length: right - left }, (_, i) => left + 1 + i),
        pointers: { left: left + 1, right },
        message: `Replacements needed (${replacementsNeeded}) > k (${k}). Remove '${removedChar}' from left, shrink window.`,
        codeLine: 9,
        action: 'delete',
      });

      left++;
    } else {
      // Update max length
      const currentLen = right - left + 1;
      if (currentLen > maxLen) {
        maxLen = currentLen;
        steps.push({
          state: { chars: [...chars], count: { ...count }, result: maxLen, k, maxFreq },
          highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
          pointers: { left, right },
          message: `Valid window! "${s.slice(left, right + 1)}" length=${currentLen}. Update maxLen = ${maxLen}`,
          codeLine: 11,
          action: 'found',
        });
      }
    }
  }

  // Final result
  steps.push({
    state: { chars: [...chars], count: { ...count }, result: maxLen, k },
    highlights: [],
    message: `Longest repeating character replacement substring has length ${maxLen}`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const longestRepeatingCharReplacement: Algorithm = {
  id: 'longest-repeating-character-replacement',
  name: 'Longest Repeating Character Replacement',
  category: 'Sliding Window',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  pattern: 'Sliding Window — window size minus max freq ≤ k',
  description:
    'You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get after performing the above operations.',
  problemUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
  code: {
    python: `def characterReplacement(s, k):
    count = {}
    left = 0
    max_freq = 0
    max_len = 0

    for right in range(len(s)):
        count[s[right]] = count.get(s[right], 0) + 1
        max_freq = max(max_freq, count[s[right]])

        if (right - left + 1) - max_freq > k:
            count[s[left]] -= 1
            left += 1
        else:
            max_len = max(max_len, right - left + 1)

    return max_len`,
    javascript: `function characterReplacement(s, k) {
    const count = {};
    let left = 0;
    let maxFreq = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        count[s[right]] = (count[s[right]] || 0) + 1;
        maxFreq = Math.max(maxFreq, count[s[right]]);

        if ((right - left + 1) - maxFreq > k) {
            count[s[left]]--;
            left++;
        } else {
            maxLen = Math.max(maxLen, right - left + 1);
        }
    }

    return maxLen;
}`,
    java: `public static int characterReplacement(String s, int k) {
    Map<Character, Integer> count = new HashMap<>();
    int left = 0;
    int maxFreq = 0;
    int maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        count.put(c, count.getOrDefault(c, 0) + 1);
        maxFreq = Math.max(maxFreq, count.get(c));

        if ((right - left + 1) - maxFreq > k) {
            count.put(s.charAt(left), count.get(s.charAt(left)) - 1);
            left++;
        } else {
            maxLen = Math.max(maxLen, right - left + 1);
        }
    }

    return maxLen;
}`,
  },
  defaultInput: { s: 'AABABBA', k: 1 },
  run: runLongestRepeatingCharReplacement,
};
