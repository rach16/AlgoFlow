import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

interface MinWindowInput {
  s: string;
  t: string;
}

function runMinimumWindowSubstring(input: unknown): AlgorithmStep[] {
  const { s, t } = input as MinWindowInput;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');

  // Build target count map
  const tCount: Record<string, number> = {};
  for (const ch of t) {
    tCount[ch] = (tCount[ch] || 0) + 1;
  }

  const windowCount: Record<string, number> = {};
  const have = 0;
  const need = Object.keys(tCount).length;

  // Initial state
  steps.push({
    state: {
      chars: [...chars],
      tCount: { ...tCount },
      windowCount: {},
      result: '',
      have: 0,
      need,
    },
    highlights: [],
    message: `Find minimum window in "${s}" containing all characters of "${t}". Need ${need} unique chars: ${JSON.stringify(tCount)}`,
    codeLine: 1,
  });

  let left = 0;
  let haveCount = have;
  let resultBounds: [number, number] = [-1, -1];
  let resultLen = Infinity;

  for (let right = 0; right < chars.length; right++) {
    const char = chars[right];

    // Add character to window
    windowCount[char] = (windowCount[char] || 0) + 1;

    // Check if this character's count now satisfies the target
    if (char in tCount && windowCount[char] === tCount[char]) {
      haveCount++;
    }

    steps.push({
      state: {
        chars: [...chars],
        tCount: { ...tCount },
        windowCount: { ...windowCount },
        result: resultLen === Infinity ? '' : s.slice(resultBounds[0], resultBounds[1] + 1),
        have: haveCount,
        need,
      },
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      pointers: { left, right },
      message: `Add '${char}' to window. windowCount['${char}']=${windowCount[char]}. have=${haveCount}, need=${need}`,
      codeLine: 6,
      action: 'visit',
    });

    // Try to shrink window while we have all required characters
    while (haveCount === need) {
      const windowLen = right - left + 1;

      steps.push({
        state: {
          chars: [...chars],
          tCount: { ...tCount },
          windowCount: { ...windowCount },
          result: resultLen === Infinity ? '' : s.slice(resultBounds[0], resultBounds[1] + 1),
          have: haveCount,
          need,
        },
        highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        pointers: { left, right },
        message: `All characters satisfied (have=${haveCount}). Window "${s.slice(left, right + 1)}" length=${windowLen}`,
        codeLine: 8,
        action: 'found',
      });

      // Update result if this window is smaller
      if (windowLen < resultLen) {
        resultLen = windowLen;
        resultBounds = [left, right];

        steps.push({
          state: {
            chars: [...chars],
            tCount: { ...tCount },
            windowCount: { ...windowCount },
            result: s.slice(resultBounds[0], resultBounds[1] + 1),
            have: haveCount,
            need,
          },
          highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
          pointers: { left, right },
          message: `New minimum window found: "${s.slice(left, right + 1)}" (length=${windowLen})`,
          codeLine: 10,
          action: 'found',
        });
      }

      // Shrink from left
      const removedChar = chars[left];
      windowCount[removedChar]--;

      if (removedChar in tCount && windowCount[removedChar] < tCount[removedChar]) {
        haveCount--;
      }

      steps.push({
        state: {
          chars: [...chars],
          tCount: { ...tCount },
          windowCount: { ...windowCount },
          result: resultLen === Infinity ? '' : s.slice(resultBounds[0], resultBounds[1] + 1),
          have: haveCount,
          need,
        },
        highlights: Array.from({ length: right - left }, (_, i) => left + 1 + i),
        pointers: { left: left + 1, right },
        message: `Shrink window: remove '${removedChar}' from left. have=${haveCount}, need=${need}`,
        codeLine: 13,
        action: 'delete',
      });

      left++;
    }
  }

  // Final result
  const finalResult = resultLen === Infinity ? '' : s.slice(resultBounds[0], resultBounds[1] + 1);
  const finalHighlights =
    resultLen === Infinity
      ? []
      : Array.from({ length: resultBounds[1] - resultBounds[0] + 1 }, (_, i) => resultBounds[0] + i);

  steps.push({
    state: {
      chars: [...chars],
      tCount: { ...tCount },
      windowCount: { ...windowCount },
      result: finalResult,
      have: haveCount,
      need,
    },
    highlights: finalHighlights,
    message: finalResult
      ? `Minimum window substring: "${finalResult}" (length=${resultLen})`
      : `No valid window found containing all characters of "${t}"`,
    codeLine: 15,
    action: finalResult ? 'found' : undefined,
  });

  return steps;
}

export const minimumWindowSubstring: Algorithm = {
  id: 'minimum-window-substring',
  name: 'Minimum Window Substring',
  category: 'Sliding Window',
  difficulty: 'Hard',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(m)',
  pattern: 'Sliding Window — expand to satisfy, shrink to minimize',
  description:
    'Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".',
  problemUrl: 'https://leetcode.com/problems/minimum-window-substring/',
  code: {
    python: `def minWindow(s, t):
    if not t or not s:
        return ""
    t_count = {}
    for c in t:
        t_count[c] = t_count.get(c, 0) + 1
    have, need = 0, len(t_count)
    window_count = {}

    result, result_len = [-1, -1], float("inf")
    left = 0

    for right in range(len(s)):
        c = s[right]
        window_count[c] = window_count.get(c, 0) + 1
        if c in t_count and window_count[c] == t_count[c]:
            have += 1

        while have == need:
            if (right - left + 1) < result_len:
                result = [left, right]
                result_len = right - left + 1
            window_count[s[left]] -= 1
            if s[left] in t_count and window_count[s[left]] < t_count[s[left]]:
                have -= 1
            left += 1

    l, r = result
    return s[l:r+1] if result_len != float("inf") else ""`,
    javascript: `function minWindow(s, t) {
    if (!t || !s) return "";
    const tCount = {};
    for (const c of t)
        tCount[c] = (tCount[c] || 0) + 1;
    let have = 0;
    const need = Object.keys(tCount).length;
    const windowCount = {};

    let result = [-1, -1], resultLen = Infinity;
    let left = 0;

    for (let right = 0; right < s.length; right++) {
        const c = s[right];
        windowCount[c] = (windowCount[c] || 0) + 1;
        if (c in tCount && windowCount[c] === tCount[c])
            have++;

        while (have === need) {
            if ((right - left + 1) < resultLen) {
                result = [left, right];
                resultLen = right - left + 1;
            }
            windowCount[s[left]]--;
            if (s[left] in tCount && windowCount[s[left]] < tCount[s[left]])
                have--;
            left++;
        }
    }

    const [l, r] = result;
    return resultLen !== Infinity ? s.slice(l, r + 1) : "";
}`,
    java: `public static String minWindow(String s, String t) {
    if (t == null || s == null || t.length() == 0 || s.length() == 0) return "";
    Map<Character, Integer> tCount = new HashMap<>();
    for (char c : t.toCharArray()) {
        tCount.put(c, tCount.getOrDefault(c, 0) + 1);
    }
    int have = 0;
    int need = tCount.size();
    Map<Character, Integer> windowCount = new HashMap<>();

    int[] result = {-1, -1};
    int resultLen = Integer.MAX_VALUE;
    int left = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        windowCount.put(c, windowCount.getOrDefault(c, 0) + 1);
        if (tCount.containsKey(c) && windowCount.get(c).equals(tCount.get(c))) {
            have++;
        }

        while (have == need) {
            if ((right - left + 1) < resultLen) {
                result[0] = left;
                result[1] = right;
                resultLen = right - left + 1;
            }
            char leftChar = s.charAt(left);
            windowCount.put(leftChar, windowCount.get(leftChar) - 1);
            if (tCount.containsKey(leftChar) && windowCount.get(leftChar) < tCount.get(leftChar)) {
                have--;
            }
            left++;
        }
    }

    return resultLen != Integer.MAX_VALUE ? s.substring(result[0], result[1] + 1) : "";
}`,
  },
  defaultInput: { s: 'ADOBECODEBANC', t: 'ABC' },
  run: runMinimumWindowSubstring,
};
