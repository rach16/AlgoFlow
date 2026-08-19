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

function runMinWindowFiltered(input: unknown): AlgorithmStep[] {
  const { s, t } = input as MinWindowInput;
  const steps: AlgorithmStep[] = [];
  const chars = s.split('');

  const tCount: Record<string, number> = {};
  for (const ch of t) {
    tCount[ch] = (tCount[ch] || 0) + 1;
  }
  const need = Object.keys(tCount).length;

  steps.push({
    state: { chars: [...chars], tCount: { ...tCount }, windowCount: {}, result: '', have: 0, need },
    highlights: [],
    message: `Most of "${s}" is noise — only characters from "${t}" can ever matter. Pre-filter their positions and slide the window over just those`,
    codeLine: 1,
  });

  const filtered: Array<[number, string]> = [];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] in tCount) {
      filtered.push([i, chars[i]]);
    }
  }

  steps.push({
    state: { chars: [...chars], tCount: { ...tCount }, windowCount: {}, result: '', have: 0, need },
    highlights: filtered.map((f) => f[0]),
    message: `Filtered: only ${filtered.length} of ${s.length} chars are relevant — [${filtered.map(([i, c]) => `'${c}'@${i}`).join(', ')}]. The window will hop between these positions`,
    codeLine: 7,
    action: 'visit',
  });

  const windowCount: Record<string, number> = {};
  let have = 0;
  let left = 0;
  let resultBounds: [number, number] = [-1, -1];
  let resultLen = Infinity;

  const currentResult = () =>
    resultLen === Infinity ? '' : s.slice(resultBounds[0], resultBounds[1] + 1);

  for (let right = 0; right < filtered.length; right++) {
    const [idx, c] = filtered[right];

    windowCount[c] = (windowCount[c] || 0) + 1;
    if (windowCount[c] === tCount[c]) {
      have++;
    }

    steps.push({
      state: {
        chars: [...chars],
        tCount: { ...tCount },
        windowCount: { ...windowCount },
        result: currentResult(),
        have,
        need,
      },
      highlights: filtered.slice(left, right + 1).map((f) => f[0]),
      pointers: { left: filtered[left][0], right: idx },
      message: `Take '${c}' at index ${idx}, skipping irrelevant chars in between. have=${have}, need=${need}`,
      codeLine: 15,
      action: 'visit',
    });

    while (have === need) {
      const start = filtered[left][0];
      const end = idx;
      const windowLen = end - start + 1;

      if (windowLen < resultLen) {
        resultLen = windowLen;
        resultBounds = [start, end];

        steps.push({
          state: {
            chars: [...chars],
            tCount: { ...tCount },
            windowCount: { ...windowCount },
            result: currentResult(),
            have,
            need,
          },
          highlights: Array.from({ length: windowLen }, (_, i) => start + i),
          pointers: { left: start, right: end },
          message: `All of "${t}" covered — new minimum window "${s.slice(start, end + 1)}" (length ${windowLen}, measured in ORIGINAL indices)`,
          codeLine: 22,
          action: 'found',
        });
      }

      const lc = filtered[left][1];
      windowCount[lc]--;
      if (windowCount[lc] < tCount[lc]) {
        have--;
      }
      left++;

      steps.push({
        state: {
          chars: [...chars],
          tCount: { ...tCount },
          windowCount: { ...windowCount },
          result: currentResult(),
          have,
          need,
        },
        highlights: left <= right ? filtered.slice(left, right + 1).map((f) => f[0]) : [],
        pointers: left <= right ? { left: filtered[left][0], right: idx } : { right: idx },
        message: `Shrink: drop '${lc}' and hop left straight to the next relevant char. have=${have}, need=${need}`,
        codeLine: 25,
        action: 'delete',
      });
    }
  }

  const finalResult = currentResult();
  steps.push({
    state: {
      chars: [...chars],
      tCount: { ...tCount },
      windowCount: { ...windowCount },
      result: finalResult,
      have,
      need,
    },
    highlights:
      resultLen === Infinity
        ? []
        : Array.from({ length: resultBounds[1] - resultBounds[0] + 1 }, (_, i) => resultBounds[0] + i),
    message: finalResult
      ? `Minimum window substring: "${finalResult}" (length ${resultLen}). Filtering pays off when t's characters are sparse in s`
      : `No valid window found containing all characters of "${t}"`,
    codeLine: 31,
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
  optimalApproachName: 'Sliding Window',
  approaches: [
    {
      id: 'filtered-string',
      name: 'Filtered String',
      timeComplexity: 'O(m + n)',
      spaceComplexity: 'O(m + n)',
      description:
        'Pre-filter s down to only positions whose character appears in t, then run the same expand/shrink window over that short list — the pointers hop across irrelevant characters instead of visiting every index.',
      code: {
        python: `def minWindow(s, t):
    if not t or not s:
        return ""
    t_count = {}
    for c in t:
        t_count[c] = t_count.get(c, 0) + 1
    filtered = [(i, c) for i, c in enumerate(s) if c in t_count]
    have, need = 0, len(t_count)
    window_count = {}
    result, result_len = [-1, -1], float("inf")
    left = 0

    for right in range(len(filtered)):
        c = filtered[right][1]
        window_count[c] = window_count.get(c, 0) + 1
        if window_count[c] == t_count[c]:
            have += 1

        while have == need:
            start, end = filtered[left][0], filtered[right][0]
            if end - start + 1 < result_len:
                result = [start, end]
                result_len = end - start + 1
            lc = filtered[left][1]
            window_count[lc] -= 1
            if window_count[lc] < t_count[lc]:
                have -= 1
            left += 1

    l, r = result
    return s[l:r+1] if result_len != float("inf") else ""`,
        javascript: `function minWindow(s, t) {
    if (!t || !s) return "";
    const tCount = {};
    for (const c of t)
        tCount[c] = (tCount[c] || 0) + 1;
    const filtered = [];
    for (let i = 0; i < s.length; i++)
        if (s[i] in tCount) filtered.push([i, s[i]]);
    let have = 0;
    const need = Object.keys(tCount).length;
    const windowCount = {};
    let result = [-1, -1], resultLen = Infinity;
    let left = 0;

    for (let right = 0; right < filtered.length; right++) {
        const c = filtered[right][1];
        windowCount[c] = (windowCount[c] || 0) + 1;
        if (windowCount[c] === tCount[c]) have++;

        while (have === need) {
            const start = filtered[left][0], end = filtered[right][0];
            if (end - start + 1 < resultLen) {
                result = [start, end];
                resultLen = end - start + 1;
            }
            const lc = filtered[left][1];
            windowCount[lc]--;
            if (windowCount[lc] < tCount[lc]) have--;
            left++;
        }
    }

    const [l, r] = result;
    return resultLen !== Infinity ? s.slice(l, r + 1) : "";
}`,
        java: `public static String minWindow(String s, String t) {
    if (s.length() == 0 || t.length() == 0) return "";
    Map<Character, Integer> tCount = new HashMap<>();
    for (char c : t.toCharArray()) {
        tCount.put(c, tCount.getOrDefault(c, 0) + 1);
    }
    List<int[]> filtered = new ArrayList<>();
    for (int i = 0; i < s.length(); i++) {
        if (tCount.containsKey(s.charAt(i))) {
            filtered.add(new int[] { i, s.charAt(i) });
        }
    }
    int have = 0;
    int need = tCount.size();
    Map<Character, Integer> windowCount = new HashMap<>();
    int[] result = {-1, -1};
    int resultLen = Integer.MAX_VALUE;
    int left = 0;

    for (int right = 0; right < filtered.size(); right++) {
        char c = (char) filtered.get(right)[1];
        windowCount.put(c, windowCount.getOrDefault(c, 0) + 1);
        if (windowCount.get(c).equals(tCount.get(c))) have++;

        while (have == need) {
            int start = filtered.get(left)[0], end = filtered.get(right)[0];
            if (end - start + 1 < resultLen) {
                result[0] = start;
                result[1] = end;
                resultLen = end - start + 1;
            }
            char lc = (char) filtered.get(left)[1];
            windowCount.put(lc, windowCount.get(lc) - 1);
            if (windowCount.get(lc) < tCount.get(lc)) have--;
            left++;
        }
    }

    return resultLen != Integer.MAX_VALUE ? s.substring(result[0], result[1] + 1) : "";
}`,
      },
      run: runMinWindowFiltered,
      lineExplanations: {
        python: {
          1: 'Define function taking strings s and t',
          2: 'Handle empty input edge case',
          3: 'Return empty string if either is empty',
          4: 'Build frequency map for target string t',
          5: 'Iterate over each char in t',
          6: 'get(k, 0) returns 0 for a key never seen, so its first count becomes 1 — no KeyError',
          7: 'Keep only (index, char) pairs whose char appears in t',
          8: 'Track satisfied and total unique chars needed',
          9: 'Frequency map for chars inside the window',
          10: 'Best result bounds and length so far',
          11: 'Left pointer into the FILTERED list',
          13: 'Right pointer walks the filtered list, not all of s',
          14: 'Character at the right position',
          15: 'get(k, 0) returns 0 for a key never seen, so its first count becomes 1 — no KeyError',
          16: 'If its count now matches the target count',
          17: 'One more unique char fully satisfied',
          19: 'Shrink while every target char is covered',
          20: 'Convert filtered positions back to ORIGINAL indices',
          21: 'Is this window shorter than the best so far?',
          22: 'Record the new best bounds',
          23: 'Record the new best length',
          24: 'Character leaving from the left',
          25: 'Remove it from the window count',
          26: 'Did removing it break coverage?',
          27: 'One unique char no longer satisfied',
          28: 'Hop left to the next relevant position',
          30: 'Unpack the best bounds',
          31: 'Return min window substring or empty string',
        },
        javascript: {
          1: 'Define function taking strings s and t',
          2: 'Return empty string if either is empty',
          3: 'Build frequency map for target string t',
          4: 'Iterate over each char in t',
          5: 'Count occurrences of each target char',
          6: 'List of [index, char] pairs relevant to t',
          7: 'Scan s once to build the filtered list',
          8: 'Keep only chars that appear in t',
          9: 'Track satisfied unique char count',
          10: 'Total unique chars needed to satisfy',
          11: 'Frequency map for chars inside the window',
          12: 'Best result bounds and length so far',
          13: 'Left pointer into the FILTERED list',
          15: 'Right pointer walks the filtered list, not all of s',
          16: 'Character at the right position',
          17: 'Add it to the window count',
          18: 'If its count matches target, one more char satisfied',
          20: 'Shrink while every target char is covered',
          21: 'Convert filtered positions back to ORIGINAL indices',
          22: 'Is this window shorter than the best so far?',
          23: 'Record the new best bounds',
          24: 'Record the new best length',
          26: 'Character leaving from the left',
          27: 'Remove it from the window count',
          28: 'If coverage broke, one char no longer satisfied',
          29: 'Hop left to the next relevant position',
          33: 'Unpack the best bounds',
          34: 'Return min window substring or empty string',
        },
        java: {
          1: 'Define function taking strings s and t',
          2: 'Return empty string if either is empty',
          3: 'Build frequency map for target string t',
          4: 'Iterate over each char in t',
          5: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
          7: 'List of {index, char} pairs relevant to t',
          8: 'Scan s once to build the filtered list',
          9: 'Keep only chars that appear in t',
          10: 'Store original index alongside the char',
          13: 'Track satisfied unique char count',
          14: 'Total unique chars needed to satisfy',
          15: 'Frequency map for chars inside the window',
          16: 'Best result bounds so far',
          17: 'Best (minimum) window length so far',
          18: 'Left pointer into the FILTERED list',
          20: 'Right pointer walks the filtered list, not all of s',
          21: 'Character at the right position',
          22: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
          23: 'If its count matches target, one more char satisfied',
          25: 'Shrink while every target char is covered',
          26: 'Convert filtered positions back to ORIGINAL indices',
          27: 'Is this window shorter than the best so far?',
          28: 'Record the new best left bound',
          29: 'Record the new best right bound',
          30: 'Record the new best length',
          32: 'Character leaving from the left',
          33: 'Remove it from the window count',
          34: 'If coverage broke, one char no longer satisfied',
          35: 'Hop left to the next relevant position',
          39: 'Return min window substring or empty string',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking strings s and t',
      2: 'Handle empty input edge case',
      3: 'Return empty string if either is empty',
      4: 'Build frequency map for target string t',
      5: 'Iterate over each char in t',
      6: 'get(k, 0) returns 0 for a key never seen, so its first count becomes 1 — no KeyError',
      7: 'Track satisfied and total unique chars needed',
      8: 'Frequency map for current window chars',
      10: 'Track best result bounds and length',
      11: 'Left boundary of sliding window',
      13: 'Expand window by moving right pointer',
      14: 'Get current character',
      15: 'get(k, 0) returns 0 for a key never seen, so its first count becomes 1 — no KeyError',
      16: 'If char count now matches target count',
      17: 'Increment count of satisfied characters',
      19: 'Try shrinking while all chars satisfied',
      20: 'If current window is smallest so far',
      21: 'Store current window boundaries',
      22: 'Update minimum length found',
      23: 'Decrement count of outgoing left char',
      24: 'If removing char breaks satisfaction',
      25: 'Decrement satisfied character count',
      26: 'Move left boundary right to shrink window',
      28: 'Extract result bounds',
      29: 'Return min window substring or empty string',
    },
    javascript: {
      1: 'Define function taking strings s and t',
      2: 'Return empty string if either is empty',
      3: 'Build frequency map for target string t',
      4: 'Iterate over each char in t',
      5: 'Count occurrences of each target char',
      6: 'Track satisfied unique char count',
      7: 'Total unique chars needed to satisfy',
      8: 'Frequency map for current window chars',
      10: 'Track best result bounds and length',
      11: 'Left boundary of sliding window',
      13: 'Expand window by moving right pointer',
      14: 'Get current character',
      15: 'Add char to window frequency count',
      16: 'If char count now matches target count',
      17: 'Increment count of satisfied characters',
      19: 'Try shrinking while all chars satisfied',
      20: 'If current window is smallest so far',
      21: 'Store current window boundaries',
      22: 'Update minimum length found',
      24: 'Decrement count of outgoing left char',
      25: 'If removing char breaks satisfaction',
      26: 'Decrement satisfied character count',
      27: 'Move left boundary right to shrink window',
      31: 'Extract result bounds',
      32: 'Return min window substring or empty string',
    },
    java: {
      1: 'Define function taking strings s and t',
      2: 'Return empty string if either is null or empty',
      3: 'Build frequency map for target string t',
      4: 'Iterate over each char in t',
      5: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
      7: 'Track satisfied unique char count',
      8: 'Total unique chars needed to satisfy',
      9: 'Frequency map for current window chars',
      11: 'Track best result bounds',
      12: 'Track minimum window length found',
      13: 'Left boundary of sliding window',
      15: 'Expand window by moving right pointer',
      16: 'Get current character at right pointer',
      17: 'getOrDefault gives 0 instead of the null get() would return, so a first sighting becomes 1',
      18: 'If char count now matches target count',
      19: 'Increment count of satisfied characters',
      22: 'Try shrinking while all chars satisfied',
      23: 'If current window is smallest so far',
      24: 'Update left bound of result',
      25: 'Update right bound of result',
      26: 'Update minimum length found',
      28: 'Get outgoing left character',
      29: 'Decrement count of outgoing left char',
      30: 'If removing char breaks satisfaction',
      31: 'Decrement satisfied character count',
      33: 'Move left boundary right to shrink window',
      37: 'Return min window substring or empty string',
    },
  },
};
