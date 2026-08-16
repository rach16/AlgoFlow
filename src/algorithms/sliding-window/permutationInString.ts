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

function runPermutationMatchCounter(input: unknown): AlgorithmStep[] {
  const { s1, s2 } = input as PermutationInput;
  const steps: AlgorithmStep[] = [];
  const chars = s2.split('');
  const A = 'a'.charCodeAt(0);

  const toRecord = (arr: number[]): Record<string, number> => {
    const rec: Record<string, number> = {};
    for (let i = 0; i < 26; i++) {
      if (arr[i] > 0) rec[String.fromCharCode(A + i)] = arr[i];
    }
    return rec;
  };

  steps.push({
    state: { chars: [...chars], s1Count: {}, windowCount: {}, result: false },
    highlights: [],
    message: `Fixed 26-slot count arrays + a "matches" counter: instead of comparing whole maps every slide, track how many of the 26 letters already agree — a slide only touches 2 letters`,
    codeLine: 1,
  });

  if (s1.length > s2.length) {
    steps.push({
      state: { chars: [...chars], s1Count: {}, windowCount: {}, result: false },
      highlights: [],
      message: `s1 (length ${s1.length}) is longer than s2 (length ${s2.length}) — no permutation can fit`,
      codeLine: 3,
    });
    return steps;
  }

  const s1Arr = new Array(26).fill(0);
  const winArr = new Array(26).fill(0);

  for (let i = 0; i < s1.length; i++) {
    s1Arr[s1.charCodeAt(i) - A]++;
    winArr[s2.charCodeAt(i) - A]++;
  }

  steps.push({
    state: { chars: [...chars], s1Count: toRecord(s1Arr), windowCount: toRecord(winArr), result: false },
    highlights: Array.from({ length: s1.length }, (_, i) => i),
    pointers: { left: 0, right: s1.length - 1 },
    message: `Fill both 26-slot arrays: s1 needs ${JSON.stringify(toRecord(s1Arr))}, initial window "${s2.slice(0, s1.length)}" holds ${JSON.stringify(toRecord(winArr))}`,
    codeLine: 6,
    action: 'insert',
  });

  let matches = 0;
  for (let i = 0; i < 26; i++) {
    if (s1Arr[i] === winArr[i]) matches++;
  }

  steps.push({
    state: { chars: [...chars], s1Count: toRecord(s1Arr), windowCount: toRecord(winArr), result: false },
    highlights: Array.from({ length: s1.length }, (_, i) => i),
    pointers: { left: 0, right: s1.length - 1 },
    message: `Count agreeing slots once: matches = ${matches}/26. From now on we never re-scan — each slide adjusts matches for just the 2 letters that change`,
    codeLine: 10,
    action: 'compare',
  });

  for (let right = s1.length; right < s2.length; right++) {
    if (matches === 26) {
      steps.push({
        state: { chars: [...chars], s1Count: toRecord(s1Arr), windowCount: toRecord(winArr), result: true },
        highlights: Array.from({ length: s1.length }, (_, i) => right - s1.length + i),
        pointers: { left: right - s1.length, right: right - 1 },
        message: `matches = 26 — every letter slot agrees. Permutation found: "${s2.slice(right - s1.length, right)}"`,
        codeLine: 14,
        action: 'found',
      });
      return steps;
    }

    let idx = s2.charCodeAt(right) - A;
    winArr[idx]++;
    if (winArr[idx] === s1Arr[idx]) matches++;
    else if (winArr[idx] === s1Arr[idx] + 1) matches--;

    steps.push({
      state: { chars: [...chars], s1Count: toRecord(s1Arr), windowCount: toRecord(winArr), result: false },
      highlights: Array.from({ length: s1.length }, (_, i) => right - s1.length + 1 + i),
      pointers: { left: right - s1.length + 1, right },
      message: `Add '${s2[right]}' at index ${right}: only slot '${s2[right]}' is re-checked. matches = ${matches}/26`,
      codeLine: 16,
      action: 'insert',
    });

    idx = s2.charCodeAt(right - s1.length) - A;
    winArr[idx]--;
    if (winArr[idx] === s1Arr[idx]) matches++;
    else if (winArr[idx] === s1Arr[idx] - 1) matches--;

    steps.push({
      state: { chars: [...chars], s1Count: toRecord(s1Arr), windowCount: toRecord(winArr), result: false },
      highlights: Array.from({ length: s1.length }, (_, i) => right - s1.length + 1 + i),
      pointers: { left: right - s1.length + 1, right },
      message: `Drop '${s2[right - s1.length]}' at index ${right - s1.length}: only that slot is re-checked. matches = ${matches}/26`,
      codeLine: 22,
      action: 'delete',
    });
  }

  const found = matches === 26;
  steps.push({
    state: { chars: [...chars], s1Count: toRecord(s1Arr), windowCount: toRecord(winArr), result: found },
    highlights: found
      ? Array.from({ length: s1.length }, (_, i) => s2.length - s1.length + i)
      : [],
    pointers: found ? { left: s2.length - s1.length, right: s2.length - 1 } : undefined,
    message: found
      ? `Final window "${s2.slice(s2.length - s1.length)}" has matches = 26 — permutation found!`
      : `Scanned all windows, matches never reached 26 — no permutation of "${s1}" in "${s2}"`,
    codeLine: 28,
    action: found ? 'found' : undefined,
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
  optimalApproachName: 'Sliding Window + Hash Map',
  approaches: [
    {
      id: 'match-counter-array',
      name: '26-Slot Match Counter',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description:
        'Replace the full map comparison on every slide with two fixed 26-slot arrays and a running "matches" counter — each slide only re-checks the 2 letter slots that changed, giving true O(1) updates.',
      code: {
        python: `def checkInclusion(s1, s2):
    if len(s1) > len(s2):
        return False
    s1_count = [0] * 26
    window = [0] * 26
    for i in range(len(s1)):
        s1_count[ord(s1[i]) - ord('a')] += 1
        window[ord(s2[i]) - ord('a')] += 1

    matches = sum(1 for i in range(26) if s1_count[i] == window[i])

    for right in range(len(s1), len(s2)):
        if matches == 26:
            return True
        idx = ord(s2[right]) - ord('a')
        window[idx] += 1
        if window[idx] == s1_count[idx]:
            matches += 1
        elif window[idx] == s1_count[idx] + 1:
            matches -= 1
        idx = ord(s2[right - len(s1)]) - ord('a')
        window[idx] -= 1
        if window[idx] == s1_count[idx]:
            matches += 1
        elif window[idx] == s1_count[idx] - 1:
            matches -= 1

    return matches == 26`,
        javascript: `function checkInclusion(s1, s2) {
    if (s1.length > s2.length) return false;
    const s1Count = new Array(26).fill(0);
    const window = new Array(26).fill(0);
    const a = 'a'.charCodeAt(0);
    for (let i = 0; i < s1.length; i++) {
        s1Count[s1.charCodeAt(i) - a]++;
        window[s2.charCodeAt(i) - a]++;
    }
    let matches = 0;
    for (let i = 0; i < 26; i++)
        if (s1Count[i] === window[i]) matches++;

    for (let right = s1.length; right < s2.length; right++) {
        if (matches === 26) return true;
        let idx = s2.charCodeAt(right) - a;
        window[idx]++;
        if (window[idx] === s1Count[idx]) matches++;
        else if (window[idx] === s1Count[idx] + 1) matches--;
        idx = s2.charCodeAt(right - s1.length) - a;
        window[idx]--;
        if (window[idx] === s1Count[idx]) matches++;
        else if (window[idx] === s1Count[idx] - 1) matches--;
    }

    return matches === 26;
}`,
        java: `public static boolean checkInclusion(String s1, String s2) {
    if (s1.length() > s2.length()) return false;
    int[] s1Count = new int[26];
    int[] window = new int[26];
    for (int i = 0; i < s1.length(); i++) {
        s1Count[s1.charAt(i) - 'a']++;
        window[s2.charAt(i) - 'a']++;
    }
    int matches = 0;
    for (int i = 0; i < 26; i++) {
        if (s1Count[i] == window[i]) matches++;
    }

    for (int right = s1.length(); right < s2.length(); right++) {
        if (matches == 26) return true;
        int idx = s2.charAt(right) - 'a';
        window[idx]++;
        if (window[idx] == s1Count[idx]) matches++;
        else if (window[idx] == s1Count[idx] + 1) matches--;
        idx = s2.charAt(right - s1.length()) - 'a';
        window[idx]--;
        if (window[idx] == s1Count[idx]) matches++;
        else if (window[idx] == s1Count[idx] - 1) matches--;
    }

    return matches == 26;
}`,
      },
      run: runPermutationMatchCounter,
      lineExplanations: {
        python: {
          1: 'Define function taking s1 and s2',
          2: 'If s1 is longer than s2, no permutation can fit',
          3: 'Return false immediately',
          4: 'Fixed 26-slot count array for s1 (one slot per letter)',
          5: 'Fixed 26-slot count array for the sliding window',
          6: 'Build both arrays over the first len(s1) positions',
          7: 'Count each s1 character in its letter slot',
          8: 'Count each initial-window character in its slot',
          10: 'One-time scan: how many of the 26 slots already agree?',
          12: 'Slide the fixed-size window across the rest of s2',
          13: 'All 26 slots agree for the previous window?',
          14: 'That window is a permutation — done',
          15: 'Slot of the character entering on the right',
          16: 'Add it to the window count',
          17: 'Its slot now agrees with s1',
          18: 'One more matching slot',
          19: 'Its slot JUST stopped agreeing (went one over)',
          20: 'One fewer matching slot',
          21: 'Slot of the character leaving on the left',
          22: 'Remove it from the window count',
          23: 'Its slot now agrees with s1',
          24: 'One more matching slot',
          25: 'Its slot JUST stopped agreeing (went one under)',
          26: 'One fewer matching slot',
          28: 'Check the final window too',
        },
        javascript: {
          1: 'Define function taking s1 and s2',
          2: 'If s1 is longer than s2, no permutation can fit',
          3: 'Fixed 26-slot count array for s1 (one slot per letter)',
          4: 'Fixed 26-slot count array for the sliding window',
          5: 'Char code of lowercase a, for letter-to-slot math',
          6: 'Build both arrays over the first s1.length positions',
          7: 'Count each s1 character in its letter slot',
          8: 'Count each initial-window character in its slot',
          10: 'Running counter of agreeing slots',
          11: 'One-time scan across all 26 slots',
          12: 'Slot agrees — count it',
          14: 'Slide the fixed-size window across the rest of s2',
          15: 'All 26 slots agree for the previous window? Permutation found',
          16: 'Slot of the character entering on the right',
          17: 'Add it to the window count',
          18: 'Slot now agrees — one more match',
          19: 'Slot just stopped agreeing (one over) — one fewer match',
          20: 'Slot of the character leaving on the left',
          21: 'Remove it from the window count',
          22: 'Slot now agrees — one more match',
          23: 'Slot just stopped agreeing (one under) — one fewer match',
          26: 'Check the final window too',
        },
        java: {
          1: 'Define function taking s1 and s2',
          2: 'If s1 is longer than s2, no permutation can fit',
          3: 'Fixed 26-slot count array for s1 (one slot per letter)',
          4: 'Fixed 26-slot count array for the sliding window',
          5: 'Build both arrays over the first s1.length() positions',
          6: 'Count each s1 character in its letter slot',
          7: 'Count each initial-window character in its slot',
          9: 'Running counter of agreeing slots',
          10: 'One-time scan across all 26 slots',
          11: 'Slot agrees — count it',
          14: 'Slide the fixed-size window across the rest of s2',
          15: 'All 26 slots agree for the previous window? Permutation found',
          16: 'Slot of the character entering on the right',
          17: 'Add it to the window count',
          18: 'Slot now agrees — one more match',
          19: 'Slot just stopped agreeing (one over) — one fewer match',
          20: 'Slot of the character leaving on the left',
          21: 'Remove it from the window count',
          22: 'Slot now agrees — one more match',
          23: 'Slot just stopped agreeing (one under) — one fewer match',
          26: 'Check the final window too',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Define function taking s1 and s2',
      2: 'If s1 longer than s2, no permutation exists',
      3: 'Return false immediately',
      4: 'Build frequency map for s1 characters',
      5: 'Iterate over each char in s1',
      6: 'Count occurrences of each char',
      7: 'Build frequency map for initial window in s2',
      8: 'Iterate over first len(s1) chars of s2',
      9: 'Count occurrences in initial window',
      11: 'Check if initial window matches s1 frequency',
      12: 'Return true if permutation found',
      14: 'Slide window across remaining chars of s2',
      15: 'Calculate left boundary of window',
      16: 'Remove outgoing left char from count',
      17: 'If count becomes zero',
      18: 'Remove key from map for clean comparison',
      19: 'Add incoming right char to window count',
      21: 'Check if current window matches s1 frequency',
      22: 'Return true if permutation found',
      24: 'No permutation found in s2',
    },
    javascript: {
      1: 'Define function taking s1 and s2',
      2: 'Return false if s1 is longer than s2',
      3: 'Build frequency map for s1 characters',
      4: 'Iterate over each char in s1',
      5: 'Count occurrences of each char',
      6: 'Build frequency map for initial window in s2',
      7: 'Iterate over first s1.length chars of s2',
      8: 'Count occurrences in initial window',
      10: 'Check if initial window matches s1 frequency',
      11: 'Return true if permutation found',
      13: 'Slide window across remaining chars of s2',
      14: 'Calculate left boundary of window',
      15: 'Remove outgoing left char from count',
      16: 'If count becomes zero',
      17: 'Delete key for clean JSON comparison',
      18: 'Add incoming right char to window count',
      20: 'Check if current window matches s1 frequency',
      21: 'Return true if permutation found',
      24: 'No permutation found in s2',
    },
    java: {
      1: 'Define function taking s1 and s2',
      2: 'Return false if s1 is longer than s2',
      3: 'Build frequency map for s1 characters',
      4: 'Iterate over each char in s1',
      5: 'Count occurrences of each char',
      7: 'Build frequency map for initial window in s2',
      8: 'Iterate over first s1.length() chars of s2',
      9: 'Get current char from s2',
      10: 'Count occurrences in initial window',
      13: 'Check if initial window matches s1 frequency',
      15: 'Slide window across remaining chars of s2',
      16: 'Calculate left boundary of window',
      17: 'Get outgoing left character',
      18: 'Decrement left char count',
      19: 'If count becomes zero',
      20: 'Remove key for clean map comparison',
      22: 'Get incoming right character',
      23: 'Add right char to window count',
      25: 'Check if current window matches s1 frequency',
      28: 'No permutation found in s2',
    },
  },
};
